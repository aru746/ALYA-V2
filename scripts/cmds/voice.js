const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

const FONT_URL = "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/font.json";
let FONT = null;

async function loadFont() {
  if (FONT) return FONT;
  try {
    const res = await axios.get(FONT_URL, { timeout: 5000 });
    FONT = res.data || {};
  } catch { FONT = {}; }
  return FONT;
}

async function f(text = "") {
  const map = await loadFont();
  return text.toString().split("").map(c => map[c] || c).join("");
}

module.exports = {
  config: {
    name: "voice",
    aliases: ["vm"],
    version: "9.5",
    author: "𝐀𝐫𝐚𝐟𝐚𝐭",
    countDown: 5,
    role: 0,
    shortDescription: "🎙 Futuristic VIP Voice System",
    category: "fun",
    guide: {
      en: "🎧 {pn} add <name> → Reply to audio\n📜 {pn} list → Show List\n🗑 {pn} -rm <name> → Remove Voice\n▶ {pn} <name> → Play Voice"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { senderID, threadID, messageReply } = event;
    const option = args[0]?.toLowerCase();

    const mongoAPI = "https://mongodb-api-psi.vercel.app/voice-aru";
    const uploadAPI = "https://driver-public-by-arafat.vercel.app/api/upload";
    
    // Authorized UIDs যারা ডাটাবেস এডিট করতে পারবে
    const AUTHORIZED_UIDS = ["61585751745197", "61573866391878", "61587824177237"];

    const getAllVoices = async () => {
      const res = await axios.get(mongoAPI);
      return res.data?.data || [];
    };

    // Check if user is authorized (UID based)
    const isAuthorized = (senderID) => {
      return AUTHORIZED_UIDS.includes(senderID);
    };

    // ========== ADD VOICE (Authorized Only) ==========
    if (option === "add") {
      if (!isAuthorized(senderID)) {
        return message.reply(await f(
          "╭──『 🚫 𝖠𝖢𝖢𝖤𝖲𝖲 𝖣𝖤𝖭𝖨𝖤𝖣 』──⬡\n" +
          "│ 🔒 𝖴𝗇𝖺𝗎𝗍𝗁𝗈𝗋𝗂𝗓𝖾𝖽 𝖴𝗌𝖾𝗋\n" +
          "│ 👤 𝖸𝗈𝗎𝗋 𝖴𝖨𝖣: " + senderID + "\n" +
          "│ ⚠ 𝖮𝗇𝗅𝗒 𝖺𝗎𝗍𝗁𝗈𝗋𝗂𝗓𝖾𝖽 𝖺𝖽𝗆𝗂𝗇𝗌 𝖼𝖺𝗇 𝖺𝖽𝖽 𝗏𝗈𝗂𝖼𝖾𝗌\n" +
          "╰───────────────⬡"
        ));
      }

      const name = args.slice(1).join(" ").toLowerCase();
      if (!name || !messageReply || !messageReply.attachments?.length)
        return message.reply(await f("⚠ Usage: #voice add <name> (Reply to audio)"));

      const audio = messageReply.attachments[0];
      if (!audio.type?.startsWith("audio"))
        return message.reply(await f("❌ Error: Invalid Audio File."));

      const loading = await message.reply(await f(
        "╭──『 🔄 𝖯𝖱𝖮𝖢𝖤𝖲𝖲𝖨𝖭𝖦 』──⬡\n" +
        "│ 📡 𝖴𝗉𝗅𝗈𝖺𝖽𝗂𝗇𝗀: " + name + "\n" +
        "│ ⏳ 𝖲𝗍𝖺𝗍𝗎𝗌: 𝖯𝗅𝖾𝖺𝗌𝖾 𝖶𝖺𝗂𝗍\n" +
        "╰───────────────⬡"
      ));

      try {
        const d = await axios.post(uploadAPI, { url: audio.url });
        const driveUrl = d.data?.downloadUrl || d.data?.url;

        if (!driveUrl) throw new Error("Upload Failed");

        await axios.post(mongoAPI, { 
          name, 
          url: driveUrl,
          date: new Date().toLocaleDateString("en-GB"),
          addedBy: senderID
        });

        return api.editMessage(await f(
          "╭──『 🚀 𝖫𝖮𝖠𝖣𝖤𝖣 』──⬡\n" +
          "│ ✅ 𝖢𝗈𝗆𝗆𝖺𝗇𝖽: Voice Add\n" +
          "│ ✨ 𝖲𝗍𝖺𝗍𝗎𝗌: Success\n" +
          "│ 🎧 𝖭𝖺𝗆𝖾: " + name.toUpperCase() + "\n" +
          "│ 👑 𝖠𝖽𝖽𝖾𝖽 𝖻𝗒: " + senderID + "\n" +
          "╰───────────────⬡"
        ), loading.messageID, threadID);
        
      } catch (e) {
        return api.editMessage(await f("❌ Error: Cloud upload failed!"), loading.messageID, threadID);
      }
    }

    // ========== LIST VOICES (Public) ==========
    if (option === "list") {
      const voices = await getAllVoices();
      if (!voices.length) return message.reply(await f("❌ No voices found."));

      const list = voices.map((v, i) => `│ ${i + 1}. ${v.name.toUpperCase()}`).join("\n");

      return message.reply(await f(
        "╭──『 📜 𝖵𝖮𝖨𝖢𝖤 𝖫𝖨𝖲𝖳 』──⬡\n" +
        list + "\n" +
        "╰───────────────⬡\n" +
        "📊 Total: " + voices.length
      ));
    }

    // ========== REMOVE VOICE (Authorized Only) ==========
    if (option === "-rm" || option === "rm" || option === "remove") {
      if (!isAuthorized(senderID)) {
        return message.reply(await f(
          "╭──『 🚫 𝖠𝖢𝖢𝖤𝖲𝖲 𝖣𝖤𝖭𝖨𝖤𝖣 』──⬡\n" +
          "│ 🔒 𝖴𝗇𝖺𝗎𝗍𝗁𝗈𝗋𝗂𝗓𝖾𝖽 𝖴𝗌𝖾𝗋\n" +
          "│ 👤 𝖸𝗈𝗎𝗋 𝖴𝖨𝖣: " + senderID + "\n" +
          "│ ⚠ 𝖮𝗇𝗅𝗒 𝖺𝗎𝗍𝗁𝗈𝗋𝗂𝗓𝖾𝖽 𝖺𝖽𝗆𝗂𝗇𝗌 𝖼𝖺𝗇 𝗋𝖾𝗆𝗈𝗏𝖾 𝗏𝗈𝗂𝖼𝖾𝗌\n" +
          "╰───────────────⬡"
        ));
      }

      const nameToRemove = args.slice(1).join(" ").toLowerCase();
      if (!nameToRemove) {
        return message.reply(await f("⚠ Usage: #voice -rm <name>\n📝 Example: #voice -rm welcome"));
      }

      const voices = await getAllVoices();
      const voiceExists = voices.find(v => v.name.toLowerCase() === nameToRemove);

      if (!voiceExists) {
        return message.reply(await f(`❌ Voice "${nameToRemove}" not found in database.`));
      }

      const loading = await message.reply(await f(
        "╭──『 🔄 𝖣𝖤𝖫𝖤𝖳𝖨𝖭𝖦 』──⬡\n" +
        "│ 🗑 𝖱𝖾𝗆𝗈𝗏𝗂𝗇𝗀: " + nameToRemove + "\n" +
        "│ ⏳ 𝖲𝗍𝖺𝗍𝗎𝗌: 𝖯𝗋𝗈𝖼𝖾𝗌𝗌𝗂𝗇𝗀\n" +
        "╰───────────────⬡"
      ));

      try {
        // Delete using your API endpoint with admin key from .env
        const ADMIN_KEY = "Akhi"; // This should come from .env
        await axios.delete(`${mongoAPI}?name=${encodeURIComponent(nameToRemove)}&key=${ADMIN_KEY}`);
        
        return api.editMessage(await f(
          "╭──『 🗑 𝖣𝖤𝖫𝖤𝖳𝖤𝖣 』──⬡\n" +
          "│ ✅ 𝖢𝗈𝗆𝗆𝖺𝗇𝖽: Voice Remove\n" +
          "│ ✨ 𝖲𝗍𝖺𝗍𝗎𝗌: Successfully Removed\n" +
          "│ 🎧 𝖭𝖺𝗆𝖾: " + nameToRemove.toUpperCase() + "\n" +
          "│ 👑 𝖱𝖾𝗆𝗈𝗏𝖾𝖽 𝖻𝗒: " + senderID + "\n" +
          "╰───────────────⬡"
        ), loading.messageID, threadID);

      } catch (error) {
        console.error("Delete error:", error);
        return api.editMessage(await f(
          "❌ Error: Failed to remove voice.\n" +
          "💡 Please check server logs"
        ), loading.messageID, threadID);
      }
    }

    // ========== PLAY VOICE (Public) ==========
    const nameToPlay = args.join(" ").toLowerCase();
    if (!nameToPlay) return message.reply(await f("🎧 Usage: #voice <name>\n📜 Use #voice list to see all voices"));

    try {
      const voices = await getAllVoices();
      const voice = voices.find(v => v.name.toLowerCase() === nameToPlay);

      if (!voice) return message.reply(await f(`❌ Voice "${nameToPlay}" not found.\n📜 Use #voice list to see available voices.`));

      const tmpPath = path.join(os.tmpdir(), `v_${Date.now()}.mp3`);
      const response = await axios.get(voice.url, { responseType: "arraybuffer" });
      fs.writeFileSync(tmpPath, Buffer.from(response.data));

      await message.reply({
        body: await f(
          "╭──『 🎵 𝖯𝖫𝖠𝖸𝖨𝖭𝖦 』──⬡\n" +
          "│ 🎧 𝖳𝗋𝖺𝖼𝗄: " + nameToPlay.toUpperCase() + "\n" +
          "│ ✨ 𝖬𝗈𝖽𝖾: VIP Premium\n" +
          "╰───────────────⬡"
        ),
        attachment: fs.createReadStream(tmpPath)
      });

      setTimeout(() => { if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); }, 20000);

    } catch (e) {
      message.reply(await f("❌ Audio play error."));
    }
  }
};
