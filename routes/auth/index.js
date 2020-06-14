const express = require('express')
const router = express.Router()
const btoa = require('btoa')
global.fetch = require('node-fetch')

const red = encodeURIComponent(process.env.OAUTH2_REDIRECT_URI)
const cid = process.env.OAUTH2_CLIENT_ID
const csr = process.env.OAUTH2_CLIENT_SECRET

router.get('/login', (req, res, next) => {
    res.redirect([
        'https://discordapp.com/oauth2/authorize',
        `?client_id=${cid}`,
        '&scope=identify+guilds',
        '&response_type=code',
        `&callback_uri=${red}`
    ].join(''))
})

router.get('/callback', async (req, res) => {
    if (!req.query.code) {
        res.redirect('/')
        throw new Error("NoCodeProvided")
    }
    const code = req.query.code
    const cred = btoa(`${cid}:${csr}`)
    const response = await (await fetch(`https://discordapp.com/api/oauth2/token`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${cred}`
        },
        method: "POST",
        body: `client_id=${cid}&code=${code}&grant_type=authorization_code`
    })).json()

    req.session.access_token = response.access_token
    req.session.user = (await fetch('https://discord.com/api/users/@me', {
        headers: {
            'Authorization': 'Bearer ' + req.session.access_token
        }
    })).json()
    req.session.guilds = JSON.parse(await (await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            'Authorization': 'Bearer ' + req.session.access_token
        }
    })).text())
    if (req.session.guilds.message) {
        req.session.access_token = undefined
        req.session.user = undefined
        return res.send(req.session.guilds)
    }
    res.redirect('/servers')

})

router.get('/check', (req, res) => {
    if (req.session.access_token) {
        return res.send({logged: true})
    } else {
        return res.send({logged: false})
    }
})

router.get('/logout', (req, res) => {
    req.session.access_token = undefined
    res.redirect('/')
})

module.exports = router