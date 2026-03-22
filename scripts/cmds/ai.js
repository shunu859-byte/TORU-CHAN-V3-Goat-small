const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    aliases: ["chat", ],
    version: "1.0",
    author: "Hridoy",
    countDown: 5,
    role: 0,
    shortDescription: "AI chat",
    longDescription: "Chat with AI using OpenRouter",
    category: "AI",
    guide: {
      en: "{pn}ai <your question>"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const query = args.join(" ");
      if (!query) {
        return api.sendMessage("❌ | Ask something...", event.threadID);
      }

      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo", // free model
          messages: [
            {
              role: "user",
              content: query
            }
          ]
        },
        {
          headers: {
            "Authorization": "Bearer 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",
            "Content-Type": "application/json"
          }
        }
      );

      const reply = res.data.choices[0].message.content;

      return api.sendMessage(`🤖 AI Reply:\n\n${reply}`, event.threadID);

    } catch (err) {
      console.error(err.response?.data || err.message);
      return api.sendMessage("❌ | AI Error", event.threadID);
    }
  }
};
