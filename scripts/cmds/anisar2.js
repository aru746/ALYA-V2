const axios = require("axios");

async function stream(url) {
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}

async function fetchAnime(query) {
  try {
    const { data } = await axios.get("http://72.62.241.211:3030/anisearch", {
      params: { q: query },
      timeout: 15000
    });
    return data;
  } catch {
    return null;
  }
}

const memory = {};

module.exports = {
  config: {
    name: "anisar2",
    aliases: ["anisearch2"],
    author: "ariyan",
    version: "4.1",
    shortDescription: { en: "anime edit" },
    longDescription: { en: "random anime edit" },
    category: "video",
    guide: { en: "anisearch denji\nreply more" },
    onReply: true
  },

  onStart: async ({ api, event, args, commandName }) => {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const query = args.join(" ").trim();
    if (!query) return;

    memory[event.senderID] = query;
    await send(api, event, query, commandName);
  },

  onReply: async ({ api, event, Reply }) => {
    if (event.senderID !== Reply.author) return;
    const query = memory[event.senderID];
    if (!query) return;
    await send(api, event, query, Reply.commandName);
  }
};

async function send(api, event, query, commandName) {
  const res = await fetchAnime(query);
  if (!res || !res.video) return;

  try {
    const video = await stream(res.video);

    api.sendMessage(
      { attachment: video },
      event.threadID,
      (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            author: event.senderID
          });
        }
      }
    );
  } catch {}
}
