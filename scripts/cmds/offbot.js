module.exports = {
	config: {
		name: "offbot",
		version: "1.0",
		author: "Samir",
		countDown: 45,
		role: 2,
		shortDescription: "Turn off bot",
		longDescription: "Turn off bot",
		category: "admin",
		guide: "{p}{n}"
	},
	onStart: async function ({event, api}) {
		api.sendMessage("╔════ஜ۩۞۩ஜ═══╗\n\n📴Successfully Turned Off Archives System ✅\n╚════ஜ۩۞۩ஜ═══╝",event.threadID, () =>process.exit(0))}
};
