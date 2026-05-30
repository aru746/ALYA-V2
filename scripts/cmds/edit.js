const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "edit",
    aliases: ["e"],
    version: "10.0",
    author: "Arafat",
    countDown: 10,
    role: 3,
    shortDescription: {
      en: "Premium AI Image Editor"
    },
    category: "image"
  },

  onStart: async function ({ message, event, args, api }) {

    const { messageReply, messageID, threadID } = event;

    try {

      if (
        !messageReply ||
        !messageReply.attachments ||
        messageReply.attachments[0].type !== "photo" ||
        args.length === 0
      ) {

        return message.reply(
`╭━━〔 ✦ AI EDITOR ✦ 〕━━╮
┃
┃ Reply To Image With:
┃
┃ edit -s3 cinematic style
┃
┣━━━━━━━━━━━━━━━
┃ Available Models:
┃
┃ -n   ➜ Nanobanana 2.5
┃ -n2  ➜ Nanobanana 3.1
┃ -s   ➜ Seedream 4.0
┃ -s2  ➜ Seedream 4.5
┃ -s3  ➜ Seedream 5.0
┃ -g   ➜ GPT 1.5
┃ -g2  ➜ GPT 2.0
┃ -q   ➜ Qwen Plus
┃ -q2  ➜ Wan 2.7
┃ -q3  ➜ Wan 2.7 Pro
┃ -q4  ➜ Qwen Relay
┃
╰━━━━━━━━━━━━━━━╯`,
          messageID
        );
      }

      const apiBase = String(global.GoatBot.config.Arafat?.api || "").trim();

      if (!apiBase) {
        return message.reply("❌ API Base Not Found In Config");
      }

      let modelPath = "nanobanana2";
      let modelName = "Nanobanana 3.1";
      let prompt = args.join(" ");

      const modelMap = {
        "-n":  { p: "nanobanana",  n: "Nanobanana 2.5" },
        "-n2": { p: "nanobanana2", n: "Nanobanana 3.1" },
        "-s":  { p: "seedream",    n: "Seedream 4.0" },
        "-s2": { p: "seedream2",   n: "Seedream 4.5" },
        "-s3": { p: "seedream3",   n: "Seedream 5.0" },
        "-g":  { p: "gpt",         n: "GPT 1.5" },
        "-g2": { p: "gpt2",        n: "GPT 2.0" },
        "-q":  { p: "qwen",        n: "Qwen Plus" },
        "-q2": { p: "qwen2",       n: "Wan 2.7" },
        "-q3": { p: "qwen3",       n: "Wan 2.7 Pro" },
        "-q4": { p: "qwen4",       n: "Qwen Relay" }
      };

      if (modelMap[args[0]?.toLowerCase()]) {

        const target = modelMap[args[0].toLowerCase()];

        modelPath = target.p;
        modelName = target.n;
        prompt = args.slice(1).join(" ");
      }

      if (!prompt) {
        return message.reply("⚠️ Please provide an edit prompt.");
      }

      message.reaction("✨", messageID);

      const loading = await api.sendMessage(
`╭┈┈┈┈⭓
┊ ✨ Processing...
┊ 🎨 ${modelName}
╰────────────⭓`,
        threadID
      );

      const url1 = messageReply.attachments[0].url;

      const url2 =
        messageReply.attachments.length > 1 &&
        messageReply.attachments[1].type === "photo"
          ? messageReply.attachments[1].url
          : "";

      let finalUrl =
`${apiBase}/edit2/${modelPath}?url=${encodeURIComponent(url1)}&prompt=${encodeURIComponent(prompt)}`;

      if (url2) {
        finalUrl += `&url2=${encodeURIComponent(url2)}`;
      }

      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      const filePath = path.join(
        cacheDir,
        `edit_${Date.now()}.jpg`
      );

      const res = await axios({
        method: "GET",
        url: finalUrl,
        responseType: "arraybuffer",
        timeout: 300000
      }).catch(() => null);

      if (!res || !res.data || res.data.length < 500) {

        if (loading?.messageID) {
          api.unsendMessage(loading.messageID);
        }

        message.reaction("❌", messageID);

        return message.reply(
`╭┈┈┈┈⭓
┊ ❌ Edit Failed
┊ 🔌 Server Offline
╰────────────⭓`
        );
      }

      await sharp(res.data)
        .jpeg({ quality: 95 })
        .toFile(filePath);

      if (loading?.messageID) {
        api.unsendMessage(loading.messageID);
      }

      await message.reply({
        body:
`╭┈┈┈┈⭓
┊ ✅ Edit Complete
┊ 🎨 ${modelName}
┊ ${url2 ? "🖼️ Dual Image Mode" : "📸 Single Image Mode"}
╰────────────⭓`,
        attachment: fs.createReadStream(filePath)
      }, threadID);

      message.reaction("🕊️", messageID);

      setTimeout(() => {

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

      }, 15000);

    } catch (e) {

      console.error(e);

      message.reaction("💔", messageID);

      return message.reply(
`╭┈┈┈┈⭓
┊ 💔 System Error
┊ Try Again Later
╰────────────⭓`
      );
    }
  }
};
