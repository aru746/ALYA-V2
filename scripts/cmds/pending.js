module.exports = {
  config: {
    name: "pending",
    aliases: ["pen"],
    version: "1.1",
    author: "Arijit",
    countDown: 5,
    role: 2,
    shortDescription: { vi: "", en: "" },
    longDescription: { vi: "", en: "" },
    category: "group"
  },

  langs: {
    en: {
      invaildNumber: "%1 is not a valid number",
      cancelSuccess: "Refused %1 thread!",
      approveSuccess: "Approved successfully %1 threads!",
      cantGetPendingList: "Can't get the pending list!",
      returnListPending: "»「PENDING」«❮ The whole number of threads to approve is: %1 thread ❯\n\n%2",
      returnListClean: "「PENDING」There is no thread in the pending list"
    }
  },

  onReply: async function ({ api, event, Reply, getLang }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    const axios = require("axios");
    const fs = require("fs-extra");
    let count = 0;

    if ((isNaN(body) && body.indexOf("c") === 0) || body.indexOf("cancel") === 0) {
      const index = (body.slice(1)).split(/\s+/);
      for (const singleIndex of index) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) 
          return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);
        api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[singleIndex - 1].threadID);
        count++;
      }
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    } else {
      const index = body.split(/\s+/);
      for (const singleIndex of index) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) 
          return api.sendMessage(getLang("invaildNumber", singleIndex), threadID, messageID);
        
        // Video pathanor part
        try {
          const path = __dirname + "/cache/approved.mp4";
          const videoUrl = "https://files.catbox.moe/a9w19q.mp4";
          const getVid = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;
          fs.writeFileSync(path, Buffer.from(getVid, "utf-8"));

          await api.sendMessage({
            body: "𝐆𝐫𝐨𝐮𝐩 𝐚𝐩𝐩𝐫𝐨𝐯𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 ✅",
            attachment: fs.createReadStream(path)
          }, Reply.pending[singleIndex - 1].threadID);
          
          fs.unlinkSync(path);
        } catch (e) {
          // Video fail hole text pathabe safe side-er jonno
          api.sendMessage("𝐆𝐫𝐨𝐮𝐩 𝐚𝐩𝐩𝐫𝐨𝐯𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 ✅", Reply.pending[singleIndex - 1].threadID);
        }
        count++;
      }
      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;
    try {
      var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    } catch (e) {
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
    const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);
    for (const single of list) {
      msg += `${index++}/ ${single.name} (${single.threadID})\n`;
    }
    if (list.length !== 0) {
      return api.sendMessage(
        getLang("returnListPending", list.length, msg),
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            pending: list
          });
        },
        messageID
      );
    } else {
      return api.sendMessage(getLang("returnListClean"), threadID, messageID);
    }
  }
};
