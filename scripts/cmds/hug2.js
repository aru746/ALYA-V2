const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "hug2",
    aliases: ["hug2", "hugv2", "hugtwo"],
    version: "1.1",
    author: "AceGun + modified",
    countDown: 5,
    role: 0,
    shortDescription: "Hug someone",
    longDescription: "Generate a hug image with a user",
    category: "love",
    guide: "{pn} [mention | reply]"
  },

  onStart: async function ({ message, event, args }) {
    let user1, user2;
    const mentions = Object.keys(event.mentions);

    // 1️⃣ Reply system
    if (event.messageReply) {
      user1 = event.senderID; 
      user2 = event.messageReply.senderID; 
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
    // 3️⃣ Fallback (self hug 😅)
    else {
      user1 = event.senderID;
      user2 = event.senderID;
    }

    try {
      const pathImg = await generateHug(user1, user2);
      await message.reply({
        body: "🤗 You Are The Best🥰",
        attachment: fs.createReadStream(pathImg)
      });
      fs.unlinkSync(pathImg);
    } catch (e) {
      console.error(e);
      message.reply("❌ | Failed to generate hug image.");
    }
  }
};

async function generateHug(one, two) {
  let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avone.circle();
  let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
  avtwo.circle();

  let img = await jimp.read("https://files.catbox.moe/5e9imt.jpg");
  img.resize(720, 696)
     .composite(avone.resize(120, 120), 240, 300)
     .composite(avtwo.resize(120, 120), 280, 130);

  const pathSave = `./tmp/${one}_${two}_hug.png`;
  await img.writeAsync(pathSave);
  return pathSave;
}
