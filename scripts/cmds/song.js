const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

/* ================= AUTO DELETE FILE ================= */
function deleteAfterTimeout(filePath, timeout = 15000) {
 setTimeout(() => {
 if (fs.existsSync(filePath)) {
 fs.unlink(filePath, (err) => {
 if (!err) console.log(`✅ Deleted: ${filePath}`);
 else console.error(`❌ Delete error: ${filePath}`);
 });
 }
 }, timeout);
}

/* ================= COMMAND ================= */
module.exports = {
 config: {
 name: "song",
 aliases: ["music"],
 version: "4.1.0",
 prefix: false,
 author: "MR᭄﹅ MAHABUB﹅ メꪜ",
 countDown: 5,
 role: 0,
 shortDescription: "Download MP3 using YouTube search",
 longDescription: "Search YouTube then download audio via Mahabub API",
 category: "music",
 guide: "{p}{n} <song name>",
 },

 onStart: async function ({ api, event, args }) {
 if (!args.length) {
 return api.sendMessage(
 "» উফফ 😾 কোন গান শুনতে চাস একটু লিখে দে!",
 event.threadID,
 event.messageID
 );
 }

 const songName = args.join(" ");
 let searchMsg;

 try {
 /* 🔍 Searching message */
 searchMsg = await api.sendMessage(
 `🔍 Searching for "${songName}"...`,
 event.threadID
 );

 /* 🔎 YouTube search */
 const result = await ytSearch(songName);
 if (!result.videos || result.videos.length === 0) {
 throw new Error("No YouTube results found");
 }

 const top = result.videos[0];
 const ytUrl = `https://youtu.be/${top.videoId}`;

 /* 🌐 Fetch audio from API */
 const apiUrl = `https://mahabub-apis.fun/mahabub/ytmp3?url=${encodeURIComponent(
 ytUrl
 )}`;

 const { data } = await axios.get(apiUrl);

 /* ✅ FIXED RESPONSE CHECK */
 if (data.status !== "success" || !data.audio) {
 throw new Error("Audio link not found from API");
 }

 const title = data.title || top.title || "Unknown Title";
 const audioLink = data.audio;

 /* ✏ Update search message */
 await api.editMessage(
 `✅ FOUND: ${title}\n⬇ Downloading...`,
 searchMsg.messageID
 );

 /* 📂 File path */
 const safeName = title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);

 const ext = audioLink.includes(".mp3")
 ? "mp3"
 : audioLink.includes(".m4a")
 ? "m4a"
 : "mp3";

 const cacheDir = path.join(__dirname, "cache");
 const filePath = path.join(cacheDir, `${safeName}.${ext}`);

 if (!fs.existsSync(cacheDir)) {
 fs.mkdirSync(cacheDir, { recursive: true });
 }

 /* ⬇ Download audio */
 const file = fs.createWriteStream(filePath);
 await new Promise((resolve, reject) => {
 https
 .get(audioLink, (res) => {
 if (res.statusCode === 200) {
 res.pipe(file);
 file.on("finish", () => file.close(resolve));
 } else {
 reject(
 new Error(`Download failed (status ${res.statusCode})`)
 );
 }
 })
 .on("error", reject);
 });

 /* 🎵 Send audio */
 await api.sendMessage(
 {
 body: `🎶 ${title}\n✅ Download complete`,
 attachment: fs.createReadStream(filePath),
 },
 event.threadID,
 (err) => {
 if (!err) deleteAfterTimeout(filePath, 10000);
 },
 event.messageID
 );

 /* ✅ Final update */
 await api.editMessage(`✅ Sent: ${title}`, searchMsg.messageID);
 } catch (err) {
 console.error("❌ Song Error:", err.message);

 if (searchMsg?.messageID) {
 api.editMessage(
 `❌ Failed: ${err.message}`,
 searchMsg.messageID
 );
 } else {
 api.sendMessage(
 `❌ Failed: ${err.message}`,
 event.threadID,
 event.messageID
 );
 }
 }
 },
};
