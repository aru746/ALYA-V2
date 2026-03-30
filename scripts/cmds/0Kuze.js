module.exports = {
config: {
name: "kuze",
version: "1.0",
author: "Tokodori_Frtiz",//remodified by cliff
countDown: 5,
role: 0,
shortDescription: "no prefix",
longDescription: "no prefix",
category: "auto",
},

onStart: async function(){}, 
onChat: async function({ event, message, getLang }) {
if (event.body && event.body.toLowerCase() === "kuze") {
return message.reply({
body: `
  ➢ 𝐎𝐰𝐧𝐞𝐫 : 𝙰𝚁𝙸 𝙹𝙸𝚃 ♫︎

 𝐣𝐮𝐬𝐭 𝐬𝐚𝐲 𝐛𝐨𝐭/𝐛𝐛𝐲 𝐟𝐨𝐫 𝐭𝐚𝐥𝐤 𝐭𝐨 𝙰𝙻𝚈𝙰 𝙱𝙾𝚃 ♫︎
 𝐞𝐧𝐣𝐨𝐲 𝐚𝐧𝐝 𝐡𝐚𝐯𝐞 𝐚 𝐟𝐮𝐧 𝐰𝐢𝐭𝐡 𝐦𝐲 𝐛𝐨𝐭
 | (• ◡•)|🐱 


\n\n\n  `,
attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/b0n4vy.mp4")
});
}
}
}
