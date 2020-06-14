const Discord = require('discord.js')

const prefix = process.env.COMMAND_PREFIX

const extList = require('../../../constants').ext_list

const extensions = require('../../models/extensions')

function init(bot) {
    bot.on('message', onMessage)
}

async function onMessage(msg) {
    if (msg.author.bot) return
    if (msg.channel.type === 'dm') return
    if (!msg.content.startsWith(prefix)) return
    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case '활성화':
            if (!await checkPerm(msg)) return
            if (args.length !== 1) {
                return await help(msg)
            }
            if (Object.keys(extList).includes(args[0])) {
                const ext = await extensions.findOne({sid: msg.guild.id})
                if (ext[extList[args[0]]]) {
                    let embed = new Discord.MessageEmbed()
                    embed.setAuthor("이미 활성화 되어있는 기능입니다.")
                    return msg.channel.send(embed)
                } else {
                    ext[extList[args[0]]] = true
                    await ext.save(function (err) {
                        if (err) {
                            return msg.channel.send("기능 활성화에 실패했습니다.")
                        } else {
                            let embed = new Discord.MessageEmbed()
                            embed.setAuthor(`기능 ${args[0]}이(가) 성공적으로 활성화 되었습니다.`)
                            return msg.channel.send(embed)
                        }
                    })
                }
            } else return await help(msg)
            return
        case '비활성화':
            if (!await checkPerm(msg)) return
            if (args.length !== 1) {
                return await help(msg)
            }
            if (Object.keys(extList).includes(args[0])) {
                const ext = await extensions.findOne({sid: msg.guild.id})
                if (!ext[extList[args[0]]]) {
                    let embed = new Discord.MessageEmbed()
                    embed.setAuthor("활성화 되지 않은 기능입니다.")
                    return msg.channel.send(embed)
                } else {
                    ext[extList[args[0]]] = false
                    await ext.save(function (err) {
                        if (err) {
                            return msg.channel.send("기능 비활성화에 실패했습니다.")
                        } else {
                            let embed = new Discord.MessageEmbed()
                            embed.setAuthor(`기능 ${args[0]}이(가) 성공적으로 비활성화 되었습니다.`)
                            return msg.channel.send(embed)
                        }
                    })
                }
            } else return await help(msg)
            return
    }
}

async function checkPerm(msg) {
    if (!msg.member.hasPermission("ADMINISTRATOR")) {
        let embed = new Discord.MessageEmbed()
        embed.setAuthor("이 명령어를 사용할 권한이 없습니다.", msg.author.avatarURL())
        await msg.channel.send(embed)
        return false;
    }
    return true
}

async function help(msg) {
    let embed = new Discord.MessageEmbed()
    embed.setAuthor("명령어 사용법", msg.author.avatarURL())
    embed.addField("명령어 사용법", "+활성화/비활성화 <기능>")
    embed.addField("기능 목록", Object.keys(extList).toString())
    await msg.channel.send(embed)
}

module.exports.init = init