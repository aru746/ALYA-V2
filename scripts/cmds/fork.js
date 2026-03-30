module.exports = {
  config: {
    name: "fork",
    version: "1.0",
    author: "Arijit",
    category: "group",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Send GitHub repo link" },
    longDescription: { en: "When someone uses this command, the bot only sends the GitHub repo link." }
  },

  onStart: async function ({ api, event }) {
    const link = "https://github.com/alya-v2/ALYA-V1.git";
    try {
      await api.sendMessage(link, event.threadID, event.messageID);
    } catch (e) {
      console.error(e);
    }
  }
};
