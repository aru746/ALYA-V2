const axios = require("axios");

module.exports = {
  config: {
    name: "alya",
    aliases: ["alyachan", "alisa"],
    version: "1.0",
    author: "Arijit",
    countDown: 10,
    role: 0,
    shortDescription: "Send a random Alya Kujou video",
    longDescription: "Sends one random Alya Kujou video with a cute caption",
    category: "auto",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, api }) {
    try {
      // React with ⏳ when command starts
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

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

      const link = videos[Math.floor(Math.random() * videos.length)];

      await message.reply({
        body: ">🎀\n𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐀𝐥𝐢𝐬𝐚 𝐦𝐢𝐤𝐡𝐚𝐢𝐥𝐨𝐯𝐧𝐚 𝐯𝐢𝐝𝐞𝐨",
        attachment: await global.utils.getStreamFromURL(link)
      });

      // Change reaction to ✅ after sending video
      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      message.reply("❌ | Failed to send video. Please try again.");
      console.error(err);
    }
  }
};
