const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ads",
    version: "1.0",
    author: "Samir B. Thakuri",
    countDown: 1,
    role: 0,
    shortDescription: "Advertisement!",
    longDescription: "Make an advertisement poster with user avatar",
    category: "fun",
    guide: "{pn} [mention|reply|leave_blank]",
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag người bạn muốn tát"
    },
    en: {
      noTag: "You must tag the person you want to advertise"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    try {
      let mention = Object.keys(event.mentions);
      let uid;

      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
      } else if (mention[0]) {
        uid = mention[0];
      } else {
        uid = event.senderID; // default: self
      }

      // get avatar
      let url = await usersData.getAvatarUrl(uid);
      let img = await new DIG.Ad().getImage(url);

      // save temp file
      const pathSave = path.join(__dirname, "tmp", `ads_${Date.now()}.png`);
      fs.ensureDirSync(path.dirname(pathSave));
      fs.writeFileSync(pathSave, Buffer.from(img));

      // reply with image
      message.reply({
        body: "✨ Latest Brand In The Market 🥳",
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));

    } catch (err) {
      console.error("❌ Error in ads command:", err);
      message.reply("⚠️ Failed to create advertisement image.");
    }
  }
};
