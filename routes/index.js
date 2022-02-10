const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

router.get('/about', (req, res) => {
    res.render('about', { user: req.user });
});

router.get('/contact', (req, res) => {
    res.render('contact', { user: req.user });
});

router.get('/posts', (req, res) => {
    res.render('post_list', { user: req.user });
});

router.get('/posts/:post_id', (req, res) => {
    res.render('post', { user: req.user });
});

router.get('/write_posts', (req, res) => {
    if (!req.user) return res.redirect('/');
    res.render('post', { user: req.user });
});

module.exports = router;