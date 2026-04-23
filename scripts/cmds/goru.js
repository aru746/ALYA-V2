const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

const OWNER_ID = "61573866391878"; // ✅ Your UID

module.exports = {
  config: {
    name: "goru",
    version: "2.0.1",
    author: "NAFIJ PRO (Fixed)",
    countDown: 5,
    role: 0,
    shortDescription: "Goru meme 🐮",
    longDescription: "Replaces cow face with a user's avatar",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone to turn them into a goru",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions || {})[0];
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) return message.reply("🐮 Tag or reply to someone to make them a goru!");

    // 🚫 Owner protection
    if (targetID === OWNER_ID) {
      return message.reply("🚫 You deserve this, not my owner! 😙");
    }

    const baseFolder = path.join(__dirname, "cache");
    const bgPath = path.join(baseFolder, "goru_bg.jpg");
    const outputPath = path.join(baseFolder, `goru_result_${targetID}_${Date.now()}.png`);

    try {
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder, { recursive: true });

      // ✅ Download cow background if missing
      if (!fs.existsSync(bgPath)) {
        const url = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/goru.jpg";
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, Buffer.from(res.data));
      }

      // ✅ Process Background
      const bg = await jimp.read(bgPath);
      
      // ✅ Using working Graph API & Token
      const TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${TOKEN}`;

      const avatarData = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatar = await jimp.read(Buffer.from(avatarData.data));

      // Goru face-er jonno avatar processing
      avatar.resize(160, 160).circle();

      // 🧠 Place avatar over cow's face
      const x = 280;
      const y = 90;
      bg.composite(avatar, x, y);

      await bg.writeAsync(outputPath);

      // Get user info
      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Goru";

      await message.reply(
        {
          body: `🤣 ${name} is now a goru reading the newspaper! 🐄🗞`,
          mentions: [{ tag: name, id: targetID }],
          attachment: fs.createReadStream(outputPath),
        },
        () => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
      );

    } catch (err) {
      console.error("🐮 Goru command error:", err);
      return message.reply("❌ Goru process korte error hoyeche.");
    }
  }
};
