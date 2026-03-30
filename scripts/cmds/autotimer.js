const axios = require("axios");

module.exports = {
  config: {
    name: "autotimer",
    version: "3.0",
    role: 0,
    author: "Dipto",
    description: "সেট করা সময় অনুযায়ী স্বয়ংক্রিয় বার্তা পাঠানো হবে!",
    category: "group",
    countDown: 3,
  },

  onLoad: async ({ api }) => {
    // ---- UPDATED FUNNY + MATURE TIMER LIST ----
    const timerData = {
      "12:00:00 AM": { message: "রাত ১২টা… আজকেও ভেবেছিলাম তাড়াতাড়ি ঘুমাবো। হ্যাঁ, মনের মধ্যে ভেবেছিলাম 😌🌙" },
      "01:00:00 AM": { message: "রাত ১টা… যাদের প্রেম আছে তারা ঘুমায়। আর যাদের নেই তারা স্ক্রল করে 🥲📱" },
      "02:00:00 AM": { message: "রাত ২টা… এই সময়ে শুধু দুইজন জেগে থাকে—broken মানুষ আর mobile-এর battery 😫🔋" },
      "03:00:00 AM": { message: "রাত ৩টা… এই সময় মেসেজ দিলে সব কথা honest হয়ে যায় 😉💬" },
      "04:00:00 AM": { message: "রাত ৪টা… ঘুম না আসা মানে সমস্যা না; ভুল মানুষকে মনে করা মানেই সমস্যা 😪🔥" },
      "05:00:00 AM": { message: "ভোর ৫টা… সূর্য উঠেছে, আমার মুড এখনো ডার্ক মোডে 😑🌤️" },
      "06:00:00 AM": { message: "ভোর ৬টা… অ্যালার্ম বাজে, আমি তাকাই—'মনে হচ্ছে তুমি অতিরিক্ত overconfident' 😤⏰" },
      "07:00:00 AM": { message: "সকাল ৭টা… ব্রাশ না করে নাস্তা? নাহ… জীবনে একটা decision তো কঠিন হবেই 😵‍💫🥐" },
      "08:00:00 AM": { message: "সকাল ৮টা… নিজের সাথে যুদ্ধের নাম—'উঠবো, উঠবো… আরে উঠবোই তো!' 😩💀" },
      "09:00:00 AM": { message: "সকাল ৯টা… কাজের জন্য ready হওয়া মানে একটা ছোট emotional damage 😭💼" },
      "10:00:00 AM": { message: "সকাল ১০টা… কফি ছাড়া মানুষের মাথা কাজ না করলে মেনে নেওয়া যায়… আমারটাও তাই 😌☕" },
      "11:00:00 AM": { message: "সকাল ১১টা… অফিসে সবাই ব্যস্ত, আর আমি ব্যস্ত কীভাবে ব্যস্ত দেখাবো 😎📑" },
      "12:00:00 PM": { message: "দুপুর ১২টা… ক্ষুধা + রাগ = combo pack. কেউ বিরক্ত করলে ভুল হয়ে যাবে 😤🍛" },
      "01:00:00 PM": { message: "দুপুর ১টা… খাওয়ার পর ঘুম আসা স্বাভাবিক। ঘুমিয়ে পড়া ট্যালেন্ট 😴✨" },
      "02:00:00 PM": { message: "দুপুর ২টা… চোখ খোলা থাকলেও ব্রেইন বলে—'আমি আজকে আসবো না' 😪⚡" },
      "03:00:00 PM": { message: "বিকাল ৩টা… কফি খেতে খেতে ভাবি—কাজ করলে কি সত্যিই লাভ আছে? ☕🤔" },
      "04:00:00 PM": { message: "বিকাল ৪টা… শরীর ক্লান্ত, মন বিরক্ত, আর সময় বলে—'ধৈর্য্য ধরো, শেষটা কাছে' 😮‍💨🌥️" },
      "05:00:00 PM": { message: "বিকাল ৫টা… দিনভর সমস্যা সমাধান করে বুঝলাম—নিজেই সবচেয়ে বড় সমস্যা 😌💀" },
      "06:00:00 PM": { message: "সন্ধ্যা ৬টা… কাজ শেষ মানেই শান্তি নয়… বাসায় গেলে নতুন episode শুরু 😇📺" },
      "07:00:00 PM": { message: "সন্ধ্যা ৭টা… টিভির রিমোট হাতে থাকে আমার, কিন্তু channel decide করে অন্য কেউ 😭📺" },
      "08:00:00 PM": { message: "রাত ৮টা… খাবার সামনে, ডায়েটের কথা মনে… তারপর ডায়েটকে বললাম—'বাইরে যাও' 😏🍽️" },
      "09:00:00 PM": { message: "রাত ৯টা… কারো cuddle time চলছে… আর আমি ভাবছি ফোনের চার্জ ৩০% কেন 😭🔋" },
      "10:00:00 PM": { message: "রাত ১০টা… সবাই romance mood… আমি blanket জড়িয়ে motivational speech দিচ্ছি নিজেকে 😌🛏️" },
      "11:00:00 PM": { message: "রাত ১১টা… দিনের শেষে বুঝলাম—ঘুমই আসলে সত্যিকারের ভালোবাসা 😴💞" }
    };

    // ---- FIXED TIMER LOOP ----
    const checkTime = async () => {
      const time = new Date(Date.now() + 21600000)
        .toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        .trim();

      if (timerData[time]) {
        const threads =
          global.GoatBot?.config?.whiteListModeThread?.whiteListThreadIds || [];

        for (const threadID of threads) {
          api.sendMessage({ body: timerData[time].message }, threadID);
        }
      }

      setTimeout(checkTime, 1000);
    };

    checkTime();
  },

  onStart: () => {}
};
