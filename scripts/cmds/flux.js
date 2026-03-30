const axios = require("axios");

const API_BASE = "https://flux-api-ariyan.vercel.app/";

module.exports = {
  config: {
    name: "flux",
    aliases: ["fx"],
    version: "1.0",
    author: "Ariyan",
    role: 0,
    category: "imagine",
    guide: { en: "{pn} cat anime" }
  },

  onStart: async function ({ message, args }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("❌ Example: -flux a cute anime cat");
    }

    const wait = await message.reply("⚡ Generating image... Please wait ⏳");

    try {
      const url =
        `${API_BASE}/generate?prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(url, {
        timeout: 120000
      });

      if (!res.data?.status || !res.data?.image) {
        console.error("API RESPONSE:", res.data);
        throw new Error("Invalid API response");
      }

      await message.unsend(wait.messageID);

      return message.reply({
        body:
          `⚡ Flux Image Generated\n\n` +
          `Prompt: ${prompt}`,
        attachment: await global.utils.getStreamFromURL(res.data.image)
      });

    } catch (err) {
      console.error("FLUX CMD ERROR:", err?.response?.data || err.message);

      await message.unsend(wait.messageID);

      return message.reply(
        "❌ Image generation failed.\n" +
        "⚠️ Try again in a few seconds."
      );
    }
  }
};
