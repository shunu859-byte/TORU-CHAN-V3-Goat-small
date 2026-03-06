
const fs = require("fs-extra");
const path = require("path");
const { getStreamFromURL, uploadImgbb } = global.utils;

const dataPath = path.join(process.cwd(), "database", "data", "groupProtection.json");

if (!fs.existsSync(dataPath))
fs.writeJsonSync(dataPath, {}, { spaces: 2 });

module.exports = {

config:{
name:"anti",
version:"12.0",
author:"Hridoy + Sabah Ultimate",
role:1,
description:"Ultimate Group Protection System",
category:"Admin"
},

// ================= COMMAND =================

onStart: async function({api,event,args,message}){

const {threadID} = event;

let data = fs.readJsonSync(dataPath);

const threadInfo = await api.getThreadInfo(threadID);

if(!data[threadID]){
data[threadID] = {
backup:null,
lock:false
};
}

// ========= BACKUP =========

if(args[0] == "backup"){

data[threadID].backup = {
name: threadInfo.threadName,
emoji: threadInfo.emoji,
theme: threadInfo.threadThemeID,
avatar: threadInfo.imageSrc || "REMOVE",
nickname:{}
};

threadInfo.userInfo.forEach(u=>{
data[threadID].backup.nickname[u.id] = u.nickname || null;
});

fs.writeJsonSync(dataPath,data,{spaces:2});

return message.reply("💾 Group Backup Saved");
}

// ========= RESTORE =========

if(args[0] == "restore"){

if(!data[threadID].backup)
return message.reply("❌ No backup found");

const g = data[threadID].backup;

await api.setTitle(g.name,threadID);
await api.changeThreadEmoji(g.emoji,threadID);
await api.changeThreadColor(g.theme,threadID);

if(g.avatar !== "REMOVE"){
const stream = await getStreamFromURL(g.avatar);
await api.changeGroupImage(stream,threadID);
}

for(const uid in g.nickname){
await api.changeNickname(g.nickname[uid],threadID,uid);
}

return message.reply("♻️ Group Restored From Backup");
}

// ========= LOCK =========

if(args[0] == "lock"){

if(!data[threadID].backup)
return message.reply("❌ First run: anti backup");

data[threadID].lock = true;

fs.writeJsonSync(dataPath,data,{spaces:2});

return message.reply("🔒 Group Protection Enabled");
}

// ========= UNLOCK =========

if(args[0] == "unlock"){

data[threadID].lock = false;

fs.writeJsonSync(dataPath,data,{spaces:2});

return message.reply("🔓 Group Protection Disabled");
}

// ========= MENU =========

return message.reply(`

╭───『 GROUP PROTECTION 』───⭓

anti backup
Save group info

anti restore
Restore group info

anti lock
Enable protection

anti unlock
Disable protection

╰────────────────────⭓
`);

},

// ================= EVENT =================

onEvent: async function({api,event,role}){

const {threadID,logMessageType,logMessageData,author} = event;

let data = fs.readJsonSync(dataPath);

if(!data[threadID]) return;
if(!data[threadID].lock) return;
if(!data[threadID].backup) return;

const isAdminOrBot = role >= 1 || api.getCurrentUserID()==author;

if(isAdminOrBot) return;

const g = data[threadID].backup;

// ===== NAME =====

if(logMessageType=="log:thread-name")
return api.setTitle(g.name,threadID);

// ===== EMOJI =====

if(logMessageType=="log:thread-icon")
return api.changeThreadEmoji(g.emoji,threadID);

// ===== THEME =====

if(logMessageType=="log:thread-color")
return api.changeThreadColor(g.theme,threadID);

// ===== AVATAR =====

if(logMessageType=="log:thread-image"){

if(g.avatar=="REMOVE")
return api.changeGroupImage(null,threadID);

const stream = await getStreamFromURL(g.avatar);
return api.changeGroupImage(stream,threadID);

}

// ===== NICKNAME =====

if(logMessageType=="log:user-nickname"){

const oldNick = g.nickname[logMessageData.participant_id];
return api.changeNickname(oldNick,threadID,logMessageData.participant_id);

}

}

};

Eita e ki ki feature ase Bangali te bolo