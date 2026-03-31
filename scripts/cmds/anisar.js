const axios = require('axios');

// --- Fix stderr issue for some environments (Windows/pm2 logs etc.)
if (typeof process.stderr.clearLine !== "function") {
  process.stderr.clearLine = () => {};
}
if (typeof process.stderr.cursorTo !== "function") {
  process.stderr.cursorTo = () => {};
}

async function getStreamFromURL(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  return response.data;
}

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://lyric-search-neon.vercel.app/kshitiz?keyword=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = {
  config: {
    name: "anisar",
    aliases: ["anisar"],
    author: "Vex_kshitiz",
    version: "1.0",
    shortDescription: {
      en: "get anime edit",
    },
    longDescription: {
      en: "search for anime edits video",
    },
    category: "anime",
    guide: {
      en: "{p}{n} [query]",
    },
    usePrefix: false,
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(' ');
    if (!query) {
      api.sendMessage("❌ Please provide a search query.", event.threadID, event.messageID);
      return;
    }

    const modifiedQuery = `${query} anime edit`;
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const videos = await fetchTikTokVideos(modifiedQuery);

    if (!videos || videos.length === 0) {
      api.sendMessage({ body: `❌ No results found for: ${query}` }, event.threadID, event.messageID);
      return;
    }

    const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
    const videoUrl = selectedVideo.videoUrl;

    if (!videoUrl) {
      api.sendMessage({ body: '⚠️ Error: Video URL not found.' }, event.threadID, event.messageID);
      return;
    }

    try {
      const videoStream = await getStreamFromURL(videoUrl);
      await api.sendMessage({
        body: ``,
        attachment: videoStream,
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage({ body: '❌ An error occurred while processing the video.\nPlease try again later.' }, event.threadID, event.messageID);
    }
  },

  onChat: async function ({ event, api }) {
    const content = event.body.toLowerCase();
    if (content.startsWith("anisar")) {
      const query = content.slice(6).trim();
      if (!query) return;

      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      const videos = await fetchTikTokVideos(`${query} anime edit`);

      if (!videos || videos.length === 0) {
        api.sendMessage({ body: `❌ No results found for: ${query}` }, event.threadID, event.messageID);
        return;
      }

      const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
      const videoUrl = selectedVideo.videoUrl;

      if (!videoUrl) {
        api.sendMessage({ body: '⚠️ Error: Video URL not found.' }, event.threadID, event.messageID);
        return;
      }

      try {
        const videoStream = await getStreamFromURL(videoUrl);
        await api.sendMessage({
          body: ``,
          attachment: videoStream,
        }, event.threadID, event.messageID);
      } catch (error) {
        console.error(error);
        api.sendMessage({ body: '❌ An error occurred while processing the video.\nPlease try again later.' }, event.threadID, event.messageID);
      }
    }
  }
};
