const express = require('express');
const multer = require('multer');
const { convert } = require('html-to-text');

const db = require('../db');
const upload = multer({ dest: '.uploads/' });

const router = express.Router();


router.get('/posts', (req, res) => {
  db.all('SELECT * FROM posts', (err, rows) => {
    if (err) return next(err);
    console.log(rows);
    res.render('post_list', {
      user: req.user,
      posts: rows.map(row => {
        row.textContent = convert(row.content);
        return row;
      }),
    });
  });
});

router.get('/posts/:post_id', (req, res, next) => {
  db.get('SELECT * FROM posts WHERE post_id = ?', [req.params['post_id']], (err, row) => {
    if (err) return next(err);
    if (!row) return res.redirect('/'); // redirect 404?
    console.log(row);
    res.render('post', {
      user: req.user, post: row,
    });
  });
});

// Admin

router.get('/admin', (req, res) => res.redirect('/admin/add_post'));

router.get('/admin/add_post', (req, res) => {
  if (!req.user || req.user.username != process.env.ADMIN_USERNAME)
    return res.redirect('/');
  res.render('edit_post', { user: req.user });
});

router.post('/admin/add_post', upload.single('picture'), (req, res, next) => {
  if (!req.user) return res.redirect('/');
  console.log('req:', req.body);
  const id = req.body.title.trim().split(' ').join('-').toLowerCase();
  console.log('id:', id);
  db.run('INSERT INTO posts (post_id, title, category, date, picture_path, authors, content) VALUES (?, ?, ?, ?, ?, ? ,?)', [
    id,
    req.body.title,
    req.body.category,
    new Date().toISOString(),
    req.file && req.file.path,
    req.body.authors.map(a => a.replace(',', '')).filter(a => a).join(','),
    req.body.content,
  ], err => {
    if (err) next(err);

    res.redirect('/posts/' + id);
  });
});


module.exports = router;