const Jimp = require("jimp");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🔒 OWNER UID
const OWNER_ID = "100069254151118";

// 🔤 Unicode bold converter
function toBoldUnicode(name) {
  const boldAlphabet = {
    "a":"𝐚","b":"𝐛","c":"𝐜","d":"𝐝","e":"𝐞","f":"𝐟","g":"𝐠","h":"𝐡","i":"𝐢","j":"𝐣",
    "k":"𝐤","l":"𝐥","m":"𝐦","n":"𝐧","o":"𝐨","p":"𝐩","q":"𝐪","r":"𝐫","s":"𝐬","t":"𝐭",
    "u":"𝐮","v":"𝐯","w":"𝐰","x":"𝐱","y":"𝐲","z":"𝐳",
    "A":"𝐀","B":"𝐁","C":"𝐂","D":"𝐃","E":"𝐄","F":"𝐅","G":"𝐆","H":"𝐇","I":"𝐈","J":"𝐉",
    "K":"𝐊","L":"𝐋","M":"𝐌","N":"𝐍","O":"𝐎","P":"𝐏","Q":"𝐐","R":"𝐑","S":"𝐒","T":"𝐓",
    "U":"𝐔","V":"𝐕","W":"𝐖","X":"𝐗","Y":"𝐘","Z":"𝐙",
    " ":" ","'":"'"," ,":",",".":".","-":"-","!":"!","?":"?"
  };
  return name.split("").map(c => boldAlphabet[c] || c).join("");
}

module.exports = {
  config: {
    name: "slap",
    version: "1.5",
    author: "Arafat + modified by Arijit",
    role: 0,
    shortDescription: "Slap someone",
    longDescription: "Custom batslap with personal template",
    category: "fun",
    guide: {
      en: "{pn} @mention"
    }
  },

  langs: {
    en: {
      noTag: "You must mention someone",
      noOwner: "😙 You can't slap my owner ❌"
    }
  },

  onStart: async function ({ event, message, getLang }) {
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions || {})[0];

    if (!uid2) return message.reply(getLang("noTag"));

    // 🔒 OWNER PROTECTION
    if (uid2 === OWNER_ID && uid1 !== OWNER_ID)
      return message.reply(getLang("noOwner"));

    try {
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);

      const img1Path = path.join(tmpDir, `${uid1}.png`);
      const img2Path = path.join(tmpDir, `${uid2}.png`);
      const outPath = path.join(tmpDir, `${uid1}_${uid2}_slap.png`);

      const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";

      const url1 = `https://graph.facebook.com/${uid1}/picture?width=720&height=720&access_token=${token}`;
      const url2 = `https://graph.facebook.com/${uid2}/picture?width=720&height=720&access_token=${token}`;

      const a1 = await axios.get(url1, { responseType: "arraybuffer" });
      const a2 = await axios.get(url2, { responseType: "arraybuffer" });

      await fs.writeFile(img1Path, a1.data);
      await fs.writeFile(img2Path, a2.data);

      const base = await Jimp.read(
        "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/main/batslap.png"
      );

      const av1 = await Jimp.read(img1Path);
      const av2 = await Jimp.read(img2Path);

      av1.circle();
      av2.circle();

      base.resize(1000, 500);
      av1.resize(220, 220);
      av2.resize(200, 200);

      base.composite(av2, 580, 260);
      base.composite(av1, 350, 70);

      await base.writeAsync(outPath);

      const targetName = toBoldUnicode(event.mentions[uid2]);

      message.reply(
        {
          body: `slapped ${targetName}!`,
          mentions: [
            {
              id: uid2,
              tag: event.mentions[uid2]
            }
          ],
          attachment: fs.createReadStream(outPath)
        },
        () => {
          fs.unlink(img1Path).catch(() => {});
          fs.unlink(img2Path).catch(() => {});
          fs.unlink(outPath).catch(() => {});
        }
      );
    } catch (err) {
      console.error(err);
      message.reply("Slap generate failed");
    }
  }
};
