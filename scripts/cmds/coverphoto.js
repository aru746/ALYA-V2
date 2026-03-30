const axios = require("axios");

// List of bot admins (user IDs)
const botAdmins = ["100069254151118"]; // <-- add your bot admin IDs here

const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

const config = {
  name: "coverphoto",
  aliases: ["cp", "cover"],
  author: "Dipto",
  credits: "Dipto",
  role: 0, // can be 0 because we're controlling via botAdmins
  countDown: 5,
  description: "Get Fb profile cover photo",
  usePrefix: true,
  hasPermission: 0, // general, bot admin check is in code
  premium: false,
  category: "admin",
  commandCategory: "user",
  guide: {
    en: "{pn} [uid/link]",
  },
  usages: "-coverphoto [uid/link]",
  cooldowns: 5,
};

const onStart = async ({ api, event, args }) => {
  try {
    // Bot admin check
    if (!botAdmins.includes(event.senderID)) {
      return api.sendMessage(
        "❌ You are not a bot admin and cannot use this command.",
        event.threadID,
        event.messageID
      );
    }

    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions || {})[0];
    let uid;

    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        uid = args[0];
      } else {
        const match = args[0].match(/profile\.php\?id=(\d+)/);
        if (match) uid = match[1];
      }
    }

    if (!uid) {
      uid =
        event.type === "message_reply"
          ? event.messageReply.senderID
          : uid2 || uid1;
    }

    const { data } = await axios.get(
      `${await baseApiUrl()}/coverphoto?userName=${uid}`
    );

    if (data) {
      const response = await axios.get(data.data.cover.source, {
        responseType: "stream",
      });

      await api.sendMessage(
        { body: `Username: ${data.data.id}`, attachment: response.data },
        event.threadID,
        event.messageID
      );
    }
  } catch (err) {
    console.log(err);
    api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports = {
  config,
  onStart,
  run: onStart,
};
