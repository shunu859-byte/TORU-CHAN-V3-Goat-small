const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "squeeze",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Hridoy",
    description: "Slap the friend you mention",
    category: "NSFW",
    usages: "@tag",
    cooldowns: 5
  },

  onStart: async function({ api, event }) {
    try {
      // Check mentions
      if (!event.mentions || Object.keys(event.mentions).length === 0) {
        return api.sendMessage("❌ Please tag someone to squeeze", event.threadID, event.messageID);
      }

      const mentionID = Object.keys(event.mentions)[0];
      const tagName = event.mentions[mentionID].replace("@", "");

      // Slap GIF links
      const gifs = [
         "https://i.postimg.cc/tC2BTrmF/3.gif",
    "https://i.postimg.cc/pLrqnDg4/78d07b6be53bea612b6891724c1a23660102a7c4.gif",
    "https://i.postimg.cc/gJFD51nb/detail.gif",
    "https://i.postimg.cc/xjPRxxQB/GiC86RK.gif",
    "https://i.postimg.cc/L8J3smPM/tumblr-myzq44-Hv7-G1rat3p6o1-500.gif",
      ];

      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

      // Cache folder
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const gifPath = path.join(cacheDir, "slap.gif");

      // Download GIF
      const response = await axios({ url: randomGif, method: "GET", responseType: "stream" });
      const writer = fs.createWriteStream(gifPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage(
          {
            body: ` ${tagName}!\n𝗬𝗼𝘂 𝗚𝗲𝘁 𝗬𝗼𝘂𝗿 𝗕𝗿𝗲𝗮𝘀𝘁 𝗦𝗾𝘂𝗲𝗲𝘇𝗲𝗱 😝`,
            mentions: [{ tag: tagName, id: mentionID }],
            attachment: fs.createReadStream(gifPath)
          },
          event.threadID,
          () => fs.existsSync(gifPath) && fs.unlinkSync(gifPath),
          event.messageID
        );
      });

      writer.on("error", () => {
        api.sendMessage("❌ Failed to download slap GIF.", event.threadID, event.messageID);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ An unexpected error occurred.", event.threadID, event.messageID);
    }
  }
};
