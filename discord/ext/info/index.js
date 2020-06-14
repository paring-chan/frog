const Discord = require('discord.js')
const Extensions = require('../../models/extensions')
const prefix = process.env.COMMAND_PREFIX

module.exports.init = function (bot) {
    bot.on('message', onMessage)
}

async function onMessage(msg) {
    if (!msg.content.startsWith(prefix) || msg.author.bot || !(await Extensions.findOne({sid: msg.guild.id})).guildInfo || msg.channel.type === "dm") return
    const args = msg.content.slice(prefix.length).split(/ +/)
    const cmd = args.shift().toLowerCase()
    switch (cmd) {
        case '서버정보':
            const embed = new Discord.MessageEmbed()
            embed.setTitle("서버 정보")
            embed.addField("서버 이름", msg.guild.name, true)
            embed.addField("서버 id", msg.guild.id.toString(), true)
            await msg.channel.send(embed)
            break
    }
}