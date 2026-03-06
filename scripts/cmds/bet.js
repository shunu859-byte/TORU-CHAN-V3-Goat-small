const money = require("../../utils/money"); 
// ⚠️ path ঠিক করবি: যদি balance.js modules/commands এ থাকে

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "টাকা"],
    version: "2.0",
    author: "MahMUD + SYSTEM",
    countDown: 5,
    role: 0,
    description: {
      bn: "আপনার বা ট্যাগ করা ইউজারের ব্যালেন্স দেখুন (Short Form)",
      en: "View your money or tagged person money in formatted style",
      vi: "Xem số tiền của bạn বা người được tag (định dạng ngắn)"
    },
    category: "Game",
    guide: {
      bn: '   {pn}: নিজের ব্যালেন্স দেখতে\n   {pn} @tag: কারো ব্যালেন্স দেখতে',
      en: '   {pn}: View your money\n   {pn} @tag: View the money of the tagged person',
      vi: '   {pn}: Xem số tiền của bạn\n   {pn} @tag: Xem số tiền của người được tag'
    }
  },

  langs: {
    bn: {
      money: "বেবি, তোমার কাছে মোট %1$ আছে।",
      moneyOf: "%1 এর কাছে মোট %2$ আছে।"
    },
    en: {
      money: "Baby, you have a total of %1$.",
      moneyOf: "%1 has a total of %2$."
    },
    vi: {
      money: "🏦 | Bạn đang có %1$",
      moneyOf: "💰 | %1 đang có %2$"
    }
  },

  onStart: async function ({ message, event, getLang }) {
    const { mentions, senderID } = event;

    const formatNumber = (num) => {
      if (!num) return "0";
      let n = typeof num !== "number" ? parseInt(num) || 0 : num;
      const units = ["", "K", "M", "B", "T"];
      let unit = 0;
      while (n >= 1000 && ++unit < units.length) n /= 1000;
      return n.toFixed(1).replace(/\.0$/, "") + units[unit];
    };

    // যদি কাউকে tag করে
    if (Object.keys(mentions).length > 0) {
      let msg = "";
      for (const uid of Object.keys(mentions)) {
        const userMoney = money.get(uid); // JSON DB থেকে
        const name = mentions[uid].replace("@", "");
        msg += getLang("moneyOf", name, formatNumber(userMoney)) + "\n";
      }
      return message.reply(msg);
    } 
    // নিজের balance
    else {
      const userMoney = money.get(senderID); // JSON DB থেকে
      return message.reply(getLang("money", formatNumber(userMoney)));
    }
  }
};