const fs = require("fs-extra");
const request = require("request");
const path = require("path");
const { utils } = global;

module.exports = {
  config: {
    name: "owner",
    version: "1.3.2",
    author: "Hridoy",
    role: 0,
    shortDescription: "Owner information with image",
    category: "Information",
    guide: { en: "owner" }
  },

  onStart: async function ({ api, event }) {
    // ======== TIME & BOT STATS ========
    const ping = Date.now() - event.timestamp;

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    // GoatBot compatible safe access
    const totalThreads = global.GoatBot?.allThreadID?.length || 0;
    const totalUsers = global.GoatBot?.users ? Object.keys(global.GoatBot.users).length : 0;

    const BOTNAME = global.GoatBot.config.nickNameBot || "KakashiBot";
    const BOTPREFIX = global.GoatBot.config.prefix;
    const GROUPPREFIX = utils.getPrefix(event.threadID);
    const totalCommands = global.GoatBot.commands.size;

    // ======== OWNER TEXT ========
    const ownerText = 
`╭────────────────────╮
    🤖 BOT INFORMATION
╰────────────────────╯
➤ Name        : ${BOTNAME}
➤ Prefix      : ${BOTPREFIX}
➤ Prefix Box  : ${GROUPPREFIX}
➤ Modules     : ${totalCommands}
➤ Ping        : ${ping} ms

╭────────────────────╮
      👑 OWNER INFO
╰────────────────────╯
➤ Name        : Kakashi Hatake
➤ Facebook    : facebook.com/100061935903355
➤ Messenger   : m.me/100061935903355
➤ WhatsApp    : wa.me/+8801744-******

╭────────────────────╮
       📊ACTIVITIES
╰────────────────────╯
➤ Uptime      : ${hours}h ${minutes}m ${seconds}s
➤ Total Groups: ${totalThreads}
➤ Total Users : ${totalUsers}

──────────────────────
      KAKASHI HATAKE
──────────────────────`;

    // ======== IMAGE ========
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const imgPath = path.join(cacheDir, "owner.jpg");
    const imgLink = "https://i.imgur.com/oEh5VEx.jpeg";

    const send = () => {
      api.sendMessage(
        {
          body: ownerText,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => fs.existsSync(imgPath) && fs.unlinkSync(imgPath),
        event.messageID
      );
    };

    request(encodeURI(imgLink))
      .pipe(fs.createWriteStream(imgPath))
      .on("close", send);
  }
};