const Discord = require('discord.js')
const dateFormat = require('dateformat')

const pages = {
    음악: new Discord.MessageEmbed().setTitle("도움말 - 음악").addField("플레이", "+플레이 <검색어/url(유튜브)>", false).addField("정지", "+정지", false)
        .addField("건너뛰기", "+스킵", true),
    기능: new Discord.MessageEmbed().setTitle("도움말 - 기능 관리").addField("기능 활성화", "+활성화 <기능>", true).addField("기능 비활성화", "+비활성화 <기능>", false)
}

const prefix = process.env.COMMAND_PREFIX

async function help(msg, bot) {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return
    const args = msg.content.slice(prefix.length).split(/ +/)
    const command = args.shift().toLowerCase()

    if (command === '도움말') {
        if (args.length === 0) {
            let embed = new Discord.MessageEmbed()
            embed.setTitle("봇 도움말")
            embed.addField('웹 사이트  --[배타vr . 2] --', 'https://frog.pscraft.tk/')
            return msg.channel.send(embed.setFooter(
                dateFormat(new Date(), "yyyy년 mm월 dd일 hh시 MM분 ss초") + " (KST)"
            ))
        } else {
            if (pages[args[0]]) {
                await msg.channel.send(pages[args[0]].setThumbnail(msg.client.user.avatarURL()).setFooter('테스트.'))
            } else {
                let embed = new Discord.MessageEmbed()
                embed.setTitle("페이지를 찾을 수 없습니다.")
                embed.setDescription(`도움말 페이지 \`${args[0]}\`을 찾을 수 없습니다.`)
                return msg.channel.send(embed)
            }
        }
    }
}

exports.init = function (bot) {
    bot.on('message', msg => help(msg, bot))
}