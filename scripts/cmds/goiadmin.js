module.exports = {
  config: {
    name: "goiadmin",
    author: "𝗔𝗺𝗶𝗻𝘂𝗹 𝗦𝗼𝗿𝗱𝗮𝗿",
    role: 0,
    shortDescription: "Auto reply when you are mentioned",
    longDescription: "Bot replies when someone mentions Arijit",
    category: "owner",
    guide: "{pn}"
  },

  onChat: async function ({ api, event }) {
    try {
      const myUID = "61590850943158";

      // শুধু normal message হলে
      if (event.type !== "message") return;

      // নিজে হলে ignore
      if (event.senderID === myUID) return;

      // mention না থাকলে ignore
      if (!event.mentions || Object.keys(event.mentions).length === 0) return;

      // যদি তোমাকে mention করা হয়
      if (Object.keys(event.mentions).includes(myUID)) {
        const msg = [
          "👋 এই যে বাবু! Aru বস এখন ব্যস্ত আছেন 😼 যা বলার আমাকেই বলুন ❤",
          "বসকে এতো মিনশন না দিয়ে সরাসরি inbox করো 😼",
          "Aru বস এখন মশা মারার মিশনে আছে, পরে কথা বলবে 😹",
          "Aru Boss এখন কাজে ব্যস্ত… এখন আমার boss রে disturb করবেন না 🐱",
          "সবাই শুধু Aru boss রে mention দেয়.... আমাকে কেও দেয় না 🙂💔",
          "বস ব্যস্ত! জরুরি হলে আমাকে tag করো, আমি তাড়াতাড়ি respond করি 😌😁",
          "😼 Aru বস এখন মগে চা নিয়ে Titanic pose দিচ্ছে ☕🚢"
        ];

        return api.sendMessage(
          msg[Math.floor(Math.random() * msg.length)],
          event.threadID,
          event.messageID
        );
      }
    } catch (e) {
      console.log("goiadmin error:", e);
    }
  },

  onStart: async function () {}
};
