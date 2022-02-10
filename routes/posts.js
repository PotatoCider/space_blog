const express = require('express');
const multer = require('multer');

const db = require('../db');
const upload = multer({ dest: '.uploads/' });

const router = express.Router();


router.get('/posts', (req, res) => {
  res.render('post_list', { user: req.user });
});

router.get('/posts/:post_id', (req, res) => {
  res.render('post', { user: req.user });
});

router.get('/write_post', (req, res) => {
  if (!req.user) return res.redirect('/');
  res.render('write_post', { user: req.user });
});

router.post('/write_post', upload.single('picture'), (req, res, next) => {
  if (!req.user) return res.redirect('/');
  db.run('INSERT INTO posts (owner_id, title, picture_path, authors, content) VALUES (?, ?, ?, ? ,?)', [
    req.user.id,
    req.body.title,
    req.file.path,
    req.body.authors.map(a => a.replace(',', '')).join(','),
    req.body.content,
  ], err => {
    if (err != null) next(err);

    res.redirect('/');
  });
});


module.exports = router;