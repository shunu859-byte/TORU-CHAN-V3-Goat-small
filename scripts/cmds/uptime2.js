const fs = require("fs-extra");
const path = require("path");
const https = require("https");
const os = require("os");

const processStartTime = Date.now();

// ===== DOWNLOAD FUNCTION =====
function downloadGif(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", err => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["botstats"],
    version: "1.0",
    role: 0,
    author: "Hridoy",
    category: "Utility",
    description: "Display bot uptime + stats with random GIF",
    guide: "{pn}uptime"
  },

  onStart: async function({ message, api, usersData, threadsData }) {
    try {
      // ===== LOADING ANIMATION =====
      const loadingFrames = [
        "⏳ Getting Bot Stats...\n▰▱▱▱▱ 20%",
        "⏳ Getting Bot Stats...\n▰▰▱▱▱ 40%",
        "⏳ Getting Bot Stats...\n▰▰▰▱▱ 60%",
        "⏳ Getting Bot Stats...\n▰▰▰▰▱ 80%",
        "⏳ Getting Bot Stats...\n▰▰▰▰▰ 100%"
      ];

      let loadingMsg = await message.reply(loadingFrames[0]);
      for (let i = 1; i < loadingFrames.length; i++) {
        await new Promise(res => setTimeout(res, 400));
        await api.editMessage(loadingFrames[i], loadingMsg.messageID);
      }

      // ===== BOT STATS =====
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();

      const days = Math.floor(uptime / (60*60*24));
      const hours = Math.floor((uptime % (60*60*24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const uptimeString = `${days}D ${hours}H ${minutes}M ${seconds}S`;
      const startTime = new Date(processStartTime).toLocaleString();

      const cpuModel = os.cpus()[0].model;
      const cpuCount = os.cpus().length;
      const totalMem = (os.totalmem()/1024/1024).toFixed(0);
      const freeMem = (os.freemem()/1024/1024).toFixed(0);
      const memUsage = ((1 - os.freemem()/os.totalmem())*100).toFixed(2);

      const threadCount = allThreads.length;
      const userCount = allUsers.length;

      const msg = 
`╭─🌟 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐒
│
├⏱️ Uptime: ${uptimeString}
├📅 Start Time: ${startTime}
├👥 Total Users: ${userCount.toLocaleString()}
├💬 Total Groups: ${threadCount.toLocaleString()}
│
├💻 CPU: ${cpuModel} (${cpuCount} cores)
├🖥️ RAM: ${freeMem}MB free / ${totalMem}MB total (${memUsage}% used)
├🌐 Platform: ${os.platform()} ${os.arch()}
╰───────────────◉`;

      // ===== RANDOM GIF =====
      const gifURLs = [
        "https://i.imgur.com/Xw6JTfn.gif",
        "https://i.imgur.com/KUFxWlF.gif",
        "https://i.imgur.com/KrEez4A.gif",
        "https://i.imgur.com/FV9krHV.gif",
        "https://i.imgur.com/lFrFMEn.gif"
      ];

      const randomGifURL = gifURLs[Math.floor(Math.random() * gifURLs.length)];
      const gifFolder = path.join(__dirname, "cache");

      if (!fs.existsSync(gifFolder)) fs.mkdirSync(gifFolder, { recursive: true });

      const gifName = path.basename(randomGifURL);
      const gifPath = path.join(gifFolder, gifName);

      if (!fs.existsSync(gifPath)) await downloadGif(randomGifURL, gifPath);

      // ===== REMOVE LOADING =====
      await api.unsendMessage(loadingMsg.messageID);

      // ===== SEND FINAL MESSAGE + GIF =====
      const sent = await message.reply({
        body: msg,
        attachment: fs.createReadStream(gifPath)
      });

      // ===== OPTIONAL AUTO DELETE AFTER 30s =====
      setTimeout(() => api.unsendMessage(sent.messageID), 30000);

    } catch (err) {
      console.error(err);
      await message.reply("❌ Error occurred while retrieving uptime stats.");
    }
  }
};
