const axios = require('axios'); 
const request = require('request'); 
const fs = require("fs"); 
 module.exports = { 
         config: { 
                 name: "box", 
                 aliases: ["box"], 
                 version: "1.0", 
                 author: "Rocky", 
                 countDown: 5, 
                 role: 1, 
                 shortDescription: "set admin/change group photo,emoji,name", 
                 longDescription: "", 
                 category: "group", 
                 guide:  { 
                         vi: "{pn} [admin,emoji,image,name]", 
                         en: "{pn} name <name> to change box mame\n{pn} emoji <emoji> to change box emoji\n{pn} image <reply to image> to chnge box image\n{pn} add [@tag] to add group admin \n{pn} del [@tag]  to remove group admin \n{pn} info to see group info" 
                 } 
         }, 
         onStart: async function ({ message, api, event, args, getText }) { 
         const axios = require('axios'); 
         const request = require('request'); 
         const fs = require("fs"); 
          if (args.length == 0) return api.sendMessage(`Vous pouvez utiliser :\n\n?[PREFIX]box emoji [emoji de votre choix]\n\n[PREFIX]box name [nom du groupe à modifier]\n\n[PREFIX]box image [répondez à toutes les images qui doit être définie comme image du groupe]\n\n[PREFIX]box admin [tag] => ça donnera qtv à la personne taguée\n\n[PREFIX]box info => Donne toutes les informations du groupe...!

 `, event.threadID, event.messageID);   
         if (args[0] == "name") { 
 var content = args.join(" "); 
 var c = content.slice(4, 99) || event.messageReply.body; 
 api.setTitle(`${c } `, event.threadID); 
  } 
         if (args[0] == "emoji") { 
 const name = args[1] || event.messageReply.body; 
 api.changeThreadEmoji(name, event.threadID)   
  } 
 if (args[0] == "add") { 
   if (Object.keys(event.mentions) == 0) return api.changeAdminStatus(event.threadID, args.join(" "), true); 
   else { 
     for (var i = 0; i < Object.keys(event.mentions).length; i++) api.changeAdminStatus(event.threadID ,`${Object.keys(event.mentions)[i]}`, true) 
   return;  
     } 
 } 
 else if (args[0] == "del") { 
 if (Object.keys(event.mentions) == 0) return api.changeAdminStatus(event.threadID, args.join(" "), true); 
   else { 
     for (var i = 0; i < Object.keys(event.mentions).length; i++) api.changeAdminStatus(event.threadID ,`${Object.keys(event.mentions)[i]}`, false) 
   return;  
     } 
 } 
 if (args[0] == "image") {   
 if (event.type !== "message_reply") return api.sendMessage("❌ Vous devez répondre à un certain audio, vidéo ou photo", event.threadID, event.messageID); 
         if (!event.messageReply.attachments || event.messageReply.attachments.length == 0) return api.sendMessage("❌ Vous devez répondre à un certain audio, vidéo ou photo", event.threadID, event.messageID); 
         if (event.messageReply.attachments.length > 1) return api.sendMessage(`Please reply only one audio, video, photo!`, event.threadID, event.messageID); 
          var callback = () => api.changeGroupImage(fs.createReadStream(__dirname + "/assets/any.png"), event.threadID, () => fs.unlinkSync(__dirname + "/assets/any.png"));         
       return request(encodeURI(event.messageReply.attachments[0].url)).pipe(fs.createWriteStream(__dirname+'/assets/any.png')).on('close',() => callback()); 
       }; 
 if (args[0] == "info") { 
                 var threadInfo = await api.getThreadInfo(event.threadID); 
                 let threadMem = threadInfo.participantIDs.length; 
         var gendernam = []; 
         var gendernu = []; 
         var nope = []; 
         for (let z in threadInfo.userInfo) { 
                 var gioitinhone = threadInfo.userInfo[z].gender; 
  
                 var nName = threadInfo.userInfo[z].name; 
  
                 if (gioitinhone == 'MALE') { 
                         gendernam.push(z + gioitinhone); 
                 } else if (gioitinhone == 'FEMALE') { 
                         gendernu.push(gioitinhone); 
                 } else { 
                         nope.push(nName); 
                 } 
         } 
         var nam = gendernam.length; 
         var nu = gendernu.length; 
         let qtv = threadInfo.adminIDs.length; 
         let sl = threadInfo.messageCount; 
         let icon = threadInfo.emoji; 
         let threadName = threadInfo.threadName; 
         let id = threadInfo.threadID; 
         var listad = ''; 
         var qtv2 = threadInfo.adminIDs; 
         for (let i = 0; i < qtv2.length; i++) { 
 const infu = (await api.getUserInfo(qtv2[i].id)); 
 const name = infu[qtv2[i].id].name; 
                 listad += '•' + name + '\n│'; 
         } 
         let sex = threadInfo.approvalMode; 
         var pd = sex == false ? 'Turn off' : sex == true ? 'turn on' : 'Kh'; 
         var pdd = sex == false ? '❎' : sex == true ? '✅' : '⭕'; 
          var callback = () => 
                                 api.sendMessage( 
                                         { 
                                                 body: `╭━━━━━━━━━━━◆\n│🔥𖠸Shizuka\n│Rocky𖠸🔥\n├━━━━━━━━━━━◆\n│𝘕𝘖𝘔 𝘋𝘜 𝘎𝘙𝘖𝘜𝘗𝘌\n│${threadName}\n├━━━━━━━━━━━◆\n│𝘎𝘙𝘖𝘜𝘗 𝘐𝘋\n│${id}\n├━━━━━━━━━━━◆\n│APPROBATION\n│DE\n│L'ADMINISTRATEUR : ${pd}\n├━━━━━━━━━━━◆\n│𝘙𝘦́𝘢𝘤𝘵𝘪𝘰𝘯 𝘳𝘢𝘱𝘪𝘥𝘦: ${icon}\n╰━━━━━━━━━━━◆\n╭━━━━━━━━━━━◆\n│「🔥𝑰𝑵𝑭𝑶𝑹𝑴𝑨𝑻𝑰𝑶𝑵🔥」\n├───────────\n│ 𝘐𝘭 𝘢 ${threadMem} 𝘮𝘦𝘮𝘣𝘳𝘦𝘴\n│𝘥𝘢𝘯𝘴 𝘤𝘦 𝘨𝘳𝘰𝘶𝘱𝘦.\n│𝘓𝘦 𝘯𝘰𝘮𝘣𝘳𝘦 𝘵𝘰𝘵𝘢𝘭\n│𝘥𝘦 𝘨𝘢𝘳𝘤̧𝘰𝘯 𝘦𝘴𝘵 𝘥𝘦 ${nam}\n│𝘓𝘦 𝘯𝘰𝘮𝘣𝘳𝘦 𝘵𝘰𝘵𝘢𝘭\n│𝘥𝘦 𝘧𝘪𝘭𝘭𝘦 𝘦𝘴𝘵 𝘥𝘦 ${nu}\n│𝘐𝘭 𝘢 ${qtv} 𝘢𝘥𝘮𝘪𝘯(𝘴)\n│𝘥𝘢𝘯𝘴 𝘤𝘦 𝘨𝘳𝘰𝘶𝘱𝘦\n├━━━━━━━━━━━◆\n│𝘓𝘪𝘴𝘵𝘦 𝘥𝘦𝘴 𝘢𝘥𝘮𝘪𝘯𝘪𝘴𝘵𝘳𝘢𝘵𝘦𝘶𝘳𝘴\n├───────────\n│${listad}\n╰━━━━━━━━━━━◆\n╭━━━━━━━━━━━◆\n│𝘓𝘦 𝘯𝘰𝘮𝘣𝘳𝘦 𝘵𝘰𝘵𝘢𝘭 𝘥𝘦\n│𝘮𝘦𝘴𝘴𝘢𝘨𝘦 𝘦𝘯𝘷𝘰𝘺𝘦́ 𝘦𝘴𝘵\n│𝘥𝘦 ${sl} msgs\n╰━━━━━━━━━━━◆\n╭━━━━━━━━━━━◆\n│✧.(⊃^ ω ^)㉨(.• ⁠ᴗ⁠ •⊂).\n╰━━━━━━━━━━━◆\n\n🔥𖠸Bot㉨Shizuka𖠸🔥MADE BY ʬɸʬ Sexy Rocky  ʬɸʬ`, 
                                                 attachment: fs.createReadStream(__dirname + '/assets/any.png') 
                                         }, 
                                         event.threadID, 
                                         () => fs.unlinkSync(__dirname + '/assets/any.png'), 
                                         event.messageID 
                                 ); 
                         return request(encodeURI(`${threadInfo.imageSrc}`)) 
                                 .pipe(fs.createWriteStream(__dirname + '/assets/any.png')) 
                                 .on('close', () => callback()); 
  
         }           
   } 
 };
