const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "waifu",
    version: "1.1",
    author: "Hridoy",
    countDown: 5,
    role: 0,
    shortDescription: "Random NSFW Waifu",
    longDescription: "Get random NSFW waifu/hentai/neko image",
    category: "NSFW"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    const allowedTypes = ["waifu", "neko", "trap", "blowjob"];
    const type = args[0] && allowedTypes.includes(args[0].toLowerCase())
      ? args[0].toLowerCase()
      : "waifu";

    try {
      // Create temp folder if not exists
      const cacheFolder = path.join(__dirname, "tmp");
      if (!fs.existsSync(cacheFolder))
        fs.mkdirSync(cacheFolder, { recursive: true });

      // Get image URL from API
      const res = await axios.get(`https://api.waifu.pics/nsfw/${type}`);
      const imgUrl = res.data.url;

      // Download image
      const imgPath = path.join(cacheFolder, `${Date.now()}_${type}.jpg`);
      const response = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(response.data));

      // Send image
      await api.sendMessage({
        body: `🔞 Random ${type} image`,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => fs.unlinkSync(imgPath), messageID);

    } catch (err) {
      console.log(err);
      api.sendMessage("Failed to fetch image ❌ Try again later.", threadID, messageID);
    }
  }
};