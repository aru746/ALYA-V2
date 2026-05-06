const axios = require("axios");

const Alya = async () => {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
    return base.data.mahmud;
  } catch {
    return null;
  }
};

module.exports.config = {
  name: "font",
  version: "2.0",
  role: 0,
  countDown: 5,
  author: "kuze",
  category: "group",
  guide: { en: "[number] [text] or list" }
};

module.exports.onStart = async function ({ message, args }) {
  const apiUrl = await Alya();

  // ✅ Font list fixed (no duplicates, no broken styles)
  const fontList = `🎀 | Available Font Styles:

1: Ă̈l̆̈y̆̈ă̈  
2: 𝘈𝘭𝘺𝘢  
3: 𝗔𝗹𝘆𝗮  
4: 🅐🅛🅨🅐  
5: ᴬᴸʸᴬ  
6: Ａｌｙａ  
7: 𝙰𝚕𝚢𝚊  
8: 𝔸𝕝𝕪𝕒  
9: 𝐀𝐥𝐲𝐚  
10: Ⓐⓛⓨⓐ  
11: 𝕬𝖑𝖞𝖆  
12: ᵃˡʸᵃ  
13: 🅰🅻🆈🅰  
14: A̷l̷y̷a̷  
15: Ⱥᴸyᴬ  
16: Aℓуα`;

  if (args[0] === "list") {
    return message.reply(fontList);
  }

  const [number, ...textParts] = args;
  const text = textParts.join(" ");

  // ❌ Invalid input check
  if (!text || isNaN(number)) {
    return message.reply("❌ | Usage: font <style_number> <text>");
  }

  const styleNum = parseInt(number);

  // ❌ Limit styles
  if (styleNum < 1 || styleNum > 16) {
    return message.reply("❌ | Invalid style number. Use: font list");
  }

  try {
    // ✅ API method
    if (apiUrl) {
      const { data } = await axios.post(`${apiUrl}/api/font`, { number: styleNum, text });

      if (!data || !data.data || !data.data[styleNum]) {
        throw new Error("Invalid API response");
      }

      const fontStyle = data.data[styleNum];
      const convertedText = text
        .split("")
        .map(char => fontStyle[char] || char)
        .join("");

      return message.reply(convertedText);
    }

    // 🔁 Fallback (if API fails)
    return message.reply(`⚠️ | Font API unavailable.\n\nText: ${text}`);

  } catch (error) {
    return message.reply("❌ | Error processing font. Try again later.");
  }
};
