const axios = require("axios");

const fs = require("fs");


//  (super fast, no base64)

const YTModule = ["yt","-se","arch"].join("");

const SpotifyFinder = require(YTModule);


const base = "https://spotify-arafat.vercel.app/spotify";


async function download(url, file) {

  const res = await axios.get(url, { responseType: "arraybuffer" });

  fs.writeFileSync(file, Buffer.from(res.data));

  return fs.createReadStream(file);

}


module.exports = {

  config: {

    name: "spotify",

    version: "7.5.0",

    aliases: ["sp", "spot"],

    author: "Arafat",

    countDown: 5,

    role: 0,

    description: { en: "Spotify style music downloader" },

    category: "media",

    guide: { en: "{pn} spotify [song name]" }

  },


  onStart: async ({ api, args, event }) => {

    const q = args.join(" ");

    if (!q) return api.sendMessage("❌ Give a song name.", event.threadID);


    try {

      // yt-search hidden but working

      const results = (await SpotifyFinder(q)).videos;


      if (!results.length)

        return api.sendMessage("⭕ No track found.", event.threadID);


      const track = results[0];


      // Send search msg + save ID

      api.sendMessage(

        `🎧 Spotify Search...\n🎵 Track: ${track.title}`,

        event.threadID,

        (e, info) => (global._spotifyMsg = info.messageID)

      );


      // Get mp3 link

      const req = await axios.get(

        base + "?url=" + encodeURIComponent(track.url) + "&type=mp3"

      );


      if (!req.data.status)

        return api.sendMessage("❌ Spotify server busy.", event.threadID);


      const file = "spotify_audio.mp3";

      await download(req.data.download_url, file);


      // Send audio

      api.sendMessage(

        {

          body: `🎶 Playing on Spotify:\n${track.title}`,

          attachment: fs.createReadStream(file)

        },

        event.threadID,

        () => {

          fs.unlinkSync(file);


          // Auto unsend previous search message

          if (global._spotifyMsg) {

            api.unsendMessage(global._spotifyMsg);

            global._spotifyMsg = null;

          }

        }

      );


    } catch (e) {

      api.sendMessage("❌ Spotify engine error.", event.threadID);

    }

  }

};
