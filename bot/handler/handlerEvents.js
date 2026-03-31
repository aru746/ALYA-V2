const fs = require("fs-extra");
const axios = require("axios");
const SpamTracker = require("../../func/spamTracker.js");
const CooldownManager = require("../../func/cooldownManager.js");
const analyticsBatcher = require("../../func/analyticsBatcher.js");
const nullAndUndefined = [undefined, null];

// ================= VIP & DEV CONFIG =================
const BASE_API = "https://mongodb-api-psi.vercel.app";
const COLLECTION = "aru-vip";
const MY_UID = "61573866391878"; // Aru's UID
// ====================================================

// VIP list check from MongoDB
async function isUserVip(uid) {
	try {
		const res = await axios.get(`${BASE_API}/${COLLECTION}`);
		const data = res.data?.data || [];
		const now = Date.now();
		return data.some(v => v.userID == uid && v.expireAt > now);
	} catch (e) {
		return false;
	}
}

const spamTracker = new SpamTracker({
	commandThreshold: 8,
	timeWindow: 10000,
	banDuration: 24 * 60 * 60 * 1000,
	maxEntries: 1000,
	cleanupInterval: 60000
});

const cooldownManager = require("../../func/cooldownManager.js");

function getType(obj) {
	return Object.prototype.toString.call(obj).slice(8, -1);
}

async function checkSpamBannedThread(threadID, globalData) {
	if (spamTracker.isBanned(threadID)) return true;
	const spamBannedThreads = await globalData.get("spamBannedThreads", "data", {});
	if (spamBannedThreads[threadID]) {
		if (spamBannedThreads[threadID].expireTime > Date.now()) {
			spamTracker.banThread(threadID, spamBannedThreads[threadID].reason, spamBannedThreads[threadID].expireTime - Date.now());
			return true;
		} else {
			delete spamBannedThreads[threadID];
			await globalData.set("spamBannedThreads", spamBannedThreads, "data");
		}
	}
	return false;
}

async function trackCommandSpam(threadID, threadName, globalData, message) {
	const config = global.GoatBot.config;
	const spamConfig = config.spamProtection || { commandThreshold: 8, timeWindow: 10, banDuration: 24 };
	spamTracker.options.commandThreshold = spamConfig.commandThreshold;
	spamTracker.options.timeWindow = spamConfig.timeWindow * 1000;
	spamTracker.options.banDuration = spamConfig.banDuration * 60 * 60 * 1000;
	const result = spamTracker.trackCommand(threadID, message.body?.split(' ')[0] || 'unknown');
	if (result.shouldBan) {
		const spamBannedThreads = await globalData.get("spamBannedThreads", "data", {});
		const now = Date.now();
		spamBannedThreads[threadID] = { bannedAt: now, expireTime: now + (spamConfig.banDuration * 3600000), threadName: threadName || "Unknown", reason: "Command spam flood detected" };
		await globalData.set("spamBannedThreads", spamBannedThreads, "data");
		message.reply(`⛔ | This group has been temporarily banned for ${spamConfig.banDuration} hours due to command spam.`);
		return true;
	}
	return false;
}

function getRole(threadData, senderID) {
	const config = global.GoatBot.config;
	const { adminBot = [], devUsers = [] } = config;
	if (!senderID) return 0;
	const adminBox = threadData ? threadData.adminIDs || [] : [];
	const sid = senderID.toString();
	if (devUsers.includes(sid) || sid === MY_UID) return 4;
	if (adminBot.includes(sid)) return 2;
	if (adminBox.map(String).includes(sid)) return 1;
	return 0;
}

async function canUseCommand(userRole, needRole, senderID) {
	if (userRole === 4 || userRole === 2) return true;
	if (needRole === 3) return await isUserVip(senderID);
	return needRole <= userRole;
}

function getText(type, reason, time, targetID, lang) {
	const utils = global.utils;
	if (type == "userBanned") return utils.getText({ lang, head: "handlerEvents" }, "userBanned", reason, time, targetID);
	if (type == "threadBanned") return utils.getText({ lang, head: "handlerEvents" }, "threadBanned", reason, time, targetID);
	if (type == "onlyAdminBox") return utils.getText({ lang, head: "handlerEvents" }, "onlyAdminBox");
	if (type == "onlyAdminBot") return utils.getText({ lang, head: "handlerEvents" }, "onlyAdminBot");
}

function replaceShortcutInLang(text, prefix, commandName) {
	return text.replace(/\{(?:p|prefix)\}/g, prefix).replace(/\{(?:n|name)\}/g, commandName).replace(/\{pn\}/g, `${prefix}${commandName}`);
}

function getRoleConfig(utils, command, isGroup, threadData, commandName) {
	let roleConfig = (utils.isNumber(command.config.role)) ? { onStart: command.config.role } : (command.config.role || { onStart: 0 });
	if (isGroup) roleConfig.onStart = threadData.data.setRole?.[commandName] ?? roleConfig.onStart;
	for (const key of ["onChat", "onStart", "onReaction", "onReply"]) {
		if (roleConfig[key] == undefined) roleConfig[key] = roleConfig.onStart;
	}
	return roleConfig;
}

function isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, lang) {
	const config = global.GoatBot.config;
	if (userData.banned.status) {
		if (!config.hideNotiMessage.userBanned) message.reply(getText("userBanned", userData.banned.reason, userData.banned.date, senderID, lang));
		return true;
	}
	if (config.adminOnly.enable && !config.adminBot.includes(senderID) && !config.adminOnly.ignoreCommand.includes(commandName)) {
		if (!config.hideNotiMessage.adminOnly) message.reply(getText("onlyAdminBot", null, null, null, lang));
		return true;
	}
	if (isGroup) {
		if (threadData.data.onlyAdminBox && !threadData.adminIDs.includes(senderID) && !(threadData.data.ignoreCommanToOnlyAdminBox || []).includes(commandName)) {
			if (!threadData.data.hideNotiMessageOnlyAdminBox) message.reply(getText("onlyAdminBox", null, null, null, lang));
			return true;
		}
		if (threadData.banned.status) {
			if (!config.hideNotiMessage.threadBanned) message.reply(getText("threadBanned", threadData.banned.reason, threadData.banned.date, threadID, lang));
			return true;
		}
	}
	return false;
}

function createGetText2(langCode, pathCustomLang, prefix, command) {
	const commandName = command.config.name;
	let customLang = fs.existsSync(pathCustomLang) ? (require(pathCustomLang)[commandName]?.text || {}) : {};
	return function (key, ...args) {
		let lang = command.langs?.[langCode]?.[key] || customLang[key] || "";
		lang = replaceShortcutInLang(lang, prefix, commandName);
		for (let i = args.length - 1; i >= 0; i--) lang = lang.replace(new RegExp(`%${i + 1}`, "g"), args[i]);
		return lang || `❌ Text key "${key}" not found.`;
	};
}

module.exports = function (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) {
	return async function (event, message) {
		const { utils, client, GoatBot } = global;
		const { getPrefix, removeHomeDir, log, getTime } = utils;
		const { body, threadID, isGroup, messageID } = event;
		if (!threadID) return;
		const senderID = event.userID || event.senderID || event.author;
		let threadData = global.db.allThreadData.find(t => t.threadID == threadID) || await threadsData.create(threadID);
		let userData = global.db.allUserData.find(u => u.userID == senderID) || await usersData.create(senderID);
		const prefix = getPrefix(threadID);
		const role = getRole(threadData, senderID);
		const langCode = threadData.data.lang || GoatBot.config.language || "en";
		const parameters = { api, usersData, threadsData, message, event, prefix, role, globalData, envCommands: GoatBot.configCommands.envCommands };

		// —————————————— ON REACTION (ANGRY UNSEND) —————————————— //
		if (event.type === "message_reaction") {
			const reaction = event.reaction;
			if ((reaction === "😡" || reaction === "😠") && senderID === MY_UID) {
				try { return await api.unsendMessage(messageID); } catch (e) { }
			}
		}

		async function onStart() {
			if (!body) return;
			const hasPrefix = body.startsWith(prefix);
			if (!hasPrefix && !(GoatBot.config.noPrefix && (role === 2 || role === 4))) return;
			if (isGroup && await checkSpamBannedThread(threadID, globalData)) return;

			const args = hasPrefix ? body.slice(prefix.length).trim().split(/ +/) : body.trim().split(/ +/);
			let commandName = args.shift().toLowerCase();
			let command = GoatBot.commands.get(commandName) || GoatBot.commands.get(GoatBot.aliases.get(commandName));
			
			if (command) {
				commandName = command.config.name;
				if (isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, langCode)) return;
				const roleConfig = getRoleConfig(utils, command, isGroup, threadData, commandName);
				const needRole = roleConfig.onStart;

				if (!(await canUseCommand(role, needRole, senderID))) {
					return message.reply(needRole === 3 ? "🌟 | This is a VIP command! Get VIP access to use this." : "❌ | Permission denied.");
				}

				const cooldownMs = (command.config.countDown || 1) * 1000;
				const cooldownCheck = cooldownManager.checkCooldown(commandName, senderID, cooldownMs);
				if (cooldownCheck.onCooldown) return message.reply(`Wait ${cooldownCheck.remainingTime}s`);

				try {
					analyticsBatcher.record(commandName);
					const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
					await command.onStart({ ...parameters, args, commandName, getLang: getText2 });
					cooldownManager.setCooldown(commandName, senderID);
					log.info("CALL", `${commandName} | ${senderID} | ${threadID}`);
				} catch (err) { log.err("ERR", err); }
			}
		}

		async function onReply() {
			if (!event.messageReply) return;
			const Reply = GoatBot.onReply.get(event.messageReply.messageID);
			if (!Reply) return;
			const command = GoatBot.commands.get(Reply.commandName);
			if (!command) return;
			const roleConfig = getRoleConfig(utils, command, isGroup, threadData, command.config.name);
			if (!(await canUseCommand(role, roleConfig.onReply, senderID))) return;
			try {
				const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
				await command.onReply({ ...parameters, Reply, args: body ? body.split(/ +/) : [], commandName: command.config.name, getLang: getText2 });
			} catch (err) { log.err("REPLY_ERR", err); }
		}

		async function onReaction() {
			const Reaction = GoatBot.onReaction.get(messageID);
			if (!Reaction) return;
			const command = GoatBot.commands.get(Reaction.commandName);
			if (!command) return;
			const roleConfig = getRoleConfig(utils, command, isGroup, threadData, command.config.name);
			if (!(await canUseCommand(role, roleConfig.onReaction, senderID))) return;
			try {
				const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
				await command.onReaction({ ...parameters, Reaction, args: [], commandName: command.config.name, getLang: getText2 });
			} catch (err) { log.err("REACT_ERR", err); }
		}

		// Execute all handlers
		await onStart();
		await onReply();
		await onReaction();
		// Baki handlers (onChat, onEvent) automatic execute hobe jodi proyojon hoy
		
		return { onStart, onReply, onReaction };
	};
};
