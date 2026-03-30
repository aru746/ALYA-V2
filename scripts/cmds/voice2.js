const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "voice2",
    aliases: ["vm2"],
    version: "1.0.3",
    author: "LIKHON AHMED + kuze",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Play voices from Noobs API and custom Alya voice"
    },
    description: {
      en: "Play voices from Noobs Voice API or the added Alya custom voice"
    },
    category: "fun",
    guide: {
      en: "{pn} list - Show voice list\n{pn} <voiceName> - Play selected voice"
    }
  },

  langs: {
    en: {
      invalidOption: "Invalid option. Use: list or <voiceName>",
      noVoices: "No voices found.",
      errorFetching: "Error fetching voice list.",
      failedPlay: "Failed to play voice. Make sure the name is correct."
    }
  },

  onStart: async function ({ api, event, args, getLang }) {
    if (!args[0])
      return api.sendMessage(getLang("invalidOption"), event.threadID);

    const option = args[0].toLowerCase();

    // 🎵 Custom local voice
    const customVoices = {
      alya: path.join(__dirname, "alya_milashka.mp3")
    };

    // 📋 LIST OPTION
    if (option === "list") {
      try {
        const res = await axios.get("https://noobs-voice-api.vercel.app/list");
        const data = res.data;

        let voices = [];
        if (Array.isArray(data)) voices = data;
        else if (data.voices && Array.isArray(data.voices)) voices = data.voices;

        // Filter out "ah" voice completely
        voices = voices
          .map(v => v.replace(/\.[^/.]+$/, "")) // remove file extensions
          .filter(v => v.toLowerCase() !== "ah");

        // Add Alya to list
        const allVoices = [...voices, "alya"];

        if (allVoices.length === 0)
          return api.sendMessage(getLang("noVoices"), event.threadID);

        const names = allVoices.map((v, i) => `${i + 1}. ${v}`).join("\n");

        return api.sendMessage(`🐣 Available voices:\n${names}`, event.threadID);

      } catch (err) {
        return api.sendMessage(`${getLang("errorFetching")}\n⚠️ ${err.message}`, event.threadID);
      }
    }

    // 🔊 PLAY VOICE OPTION
    else {
      const voiceName = args[0].toLowerCase();

      // Handle custom Alya voice
      if (customVoices[voiceName]) {
        try {
          const stream = fs.createReadStream(customVoices[voiceName]);
          return api.sendMessage({ attachment: stream }, event.threadID);
        } catch (err) {
          return api.sendMessage(`${getLang("failedPlay")}\n⚠️ ${err.message}`, event.threadID);
        }
      }

      // Block the "ah" voice
      if (voiceName === "ah") {
        return api.sendMessage("❌ | This voice ('ah') has been removed.", event.threadID);
      }

      // Fetch other voices normally
      const url = `https://noobs-voice-api.vercel.app/voice/${voiceName}`;
      try {
        const stream = await global.utils.getStreamFromURL(url);
        return api.sendMessage({ attachment: stream }, event.threadID);
      } catch (err) {
        return api.sendMessage(`${getLang("failedPlay")}\n⚠️ ${err.message}`, event.threadID);
      }
    }
  }
};
