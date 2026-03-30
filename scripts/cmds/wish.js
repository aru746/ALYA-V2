const axios = require("axios");

// Unicode bold converter
function toBoldUnicode(name) {
  const boldAlphabet = {
    "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
    "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
    "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳", 
    "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃", "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉",
    "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍", "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓",
    "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗", "Y": "𝐘", "Z": "𝐙",
    "0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
    " ": " ", "'": "'", ",": ",", ".": ".", "-": "-", "!": "!", "?": "?"
  };
  return name.split('').map(char => boldAlphabet[char] || char).join('');
}

const mahmhd = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "wish",
    aliases: ["wish"],
    version: "2.4",
    role: 0,
    author: "Arijit",
    category: "group",
    countDown: 5,
    guide: { en: "{p}{n} @mention or reply to a message" },
  },

  onStart: async function ({ api, event }) {
    let mentionId;
    let taggedUserName;

    try {
      // If command is used as a reply
      if (event.messageReply) {
        mentionId = event.messageReply.senderID;
        const userInfo = await api.getUserInfo(mentionId);
        taggedUserName = userInfo[mentionId].name;
      } 
      // If command is used by mentioning someone
      else if (event.mentions && Object.keys(event.mentions).length > 0) {
        mentionId = Object.keys(event.mentions)[0];
        taggedUserName = event.mentions[mentionId];
      } 
      // No mention or reply
      else {
        return api.sendMessage(
          "❌ You need to tag someone or reply to their message to wish!",
          event.threadID,
          event.messageID
        );
      }

      // Bold the user name
      const boldName = toBoldUnicode(taggedUserName);

      // Images array (randomly pick one)
      const images = [
        "https://files.catbox.moe/dobpf4.jpg",
        "https://files.catbox.moe/ab7ewg.jpg",
        "https://files.catbox.moe/1q1afc.jpg",
        "https://files.catbox.moe/71cng1.jpg"
      ];
      const imageUrl = images[Math.floor(Math.random() * images.length)];

      // Birthday message with bold mention
      const birthdayMessage = {
        body: `> ${boldName}\n𝗛𝗮𝗽𝗽𝘆 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆🎂🥳\n\n𝗠𝗮𝗻𝘆 𝗠𝗮𝗻𝘆 𝗵𝗮𝗽𝗽𝘆 𝗿𝗲𝘁𝘂𝗿𝗻𝘀 𝗼𝗳 𝘁𝗵𝗲 𝗱𝗮𝘆🌸💫\n𝗜 𝘄𝗶𝘀𝗵 𝗲𝘃𝗿𝘆 𝗺𝗼𝗺𝗲𝗻𝘁 𝗼𝗳 𝘆𝗼𝘂𝗿 𝗹𝗶𝗳𝗲 𝘁𝗼 𝗯𝗲 𝗛𝗮𝗽𝗽𝘆.\n𝗠𝗮𝘆 𝗲𝘃𝗲𝗿𝘆𝘁𝗵𝗶𝗻𝗴 𝗯𝗲 𝗻𝗲𝘄 𝗼𝗻 𝘁𝗵𝗶𝘀 𝗱𝗮𝘆.`,
        mentions: [
          {
            tag: boldName,
            id: mentionId,
            fromIndex: 2, // position of the mention in the message body (after "> ")
            length: boldName.length
          }
        ],
        attachment: await global.utils.getStreamFromURL(imageUrl)
      };

      // Send message
      api.sendMessage(birthdayMessage, event.threadID, event.messageID);

    } catch (err) {
      api.sendMessage(`❌ Something went wrong: ${err.message}`, event.threadID, event.messageID);
    }
  },
};
