const axios = require("axios");

module.exports = {
	config: {
		name: "setavt",
		aliases: ["changeavt", "setavatar"],
		version: "1.5",
		author: "NTKhang | Modified by Arijit",
		countDown: 5,
		role: "owner", // still marked as owner for clarity
		description: {
			vi: "Đổi avatar bot (chỉ UID 61592043025070 mới dùng được)",
			en: "Change bot avatar (Only UID 61592043025070 can use)"
		},
		category: "owner",
		guide: {
			en: "{pn} [image url | reply with image] [caption | optional] [expirationAfter (seconds) | optional]"
		}
	},

	langs: {
		vi: {
			cannotGetImage: "❌ | Đã xảy ra lỗi khi truy vấn đến url hình ảnh",
			invalidImageFormat: "❌ | Định dạng hình ảnh không hợp lệ",
			changedAvatar: "✅ | Đã thay đổi avatar của bot thành công",
			notAllowed: "❌ | Bạn không có quyền dùng lệnh này"
		},
		en: {
			cannotGetImage: "❌ | An error occurred while querying the image url",
			invalidImageFormat: "❌ | Invalid image format",
			changedAvatar: "✅ | Changed bot avatar successfully",
			notAllowed: "❌ | You are not allowed to use this command"
		}
	},

	onStart: async function ({ message, event, api, args, getLang }) {
		// ✅ Restrict to single UID
		const OWNER_UID = "61592043025070";
		if (event.senderID !== OWNER_UID) {
			return message.reply(getLang("notAllowed"));
		}

		const imageURL = (args[0] || "").startsWith("http")
			? args.shift()
			: event.attachments[0]?.url || event.messageReply?.attachments[0]?.url;

		const expirationAfter = !isNaN(args[args.length - 1]) ? args.pop() : null;
		const caption = args.join(" ");

		if (!imageURL)
			return message.SyntaxError();

		let response;
		try {
			response = await axios.get(imageURL, { responseType: "stream" });
		} catch (err) {
			return message.reply(getLang("cannotGetImage"));
		}

		if (!response.headers["content-type"].includes("image"))
			return message.reply(getLang("invalidImageFormat"));

		response.data.path = "avatar.jpg";

		api.changeAvatar(
			response.data,
			caption,
			expirationAfter ? expirationAfter * 1000 : null,
			(err) => {
				if (err) return message.err(err);
				return message.reply(getLang("changedAvatar"));
			}
		);
	}
};
