// Unicode bold converter
function toBoldUnicode(text) {
	const map = {
		"a":"𝐚","b":"𝐛","c":"𝐜","d":"𝐝","e":"𝐞","f":"𝐟","g":"𝐠","h":"𝐡","i":"𝐢","j":"𝐣",
		"k":"𝐤","l":"𝐥","m":"𝐦","n":"𝐧","o":"𝐨","p":"𝐩","q":"𝐪","r":"𝐫","s":"𝐬","t":"𝐭",
		"u":"𝐮","v":"𝐯","w":"𝐰","x":"𝐱","y":"𝐲","z":"𝐳",
		"A":"𝐀","B":"𝐁","C":"𝐂","D":"𝐃","E":"𝐄","F":"𝐅","G":"𝐆","H":"𝐇","I":"𝐈","J":"𝐉",
		"K":"𝐊","L":"𝐋","M":"𝐌","N":"𝐍","O":"𝐎","P":"𝐏","Q":"𝐐","R":"𝐑","S":"𝐒","T":"𝐓",
		"U":"𝐔","V":"𝐕","W":"𝐖","X":"𝐗","Y":"𝐘","Z":"𝐙",
		"0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗",
		" ":" "
	};
	return text.split("").map(c => map[c] || c).join("");
}

module.exports = {
	config: {
		name: "count",
		aliases: ["c"],
		version: "1.4",
		author: "Arijit",
		countDown: 5,
		role: 0,
		category: "box chat"
	},

	onStart: async function ({ args, threadsData, message, event, api }) {
		const { threadID, senderID } = event;
		const members = await threadsData.get(threadID, "members");
		const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;

		let list = [];

		for (const u of members) {
			if (!usersInGroup.includes(u.userID)) continue;
			list.push({
				uid: u.userID,
				name: toBoldUnicode(u.name),
				count: u.count
			});
		}

		list.sort((a, b) => b.count - a.count);

		/* ===== count all ===== */
		if (args[0] && args[0].toLowerCase() === "all") {
			list = list.slice(0, 50);
			let msg = "Number of messages of members:\n";

			list.forEach((u, i) => {
				if (i === 0) msg += `🥇 ${u.name}: ${toBoldUnicode(String(u.count))}\n`;
				else if (i === 1) msg += `🥈 ${u.name}: ${toBoldUnicode(String(u.count))}\n`;
				else if (i === 2) msg += `🥉 ${u.name}: ${toBoldUnicode(String(u.count))}\n`;
				else msg += `${i + 1}. ${u.name}: ${toBoldUnicode(String(u.count))}\n`;
			});

			return message.reply(msg.trim(), (err, info) => {
				if (err) return;
				setTimeout(() => api.unsendMessage(info.messageID), 15000);
			});
		}

		/* ===== count (self) ===== */
		const rank = list.findIndex(u => u.uid === senderID) + 1;
		const me = list.find(u => u.uid === senderID);
		if (!me) return;

		const selfMsg = toBoldUnicode(
			`You are ranked ${rank} and have sent ${me.count} messages in this group`
		);

		return message.reply(selfMsg, (err, info) => {
			if (err) return;
			setTimeout(() => api.unsendMessage(info.messageID), 15000);
		});
	},

	onChat: async ({ usersData, threadsData, event }) => {
		const { senderID, threadID } = event;
		const members = await threadsData.get(threadID, "members");
		const user = members.find(u => u.userID === senderID);

		if (!user) {
			members.push({
				userID: senderID,
				name: await usersData.getName(senderID),
				inGroup: true,
				count: 1
			});
		} else user.count++;

		await threadsData.set(threadID, members, "members");
	}
};
