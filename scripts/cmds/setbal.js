// 🔑 Owner UID
const OWNER_UID = "61573866391878";

module.exports = {
  config: {
    name: "setbal",
    aliases: ["setbal"],
    version: "3.1",
    author: "Arijit",
    role: 2,
    category: "owner",
    shortDescription: "Set normal top balance by rank",
    longDescription: "Set normal bot balance using leaderboard rank (1–15).",
    guide: {
      en: "{p}bankset <rank> <amount>\nExample: {p}bankset 3 50M"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {

    // 🔒 Only Owner UID can use
    if (event.senderID !== OWNER_UID) {
      return message.reply("❌ | You do not have permission to use this command.");
    }

    if (args.length < 2)
      return message.reply("❌ | Usage: !setbal <rank> <amount>");

    const rank = parseInt(args[0]);
    if (isNaN(rank) || rank < 1 || rank > 15)
      return message.reply("❌ | Rank must be between 1 and 15.");

    // 💰 Parse amount
    const amount = parseAmount(args[1]);
    if (isNaN(amount) || amount < 0)
      return message.reply("❌ | Invalid amount.");

    // 📊 Get all users
    const allUsers = await usersData.getAll();

    // 🔢 Sort by normal balance (money field)
    const topUsers = allUsers
      .sort((a, b) => (b.money || 0) - (a.money || 0))
      .slice(0, 15);

    if (rank > topUsers.length)
      return message.reply("❌ | That rank does not exist in top 15.");

    const targetUser = topUsers[rank - 1];
    const targetID = targetUser.userID;

    // 🔄 Update ONLY normal balance
    await usersData.set(targetID, {
      money: amount
    });

    // 👤 Get name
    let name;
    try {
      name = await usersData.getName(targetID);
    } catch {
      name = targetID;
    }

    return message.reply(
      `[ 🏆 𝐓𝐎𝐏 𝐁𝐀𝐋𝐀𝐍𝐂𝐄 𝐔𝐏𝐃𝐀𝐓𝐄 🏆 ]\n\n` +
      `✅ Rank #${rank} balance updated\n\n` +
      `👤 User: ${name}\n` +
      `💰 New Balance: $${formatNumber(amount)}`
    );
  }
};


// 🔢 Amount Parser (1k, 5M, 2B, etc)
function parseAmount(input) {
  let num = parseFloat(input.replace(/[^0-9.]/g, ""));
  if (/k$/i.test(input)) num *= 1e3;
  if (/m$/i.test(input)) num *= 1e6;
  if (/b$/i.test(input)) num *= 1e9;
  if (/t$/i.test(input)) num *= 1e12;
  if (/q$/i.test(input)) num *= 1e15;
  return num;
}

// 💎 Format Number
function formatNumber(number) {
  number = Number(number);
  const units = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐"];
  let i = 0;
  while (number >= 1000 && i < units.length - 1) {
    number /= 1000;
    i++;
  }
  return number.toFixed(1) + units[i];
}
