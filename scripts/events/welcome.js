const { getTime } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

// 🔹 Preload font once
(async () => {
  try {
    const fontPath = path.join(__dirname, "cache", "tt-modernoir-trial.bold.ttf");
    if (!fs.existsSync(fontPath)) {
      console.log("⏬ Downloading welcome font...");
      const fontUrl = "https://github.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/raw/main/fronts/tt-modernoir-trial.bold.ttf";
      const { data } = await axios.get(fontUrl, { responseType: "arraybuffer" });
      await fs.outputFile(fontPath, data);
      console.log("✅ Font downloaded");
    }
    registerFont(fontPath, { family: "ModernoirBold" });
    console.log("✅ Font registered: ModernoirBold");
  } catch (err) {
    console.error("❌ Font preload error:", err);
  }
})();

module.exports = {
  config: {
    name: "welcome",
    version: "3.2",
    author: "MR᭄﹅ MAHABUB﹅ メꪜ + Arijit",
    category: "events"
  },

  langs: {
    en: {
      session1: "morning",
      session2: "noon",
      session3: "afternoon",
      session4: "evening",
      multiple1: "you",
      multiple2: "you guys",
      defaultWelcomeMessage: `𝐇𝐞𝐥𝐥𝐨 {userName}\n𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 {boxName}\n𝐘𝐨𝐮'𝐫𝐞 𝐭𝐡𝐞 {memberCount} 𝐦𝐞𝐦𝐛𝐞𝐫 𝐨𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐣𝐨𝐲 🎉\n━━━━━━━━━━━━━━━━\n📅 {timeNow}`
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    try {
      if (event.logMessageType !== "log:subscribe") return;

      const hours = getTime("HH");
      const { threadID } = event;
      const { nickNameBot } = global.GoatBot.config;
      const prefix = global.utils.getPrefix(threadID);
      const dataAddedParticipants = event.logMessageData.addedParticipants;

      // Bot itself added
      if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
        if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
        return message.send(`>🎀\n𝐓𝐡𝐚𝐧𝐤 𝐲𝐨𝐮 𝐟𝐨𝐫 𝐢𝐧𝐯𝐢𝐭𝐢𝐧𝐠 𝐦𝐞 𝐭𝐨 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩!\n𝐌𝐲 𝐩𝐫𝐞𝐟𝐢𝐱: ${prefix}\n𝐓𝐨 𝐯𝐢𝐞𝐰 𝐭𝐡𝐞 𝐥𝐢𝐬𝐭 𝐨𝐟 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫: ${prefix}𝐡𝐞𝐥𝐩 𝐟𝐨𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬`);
      }

      if (!global.temp.welcomeEvent[threadID])
        global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };

      global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
      clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

      global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
        const threadData = await threadsData.get(threadID);
        if (threadData.settings.sendWelcomeMessage == false) return;

        const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
        const threadName = threadData.threadName;
        const participantIDs = (await api.getThreadInfo(threadID)).participantIDs;
        const memberCount = participantIDs.length;

        const userName = [], mentions = [];
        let multiple = false;
        if (dataAddedParticipants.length > 1) multiple = true;

        for (const user of dataAddedParticipants) {
          userName.push(user.fullName);
          mentions.push({ tag: user.fullName, id: user.userFbId });
        }
        if (userName.length == 0) return;

        let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;
        const form = {
          mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
        };

        const timeNow = new Date().toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });

        welcomeMessage = welcomeMessage
          .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
          .replace(/\{boxName\}|\{threadName\}/g, threadName)
          .replace(/\{memberCount\}/g, memberCount)
          .replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
          .replace(/\{timeNow\}/g, timeNow)
          .replace(
            /\{session\}/g,
            hours <= 10
              ? getLang("session1")
              : hours <= 12
                ? getLang("session2")
                : hours <= 18
                  ? getLang("session3")
                  : getLang("session4")
          );

        // --------- Canvas ---------
        try {
          const userInfo = dataAddedParticipants[0];
          const avatarUrl = `https://graph.facebook.com/${userInfo.userFbId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

          const backgrounds = [
            "https://files.catbox.moe/cj68oa.jpg",
            "https://files.catbox.moe/0n8mmb.jpg",
            "https://files.catbox.moe/hvynlb.jpg",
            "https://files.catbox.moe/leyeuq.jpg",
            "https://files.catbox.moe/7ufcfb.jpg",
            "https://files.catbox.moe/y78bmv.jpg"
          ];
          const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

          const canvas = createCanvas(1000, 500);
          const ctx = canvas.getContext("2d");

          // Background
          const bg = await loadImage((await axios.get(randomBg, { responseType: "arraybuffer" })).data);
          ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

          // Avatar circle with white border
          const avatar = await loadImage((await axios.get(avatarUrl, { responseType: "arraybuffer" })).data);
          ctx.save();
          ctx.beginPath();
          ctx.arc(canvas.width / 2, 160, 100, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(avatar, canvas.width / 2 - 100, 60, 200, 200);

          // White border
          ctx.lineWidth = 8;
          ctx.strokeStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(canvas.width / 2, 160, 100, 0, Math.PI * 2, true);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();

          // Text styling
          ctx.textAlign = "center";
          ctx.shadowColor = "rgba(0,0,0,0.6)";
          ctx.shadowBlur = 6;

          // Username
          ctx.font = "bold 50px ModernoirBold";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(`{ ${userInfo.fullName} }`, canvas.width / 2, 320);

          // Group name
          ctx.font = "bold 35px ModernoirBold";
          ctx.fillStyle = "#ffea00";
          ctx.fillText(threadName, canvas.width / 2, 370);

          // Member count
          ctx.font = "bold 30px ModernoirBold";
          ctx.fillStyle = "#00ffcc";
          ctx.fillText(`You're the ${memberCount} member on this group`, canvas.width / 2, 420);

          // Save image
          const imgPath = path.join(__dirname, "cache", `welcome_${userInfo.userFbId}.png`);
          await fs.ensureDir(path.dirname(imgPath));
          const out = fs.createWriteStream(imgPath);
          const stream = canvas.createPNGStream();
          stream.pipe(out);
          await new Promise((resolve) => out.on("finish", resolve));

          form.body = welcomeMessage;
          form.attachment = fs.createReadStream(imgPath);

          message.send(form, () => fs.unlinkSync(imgPath));
        } catch (err) {
          console.error("❌ Canvas error:", err);
          form.body = welcomeMessage + "\n\n(Canvas failed, sending text only)";
          message.send(form);
        }

        delete global.temp.welcomeEvent[threadID];
      }, 1500);
    } catch (err) {
      console.error("❌ Welcome event error:", err);
    }
  }
};
 
