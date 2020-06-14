const log = require('debug')('pscord:bot')
const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const Extension = require('./models/extensions')

mongoose.connect(`mongodb://${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`)

const client = new Discord.Client()

client.db = mongoose.connection


client.on('message', async (msg) => {
    if (msg.channel.type === 'dm') return
    await initDatabase(msg)
})

client.on('guildMemberAdd', async () => await initDatabase())

async function initDatabase(msg) {
    if (!await Extension.exists({sid: msg.guild.id})) {
        let ext = new Extension()
        ext.sid = msg.guild.id
        await ext.save()
    }
}

client.login(process.env.BOT_TOKEN).then(() => {
    log('Logged in as ' + client.user.tag)
    client.guilds.cache.forEach(async (guild) => {
        console.log(`Setting up server ${guild.id}`)
        const field = new Extension(await Extension.findOne({sid: guild.id}))
        field.sid = guild.id
        await field.save()
    })

    fs.readdirSync(path.join(__dirname, '/ext')).forEach(dir => {
        require('./ext/' + dir + '/index.js').init(client)
    })
})

module.exports = client