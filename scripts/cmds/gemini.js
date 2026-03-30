const axios = require("axios");

module.exports = {
  config: {
    name: "gemini",
    version: "10.0",
    author: "Ariyan",
    role: 0,
    category: "ai"
  },

  onStart: async function ({ message, event, args }) {
    const input = args.join(" ").toLowerCase().trim();

    if (!global.geminiToggle) global.geminiToggle = {};
    if (!global.geminiCooldown) global.geminiCooldown = {};
    if (!global.geminiSessions) global.geminiSessions = {};

    if (input === "on") {
      global.geminiToggle[event.threadID] = true;
      return message.reply("Gemini AI enabled in this group.");
    }

    if (input === "off") {
      delete global.geminiToggle[event.threadID];
      delete global.geminiSessions[event.threadID];
      return message.reply("Gemini AI disabled in this group.");
    }

    return message.reply("Use: gemini on / gemini off");
  },

  onChat: async function ({ message, event }) {
    try {
      const botID = global.GoatBot.config.userID;

      if (!global.geminiToggle?.[event.threadID]) return;
      if (!event.body) return;
      if (event.senderID === botID) return;

      const body = event.body.trim();
      const lower = body.toLowerCase();

      if (lower === "gemini ai enabled in this group.") return;
      if (lower === "gemini ai disabled in this group.") return;
      if (lower.startsWith("-gemini")) return;
      if (lower === "gemini on" || lower === "gemini off") return;

      const now = Date.now();
      if (
        global.geminiCooldown?.[event.threadID] &&
        now - global.geminiCooldown[event.threadID] < 3000
      ) return;

      global.geminiCooldown[event.threadID] = now;

      const API_BASE = "http://199.19.72.61:4000";

      let sessionId = global.geminiSessions?.[event.threadID];

      let url = `${API_BASE}/api/chat?message=${encodeURIComponent(body)}`;

      if (sessionId) {
        url += `&session=${sessionId}`;
      }

      const res = await axios.get(url, { timeout: 60000 });

      if (!res.data?.status) return;

      global.geminiSessions[event.threadID] = res.data.session;

      return message.reply(res.data.reply);

    } catch {
      return;
    }
  }
};
