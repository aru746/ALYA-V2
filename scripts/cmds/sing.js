axios = require("axios");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "sing",
    version: "22.0",
    author: "Arafat",
    role: 0,
    description: { en: "🎵 Premium Music Downloader" },
    category: "music"
  },

  onStart: async ({ api, args, event, commandName, usersData }) => {

    const COST = 5000;
    const userID = event.senderID;
    const userData = await usersData.get(userID);
    const balance = userData.money || 0;

    if (balance < COST) {
      return api.sendMessage(
`╭───────────────❍
│ ❌ 𝑩𝒂𝒍𝒂𝒏𝒄𝒆 𝑳𝒐𝒘
├───────────────❍
│ 💰 Required: 5,000
│ 💳 Your Balance: ${balance}
╰───────────────❍`,
        event.threadID,
        event.messageID
      );
    }

    if (!args.length)
      return api.sendMessage("🎵 Please type a song name.", event.threadID, event.messageID);

    const isList = args[0] === "-l";
    const keyword = isList ? args.slice(1).join(" ") : args.join(" ");

    if (!keyword)
      return api.sendMessage("🎵 Please type a song name.", event.threadID, event.messageID);

    try {

      let results = [];
      try {
        results = (await ytSearch(keyword)).videos.slice(0, 6);
      } catch {}

      if (!results.length) {
        const searchRes = await axios.get(
          `https://yt-search-ochre.vercel.app/api/search?q=${encodeURIComponent(keyword)}&limit=6`
        );

        if (searchRes.data.success && searchRes.data.results.length) {
          results = searchRes.data.results.slice(0, 6).map(v => ({
            title: v.title,
            url: v.url,
            timestamp: v.duration,
            author: { name: v.author }
          }));
        }
      }

      if (!results.length)
        return api.sendMessage("❌ No songs found.", event.threadID, event.messageID);

      if (isList) {

        let text = "╭───────────────❍\n";
        text += "│   🎵 𝑺𝒐𝒏𝒈 𝑳𝒊𝒔𝒕\n";
        text += "╰───────────────❍\n\n";

        for (let i = 0; i < results.length; i++) {
          const v = results[i];
          text += `╭─❍\n`;
          text += `┊  ${i + 1}. ${v.title}\n`;
          text += `┊  ⏳ ${v.timestamp || "Unknown"}\n`;
          text += `┊  📺 ${v.author.name}\n`;
          text += `╰───────────────❍\n\n`;
        }

        text += "╭───────────────❍\n";
        text += "│   🔢 Reply with number (1–6)\n";
        text += "╰───────────────❍";

        return api.sendMessage(
          { body: text },
          event.threadID,
          (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              results
            });
          },
          event.messageID
        );
      }

      await usersData.set(userID, { money: balance - COST });

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

      api.setMessageReaction("🌷", event.messageID, () => {}, true);

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
`╭───────────────❍
│ 🎧 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑺𝒖𝒄𝒄𝒆𝒔𝒔
├───────────────❍
│ 🎵 ${video.title}
╰───────────────❍`,
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
  },

  onReply: async ({ event, api, Reply, usersData }) => {
    try {
      const { results, author } = Reply;
      if (event.senderID !== author) return;

      const choice = parseInt(event.body);
      if (isNaN(choice) || choice < 1 || choice > results.length)
        return api.sendMessage("❌ Enter valid number (1–6).", event.threadID, event.messageID);

      const COST = 5000;
      const userID = event.senderID;
      const userData = await usersData.get(userID);
      const balance = userData.money || 0;

      if (balance < COST)
        return api.sendMessage("❌ Balance Low", event.threadID, event.messageID);

      await usersData.set(userID, { money: balance - COST });

      const video = results[choice - 1];

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

      api.setMessageReaction("🌷", event.messageID, () => {}, true);

      const res = await axios({
        url: finalURL,
        method: "GET",
        responseType: "stream",
        timeout: 0
      });

      if (res.status !== 200)
        return api.sendMessage("❌ Download failed.", event.threadID, event.messageID);

      await api.unsendMessage(Reply.messageID);

      await api.sendMessage(
        {
          body:
`╭───────────────❍
│ 🎧 𝑫𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝑺𝒖𝒄𝒄𝒆𝒔𝒔
├───────────────❍
│ 🎵 ${video.title}
╰───────────────❍`,
          attachment: res.data
        },
        event.threadID,
        () => api.setMessageReaction("🎀", event.messageID, () => {}, true),
        event.messageID
      );

    } catch (err) {
      console.log("REPLY ERROR:", err.message);
      api.sendMessage("❌ Download failed.", event.threadID, event.messageID);
    }
  }
};
