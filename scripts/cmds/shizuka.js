const axios = require("axios");
const { GoatWrapper } = require("fca-saim-x69x");

module.exports.config = {
  name: "shizuka",
  version: "1.0",
  role: 0,
  author: "Saimx69x",
  description: "Romantic AI GF Shizuka",
  usePrefix: true,
  guide: "[message] | just type shizuka",
  category: "ai",
  aliases: ["cuna","nizu", "xan", "kolixa"]
};

const randomOpeners = [
  "𝐤𝐞𝐦𝐨𝐧 𝐚𝐜𝐡𝐨 𝐣𝐚𝐧? 🥺",
  "𝐇𝐦𝐦... 𝐛𝐛𝐲 𝐤𝐢𝐜𝐡𝐮 𝐣𝐢𝐠𝐠𝐞𝐬𝐡 𝐤𝐨𝐫𝐭𝐞 𝐜𝐡𝐚𝐨 𝐧𝐚𝐤𝐢? 🌸",
  "𝐘𝐞𝐬 𝐈'𝐦 𝐡𝐞𝐫𝐞... ✨️",
  "𝐁𝐨𝐥𝐨 𝐱𝐚𝐧, 𝐤𝐢 𝐡𝐞𝐥𝐩 𝐥𝐚𝐠𝐛𝐞 🥰"
];

async function convertFont(text) {
  try {
    const githubRawUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const apiRes = await axios.get(githubRawUrl);
    const baseUrl = apiRes.data.apiv1;
    const fontRes = await axios.get(`${baseUrl}/api/font`, { params: { id: 16, text } });
    return fontRes.data.output || text;
  } catch (err) {
    console.error("Font API failed:", err.message);
    return text;
  }
}

module.exports.onStart = async function ({ api, args, event }) {
  const userId = event.senderID;
  const input = args.join(" ").trim();

  if (!input) {
    const opener = randomOpeners[Math.floor(Math.random() * randomOpeners.length)];
    return api.sendMessage(opener, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: userId
        });
      }
    }, event.messageID);
  }

  try {
    const githubRawUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const apiRes = await axios.get(githubRawUrl);
    const baseUrl = apiRes.data.apiv1;

    const res = await axios.get(`${baseUrl}/api/shizuka`, { params: { query: input, userId } });
    const aiText = res.data.response || "𝐁𝐮𝐣𝐡𝐭𝐞 𝐩𝐚𝐫𝐥𝐚𝐦 𝐧𝐚... 𝐚𝐛𝐚𝐫 𝐛𝐨𝐥𝐨? 😅";
    const styledText = await convertFont(aiText);

    api.sendMessage(styledText, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: userId
        });
      }
    }, event.messageID);

  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    api.sendMessage("❌ 𝐒𝐡𝐢𝐳𝐮𝐤𝐚 𝐜𝐨𝐧𝐟𝐮𝐬𝐞𝐝 𝐡𝐨𝐲𝐞 𝐠𝐞𝐥𝐨!\nError: " + msg, event.threadID, event.messageID);
  }
};

module.exports.onReply = async function ({ api, event, Reply }) {
  if (event.senderID !== Reply.author) return;

  const userId = event.senderID;
  const input = event.body.trim();

  try {
    const githubRawUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";
    const apiRes = await axios.get(githubRawUrl);
    const baseUrl = apiRes.data.apiv1;

    const res = await axios.get(`${baseUrl}/api/shizuka`, { params: { query: input, userId } });
    const aiText = res.data.response || "𝐁𝐨𝐥𝐨 𝐛𝐨𝐥𝐨 𝐭𝐨𝐦𝐚𝐫 𝐤𝐨𝐭𝐡𝐚 𝐬𝐡𝐮𝐧𝐥𝐞 𝐯𝐚𝐥𝐨 𝐥𝐚𝐠𝐞 😎";
    const styledText = await convertFont(aiText);

    api.sendMessage(styledText, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: userId
        });
      }
    }, event.messageID);

  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    api.sendMessage("❌ 𝐄𝐫𝐫𝐨𝐫: " + msg, event.threadID, event.messageID);
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
