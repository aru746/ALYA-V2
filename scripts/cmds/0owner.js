module.exports = {
  config: {
    name: "owner",
    version: "1.0",
    author: "𝙰𝚁𝙸 𝙹𝙸𝚃 ♫︎",
    countDown: 5,
    role: 0,
    shortDescription: "bot owner info (noprefix)",
    longDescription: "Shows bot owner info without needing prefix",
    category: "auto"
  },

  onStart: async function () {},

  onChat: async function ({ event, message, usersData, threadsData }) {
    if (!event.body) return;
    const body = event.body.toLowerCase();

    // Trigger words
    const triggers = ["owner", "bot owner", "who is owner", "alya owner"];
    if (!triggers.includes(body)) return;

    const userData = await usersData.get(event.senderID);
    const threadData = await threadsData.get(event.threadID);
    const threadName = threadData.threadName;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric"
    });
    const timeStr = now.toLocaleTimeString("en-US", {
      timeZone: "Asia/Dhaka",
      hour12: true
    });

    const infoMessage = `╭── ✦ 𝗢𝗪𝗡𝗘𝗥 ✦ ───
├─ 𝗡𝗮𝗺𝗲: 𝐀𝐫𝐢 𝐉𝐢𝐭 ♫︎
├─ 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲: 𝐀𝐫𝐮 ♫︎
├─ 𝗔𝗱𝗱𝗿𝗲𝘀𝘀: 𝐊𝐨𝐥𝐤𝐚𝐭𝐚 🇮🇳         
├─ 𝗚𝗲𝗻𝗱𝗲𝗿: 𝐌𝐚𝐥𝐞 
├─ 𝗔𝗴𝗲: 𝟐𝟎
├─ 𝗕𝗶𝗿𝘁𝗵𝗱𝗮𝘆: 𝟐𝟏/𝟎𝟓/𝟐𝟎𝟎𝟓
├─ 𝗙𝗯: 𝐍𝐞𝐟𝐚𝐫𝐢𝐨𝐮𝐬 𝐀𝐫𝐢𝐣𝐢𝐭 𝐈𝐈
├─ 𝗜𝗻𝘀𝘁𝗮: 𝐢𝐭𝐳__𝐚𝐫𝐢𝐣𝐢𝐭__𝟕𝟕𝟕  
╰────────────────
╭────────────────
├─ 𝐁𝐎𝐓: 𝙰𝙻𝚈𝙰 𝙱𝙾𝚃 ♫︎       
├─ 𝐆𝐂: ${threadName}
├─ 𝐓𝐢𝐦𝐞: ${timeStr}
├─ 𝐃𝐚𝐭𝐞: ${dateStr}
╰────────────────`;

    return message.reply({
      body: infoMessage,
      attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/f5y44y.jpg")
    });
  }
};
