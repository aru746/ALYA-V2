const mongoose = require("mongoose");
const Bank = mongoose.models.Bank;

// 🔑 Owner UID
const OWNER_UID = "100069254151118";

module.exports = {
  config: {
    name: "bankset",
    aliases: ["bank-s", "set-bank"],
    version: "2.2",
    author: "Arijit",
    role: 2, // Admin only (extra check by UID)
    category: "admin",
    shortDescription: "Set a user's bank balance by rank number",
    longDescription: "Set a user's real bank balance using their leaderboard rank (1–15). Example: !bankset 4 10M",
    guide: {
      en: "{p}bankset <rank> <amount>\nExample: {p}bankset 4 10M"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    // 🔒 UID permission check
    if (event.senderID !== OWNER_UID) {
      return message.reply("❌ | You do not have permission to use this command.");
    }

    // Validate rank & amount
    if (args.length < 2) return message.reply("❌ | Usage: !bankset <rank> <amount>");

    const rank = parseInt(args[0]);
    if (isNaN(rank) || rank < 1 || rank > 15)
      return message.reply("❌ | Please enter a valid rank between 1 and 15.");

    let amount = args[1];

    // Parse shorthand like 1k, 2M, 3B, 1Q
    function parseAmount(input) {
      let num = parseFloat(input.replace(/[^0-9.]/g, ""));
      if (/k$/i.test(input)) num *= 1e3;
      if (/m$/i.test(input)) num *= 1e6;
      if (/b$/i.test(input)) num *= 1e9;
      if (/t$/i.test(input)) num *= 1e12;
      if (/q$/i.test(input)) num *= 1e15;
      return num;
    }
    amount = parseAmount(amount);
    if (isNaN(amount)) return message.reply("❌ | Invalid amount.");

    // Fetch top 15 users
    const topUsers = await Bank.find().sort({ bank: -1 }).limit(15);
    if (rank > topUsers.length) return message.reply("❌ | That rank doesn’t exist in top 15.");

    const targetUser = topUsers[rank - 1];
    const targetID = targetUser.userID;

    // Update MongoDB bank balance
    await Bank.findOneAndUpdate({ userID: targetID }, { bank: amount });

    // Get username
    let userName;
    try {
      userName = await usersData.getName(targetID);
    } catch {
      userName = targetID;
    }

    // Reply
    return message.reply(
      `[ 🏦 𝐀𝐋𝐘𝐀 𝐁𝐀𝐍𝐊 🏦 ]\n\n` +
      `✅ | Rank #${rank} user's bank balance updated!\n\n` +
      `👤 User: ${userName}\n` +
      `💳 New Balance: $${formatNumberWithFullForm(amount)}`
    );
  }
};

// Helper for formatted numbers
function formatNumberWithFullForm(number) {
  number = Number(number);
  const fullForms = ["", "𝐊", "𝐌", "𝐁", "𝐓", "𝐐"];
  let index = 0;
  while (number >= 1000 && index < fullForms.length - 1) {
    number /= 1000;
    index++;
  }
  return `${number.toFixed(1)}${fullForms[index]}`;
}
