const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit3",
    version: "1.0.2",
    author: "Arafat",
    cooldowns: 5,
    role: 2,
    category: "image",
    description: "AI edits your photo based on your prompt",
    usages: "edit [prompt] | [image link or reply image]",
    dependencies: { axios: "" },
    aliases: ["edit3", "e3"]
  },

  onStart: async function ({ api, event, args }) {
    try {
      // Check if user replied to an image
      let imageURL = event.messageReply?.attachments?.[0]?.url || null;
      const text = args.join(" ").trim();

      if (!text && !imageURL) {
        return api.sendMessage(
          `🙂 𝐊𝐢𝐬𝐡𝐨 𝐓𝐨 𝐛𝐨𝐥𝐨 𝐤𝐢 𝐤𝐨𝐫𝐛𝐨!\n\n` +
          `🧠 Example:\n▶ #edit make funny face |\n\n` +
          `📸 Reply to an image:\n▶ #edit make funny face`,
          event.threadID,
          event.messageID
        );
      }

      // Split prompt and image link if provided
      const [prompt, linkArg] = text.split("|").map(s => s.trim());
      if (!imageURL && linkArg) imageURL = linkArg;

      if (!prompt || !imageURL) {
        return api.sendMessage(
          `⚠️ Please provide both prompt and image!\n\nExample:\n#edit make cartoon face | https://example.com/photo.jpg`,
          event.threadID,
          event.messageID
        );
      }

      // Validate image link
      imageURL = imageURL.replace(/\s/g, "");
      if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)/i.test(imageURL)) {
        return api.sendMessage(
          "⚠️ Invalid image link or format. Please reply to a valid image or give a direct image URL.",
          event.threadID,
          event.messageID
        );
      }

      // Generate API request
      const apiUrl = `https://arafat-photo-edit-api.vercel.app/editimg?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imageURL)}`;

      // Send waiting message
      const waitingMsg = await api.sendMessage("⏳ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭... <🎀", event.threadID);

      // Create temp folder if not exists
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const outputPath = path.join(cacheDir, `edited_${event.senderID}.jpg`);

      // Fetch edited image
      const response = await axios({
        method: "GET",
        url: apiUrl,
        responseType: "stream"
      });

      // Save to file
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.unsendMessage(waitingMsg.messageID);
        api.sendMessage(
          {
            body: "🎀 𝐃𝐨𝐧𝐞 𝐁𝐚𝐛𝐲 <3",
            attachment: fs.createReadStream(outputPath)
          },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

      writer.on("error", (err) => {
        console.error("File write error:", err);
        api.sendMessage("❌ Failed to save the edited image.", event.threadID, event.messageID);
      });

    } catch (err) {
      console.error("Edit command error:", err);
      api.sendMessage("❌ Failed to generate image. Please try again later.", event.threadID, event.messageID);
    }
  }
};
