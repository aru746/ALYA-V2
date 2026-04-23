const axios = require("axios");
const jimp = require("jimp");
const path = require("path");
const fs = require("fs-extra");

// 🔐 OWNER UID (Cannot be targeted)
const OWNER_UID = "61573866391878";

module.exports = {
  config: {
    name: "cagol",
    version: "1.0.3",
    author: "NAFIJ PRO + Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Cagol meme 🐐",
    longDescription: "Replaces goat face with a user's avatar",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone to turn them into a cagol",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("🐐 Tag or reply to someone to make them a cagol!");
    }

    // 🔒 OWNER PROTECTION
    if (targetID === OWNER_UID) {
      return message.reply("👑 | Owner ke cagol banano jabe na 😎");
    }

    const baseFolder = path.join(__dirname, "cache");
    const bgPath = path.join(baseFolder, "cagol_bg.jpeg");
    const outputPath = path.join(baseFolder, `cagol_result_${targetID}_${Date.now()}.png`);

    try {
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder, { recursive: true });

      // ✅ Download template if missing
      const goatImageURL = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/cagol.jpeg";
      if (!fs.existsSync(bgPath)) {
        const res = await axios.get(goatImageURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, Buffer.from(res.data));
      }

      const bg = await jimp.read(bgPath);

      // ✅ Working Graph API & Token
      const TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${TOKEN}`;

      const avatarData = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatar = await jimp.read(Buffer.from(avatarData.data));

      // Resize and round
      avatar.resize(100, 100).circle();

      // 🧠 Composite
      const x = 170;
      const y = 80;
      bg.composite(avatar, x, y);

      await bg.writeAsync(outputPath);

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo[targetID]?.name || "Someone";

      await message.reply({
        body: `🤣 ${name} is now a cagol! 🐐`,
        mentions: [{ tag: name, id: targetID }],
        attachment: fs.createReadStream(outputPath),
      }, () => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error("🐐 Cagol command error:", err);
      return message.reply("❌ Error while turning into cagol.");
    }
  }
};
