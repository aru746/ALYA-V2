const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "latthi",
    version: "2.5.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "🤣 Kick someone with latthi power!",
    longDescription: "Mention 2 users (1 kicker + 1 kicked). Do not reply to a message!",
    category: "fun",
    guide: {
      en: "{pn} @kicker @kicked",
    },
  },

  onStart: async function ({ event, message, api }) {
    try {
      const mentionedIDs = Object.keys(event.mentions);
      const isReply = event.type === "message_reply";

      if (isReply) {
        return message.reply("❌ Don’t reply to any message. Just mention 2 users.");
      }

      if (mentionedIDs.length !== 2) {
        return message.reply("❌ Please mention exactly 2 users (1 kicker and 1 who gets kicked).");
      }

      const womanID = mentionedIDs[0]; // kicker
      const manID = mentionedIDs[1];   // kicked

      // 🛡️ Owner Protection
      const OWNER_UID = "100069254151118";
      if (manID === OWNER_UID || womanID === OWNER_UID) {
        return message.reply("🚫 You can’t use LATTHI on the owner! Respect the boss 😎");
      }

      const baseFolder = path.join(__dirname, "Arijit_latthi");
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder);

      const bgPath = path.join(baseFolder, "latthi_bg.jpg");
      const womanAvatarPath = path.join(baseFolder, `woman_${womanID}.png`);
      const manAvatarPath = path.join(baseFolder, `man_${manID}.png`);
      const outputPath = path.join(baseFolder, `latthi_result_${Date.now()}.png`);

      // 🖼️ Background image (download once)
      const bgURL = "https://files.catbox.moe/iabe3d.jpg";
      if (!fs.existsSync(bgPath)) {
        const res = await axios.get(bgURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, res.data);
      }

      // 🪳 Cockroach-based Avatar Fetch (safe, works like Graph)
      const getCockroachAvatar = async (uid, savePath) => {
        const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(savePath, res.data);
      };

      await getCockroachAvatar(womanID, womanAvatarPath);
      await getCockroachAvatar(manID, manAvatarPath);

      // 🧠 Compose Image
      const bg = await jimp.read(bgPath);
      const womanAvatar = await jimp.read(womanAvatarPath);
      const manAvatar = await jimp.read(manAvatarPath);

      womanAvatar.resize(110, 110).circle();
      manAvatar.resize(100, 100).circle();

      const womanX = 94, womanY = 14;
      const manX = 430, manY = 200;

      bg.composite(womanAvatar, womanX, womanY);
      bg.composite(manAvatar, manX, manY);

      await bg.writeAsync(outputPath);

      const userInfo = await api.getUserInfo([womanID, manID]);
      const womanName = userInfo[womanID]?.name || "Someone";
      const manName = userInfo[manID]?.name || "Someone";

      await message.reply({
        body: `🤣 ${womanName} gave a LATTHI to ${manName}! Full power 💥`,
        mentions: [
          { tag: womanName, id: womanID },
          { tag: manName, id: manID }
        ],
        attachment: fs.createReadStream(outputPath),
      });

      // 🧹 Cleanup temp files
      fs.unlinkSync(womanAvatarPath);
      fs.unlinkSync(manAvatarPath);
      fs.unlinkSync(outputPath);

    } catch (err) {
      console.error("❌ LATTHI CMD ERROR:", err);
      return message.reply("❌ Couldn't deliver the latthi! Try again later.");
    }
  },
};
