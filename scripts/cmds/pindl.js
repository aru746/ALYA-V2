const axios = require("axios");

module.exports = {
  config: {
    name: "pindl",
    aliases: ["pdl"],
    version: "1.5",
    author: "Kakashi",
    countDown: 5,
    role: 0,
    shortDescription: "Download Pinterest videos",
    longDescription: "Download any Pinterest video using just the URL",
    category: "media",
    guide: {
      en: "{p}{n} <Pinterest URL>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const url = args[0];
      if (!url) {
        return api.sendMessage("❌ Please provide a Pinterest URL.", event.threadID, event.messageID);
      }

      if (!url.includes("pinterest.com") && !url.includes("pin.it")) {
        return api.sendMessage("❌ This command only works with Pinterest URLs.", event.threadID, event.messageID);
      }

      // Call downloader API
      const res = await axios.get(`https://mahabub-aldl.vercel.app/api/dl?url=${encodeURIComponent(url)}`);
      const data = res.data;

      if (!data || (!data.hd && !data.sd)) {
        return api.sendMessage("❌ Failed to download video. API didn’t return a valid link.", event.threadID, event.messageID);
      }

      // Prefer HD if available, otherwise SD
      const videoUrl = data.hd || data.sd;

      // Fetch video stream
      const videoStream = await axios.get(videoUrl, { responseType: "stream" });

      api.sendMessage(
        {
          body: `✅ ${data.title || "Pinterest Video"}\n📌 Platform: Pinterest\n🎥 Quality: ${data.hd ? "HD" : "SD"}`,
          attachment: videoStream.data
        },
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.error("Pinterest Downloader Error:", e);
      api.sendMessage("❌ Something went wrong while downloading the video.", event.threadID, event.messageID);
    }
  }
};
