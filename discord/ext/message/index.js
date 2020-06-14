const prefix = process.env.COMMAND_PREFIX

module.exports.init = function (bot) {
    bot.on('message', sendMessageToChannel)
}

async function sendMessageToChannel(msg) {
    if (msg.author.bot) return
    if (msg.channel.type === 'dm') return
    if (!msg.content.startsWith(prefix)) return
    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === "메시지") {
        const chn = msg.mentions.channels.first()
        if (chn) {
            await chn.send('TEST')
        }
    }
}