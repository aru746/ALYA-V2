const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const axios = require("axios");

/* ------------------ BANK MODEL ------------------ */
const bankSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    bank: { type: Number, default: 0 },
    lastInterestClaimed: { type: Date, default: Date.now },
    loan: { type: Number, default: 0 },
    loanPayed: { type: Boolean, default: true },
});
const Bank = mongoose.models.Bank || mongoose.model("Bank", bankSchema);

/* ------------------ HELPERS ------------------ */
const deltaNext = 5;
const expToLevel = (exp) => Math.floor((1 + Math.sqrt(1 + 8 * (exp || 0) / deltaNext)) / 2);

function formatStats(n = 0) {
    if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n);
}

module.exports = {
    config: {
        name: "spy",
        aliases: ["card"],
        version: "20.5",
        author: "Arijit",
        description: "Get detailed user information with violet glowing neon presentation card",
        countDown: 10,
        category: "group",
    },
    onStart: async function ({ event, message, api, usersData }) {
        try {
            const uid = event.type === "message_reply" ? event.messageReply.senderID : Object.keys(event.mentions || {})[0] || event.senderID;
            const fb = await api.getUserInfo(uid);
            const user = fb[uid];
            const userData = (await usersData.get(uid)) || {};
            let bankData = await Bank.findOne({ userID: uid }) || await Bank.create({ userID: uid });

            const canvas = createCanvas(1100, 2000);
            const ctx = canvas.getContext("2d");

            // --- PREMIUM VIOLET GRADIENT BACKGROUND ---
            const bgGradient = ctx.createLinearGradient(0, 0, 0, 2000);
            bgGradient.addColorStop(0, "#1e0b2d"); // Deep Violet-Black (Top)
            bgGradient.addColorStop(0.5, "#0b0410"); // Darker Core
            bgGradient.addColorStop(1, "#1e0b2d"); // Deep Violet-Black (Bottom)
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Subtle Violet Glow Dots
            ctx.fillStyle = "rgba(139, 92, 246, 0.08)";
            for (let i = 0; i < 120; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * 1100, Math.random() * 2000, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // --- HEADER WITH GLOW ---
            drawGlowingRect(ctx, 50, 50, 1000, 360, 60, "#160a20", "#38bdf8");

            // --- AVATAR WITH NEON CIRCLE ---
            const graphURL = `https://graph.facebook.com/${uid}/picture?width=1024&height=1024&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            try {
                const response = await axios.get(graphURL, { responseType: 'arraybuffer' });
                const avatar = await loadImage(Buffer.from(response.data));
                
                ctx.save();
                ctx.shadowBlur = 35;
                ctx.shadowColor = "#38bdf8";
                ctx.beginPath();
                ctx.arc(210, 230, 140, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
                ctx.lineWidth = 4;
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(210, 230, 130, 0, Math.PI * 2);
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 10;
                ctx.stroke();
                ctx.clip();
                ctx.drawImage(avatar, 80, 100, 260, 260);
                ctx.restore();
            } catch (e) {
                console.log("Avatar loading error");
            }

            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 65px Sans";
            ctx.fillText(user.name, 380, 190);
            ctx.fillStyle = "#38bdf8";
            ctx.font = "38px Sans";
            ctx.fillText(`UID: ${uid}`, 380, 260);

            const allUsers = await usersData.getAll();
            const level = expToLevel(userData.exp || 0);

            // --- TOP CARDS (With Glow Borders) ---
            const topCards = [
                { label: "BALANCE", value: formatStats(userData.money || 0), color: "#22c55e" },
                { label: "BANK", value: formatStats(bankData.bank || 0), color: "#fbbf24" },
                { label: "LEVEL", value: level, color: "#f87171" }
            ];

            topCards.forEach((card, i) => {
                const x = 50 + (i * 340);
                drawGlowingRect(ctx, x, 450, 320, 180, 30, "#160a20", card.color);
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 30px Sans";
                ctx.fillText(card.label, x + 30, 510);
                ctx.fillStyle = card.color;
                ctx.font = "bold 52px Sans";
                ctx.fillText(card.value, x + 30, 585);
            });

            // --- USER DETAILS SECTION ---
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 45px Sans";
            ctx.fillText("👤 USER DETAILS", 60, 720);

            const joinDate = new Date(userData.createdAt || Date.now()).toLocaleDateString("en-GB");
            const usage = Math.floor((Date.now() - (userData.createdAt || Date.now())) / (1000 * 60 * 60 * 24)) || 1;

            let genderText = "Unknown";
            const g = user.gender;
            if (g === 2 || String(g).toLowerCase() === "male") genderText = "Male";
            else if (g === 1 || String(g).toLowerCase() === "female") genderText = "Female";

            const userDetails = [
                ["Gender", genderText], ["Bot Friend", user.isFriend ? "Yes" : "No"],
                ["Join Date", joinDate], ["Usage", `${usage} Days`]
            ];

            userDetails.forEach((item, i) => {
                const x = 50 + (i % 2) * 510;
                const y = 780 + Math.floor(i / 2) * 120;
                drawGlowingRect(ctx, x, y, 480, 100, 20, "#160a20", "rgba(56, 189, 248, 0.3)");
                ctx.fillStyle = "#ffffff"; ctx.font = "32px Sans";
                ctx.fillText(item[0], x + 30, y + 60);
                ctx.fillStyle = "#38bdf8"; ctx.font = "bold 32px Sans"; ctx.textAlign = "right";
                ctx.fillText(item[1], x + 450, y + 60); ctx.textAlign = "left";
            });

            // --- GAME STATISTICS ---
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 45px Sans";
            ctx.fillText("🎮 GAME STATISTICS", 60, 1100);

            const uData = userData.data || {};
            const gameList = [
                { name: "Quiz", key: "quizWins" }, { name: "Flag", key: "flagWins" },
                { name: "Math", key: "mathWins" }, { name: "FF Quiz", key: "ffWins" },
                { name: "Waifu", key: "waifuWins" }, { name: "AniQuiz", key: "aniWins" },
                { name: "Word Game", key: "wordWins" }, { name: "Football", key: "footballWins" }
            ];

            gameList.forEach((game, i) => {
                const wins = uData[game.key] || 0;
                const gameRank = allUsers
                    .filter(u => (u.data && u.data[game.key] > 0))
                    .sort((a, b) => (b.data[game.key] || 0) - (a.data[game.key] || 0))
                    .findIndex(u => u.userID == uid) + 1 || "N/A";

                const x = 50 + (i % 2) * 510;
                const y = 1160 + Math.floor(i / 2) * 160;
                drawGlowingRect(ctx, x, y, 480, 140, 20, "#160a20", "#38bdf8");
                ctx.fillStyle = "#ffffff"; ctx.font = "bold 36px Sans";
                ctx.fillText(game.name, x + 30, y + 55);
                ctx.fillStyle = "#38bdf8"; ctx.font = "30px Sans";
                ctx.fillText(`${wins} Wins (#${gameRank})`, x + 30, y + 105);
            });

            const imgPath = path.join(__dirname, `spy_violet_${uid}.png`);
            fs.writeFileSync(imgPath, canvas.toBuffer());
            return message.reply({ attachment: fs.createReadStream(imgPath) }, () => fs.unlinkSync(imgPath));

        } catch (err) {
            console.error(err);
            return message.reply("❌ Card generation failed.");
        }
    }
};

function drawGlowingRect(ctx, x, y, width, height, radius, bgColor, glowColor) {
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;
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
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = glowColor;
    ctx.stroke();
    ctx.restore();
}
