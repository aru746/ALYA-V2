const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

// 🔐 OWNER UID
const OWNER_ID = "61573866391878";

module.exports = {
  config: {
    name: "murgi",
    version: "1.0.3",
    author: "Arijit (Fixed)",
    countDown: 5,
    role: 0,
    shortDescription: "Turn someone into a chicken 🐔",
    longDescription: "Overlays user's avatar on a chicken body image",
    category: "fun",
    guide: {
      en: "{pn} reply to someone's message or mention them to turn into a murgi 🐔",
    },
  },

  onStart: async function ({ event, message, api }) {
    try {
      // Determine target
      let targetID = event.type === "message_reply"
        ? event.messageReply.senderID
        : Object.keys(event.mentions)[0];

      if (!targetID) return message.reply("🐔 Reply or mention someone to make them a murgi!");

      // 🛡️ Owner Protection
      if (targetID === OWNER_ID) {
        return message.reply("🚫 You deserve this, not my owner! 😙");
      }

      const baseFolder = path.join(__dirname, "cache");
      const bgPath = path.join(baseFolder, "murgi_bg.jpg");
      const outputPath = path.join(baseFolder, `murgi_result_${targetID}_${Date.now()}.png`);

      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder, { recursive: true });

      // Background chicken image download
      const chickenImageURL = "https://files.catbox.moe/ng1j7c.jpg";
      if (!fs.existsSync(bgPath)) {
        const res = await axios.get(chickenImageURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, Buffer.from(res.data));
      }

      const bg = await jimp.read(bgPath);

      // ✅ Working Graph API & Token
      const TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${TOKEN}`;

      const avatarData = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatar = await jimp.read(Buffer.from(avatarData.data));

      // Processing avatar
      avatar.resize(90, 90).circle();

      // 🧠 Chicken face position
      const x = 160;
      const y = 45;

      bg.composite(avatar, x, y);

      await bg.writeAsync(outputPath);

      // Get user info
      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Murgi";

      // Send result
      await message.reply({
        body: `😂 ${name} has turned into a murgi! 🐔`,
        mentions: [{ tag: name, id: targetID }],
        attachment: fs.createReadStream(outputPath),
      }, () => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error("🐔 Murgi command error:", err);
      return message.reply("❌ Failed to create murgi image.");
    }
  }
};
