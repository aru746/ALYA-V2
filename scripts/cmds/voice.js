const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "voice",
    aliases: ["vm"], 
    version: "3.6",
    author: "𝐀𝐫𝐚𝐟𝐚𝐭",
    countDown: 5,
    role: 0,
    shortDescription: "🎙️ 𝙰𝚍𝚟𝚊𝚗𝚌𝚎𝚍 𝚅𝚘𝚒𝚌𝚎 𝚂𝚢𝚜𝚝𝚎𝚖",
    longDescription: "𝙰𝚍𝚍, 𝙻𝚒𝚜𝚝 & 𝙿𝚕𝚊𝚢 𝚌𝚞𝚜𝚝𝚘𝚖 𝚟𝚘𝚒𝚌𝚎𝚜 𝚠𝚒𝚝𝚑 𝚎𝚕𝚎𝚐𝚊𝚗𝚝 𝚍𝚎𝚜𝚒𝚐𝚗.",
    category: "fun",
    guide: {
      en: "🎧{pn} 𝚊𝚍𝚍 <𝚗𝚊𝚖𝚎> → 𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊𝚞𝚍𝚒𝚘 (𝙰𝚍𝚖𝚒𝚗 𝙾𝚗𝚕𝚢)\n📜 {pn} 𝚕𝚒𝚜𝚝 → 𝚂𝚑𝚘𝚠 𝚅𝚘𝚒𝚌𝚎 𝙻𝚒𝚜𝚝\n▶️ {pn} <𝚗𝚊𝚖𝚎> → 𝙿𝚕𝚊𝚢 𝚊 𝚅𝚘𝚒𝚌𝚎"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { senderID, threadID, messageReply } = event;
    const option = args[0]?.toLowerCase();

    const mongoAPI = "https://mongodb-api-psi.vercel.app/voice-aru";
    const driveAPI = "https://arafat-drive-api.vercel.app/drive";
    const ADMIN_ID = "61573866391878";

    const getAllVoices = async () => {
      const res = await axios.get(mongoAPI);
      return res.data?.data || [];
    };

    if (option === "add") {
      if (senderID !== ADMIN_ID) return message.reply("🚫 𝙾𝚗𝚕𝚢 𝚖𝚢 𝚕𝚘𝚛𝚍 𝙰𝚛𝚞 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚝𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍.");

      const name = args.slice(1).join(" ").toLowerCase();
      if (!name) return message.reply("⚠️ 𝚄𝚜𝚎: #voice 𝚊𝚍𝚍 <𝚗𝚊𝚖𝚎>");
      if (!messageReply || !messageReply.attachments?.length)
        return message.reply("⚠️ 𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊𝚗 𝚊𝚞𝚍𝚒𝚘 𝚏𝚒𝚕𝚎 𝚝𝚘 𝚜𝚊𝚟𝚎.");

      const audio = messageReply.attachments[0];
      const fileUrl = audio.url;
      const type = audio.type;
      if (!type.startsWith("audio")) return message.reply("❌ 𝚄𝚗𝚜𝚞𝚙𝚙𝚘𝚛𝚝𝚎𝚍 𝚏𝚒𝚕𝚎 𝚝𝚢𝚙𝚎.");

      const uploading = await message.reply("⏳ 𝚄𝚙𝚕𝚘𝚊𝚍𝚒𝚗𝚐 𝚢𝚘𝚞𝚛 𝚟𝚘𝚒𝚌𝚎...");

      try {
        const apiURL = `${driveAPI}?url=${encodeURIComponent(fileUrl)}`;
        const res = await axios.get(apiURL);
        const data = res.data || {};
        const driveLink = data.driveLink || data.driveLIink;
        if (!driveLink) return api.editMessage("❌ 𝚄𝚙𝚕𝚘𝚊𝚍 𝚏𝚊𝚒𝚕𝚎𝚍.", uploading.messageID, threadID);

        const payload = { name, url: driveLink };
        await axios.post(mongoAPI, payload);

        await api.editMessage(
          `✅ 𝚈𝚘𝚞𝚛 𝚟𝚘𝚒𝚌𝚎 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢 𝚞𝚙𝚕𝚘𝚊𝚍𝚎𝚍!\n\n🎧 𝙽𝚊𝚖𝚎: ${name}`,
          uploading.messageID,
          threadID
        );
      } catch (err) {
        console.error(err);
        await api.editMessage(`❌ 𝙴𝚛𝚛𝚘𝚛: ${err.message}`, uploading.messageID, threadID);
      }
      return;
    }

    if (option === "list") {
      try {
        const voices = await getAllVoices();
        if (voices.length === 0) return message.reply("❌ 𝙽𝚘 𝚟𝚘𝚒𝚌𝚎𝚜 𝚏𝚘𝚞𝚗𝚍.");

        const list = voices.map((v, i) => `${i + 1}. 🎵 ${v.name}`).join("\n");
        message.reply(`💿 𝚂𝚊𝚟𝚎𝚍 𝚅𝚘𝚒𝚌𝚎𝚜:\n\n${list}`);
      } catch (err) {
        console.error(err);
        message.reply("📀 𝙳𝚊𝚝𝚊𝚋𝚊𝚜𝚎 𝚎𝚛𝚛𝚘𝚛.");
      }
      return;
    }

    const name = option;
    if (!name) return message.reply("⚠️ 𝚄𝚜𝚎: #voice <𝚗𝚊𝚖𝚎> 𝚘𝚛 #voice 𝚕𝚒𝚜𝚝");

    try {
      const voices = await getAllVoices();
      const voice = voices.find(v => v.name.toLowerCase() === name);
      if (!voice) return message.reply(`❌ 𝚅𝚘𝚒𝚌𝚎 "${name}" 𝚗𝚘𝚝 𝚏𝚘𝚞𝚗𝚍.`);

      const url = voice.url;
      const filePath = path.join(__dirname, `temp_${Date.now()}.mp3`);

      const { data } = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, data);

      await message.reply({
        body: `🎧 𝙿𝚕𝚊𝚢𝚒𝚗𝚐: ${name}`,
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => fs.unlinkSync(filePath), 10000);
    } catch (err) {
      console.error(err);
      message.reply("❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚙𝚕𝚊𝚢 𝚟𝚘𝚒𝚌𝚎.");
    }
  }
};
