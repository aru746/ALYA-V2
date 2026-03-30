module.exports = {
	config: {
		name: "refresh",
		version: "2.0",
		author: "Arju",
		countDown: 10,
		role: 0,
		description: {
			en: "Refresh information of group chat or user and update database"
		},
		category: "group"
	},

	langs: {
		en: {
			refreshThreadSuccess: "✅ | Group data & database refreshed successfully!",
			refreshUserSuccess: "✅ | User data & database refreshed successfully!",
			error: "❌ | Failed to refresh data."
		}
	},

	onStart: async function ({ args, threadsData, usersData, message, event, api, getLang }) {

		try {

			// =========================
			// 🔹 REFRESH GROUP + DATABASE
			// =========================
			if (args[0] === "group" || args[0] === "thread") {

				const threadID = args[1] || event.threadID;

				// 🔹 Get latest thread info from Facebook
				const threadInfo = await api.getThreadInfo(threadID);

				// 🔹 Force update database
				await threadsData.set(threadID, {
					threadName: threadInfo.threadName,
					adminIDs: threadInfo.adminIDs,
					participantIDs: threadInfo.participantIDs,
					isGroup: threadInfo.isGroup,
					imageSrc: threadInfo.imageSrc,
					updateTime: Date.now()
				});

				return message.reply(getLang("refreshThreadSuccess"));
			}

			// =========================
			// 🔹 REFRESH USER + DATABASE
			// =========================
			else if (args[0] === "user") {

				let userID = event.senderID;

				if (args[1]) {
					if (event.mentions && Object.keys(event.mentions).length > 0)
						userID = Object.keys(event.mentions)[0];
					else
						userID = args[1];
				}

				// 🔹 Get latest user info from Facebook
				const userInfo = await api.getUserInfo(userID);
				const data = userInfo[userID];

				// 🔹 Force update database
				await usersData.set(userID, {
					name: data.name,
					firstName: data.firstName,
					isFriend: data.isFriend,
					gender: data.gender,
					vanity: data.vanity,
					profileUrl: data.profileUrl,
					updateTime: Date.now()
				});

				return message.reply(getLang("refreshUserSuccess"));
			}

			else {
				return message.reply(
					"⚠️ Usage:\n" +
					"• refresh group\n" +
					"• refresh group <threadID>\n" +
					"• refresh user\n" +
					"• refresh user <userID | @tag>"
				);
			}

		} catch (err) {
			console.error(err);
			return message.reply(getLang("error"));
		}
	}
};
