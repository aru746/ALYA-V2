const axios = require("axios");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "4.0",
    author: "MahMUD + Arijit",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn} | {pn} en | {pn} list | {pn} list 2"
    }
  },

  onStart: async function ({ api, event, usersData, args }) {
    try {

      // =========================
      // RANKING SYSTEM
      // =========================
      if (args[0] && args[0].toLowerCase() === "list") {

        const page = parseInt(args[1]) || 1;
        const perPage = 30;

        const allUsers = await usersData.getAll();
        const ranking = [];

        for (const user of allUsers) {
          if (user.data?.quizWins > 0) {
            ranking.push({
              name: user.name || "Unknown",
              wins: user.data.quizWins
            });
          }
        }

        ranking.sort((a, b) => b.wins - a.wins);

        const totalPages = Math.ceil(ranking.length / perPage);
        const start = (page - 1) * perPage;
        const sliced = ranking.slice(start, start + perPage);

        if (!sliced.length) {
          return api.sendMessage("❌ No ranking data found.", event.threadID, event.messageID);
        }

        // Bold Converter
        function toBoldUnicode(text) {
          const boldAlphabet = {
            "a":"𝐚","b":"𝐛","c":"𝐜","d":"𝐝","e":"𝐞","f":"𝐟","g":"𝐠","h":"𝐡","i":"𝐢","j":"𝐣",
            "k":"𝐤","l":"𝐥","m":"𝐦","n":"𝐧","o":"𝐨","p":"𝐩","q":"𝐪","r":"𝐫","s":"𝐬","t":"𝐭",
            "u":"𝐮","v":"𝐯","w":"𝐰","x":"𝐱","y":"𝐲","z":"𝐳",
            "A":"𝐀","B":"𝐁","C":"𝐂","D":"𝐃","E":"𝐄","F":"𝐅","G":"𝐆","H":"𝐇","I":"𝐈","J":"𝐉",
            "K":"𝐊","L":"𝐋","M":"𝐌","N":"𝐍","O":"𝐎","P":"𝐏","Q":"𝐐","R":"𝐑","S":"𝐒","T":"𝐓",
            "U":"𝐔","V":"𝐕","W":"𝐖","X":"𝐗","Y":"𝐘","Z":"𝐙",
            "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓",
            "6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"," ":" "
          };
          return text.split('').map(c => boldAlphabet[c] || c).join('');
        }

        let msg = `👑 | ${toBoldUnicode("Quiz Ranking")} (${page}/${totalPages}):\n\n`;

        sliced.forEach((user, index) => {

          const position = start + index + 1;

          const medals = {
            1: "🥇",
            2: "🥈",
            3: "🥉"
          };

          const prefix = medals[position] || ` ${toBoldUnicode(position.toString())}.`;

          const styledName = toBoldUnicode(user.name);
          const styledWins = toBoldUnicode(user.wins.toString());
          const styledWord = toBoldUnicode("wins");

          msg += `${prefix} ${styledName}: ${styledWins} ${styledWord}\n`;
        });

        if (page < totalPages) {
          msg += `\n• Type: quiz list ${page + 1} to see next page`;
        }

        return api.sendMessage(msg, event.threadID, event.messageID);
      }

      // =========================
      // QUIZ SYSTEM
      // =========================

      const input = args.join("").toLowerCase() || "bn";
      const category =
        input === "en" || input === "english"
          ? "english"
          : "bangla";

      const apiUrl = await mahmud();
      const res = await axios.get(`${apiUrl}/api/quiz?category=${category}`);
      const quiz = res.data;

      if (!quiz) {
        return api.sendMessage("❌ No quiz available.", event.threadID, event.messageID);
      }

      const { question, correctAnswer, options } = quiz;
      const { a, b, c, d } = options;

      const quizMsg = {
        body: `╭──✦ ${question}
├‣ 𝗔) ${a}
├‣ 𝗕) ${b}
├‣ 𝗖) ${c}
├‣ 𝗗) ${d}
╰───────────────
Reply with your answer. (40s time)`
      };

      api.sendMessage(quizMsg, event.threadID, (error, info) => {

        global.GoatBot.onReply.set(info.messageID, {
          type: "reply",
          commandName: this.config.name,
          author: event.senderID,
          messageID: info.messageID,
          correctAnswer
        });

        setTimeout(() => {
          api.unsendMessage(info.messageID).catch(() => {});
        }, 40000);

      }, event.messageID);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Failed to fetch quiz.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ event, api, Reply, usersData }) {

    const { correctAnswer, author } = Reply;

    if (event.senderID !== author)
      return api.sendMessage("❌ This is not your quiz.", event.threadID, event.messageID);

    await api.unsendMessage(Reply.messageID).catch(() => {});

    const userReply = event.body.trim().toLowerCase();
    const userData = await usersData.get(author);

    if (userReply === correctAnswer.toLowerCase()) {

      const rewardCoins = 5000;
      const rewardExp = 251;

      await usersData.set(author, {
        ...userData,
        money: (userData.money || 0) + rewardCoins,
        exp: (userData.exp || 0) + rewardExp,
        data: {
          ...(userData.data || {}),
          quizWins: (userData.data?.quizWins || 0) + 1
        }
      });

      api.sendMessage(
`✅ | 𝐂𝐨𝐫𝐫𝐞𝐜𝐭 𝐚𝐧𝐬𝐰𝐞𝐫 𝐛𝐚𝐛𝐲! 𝐘𝐨𝐮 𝐞𝐚𝐫𝐧𝐞𝐝 5𝐤 𝐜𝐨𝐢𝐧𝐬 & 251 𝐞𝐱𝐩.`,
        event.threadID,
        event.messageID
      );

    } else {

      api.sendMessage(
`❌ | 𝐖𝐫𝐨𝐧𝐠 𝐚𝐧𝐬𝐰𝐞𝐫 𝐛𝐚𝐛𝐲! 𝐂𝐨𝐫𝐫𝐞𝐜𝐭 𝐚𝐧𝐬𝐰𝐞𝐫: ${correctAnswer}`,
        event.threadID,
        event.messageID
      );

    }
  }
};
