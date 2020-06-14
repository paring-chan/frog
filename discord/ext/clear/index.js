const Extensions = require('../../models/extensions')

module.exports.init = function (bot) {
    bot.on('message', onMessage)
}

const prefix = process.env.COMMAND_PREFIX

async function onMessage(msg) {
    if (!msg.content.startsWith(prefix) || msg.author.bot || !(await Extensions.findOne({sid: msg.guild.id})).clearChat) return
    const args = msg.content.slice(prefix.length).split(/ +/)
    const cmd = args.shift().toLowerCase()

    if (cmd === "청소") {
        try {
            if (!isNaN(args[0])) {
                await msg.delete()
                await msg.channel.bulkDelete(Number(args[0]))
            } else {
                return msg.channel.send('명령어 사용법: 개굴아 청소 <삭제할 메시지 개수>')
            }
        } catch (e) {
            await msg.channel.send("```" + e.message + "```")
        }

    }
}