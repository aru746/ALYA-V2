const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "10.0",
    author: "Arijit",
    countDown: 5,
    role: 0,
    shortDescription: "ALYA BOT Dashboard",
    longDescription: "Real-time stats with perfect alignment and glowing UI",
    category: "general",
    guide: { en: "uptime" }
  },

  onStart: async function ({ api, event, usersData, threadsData }) {
    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    try {
      const startPing = Date.now();

      // === ডাটাবেস থেকে রিয়েল ডাটা সংগ্রহ ও ফিল্টার ===
      const [allUsers, allThreads] = await Promise.all([
        usersData.getAll(),
        threadsData.getAll()
      ]);
      
      const ping = Date.now() - startPing;

      // Male/Female User Count
      const maleUsers = allUsers.filter(u => u.gender === 2 || u.gender === "male").length;
      const femaleUsers = allUsers.filter(u => u.gender === 1 || u.gender === "female").length;

      // Banned Threads Count
      const bannedThreads = allThreads.filter(t => t.banned === true || t.data?.banned === true).length;

      // === কমান্ড সংখ্যা গণনা ===
      function countCommands(dir) {
        let count = 0;
        try {
          const items = fs.readdirSync(dir);
          for (const item of items) {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
              count += countCommands(fullPath);
            } else if (item.endsWith(".js")) {
              count++;
            }
          }
        } catch (e) {}
        return count;
      }
      const commandsDir = path.join(__dirname, ".."); 
      const totalCmds = countCommands(commandsDir);

      // System Stats
      const uptime = process.uptime();
      const uptimeString = `${Math.floor(uptime / 86400)}D ${Math.floor((uptime % 86400) / 3600)}H ${Math.floor((uptime % 3600) / 60)}M`;
      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
      const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(1);

      // === Canvas Drawing ===
      const canvas = createCanvas(1000, 650);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#0f111a";
      ctx.fillRect(0, 0, 1000, 650);

      // Glowing Neon Outer Border
      ctx.save();
      ctx.shadowBlur = 25;
      ctx.shadowColor = "#00e5ff";
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 5;
      roundRect(ctx, 20, 20, 960, 610, 25, false, true);
      ctx.restore();

      // Header Area
      ctx.fillStyle = "#161b22";
      roundRect(ctx, 45, 40, 910, 80, 15, true);

      // Load Avatar (ALYA Image)
      try {
        const yukiImg = await loadImage("https://files.catbox.moe/oork0u.png");
        ctx.save();
        ctx.beginPath();
        ctx.arc(85, 80, 30, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(yukiImg, 55, 50, 60, 60);
        ctx.restore();
      } catch (e) {}

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText("ALYA BOT - DASHBOARD", 135, 90);

      // --- Grid Boxes with Neon Glow ---
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(0, 229, 255, 0.4)";
      ctx.fillStyle = "#161b22";
      ctx.strokeStyle = "rgba(0, 229, 255, 0.2)";
      ctx.lineWidth = 1;
      
      roundRect(ctx, 45, 140, 280, 470, 15, true, true); // Bot Info
      roundRect(ctx, 345, 140, 310, 230, 15, true, true); // User Stats
      roundRect(ctx, 345, 385, 310, 225, 15, true, true); // Group Stats
      roundRect(ctx, 675, 140, 280, 470, 15, true, true); // System Info
      ctx.shadowBlur = 0;

      // --- BOT INFORMATION ---
      ctx.font = "bold 20px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText("Bot Information", 65, 180);

      const botData = [
        { l: "UPTIME", v: uptimeString, c: "#ff9800", i: "T" },
        { l: "PING", v: `${ping} MS`, c: "#4caf50", i: "S" },
        { l: "COMMANDS", v: totalCmds, c: "#9c27b0", i: "C" },
        { l: "PLATFORM", v: os.platform().toUpperCase(), c: "#2196f3", i: "P" },
        { l: "NODE.JS", v: process.version, c: "#e91e63", i: "N" }
      ];

      botData.forEach((item, idx) => {
        const y = 235 + (idx * 78);
        drawIconCircle(ctx, 80, y, item.c, item.i);
        ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#8b949e";
        ctx.fillText(item.l, 115, y - 5);
        ctx.font = "bold 16px sans-serif"; ctx.fillStyle = "#ffffff";
        ctx.fillText(item.v, 115, y + 15);
      });

      // --- USER STATISTICS ---
      ctx.font = "bold 20px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText("User Statistics", 365, 180);

      drawIconCircle(ctx, 390, 230, "#2196f3", "U");
      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#8b949e";
      ctx.fillText("TOTAL USERS", 425, 225);
      ctx.font = "bold 20px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText(allUsers.length.toLocaleString(), 425, 248);

      drawIconCircle(ctx, 390, 310, "#03a9f4", "♂");
      ctx.font = "bold 10px sans-serif"; ctx.fillStyle = "#8b949e";
      ctx.fillText("MALE", 425, 305);
      ctx.font = "bold 16px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText(maleUsers.toLocaleString(), 425, 325);

      drawIconCircle(ctx, 520, 310, "#f44336", "♀");
      ctx.font = "bold 10px sans-serif"; ctx.fillStyle = "#8b949e";
      ctx.fillText("FEMALE", 555, 305);
      ctx.font = "bold 16px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText(femaleUsers.toLocaleString(), 555, 325);

      // --- GROUP STATISTICS ---
      ctx.font = "bold 20px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText("Group Statistics", 365, 425);

      drawIconCircle(ctx, 390, 475, "#4caf50", "G");
      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#8b949e";
      ctx.fillText("TOTAL GROUPS", 425, 470);
      ctx.font = "bold 20px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText(allThreads.length.toLocaleString(), 425, 495);

      drawIconCircle(ctx, 530, 475, "#ff5722", "X");
      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#8b949e";
      ctx.fillText("BANNED", 565, 470);
      ctx.font = "bold 20px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText(bannedThreads.toLocaleString(), 565, 495);

      // --- SYSTEM PERFORMANCE ---
      ctx.font = "bold 20px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText("System Info", 695, 180);

      drawIconCircle(ctx, 720, 230, "#00bcd4", "H");
      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#8b949e";
      ctx.fillText("CPU CORES", 755, 225);
      ctx.font = "bold 18px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText(`${os.cpus().length} CORES`, 755, 250);

      ctx.font = "bold 11px sans-serif"; ctx.fillStyle = "#8b949e";
      ctx.fillText("RAM USAGE", 755, 315);
      ctx.fillStyle = "#30363d";
      roundRect(ctx, 755, 330, 180, 10, 5, true);
      ctx.fillStyle = "#00e5ff";
      roundRect(ctx, 755, 330, 180 * (usedMem / totalMem), 10, 5, true);
      ctx.font = "bold 14px sans-serif"; ctx.fillStyle = "#ffffff";
      ctx.fillText(`${usedMem}GB / ${totalMem}GB`, 755, 365);

      // Footer
      ctx.textAlign = "center";
      ctx.font = "bold 13px sans-serif"; ctx.fillStyle = "#8b949e";
      ctx.fillText("© 2026 ALYA BOT - MADE BY ARIJIT", 500, 635);

      const imgPath = path.join(cacheDir, `yuki_v10_${event.senderID}.png`);
      fs.writeFileSync(imgPath, canvas.toBuffer());

      return api.sendMessage({
        body: "",
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | Failed to load dashboard stats.", event.threadID);
    }
  }
};

// --- Helpers ---
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawIconCircle(ctx, x, y, color, char) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(char, x, y + 6);
  ctx.restore();
}
