const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "beautiful",
    aliases: ["beauty"],
    version: "1.1",
    author: "𝐀𝐒𝐈𝐅 𝐱𝟔𝟗",
    countDown: 1,
    role: 0,
    shortDescription: "Beautiful!",
    longDescription: "Generate a beautiful image of a user",
    category: "fun",
    guide: "{pn} [mention | reply | leave blank]",
    envConfig: {
      deltaNext: 5
    }
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag người bạn muốn làm đẹp"
    },
    en: {
      noTag: "You must tag, reply to, or leave blank to use yourself"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    let uid;

    // 1️⃣ Reply user
    if (event.messageReply) {
      uid = event.messageReply.senderID;
    }
    // 2️⃣ Mentioned user
    else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    }
    // 3️⃣ Default to self
    else {
      uid = event.senderID;
    }

    try {
      const avatarURL = await usersData.getAvatarUrl(uid);
      const img = await new DIG.Beautiful().getImage(avatarURL);
      const pathSave = `${__dirname}/tmp/${uid}_Beautiful.png`;

      fs.writeFileSync(pathSave, Buffer.from(img));

      await message.reply({
        attachment: fs.createReadStream(pathSave)
      });

      fs.unlinkSync(pathSave);
    } catch (e) {
      console.error(e);
      message.reply("❌ | Failed to generate Beautiful image.");
    }
  }
};
