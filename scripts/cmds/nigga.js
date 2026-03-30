const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 👉 Add your owner UID(s) here
const OWNER_UIDS = ["61573866391878"]; 

module.exports = {
  config: {
    name: "nigga",
    aliases: ["roast", "burn"],
    version: "1.4",
    author: "nexo_here",
    countDown: 2,
    role: 0,
    category: "fun",
    description: "Send a roast image using UID",
    guide: {
      en: "{pn} @mention\nReply to roast someone.\nUse without mention to roast yourself."
    }
  },

  onStart: async function ({ api, event }) {
    try {

      let targetUID;

      // 🎯 1. Reply to someone
      if (event.type === "message_reply") {
        targetUID = event.messageReply.senderID;

      // 🎯 2. Mention someone
      } else if (Object.keys(event.mentions || {}).length > 0) {
        targetUID = Object.keys(event.mentions)[0];

      // 🎯 3. Roast yourself
      } else {
        targetUID = event.senderID;
      }

      // 🔐 Owner cannot be roasted
      if (OWNER_UIDS.includes(targetUID) && targetUID !== event.senderID) {
        return api.sendMessage(
          "❌ | Sorry, you can't roast the owner 😎",
          event.threadID,
          event.messageID
        );
      }

      const url = `https://betadash-api-swordslush-production.up.railway.app/nigga?userid=${targetUID}`;
      const response = await axios.get(url, { responseType: "arraybuffer" });

      const filePath = path.join(__dirname, "cache", `roast_${targetUID}.jpg`);
      fs.writeFileSync(filePath, response.data);

      api.sendMessage(
        {
          body: `Look I found a nigga 😂`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (err) {
      console.error("Error:", err);
      api.sendMessage(
        "❌ Error while generating roast image.",
        event.threadID,
        event.messageID
      );
    }
  }
};
