const axios = require('axios');
const defaultEmojiTranslate = "🌐";

module.exports = {
	config: {
		name: "translate",
		aliases: ["trans"],
		version: "2.0",
		author: "NTKhang & Upgraded by Arijit",
		countDown: 5,
		role: 2, // 🔒 Admin-only
		description: {
			vi: "Dịch văn bản sang ngôn ngữ mong muốn (chỉ admin)",
			en: "Translate text to the desired language (Admin only)"
		},
		category: "utility",
		guide: {
			vi: "   {pn} <văn bản> -> <ISO 639-1>: Dịch văn bản sang ngôn ngữ mong muốn (chỉ admin)",
			en: "   {pn} <text> -> <ISO 639-1>: Translate text to desired language (Admin only)"
		}
	},

	langs: {
		vi: {
			noPermission: "❌ | Bạn không có quyền sử dụng lệnh này.",
			translateTo: "🌐 Dịch từ %1 sang %2",
			invalidArgument: "❌ Sai cú pháp, vui lòng chọn on hoặc off",
			turnOnTransWhenReaction: `✅ Đã bật tính năng dịch tin nhắn khi thả cảm xúc \"${defaultEmojiTranslate}\" vào tin nhắn (chỉ admin)\n Chỉ dịch những tin nhắn sau khi bật tính năng này`,
			turnOffTransWhenReaction: "✅ Đã tắt tính năng dịch tin nhắn khi thả cảm xúc",
			inputEmoji: "🌀 Hãy thả cảm xúc vào tin nhắn này để đặt emoji đó làm emoji dịch tin nhắn",
			emojiSet: "✅ Đã đặt emoji dịch tin nhắn là %1"
		},
		en: {
			noPermission: "❌ | You don’t have permission to use this command.",
			translateTo: "🌐 Translate from %1 to %2",
			invalidArgument: "❌ Invalid argument, please choose on or off",
			turnOnTransWhenReaction: `✅ Auto-translate by emoji is now ON (Admin only)\nTry reacting with \"${defaultEmojiTranslate}\" to translate messages.`,
			turnOffTransWhenReaction: "✅ Auto-translate by emoji is now OFF",
			inputEmoji: "🌀 Please react to this message to set that emoji as translation trigger",
			emojiSet: "✅ Translation emoji set to %1"
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang, commandName, permssion }) {
		// 🔒 Admin check
		if (permssion < 2)
			return message.reply(getLang("noPermission"));

		if (["-r", "-react", "-reaction"].includes(args[0])) {
			if (args[1] == "set") {
				return message.reply(getLang("inputEmoji"), (err, info) =>
					global.GoatBot.onReaction.set(info.messageID, {
						type: "setEmoji",
						commandName,
						messageID: info.messageID,
						authorID: event.senderID
					})
				);
			}
			const isEnable = args[1] == "on" ? true : args[1] == "off" ? false : null;
			if (isEnable == null)
				return message.reply(getLang("invalidArgument"));
			await threadsData.set(event.threadID, isEnable, "data.translate.autoTranslateWhenReaction");
			return message.reply(isEnable ? getLang("turnOnTransWhenReaction") : getLang("turnOffTransWhenReaction"));
		}

		const { body = "" } = event;
		let content;
		let langCodeTrans;
		const langOfThread = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;

		if (event.messageReply) {
			content = event.messageReply.body;
			let lastIndexSeparator = body.lastIndexOf("->");
			if (lastIndexSeparator == -1)
				lastIndexSeparator = body.lastIndexOf("=>");

			if (lastIndexSeparator != -1 && (body.length - lastIndexSeparator == 4 || body.length - lastIndexSeparator == 5))
				langCodeTrans = body.slice(lastIndexSeparator + 2);
			else if ((args[0] || "").match(/\w{2,3}/))
				langCodeTrans = args[0].match(/\w{2,3}/)[0];
			else
				langCodeTrans = langOfThread;
		}
		else {
			content = event.body;
			let lastIndexSeparator = content.lastIndexOf("->");
			if (lastIndexSeparator == -1)
				lastIndexSeparator = content.lastIndexOf("=>");

			if (lastIndexSeparator != -1 && (content.length - lastIndexSeparator == 4 || content.length - lastIndexSeparator == 5)) {
				langCodeTrans = content.slice(lastIndexSeparator + 2);
				content = content.slice(content.indexOf(args[0]), lastIndexSeparator);
			}
			else
				langCodeTrans = langOfThread;
		}

		if (!content)
			return message.SyntaxError();

		translateAndSendMessage(content, langCodeTrans, message, getLang);
	},

	onChat: async ({ event, threadsData, permssion }) => {
		// 🔒 Only admins can trigger auto translate
		if (permssion < 2)
			return;
		if (!await threadsData.get(event.threadID, "data.translate.autoTranslateWhenReaction"))
			return;
		global.GoatBot.onReaction.set(event.messageID, {
			commandName: 'translate',
			messageID: event.messageID,
			body: event.body,
			type: "translate"
		});
	},

	onReaction: async ({ message, Reaction, event, threadsData, getLang, permssion }) => {
		// 🔒 Prevent non-admins from reacting to trigger translation
		if (permssion < 2)
			return;
		switch (Reaction.type) {
			case "setEmoji": {
				if (event.userID != Reaction.authorID)
					return;
				const emoji = event.reaction;
				if (!emoji)
					return;
				await threadsData.set(event.threadID, emoji, "data.translate.emojiTranslate");
				return message.reply(getLang("emojiSet", emoji), () => message.unsend(Reaction.messageID));
			}
			case "translate": {
				const emojiTrans = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || "🌐";
				if (event.reaction == emojiTrans) {
					const langCodeTrans = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
					const content = Reaction.body;
					Reaction.delete();
					translateAndSendMessage(content, langCodeTrans, message, getLang);
				}
			}
		}
	}
};

// ==================== TRANSLATION FUNCTIONS ====================

async function translate(text, langCode) {
	const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`);
	return {
		text: res.data[0].map(item => item[0]).join(''),
		lang: res.data[2]
	};
}

async function translateAndSendMessage(content, langCodeTrans, message, getLang) {
	const { text, lang } = await translate(content.trim(), langCodeTrans.trim());
	return message.reply(`${text}\n\n${getLang("translateTo", lang, langCodeTrans)}`);
}
