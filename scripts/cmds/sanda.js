const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "sanda",
    version: "1.0.6",
    author: "NAFIJ PRO",
    countDown: 5,
    role: 0,
    shortDescription: "Expose someone as a sanda!",
    longDescription: "Puts the tagged/replied user's face on a sanda's body (fun meme)",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to sanda someone",
    },
  },

  onStart: async function ({ event, message, api }) {
    const OWNER_ID = "61573866391878"; // 👑 Your UID (Arijit)

    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply" && event.messageReply?.senderID) {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("❗ Tag or reply to someone to turn them into a sanda!");
    }

    if (targetID === event.senderID) {
      return message.reply("❗ Bro, why would you sanda yourself?");
    }

    // ✅ Owner protection with custom message
    if (targetID === OWNER_ID) {
      return message.reply("🚫 You deserve this, not my owner! 😙");
    }

    const baseFolder = path.join(__dirname, "NAFIJ");
    const bgPath = path.join(baseFolder, "sanda.jpg");
    const avatarPath = path.join(baseFolder, `avatar_${targetID}.png`);
    const outputPath = path.join(baseFolder, `sanda_result_${targetID}.png`);

    try {
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      if (!fs.existsSync(bgPath)) {
        const imgUrl = "https://raw.githubusercontent.com/alkama844/res/main/image/sanda.jpg";
        const res = await axios.get(imgUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, res.data);
      }

      const avatarBuffer = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;

      await fs.writeFile(avatarPath, avatarBuffer);

      const avatarImg = await jimp.read(avatarPath);
      avatarImg.circle().resize(130, 130);

      const bg = await jimp.read(bgPath);
      bg.resize(600, 800);

      const xCenter = (bg.getWidth() - avatarImg.getWidth()) / 2;
      const yTop = 60;
      bg.composite(avatarImg, xCenter, yTop);

      const finalBuffer = await bg.getBufferAsync("image/png");
      fs.writeFileSync(outputPath, finalBuffer);

      const userInfo = await api.getUserInfo(targetID);
      const tagName = userInfo[targetID]?.name || "Someone";

      await message.reply(
        {
          body: `🤣😹\n${tagName} এখন একদম আসল সান্দা হইছে!\n🦥✨`,
          mentions: [{ tag: tagName, id: targetID }],
          attachment: fs.createReadStream(outputPath),
        },
        () => {
          fs.unlinkSync(avatarPath);
          fs.unlinkSync(outputPath);
        }
      );
    } catch (err) {
      console.error("Sanda Command Error:", err);
      message.reply("❌ সমস্যা হইসে ভাই। আবার চেষ্টা কর।");
    }
  },
};
