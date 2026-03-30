const mongoose = require("mongoose");

module.exports = {
config: {
name: "dice",
version: "6.6",
author: "Arijit",
countDown: 10,
role: 0,
shortDescription: "Play dice with 2x/3x multipliers",
category: "game",
guide: "{pn} <amount>"
},

onStart: async function({ event, message, args, usersData }) {
const parseBet = input => {
if (!input) return NaN;
input = input.toString().toUpperCase();
const match = input.match(/^(\d+(?:.\d+)?)([KMBTQ]?)$/);
if (!match) return NaN;
let amount = parseFloat(match[1]);
switch (match[2]) {
case "K": amount *= 1e3; break;
case "M": amount *= 1e6; break;
case "B": amount *= 1e9; break;
case "T": amount *= 1e12; break;
case "Q": amount *= 1e15; break;
}
return Math.floor(amount);
};

const formatMoney = n => {  
  if (n >= 1e15) return (n / 1e15).toFixed(0).replace(/\.0+$/, "") + "𝐐";  
  if (n >= 1e12) return (n / 1e12).toFixed(0).replace(/\.0+$/, "") + "𝐓";  
  if (n >= 1e9) return (n / 1e9).toFixed(0).replace(/\.0+$/, "") + "𝐁";  
  if (n >= 1e6) return (n / 1e6).toFixed(0).replace(/\.0+$/, "") + "𝐌";  
  if (n >= 1e3) return (n / 1e3).toFixed(0).replace(/\.0+$/, "") + "𝐊";  
  return n.toString();  
};  

const bet = parseBet(args[0]);  
if (!bet || bet <= 0) return message.reply("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐛𝐞𝐭!");  
if (bet > 50000000) return message.reply("❌ 𝐌𝐚𝐱 𝐛𝐞𝐭 𝐢𝐬 50𝐌.");  

const userId = event.senderID;  
const now = Date.now();  
const sevenHours = 7 * 60 * 60 * 1000; // 7 hours in ms  

// Dice limit per user  
const DiceLimit = mongoose.models.DiceLimit || mongoose.model("DiceLimit", new mongoose.Schema({  
  userId: String,  
  plays: { type: Number, default: 0 },  
  reset: Number  
}));  

let limit = await DiceLimit.findOne({ userId });  
if (!limit) limit = new DiceLimit({ userId, plays: 0, reset: now + sevenHours });  

// Reset after 7 hours  
if (now > limit.reset) {  
  limit.plays = 0;  
  limit.reset = now + sevenHours;  
}  

if (limit.plays >= 15) {  
  const ms = limit.reset - now;  
  const h = Math.floor(ms / 3600000);  
  const m = Math.floor((ms % 3600000) / 60000);  
  return message.reply(`❌ | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐲𝐨𝐮𝐫 𝐝𝐢𝐜𝐞 𝐥𝐢𝐦𝐢𝐭. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 in ${h}𝐡 ${m}𝐦.`);  
}  

limit.plays += 1;  
await limit.save();  

// User balance  
let balance = await usersData.get(userId, "money") || 0;  
if (bet > balance) return message.reply(`❌ 𝐍𝐨𝐭 𝐞𝐧𝐨𝐮𝐠𝐡 𝐛𝐚𝐥𝐚𝐧𝐜𝐞! 𝐘𝐨𝐮𝐫 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${formatMoney(balance)}`);  

// Dice rolls  
const userRoll = Math.floor(Math.random() * 6) + 1;  
const botRoll = Math.floor(Math.random() * 6) + 1;  
let msg = `🎲 𝐘𝐨𝐮 𝐫𝐨𝐥𝐥𝐞𝐝: ${userRoll}\n🤖 𝐁𝐨𝐭 𝐫𝐨𝐥𝐥𝐞𝐝: ${botRoll}\n\n`;  

// Multipliers (Win rate = 45%)  
const r = Math.random();  
let multiplier = -1;  

// 2x win = 35%, 3x win = 10%  
if (r <= 0.35) multiplier = 2;   // 35% chance  
else if (r <= 0.45) multiplier = 3; // 10% chance  

if (multiplier > 0) {  
  const win = bet * multiplier;  
  balance += win;  
  await usersData.set(userId, balance, "money");  
  msg += `• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐰𝐨𝐧 ${formatMoney(win)} ✨`;  
} else {  
  balance -= bet;  
  await usersData.set(userId, balance, "money");  
  msg += `• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 ${formatMoney(bet)} 🥺`;  
}  

return message.reply(msg);

}
};
