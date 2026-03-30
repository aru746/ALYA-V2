const fs = require("fs");

module.exports = {
  config: {
    name: "wordgame",
    aliases: ["word"],
    version: "2.0",
    author: "MahMUD",
    role: 0,
    countdown: 10,
    category: "game",
    guide: {
      en: "wordgame → Start game\nwordgame list → View ranking"
    }
  },

  // ================= START / LIST =================
  onStart: async function ({ message, event, usersData, args }) {

    const obfuscatedAuthor = String.fromCharCode(77,97,104,77,85,68);
    if (module.exports.config.author !== obfuscatedAuthor) {
      return message.reply("❌ You are not authorized to change the author name.");
    }

    // ========= RANK LIST =========
    if (args[0] && args[0].toLowerCase() === "list") {

      const allUsers = await usersData.getAll();
      const ranking = [];

      for (const user of allUsers) {
        if (user.data?.wordWins > 0) {
          ranking.push({
            name: user.name || "Unknown",
            wins: user.data.wordWins
          });
        }
      }

      ranking.sort((a, b) => b.wins - a.wins);

      if (!ranking.length)
        return message.reply("❌ No ranking data found.");

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

      let msg = `📝 | ${bold("Word Game Ranking")}:\n\n`;

      ranking.slice(0,10).forEach((user,index)=>{
        const medals = {0:"🥇",1:"🥈",2:"🥉"};
        const prefix = medals[index] || ` ${bold((index+1).toString())}.`;
        msg += `${prefix} ${bold(user.name)}: ${bold(user.wins.toString())} ${bold("wins")}\n`;
      });

      return message.reply(msg);
    }

    // ========= GAME START =========
    const words = JSON.parse(fs.readFileSync("words.json"));
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const shuffledWord = shuffleWord(randomWord);

    message.reply(`📝 Unscramble this word:\n\n"${shuffledWord}"`, (err, info) => {
      if (err) return;

      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        answer: randomWord
      });

      setTimeout(() => message.unsend(info.messageID).catch(()=>{}), 40000);
    });
  },

  // ================= ANSWER SYSTEM =================
  onReply: async function ({ message, Reply, event, usersData }) {

    const { author, messageID, answer } = Reply;

    if (event.senderID !== author)
      return message.reply("❌ This isn't your word game!");

    await message.unsend(messageID).catch(()=>{});
    global.GoatBot.onReply.delete(messageID);

    const reply = formatText(event.body);
    const correct = formatText(answer);
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
          wordWins: (userData.data?.wordWins || 0) + 1
        }
      });

      return message.reply(
`✅ | 𝐂𝐨𝐫𝐫𝐞𝐜𝐭 𝐚𝐧𝐬𝐰𝐞𝐫 𝐛𝐚𝐛𝐲! 𝐘𝐨𝐮 𝐞𝐚𝐫𝐧𝐞𝐝 5𝐤 𝐜𝐨𝐢𝐧𝐬 & 251 𝐞𝐱𝐩.`
      );

    } else {

      return message.reply(
`❌ | 𝐖𝐫𝐨𝐧𝐠 𝐚𝐧𝐬𝐰𝐞𝐫 𝐛𝐚𝐛𝐲! 𝐂𝐨𝐫𝐫𝐞𝐜𝐭 𝐚𝐧𝐬𝐰𝐞𝐫: ${answer}`
      );
    }
  }
};

// ================= HELPERS =================

function shuffleWord(word) {
  const shuffled = word.split('').sort(() => 0.5 - Math.random()).join('');
  if (shuffled === word) return shuffleWord(word);
  return shuffled;
}

function formatText(text) {
  return text.normalize("NFD").toLowerCase();
}
