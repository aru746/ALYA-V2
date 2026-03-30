const axios = require("axios");

const API_BASE = "https://imagine-api-ariyan.vercel.app/";

global.imagineStore = global.imagineStore || {};

module.exports = {
  config: {
    name: "imagine",
    aliases: ["gen","img"],
    version: "2.1",
    author: "Ariyan",
    role: 0,
    category: "imagine",
    guide: { en: "{pn} cat cinematic" }
  },

  onStart: async function ({ message, args, event }) {
    try {
      const raw = (event.body || "").trim().toLowerCase();
      if (["u1", "u2", "u3", "u4"].includes(raw)) return;

      const prompt = args.join(" ");
      if (!prompt) {
        return message.reply("❌ Provide a prompt");
      }

      const wait = await message.reply("🎨 Generating... ⏳");

      const url = `${API_BASE}/imagine?prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(url, {
        responseType: "stream",
        timeout: 180000,
        validateStatus: () => true
      });

      const sessionId = res.headers["x-session-id"];
      if (!sessionId) {
        await message.unsend(wait.messageID);
        return message.reply("❌ No session id");
      }

      await message.unsend(wait.messageID);

      const sent = await message.reply({
        body: `✅ Done\n📝 ${prompt}\n\nU1 • U2 • U3 • U4`,
        attachment: res.data
      });

      global.imagineStore[sent.messageID] = { sessionId };

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "imagine",
        messageID: sent.messageID,
        sessionId
      });

    } catch (err) {
      return message.reply("❌ Failed");
    }
  },

  onReply: async function ({ message, event, Reply }) {
    try {
      const body = (event.body || "").trim().toLowerCase();
      if (!["u1", "u2", "u3", "u4"].includes(body)) return;

      const index = Number(body.replace("u", ""));

      const uUrl = `${API_BASE}/u?session=${Reply.sessionId}&index=${index}`;

      const imgRes = await axios.get(uUrl, {
        responseType: "stream",
        timeout: 120000
      });

      return message.reply({
        body: `🖼️ ${body.toUpperCase()}`,
        attachment: imgRes.data
      });

    } catch (err) {
      return message.reply("❌ Failed");
    }
  }
};
