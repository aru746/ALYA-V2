module.exports = {
  config: {
    name: "balance",
    aliases: ["bal"],
    version: "2.5",
    author: "Arijit",
    countDown: 5,
    role: 0,
    description: {
      vi: "xem số tiền hiện có của bạn hoặc người được tag",
      en: "view your money or the money of the tagged person"
    },
    category: "group"
  },

  onStart: async function ({ message, usersData, event, args }) {

    // ✅ Bold Unicode Converter
    function toBoldUnicode(text) {
      const boldAlphabet = {
        "a": "𝐚","b": "𝐛","c": "𝐜","d": "𝐝","e": "𝐞","f": "𝐟","g": "𝐠","h": "𝐡","i": "𝐢","j": "𝐣",
        "k": "𝐤","l": "𝐥","m": "𝐦","n": "𝐧","o": "𝐨","p": "𝐩","q": "𝐪","r": "𝐫","s": "𝐬","t": "𝐭",
        "u": "𝐮","v": "𝐯","w": "𝐰","x": "𝐱","y": "𝐲","z": "𝐳",
        "A": "𝐀","B": "𝐁","C": "𝐂","D": "𝐃","E": "𝐄","F": "𝐅","G": "𝐆","H": "𝐇","I": "𝐈","J": "𝐉",
        "K": "𝐊","L": "𝐋","M": "𝐌","N": "𝐍","O": "𝐎","P": "𝐏","Q": "𝐐","R": "𝐑","S": "𝐒","T": "𝐓",
        "U": "𝐔","V": "𝐕","W": "𝐖","X": "𝐗","Y": "𝐘","Z": "𝐙",
        " ": " ","'": "'",
        ",": ",",".": ".","-": "-","!": "!","?": "?",
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒",
        "5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗",
        "$":"$"
      };
      return String(text).split('').map(c => boldAlphabet[c] || c).join('');
    }

    // ✅ Format money
    function formatAmount(num) {
      if (num === Infinity) return "infinity$";
      if (num === -Infinity) return "-infinity$";
      num = Number(num) || 0;

      const suffixes = ["", "K", "M", "B", "T", "Q", "QU", "S"];
      if (num === 0) return "0$";

      const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
      if (tier <= 0) return num + "$";

      const suffix = suffixes[tier] || "";
      const scale = Math.pow(10, tier * 3);
      const scaled = num / scale;

      return scaled.toFixed(1).replace(/\.0$/, '') + suffix + "$";
    }

    const mentionIDs = Object.keys(event.mentions || {});

    // ==============================
    // ✅ Mention Balance
    // ==============================
    if (mentionIDs.length > 0) {
      let reply = "";

      for (const uid of mentionIDs) {
        const name = await usersData.getName(uid) || "User";
        const balance = await usersData.get(uid, "money") || 0;

        reply += `>🎀 ${toBoldUnicode(name)}\n\n${toBoldUnicode("has")} ${toBoldUnicode(formatAmount(balance))}\n\n`;
      }

      return message.reply(reply.trim());
    }

    // ==============================
    // ✅ Reply User Balance
    // ==============================
    if (event.type === "message_reply" && event.messageReply?.senderID) {
      const uid = event.messageReply.senderID;

      const name = await usersData.getName(uid) || "User";
      const balance = await usersData.get(uid, "money") || 0;

      return message.reply(
        `>🎀 ${toBoldUnicode(name)}\n\n${toBoldUnicode("has")} ${toBoldUnicode(formatAmount(balance))}`
      );
    }

    // ==============================
    // ✅ UID Balance (args দিয়ে)
    // ==============================
    if (args[0] && !isNaN(args[0])) {
      const uid = args[0];

      const name = await usersData.getName(uid) || "User";
      const balance = await usersData.get(uid, "money") || 0;

      return message.reply(
        `>🎀 ${toBoldUnicode(name)}\n\n${toBoldUnicode("has")} ${toBoldUnicode(formatAmount(balance))}`
      );
    }

    // ==============================
    // ✅ Self Balance
    // ==============================
    const selfName = await usersData.getName(event.senderID) || "User";
    const selfBalance = await usersData.get(event.senderID, "money") || 0;

    return message.reply(
      `>🎀 ${toBoldUnicode(selfName)}\n\n${toBoldUnicode("Baby, Your balance:")} ${toBoldUnicode(formatAmount(selfBalance))}`
    );
  }
};
