const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "badger",
  version: "1.0.2",
  author: "Kuze",
 aliases: ["jannat"],
  cooldowns: 5,
  role: 0,
  shortDescription: "Turns someone into a Badger!",
  longDescription: "Turns mentioned/replied user into a Badger 🦡",
  category: "fun",
  guide: {
    en: "{pn} @mention or reply"
  }
};

module.exports.onStart = async function ({ event, message, usersData }) {
  try {
    let targetID = Object.keys(event.mentions || {})[0];

    if (event.type === "message_reply" && event.messageReply) {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("🦡 | Please tag or reply to someone!");
    }

    // 🔐 Owner Protection
    const ownerID = "61573866391878";
    if (targetID === ownerID) {
      return message.reply("🚫 | You can't turn my owner into a badger 😏");
    }

    const base = path.join(__dirname, "..", "resources");
    const bgPath = path.join(base, "badger.png");
    const avatarPath = path.join(base, `avatar_${targetID}.png`);
    const outputPath = path.join(base, `badger_${targetID}.png`);

    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

    // 🖼 Download Badger Template
    if (!fs.existsSync(bgPath)) {
      const resp = await axios.get(
        "https://files.catbox.moe/v1y0yy.jpg",
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(bgPath, resp.data);
    }

    // 👤 Download User Avatar
    const avatarResp = await axios.get(
      `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    );
    fs.writeFileSync(avatarPath, avatarResp.data);

    // 🎨 Canvas Processing
    const bg = await loadImage(bgPath);
    const avatar = await loadImage(avatarPath);

    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, bg.width, bg.height);

    // 🔥 Perfect Face Placement for this badger image
    const size = 120;
    const x = 263;
    const y = 105;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);

    const userInfo = await usersData.get(targetID);
    const name = userInfo?.name || "Someone";

    await message.reply({
      body: `🤣 ${name} এখন একদম আসল Badger! 🦡`,
      mentions: [{ tag: name, id: targetID }],
      attachment: fs.createReadStream(outputPath)
    });

    // 🧹 Cleanup
    fs.unlinkSync(avatarPath);
    fs.unlinkSync(outputPath);

  } catch (err) {
    console.error("Badger command error:", err);
    return message.reply("❌ | Image generate করতে সমস্যা হয়েছে!");
  }
};
