const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "nature",
    version: "1.1.0",
    author: "Hridoy",
    role: 0,
    shortDescription: "Random beautiful nature photo 🌿",
    category: "Image",
    guide: "{pn}",
    cooldown: 5
  },

  onStart: async function({ api, event }) {
    try {
      const API_KEY = "ZMDHXRtkLremnn6PsdZ0HVwseFUu5Hg2nQhB3DqsLaxqlnltXuIBm4jg";

      // --- Fetch from Pexels API ---
      const res = await axios.get("https://api.pexels.com/v1/search?query=nature&per_page=15", {
        headers: { Authorization: API_KEY }
      });

      if (!res.data.photos || res.data.photos.length === 0) {
        return api.sendMessage("⚠️ No nature photos found! Try again later.", event.threadID, event.messageID);
      }

      const photo = res.data.photos[Math.floor(Math.random() * res.data.photos.length)];
      const photoUrl = photo.src.original;

      const cachePath = path.join(__dirname, "cache", `nature_${Date.now()}.jpg`);
      await fs.ensureDir(path.dirname(cachePath));

      // --- Download and send ---
      const response = await axios({ url: photoUrl, method: "GET", responseType: "stream" });
      const writer = fs.createWriteStream(cachePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: "🌿 Here is a beautiful nature photo!",
          attachment: fs.createReadStream(cachePath)
        }, event.threadID, () => fs.unlinkSync(cachePath), event.messageID);
      });

      writer.on("error", () => {
        api.sendMessage("❌ Photo download failed", event.threadID, event.messageID);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ Something went wrong! Could not fetch nature photo.", event.threadID, event.messageID);
    }
  }
};
