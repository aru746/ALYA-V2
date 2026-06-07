const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// Config for 1000x2000 layout
const W = 1000;
const HEADER_H = 160;
const ROW_H = 190; 
const PADDING = 30;
const THUMB_W = 260; 
const THUMB_H = 146;
const FOOT_H = 90;

// Function to clean text
function cleanText(text) {
  if (!text) return "";
  const boldMap = {
    '𝗮': 'a', '𝗯': 'b', '𝗰': 'c', '𝗱': 'd', '𝗲': 'e', '𝗳': 'f', '𝗴': 'g', '𝗵': 'h', '𝗶': 'i', '𝗷': 'j', '𝗸': 'k', '𝗹': 'l', '𝗺': 'm',
    '𝗻': 'n', '𝗼': 'o', '𝗽': 'p', '𝗾': 'q', '𝗿': 'r', '𝘀': 's', '𝘁': 't', '𝘂': 'u', '𝘃': 'v', '𝘄': 'w', '𝘅': 'x', '𝘆': 'y', '𝘇': 'z',
    '𝗔': 'A', '𝗕': 'B', '𝗖': 'C', '𝗗': 'D', '𝗘': 'E', '𝗙': 'F', '𝗚': 'G', '𝗛': 'H', '𝗜': 'I', '𝗝': 'J', '𝗞': 'K', '𝗟': 'L', '𝗠': 'M',
    '𝗡': 'N', '𝗢': 'O', '𝗣': 'P', '𝗤': 'Q', '𝗥': 'R', '𝗦': 'S', '𝗧': 'T', '𝗨': 'U', '𝗩': 'V', '𝗪': 'W', '𝗫': 'X', '𝗬': 'Y', '𝗭': 'Z',
    '𝐚': 'a', '𝐛': 'b', '𝐜': 'c', '𝐝': 'd', '𝐞': 'e', '𝐟': 'f', '𝐠': 'g', '𝐡': 'h', '𝐢': 'i', '𝐣': 'j', '𝐤': 'k', '𝐥': 'l', '𝐦': 'm',
    '𝐧': 'n', '𝐨': 'o', '𝐩': 'p', '𝐪': 'q', '𝐫': 'r', '𝐬': 's', '𝐭': 't', '𝐮': 'u', '𝐯': 'v', '𝐰': 'w', '𝐱': 'x', '𝐲': 'y', '𝐳': 'z',
    '𝐀': 'A', '𝐁': 'B', '𝐂': 'C', '𝐃': 'D', '𝐄': 'E', '𝐅': 'F', '𝐆': 'G', '𝐇': 'H', '𝐈': 'I', '𝐉': 'J', '𝐊': 'K', '𝐋': 'L', '𝐌': 'M',
    '𝐍': 'N', '𝐎': 'O', '𝐏': 'P', '𝐐': 'Q', '𝐑': 'R', '𝐒': 'S', '𝐓': 'T', '𝐔': 'U', '𝐕': 'V', '𝐖': 'W', '𝐗': 'X', '𝐘': 'Y', '𝐙': 'Z',
    '𝟬': '0', '𝟭': '1', '𝟮': '2', '𝟯': '3', '𝟰': '4', '𝟱': '5', '𝟲': '6', '𝟳': '7', '𝟴': '8', '𝟵': '9'
  };
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += boldMap[text[i]] || text[i];
  }
  return result;
}

function formatViews(n) {
  if (!n || n === 0) return "0";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

function truncate(text, maxLen) {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen - 2) + ".." : text;
}

// Function to wrap text into multiple lines
function wrapText(ctx, text, maxWidth) {
  const words = text.split('');
  const lines = [];
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

module.exports = {
  config: {
    name: "sing2",
    version: "3.9",
    author: "Mueid Mursalin Rifat | Fahad Islam",
    countDown: 10,
    role: 0,
    category: "media",
    shortDescription: "Download music with HD UI",
    guide: { en: "{pn} <song name>\n{pn} <song name> -a (auto download first result)" }
  },

  onStart: async function ({ message, args, event }) {
    const raw = args.join(" ");
    if (!raw) return message.reply("🎵 Please provide a song name!\nExample: .sing Believer\n.sing Believer -a (auto download)");

    // Check for auto-download flag
    const isAuto = raw.toLowerCase().includes("-a");
    
    // Remove -a flag from query
    let query = raw.replace(/-a/gi, "").trim();
    if (!query) return message.reply("🎵 Please provide a song name!");

    try {
      const res = await yts(query);
      const allResults = res.videos.slice(0, 24).map((v, i) => ({
        index: i + 1,
        title: v.title,
        channel: v.author.name,
        duration: v.timestamp,
        views: v.views,
        thumbnail: v.thumbnail,
        url: v.url
      }));

      if (allResults.length === 0) return message.reply("❌ No results found.");

      // AUTO MODE - Download first result directly
      if (isAuto) {
        const selected = allResults[0];
        const waitMsg = await message.reply(`🎵 Auto-selecting: ${selected.title.substring(0, 50)}...\n⏳ Downloading...`);
        return handleDownload(selected.url, message, waitMsg.messageID, selected);
      }

      // NORMAL MODE - Show selection UI
      const itemsPerPage = 6; 
      const totalPages = Math.ceil(allResults.length / itemsPerPage);
      
      const imgBuffer = await generateSearchImage(allResults.slice(0, itemsPerPage), query, 1, totalPages);
      const cachePath = path.join(__dirname, "cache", `sing_${Date.now()}.jpg`);
      fs.ensureDirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(cachePath, imgBuffer);

      const sent = await message.reply({ attachment: fs.createReadStream(cachePath) });
      
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "sing",
        messageID: sent.messageID,
        author: event.senderID,
        allResults,
        currentPage: 1,
        totalPages,
        query,
        itemsPerPage
      });
      
      setTimeout(() => { if(fs.existsSync(cachePath)) fs.unlinkSync(cachePath); }, 10000);
      
    } catch (err) {
      console.error(err);
      message.reply("❌ Search error. Try again.");
    }
  },

  onReply: async function ({ event, message, Reply, api }) {
    const { author, allResults, currentPage, totalPages, query, itemsPerPage, messageID } = Reply;
    if (event.senderID !== author) return;

    const input = event.body.toLowerCase().trim();

    // Pagination Logic
    if (["next", "n", ">"].includes(input)) {
      if (currentPage >= totalPages) return message.reply("📌 End of results.");
      return updateUI(message, api, Reply, currentPage + 1);
    }
    if (["prev", "p", "<"].includes(input)) {
      if (currentPage <= 1) return message.reply("📌 First page.");
      return updateUI(message, api, Reply, currentPage - 1);
    }

    // Selection Logic - Only 1-6
    const num = parseInt(input);
    if (!isNaN(num) && num >= 1 && num <= 6) {
        const start = (currentPage - 1) * itemsPerPage;
        const actualIndex = start + num - 1;
        
        if (actualIndex >= allResults.length) {
          return message.reply(`❌ Invalid selection. Please reply with number 1-${Math.min(6, allResults.length - start)}`);
        }
        
        const selected = allResults[actualIndex];
        
        try { await api.unsendMessage(messageID); } catch(e) {}
        
        const waitMsg = await message.reply(`⏳ Processing: 「 ${selected.title.substring(0, 50)} 」...`);
        
        return handleDownload(selected.url, message, waitMsg.messageID, selected);
    } else {
      return message.reply(`📌 Reply with number 1-6 to download • Type "next" or "prev" for more`);
    }
  }
};

// --- HELPER FUNCTIONS ---

async function handleDownload(url, message, waitMsgID, metadata) {
  try {
    const apiUrl = `https://shadowx-api.onrender.com/api/yt?url=${encodeURIComponent(url)}&quality=128&format=mp3`;
    const { data } = await axios.get(apiUrl, { timeout: 20000 });

    if (data.success && data.download_info && data.download_info.fileUrl) {
      const filePath = path.join(__dirname, "cache", `${Date.now()}.mp3`);
      const res = await axios.get(data.download_info.fileUrl, { 
        responseType: "stream",
        timeout: 60000
      });
      const writer = fs.createWriteStream(filePath);
      res.data.pipe(writer);

      writer.on("finish", async () => {
        try { await message.unsend(waitMsgID); } catch(e) {}
        await message.reply({
          body: `🎵 ${metadata.title}\n🎤 ${metadata.channel}\n⏱ ${metadata.duration}\n👁 ${formatViews(metadata.views)} views\n\n 🔖Author: Mueid Mursalin Rifat!`,
          attachment: fs.createReadStream(filePath)
        });
        setTimeout(() => { if(fs.existsSync(filePath)) fs.unlinkSync(filePath); }, 5000);
      });
      
      writer.on("error", async (err) => {
        console.error("Writer error:", err);
        await message.unsend(waitMsgID);
        message.reply("❌ Download failed. Try again.");
      });
    } else {
      throw new Error("API Failed");
    }
  } catch (err) {
    console.error("Download error:", err);
    try { await message.unsend(waitMsgID); } catch(e) {}
    message.reply("❌ Download failed. The API might be down.");
  }
}

async function generateSearchImage(results, query, page, totalPages) {
  const totalH = HEADER_H + (results.length * ROW_H) + FOOT_H;
  const canvas = createCanvas(W, totalH);
  const ctx = canvas.getContext("2d");

  // Modern Electric Blue Style
  const bg = ctx.createLinearGradient(0, 0, 0, totalH);
  bg.addColorStop(0, "#000814");
  bg.addColorStop(1, "#001d3d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, totalH);

  // Header
  ctx.fillStyle = "rgba(0, 53, 102, 0.6)";
  ctx.fillRect(0, 0, W, HEADER_H);
  
  ctx.fillStyle = "#00b4d8";
  ctx.font = "bold 46px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("🎵 SHADOWX MUSIC", PADDING, 85);

  ctx.fillStyle = "#caf0f8";
  ctx.font = "24px 'Segoe UI', Arial, sans-serif";
  const cleanQuery = cleanText(query);
  ctx.fillText(`Results for: ${cleanQuery.length > 55 ? cleanQuery.slice(0, 55) + "..." : cleanQuery} (Page ${page}/${totalPages})`, PADDING, 125);

  // Separator line
  ctx.strokeStyle = "#003566";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(PADDING, HEADER_H - 10);
  ctx.lineTo(W - PADDING, HEADER_H - 10);
  ctx.stroke();

  // Results
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const y = HEADER_H + (i * ROW_H);
    let currentY = y + 30;

    // Alternate row background
    if (i % 2 === 0) {
      ctx.fillStyle = "rgba(0, 53, 102, 0.25)";
      ctx.fillRect(0, y, W, ROW_H);
    }

    // Number
    ctx.fillStyle = "#00b4d8";
    ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(`${r.index}`, PADDING, y + 85);

    // Thumbnail
    const thumbX = PADDING + 60;
    const thumbY = y + (ROW_H - THUMB_H) / 2;

    try {
      const img = await loadImage(r.thumbnail);
      ctx.drawImage(img, thumbX, thumbY, THUMB_W, THUMB_H);
    } catch(e) {
      ctx.fillStyle = "#003566";
      ctx.fillRect(thumbX, thumbY, THUMB_W, THUMB_H);
      ctx.fillStyle = "#00b4d8";
      ctx.font = "18px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("NO IMAGE", thumbX + THUMB_W/2, thumbY + THUMB_H/2);
      ctx.textAlign = "left";
    }

    ctx.strokeStyle = "#0066a0";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(thumbX, thumbY, THUMB_W, THUMB_H);

    const textX = thumbX + THUMB_W + 20;
    
    // Title - full with wrapping
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px 'Segoe UI', Arial, sans-serif";
    const cleanTitle = cleanText(r.title);
    const maxTitleWidth = W - textX - 30;
    const titleLines = wrapText(ctx, cleanTitle, maxTitleWidth);
    
    // Draw title lines
    for (let lineIdx = 0; lineIdx < titleLines.length; lineIdx++) {
      ctx.fillText(titleLines[lineIdx], textX, currentY + (lineIdx * 28));
    }
    
    // Calculate position for channel after title
    const titleHeight = titleLines.length * 28;
    const channelY = currentY + titleHeight + 5;

    // Channel and duration
    ctx.fillStyle = "#00b4d8";
    ctx.font = "18px 'Segoe UI', Arial, sans-serif";
    const cleanChannel = cleanText(r.channel);
    const maxChannelWidth = W - textX - 30;
    let channelText = cleanChannel;
    if (ctx.measureText(channelText).width > maxChannelWidth) {
      channelText = truncate(cleanChannel, 40);
    }
    ctx.fillText(`${channelText} • ${r.duration}`, textX, channelY);

    // Views
    ctx.fillStyle = "#6c757d";
    ctx.font = "16px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(`${formatViews(r.views)} views`, textX, channelY + 25);

    // Row separator
    if (i < results.length - 1) {
      ctx.strokeStyle = "#003566";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PADDING, y + ROW_H);
      ctx.lineTo(W - PADDING, y + ROW_H);
      ctx.stroke();
    }
  }

  // Footer
  const footerY = totalH - FOOT_H + 25;
  ctx.fillStyle = "#caf0f8";
  ctx.textAlign = "center";
  ctx.font = "20px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("📌 Reply 1-6 to Download • Type 'next' or 'prev' for more", W/2, footerY);
  ctx.fillStyle = "#6c757d";
  ctx.font = "15px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Developer: Mueid Mursalin Rifat | Fahad Islam", W/2, footerY + 30);
  ctx.textAlign = "left";

  return canvas.toBuffer("image/jpeg", { quality: 0.92 });
}

async function updateUI(message, api, Reply, newPage) {
    const start = (newPage - 1) * Reply.itemsPerPage;
    const pageResults = Reply.allResults.slice(start, start + Reply.itemsPerPage);
    const imgBuffer = await generateSearchImage(pageResults, Reply.query, newPage, Reply.totalPages);
    const cachePath = path.join(__dirname, "cache", `sing_${Date.now()}.jpg`);
    fs.writeFileSync(cachePath, imgBuffer);
    
    try { await api.unsendMessage(Reply.messageID); } catch(e) {}
    const sent = await message.reply({ attachment: fs.createReadStream(cachePath) });
    global.GoatBot.onReply.set(sent.messageID, { ...Reply, currentPage: newPage, messageID: sent.messageID });
    setTimeout(() => { if(fs.existsSync(cachePath)) fs.unlinkSync(cachePath); }, 10000);
}
