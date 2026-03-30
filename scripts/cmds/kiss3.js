const fs = require("fs-extra");
const axios = require("axios");
const Canvas = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "kiss3",
    aliases: ["kiss3"],
    version: "2.2",
    author: "Efat",
    countDown: 5,
    role: 0,
    shortDescription: "Kiss with custom image",
    longDescription: "Generate a kiss image with the mentioned or replied user using a custom background.",
    category: "love",
    guide: "{pn} @mention (or reply to someone's message)"
  },

  onStart: async function ({ api, message, event, usersData }) {
    let senderID = event.senderID;
    let mentionedID;

    // ✅ Priority: mention > reply
    const mention = Object.keys(event.mentions);
    if (mention.length > 0) {
      mentionedID = mention[0];
    } else if (event.messageReply) {
      mentionedID = event.messageReply.senderID;
    }

    if (!mentionedID) {
      return message.reply("👉 Please mention or reply to someone to kiss 💋.");
    }

    try {
      // Get avatar URLs
      const avatar1 = await usersData.getAvatarUrl(mentionedID); // left
      const avatar2 = await usersData.getAvatarUrl(senderID);    // right

      // Load avatars
      const [avatarImg1, avatarImg2] = await Promise.all([
        Canvas.loadImage(avatar1),
        Canvas.loadImage(avatar2)
      ]);

      // Load and scale background
      const bgUrl = "https://bit.ly/44bRRQG";
      const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer" });
      const bg = await Canvas.loadImage(bgRes.data);

      // Set new canvas size
      const canvasWidth = 900;
      const canvasHeight = 600;

      const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Draw scaled background
      ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);

      // Avatar settings
      const avatarSize = 230;
      const y = canvasHeight / 2 - avatarSize - 90; // upward shift

      // Left (mentioned/replied user)
      ctx.save();
      ctx.beginPath();
      ctx.arc(150 + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg1, 150, y, avatarSize, avatarSize);
      ctx.restore();

      // Right (sender)
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasWidth - 150 - avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg2, canvasWidth - 150 - avatarSize, y, avatarSize, avatarSize);
      ctx.restore();

      // Save and send image
      const imgPath = path.join(__dirname, "tmp", `${senderID}_${mentionedID}_kiss.png`);
      await fs.ensureDir(path.dirname(imgPath));
      fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

      message.reply({
        body: `💋 A lovely kiss from @${(await usersData.getName(senderID))} to @${(await usersData.getName(mentionedID))}`,
        mentions: [
          { tag: await usersData.getName(senderID), id: senderID },
          { tag: await usersData.getName(mentionedID), id: mentionedID }
        ],
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));

    } catch (err) {
      console.error("Error in kiss3 command:", err);
      message.reply("❌ There was an error creating the kiss image.");
    }
  }
};
