// modules/commands/anipic.js
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "watchani",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Hridoy",
    description: "Random anime recommendation pic",
    commandCategory: "Image",
    usages: "send message",
    cooldowns: 5
};

module.exports.onStart = async function({ api, event }) {
    const images = [
        "https://i.imgur.com/7Igy9Gx.png",
        "https://i.imgur.com/RzqMjeX.png",
        "https://i.imgur.com/vnFHbIM.png",
        "https://i.imgur.com/gsoou4a.png",
        "https://i.imgur.com/T1v9j7b.png",
        "https://i.imgur.com/OZRYY3g.png",
        "https://i.imgur.com/DBW1EEn.png",
        "https://i.imgur.com/ljCSZoO.png",
        "https://i.imgur.com/ulgfKma.png",
        "https://i.imgur.com/pYcfLna.png",
        "https://i.imgur.com/wn17fDi.png",
        "https://i.imgur.com/16o7E9o.png",
        "https://i.imgur.com/YGZLoC5.png",
        "https://i.imgur.com/UPxK6Dh.png",
        "https://i.imgur.com/6AoJ67h.png",
        "https://i.imgur.com/oEogoDj.png",
        "https://i.imgur.com/Kub8Cbq.png",
        "https://i.imgur.com/igDXTw8.png",
        "https://i.imgur.com/BNPkxUe.png",
        "https://i.imgur.com/q59UneJ.png",
        "https://i.imgur.com/EMvZMij.png",
        "https://i.imgur.com/1ktsYZI.png",
        "https://i.imgur.com/Lt5PDuX.png",
        "https://i.imgur.com/432WO10.png",
        "https://i.imgur.com/qU42gAs.png",
        "https://i.imgur.com/UaoTDy4.png",
        "https://i.imgur.com/ehRBBYR.png",
        "https://i.imgur.com/hyfBRha.png",
        "https://i.imgur.com/hArtSkk.png",
        "https://i.imgur.com/p7xefuo.png",
        "https://i.imgur.com/wl4Ga6o.png",
        "https://i.imgur.com/VS8vu5A.png",
        "https://i.imgur.com/EA3Mx66.png",
        "https://i.imgur.com/2C680hc.png",
        "https://i.imgur.com/aWF6CWn.png",
        "https://i.imgur.com/l0j838L.png",
        "https://i.imgur.com/uPLDDzo.png",
        "https://i.imgur.com/MjkDxCu.png",
        "https://i.imgur.com/cs8yJvG.png",
        "https://i.imgur.com/Z6qqbwY.png",
        "https://i.imgur.com/k5oHtrW.png",
        "https://i.imgur.com/Iyte9Pb.png",
        "https://i.imgur.com/SjjkQBb.png",
        "https://i.imgur.com/uvPGlxd.png",
        "https://i.imgur.com/J8lUuN7.png",
        "https://i.imgur.com/CkNatzu.png",
        "https://i.imgur.com/TvhNcQ0.png",
        "https://i.imgur.com/V0P09B9.png",
        "https://i.imgur.com/6EyWX0O.png",
        "https://i.imgur.com/fMFKoZ2.png",
        "https://i.imgur.com/KaskMM1.png",
        "https://i.imgur.com/wvHyk6i.png",
        "https://i.imgur.com/mcPpCWu.png",
        "https://i.imgur.com/zdvEKEj.png",
        "https://i.imgur.com/5mLIDAM.png",
        "https://i.imgur.com/0Y7LDq8.png",
        "https://i.imgur.com/20irZwl.png",
        "https://i.imgur.com/44TGlM9.png",
        "https://i.imgur.com/ZSlCWrx.png"
    ];

    try {
        const imgUrl = images[Math.floor(Math.random() * images.length)];
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const imgPath = path.join(cacheDir, `anipic_${Date.now()}.png`);

        // Download image
        const writer = fs.createWriteStream(imgPath);
        const imgRes = await axios.get(imgUrl, { responseType: "stream" });
        imgRes.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        // Send image
        api.sendMessage({
            body: "Anime Recommendation\n\nClick the picture for better quality 😎",
            attachment: fs.createReadStream(imgPath)
        }, event.threadID, () => fs.unlinkSync(imgPath));

    } catch (err) {
        console.error(err);
        api.sendMessage(`Error: ${err.message || "Something went wrong"}! Try again 😅`, event.threadID);
    }
};