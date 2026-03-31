const axios = require("axios");

module.exports = {
  config: {
    name: "alya",
    aliases: ["alyachan", "alisa"],
    version: "2.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Send a random Alya Kujou video",
    longDescription: "Sends one random Alya Kujou video with a cute caption",
    category: "anime",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, api }) {
    const { messageID } = event;

    // List of working Catbox links
    const videos = [
      "https://files.catbox.moe/oa761p.mp4",
      "https://files.catbox.moe/j16ln7.mp4",
      "https://files.catbox.moe/rzc858.mp4", 
      "https://files.catbox.moe/b0n4vy.mp4",
      "https://files.catbox.moe/e3qtny.mp4",
      "https://files.catbox.moe/ymu0i8.mp4",
      "https://files.catbox.moe/wjk195.mp4",
      "https://files.catbox.moe/uporic.mp4",
      "https://files.catbox.moe/5nz7u5.mp4",
      "https://files.catbox.moe/88p6v0.mp4",
      "https://files.catbox.moe/xa9pve.mp4",
      "https://files.catbox.moe/zh2y51.mp4",
      "https://files.catbox.moe/rba8lv.mp4",
      "https://files.catbox.moe/sh7mhs.mp4"
    ];

    try {
      // Reaction: ⏳
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const videoUrl = videos[Math.floor(Math.random() * videos.length)];

      // Main Logic: Fetching using Axios with a timeout and headers
      const response = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
        timeout: 20000, // 20 seconds timeout
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      await message.reply({
        body: "🎀 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐀𝐥𝐢𝐬𝐚 𝐌𝐢𝐤𝐡𝐚𝐢𝐥𝐨𝐯𝐧𝐚 𝐯𝐢𝐝𝐞𝐨!",
        attachment: response.data
      });

      // Reaction: ✅
      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      console.error("DEBUG ERROR:", err.message);

      // Final Attempt: Using global utils if Axios stream fails
      try {
        const fallbackUrl = videos[0];
        const stream = await global.utils.getStreamFromURL(fallbackUrl);
        await message.reply({
          body: "✨ 𝐀𝐥𝐲𝐚-𝐜𝐡𝐚𝐧 𝐢𝐬 𝐡𝐞𝐫𝐞! (Backup Mode)",
          attachment: stream
        });
        api.setMessageReaction("✅", messageID, () => {}, true);
      } catch (finalErr) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        message.reply("❌ | Error: Video file ti pathano jachche na. Hoyto VPS IP block ba storage full.");
      }
    }
  }
};
