const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

router.get('/posts', (req, res) => {
    res.render('posts', { user: req.user });
});

router.get('/about', (req, res) => {
    res.render('about', { user: req.user });
});

module.exports = router;