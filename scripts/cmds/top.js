module.exports = {
	config: {
		name: "top",
		version: "69",
		author: "Ew’r Saim | Mahi--",
		countDown: 10,
		role: 0,
		description: {
			vi: "Xem bảng xếp hạng người dùng giàu nhất dưới dạng ảnh.",
			en: "View the top richest users leaderboard as an image."
		},
		category: "group",
		guide: {
			vi: "{pn}",
			en: "{pn}"
		},
		envConfig: {
			"ACCESS_TOKEN": "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"
		}
	},

	langs: {
		vi: {
			leaderboardTitle: "BẢNG XẾP HẠNG GIÀU NHẤT",
			fallbackName: "Người dùng Facebook",
			page: "Trang %1/%2",
			reply: "Phản hồi tin nhắn này kèm số trang để xem tiếp.",
			totalMoney: "Tổng Tiền",
			noData: "❌ Không tìm thấy dữ liệu người dùng."
		},
		en: {
			leaderboardTitle: "TOP RICHEST USERS",
			fallbackName: "Facebook User",
			page: "Page %1/%2",
			reply: "Reply to this message with a page number to see more.",
			totalMoney: "Total Money",
			noData: "❌ No user data found."
		}
	},

	onLoad: function () {
		const { resolve } = require("path");
		const { existsSync, mkdirSync } = require("fs-extra");
		const { execSync } = require("child_process");

		console.log("COMMAND: TOP | Checking for required packages...");
		const packages = ["canvas", "axios", "fs-extra"];
		for (const pkg of packages) {
			try {
				require.resolve(pkg);
			} catch (err) {
				console.error(`COMMAND: TOP | Dependency '${pkg}' not found. Installing...`);
				try {
					execSync(`npm install ${pkg}`, { stdio: "inherit" });
				} catch (installErr) {
					console.error(`COMMAND: TOP | Failed to install '${pkg}'. Please run 'npm install ${pkg}' manually.`);
					throw new Error(`Dependency installation failed for ${pkg}`);
				}
			}
		}

		try {
			const { registerFont } = require("canvas");
			const assetsPath = resolve(__dirname, "assets", "top");
			if (!existsSync(assetsPath)) mkdirSync(assetsPath, { recursive: true });
			const fontPath = resolve(assetsPath, "font.ttf");
			if (existsSync(fontPath)) {
				registerFont(fontPath, { family: "BeVietnamPro" });
			}
		} catch (e) {
			console.error("COMMAND: TOP | Canvas error.", e);
		}
	},

	onStart: async function ({ args, message, api, usersData, getLang, envCommands }) {
		const { Canvas, loadImage } = require("canvas");
		const { resolve } = require("path");
		const { createWriteStream } = require("fs-extra");
		const axios = require("axios");

		const ACCESS_TOKEN = (envCommands.top && envCommands.top.ACCESS_TOKEN) || this.config.envConfig.ACCESS_TOKEN;

		try {
			const allUsers = await usersData.getAll();
			if (!allUsers || allUsers.length === 0) {
				return message.reply(getLang("noData"));
			}

			const topUsers = allUsers
				.sort((a, b) => (b.money || 0) - (a.money || 0))
				.slice(0, 50);

			const formatMoneyShort = (num) => {
				if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T$';
				if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B$';
				if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M$';
				if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K$';
				return num.toLocaleString() + '$';
			};

			const getAvatar = async function (uid, name) {
				try {
					const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}`;
					const response = await axios.get(url, { responseType: 'arraybuffer' });
					return await loadImage(response.data);
				} catch (error) {
					const canvas = new Canvas(512, 512);
					const ctx = canvas.getContext('2d');
					const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
					const bgColor = colors[parseInt(uid) % colors.length];
					ctx.fillStyle = bgColor;
					ctx.fillRect(0, 0, 512, 512);
					ctx.fillStyle = '#FFFFFF';
					ctx.font = '256px sans-serif';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(name.charAt(0).toUpperCase(), 256, 256);
					return await loadImage(canvas.toBuffer());
				}
			};

			const drawCircularAvatar = function (ctx, avatar, x, y, radius) {
				ctx.save();
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.clip();
				ctx.drawImage(avatar, x - radius, y - radius, radius * 2, radius * 2);
				ctx.restore();
			};

			const drawGlowingText = function (ctx, text, x, y, color, size, blur = 15) {
				ctx.font = `bold ${size}px "BeVietnamPro", "sans-serif"`;
				ctx.shadowColor = color;
				ctx.shadowBlur = blur;
				ctx.fillStyle = color;
				ctx.fillText(text, x, y);
				ctx.shadowBlur = 0;
			};

			const fitText = function (ctx, text, maxWidth) {
				let currentText = text;
				if (ctx.measureText(currentText).width > maxWidth) {
					while (ctx.measureText(currentText + '...').width > maxWidth) {
						currentText = currentText.slice(0, -1);
					}
					return currentText + '...';
				}
				return currentText;
			};

			const drawRoundedRect = function (ctx, x, y, width, height, radius) {
				ctx.beginPath();
				ctx.moveTo(x + radius, y);
				ctx.lineTo(x + width - radius, y);
				ctx.arcTo(x + width, y, x + width, y + radius, radius);
				ctx.lineTo(x + width, y + height - radius);
				ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
				ctx.lineTo(x + radius, y + height);
				ctx.arcTo(x, y + height, x, y + height - radius, radius);
				ctx.lineTo(x, y + radius);
				ctx.arcTo(x, y, x + radius, y, radius);
				ctx.closePath();
			};

			const usersPerPage = 15;
			const totalPages = Math.ceil(topUsers.length / usersPerPage);
			let page = parseInt(args[0]) || 1;
			if (page < 1 || page > totalPages) page = 1;
			const startIndex = (page - 1) * usersPerPage;
			const pageUsers = topUsers.slice(startIndex, startIndex + usersPerPage);

			const theme = { primary: '#FFD700', secondary: '#8B949E', bg: ['#010409', '#0D1117'] };
			const canvas = new Canvas(1200, 1800);
			const ctx = canvas.getContext('2d');
			const bgGradient = ctx.createLinearGradient(0, 0, 0, 1800);
			bgGradient.addColorStop(0, theme.bg[0]);
			bgGradient.addColorStop(1, theme.bg[1]);
			ctx.fillStyle = bgGradient;
			ctx.fillRect(0, 0, 1200, 1800);
			
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
			ctx.lineWidth = 1;
			for (let i = 0; i < 1200; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1800); ctx.stroke(); }
			for (let i = 0; i < 1800; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1200, i); ctx.stroke(); }

			ctx.textAlign = 'center';
			drawGlowingText(ctx, getLang("leaderboardTitle"), 600, 100, theme.primary, 60);

			const top3 = topUsers.slice(0, 3);
			const podColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
			const podPositions = [ { x: 600, y: 300, r: 100 }, { x: 250, y: 320, r: 80 }, { x: 950, y: 320, r: 80 } ];
			const rankOrder = [1, 0, 2];

			if (page === 1) {
				for(const i of rankOrder) {
					const user = top3[i];
					if (!user) continue;
					const pos = podPositions[i];
					ctx.strokeStyle = podColors[i];
					ctx.lineWidth = 5;
					ctx.shadowColor = podColors[i];
					ctx.shadowBlur = 20;
					ctx.beginPath(); ctx.arc(pos.x, pos.y, pos.r + 5, 0, Math.PI * 2); ctx.stroke();
					ctx.shadowBlur = 0;
					const avatar = await getAvatar(user.userID, user.name || getLang("fallbackName"));
					drawCircularAvatar(ctx, avatar, pos.x, pos.y, pos.r);
					ctx.textAlign = 'center';
					ctx.font = `bold ${pos.r * 0.3}px sans-serif`;
					ctx.fillStyle = '#FFFFFF';
					ctx.fillText(fitText(ctx, user.name || getLang("fallbackName"), pos.r * 2.2), pos.x, pos.y + pos.r + 40);
					ctx.font = `normal ${pos.r * 0.25}px sans-serif`;
					ctx.fillStyle = theme.secondary;
					ctx.fillText(`${formatMoneyShort(user.money || 0)}`, pos.x, pos.y + pos.r + 75);
				}
			}

			let currentY = page === 1 ? 550 : 200;
			const displayUsers = page === 1 ? topUsers.slice(3, 3 + usersPerPage) : pageUsers;

			for (const user of displayUsers) {
				const rank = topUsers.findIndex(u => u.userID === user.userID) + 1;
				ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
				ctx.fillRect(50, currentY, 1100, 90);
				
				// Rank (#)
				ctx.textAlign = 'center';
				ctx.font = `bold 30px sans-serif`;
				ctx.fillStyle = theme.secondary;
				ctx.fillText(`#${rank}`, 100, currentY + 58);

				// Avatar
				const avatar = await getAvatar(user.userID, user.name || getLang("fallbackName"));
				drawCircularAvatar(ctx, avatar, 190, currentY + 45, 30);
				
				// Name
				ctx.textAlign = 'left';
				ctx.fillStyle = '#FFFFFF';
				ctx.font = `bold 30px sans-serif`;
				ctx.fillText(fitText(ctx, user.name || getLang("fallbackName"), 320), 240, currentY + 58);

				// Balance (Middle Alignment Fix)
				const balanceText = formatMoneyShort(user.money || 0);
				ctx.textAlign = 'center'; // মাঝখানে করার জন্য
				ctx.font = `bold 35px sans-serif`;
				ctx.fillStyle = theme.primary;
				ctx.fillText(balanceText, 620, currentY + 58); // স্ক্রিনশট অনুযায়ী পজিশন

				// Progress Bar (Right side)
				const barMaxWidth = 180;
				const barStartX = 880;
				const progress = (user.money / (topUsers[0].money || 1)) * barMaxWidth;
				
				ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
				drawRoundedRect(ctx, barStartX, currentY + 35, barMaxWidth, 20, 10);
				ctx.fill();

				ctx.fillStyle = theme.primary;
				drawRoundedRect(ctx, barStartX, currentY + 35, Math.max(progress, 15), 20, 10);
				ctx.fill();
				
				currentY += 105;
			}

			const path = resolve(__dirname, 'cache', `top_${message.threadID}.png`);
			const out = createWriteStream(path);
			const stream = canvas.createPNGStream();
			stream.pipe(out);
			out.on('finish', function() {
				message.reply({ attachment: require('fs').createReadStream(path) }, function (err, info) {
					if (!err) {
						global.GoatBot.onReply.set(info.messageID, { 
							commandName: "top", 
							messageID: info.messageID, 
							author: message.senderID, 
							threadID: message.threadID, 
							type: 'leaderboard' 
						});
					}
				});
			});
		} catch (err) {
			console.error("Error creating top leaderboard image:", err);
			message.reply("❌ An error occurred while generating the leaderboard image.");
		}
	},
	
	onReply: async function ({ event, Reply, message, getLang }) {
		if (event.senderID !== Reply.author || Reply.type !== 'leaderboard') return;
		const page = parseInt(event.body);
		if (isNaN(page)) return;
		try {
			message.unsend(Reply.messageID);
			const newArgs = [page.toString()];
			await this.onStart({ 
				...arguments[0], 
				args: newArgs, 
				envCommands: arguments[0].envCommands
			});
		} catch (e) {
			console.error("Error during pagination:", e);
		}
	}
};
