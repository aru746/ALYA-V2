const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "kutta",
    version: "1.0.2",
    author: "NAFIJ PRO",
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
      const OWNER_UID = "61573866391878";
      if (targetID === OWNER_UID) {
        return message.reply("🚫 You can’t make the owner a kutta! Respect the boss 😎");
      }

      const baseFolder = path.join(__dirname, "NAFIJ");
      const bgPath = path.join(baseFolder, "kutta_bg.jpg");
      const avatarPath = path.join(baseFolder, `avatar_${targetID}.png`);
      const outputPath = path.join(baseFolder, `kutta_result_${targetID}.png`);

      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      // 🐶 Auto-download kutta template if not found
      if (!fs.existsSync(bgPath)) {
        const kuttaURL = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/kutta.jpeg";
        const kuttaImg = await axios.get(kuttaURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, kuttaImg.data);
      }

      // Download user's avatar
      const avatarBuffer = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      await fs.writeFile(avatarPath, avatarBuffer);

      const avatarImg = await jimp.read(avatarPath);
      avatarImg.resize(130, 130); // Adjust to fit dog's face

      const bg = await jimp.read(bgPath);
      bg.resize(619, 495); // Resize to standard (your image size)

      // 🧠 Position avatar over white dog's face
      const x = 360;
      const y = 300;
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
          fs.unlinkSync(avatarPath);
          fs.unlinkSync(outputPath);
        }
      );
    } catch (err) {
      console.error("❌ Kutta command error:", err);
      message.reply("❌ Error occurred while kutta-fying.");
    }
  },
};
