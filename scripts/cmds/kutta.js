const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "kutta",
  version: "3.2.0",
  author: "Arijit",
  cooldowns: 10,
  role: 0,
  shortDescription: "Mention দে তারে যারে kutta বানাবি 🐶",
  longDescription: "Overlay user's avatar onto the body of a dog",
  category: "fun",
  guide: {
    en: "{pn} [reply/mention/none] → Turn into Kutta",
  },
};

module.exports.onStart = async function ({ api, event, message }) {
  try {
    const mentions = event.mentions || {};
    let targetID =
      Object.keys(mentions)[0] ||
      (event.messageReply && event.messageReply.senderID) ||
      event.senderID;

    const senderID = event.senderID;

    // 🚫 Owner protection
    if (targetID === "61573866391878" && senderID !== "61573866391878") {
      return message.reply("🚫 You deserve this, not my owner! 😙");
    }

    const base = path.join(__dirname, "..", "resources");
    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

    const bgPath = path.join(base, "kutta_bg.png");
    const avatarPath = path.join(base, `avatar_${targetID}.png`);
    const outputPath = path.join(base, `kutta_${targetID}.png`);

    // Download Kutta template if missing
    if (!fs.existsSync(bgPath)) {
      const resp = await axios.get(
        "https://files.catbox.moe/q2c9wl.jpeg",
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(bgPath, resp.data);
    }

    // Download avatar
    const avatarResp = await axios.get(
      `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    );

    fs.writeFileSync(avatarPath, avatarResp.data);

    const bg = await loadImage(bgPath);
    const avatar = await loadImage(avatarPath);

    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, bg.width, bg.height);

    // Avatar position (goru command-এর default position)
    const size = 140;
    const x = 355;
    const y = 305;

    ctx.save();
    ctx.beginPath();
    ctx.arc(
      x + size / 2,
      y + size / 2,
      size / 2,
      0,
      Math.PI * 2,
      true
    );
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    const userInfo = await api.getUserInfo(targetID);
    const name = userInfo[targetID]?.name || "Someone";

    await message.reply({
      body: `🐶 ${name} হলো একটি আসল Kutta 🤣`,
      mentions: [{ tag: name, id: targetID }],
      attachment: fs.createReadStream(outputPath),
    });

    fs.unlinkSync(avatarPath);
    fs.unlinkSync(outputPath);

  } catch (err) {
    console.error("Kutta command error:", err);
    return message.reply("❌ Something went wrong while generating the Kutta image.");
  }
};
