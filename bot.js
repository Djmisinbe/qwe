const fs=require('fs');
const Discord=require("discord.js");
const client = new Discord.Client({restRequestTimeout: 60000})
const db = require('wio.db')
const database = require ("wio.db");
const request = require('request')
const moment = require("moment");
const ayarlar=require("./ayarlar.json");
const express = require('express');
const googleTTS = require('google-tts-api');
const { MessageButton, MessageActionRow } = require('discord-buttons');
require('discord-buttons')(client);
/////
const app = express()
app.get('/', (req, res) => res.send("Bot Aktif"))
app.listen(process.env.PORT, () => console.log('Port ayarlandı: ' + process.env.PORT))
//////////////////



client.on("message", message => {
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(ayarlar.prefix)) return;
  let command = message.content.split(' ')[0].slice(ayarlar.prefix.length);
  let params = message.content.split(' ').slice(1);
  let perms = client.yetkiler(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms);
  }
})



const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} adet komut yüklemeye hazırlanılıyor.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut ismi: ${props.help.name.toUpperCase()}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});


client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

  
client.yetkiler = message => {
  if(!message.guild) {
	return; }
  let permlvl = -ayarlar.varsayilanperm  ;
  if(message.member.hasPermission("MANAGE_MESSAGES")) permlvl = 1;
  if(message.member.hasPermission("KICK_MEMBERS")) permlvl = 2;
  if(message.member.hasPermission("BAN_MEMBERS")) permlvl = 3;
  if(message.member.hasPermission("MANAGE_GUILD")) permlvl = 4;
  if(message.member.hasPermission("ADMINISTRATOR")) permlvl = 5;
  if(message.author.id === message.guild.ownerID) permlvl = 6;
  if(message.author.id === ayarlar.sahip) permlvl = 7;
  return permlvl;
};
client.on("ready", () => {
	
  console.log(`Bütün komutlar başarıyla yüklendi!`);
  console.log(`Midgard`);
  client.user.setStatus("dnd");
  client.user.setActivity('Midgard Roleplay');
})

client.on(`guildMemberAdd`, async member => {
moment.locale("tr")
var maze = new Discord.MessageEmbed()
.setColor("00ff55")
.setTimestamp()
.setTitle("📥 Sunucuya yeni bir üye katıldı!")
.setThumbnail(member.user.avatarURL())
.addField(`:id: Üye ID:`, `${member.id}`, true)
.addField(`:octagonal_sign: Üye Adı`, `${member}`, true)
.setDescription("Hoşgeldin "+ member +" sunucuya katıldı! "+ member.guild.memberCount+" kişiye ulaştık.")
.addField("⏲️ Hesabın Oluşturulma Tarihi", moment(member.user.createdAt).format("`DD MMMM YYYY, dddd (hh:mm)`"))
client.channels.cache.get("855486018575400990").send(maze)
});

client.on(`guildMemberRemove`, async member => {
moment.locale("tr")
var maze = new Discord.MessageEmbed()
.setColor("ff0000")
.setTimestamp()
.setTitle(":inbox_tray: Bir üye sunucudan çıktı!")
.setThumbnail(member.user.avatarURL())
.setDescription( "Şu üye aramızdan ayrıldı : " + member + " Ve sayı olarak "   +  member.guild.memberCount +   " kişiye düştük." )
.addField(`:id: Üye ID:`, `${member.id}`, true)
.addField(`:octagonal_sign: Üye Adı`, `${member}`, true)
.addField(":timer: Sunucuya Katılma Tarihi", moment(member.user.joinedTimestamp).format("`DD MMMM YYYY, dddd (hh:mm)`"))
client.channels.cache.get("855486195994460230").send(maze)
});


client.on('guildMemberAdd', async(member) => {
  member.roles.add("855457501285056520")
  });


      client.on("message", (message) => {
        if (!message.guild || message.author.bot || !message.content || message.member.hasPermission("MANAGE_NICKNAMES")) return;
        let link = /(http[s]?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/gi;
          if (link.test(message.content)) {
            if (message.deletable) message.delete({ timeout: 100 }).catch(() => { return undefined; });
            message.reply("Mesajınız içeriğinde link bulunduğu için silinmiştir.");
          };
      });

      client.on('voiceStateUpdate', async (oldState, newState) => {
        if (!oldState.channelID && newState.channelID) return newState.guild.channels.cache.get('909877509544357898').send(`${newState.guild.members.cache.get(newState.id).displayName} üyesi \`${newState.guild.channels.cache.get(newState.channelID).name}\` adlı sesli kanala girdi!`);
        if (oldState.channelID && !newState.channelID) return newState.guild.channels.cache.get('909877509544357898').send(`${newState.guild.members.cache.get(newState.id).displayName} üyesi \`${newState.guild.channels.cache.get(oldState.channelID).name}\` adlı sesli kanaldan ayrıldı!`);
        if (oldState.channelID && newState.channelID && oldState.channelID != newState.channelID) return newState.guild.channels.cache.get('909877509544357898').send(`${newState.guild.members.cache.get(newState.id).displayName} üyesi ses kanalını değiştirdi! (\`${newState.guild.channels.cache.get(oldState.channelID).name}\` => \`${newState.guild.channels.cache.get(newState.channelID).name}\`)`);
        if (oldState.channelID && oldState.selfMute && !newState.selfMute) return newState.guild.channels.cache.get('909874630750273547').send(`${newState.guild.members.cache.get(newState.id).displayName} üyesi \`${newState.guild.channels.cache.get(newState.channelID).name}\` adlı sesli kanalda kendi susturmasını kaldırdı!`);
        if (oldState.channelID && !oldState.selfMute && newState.selfMute) return newState.guild.channels.cache.get('909874630750273547').send(`${newState.guild.members.cache.get(newState.id).displayName} üyesi \`${newState.guild.channels.cache.get(newState.channelID).name}\` adlı sesli kanalda kendini susturdu!`);
        if (oldState.channelID && oldState.selfDeaf && !newState.selfDeaf) return newState.guild.channels.cache.get('909874630750273547').send(`${newState.guild.members.cache.get(newState.id).displayName} üyesi \`${newState.guild.channels.cache.get(newState.channelID).name}\` adlı sesli kanalda kendi sağırlaştırmasını kaldırdı!`);
        if (oldState.channelID && !oldState.selfDeaf && newState.selfDeaf) return newState.guild.channels.cache.get('909874630750273547').send(`${newState.guild.members.cache.get(newState.id).displayName} üyesi \`${newState.guild.channels.cache.get(newState.channelID).name}\` adlı sesli kanalda kendini sağırlaştırdı!`);
      });

      client.on("message", m => {
        if (m.channel.id !== "909874630750273547") { //buraya o kanalın ID'si yazılacak.
          return;
        }
        if (m.author.id === m.guild.ownerID) return;
        if (m.attachments.size < 1) {
          m.delete();
        }
      });


        client.on('message', async (msg, member, guild) => {

          if (msg.content.toLowerCase() === 'ip') {
        var ipo = new Discord.MessageEmbed()
  .setColor("RANDOM")
  .setTitle('Midgard Roleplay Sunucu Bilgilerimiz')
  .setAuthor('Giriş yapmak için TIKLA!', 'https://cdn.discordapp.com/attachments/891232679557726228/909869304395231282/WhatsApp-Video-2020-05-11-at-23.04.58.gif', 'https://google.com')
  .addField(`Sunucu Adresimiz`,`-`, true)
  .addField(`Teamspeak Adresimiz`,`91.151.94.153:9997  `, true)
  msg.channel.send(ipo);     
         
        }
      });

      client.on('guildMemberAdd', async member => {
        const reklamisim = ["anticheat","Anticheat"]; 
         if (reklamisim.some(word => member.user.username.includes(word)) ) { 
            member.ban({ 
                reason: `Blacklist Name's.`, 
              }) 
         let isimbankanal = "855719637961146399"
         client.channels.cache.get("855719637961146399").send(`:white_check_mark: İsminde blacklist olduğundan dolayı ${member} banlandı.`)   
       } 
      
      });



client.login(ayarlar.token)