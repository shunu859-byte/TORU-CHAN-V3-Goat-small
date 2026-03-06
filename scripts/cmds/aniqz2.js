const axios = require("axios");
const money = require("../../utils/money"); // ⚠️ path ঠিক করবি

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "aniqz2",
    aliases: ["animeqz2"],
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    category: "Game",
    guide: { en: "{pn} [en/bn]" }
  },

  onStart: async function ({ api, event, usersData, args }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage("You are not authorized to change the author name.\n", event.threadID, event.messageID);
    }

    try {
      const input = args[0]?.toLowerCase() || "bn";
      const category = (input === "en" || input === "english") ? "english" : "bangla";

      const apiUrl = await mahmud();
      const res = await axios.get(`${apiUrl}/api/aniqz2?category=${category}`);
      const quiz = res.data?.data || res.data;

      if (!quiz || !quiz.question)
        return api.sendMessage("❌ No quiz available for this category.", event.threadID, event.messageID);

      const { question, correctAnswer, options } = quiz;
      const { a, b, c, d } = options;

      const quizMsg = {
        body: `\n╭──✦ ${question}\n├‣ 𝗔) ${a}\n├‣ 𝗕) ${b}\n├‣ 𝗖) ${c}\n├‣ 𝗗) ${d}\n╰──────────────────‣\n𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮𝐫 𝐚𝐧𝐬𝐰𝐞𝐫.`
      };

      api.sendMessage(quizMsg, event.threadID, (err, info) => {
        if (err) return;

        global.GoatBot.onReply.set(info.messageID, {
          commandName: "aniqz2",
          author: event.senderID,
          correctAnswer,
          messageID: info.messageID
        });

        setTimeout(() => api.unsendMessage(info.messageID), 40000);
      }, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("🥹error, contact Kakashi.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { correctAnswer, author, messageID } = Reply;
    if (event.senderID !== author)
      return api.sendMessage("⚠️ This quiz isn’t yours baby 🐸", event.threadID, event.messageID);

    await api.unsendMessage(messageID);

    const userReply = event.body.trim().toLowerCase();
    const correct = correctAnswer.toLowerCase();

    if (userReply === correct || userReply === correct[0]) {
      const rewardCoins = 500, rewardExp = 121;

      // ✅ money.js দিয়ে টাকা add
      money.add(author, rewardCoins);

      // exp আগের মত usersData তেই থাকবে
      const userData = await usersData.get(author);
      await usersData.set(author, {
        money: userData.money, // money আর এখানে handle করছিনা
        exp: userData.exp + rewardExp,
        data: userData.data
      });

      return api.sendMessage(
        `✅ | Correct answer baby 💕\nYou earned +${rewardCoins} coins & +${rewardExp} exp!`,
        event.threadID,
        event.messageID
      );
    } else {
      return api.sendMessage(
        `❌ | Wrong answer baby\nThe Correct answer was: ${correctAnswer}`,
        event.threadID,
        event.messageID
      );
    }
  }
};