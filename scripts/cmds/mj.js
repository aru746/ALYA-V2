const axios = require("axios");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "mj",
    version: "3.0",
    role: 2,
    author: "Ariyan",
    countDown: 30,
    category: "imagine"
  },

  onStart: async function ({ api, event, args, message }) {
    if (!args.length) return message.reply("Please provide a prompt.");

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const prompt = args.join(" ");

      const res = await axios.post(
        "http://45.130.164.219:3000/generate",
        { prompt },
        {
          headers: { "x-api-key": "Maisha" },
          timeout: 120000
        }
      );

      if (!res.data?.success) {
        return message.reply("Generation failed.");
      }

      const urls = res.data.images?.slice(0, 4);
      if (!urls || urls.length < 4) {
        return message.reply("Generation failed.");
      }

      const buffers = await Promise.all(
        urls.map(u =>
          axios.get(u, { responseType: "arraybuffer" })
            .then(r => Buffer.from(r.data))
        )
      );

      const meta = await sharp(buffers[0]).metadata();
      const w = meta.width;
      const h = meta.height;

      const grid = await sharp({
        create: {
          width: w * 2,
          height: h * 2,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
      })
        .composite([
          { input: buffers[0], left: 0, top: 0 },
          { input: buffers[1], left: w, top: 0 },
          { input: buffers[2], left: 0, top: h },
          { input: buffers[3], left: w, top: h }
        ])
        .png()
        .toBuffer();

      const file = path.join(__dirname, `mj_${Date.now()}.png`);
      fs.writeFileSync(file, grid);

      await new Promise(resolve => {
        api.sendMessage(
          {
            body: `✨ MIDJOURNEY RESULT\nReply with U1 / U2 / U3 / U4 to UPSCALE.`,
            attachment: fs.createReadStream(file)
          },
          event.threadID,
          (err, info) => {
            fs.unlinkSync(file);
            if (info?.messageID) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: "mj",
                senderID: event.senderID,
                buffers,
                w,
                h
              });
            }
            resolve();
          },
          event.messageID
        );
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (e) {
      message.reply("Generation failed.");
    }
  },

  onReply: async function ({ api, event, message }) {
    const rep = global.GoatBot.onReply.get(event.messageReply?.messageID);
    if (!rep || rep.senderID !== event.senderID) return;

    const map = { U1: 0, U2: 1, U3: 2, U4: 3 };
    const cmd = event.body.trim().toUpperCase();

    if (!(cmd in map)) return message.reply("Send U1, U2, U3 or U4.");

    try {
      const idx = map[cmd];
      const { buffers, w, h } = rep;

      const upscaled = await sharp(buffers[idx])
        .resize(w * 2, h * 2, { kernel: sharp.kernel.lanczos3 })
        .png()
        .toBuffer();

      const file = path.join(__dirname, `up_${Date.now()}.png`);
      fs.writeFileSync(file, upscaled);

      api.sendMessage(
        {
          body: `🖼️ U${idx + 1}`,
          attachment: fs.createReadStream(file)
        },
        event.threadID,
        () => fs.unlinkSync(file),
        event.messageID
      );

      global.GoatBot.onReply.delete(event.messageReply.messageID);

    } catch {
      message.reply("Upscale failed.");
    }
  }
};
