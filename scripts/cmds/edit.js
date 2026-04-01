const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const sharp = require("sharp");

module.exports = {
  config: {
    name: "edit",
    aliases: ["e"],
    version: "6.5",
    author: "Arafat",
    countDown: 10,
    role: 3,
    shortDescription: { en: "AI Image Editor with Multi-Model support" },
    category: "image"
  },

  onStart: async function ({ message, event, args, api }) {
    const { messageReply, messageID } = event;

    try {
      if (!messageReply || !messageReply.attachments || messageReply.attachments[0].type !== "photo" || args.length === 0) {
        return message.reaction("❌", messageID);
      }

      const configRes = await axios.get("https://raw.githubusercontent.com/Arafat-Core/cmds/refs/heads/main/api.json");
      const baseApi = configRes.data.edit;

      let modelPath = "nanobanana2"; 
      let prompt = args.join(" ");
      let modelDisplayName = "Nanobanana 3.1";
      let useCustomModel = false;

      const inputModel = args[0].toLowerCase();
      const modelMap = {
        "-q2": { path: "qwen2", name: "Qwen 2.0" },
        "-n2": { path: "nanobanana2", name: "Nanobanana 3.1" },
        "-q": { path: "qwen", name: "Qwen Plus" },
        "-n": { path: "nanobanana", name: "Nanobanana 2.5" },
        "-on": { path: "oldnanobanana", name: "Old Nanobanana" },
        "-s": { path: "seedream", name: "Seedream" },
        "-g": { path: "gpt", name: "GPT 1.5" }
      };

      if (modelMap[inputModel]) {
        modelPath = modelMap[inputModel].path;
        modelDisplayName = modelMap[inputModel].name;
        prompt = args.slice(1).join(" ");
        useCustomModel = true;
      }

      if (!prompt) return message.reply("Please provide a prompt!");

      message.reaction("⏳", messageID);
      
      let loadingMsg;
      if (useCustomModel) {
        loadingMsg = await api.sendMessage(`[ ${modelDisplayName} ] Loading your request.......!!`, event.threadID);
      }

      const imageUrl = messageReply.attachments[0].url;
      const finalUrl = `${baseApi}/${modelPath}?url=${encodeURIComponent(imageUrl)}&prompt=${encodeURIComponent(prompt)}`;

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const tempPath = path.join(cacheDir, `edit_${Date.now()}.tmp`);
      const filePath = path.join(cacheDir, `edit_${Date.now()}.jpeg`);

      const response = await axios({
        method: "GET",
        url: finalUrl,
        responseType: "arraybuffer",
        timeout: 300000
      }).catch(() => { return null; });

      if (!response) {
        message.reaction("❌", messageID);
        if (loadingMsg) api.unsendMessage(loadingMsg.messageID);
        return message.reply("Server Busy or Pool Exhausted!");
      }

      fs.writeFileSync(tempPath, response.data);

      await sharp(tempPath)
        .jpeg({ quality: 90 })
        .toFile(filePath);

      fs.unlinkSync(tempPath);

      if (loadingMsg) api.unsendMessage(loadingMsg.messageID);

      await message.reply({
        body: useCustomModel ? `✅ ${modelDisplayName} image edit successful!` : "",
        attachment: fs.createReadStream(filePath)
      });

      message.reaction("✅", messageID);
      
      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, 10000);

    } catch (error) {
      console.error(error);
      message.reaction("❌", messageID);
    }
  }
};
