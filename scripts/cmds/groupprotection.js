const fs = require("fs-extra");
const path = require("path");

const dbPath = path.join(__dirname, "../database/groupProtection.json");

module.exports = {
  config: {
    name: "groupProtection",
    version: "1.0",
    author: "Hridoy",
    shortDescription: "Protects group settings from unauthorized changes",
    category: "System",
    guide: "{pn}groupProtection on/off"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const groupId = event.threadID;

      // Load JSON
      let data = fs.readJsonSync(dbPath);

      // If command args not given
      if (!args[0]) return api.sendMessage("⚠️ Usage: groupProtection on/off", groupId);

      // Turn protection ON
      if (args[0].toLowerCase() === "on") {
        if (!data[groupId]) return api.sendMessage("⚠️ No JSON backup for this group!", groupId);

        data[groupId].protection = true;
        fs.writeJsonSync(dbPath, data, { spaces: 2 });

        return api.sendMessage("✅ Group protection activated!", groupId);
      }

      // Turn protection OFF
      if (args[0].toLowerCase() === "off") {
        if (!data[groupId]) return api.sendMessage("⚠️ No JSON backup for this group!", groupId);

        data[groupId].protection = false;
        fs.writeJsonSync(dbPath, data, { spaces: 2 });

        return api.sendMessage("⚠️ Group protection deactivated!", groupId);
      }

      return api.sendMessage("⚠️ Invalid option! Use on/off", groupId);
    } catch (err) {
      console.error(err);
    }
  },

  onEvent: async function ({ api, event }) {
    try {
      const groupId = event.threadID;
      const data = fs.readJsonSync(dbPath);

      if (!data[groupId] || !data[groupId].protection) return; // Not protected

      const original = data[groupId];
      let needRestore = false;
      const changes = {};

      // Check name
      if (event.groupName && event.groupName !== original.name) {
        changes.name = original.name;
        needRestore = true;
      }

      // Check emoji
      if (event.emoji && event.emoji !== original.emoji) {
        changes.emoji = original.emoji;
        needRestore = true;
      }

      // Check avatar
      if (event.avatar && event.avatar !== original.avatar) {
        changes.avatar = original.avatar;
        needRestore = true;
      }

      // Check join/out
      if (event.join !== undefined && event.join !== original.join) {
        changes.join = original.join;
        needRestore = true;
      }
      if (event.out !== undefined && event.out !== original.out) {
        changes.out = original.out;
        needRestore = true;
      }

      // Restore changes if needed
      if (needRestore) {
        if (changes.name) await api.changeGroupName(changes.name, groupId);
        if (changes.emoji) await api.setGroupEmoji(changes.emoji, groupId);
        if (changes.avatar) await api.changeGroupImage(changes.avatar, groupId);
        if (changes.join !== undefined) await api.setJoinLeave(changes.join, groupId);
        if (changes.out !== undefined) await api.setJoinLeave(changes.out, groupId);

        api.sendMessage("⚠️ Unauthorized changes detected. Original group settings restored!", groupId);
      }
    } catch (err) {
      console.error("Group Protection Error:", err);
    }
  }
};
