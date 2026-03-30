const { config } = global.GoatBot;
const { client } = global;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "whitelistthread",
		aliases: ["wlt", "wt"],
		version: "1.5",
		author: "kuze",
		countDown: 5,
		role: 2,
		description: { en: "Add, remove, list whitelist threads" },
		category: "admin",
		guide: {
			en: '{pn} add [tid...]\n{pn} remove [tid...]\n{pn} list\n{pn} mode <on|off>\n{pn} mode noti <on|off>'
		}
	},

	langs: {
		en: {
			added: "╭─✦✅ | 𝙰𝚍𝚍𝚎𝚍 %1 𝚝𝚑𝚛𝚎𝚊𝚍/𝚜\n%2",
			alreadyWLT: "╭✦⚠ | 𝙰𝚕𝚛𝚎𝚊𝚍𝚢 𝚊𝚍𝚍𝚎𝚍 %1 𝚝𝚑𝚛𝚎𝚊𝚍/𝚜\n%2",
			missingTIDAdd: "⚠ | 𝙿𝚕𝚎𝚊𝚜𝚎 𝚎𝚗𝚝𝚎𝚛 𝚃𝙸𝙳 𝚝𝚘 𝚊𝚍𝚍",
			removed: "╭✦✅ | 𝚁𝚎𝚖𝚘𝚟𝚎𝚍 %1 𝚝𝚑𝚛𝚎𝚊𝚍/𝚜\n%2",
			notAdded: "╭✦❎ | 𝙳𝚒𝚍𝚗'𝚝 𝚊𝚍𝚍 %1 𝚝𝚑𝚛𝚎𝚊𝚍/𝚜\n%2",
			missingTIDRemove: "⚠ | 𝙿𝚕𝚎𝚊𝚜𝚎 𝚎𝚗𝚝𝚎𝚛 𝚃𝙸𝙳 𝚝𝚘 𝚛𝚎𝚖𝚘𝚟𝚎",
			listWLTs: "╭✦✨ | 𝙻𝚒𝚜𝚝 𝚘𝚏 𝚃𝚑𝚛𝚎𝚊𝚍𝚜\n%1",
			turnedOn: "✅ | 𝐓𝐮𝐫𝐧𝐞𝐝 𝐨𝐧 𝐭𝐡𝐞 𝐦𝐨𝐝𝐞 𝐨𝐧𝐥𝐲 𝐰𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭𝐈𝐝𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐛𝐨𝐭",
			turnedOff: "❎ | 𝐓𝐮𝐫𝐧𝐞𝐝 𝐨𝐟𝐟 𝐰𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 𝐦𝐨𝐝𝐞",
			turnedOnNoti: "✅ | 𝙽𝚘𝚝𝚒 𝚘𝚗",
			turnedOffNoti: "❎ | 𝙽𝚘𝚝𝚒 𝚘𝚏𝚏"
		}
	},

	onStart: async function ({ message, args, event, getLang, api }) {
		const saveConfig = () => writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));

		switch ((args[0] || "").toLowerCase()) {

			case "add":
			case "-a":
			case "+": {
				let tids = args.slice(1).filter(id => !isNaN(id));
				if (!tids.length) tids.push(event.threadID);

				const already = [];
				const added = [];

				for (const tid of tids) {
					if (config.whiteListModeThread.whiteListThreadIds.includes(tid)) already.push(tid);
					else {
						config.whiteListModeThread.whiteListThreadIds.push(tid);
						added.push(tid);
					}
				}

				const names = await Promise.all(tids.map(async tid => {
					const info = await api.getThreadInfo(tid).catch(() => ({}));
					return { tid, name: info.threadName || "Unknown" };
				}));

				saveConfig();
				return message.reply(
					(added.length ? getLang("added", added.length, names.filter(n => added.includes(n.tid)).map(n => `├‣ ${n.name}\n╰‣ ${n.tid}`).join("\n")) : "") +
					(already.length ? "\n" + getLang("alreadyWLT", already.length, names.filter(n => already.includes(n.tid)).map(n => `╰‣ ${n.tid}`).join("\n")) : "")
				);
			}

			case "remove":
			case "rm":
			case "-r":
			case "-": {
				let tids = args.slice(1).filter(id => !isNaN(id));
				if (!tids.length) tids.push(event.threadID);

				const removed = [];
				const notAdded = [];

				for (const tid of tids) {
					if (config.whiteListModeThread.whiteListThreadIds.includes(tid)) {
						config.whiteListModeThread.whiteListThreadIds = config.whiteListModeThread.whiteListThreadIds.filter(id => id !== tid);
						removed.push(tid);
					} else notAdded.push(tid);
				}

				const names = await Promise.all(tids.map(async tid => {
					const info = await api.getThreadInfo(tid).catch(() => ({}));
					return { tid, name: info.threadName || "Unknown" };
				}));

				saveConfig();
				return message.reply(
					(removed.length ? getLang("removed", removed.length, names.filter(n => removed.includes(n.tid)).map(n => `├‣ ${n.name}\n╰‣ ${n.tid}`).join("\n")) : "") +
					(notAdded.length ? "\n" + getLang("notAdded", notAdded.length, names.filter(n => notAdded.includes(n.tid)).map(n => `╰‣ ${n.tid}`).join("\n")) : "")
				);
			}

			case "list":
			case "-l": {
				const names = await Promise.all(config.whiteListModeThread.whiteListThreadIds.map(async tid => {
					const info = await api.getThreadInfo(tid).catch(() => ({}));
					return { tid, name: info.threadName || "Unknown" };
				}));

				return message.reply(getLang("listWLTs", names.map(n => `├‣ ${n.name}\n╰‣ ${n.tid}`).join("\n")));
			}

			case "mode":
			case "m":
			case "-m": {
				let isNoti = false, val;
				if (args[1] === "noti") { isNoti = true; val = args[2]; }
				else val = args[1];

				const setVal = val === "on";
				if (isNoti) {
					config.hideNotiMessage.whiteListModeThread = !setVal;
					message.reply(getLang(setVal ? "turnedOnNoti" : "turnedOffNoti"));
				} else {
					config.whiteListModeThread.enable = setVal;
					message.reply(getLang(setVal ? "turnedOn" : "turnedOff"));
				}
				saveConfig();
				break;
			}

			default:
				return message.reply(getLang("missingTIDAdd"));
		}
	}
};
