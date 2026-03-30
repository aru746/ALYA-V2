const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { getStreamFromURL } = global.utils;

const API = "https://customers-performances-beings-justify.trycloudflare.com";

module.exports = {
  config: {
    name: "ytb",
    version: "6.0.0",
    author: "Aru",
    role: 0,
    category: "video",
    countDown: 3,
    guide: { en: "{pn} [-v] <song name | youtube link>" }
  },

  onStart: async function ({ args, message, event, commandName }) {

    let isVideo = /^-v/i.test(args[0]);
    let query = args.join(" ").replace(/^-v\s*/i, "").trim();

    if (!query) return message.reply("🎵 Enter a song name");

    if (query.startsWith("http"))
      return sendMedia(query, message, isVideo);

    const searching = await message.reply("🔎 Searching YouTube...");

    try {

      const results = await searchYT(query);

      if (!results.length) {
        message.unsend(searching.messageID);
        return message.reply("❌ No results found");
      }

      let body = `🎧 𝗬𝗧𝗕 𝗦𝗘𝗔𝗥𝗖𝗛 (${isVideo ? "Video" : "Audio"})\n\n`;
      const thumbs = [];

      results.slice(0, 6).forEach((v, i) => {
        body += `╭─❍
┊  ${i + 1}. ${short(v.title)}
╰───────────\n\n`;
        thumbs.push(getStreamFromURL(v.thumbnail));
      });

      body += "Reply with number (1-6)";

      message.reply({
        body,
        attachment: await Promise.all(thumbs)
      }, (err, info) => {

        message.unsend(searching.messageID);
        if (!info) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          author: event.senderID,
          results,
          isVideo
        });
      });

    } catch {
      message.unsend(searching.messageID);
      message.reply("❌ Search failed");
    }
  },

  onReply: async function ({ event, Reply, message }) {

    if (!Reply || event.senderID != Reply.author) return;

    const n = parseInt(event.body);
    if (isNaN(n) || n < 1 || n > Reply.results.length) return;

    const video = Reply.results[n - 1];
    const url = `https://youtube.com/watch?v=${video.id}`;

    await sendMedia(url, message, Reply.isVideo);
  }
};

function short(t,n=60){return t.length>n?t.slice(0,n)+"…":t;}

async function sendMedia(url, message, isVideo) {

  const loading = await message.reply(isVideo ? "⏳ Fetching video..." : "⏳ Fetching audio...");

  try {

    const type = isVideo ? "video" : "audio";
    const ext = isVideo ? "mp4" : "m4a";

    const apiURL = `${API}/download?url=${encodeURIComponent(url)}&type=${type}`;
    const filePath = path.join(__dirname, "cache", `${Date.now()}.${ext}`);

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

    const res = await axios({
      method: "GET",
      url: apiURL,
      responseType: "stream",
      timeout: 0
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      res.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await message.reply({
      body: isVideo ? "🎬 Here is your video" : "🎶 Playing your song",
      attachment: fs.createReadStream(filePath)
    });

    fs.unlink(filePath, () => {});
    message.unsend(loading.messageID);

  } catch {
    message.unsend(loading.messageID);
    message.reply("❌ Failed to fetch media");
  }
}

async function searchYT(query) {

  const { data } = await axios.get(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  );

  const raw = data.split("var ytInitialData = ")[1]?.split(";</script>")[0];
  if (!raw) return [];

  const json = JSON.parse(raw);
  const videos = [];

  function findVideos(obj) {
    if (!obj || typeof obj !== "object") return;

    if (obj.videoRenderer && obj.videoRenderer.videoId) {
      const v = obj.videoRenderer;

      videos.push({
        id: v.videoId,
        title: v.title?.runs?.[0]?.text || "Unknown",
        thumbnail: v.thumbnail?.thumbnails?.pop()?.url,
        time: v.lengthText?.simpleText || "Live",
        channel: v.ownerText?.runs?.[0]?.text || "Unknown"
      });
    }

    for (const key in obj) findVideos(obj[key]);
  }

  findVideos(json);

  return videos.slice(0, 10);
}
