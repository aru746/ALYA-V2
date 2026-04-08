module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.7",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    category: "general"
  },
  onStart: async function({ api, event, args, message }) {
    try {
      const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
      if (this.config.author !== obfuscatedAuthor) {
        return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
      }

      // Group chat ba thread-e shudhu ekbar message jabe
      api.sendMessage("𝐛𝐚𝐛𝐲 𝐜𝐡𝐞𝐜𝐤 𝐲𝐨𝐮𝐫 𝐢𝐧𝐛𝐨𝐱 🐤", event.threadID, event.messageID);
      
      // User-er inbox-e message jabe
      api.sendMessage("𝐡𝐢 𝐛𝐚𝐛𝐲😘", event.senderID);
      
    } catch (error) {
      console.error("error baby: " + error);
    }
  }
};
