const axios = require("axios");

module.exports = {
  config: {
    name: "shazam",
    aliases: ["finds"],
    version: "3.2.0",
    author: "Arafat",
    countDown: 5,
    role: 0,
    description: "Identify any song and extract metadata with OMNI-X core.",
    category: "media",
    guide: "{pn} [reply to audio/video]"
  },

  onStart: async function ({ api, event, message, commandName }) {
    const { threadID, messageID, messageReply } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("⚠️ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗋𝖾𝗉𝗅𝗊 𝗍𝗈 𝖺𝗇 𝖺𝗎𝖽𝗂𝗈 𝗈𝗋 𝗏𝗂𝖽𝖾𝗈 𝖿𝗂𝗅𝖾.");
    }

    const attachment = messageReply.attachments[0];
    if (!["audio", "video"].includes(attachment.type)) {
      return message.reply("❌ 𝖮𝗇𝗅𝗒 𝖺𝗎𝖽𝗂𝗈 𝖺𝗇𝖽 𝗏𝗂𝖽𝖾𝗈 𝖺𝗋𝖾 𝗌𝗎𝗉𝗉𝗈𝗋𝗍𝖾𝖽.");
    }

    try {
      const configRes = await axios.get("https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json");
      const { shazam: shazamApiBase, download: downloadBase } = configRes.data;

      const response = await axios.post(`${shazamApiBase}/arafat`, {
        url: attachment.url
      });

      const data = response.data;

      if (data.status) {
        const info = data.result;
        
        api.setMessageReaction("✨", messageID, () => {}, true);
        api.setMessageReaction("🌊", messageID, () => {}, true);

        const msg = `❍ 𝖳𝗂𝗍𝗅𝖾: ${info.title}\n` +
                    `❍ 𝖠𝗋𝗍𝗂𝗌𝗍: ${info.artist}\n` +
                    `❍ 𝖠𝗅𝖻𝗎𝗆: ${info.album}\n` +
                    `❍ 𝖦𝖾𝗇𝗋𝖾: ${info.genre}\n` +
                    `❍ 𝖱𝖾𝗅𝖾𝖺𝗌𝖾: ${info.release}\n\n` +
                    `✰ 𝖱𝖾𝗉𝗅𝗒 "𝗌𝖾𝗇𝖽" 𝗍𝗈 𝗀𝖾𝗍 𝖺𝗎𝖽𝗂𝗈`;

        return api.sendMessage({
          body: msg,
          attachment: await global.utils.getStreamFromURL(info.image)
        }, threadID, (err, sendInfo) => {
          global.GoatBot.onReply.set(sendInfo.messageID, {
            commandName,
            messageID: sendInfo.messageID,
            author: event.senderID,
            ytUrl: info.youtube_url,
            downloadBase
          });
        }, messageID);

      } else {
        return message.reply("❌ 𝖬𝖾𝗍𝖺𝖽𝖺𝗍𝖺 𝗇𝗈𝗍 𝖿𝗈𝗎𝗇𝖽.");
      }
    } catch (error) {
      return message.reply("❗ 𝖲𝗊𝗌𝗍𝖾𝗆 𝖫𝗂𝗇𝗄 𝖥𝖺𝗂𝗅𝗎𝗋𝖾.");
    }
  },

  onReply: async ({ event, api, Reply, message }) => {
    const { author, ytUrl, downloadBase } = Reply;
    if (event.senderID !== author) return;

    if (event.body.toLowerCase() === "send") {
      try {
        api.setMessageReaction("✨", event.messageID, () => {}, true);
        api.setMessageReaction("🌊", event.messageID, () => {}, true);
        
        const finalURL = `${downloadBase}/arafatadl?url=${encodeURIComponent(ytUrl)}`;
        
        const res = await axios({
          url: finalURL,
          method: "GET",
          responseType: "stream",
          timeout: 0
        });

        if (res.status !== 200) return message.reply("❌ 𝖤𝗑𝗍𝗋𝖺𝖼𝗍𝗂𝗈𝗇 𝖥𝖺𝗂𝗅𝖾𝖽.");

        return api.sendMessage({
          attachment: res.data
        }, event.threadID, () => {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        }, event.messageID);

      } catch (err) {
        return message.reply("❌ 𝖢𝗈𝗋𝖾 𝖽𝗈𝗐𝗇𝗅𝗈𝖺𝖽 𝖾𝗋𝗋𝗈𝗋.");
      }
    }
  }
};
