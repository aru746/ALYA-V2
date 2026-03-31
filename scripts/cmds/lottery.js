const mongoose = require("mongoose");

// --- SAFE MODELS --- //
const Ticket = mongoose.models.LotteryTicket || mongoose.model("LotteryTicket", new mongoose.Schema({
  userId: { type: String, required: true },
  ticketNumber: { type: Number, required: true }
}));

const Status = mongoose.models.LotteryStatus || mongoose.model("LotteryStatus", new mongoose.Schema({
  name: String,
  userId: String,
  ticketNumber: Number,
  prize: Number
}));

// --- CONFIG --- //
const MAX_TICKETS = 10; // 20 theke 10 kora hoyeche
const MAX_PER_USER = 3;
const TICKET_PRICE = 50_000_000; // 10,000,000 theke 50,000,000 kora hoyeche

module.exports = {
  config: {
    name: "lottery",
    version: "4.1.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "Lottery game system",
    longDescription: "Buy tickets, compete with others, draw winner.",
    category: "game",
    guide: {
      en: "{pn} buy 1-3 | draw | info | status"
    }
  },

  onStart: async function ({ message, event, usersData, args }) {
    const userId = event.senderID;
    const userData = await usersData.get(userId);
    const subcmd = args[0];

    // BUY
    if (subcmd === "buy") {
      const count = parseInt(args[1]);
      if (isNaN(count) || count < 1 || count > MAX_PER_USER) {
        return message.reply(`❌ | 𝐘𝐨𝐮 𝐜𝐚𝐧 𝐨𝐧𝐥𝐲 𝐛𝐮𝐲 𝐛𝐞𝐭𝐰𝐞𝐞𝐧 1 𝐚𝐧𝐝 ${MAX_PER_USER} 𝐭𝐢𝐜𝐤𝐞𝐭𝐬.`);
      }

      const userTickets = await Ticket.find({ userId });
      if (userTickets.length + count > MAX_PER_USER) {
        return message.reply(`⚠ | 𝐘𝐨𝐮 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐡𝐚𝐯𝐞 ${userTickets.length} 𝐭𝐢𝐜𝐤𝐞𝐭(𝐬). 𝐌𝐚𝐱 𝐚𝐥𝐥𝐨𝐰𝐞𝐝 𝐢𝐬 ${MAX_PER_USER}.`);
      }

      const totalTickets = await Ticket.countDocuments();
      if (totalTickets + count > MAX_TICKETS) {
        return message.reply(`🎫 | 𝐎𝐧𝐥𝐲 ${MAX_TICKETS - totalTickets} 𝐭𝐢𝐜𝐤𝐞𝐭(𝐬) 𝐥𝐞𝐟𝐭.`);
      }

      const userBalance = userData?.money || 0;
      const cost = count * TICKET_PRICE;
      if (userBalance < cost) {
        // Ekhane 1,000,000 diye bhag kore M unit e dekhano hoyeche (50M)
        return message.reply(
          `𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 𝐧𝐞𝐞𝐝 $${cost / 1_000_000}𝐌 𝐭𝐨 𝐛𝐮𝐲 ${count} 𝐭𝐢𝐜𝐤𝐞𝐭(𝐬).\n💼 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞: $${userBalance / 1_000_000}𝐌`
        );
      }

      await usersData.set(userId, {
        ...userData,
        money: userBalance - cost
      });

      const newTickets = [];
      for (let i = 0; i < count; i++) {
        const ticketNumber = (await Ticket.countDocuments()) + 1;
        await Ticket.create({ userId, ticketNumber });
        newTickets.push(ticketNumber);
      }

      return message.reply(
        `✅ 𝐘𝐨𝐮 𝐛𝐨𝐮𝐠𝐡𝐭 ${count} ticket(s).\n🎟 𝐓𝐢𝐜𝐤𝐞𝐭 𝐧𝐮𝐦𝐛𝐞𝐫𝐬: ${newTickets.join(", ")}\n💰 𝐂𝐨𝐬𝐭: $${cost / 1_000_000}𝐌`
      );
    }

    // DRAW
    else if (subcmd === "draw") {
      const totalTickets = await Ticket.countDocuments();
      if (totalTickets < MAX_TICKETS) {
        return message.reply(`⏳ | 𝐎𝐧𝐥𝐲 ${totalTickets}/${MAX_TICKETS} 𝐭𝐢𝐜𝐤𝐞𝐭𝐬 𝐬𝐨𝐥𝐝. 𝐂𝐚𝐧𝐧𝐨𝐭 𝐝𝐫𝐚𝐰 𝐲𝐞𝐭.`);
      }

      const tickets = await Ticket.find();
      const winnerTicket = tickets[Math.floor(Math.random() * tickets.length)];
      const prize = TICKET_PRICE * MAX_TICKETS; // 50M * 10 = 500M

      const winnerData = await usersData.get(winnerTicket.userId);
      const winnerBalance = winnerData?.money || 0;

      await usersData.set(winnerTicket.userId, {
        ...winnerData,
        money: winnerBalance + prize
      });

      await Status.deleteMany({});
      await Status.create({
        name: winnerData.name,
        userId: winnerTicket.userId,
        ticketNumber: winnerTicket.ticketNumber,
        prize
      });

      await Ticket.deleteMany({});

      return message.reply(
        `╭──────────────⭓\n` +
        `├ 🏅 𝐖𝐢𝐧𝐧𝐞𝐫 𝐚𝐧𝐧𝐨𝐮𝐧𝐜𝐞𝐝\n` +
        `├ 🎀 𝐖𝐢𝐧𝐧𝐞𝐫: ${winnerData.name}\n` +
        `├ 🎟 𝐓𝐢𝐜𝐤𝐞𝐭: #${winnerTicket.ticketNumber}\n` +
        `├ 💰 𝐏𝐫𝐢𝐳𝐞: $${prize / 1_000_000}𝐌\n` +
        `╰──────────────⭓\n\n• Prize has been deposited automatically.`
      );
    }

    // INFO
    else if (subcmd === "info") {
      const totalTickets = await Ticket.countDocuments();
      if (totalTickets === 0) {
        return message.reply("📭 | 𝐍𝐨 𝐭𝐢𝐜𝐤𝐞𝐭𝐬 𝐡𝐚𝐯𝐞 𝐛𝐞𝐞𝐧 𝐛𝐨𝐮𝐠𝐡𝐭 𝐲𝐞𝐭.");
      }

      const tickets = await Ticket.find();
      const usersMap = {};
      for (const ticket of tickets) {
        if (!usersMap[ticket.userId]) usersMap[ticket.userId] = [];
        usersMap[ticket.userId].push(ticket.ticketNumber);
      }

      let infoText = `🎰 𝐋𝐨𝐭𝐭𝐞𝐫𝐲 𝐒𝐭𝐚𝐭𝐮𝐬:\n\n🎟 𝐓𝐢𝐜𝐤𝐞𝐭𝐬 𝐬𝐨𝐥𝐝: ${totalTickets}/${MAX_TICKETS}\n💰 𝐏𝐫𝐢𝐳𝐞 𝐩𝐨𝐨𝐥: $${(totalTickets * TICKET_PRICE) / 1_000_000}𝐌\n\n`;

      for (const [uid, ticketNums] of Object.entries(usersMap)) {
        const name = (await usersData.get(uid))?.name || uid;
        infoText += `╭─ ${name}:\n╰──‣ ${ticketNums.length} Ticket${ticketNums.length > 1 ? "s" : ""}\n`;
      }

      return message.reply(infoText.trim());
    }

    // STATUS
    else if (subcmd === "status") {
      const lastStatus = await Status.findOne();
      if (!lastStatus) {
        return message.reply("ℹ | No previous winner yet.");
      }

      return message.reply(
        `🏆 𝐋𝐚𝐬𝐭 𝐖𝐢𝐧𝐧𝐞𝐫:\n👤 ${lastStatus.name}\n🎫 Ticket: #${lastStatus.ticketNumber}\n💰 Prize: $${lastStatus.prize / 1_000_000}𝐌`
      );
    }

    // HELP
    else {
      return message.reply(
        `🎲 | 𝐋𝐨𝐭𝐭𝐞𝐫𝐲 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐔𝐬𝐚𝐠𝐞:\n` +
        `• 𝐁𝐮𝐲: 𝐥𝐨𝐭𝐭𝐞𝐫𝐲 𝐛𝐮𝐲 [1-3]\n` +
        `• 𝐈𝐧𝐟𝐨: 𝐥𝐨𝐭𝐭𝐞𝐫𝐲 𝐢𝐧𝐟𝐨\n` +
        `• 𝐃𝐫𝐚𝐰: 𝐥𝐨𝐭𝐭𝐞𝐫𝐲 𝐝𝐫𝐚𝐰\n` +
        `• 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐥𝐨𝐭𝐭𝐞𝐫𝐲 𝐬𝐭𝐚𝐭𝐮𝐬`
      );
    }
  }
};
