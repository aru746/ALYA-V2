const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require("path");

module.exports = {
  config: {
    name: "pair2",
    author: 'Nyx x Ariyan + NIROB + modified by Arijit',
    category: "love",
    countDown: 10
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderData = await usersData.get(event.senderID);
      const senderName = senderData.name;
      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      const myData = users.find(user => user.id === event.senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage("❌ Undefined gender, cannot find match.", event.threadID, event.messageID);
      }

      const myGender = myData.gender.toUpperCase();
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== event.senderID);
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== event.senderID);
      } else {
        return api.sendMessage("❌ Undefined gender, cannot find match.", event.threadID, event.messageID);
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage("😔 No suitable match found in the group.", event.threadID, event.messageID);
      }

      const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      const matchName = selectedMatch.name;
      const lovePercentage = Math.floor(Math.random() * 100) + 1;

      // 🔠 Unicode bold converter
      function toBoldUnicode(name) {
        const boldAlphabet = {
          "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
          "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
          "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳", "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃",
          "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉", "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍",
          "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓", "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗",
          "Y": "𝐘", "Z": "𝐙", "0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8",
          "9": "9", " ": " ", "'": "'", ",": ",", ".": ".", "-": "-", "!": "!", "?": "?"
        };
        return name.split('').map(char => boldAlphabet[char] || char).join('');
      }

      const styledName1 = toBoldUnicode(senderName);
      const styledName2 = toBoldUnicode(matchName);

      // 🖼️ Canvas setup
      const width = 800, height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      const background = await loadImage("https://i.postimg.cc/4xSzJ7SZ/Picsart-25-08-15-19-44-03-606.jpg");
      const senderAvatar = await loadImage(await usersData.getAvatarUrl(event.senderID));
      const matchAvatar = await loadImage(await usersData.getAvatarUrl(selectedMatch.id));

      ctx.drawImage(background, 0, 0, width, height);
      ctx.drawImage(senderAvatar, 385, 40, 170, 170);
      ctx.drawImage(matchAvatar, width - 213, 190, 180, 170);

      const outputPath = path.join(__dirname, 'pair_output.png');
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on('finish', () => {
        const message = `🥰 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥 𝐏𝐚𝐢𝐫𝐢𝐧𝐠 💞\n` +
                        `• ${styledName1} 🎀\n` +
                        `• ${styledName2} 🎀\n\n` +
                        `💌 𝐖𝐢𝐬𝐡 𝐲𝐨𝐮 𝐭𝐰𝐨 𝐡𝐮𝐧𝐝𝐫𝐞𝐝 𝐲𝐞𝐚𝐫𝐬 𝐨𝐟 𝐡𝐚𝐩𝐩𝐢𝐧𝐞𝐬𝐬 💕\n\n` +
                        `💙 𝐋𝐨𝐯𝐞 𝐩𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: ${lovePercentage}%`;

        api.sendMessage({
          body: message,
          attachment: fs.createReadStream(outputPath)
        }, event.threadID, () => fs.unlinkSync(outputPath), event.messageID);
      });

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ An error occurred: " + error.message, event.threadID, event.messageID);
    }
  }
};
