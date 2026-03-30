const axios = require("axios");

const userAccess = {}; // To store who is entering the key

module.exports = {
  config: {
    name: "girl",
    aliases: ["g"],
    version: "2.0",
    author: "AceGun",
    countDown: 5,
    role: 0, // Anyone can trigger, but access restricted by UID
    shortDescription: "Send a random girl photo (only owner)",
    longDescription: "Only owner (UID 100069254151118) can access this command. Requires password verification.",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message, event }) {
    const ownerUID = "100069254151118";

    // ✅ Check if the user is the owner
    if (event.senderID !== ownerUID) {
      return message.reply("🚫 | You are not authorized to use this command.");
    }

    // ✅ Ask for security key
    message.reply("🔒 | Please enter the security key to continue...");

    // Store waiting state for this user
    userAccess[event.senderID] = { waitingForKey: true };
  },

  onChat: async function ({ event, message }) {
    const ownerUID = "100069254151118";
    const securityKey = "2005";

    // ✅ Only owner can continue
    if (event.senderID !== ownerUID) return;

    // ✅ If waiting for password
    if (userAccess[event.senderID]?.waitingForKey) {
      const userKey = event.body.trim();

      // Check key
      if (userKey === securityKey) {
        userAccess[event.senderID] = { verified: true };
        message.reply("✅ | Security key verified successfully! Sending image...");

        // ✅ All Girl Image Links
        const link = [
          "https://i.postimg.cc/wTJNSC1G/E-B9ea-WQAAst-Yg.jpg",
          "https://i.postimg.cc/sgrWyTSD/E-B9eb-AWUAINyt-B.jpg",
          "https://i.postimg.cc/TYcj48LJ/E02i-P-q-XIAE62tu.jpg",
          "https://i.postimg.cc/MpK0ks12/E02i-P-w-WYAEbvgg.jpg",
          "https://i.postimg.cc/k5LWbqzq/E02i-P-x-XIAAy-K2k.jpg",
          "https://i.postimg.cc/BQsV6Wqy/E02i-P-r-XAAAFvv6.jpg",
          "https://i.postimg.cc/NL4r6G5y/E02i-P-s-XIAEWS-GB.jpg",
          "https://i.postimg.cc/9Qyfdj8C/E02i-P-t-XEAEC-V88.jpg",
          "https://i.postimg.cc/zfKZ6M8j/E02i-P-u-WQAEk7w-A.jpg",
          "https://i.postimg.cc/gJDLVddj/E02i-P-v-WQAEh-Mr-P.jpg",
          "https://i.postimg.cc/15y5qQwS/E02i-P-w-WYAAGQeh.jpg",
          "https://i.postimg.cc/2j7kBBbY/E02i-P-x-XIAE8-Nf7.jpg",
          "https://i.postimg.cc/K8xMgGjC/E02i-P-y-XMAEQb4p.jpg",
          "https://i.postimg.cc/t4LGP7Pt/E02i-P-z-XEAQo-Ivn.jpg",
          "https://i.postimg.cc/7YZb7RZ7/E02i-P-0-WUAM2j9-A.jpg",
          "https://i.postimg.cc/y6nBBp8y/E02i-P-1-WUAAMh6d.jpg",
          "https://i.postimg.cc/GtVhf1R3/E02i-P-2-X0-AIYz-Ep.jpg",
          "https://i.postimg.cc/TY7wHTZg/E02i-P-3-X0-AIp-Vlw.jpg",
          "https://i.postimg.cc/dQwJfskc/E02i-P-4-WYAI0t-Fc.jpg",
          "https://i.postimg.cc/ZqvbsRrm/E02i-P-5-WYAAj-Dod.jpg",
          "https://i.postimg.cc/DwF9bxW0/E02i-P-6-WUAMIR7d.jpg",
          "https://i.postimg.cc/jdq5t6MT/E02i-P-7-WQAE3r7m.jpg",
          "https://i.postimg.cc/3rY0nN7V/E02i-P-8-WUAEv7p.jpg",
          "https://i.postimg.cc/3wHBw9R0/E02i-P-9-XMAAQ8u-L.jpg",
          "https://i.postimg.cc/7ZfPr7fc/E02i-P-10-WYAQxt.jpg",
          "https://i.postimg.cc/9FRNLcR2/E02i-P-11-WQAA7m-AK.jpg",
          "https://i.postimg.cc/zB7Gtn9j/E02i-P-12-WYAAp-PDH.jpg",
          "https://i.postimg.cc/VLr9bWbD/E02i-P-13-XIAAMx.jpg",
          "https://i.postimg.cc/ncPrb1C6/E02i-P-14-WYAAg5o-K.jpg",
          "https://i.postimg.cc/W4HNjv7g/E02i-P-15-WUAIx.jpg",
          "https://i.postimg.cc/XYY2KKNL/E4-Uv1-RDUYAMAh.jpg"
        ];

        const randomImg = link[Math.floor(Math.random() * link.length)];

        try {
          const imgStream = (await axios.get(randomImg, { responseType: "stream" })).data;
          await message.reply({ attachment: imgStream });
        } catch (e) {
          console.error(e);
          message.reply("❌ | Failed to load image, try again.");
        }

        // Reset after sending
        delete userAccess[event.senderID];
      } else {
        message.reply("❌ | Incorrect security key. Access denied.");
        delete userAccess[event.senderID];
      }
    }
  }
};
