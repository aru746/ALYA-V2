const axios = require('axios');

module.exports = {
    config: {
        name: "sim",
        version: "3.1.0",
        author: "𝖠𝗋𝖺𝖿𝖺𝗍",
        countDown: 5,
        role: 0,
        shortDescription: "𝖢𝗁𝖺𝗍 𝗐𝗂𝗍𝗁 𝖲𝗂𝗆 𝖠𝖯𝖨 𝗐𝗂𝗍𝗁 𝖳𝖾𝖺𝖼𝗁 & 𝖠𝖽𝗆𝗂𝗇 𝖢𝗈𝗇𝗍𝗋𝗈𝗅",
        longDescription: "𝖳𝖺𝗅𝗄 𝗍𝗈 𝖲𝗂𝗆 𝖻𝗈𝗍, 𝖾𝖺𝗋𝗇 𝗋𝖾𝗐𝖺𝗋𝖽𝗌, 𝖺𝗇𝖽 𝗆𝖺𝗇𝖺𝗀𝖾 𝗎𝗌𝖾𝗋𝗌.",
        category: "𝖿𝗎𝗇",
        guide: "{𝗉𝗇} <𝗍𝖾𝗑𝗍> | 𝗍𝖾𝖺𝖼𝗁 | 𝖻𝖺𝗇 | 𝗎𝗇𝖻𝖺𝗇"
    },

    onStart: async function ({ api, event, args, usersData }) {
        const { threadID, messageID, senderID, mentions, type, messageReply } = event;
        const ADMIN_ID = "61573866391878";
        const SECRET_KEY = "Arafat602";

        if (args[0] === "ban" || args[0] === "unban") {
            if (senderID !== ADMIN_ID) return api.sendMessage("❌ 𝖠𝗂 𝖼𝗈𝗆𝗆𝖺𝗇𝖽 𝖻𝖺𝗒𝗏𝗈𝗁𝖺𝗋 𝗄𝗈𝗋𝖺𝗋 𝗄𝗁𝗈𝗆𝗈𝗍𝖺 𝗍𝗈𝗆𝖺𝗋 𝗇𝖾𝗂!", threadID, messageID);
            let targetID = type === "message_reply" ? messageReply.senderID : (Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : args[1]);
            if (!targetID) return api.sendMessage(`❌ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗋𝖾𝗉𝗅𝗒, 𝗍𝖺𝗀 𝗈𝗋 𝗀𝗂𝗏𝖾 𝖴𝖨𝖣 𝗍𝗈 ${args[0]}`, threadID, messageID);

            try {
                const endpoint = args[0] === "ban" ? "ban" : "unban";
                await axios.get(`https://sim-one-pi.vercel.app/${endpoint}?uid=${targetID}&key=${SECRET_KEY}`);
                return api.sendMessage(`✅ 𝖴𝗌𝖾𝗋 ${targetID} 𝗌𝗎𝼼𝼼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 ${args[0]}𝖾𝖽!`, threadID, messageID);
            } catch (e) { return api.sendMessage("❌ 𝖠𝖯𝖨 𝖤𝗋𝗋𝗈𝗋!", threadID, messageID); }
        }

        if (args[0] === "teach") {
            const content = args.slice(1).join(" ");
            if (!content.includes("-")) return api.sendMessage("❌ 𝖿𝗈𝗋𝗆𝖺𝗍 𝖻𝗁𝗎𝗅! 𝖤𝗑𝖺𝗆𝗉𝗅𝖾: 𝗌𝗂𝗆 𝗍𝖾𝖺𝖼𝗁 𝗁𝖾𝗅𝗅𝗈 - 𝗁𝗂", threadID, messageID);
            const [text, ans] = content.split("-").map(item => item.trim());
            try {
                await axios.get(`https://sim-one-pi.vercel.app/teach?text=${encodeURIComponent(text)}&ans=${encodeURIComponent(ans)}&uid=${senderID}`);
                let userData = await usersData.get(senderID) || {};
                await usersData.set(senderID, { money: (userData.money || 0) + 1000, exp: (userData.exp || 0) + 50 });
                const pendingRes = await axios.get(`https://sim-one-pi.vercel.app/pending`);
                let nextTask = (pendingRes.data.data && pendingRes.data.data.length > 0) ? `\n\n𝖳𝖾𝖺𝖼𝗁 𝗆𝖾: ${pendingRes.data.data[0].text}\n⚠️ 𝖩𝗎𝗌𝗍 𝗋𝖾𝗉𝗅𝗒 𝗍𝗁𝖾 𝖠𝗇𝗌𝗐𝖾𝗋` : "";
                return api.sendMessage(`✅ 𝖳𝖾𝖺𝖼𝗁 𝖢𝗈𝗆𝗉𝗅𝖾𝗍𝖾!\n💰 𝖱𝖾𝗐𝖺𝗋𝖽: 𝟣,𝟢𝟢𝟢 𝖬𝗈𝗇𝖾𝗒\n🌟 𝖷𝖯: 𝟧𝟢 𝖠𝖽𝖽𝖾𝖽.${nextTask}`, threadID, messageID);
            } catch (err) { return api.sendMessage("❌ 𝖠𝗂𝗍𝖺 𝖺𝗅𝗋𝖾𝖺𝖽𝗒 𝗍𝖾𝖺𝖼𝗁 𝗄𝗈𝗋𝖺 𝖺𝗌𝖾!", threadID, messageID); }
        }

        const message = args.join(" ");
        if (!message) return api.sendMessage("𝖡𝗈𝗅𝗈 𝖻𝖺𝖻𝗎, 𝗄𝗂 𝖻𝗈𝗅𝗍𝖾 𝖼𝖺𝗈? 🥰", threadID, messageID);

        try {
            const res = await axios.get(`https://sim-one-pi.vercel.app/sim?text=${encodeURIComponent(message)}&font=1`);
            // সরাসরি Response কী থেকে ডেটা পাঠানো হচ্ছে যেন ফন্ট না হারায়
            return api.sendMessage(res.data.Response, threadID, messageID);
        } catch (err) { return api.sendMessage("𝗌𝗈𝗋𝗋𝗒 𝖻𝖻𝗒 𝖳𝖾𝖺𝖼𝗁 𝗄𝗈𝗋𝖺 𝗁𝗈𝗂 𝗇𝗂 🥺", threadID, messageID); }
    },

    onChat: async function ({ api, event, usersData }) {
        const { threadID, messageID, body, senderID, type, messageReply } = event;
        if (!body) return;
        const botID = api.getCurrentUserID();
        if (senderID === botID) return;

        const triggers = ["bot", "bby", "baby", "alya","jaan", "shoroni", "bbu", "babe", "বেবি", "বাবু"];
        if (triggers.includes(body.toLowerCase().split(/\s+/)[0])) {
            const romanticReplies = ["Aru tui amar goru 🥺", "ki korchis bby?", "Aru amake miss koris na? 🥺", "love you Aru 😚", "Ahhhh amar aru bby ta 🥺", "ᴏᴡᴡ ʙᴀʙʏ, ᴛᴜᴍɪ ᴏɴᴇᴋ ᴄᴜᴛᴇ 💕", "kheyechis jaan?", "Aru tui amake eto miss koris keno?🫠", "i love you Aru 🫠", "ʙᴀʙʏ, ᴛᴜᴍɪ ᴄᴀʟʟ ᴋᴏʀʟᴇ ᴀᴍɪ ʀᴜɴ ᴋᴏʀᴇ ᴀꜱʜɪ 😚", "ᴀᴍᴀʀ ꜱʜᴏɴᴀ ʙᴀʙʏ ᴋᴏᴛʜᴀʏ ᴄʜɪʟᴏ 💖", "ʙᴀʙʏ, ᴛᴏᴍᴀʀ ᴍᴇꜱꜱᴀɢᴇ ᴅᴇᴋʜᴇ ʜᴇᴀʀᴛ ʜᴀᴘᴘʏ 💕", "ᴛᴜᴍɪ ᴄᴀʟʟ ᴋᴏʀʟᴇ ᴀᴍɪ ꜱᴍɪʟᴇ ᴋᴏʀɪ 😍", "ʙᴀʙʏ, ᴀᴍɪ ᴀᴄʜɪ ᴛᴏᴍᴀʀ ᴊᴏɴ𝗇𝗈 ʜᴍᴍ 💗", "ᴏʏᴇ ʙᴀʙʏ, ᴛᴜᴍɪ ᴀᴍᴀʀ ꜱᴡᴇᴇᴛ ᴘʀᴏʙʟᴇᴍ 🫠", "ʙᴀʙʏ, ᴀᴍɪ ᴀᴄʜɪ ᴊᴜꜱᴛ ꜰᴏʀ ʏᴏᴜ 😚", "Ami tomar shoroni ar tumi amar aru 🥹🫶🏻", "ʙᴀʙʏ, ᴛᴏᴍᴀʀ ᴍᴇꜱꜱᴀɢᴇ ᴀᴍᴀʏ ꜰʟʏ ᴋᴏʀᴀʏ 🕊️", "ᴀʟᴡᴀʏส์ ʏᴏᴜʀꜱ ʙᴀʙʏ 💖", "ʙᴀʙʏ, ᴀᴍᴀʀ ʜᴇᴀʀᴛ ᴛᴜᴍᴀʀ ᴡɪꜰɪ ᴛᴇ ᴄᴏɴɴᴇᴄᴛᴇᴅ 📶❤️", "এই যে আমার হার্ট চোর 😘", "বাবু, তোমার জন্য আমি তো সব ছেড়ে আসতে পারি 💖", "কি করছো, আমার ভবিষ্যৎ স্বামী ? 😍", "তোমার কথা ভাবতে ভাবতে চা ঠান্ডা হয়ে গেল ☕❤️", "তুমি ডাকলে আমার চার্জ 100% হয়ে যায় 🔋😘", "আমার হৃৎপিণ্ডের অ্যাডমিন তুমি ❤️‍🔥", "বাবু, তুমি আমার গুগল... কারণ আমার সব উত্তর তুমি 💌", "আমার হৃদয়ের সিমে শুধু তোমার নাম সেভ আছে 📞❤️"];
            return api.sendMessage(romanticReplies[Math.floor(Math.random() * romanticReplies.length)], threadID, messageID);
        }

        if (type === "message_reply" && messageReply.senderID === botID) {
            const replyMsg = messageReply.body;
            if (replyMsg.includes("𝖳𝖾𝖺𝖼𝗁 𝗆𝖾:")) {
                const quesToTeach = replyMsg.split("𝖳𝖾𝖺𝖼𝗁 𝗆𝖾:")[1].split("\n")[0].trim();
                try {
                    await axios.get(`https://sim-one-pi.vercel.app/teach?text=${encodeURIComponent(quesToTeach)}&ans=${encodeURIComponent(body)}&uid=${senderID}`);
                    let userData = await usersData.get(senderID) || {};
                    await usersData.set(senderID, { money: (userData.money || 0) + 1000, exp: (userData.exp || 0) + 50 });
                    const pendingRes = await axios.get(`https://sim-one-pi.vercel.app/pending`);
                    let nextTask = (pendingRes.data.data && pendingRes.data.data.length > 0) ? `\n\n𝖳𝖾𝖺𝖼𝗁 𝗆𝖾: ${pendingRes.data.data[0].text}\n⚠️ 𝖩𝗎𝗌𝗍 𝗋𝖾𝗉𝗅𝗒 𝗍𝗁𝖾 𝖠𝗇𝗌𝗐𝖾𝗋` : "";
                    return api.sendMessage(`✅ 𝖳𝖾𝖺𝖼𝗁 𝖢𝗈𝗆𝗉𝗅𝖾𝗍𝖾!\n💰 𝖱𝖾𝗐𝖺𝗋𝖽: 𝟣,𝟢𝟢𝟢 𝖬𝗈𝗇𝖾𝗒\n🌟 𝖷𝖯: 𝟧𝟢 𝖠𝖽𝖽𝖾𝖽.${nextTask}`, threadID, messageID);
                } catch (e) { return api.sendMessage("❌ 𝖠𝖯𝖨 𝖤𝗋𝗋𝗈𝗋!", threadID, messageID); }
            }
            try {
                const res = await axios.get(`https://sim-one-pi.vercel.app/sim?text=${encodeURIComponent(body)}&font=1`);
                // এখানেও সরাসরি Response কী ব্যবহার করা হয়েছে
                return api.sendMessage(res.data.Response, threadID, messageID);
            } catch (err) { return api.sendMessage("𝗌𝗈𝗋𝗋𝗒 𝖻𝖻𝗒 𝖳𝖾𝖺𝖼𝗁 𝗄𝗈𝗋𝖺 𝗁𝗈𝗂 𝗇𝗂 🥺", threadID, messageID); }
        }
    }
};
