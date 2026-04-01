const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
    config: {
        name: "premium",
        aliases: ["pm"],
        version: "1.2",
        author: "NeoKEX & Arijit",
        countDown: 5,
        role: 2,
        description: {
            vi: "Thêm, xóa quyền premium user với thời gian",
            en: "Add, remove premium user role with time duration"
        },
        category: "owner",
        guide: {
            vi: '   {pn} [add | -a] <uid | @tag> [time]: Thêm quyền premium\n   Time: 1d, 2h, 30m hoặc permanent',
            en: '   {pn} [add | -a] <uid | @tag> [time]: Add premium role\n   Time: 1d, 2h, 30m or permanent'
        }
    },

    langs: {
        vi: {
            added: "✓ | Đã thêm quyền premium cho %1 người dùng:\n%2",
            alreadyPremium: "\n⚠ | %1 người dùng đã có quyền premium: %2",
            missingIdAdd: "⚠ | Vui lòng nhập ID hoặc tag",
            removed: "✓ | Đã xóa quyền premium cho %1 người dùng:\n%2",
            listPremium: "🌟| 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬:\n\n%1",
            invalidTime: "⚠ | Định dạng thời gian không hợp lệ! (1d, 2h, 30m, permanent)",
            permanent: "Permanent",
            expired: "Expired"
        },
        en: {
            added: "✓ | 𝐀𝐝𝐝𝐞𝐝 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐫𝐨𝐥𝐞 𝐟𝐨𝐫 %1 𝐮𝐬𝐞𝐫𝐬:\n%2",
            alreadyPremium: "\n⚠ | %1 𝐮𝐬𝐞𝐫𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐡𝐚𝐯𝐞 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐫𝐨𝐥𝐞: %2",
            missingIdAdd: "⚠ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠",
            removed: "✓ | 𝐑𝐞𝐦𝐨𝐯𝐞𝐝 𝐩𝐫𝐞𝐦𝐢𝐮𝐦 𝐫𝐨𝐥𝐞 𝐟𝐨𝐫 %1 𝐮𝐬𝐞𝐫𝐬:\n%2",
            listPremium: "🌟| 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬:\n\n%1",
            invalidTime: "⚠ | 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐭𝐢𝐦𝐞 𝐟𝐨𝐫𝐦𝐚𝐭! (1d, 2h, 30m, permanent)",
            permanent: "Permanent",
            expired: "Expired"
        }
    },

    onStart: async function ({ message, args, usersData, event, getLang }) {
        if (!config.premiumUsers) config.premiumUsers = [];

        // Unicode bold converter function
        function toBoldUnicode(text) {
            const boldAlphabet = {
                "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
                "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
                "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳", "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃",
                "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉", "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍",
                "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓", "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗",
                "Y": "𝐘", "Z": "𝐙", "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖",
                "9": "𝟗", " ": " ", "/": "/", ":": ":", "-": "-"
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

        const formatTime = (expireTime) => {
            if (!expireTime) return toBoldUnicode("Permanent");
            const date = new Date(expireTime);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return toBoldUnicode(`${day}/${month}/${year}`);
        };

        // Auto-remove expired users from config list when calling list/check
        const checkExpiry = async () => {
            let changed = false;
            for (let i = config.premiumUsers.length - 1; i >= 0; i--) {
                const uid = config.premiumUsers[i];
                const expireTime = await usersData.get(uid, "data.premiumExpireTime");
                if (expireTime && expireTime < Date.now()) {
                    config.premiumUsers.splice(i, 1);
                    await usersData.set(uid, null, "data.premiumExpireTime");
                    changed = true;
                }
            }
            if (changed) writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        };

        await checkExpiry();

        switch (args[0]) {
            case "add":
            case "-a": {
                if (!args[1] && !event.messageReply) return message.reply(getLang("missingIdAdd"));
                let uids = [], timeArg = "permanent";

                if (Object.keys(event.mentions).length > 0) {
                    uids = Object.keys(event.mentions);
                    const lastArg = args[args.length - 1];
                    if (lastArg.match(/^(\d+)([dhm])$/)) timeArg = lastArg;
                } else if (event.messageReply) {
                    uids.push(event.messageReply.senderID);
                    if (args[1] && args[1].match(/^(\d+)([dhm])$/)) timeArg = args[1];
                } else {
                    uids = args.filter(arg => !isNaN(arg));
                    const lastArg = args[args.length - 1];
                    if (lastArg.match(/^(\d+)([dhm])$/)) timeArg = lastArg;
                }

                const expireTime = parseTime(timeArg);
                if (expireTime === false) return message.reply(getLang("invalidTime"));

                for (const uid of uids) {
                    if (!config.premiumUsers.includes(uid)) config.premiumUsers.push(uid);
                    await usersData.set(uid, expireTime, "data.premiumExpireTime");
                }

                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
                return message.reply(getLang("added", uids.length, uids.join(", ")));
            }

            case "list":
            case "-l": {
                if (config.premiumUsers.length === 0) return message.reply("No premium users found.");
                
                const list = [];
                for (const uid of config.premiumUsers) {
                    const name = await usersData.getName(uid);
                    const expire = await usersData.get(uid, "data.premiumExpireTime");
                    list.push(`╭─ 𝐍𝐚𝐦𝐞: ${toBoldUnicode(name)}\n╰‣ 𝐄𝐱𝐩𝐢𝐫𝐞: ${formatTime(expire)}`);
                }
                return message.reply(getLang("listPremium", list.join("\n\n")));
            }

            case "remove":
            case "-r": {
                let uid = event.messageReply ? event.messageReply.senderID : args[1];
                if (!uid) return message.reply("Please tag or provide UID.");
                
                config.premiumUsers = config.premiumUsers.filter(id => id !== uid);
                await usersData.set(uid, null, "data.premiumExpireTime");
                writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
                return message.reply(getLang("removed", 1, uid));
            }

            default:
                return message.SyntaxError();
        }
    }
};
