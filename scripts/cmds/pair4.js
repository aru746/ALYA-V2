const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require("path");

module.exports = {
  config: {
    name: "pair4",
    author: 'ARIJIT',
    category: "love"
  },

  onStart: async function({ api, event, usersData }) {
    try {
      const mentions = Object.keys(event.mentions);

      if (mentions.length === 0) {
        return api.sendMessage(
          "❌ Please mention one or two users to create a pair.\n\nExample:\n• pair4 @someone\n• pair4 @user1 @user2",
          event.threadID,
          event.messageID
        );
      }

      // Determine IDs
      let id1, id2;
      if (mentions.length === 1) {
        id1 = event.senderID;
        id2 = mentions[0];
      } else {
        id1 = mentions[0];
        id2 = mentions[1];
      }

      let userData1 = await usersData.get(id1);
      let userData2 = await usersData.get(id2);

      let name1 = userData1.name;
      let name2 = userData2.name;

      // 🔗 Facebook Graph Avatar (ONLY CHANGE)
      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      let avatarURL1 = `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=${accessToken}`;
      let avatarURL2 = `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=${accessToken}`;

      // 🔠 Unicode bold converter
      function toBoldUnicode(name) {
        const boldAlphabet = {
          "a": "𝐚","b": "𝐛","c": "𝐜","d": "𝐝","e": "𝐞","f": "𝐟","g": "𝐠","h": "𝐡","i": "𝐢","j": "𝐣",
          "k": "𝐤","l": "𝐥","m": "𝐦","n": "𝐧","o": "𝐨","p": "𝐩","q": "𝐪","r": "𝐫","s": "𝐬","t": "𝐭",
          "u": "𝐮","v": "𝐯","w": "𝐰","x": "𝐱","y": "𝐲","z": "𝐳",
          "A": "𝐀","B": "𝐁","C": "𝐂","D": "𝐃","E": "𝐄","F": "𝐅","G": "𝐆","H": "𝐇","I": "𝐈","J": "𝐉",
          "K": "𝐊","L": "𝐋","M": "𝐌","N": "𝐍","O": "𝐎","P": "𝐏","Q": "𝐐","R": "𝐑","S": "𝐒","T": "𝐓",
          "U": "𝐔","V": "𝐕","W": "𝐖","X": "𝐗","Y": "𝐘","Z": "𝐙",
          "0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9",
          " ":" ","'":"'","-":"-",".":".",",":",","!":"!","?":"?"
        };
        return name.split('').map(c => boldAlphabet[c] || c).join('');
      }

      const styledName1 = toBoldUnicode(name1);
      const styledName2 = toBoldUnicode(name2);

      // 🔥 Gender check (female sender must be 2nd)
      const senderData = await usersData.get(event.senderID);
      let senderGender = senderData.gender;

      if (senderGender === 1) senderGender = "female";
      else if (senderGender === 2) senderGender = "male";
      else senderGender = "unknown";

      if (senderGender === "female" && id1 === event.senderID) {
        [id1, id2] = [id2, id1];
        [name1, name2] = [name2, name1];
        [avatarURL1, avatarURL2] = [avatarURL2, avatarURL1];
      }

      // 💘 Love % randomizer
      const funnyValues = ["-99", "-100", "0", "101", "0.01", "99.99"];
      const normal = Math.floor(Math.random() * 100) + 1;
      const lovePercent = Math.random() < 0.2
        ? funnyValues[Math.floor(Math.random() * funnyValues.length)]
        : normal;

      // 🎨 Canvas
      const width = 1365, height = 768;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      const background = await loadImage("https://files.catbox.moe/rfv1fa.jpg");
      const avatar1 = await loadImage(avatarURL1);
      const avatar2 = await loadImage(avatarURL2);

      ctx.drawImage(background, 0, 0, width, height);

      function drawCircleImage(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = "white";
        ctx.shadowColor = "white";
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const avatarSize = 210;
      drawCircleImage(avatar1, 220, 95, avatarSize);
      drawCircleImage(avatar2, 920, 130, avatarSize);

      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "yellow";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 8;
      ctx.fillText(name1, 220 + avatarSize / 2, 480);
      ctx.fillText(name2, 920 + avatarSize / 2, 480);

      ctx.font = "bold 42px Arial";
      ctx.fillStyle = "white";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 12;
      ctx.fillText(`${lovePercent}%`, width / 2, 330);
      ctx.shadowBlur = 0;

      const outputPath = path.join(__dirname, 'pair4_output.png');
      const out = fs.createWriteStream(outputPath);
      canvas.createPNGStream().pipe(out);

      out.on('finish', () => {
        const message =
`💞 𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐮𝐥𝐚𝐭𝐢𝐨𝐧𝐬 💞

• ${styledName1} 🎀
• ${styledName2} 🎀

💌 𝐖𝐢𝐬𝐡𝐢𝐧𝐠 𝐲𝐨𝐮 𝐛𝐨𝐭𝐡 𝐚 𝐥𝐢𝐟𝐞𝐭𝐢𝐦𝐞 𝐨𝐟 𝐥𝐨𝐯𝐞 𝐚𝐧𝐝 𝐥𝐚𝐮𝐠𝐡𝐭𝐞𝐫 𝐭𝐨𝐠𝐞𝐭𝐡𝐞𝐫.💕

𝐋𝐨𝐯𝐞 𝐩𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞 ${lovePercent}%🌸`;

        api.sendMessage({
          body: message,
          mentions: [
            { tag: name1, id: id1 },
            { tag: name2, id: id2 }
          ],
          attachment: fs.createReadStream(outputPath)
        }, event.threadID, () => fs.unlinkSync(outputPath), event.messageID);
      });

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ An error occurred: " + error.message, event.threadID, event.messageID);
    }
  }
};
