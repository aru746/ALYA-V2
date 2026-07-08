const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "autovoice",
		version: "1.1",
		author: "AceGun",
		countDown: 5,
		role: 0,
		shortDescription: "no prefix",
		longDescription: "no prefix",
		category: "auto",
	},
	onStart: async function () { },
	onChat: async function ({ event, message }) {
		if (event.body) {
			const word = event.body.toLowerCase();
			const folderPath = path.join(__dirname, "noprefix");

			const audioResponses = {
				"🐒": { text: "কিরে বানর তোর কি হলো🐒", file: "banortor.mp3" },
				"🖕": { text: "আঙুল তোমার পেছনে ভরে দিবো 😹", file: "angul79.mp3" },
				"😒": { text: "তুমি এটিটিউড দেখাচ্ছো তাতে আমার বাল ছেড়া গেলো😞", file: "attitude.mp3" },
				"🥵": { text: "ছাড়ো না বেবি 😧", file: "betha.mp3" },
				"😺": { text: "😚🫶", file: "billitah.mp3" },
				"👙": { text: "ছিহ কি দেও এইসব", file: "kinedaw.mp3" },
				"💔": { text: "তোমার কি ব্রেকাপ হয়েছে", file: "brkup.mp3" },
				"👻": { text: "ভুত কই থেকে আসলো 😑", file: "buth.mp3" },
				"😙": { text: "লুচ্চামি ছাড় 🙂", file: "cumah.mp3" },
				"🍼": { text: "ফিডার খাও বাবু 😺", file: "fider.mp3" },
				"🤰": { text: "এইটা তুমি কি করলা বাবু", file: "pregnant.mp3" },
				"🐰": { text: "খরগোশ 😘", file: "korgus.mp3" },
				"😡": { text: "রাগ কোরো না 😡", file: "angry.mp3" },
				"😹": { text: "এইভাবে? 😹", file: "Evabe8.mp3" },
				"🤫": { text: "শান্ত হও 😶", file: "sorom.mp3" },
				"😂": { text: "পাগল নাকি? 😂", file: "pagolnaki.mp3" },
				"🙈": { text: "লজ্জা পাস? 🙈", file: "sorom.mp3" },
				"😳": { text: "শরমে পরে গেছি 😳", file: "sorom.mp3" },
				"🥲": { text: "সরি বল 😢", file: "sale.mp3" },
				"😮": { text: "ওয়াও! 😮", file: "ragkoro.mp3" },
				"🤐": { text: "চুপ করো 😶", file: "sabdan.mp3" },
				"😈": { text: "ডাক কিসের? 😈", file: "dakoknogo.mp3" },
				"👁️": { text: "কি দেখছো? 👀", file: "jhal.mp3" },
				"🤭": { text: "সরম পাচ্ছো? 🤭", file: "sorom.mp3" },
				"😵": { text: "ভেতরে যা হইসে! 😵", file: "datcokcok.mp3" },
				"🥴": { text: "আমি কি ভুত? 🥴", file: "amikivut.mp3" },
				"🤯": { text: "মাথা গরম 🤯", file: "amiotmkonk.mp3" },
				"🙃": { text: "উল্টাপাল্টা করো না 🙃", file: "yamate.mp3" },
				"😘": {text: "উফ কাছে আসো জান", file: "kissdei.mp3"},
				"👀": { text: "ফোকাস ওন কেরিয়ার 🤕", file: "Focus on career.mp3" }
			};

			if (audioResponses[word]) {
				const filePath = path.join(folderPath, audioResponses[word].file);

				if (fs.existsSync(filePath)) {
					return message.reply({
						body: `「 ${audioResponses[word].text} 」`,
						attachment: fs.createReadStream(filePath),
					});
				} else {
					return message.reply(`Error: File "${audioResponses[word].file}" not found!`);
				}
			}
		}
	}
};
