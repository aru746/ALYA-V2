const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const jimp = require("jimp");

const OWNER_ID = "61573866391878"; // ✅ Your UID

module.exports = {
  config: {
    name: "groupkutta",
    aliases: ["gk"],
    version: "1.1.5",
    author: "Arijit & NAFIJ (Updated)",
    countDown: 5,
    role: 0,
    shortDescription: "Make a group of kutte 🐶",
    longDescription: "Replace dog heads in image with random avatars and the tagged/replied user as the leader kutta",
    category: "fun",
    guide: {
      en: "{pn} @mention or reply to someone",
    },
  },

  onStart: async function ({ event, message, api }) {
    let targetID = Object.keys(event.mentions)[0];
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) return message.reply("🐶 Tag or reply to someone to make them the main kutta!");

    if (targetID === OWNER_ID) {
      return message.reply("🚫 You deserve this, not my owner! 😙");
    }

    const baseFolder = path.join(__dirname, "cache");
    const bgPath = path.join(baseFolder, "group_kutta.jpg");
    const outputPath = path.join(baseFolder, `groupkutta_${Date.now()}.png`);

    try {
      if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder, { recursive: true });

      // ✅ Background handling
      if (!fs.existsSync(bgPath)) {
        const kuttaURL = "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/kutta.jpeg";
        const response = await axios.get(kuttaURL, { responseType: "arraybuffer" });
        fs.writeFileSync(bgPath, Buffer.from(response.data));
      }

      const bg = await jimp.read(bgPath);
      bg.resize(619, 495);

      const threadInfo = await api.getThreadInfo(event.threadID);
      const allParticipants = threadInfo.participantIDs.filter(
        id => id !== targetID && id !== api.getCurrentUserID() && id !== OWNER_ID
      );

      if (allParticipants.length < 4) {
        return message.reply("❌ Group-e minimun 5 jon thaka lagbe (owner bade).");
      }

      const random4 = allParticipants.sort(() => 0.5 - Math.random()).slice(0, 4);
      const allIDs = [...random4, targetID];

      const positions = [
        { x: 18, y: 60, size: 60 },
        { x: 70, y: 185, size: 70 },
        { x: 210, y: 145, size: 80 },
        { x: 345, y: 120, size: 80 },
        { x: 370, y: 320, size: 105 } // Leader
      ];

      // ✅ Using your working graph API with token
      const TOKEN = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

      for (let i = 0; i < allIDs.length; i++) {
        try {
          const id = allIDs[i];
          const pos = positions[i];
          
          const avatarURL = `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=${TOKEN}`;
          const avatarData = await axios.get(avatarURL, { responseType: "arraybuffer" });
          const avatar = await jimp.read(Buffer.from(avatarData.data));
          
          avatar.resize(pos.size, pos.size).circle();
          bg.composite(avatar, pos.x, pos.y);
        } catch (err) {
          console.error(`Error loading avatar for ${allIDs[i]}`);
          continue;
        }
      }

      await bg.writeAsync(outputPath);

      const userInfo = await api.getUserInfo(targetID);
      const tagName = userInfo[targetID]?.name || "Kutta Leader";

      await message.reply({
        body: `🤣🐕 Ei naw group kutta gang! Leader holo: ${tagName}`,
        attachment: fs.createReadStream(outputPath)
      }, () => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });

    } catch (err) {
      console.error(err);
      return message.reply("❌ Error: Image process korte somossya hochhe.");
    }
  }
};
