const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Ensure global.utils.shortenURL is available
const { shortenURL } = global.utils;

// Primary & fallback APIs
const primaryApi = "https://api.noobs-api.rf.gd/dipto/alldl";
const fallbackApi = "https://api.noobs-api.rf.gd/dipto/m/alldl";

module.exports = {
    config: {
        name: "autodl2",
        version: "1.3.0",
        author: "404 + Optimized + Streamed",
        countDown: 0,
        role: 0,
        description: {
            en: "Automatically download videos from TikTok, Facebook, Instagram, YouTube, Twitter, and more. Optimized for long videos."
        },
        category: "media",
        guide: { en: "[video_link]" }
    },

    onStart: async function () {},

    onChat: async function ({ api, event }) {

        const messageText = event.body?.trim();
        if (!messageText) return;

        // Supported platforms
        const supportedPlatforms = [
            "https://vt.tiktok.com",
            "https://vm.tiktok.com",
            "https://www.tiktok.com/",
            "https://www.facebook.com",
            "https://fb.watch",
            "https://www.instagram.com/",
            "https://youtu.be/",
            "https://youtube.com/",
            "https://x.com/",
            "https://twitter.com/"
        ];

        const isSupported = supportedPlatforms.some(prefix =>
            messageText.startsWith(prefix)
        );
        if (!isSupported) return;

        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        // Make cache folder if not exists
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }

        const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);

        try {
            let videoUrl, videoTitle;

            // Try primary API first
            try {
                const { data } = await axios.get(
                    `${primaryApi}?url=${encodeURIComponent(messageText)}`
                );

                if (!data?.result) throw new Error("Primary API returned no result");

                videoUrl = data.result;
                videoTitle = data.cp || "🎥 Downloaded Video";

            } catch (err) {
                // Try fallback API
                const { data } = await axios.get(
                    `${fallbackApi}?url=${encodeURIComponent(messageText)}`
                );

                if (!data?.url) throw new Error("Fallback API returned no result");

                videoUrl = data.url;
                videoTitle = "🎥 Downloaded Video (Fallback)";
            }

            // Stream the video download
            const downloadResponse = await axios({
                method: "GET",
                url: videoUrl,
                responseType: "stream",
                timeout: 300000 // 5 minutes
            });

            const writer = fs.createWriteStream(filePath);
            downloadResponse.data.pipe(writer);

            // Wait for finish
            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", err => {
                    writer.close();
                    reject(new Error(`File stream error: ${err.message}`));
                });
                downloadResponse.data.on("error", err => {
                    writer.close();
                    reject(new Error(`Download connection error: ${err.message}`));
                });
            });

            // Shorten URL if possible
            let shortUrl = null;
            if (global.utils.shortenURL) {
                try {
                    shortUrl = await shortenURL(videoUrl);
                } catch {}
            }

            // Send video
            await api.sendMessage(
                {
                    body: `${videoTitle}\n🔗 Link: ${shortUrl || videoUrl}`,
                    attachment: fs.createReadStream(filePath)
                },
                event.threadID,
                () => fs.unlink(filePath, () => {}),
                event.messageID
            );

            api.setMessageReaction("✅", event.messageID, () => {}, true);

        } catch (error) {

            api.setMessageReaction("❌", event.messageID, () => {}, true);

            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, () => {});
            }

            api.sendMessage(
                `⚠️ Could not download this video.\nReason: ${
                    error.message.includes("timeout")
                        ? "Download took too long (5-minute limit)."
                        : error.message
                }\n👉 Try another link or make sure the video is public.`,
                event.threadID,
                event.messageID
            );
        }
    }
};
