const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

const OWNER_ID = "61573866391878"; // ✅ Your UID

module.exports = {
  config: {
    name: "kutta",
    version: "1.0.5",
    author: "NAFIJ PRO (Fixed)",
    countDown: 5,
    role: 0,
    shortDescription: "Make someone a kutta 😂",
    longDescription: "Replaces the white dog's head with a user's avatar",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to kutta someone",
    },
  },

  onStart: async function ({ event, message, api }) {
    try {
      let targetID = Object.keys(event.mentions)[0];
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      }

      if (!targetID) {
        return message.reply("🐶 Tag or reply to someone to turn them into a kutta!");
      }

      if (targetID === event.senderID) {
        return message.reply("🐶 You can't kutta yourself, bro 💀");
      }

      // 🛡️ Owner Protection
      if (targetID === OWNER_ID) {
        return message.reply("🚫 You can’t make the owner a kutta! Respect the boss 😎");
      }

      const baseFolder = path.join(__dirname, "cache");
      const bgPath = path.join(baseFolder, "kutta_bg.jpg");
      const outputPath = path.join(baseFolder, `kutta_result_${targetID}_${Date.now()}.png`);

      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder, { recursive: true });

      // 🐶 Auto-download kutta template if not found
      if (!fs.existsSync(bgPath)) {
        const kuttaURL = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/kutta.jpeg";
        const kuttaImg = await axios.get(kuttaURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, Buffer.from(kuttaImg.data));
      }

      const bg = await jimp.read(bgPath);
      bg.resize(619, 495);

      // ✅ Working Token & API
      const TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=${TOKEN}`;

      const avatarData = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatarImg = await jimp.read(Buffer.from(avatarData.data));

      // Image-ke round shape kora ebong resize kora
      avatarImg.resize(140, 140).circle(); 

      // 🧠 Position avatar over white dog's face
      const x = 355; 
      const y = 305; 
      bg.composite(avatarImg, x, y);

      await bg.writeAsync(outputPath);

      const userInfo = await api.getUserInfo(targetID);
      const tagName = userInfo[targetID]?.name || "Someone";

      await message.reply(
        {
          body: `🤣🐶 ${tagName} is now a certified kutta!`,
          mentions: [{ tag: tagName, id: targetID }],
          attachment: fs.createReadStream(outputPath),
        },
        () => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
      );
    } catch (err) {
      console.error("❌ Kutta command error:", err);
      message.reply("❌ Error occurred while processing image.");
    }
  },
};
