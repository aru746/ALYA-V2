const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "premium",
    aliases: ["pm"],
    version: "1.4",
    author: "NeoKEX & Arijit",
    countDown: 5,
    role: 2,
    description: {
      vi: "Thêm, xóa quyền premium user với thời gian",
      en: "Add, remove premium user role with time duration"
    },
    category: "owner",
    guide: {
      vi: '{pn} [add | -a] <uid | @tag> [time]\nVí dụ: {pn} add @user 5d',
      en: '{pn} [add | -a] <uid | @tag> [time]\nExample: {pn} add @user 5d'
    }
  },

  langs: {
    vi: {
      added: "✅ Đã thêm quyền premium cho %1 người dùng:\n%2",
      alreadyPremium: "\n⚠ %1 người dùng đã có quyền premium: %2",
      missingIdAdd: "⚠ Vui lòng nhập ID hoặc tag",
      removed: "✅ Đã xóa quyền premium cho %1 người dùng:\n%2",
      listPremium: "🌟| 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬:\n\n%1",
      invalidTime: "⚠ Định dạng thời gian không hợp lệ! (1d, 2h, 30m, permanent)",
      permanent: "Permanent",
      expired: "Expired"
    },
    en: {
      added: "✅ 𝐀𝐝𝐝𝐞𝐝 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐫𝐨𝐥𝐞 𝐟𝐨𝐫 %1 𝐮𝐬𝐞𝐫𝐬:\n%2",
      alreadyPremium: "\n⚠ %1 𝐮𝐬𝐞𝐫𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐡𝐚𝐯𝐞 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐫𝐨𝐥𝐞: %2",
      missingIdAdd: "⚠ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠",
      removed: "✅ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐫𝐨𝐥𝐞 𝐟𝐨𝐫 %1 𝐮𝐬𝐞𝐫𝐬:\n%2",
      listPremium: "🌟| 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬:\n\n%1",
      invalidTime: "⚠ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐭𝐢𝐦𝐞 𝐟𝐨𝐫𝐦𝐚𝐭! (1d, 2h, 30m, permanent)",
      permanent: "Permanent",
      expired: "Expired"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    if (!config.premiumUsers) config.premiumUsers = [];

    function toBoldUnicode(text) {
      const boldAlphabet = {
        "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
        "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
        "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳", "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃",
        "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉", "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍",
        "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓", "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗",
        "Y": "𝐘", "Z": "𝐙", "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖",
        "9": "𝟗", " ": " ", "/": "/", ":": ":", "-": "-", ".": ".", "!": "!", "?": "?"
      };
      return text.toString().split('').map(char => boldAlphabet[char] || char).join('');
    }

    const parseTime = (timeStr) => {
      if (!timeStr || timeStr === "permanent") return null;
      const match = timeStr.match(/^(\d+)([dhm])$/);
      if (!match) return false;
      const value = parseInt(match[1]);
      const unit = match[2];
      const multipliers = { m: 60000, h: 3600000, d: 86400000 };
      return Date.now() + (value * multipliers[unit]);
    };

    const getTimeRemaining = (expireTime) => {
      if (!expireTime) return toBoldUnicode(getLang("permanent"));
      const remaining = expireTime - Date.now();
      if (remaining <= 0) return toBoldUnicode(getLang("expired"));
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor((remaining % 86400000) / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      
      let res = "";
      if (days > 0) res += `${days}d/`;
      if (hours > 0 || days > 0) res += `${hours}h/`;
      res += `${minutes}m`;
      return toBoldUnicode(res);
    };

    // Auto cleanup expired
    for (const uid of [...config.premiumUsers]) {
      const exp = await usersData.get(uid, "data.premiumExpireTime");
      if (exp && exp - Date.now() <= 0) {
        config.premiumUsers.splice(config.premiumUsers.indexOf(uid), 1);
        await usersData.set(uid, null, "data.premiumExpireTime");
      }
    }

    switch (args[0]) {
      case "add":
      case "-a": {
        let uids = [];
        let timeStr = args[args.length - 1];

        if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
        else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
          timeStr = args[1];
        } else uids = args.filter(arg => !isNaN(arg) && arg.length > 5);

        if (uids.length == 0) return message.reply(getLang("missingIdAdd"));

        const expireTime = parseTime(timeStr);
        if (expireTime === false && timeStr !== "permanent") return message.reply(getLang("invalidTime"));

        let addedNames = [];
        for (const uid of uids) {
          if (!config.premiumUsers.includes(uid)) config.premiumUsers.push(uid);
          await usersData.set(uid, expireTime, "data.premiumExpireTime");
          const name = await usersData.getName(uid);
          addedNames.push(name);
        }

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("added", uids.length, addedNames.map(name => `• ${name}`).join("\n")));
      }

      case "list":
      case "-l": {
        const premiumList = await Promise.all(config.premiumUsers.map(async uid => {
          const name = await usersData.getName(uid);
          const expireTime = await usersData.get(uid, "data.premiumExpireTime");
          return `╭─ 𝐍𝐚𝐦𝐞: ${toBoldUnicode(name)}\n╰‣ 𝐄𝐱𝐩𝐢𝐫𝐞: ${getTimeRemaining(expireTime)}`;
        }));
        if (premiumList.length == 0) return message.reply("No premium users found.");
        return message.reply(getLang("listPremium", premiumList.join("\n\n")));
      }

      case "remove":
      case "-r": {
        let uids = Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) : (event.messageReply ? [event.messageReply.senderID] : args.filter(arg => !isNaN(arg)));
        let removedNames = [];
        for (const uid of uids) {
          if (config.premiumUsers.includes(uid)) {
            const name = await usersData.getName(uid);
            removedNames.push(name);
            config.premiumUsers.splice(config.premiumUsers.indexOf(uid), 1);
            await usersData.set(uid, null, "data.premiumExpireTime");
          }
        }
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("removed", removedNames.length, removedNames.map(name => `• ${name}`).join("\n")));
      }

      default:
        return message.SyntaxError();
    }
  }
};
