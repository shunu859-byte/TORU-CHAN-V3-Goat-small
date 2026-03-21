const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "catpic",
    version: "1.1.0",
    author: "Hridoy",
    role: 0,
    shortDescription: "Random cat image 😺",
    category: "Image",
    guide: "{pn}",
    cooldown: 5
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://api.thecatapi.com/v1/images/search");
      if (!res.data || !res.data[0] || !res.data[0].url)
        return api.sendMessage("😿 Cat pic load hoilo na...", event.threadID, event.messageID);

      const imgUrl = res.data[0].url;
      const cachePath = path.join(__dirname, "cache", `cat_${Date.now()}.jpg`);
      await fs.ensureDir(path.dirname(cachePath));

      const response = await axios({ url: imgUrl, method: "GET", responseType: "stream" });
      const writer = fs.createWriteStream(cachePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({ body: "😺 Random Cat Pic!", attachment: fs.createReadStream(cachePath) }, event.threadID, () => {
          fs.unlinkSync(cachePath);
        }, event.messageID);
      });

      writer.on("error", () => api.sendMessage("❌ Cat pic download failed", event.threadID, event.messageID));

    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ Cat pic fetch korte pari nai... abar try koro 😅", event.threadID, event.messageID);
    }
  }
};
