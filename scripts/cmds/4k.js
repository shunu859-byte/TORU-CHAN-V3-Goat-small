const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    version: "1.1",
    author: "Hridoy",
    countDown: 5,
    role: 0,
    shortDescription: "Upscale image to 4K",
    longDescription: "Reply to an image to upscale it into 4K",
    category: "ai",
    guide: "{pn} (reply to image)"
  },

  onStart: async function ({ message, event, api }) {

    function extractImageUrl(event) {
      if (event.messageReply && event.messageReply.attachments?.length > 0) {
        const img = event.messageReply.attachments.find(
          a => a.type === "photo" || a.type === "image"
        );
        if (img?.url) return img.url;
      }
      return null;
    }

    const imageUrl = extractImageUrl(event);

    if (!imageUrl)
      return message.reply("❌ Please reply to an image.");

    let tempFile;

    try {
      // ✅ FIX: old reaction system
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const API_ENDPOINT = "https://free-goat-api.onrender.com/4k";
      const fullApiUrl = `${API_ENDPOINT}?url=${encodeURIComponent(imageUrl)}`;

      const apiRes = await axios.get(fullApiUrl);
      const data = apiRes.data;

      if (!data.image)
        throw new Error("API did not return image URL");

      const finalUrl = data.image;

      const imgStream = await axios.get(finalUrl, { responseType: "stream" });

      const cache = path.join(__dirname, "cache");
      if (!fs.existsSync(cache)) fs.mkdirSync(cache);

      tempFile = path.join(cache, `4k_${Date.now()}.jpg`);

      const writer = fs.createWriteStream(tempFile);
      imgStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // ✅ FIX
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      return message.reply({
        body: "🎀 𝐃𝐨𝐧𝐞 𝐛𝐚𝐛𝐲",
        attachment: fs.createReadStream(tempFile)
      }, () => fs.unlinkSync(tempFile));

    } catch (err) {
      console.error("4K UPSCALE ERROR:", err);

      // ✅ FIX
      api.setMessageReaction("❌", event.messageID, () => {}, true);

      return message.reply(
        `❌ Error: ${err.message || "Something went wrong."}`
      );
    }
  }
};
