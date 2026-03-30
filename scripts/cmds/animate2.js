const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

const formatText = (text) => {
  const mapping = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', '𝐋': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => mapping[char] || char).join('');
};

async function getStreamFromURL(url) {
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}

function generateRandomId(len = 16) {
  const chars = "abcdef0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function getBalance() {
  const pack = generateRandomId();
  await axios.post("https://api.getglam.app/rewards/claim/hdnu30r7auc4kve", null, {
    headers: {
      "User-Agent": "Glam/1.58.4 Android/32",
      "glam-user-id": pack,
      "user_id": pack,
      "glam-local-date": new Date().toISOString(),
    },
  });
  return pack;
}

module.exports = {
  config: {
    name: "animate2",
    version: "1.2",
    author: "goku | SiFu",
    role: 0,
    countDown: 10,
    category: "fun",
    shortDescription: "Animate a picture into a video",
    guide: "{pn} <prompt> (reply to photo)"
  },

  onStart: async function ({ api, event, message, usersData, args }) {
    const senderID = event.senderID;

    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments[0].type !== "photo") {
        return message.reply(formatText("• Please reply to a photo, Baby!"));
      }

      const promptText = args.join(" ");
      if (!promptText) return message.reply(formatText("• Please provide a prompt, Baby!"));

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
      const filePath = path.join(cacheDir, `animate_${Date.now()}.png`);

      // Download
      const url = event.messageReply.attachments[0].url;
      const writer = fs.createWriteStream(filePath);
      const response = await axios.get(url, { responseType: "stream" });
      response.data.pipe(writer);
      await new Promise((resolve) => writer.on("finish", resolve));

      // Processing
      const pack = await getBalance();
      const form = new FormData();
      form.append("package_id", pack);
      form.append("media_file", fs.createReadStream(filePath));
      form.append("media_type", "image");
      form.append("template_id", "community_img2vid");
      form.append("template_category", "20_coins_dur");
      form.append("frames", JSON.stringify([{
        prompt: promptText,
        custom_prompt: promptText,
        start: 0, end: 0,
        timings_units: "frames",
        media_type: "image",
        style_id: "chained_falai_img2video",
        rate_modifiers: { duration: "5s" },
      }]));

      const uploadRes = await axios.post("https://android.getglam.app/v2/magic_video", form, {
        headers: { ...form.getHeaders(), "User-Agent": "Glam/1.58.4" },
      });

      const taskID = uploadRes.data.event_id;
      let videoUrl = "";

      // Polling Status
      while (true) {
        const status = await axios.get("https://android.getglam.app/v2/magic_video", {
          params: { package_id: pack, event_id: taskID },
          headers: { "User-Agent": "Glam/1.58.4" },
        });
        if (status.data.status === "READY") {
          videoUrl = status.data.video_url;
          break;
        }
        if (status.data.status === "FAILED") throw new Error("API Failed");
        await new Promise(r => setTimeout(r, 3000));
      }

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      // New Styled Caption
      const styledMsg = `>‎🎀 𝐁𝐚𝐛𝐲 𝐘𝐨𝐮𝐫 𝐀𝐧𝐢𝐦𝐚𝐭𝐢𝐨𝐧 𝐢𝐬 𝐑𝐞𝐚𝐝𝐲.`;

      await message.reply({
        body: styledMsg,
        attachment: await getStreamFromURL(videoUrl)
      });

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      message.reply(formatText("• Something went wrong while animating, Baby!"));
    }
  }
};
