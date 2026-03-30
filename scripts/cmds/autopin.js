const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "autopin",
    version: "3.5",
    author: "Arafat",
    role: 0,
    countDown: 0,
    category: "auto",
    shortDescription: "𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐀𝐮𝐭𝐨 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫",
    longDescription: "𝐀𝐮𝐭𝐨 𝐃𝐞𝐭𝐞𝐜𝐭 𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐋𝐢𝐧𝐤 → 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐏𝐡𝐨𝐭𝐨/𝐕𝐢𝐝𝐞𝐨",
  },

  onStart: async function ({ message }) {
    message.reply("𝐀𝐜𝐭𝐢𝐯𝐚𝐭𝐞𝐝 ✔");
  },

  onChat: async function ({ event, message }) {
    const text = event.body || "";
    if (!text) return;

    const regex = /(https?:\/\/(www\.)?(pin\.it|pinterest\.com)\/[^\s]+)/i;
    const link = text.match(regex)?.[0];
    if (!link) return;

    const tmp = await message.reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐖𝐚𝐢𝐭 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐢𝐧𝐠…...!!");

    try {
      // 🔁 NEW API
      const apiURL = `https://pinterest-indol.vercel.app/api/download?url=${encodeURIComponent(link)}`;
      const result = await axios.get(apiURL).then(res => res.data);

      if (!result.success || !result.data?.medias?.length) {
        await message.unsend(tmp.messageID);
        return message.reply("❌ 𝐔𝐧𝐚𝐛𝐥𝐞 𝐓𝐨 𝐅𝐞𝐭𝐜𝐡 𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐌𝐞𝐝𝐢𝐚");
      }

      const media = result.data.medias[0];
      const mediaURL = media.url;

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const ext = media.extension === "mp4" ? ".mp4" : ".jpg";
      const filePath = path.join(cacheDir, `pin_${Date.now()}${ext}`);

      const file = await axios.get(mediaURL, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, file.data);

      await message.unsend(tmp.messageID);

      const caption = ext === ".mp4"
        ? "🎬 𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐕𝐢𝐝𝐞𝐨"
        : "🖼 𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐏𝐡𝐨𝐭𝐨";

      await message.reply({
        body: caption,
        attachment: fs.createReadStream(filePath)
      });

      fs.unlinkSync(filePath);

    } catch (err) {
      await message.unsend(tmp.messageID);
      message.reply("𝐄𝐫𝐫𝐨𝐫: " + err.message);
    }
  }
};
