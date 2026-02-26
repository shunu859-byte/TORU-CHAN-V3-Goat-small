const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "waifu2",
    version: "2.0",
    author: "Hridoy",
    countDown: 5,
    role: 0,
    shortDescription: "Random NSFW Image",
    longDescription: "Random waifu/neko/trap/blowjob image",
    category: "NSFW"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    const nsfwCategories = ["waifu", "neko", "trap", "blowjob"];

    let category = args[0] ? args[0].toLowerCase() : null;

    // Random category if invalid or empty
    if (!category || !nsfwCategories.includes(category)) {
      category = nsfwCategories[Math.floor(Math.random() * nsfwCategories.length)];
    }

    try {
      // Create temp folder
      const tmpFolder = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpFolder))
        fs.mkdirSync(tmpFolder, { recursive: true });

      // Get image from API
      const res = await axios.get(`https://api.waifu.pics/nsfw/${category}`);
      const imgUrl = res.data.url;

      if (!imgUrl) throw new Error("No image received from API");

      // Download image (arraybuffer = safer)
      const imgPath = path.join(tmpFolder, `nsfw_${category}_${Date.now()}.jpg`);
      const imgData = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(imgData.data));

      // Send message
      await api.sendMessage({
        body: `🔞 Random ${category} image`,
        attachment: fs.createReadStream(imgPath)
      }, threadID, () => fs.unlinkSync(imgPath), messageID);

    } catch (err) {
      console.log(err);
      api.sendMessage("API থেকে ইমেজ আনতে সমস্যা হয়েছে ❌ আবার ট্রাই করো!", threadID, messageID);
    }
  }
};