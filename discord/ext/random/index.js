const prefix = process.env.COMMAND_PREFIX

const Extensions = require('../../models/extensions')

async function onMessage(msg) {
    if (!msg.content.startsWith(prefix) || msg.author.bot || !(await Extensions.findOne({sid: msg.guild.id})).chat) return
    const args = msg.content.slice(prefix.length).split(/ +/)
    const cmd = args.shift().toLowerCase()
    switch (cmd) {
        case '안녕':
            await msg.channel.send(random(['ㅎㅇㅎㅇ', '안녕', '나는 안녕 못해']))
            break
        case '뒤져':
            await msg.channel.send(random(['뭐','싫어']))
            break
        case '개굴개굴':
            await msg.channel.send(random(['뭐','따라하지 마라']))
            break
        case '피스':
            await msg.channel.send(random(['바보 아님?','그 미친놈...?']))
            break
        case '뭐해':
            await msg.channel.send(random(['덩 싸는...아니 흠','마ㅇ...']))
            break
    }
}

function random(list) {
    const index =Math.floor(Math.random() * list.length)
    return list[index]
}

module.exports.init = function (bot) {
    bot.on('message', onMessage)
}
