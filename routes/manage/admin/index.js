const express = require('express')

const router = express.Router()

const Extensions = require('../../../discord/models/extensions')

const extList = require('../../../constants').ext_list

router.use(async function (req, res, next) {
    try {
        let guild = req.session.guilds.find(r => r.id === req.sid)
        if (guild && (Number(guild.permissions) & 8)) {
            if (req.bot.guilds.cache.find(r => r.id === req.sid)) {
                req.plguins = await Extensions.findOne({sid: req.sid})
                return next()
            } else {
                return res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${process.env.OAUTH2_CLIENT_ID}&scope=bot&permissions=8&guild_id=${req.sid}`)
            }
        }
        return res.status(401).send('권한이 없습니다.')
    } catch (e) {
        return res.status(500).send(e.stack)
    }
})

router.get('/',(req, res) => {
    res.render('admin/dashboard', {sid: req.sid, guild: req.session.guilds.find(r => r.id === req.sid)})
})

router.get('/plugins',async (req, res) =>{
    res.render('admin/plugins', {sid: req.sid, guild: req.session.guilds.find(r => r.id === req.sid), extensions: await Extensions.findOne({sid: req.sid})})
})

router.get('/switch/:ext/:bool', async (req, res) => {
    const field = await Extensions.findOne({sid: req.sid})
    if (Object.values(extList).includes(req.params.ext)) {
        field[req.params.ext] = req.params.bool === "true";
        await field.save()
        return res.end('success')
    }
    return res.status(404).send("기능 ID가 일치하지 않습니다.")
})

router.get('/status/:ext', async (req, res) => {
    if (Object.values(extList).includes(req.params.ext)) {
        const field = await Extensions.findOne({sid: req.sid})
        res.send({active: field[req.params.ext]})
    }
})


module.exports = router