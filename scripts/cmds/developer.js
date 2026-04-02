const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "developer",
    aliases: ["dev"],
    version: "1.2",
    author: "NeoKEX & Arijit",
    countDown: 5,
    role: 4,
    description: {
      vi: "Thêm, xóa, sửa quyền developer với thời gian",
      en: "Add, remove, edit developer role with duration"
    },
    category: "owner",
    guide: {
      vi: '{pn} [add | -a] <uid | @tag> [time]\nVí dụ: {pn} add @user 5d',
      en: '{pn} [add | -a] <uid | @tag> [time]\nExample: {pn} add @user 5d'
    }
  },

  langs: {
    vi: {
      added: "✅ Đã thêm quyền developer cho %1 người dùng:\n%2",
      alreadyDev: "\n⚠ %1 người dùng đã có quyền developer: %2",
      missingIdAdd: "⚠ Vui lòng nhập ID hoặc tag",
      removed: "✅ Đã xóa quyền developer cho %1 người dùng:\n%2",
      listDev: "🔰| 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 𝐋𝐢𝐬𝐭:\n\n%1",
      invalidTime: "⚠ Định dạng thời gian không hợp lệ! (1d, 2h, 30m, permanent)",
      permanent: "Permanent",
      expired: "Expired"
    },
    en: {
      added: "✅ 𝐀𝐝𝐝𝐞𝐝 𝐝𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 𝐫𝐨𝐥𝐞 𝐟𝐨𝐫 %1 𝐮𝐬𝐞𝐫𝐬:\n%2",
      alreadyDev: "\n⚠ %1 𝐮𝐬𝐞𝐫𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐡𝐚𝐯𝐞 𝐝𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 𝐫𝐨𝐥𝐞: %2",
      missingIdAdd: "⚠ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠",
      removed: "✅ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝 𝐝𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 𝐫𝐨𝐥𝐞 𝐟𝐨𝐫 %1 𝐮𝐬𝐞𝐫𝐬:\n%2",
      listDev: "🔰| 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 𝐋𝐢𝐬𝐭:\n\n%1",
      invalidTime: "⚠ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐭𝐢𝐦𝐞 𝐟𝐨𝐫𝐦𝐚𝐭! (1d, 2h, 30m, permanent)",
      permanent: "Permanent",
      expired: "Expired"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    if (!config.devUsers) config.devUsers = [];

    // Unicode Bold Function
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

    // Auto cleanup expired developers
    for (const uid of [...config.devUsers]) {
      const exp = await usersData.get(uid, "data.devExpireTime");
      if (exp && exp - Date.now() <= 0) {
        config.devUsers.splice(config.devUsers.indexOf(uid), 1);
        await usersData.set(uid, null, "data.devExpireTime");
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

        let addedDetails = [];
        for (const uid of uids) {
          if (!config.devUsers.includes(uid)) config.devUsers.push(uid);
          await usersData.set(uid, expireTime, "data.devExpireTime");
          const name = await usersData.getName(uid);
          addedDetails.push(`• ${name} (${uid})`);
        }

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("added", uids.length, addedDetails.join("\n")));
      }

      case "list":
      case "-l": {
        const devList = await Promise.all(config.devUsers.map(async uid => {
          const name = await usersData.getName(uid);
          const expireTime = await usersData.get(uid, "data.devExpireTime");
          return `╭─ 𝐍𝐚𝐦𝐞: ${toBoldUnicode(name)}\n╰‣ 𝐄𝐱𝐩𝐢𝐫𝐞: ${getTimeRemaining(expireTime)}`;
        }));
        if (devList.length == 0) return message.reply("No developers found.");
        return message.reply(getLang("listDev", devList.join("\n\n")));
      }

      case "remove":
      case "-r": {
        let uids = Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions) : (event.messageReply ? [event.messageReply.senderID] : args.filter(arg => !isNaN(arg)));
        let removedNames = [];
        for (const uid of uids) {
          if (config.devUsers.includes(uid)) {
            const name = await usersData.getName(uid);
            removedNames.push(name);
            config.devUsers.splice(config.devUsers.indexOf(uid), 1);
            await usersData.set(uid, null, "data.devExpireTime");
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
