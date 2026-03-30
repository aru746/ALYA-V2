const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "waifu",
    aliases: ["waifugame"],
    version: "2.0",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "waifu → Start game\nwaifu list → View ranking"
    }
  },

  // ================= START / LIST =================
  onStart: async function ({ api, event, usersData, args }) {

    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("❌ You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    // ========= RANK LIST =========
    if (args[0] && args[0].toLowerCase() === "list") {

      const allUsers = await usersData.getAll();
      const ranking = [];

      for (const user of allUsers) {
        if (user.data?.waifuWins > 0) {
          ranking.push({
            name: user.name || "Unknown",
            wins: user.data.waifuWins
          });
        }
      }

      ranking.sort((a, b) => b.wins - a.wins);

      if (!ranking.length)
        return api.sendMessage("❌ No ranking data found.", event.threadID, event.messageID);

      const bold = t => {
        const map = {
          a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",
          k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",
          u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
          A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",
          K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",
          U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
          0:"𝟎",1:"𝟏",2:"𝟐",3:"𝟑",4:"𝟒",5:"𝟓",
          6:"𝟔",7:"𝟕",8:"𝟖",9:"𝟗"," ":" "
        };
        return t.split('').map(c => map[c] || c).join('');
      };

      let msg = `💖 | ${bold("Waifu Ranking")}:\n\n`;

      ranking.slice(0, 10).forEach((user, index) => {
        const medals = { 0: "🥇", 1: "🥈", 2: "🥉" };
        const prefix = medals[index] || ` ${bold((index + 1).toString())}.`;
        msg += `${prefix} ${bold(user.name)}: ${bold(user.wins.toString())} ${bold("wins")}\n`;
      });

      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    // ========= GAME START =========
    try {
      const apiUrl = await baseApiUrl();
      const response = await axios.get(`${apiUrl}/api/waifu`);
      const { name, imgurLink } = response.data.waifu;

      const imageStream = await axios({
        url: imgurLink,
        method: "GET",
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      api.sendMessage(
        {
          body: "💖 A random waifu has appeared!\nReply with the correct name.",
          attachment: imageStream.data
        },
        event.threadID,
        (err, info) => {
          if (err) return;

          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            messageID: info.messageID,
            waifu: name
          });

          setTimeout(() => api.unsendMessage(info.messageID).catch(()=>{}), 40000);
        },
        event.messageID
      );

    } catch (error) {
      api.sendMessage("Failed to fetch waifu from API.", event.threadID, event.messageID);
    }
  },

  // ================= ANSWER SYSTEM =================
  onReply: async function ({ api, event, Reply, usersData }) {

    const { waifu, author, messageID } = Reply;

    if (event.senderID !== author)
      return api.sendMessage("❌ This is not your quiz baby 🐸", event.threadID, event.messageID);

    await api.unsendMessage(messageID).catch(()=>{});

    const reply = event.body.trim().toLowerCase();
    const correct = waifu.toLowerCase();
    const userData = await usersData.get(author);

    if (reply === correct) {

      const rewardCoins = 5000;
      const rewardExp = 251;

      await usersData.set(author, {
        ...userData,
        money: (userData.money || 0) + rewardCoins,
        exp: (userData.exp || 0) + rewardExp,
        data: {
          ...(userData.data || {}),
          waifuWins: (userData.data?.waifuWins || 0) + 1
        }
      });

      return api.sendMessage(
`✅ | 𝐂𝐨𝐫𝐫𝐞𝐜𝐭 𝐚𝐧𝐬𝐰𝐞𝐫 𝐛𝐚𝐛𝐲! 𝐘𝐨𝐮 𝐞𝐚𝐫𝐧𝐞𝐝 5𝐤 𝐜𝐨𝐢𝐧𝐬 & 251 𝐞𝐱𝐩.`,
        event.threadID,
        event.messageID
      );

    } else {

      return api.sendMessage(
`❌ | 𝐖𝐫𝐨𝐧𝐠 𝐚𝐧𝐬𝐰𝐞𝐫 𝐛𝐚𝐛𝐲 𝐂𝐨𝐫𝐫𝐞𝐜𝐭 𝐚𝐧𝐬𝐰𝐞𝐫: ${waifu}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
