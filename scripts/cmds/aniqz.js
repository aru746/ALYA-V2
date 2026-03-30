const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "aniqz",
    aliases: ["animeqz"],
    version: "2.0",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "game",
    guide: { en: "{pn} [en/bn] | {pn} list" }
  },

  // ================= START / LIST =================
  onStart: async function ({ api, event, usersData, args }) {

    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
    }

    // ===== RANK LIST =====
    if (args[0] && args[0].toLowerCase() === "list") {

      const allUsers = await usersData.getAll();
      const ranking = [];

      for (const user of allUsers) {
        if (user.data?.aniWins > 0) {
          ranking.push({
            name: user.name || "Unknown",
            wins: user.data.aniWins
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

      let msg = `👑 | ${bold("Anime Quiz Ranking")}:\n\n`;

      ranking.slice(0, 10).forEach((user, index) => {
        const medals = { 0: "🥇", 1: "🥈", 2: "🥉" };
        const prefix = medals[index] || ` ${bold((index + 1).toString())}.`;
        msg += `${prefix} ${bold(user.name)}: ${bold(user.wins.toString())} ${bold("wins")}\n`;
      });

      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    // ===== QUIZ START =====
    try {
      const input = args[0]?.toLowerCase() || "bn";
      const category = (input === "en" || input === "english") ? "english" : "bangla";

      const apiUrl = await mahmud();
      const res = await axios.get(`${apiUrl}/api/aniqz2?category=${category}`);
      const quiz = res.data?.data || res.data;

      if (!quiz || !quiz.question)
        return api.sendMessage("❌ No quiz available.", event.threadID, event.messageID);

      const { question, correctAnswer, options } = quiz;
      const { a, b, c, d } = options;

      const quizMsg = {
        body: `\n╭──✦ ${question}
├‣ 𝗔) ${a}
├‣ 𝗕) ${b}
├‣ 𝗖) ${c}
├‣ 𝗗) ${d}
╰──────────────────‣
𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫.`
      };

      api.sendMessage(quizMsg, event.threadID, (err, info) => {
        if (err) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          correctAnswer,
          messageID: info.messageID
        });

        setTimeout(() => api.unsendMessage(info.messageID).catch(()=>{}), 40000);
      }, event.messageID);

    } catch (error) {
      api.sendMessage("🥹 error, contact MahMUD.", event.threadID, event.messageID);
    }
  },

  // ================= ANSWER SYSTEM =================
  onReply: async function ({ event, api, Reply, usersData }) {

    const { correctAnswer, author, messageID } = Reply;

    if (event.senderID !== author)
      return api.sendMessage("⚠️ This quiz isn’t yours baby 🐸", event.threadID, event.messageID);

    await api.unsendMessage(messageID).catch(()=>{});

    const userReply = event.body.trim().toLowerCase();
    const correct = correctAnswer.toLowerCase();
    const userData = await usersData.get(author);

    if (userReply === correct || userReply === correct[0]) {

      const rewardCoins = 5000;
      const rewardExp = 251;

      await usersData.set(author, {
        ...userData,
        money: (userData.money || 0) + rewardCoins,
        exp: (userData.exp || 0) + rewardExp,
        data: {
          ...(userData.data || {}),
          aniWins: (userData.data?.aniWins || 0) + 1
        }
      });

      return api.sendMessage(
`✅ | Correct answer baby!
You earned 5k coins & 251 exp.`,
        event.threadID,
        event.messageID
      );

    } else {

      return api.sendMessage(
`❌ | Wrong answer baby
The Correct answer was: ${correctAnswer}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
