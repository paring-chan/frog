let express = require('express');
let router = express.Router();

router.use('/auth', require('./auth'))

router.use('/servers', require('./manage'))

router.get('/', (req, res) => res.render('home'))

module.exports = router;
