const express = require('express')
const router = express.Router()

router.use(function (req, res, next) {
    if (req.session.user) {
        next()
    }
    else {
        res.redirect('/auth/login')
    }
})

router.use('/:sid', function (req, res, next) {
    req.sid = req.params.sid
    next()
}, require('./admin'))

router.get('/', (req, res) => {
    let guilds = []
    req.session.guilds.forEach(key => {
        if (Number(key.permissions) & 8) {
            guilds.push(key)
        }
    })
    res.render('admin/servers', {guilds, user: req.session.user})
})

module.exports = router