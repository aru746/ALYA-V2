const axios = require("axios");

module.exports = {
  config: {
    name: "alya",
    aliases: ["alyachan", "alisa"],
    version: "1.2",
    author: "Arijit",
    countDown: 10,
    role: 0,
    shortDescription: "Send a random Alya Kujou video",
    longDescription: "Sends one random Alya Kujou video with a cute caption",
    category: "anime",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, api }) {
    const { messageID, threadID } = event;

    try {
      // Step 1: Loading reaction
      api.setMessageReaction("⏳", messageID, () => {}, true);

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

      // Randomly link select kora
      const link = videos[Math.floor(Math.random() * videos.length)];

      // Step 2: Stream fetch kora (Direct Axios use kore jate failure rate 0 hoy)
      const response = await axios.get(link, { responseType: 'stream' });

      // Step 3: Message send
      await message.reply({
        body: "🎀 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐀𝐥𝐢𝐬𝐚 𝐌𝐢𝐤𝐡𝐚𝐢𝐥𝐨𝐯𝐧𝐚 𝐯𝐢𝐝𝐞𝐨!",
        attachment: response.data
      });

      // Step 4: Success reaction
      api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (err) {
      console.error("ALYA CMD ERROR:", err);
      
      // Error message
      message.reply("❌ | Video send korte somossya hocche. Hoyto link block ba server down.");
      api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};
