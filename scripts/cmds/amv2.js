const axios = require('axios');

async function getStreamFromURL(url) {
  const response = await axios.get(url, { 
    responseType: 'stream',
    timeout: 120000 
  });
  return response.data;
}

module.exports = {
  config: {
    name: "amv2",
    aliases: ["anieditz", "animeedit"],
    author: "Toshiro Editz",
    version: "4.5",
    shortDescription: {
      en: "get anime edit",
    },
    longDescription: {
      en: "search for anime edits",
    },
    category: "anime",
    guide: {
      en: "{p}{n} [query]",
    },
  },

  onStart: async function ({ api, event, args }) {
    api.setMessageReaction("✨", event.messageID, (err) => {}, true);

    const query = args.join(' ').toLowerCase().trim();
    const API_URL = 'https://amveditz.onrender.com';

    try {
      console.log(`[Anisearch] Query: "${query}"`);
      
      const response = await axios.get(`${API_URL}/download?keyword=${encodeURIComponent(query)}`, {
        timeout: 180000
      });
      
      if (!response.data?.success || !response.data?.results?.[0]) {
        api.sendMessage({ body: '❌ No results' }, event.threadID, event.messageID);
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        return;
      }

      const result = response.data.results[0];

      if (result.downloaded?.filename) {
        const videoUrl = `${API_URL}/videos/${result.downloaded.filename}`;
        console.log(`[Anisearch] Streaming video from: ${videoUrl}`);

        try {
          const videoStream = await getStreamFromURL(videoUrl);

          api.sendMessage({
            body: `🎬 Anime Edit Found!`,
            attachment: videoStream,  // direct stream
          }, event.threadID, (err) => {
            if (err) {
              console.error(`[Anisearch] Send error:`, err.message);
              api.setMessageReaction("❌", event.messageID, (err) => {}, true);
            } else {
              api.setMessageReaction("✅", event.messageID, (err) => {}, true);
            }
          }, event.messageID);

        } catch (streamErr) {
          console.error(`[Anisearch] Stream error: ${streamErr.message}`);
          api.sendMessage({ body: `⚠ Could not fetch video, but edit found!` }, event.threadID, event.messageID);
          api.setMessageReaction("⚠", event.messageID, (err) => {}, true);
        }

      } else {
        api.sendMessage({ body: `🎬 Anime Edit Found!` }, event.threadID, event.messageID);
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      }

    } catch (error) {
      console.error(`[Anisearch] Error: ${error.message}`);
      api.sendMessage({ body: `❌ Error: ${error.message.substring(0, 50)}` }, event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
    }
  },
};
