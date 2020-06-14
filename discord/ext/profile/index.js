const prefix = process.env.COMMAND_PREFIX

const Discord = require('discord.js')

const Extensions = require('../../models/extensions')

async function profile(msg, bot) {
    if (!msg.content.startsWith(prefix) || msg.author.bot || msg.channel.type === 'dm') return
    if (!(await Extensions.findOne({sid: msg.guild.id})).profile) return
    const args = msg.content.slice(prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()

    if (command === '프로필') {
        if (msg.channel.type === 'dm') return
        let embed = new Discord.MessageEmbed()
        let user
        if (msg.mentions.members.first()) {
            user = msg.mentions.members.first()
        } else {
            user = msg.member
        }
        embed.setTitle(`프로필`)
        embed.setAuthor(user.user.tag, user.user.avatarURL())
        embed.addField("이름", user.user.tag, true)
        embed.addField("상태", user.user.presence.status, true)
        embed.addField("게임", user.user.presence.activities.join('\n') || '없음', true)
        embed.addField("역할", '```' + user.roles.cache.map(r => r.name) + '```', false)
        await msg.channel.send(embed)
    }
}

exports.init = function (bot) {
    bot.on('message', msg => profile(msg, bot))
}