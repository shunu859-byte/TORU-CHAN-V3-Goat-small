const money = require("../../utils/money");
const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "টাকা"],
    version: "5.0",
    author: "MahMUD + SYSTEM + Sabah",
    countDown: 5,
    role: 0,
    description: "Realistic ATM Card Balance",
    category: "Game"
  },

  onStart: async function ({ message, event, usersData }) {

    const { senderID } = event;

    const banks = [
      "American Express"
    ];

    const formatMoney = (amount) => {
      if (!amount) return "0";
      const units = ["", "K", "M", "B", "T"];
      let unit = 0;
      while (amount >= 1000 && unit < units.length - 1) {
        amount /= 1000;
        unit++;
      }
      return amount.toFixed(1).replace(".0", "") + units[unit];
    };

    const createCard = async (name, balance) => {

      const width = 900;
      const height = 520;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // ===== REALISTIC GRADIENT BACKGROUND =====
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#0f2027");
      bg.addColorStop(0.5, "#203a43");
      bg.addColorStop(1, "#2c5364");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // subtle texture dots
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 3000; i++) {
        ctx.fillStyle = "white";
        ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
      }
      ctx.globalAlpha = 1;

      // ===== RANDOM BANK NAME =====
      const bankName = banks[Math.floor(Math.random() * banks.length)];

      ctx.font = "bold 42px Sans";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(bankName, 60, 80);

      // ===== CHIP =====
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(60, 160, 120, 80);

      ctx.strokeStyle = "#a8892a";
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 160, 120, 80);

      ctx.beginPath();
      ctx.moveTo(60, 190);
      ctx.lineTo(180, 190);
      ctx.moveTo(60, 210);
      ctx.lineTo(180, 210);
      ctx.stroke();

      // ===== CARD NUMBER =====
      const cardNumber =
        "5284 " +
        Math.floor(Math.random() * 9000 + 1000) +
        " " +
        Math.floor(Math.random() * 9000 + 1000) +
        " " +
        Math.floor(Math.random() * 9000 + 1000);

      ctx.font = "bold 44px monospace";
      ctx.fillStyle = "#ffffff";

      ctx.shadowColor = "#00eaff";
      ctx.shadowBlur = 25;

      ctx.fillText(cardNumber, 60, 320);

      ctx.shadowBlur = 0;

      // ===== NAME =====
      ctx.font = "bold 36px Sans";
      ctx.fillStyle = "#00eaff";
      ctx.fillText(name.toUpperCase(), 60, 430);

      // ===== EXPIRY =====
      const date = new Date();
      const expiry = `${date.getMonth() + 1}/${(date.getFullYear() + 4)
        .toString()
        .slice(-2)}`;

      ctx.font = "28px Sans";
      ctx.fillStyle = "#ffd700";
      ctx.fillText("EXP " + expiry, 650, 350);

      // ===== BALANCE =====
      ctx.font = "bold 40px Sans";
      ctx.fillStyle = "#00ff9d";

      ctx.shadowColor = "#00ff9d";
      ctx.shadowBlur = 30;

      ctx.fillText(`Balance: ${formatMoney(balance)} $`, 520, 460);

      ctx.shadowBlur = 0;

      // ===== MASTERCARD STYLE LOGO =====
      ctx.globalAlpha = 0.9;

      ctx.beginPath();
      ctx.fillStyle = "#EB001B";
      ctx.arc(760, 110, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "#F79E1B";
      ctx.arc(810, 110, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;

      // ===== SAVE =====
      const folder = path.join(__dirname, "cache");
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

      const file = path.join(folder, `${senderID}_balance.png`);
      fs.writeFileSync(file, canvas.toBuffer());

      return file;
    };

    const userMoney = money.get(senderID) || 0;
    const userData = await usersData.get(senderID);
    const name = userData.name || "User";

    const img = await createCard(name, userMoney);

    return message.reply({
      body: "💳 Your ATM Card",
      attachment: fs.createReadStream(img)
    });
  }
};