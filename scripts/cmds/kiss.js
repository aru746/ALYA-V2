const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "kiss",
    aliases: ["kiss"],
    version: "1.1",
    author: "NIB",
    countDown: 5,
    role: 0,
    shortDescription: "KISS",
    longDescription: "Generate a kiss image between two users",
    category: "love",
    guide: "{pn} [mention | reply]"
  },

  onStart: async function ({ api, message, event, usersData }) {
    let user1, user2;
    const mentions = Object.keys(event.mentions);

    // Case 1: reply to someone
    if (event.messageReply) {
      user1 = event.messageReply.senderID;
      user2 = event.senderID; // self
    }
    // Case 2: mentions
    else if (mentions.length > 0) {
      if (mentions.length === 1) {
        user1 = mentions[0];
        user2 = event.senderID; // self
      } else {
        user1 = mentions[0];
        user2 = mentions[1];
      }
    }
    // Case 3: fallback to self + self
    else {
      user1 = event.senderID;
      user2 = event.senderID;
    }

    try {
      const avatarURL1 = await usersData.getAvatarUrl(user1);
      const avatarURL2 = await usersData.getAvatarUrl(user2);
      const img = await new DIG.Kiss().getImage(avatarURL1, avatarURL2);
      const pathSave = `${__dirname}/tmp/${user1}_${user2}_kiss.png`;

      fs.writeFileSync(pathSave, Buffer.from(img));

      await message.reply({
        body: "😘😘",
        attachment: fs.createReadStream(pathSave)
      });

      fs.unlinkSync(pathSave);
    } catch (e) {
      console.error(e);
      message.reply("❌ | Failed to generate kiss image.");
    }
  }
};
