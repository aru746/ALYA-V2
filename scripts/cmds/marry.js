const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "marry",
    version: "1.1",
    author: "AceGun + modified",
    countDown: 5,
    role: 0,
    shortDescription: "Get a wife",
    longDescription: "Generate a cute marry image with a user",
    category: "love",
    guide: "{pn} [mention | reply]"
  },

  onStart: async function ({ message, event, args }) {
    let user1, user2;
    const mentions = Object.keys(event.mentions);

    // 1️⃣ Reply system
    if (event.messageReply) {
      user1 = event.senderID; // sender
      user2 = event.messageReply.senderID; // replied user
    }
    // 2️⃣ Mentions
    else if (mentions.length > 0) {
      if (mentions.length === 1) {
        user1 = event.senderID;
        user2 = mentions[0];
      } else {
        user1 = mentions[0];
        user2 = mentions[1];
      }
    }
    // 3️⃣ Fallback to self + self
    else {
      user1 = event.senderID;
      user2 = event.senderID;
    }

    try {
      const pathImg = await generateMarry(user1, user2);
      await message.reply({
        body: "「 𝐋𝐨𝐯𝐞 𝐲𝐨𝐮 𝐁𝐛𝐞🥰❤️ 」",
        attachment: fs.createReadStream(pathImg)
      });
      fs.unlinkSync(pathImg);
    } catch (e) {
      console.error(e);
      message.reply("❌ | Failed to generate marry image.");
    }
  }
};

async function generateMarry(one, two) {
  let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avone.circle();
  let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avtwo.circle();

  let img = await jimp.read("https://i.postimg.cc/26f9zkTc/marry.png");
  img.resize(432, 280)
     .composite(avone.resize(60, 60), 189, 15)
     .composite(avtwo.resize(60, 60), 122, 25);

  const pathSave = `./tmp/${one}_${two}_marry.png`;
  await img.writeAsync(pathSave);
  return pathSave;
}
