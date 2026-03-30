const axios = require("axios");

module.exports = {
  config: {
    name: "srp",
    version: "1.0",
    author: "𝐀𝐫𝐚𝐟𝐚𝐭",
    category: "utility",
    role: 2,
    guide: {
      en: "𝐔𝐬𝐞: !srp 🙂 => word1,word2"
    }
  },

  onStart: async function ({ message, args }) {
    if (args.length < 3 || args[1] !== "=>") {
      return message.reply("❌ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐅𝐨𝐫𝐦𝐚𝐭. 𝐔𝐬𝐞: !srp 🙂 => word1,word2");
    }

    const emoji = args[0];
    const triggers = args
      .slice(2)
      .join(" ")
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const API = "https://mongodb-api-psi.vercel.app/aru-srp";

    try {
      // Save new triggers to remote DB
      for (const trigger of triggers) {
        await axios.post(API, { emoji, trigger });
      }

      // Save latest mapping locally (ignore old)
      if (!global.latestSrp) global.latestSrp = {};
      for (const trigger of triggers) {
        global.latestSrp[trigger] = emoji;
      }

      message.reply(`✅ | 𝐆𝐥𝐨𝐛𝐚𝐥 𝐓𝐫𝐢𝐠𝐠𝐞𝐫𝐬 𝐒𝐚𝐯𝐞𝐝 𝐟𝐨𝐫 ${emoji}: ${triggers.join(", ")}`);
    } catch (err) {
      console.error(err);
      message.reply("❌ | 𝐄𝐫𝐫𝐨𝐫 𝐒𝐚𝐯𝐢𝐧𝐠 𝐓𝐫𝐢𝐠𝐠𝐞𝐫𝐬 𝐭𝐨 𝐃𝐚𝐭𝐚𝐛𝐚𝐬𝐞.");
    }
  },

  onChat: async function ({ event, api }) {
    if (!event.body) return;

    const msg = event.body.toLowerCase();

    if (!global.latestSrp) return;

    for (const trigger in global.latestSrp) {
      if (msg.includes(trigger)) {
        const emoji = global.latestSrp[trigger];
        api.setMessageReaction(emoji, event.messageID, () => {}, true);
        break;
      }
    }
  }
};
