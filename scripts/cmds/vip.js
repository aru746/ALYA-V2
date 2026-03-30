const axios = require("axios");

const FONT_URL =
  "https://raw.githubusercontent.com/Arafat-Core/Arafat-Temp/refs/heads/main/font.json";

let FONT_MAP = null;

async function loadFont() {
  if (FONT_MAP) return FONT_MAP;
  try {
    const res = await axios.get(FONT_URL, { timeout: 5000 });
    FONT_MAP = res.data || {};
  } catch {
    FONT_MAP = {};
  }
  return FONT_MAP;
}

async function font(text = "") {
  const map = await loadFont();
  return text
    .toString()
    .split("")
    .map(c => map[c] || c)
    .join("");
}

const BASE_API = "https://mongodb-api-psi.vercel.app";
const COLLECTION = "aru-vip";
const ADMIN_KEY = "Akhi";
const POWER_USERS = ["61573866391878"];

const isPower = uid => POWER_USERS.includes(uid);

function cleanName(name = "") {
  return name.replace(/^@+/, "").trim();
}

function formatRemaining(ms) {
  if (ms <= 0) return "Expired";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const out = [];
  if (d) out.push(`${d}d`);
  if (h) out.push(`${h}h`);
  if (m && !d) out.push(`${m}m`);
  return out.join(" ");
}

function formatTime12H(ts) {
  const t = new Date(ts).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    hour12: true,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  return t.replace(" am", " AM").replace(" pm", " PM");
}

function formatMoney(num) {
  if (num >= 1_000_000_000)
    return (num / 1_000_000_000).toFixed(num % 1_000_000_000 ? 1 : 0) + "b";
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(num % 1_000_000 ? 1 : 0) + "m";
  return String(num);
}

async function getUserName(api, uid) {
  try {
    const info = await api.getUserInfo(uid);
    return cleanName(info[uid]?.name || "Unknown User");
  } catch {
    return "Unknown User";
  }
}

async function getTarget(api, event, args) {
  if (event.messageReply) {
    const id = event.messageReply.senderID;
    return { id, name: await getUserName(api, id) };
  }
  if (Object.keys(event.mentions || {}).length) {
    const id = Object.keys(event.mentions)[0];
    return { id, name: cleanName(event.mentions[id]) };
  }
  if (args[2]) {
    const id = args[2];
    return { id, name: await getUserName(api, id) };
  }
  return null;
}

async function getCleanVipData() {
  const res = await axios.get(`${BASE_API}/${COLLECTION}`);
  const data = res.data?.data || [];
  const now = Date.now();

  const active = data.filter(v => v.expireAt > now);
  if (active.length !== data.length) {
    await axios.post(
      `${BASE_API}/${COLLECTION}/edit`,
      { json: JSON.stringify(active) },
      { params: { key: ADMIN_KEY } }
    );
  }
  return active;
}

module.exports = {
  config: {
    name: "vip",
    version: "1.0",
    author: "Arafat",
    role: 0,
    description: "Complete VIP System (Admin + Economy)",

    shortDescription: "Slap someone",
    longDescription: "Custom batslap with personal template",
    category: "admin"
  },

  onStart: async function ({ api, event, args, usersData }) {
    const sub = args[0];

    if (!sub) {
      return api.sendMessage(
        await font(
          "VIP COMMANDS\n━━━━━━━━━━━━━━━━━━\n\n" +
          "➤ #vip buy\n" +
          "  └ Buy VIP using your balance\n\n" +
          "➤ #vip gift 1d @user\n" +
          "  └ Gift VIP to someone else\n\n" +
          "➤ #vip list\n" +
          "  └ View all active VIP members\n\n" +
          "➤ #vip my\n" +
          "  └ Check your VIP status"
        ),
        event.threadID
      );
    }

    if (sub === "add") {
      if (!isPower(event.senderID))
        return api.sendMessage(await font("Access denied"), event.threadID);

      if (!args[1])
        return api.sendMessage(
          await font("Use: #vip add 1d [tag|reply|uid]"),
          event.threadID
        );

      const m = args[1].toLowerCase().match(/^(\d+)(s|m|h|d)$/);
      if (!m)
        return api.sendMessage(
          await font("Time format: s / m / h / d\nExample: #vip add 1d"),
          event.threadID
        );

      const unitMap = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
      const timeMs = parseInt(m[1]) * unitMap[m[2]];

      const target = await getTarget(api, event, args);
      if (!target)
        return api.sendMessage(
          await font("Please tag / reply / provide UID"),
          event.threadID
        );

      const data = await getCleanVipData();
      const now = Date.now();

      let index = data.findIndex(v => v.userID === target.id);
      if (index !== -1)
        data[index].expireAt = Math.max(data[index].expireAt, now) + timeMs;
      else {
        data.push({
          userID: target.id,
          name: target.name,
          addedBy: event.senderID,
          addedAt: now,
          expireAt: now + timeMs
        });
        index = data.length - 1;
      }

      await axios.post(
        `${BASE_API}/${COLLECTION}/edit`,
        { json: JSON.stringify(data) },
        { params: { key: ADMIN_KEY } }
      );

      return api.sendMessage(
        await font(
          "VIP ADDED\n━━━━━━━━━━━━━━━━━━\n\n" +
          `➤ Name\n  └ ${target.name}\n\n` +
          `➤ Time Left\n  └ ${formatRemaining(data[index].expireAt - Date.now())}\n\n` +
          `➤ Expire Date\n  └ ${formatTime12H(data[index].expireAt)}`
        ),
        event.threadID
      );
    }

    if (sub === "remove") {
      if (!isPower(event.senderID))
        return api.sendMessage(await font("Access denied"), event.threadID);

      const target = await getTarget(api, event, args);
      if (!target)
        return api.sendMessage(
          await font("Please tag / reply / provide UID"),
          event.threadID
        );

      const data = await getCleanVipData();
      const index = data.findIndex(v => v.userID === target.id);

      if (index === -1)
        return api.sendMessage(
          await font("This user is not a VIP"),
          event.threadID
        );

      data.splice(index, 1);

      await axios.post(
        `${BASE_API}/${COLLECTION}/edit`,
        { json: JSON.stringify(data) },
        { params: { key: ADMIN_KEY } }
      );

      return api.sendMessage(
        await font(
          "VIP REMOVED\n━━━━━━━━━━━━━━━━━━\n\n" +
          `➤ Name\n  └ ${target.name}`
        ),
        event.threadID
      );
    }

    if (sub === "buy" && !args[1]) {
      let txt = "VIP BUY LIST\n━━━━━━━━━━━━━━━━━━\n\n";
      for (let i = 1; i <= 10; i++) txt += `➤ ${i}d = ${i}b\n`;
      txt += "\nUse:\n➤ #vip buy 1d";
      return api.sendMessage(await font(txt), event.threadID);
    }

    if (sub === "buy" && args[1]) {
      const m = args[1].toLowerCase().match(/^(\d+)(d|day)$/);
      if (!m) return;

      const days = parseInt(m[1]);
      if (days < 1 || days > 30) return;

      const cost = days * 1_000_000_000;
      const u = await usersData.get(event.senderID);
      const balance = u.money || 0;

      if (balance < cost)
        return api.sendMessage(
          await font(
            "INSUFFICIENT BALANCE\n━━━━━━━━━━━━━━━━━━\n\n" +
            `➤ Your Balance\n  └ ${formatMoney(balance)}\n\n` +
            `➤ Required\n  └ ${formatMoney(cost)}`
          ),
          event.threadID
        );

      await usersData.set(event.senderID, { money: balance - cost });

      const data = await getCleanVipData();
      const now = Date.now();
      const timeMs = days * 86400000;

      let index = data.findIndex(v => v.userID === event.senderID);
      if (index !== -1)
        data[index].expireAt = Math.max(data[index].expireAt, now) + timeMs;
      else {
        data.push({
          userID: event.senderID,
          name: await getUserName(api, event.senderID),
          addedBy: "BUY",
          addedAt: now,
          expireAt: now + timeMs
        });
        index = data.length - 1;
      }

      await axios.post(
        `${BASE_API}/${COLLECTION}/edit`,
        { json: JSON.stringify(data) },
        { params: { key: ADMIN_KEY } }
      );

      return api.sendMessage(
        await font(
          "VIP PURCHASED\n━━━━━━━━━━━━━━━━━━\n\n" +
          `➤ Days\n  └ ${days}\n\n` +
          `➤ Cost\n  └ ${formatMoney(cost)}\n\n` +
          `➤ Time Left\n  └ ${formatRemaining(data[index].expireAt - Date.now())}\n\n` +
          `➤ Expire Date\n  └ ${formatTime12H(data[index].expireAt)}`
        ),
        event.threadID
      );
    }

    if (sub === "gift" && args[1]) {
      const m = args[1].toLowerCase().match(/^(\d+)(d|day)$/);
      if (!m) return;

      const days = parseInt(m[1]);
      if (days < 1 || days > 30) return;

      const target = await getTarget(api, event, args);
      if (!target) return;

      const cost = days * 1_000_000_000;
      const u = await usersData.get(event.senderID);
      const balance = u.money || 0;

      if (balance < cost)
        return api.sendMessage(
          await font(
            "INSUFFICIENT BALANCE\n━━━━━━━━━━━━━━━━━━\n\n" +
            `➤ Your Balance\n  └ ${formatMoney(balance)}\n\n` +
            `➤ Required\n  └ ${formatMoney(cost)}`
          ),
          event.threadID
        );

      await usersData.set(event.senderID, { money: balance - cost });

      const data = await getCleanVipData();
      const now = Date.now();
      const timeMs = days * 86400000;

      let index = data.findIndex(v => v.userID === target.id);
      if (index !== -1)
        data[index].expireAt = Math.max(data[index].expireAt, now) + timeMs;
      else {
        data.push({
          userID: target.id,
          name: target.name,
          addedBy: `GIFT:${event.senderID}`,
          addedAt: now,
          expireAt: now + timeMs
        });
        index = data.length - 1;
      }

      await axios.post(
        `${BASE_API}/${COLLECTION}/edit`,
        { json: JSON.stringify(data) },
        { params: { key: ADMIN_KEY } }
      );

      return api.sendMessage(
        await font(
          "VIP GIFTED\n━━━━━━━━━━━━━━━━━━\n\n" +
          `➤ To\n  └ ${target.name}\n\n` +
          `➤ Days\n  └ ${days}\n\n` +
          `➤ Cost\n  └ ${formatMoney(cost)}\n\n` +
          `➤ Expire Date\n  └ ${formatTime12H(data[index].expireAt)}`
        ),
        event.threadID
      );
    }

    if (sub === "list") {
      const data = await getCleanVipData();
      if (!data.length)
        return api.sendMessage(await font("VIP LIST\n\nNo active VIP"), event.threadID);

      let text = "VIP LIST\n━━━━━━━━━━━━━━━━━━\n\n";
      data.forEach(u => {
        text +=
          `➤ ${u.name}\n` +
          `  └ Time Left : ${formatRemaining(u.expireAt - Date.now())}\n` +
          `  └ Expire : ${formatTime12H(u.expireAt)}\n\n`;
      });

      return api.sendMessage(await font(text.trim()), event.threadID);
    }

    if (sub === "my") {
      const data = await getCleanVipData();
      const vip = data.find(v => v.userID === event.senderID);

      if (!vip)
        return api.sendMessage(await font("You are not VIP"), event.threadID);

      return api.sendMessage(
        await font(
          "MY VIP STATUS\n━━━━━━━━━━━━━━━━━━\n\n" +
          `➤ Name\n  └ ${vip.name}\n\n` +
          `➤ Time Left\n  └ ${formatRemaining(vip.expireAt - Date.now())}\n\n` +
          `➤ Expire Date\n  └ ${formatTime12H(vip.expireAt)}`
        ),
        event.threadID
      );
    }
  }
};
