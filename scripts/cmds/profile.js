module.exports = {
  config: {
    name: "profile",
    aliases: ["pfp", "pp", "dp"],
    version: "3.1",
    author: "Arafat",
    role: 0,
    category: "system",
    guide: { en: "profile | profile @user | reply profile" },
    noPrefix: true
  },

  onStart: async function ({ api, event, usersData, args }) {
    return runProfile({ api, event, usersData, args });
  },

  onChat: async function ({ api, event, usersData }) {
    if (!event.body) return;

    const body = event.body.toLowerCase().trim();
    if (!["profile", "pfp", "pp", "dp"].includes(body)) return;

    return runProfile({ api, event, usersData, args: [] });
  }
};

async function runProfile({ api, event, usersData, args }) {
  let uid;

  if (event.type === "message_reply") {
    uid = event.messageReply.senderID;
  } 
  else if (event.mentions && Object.keys(event.mentions).length > 0) {
    uid = Object.keys(event.mentions)[0];
  } 
  else if (args?.[0] && /^\d{5,}$/.test(args[0])) {
    uid = args[0];
  } 
  else {
    uid = event.senderID;
  }

  let user;
  try {
    user = await usersData.get(uid);
  } catch {
    user = null;
  }

  const name = user?.name || "Unknown User";

  // 🔑 Facebook App Access Token
  const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

  const avatar = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=${accessToken}`;

  const msg = `
`;

  return api.sendMessage(
    {
      body: msg,
      attachment: await global.utils.getStreamFromURL(avatar)
    },
    event.threadID,
    event.messageID
  );
}
