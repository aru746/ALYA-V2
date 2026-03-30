const axios = require("axios");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "sing",
    version: "23.0",
    author: "Arafat",
    role: 0,
    description: { en: "🎵 Premium Music Downloader" },
    category: "music"
  },

  onStart: async ({ api, args, event }) => {

    if (!args.length)
      return api.sendMessage("🎵 Please type a song name.", event.threadID, event.messageID);

    const keyword = args.join(" ");

    try {

      let results = [];
      try {
        results = (await ytSearch(keyword)).videos.slice(0, 1);
      } catch {}

      if (!results.length) {
        const searchRes = await axios.get(
          `https://yt-search-ochre.vercel.app/api/search?q=${encodeURIComponent(keyword)}&limit=1`
        );

        if (searchRes.data.success && searchRes.data.results.length) {
          results = searchRes.data.results.slice(0, 1).map(v => ({
            title: v.title,
            url: v.url,
            timestamp: v.duration,
            author: { name: v.author }
          }));
        }
      }

      if (!results.length)
        return api.sendMessage("❌ No songs found.", event.threadID, event.messageID);

      const video = results[0];

      let videoId;
      if (video.url.includes("v="))
        videoId = video.url.split("v=")[1]?.split("&")[0];
      else
        videoId = video.url.split("/").pop();

      const shortUrl = `https://youtu.be/${videoId}`;

      const apiJson = await axios.get(
        "https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json"
      );

      const downloadBase = apiJson.data.download;

      const finalURL =
        `${downloadBase}/arafatadl?url=${encodeURIComponent(shortUrl)}`;

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const res = await axios({
        url: finalURL,
        method: "GET",
        responseType: "stream",
        timeout: 0
      });

      if (res.status !== 200)
        return api.sendMessage("❌ Download failed.", event.threadID, event.messageID);

      await api.sendMessage(
        {
          body:
`🎧 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑺𝒖𝒄𝒄𝒆𝒔𝒔`,
          attachment: res.data
        },
        event.threadID,
        () => api.setMessageReaction("🎀", event.messageID, () => {}, true),
        event.messageID
      );

    } catch (err) {
      console.log("SING ERROR:", err.message);
      api.sendMessage("❌ Failed to fetch audio.", event.threadID, event.messageID);
    }
  }
};
