const express = require('express');
const multer = require('multer');
const { convert } = require('html-to-text');

const db = require('../db');
const upload = multer({ dest: '.uploads/' });

const router = express.Router();


router.get('/contact', (req, res) => {
  db.all('SELECT * FROM feedback', (err, rows) => {
    if (err) return next(err);
    console.log(rows);
    res.render('contact', {
      user: req.user,
      posts: rows.map(row => {
        row.textContent = convert(row.content);
        return row;
      }),
    });
  });
});

router.get('/contact', (req, res, next) => {
  db.get('SELECT * FROM feedback WHERE feedback_id = ?', [req.params['feedback_id']], (err, row) => {
    if (err) return next(err);
    if (!row) return res.redirect('/'); // redirect 404?
    console.log(row);
    res.render('contact', {
      user: req.user, post: row,
    });
  });
});

// Admin

router.get('/contact', (req, res) => res.redirect('/contact'));

// router.get('/contact', (req, res) => {
//   if (!req.user || req.user.username != process.env.ADMIN_USERNAME)
//     return res.redirect('/');
//   res.render('edit_post', { user: req.user });
// });

router.post('/contact', upload.single('picture'), (req, res, next) => {
//   if (!req.user) return res.redirect('/');
  console.log('req:', req.body);
  const id = req.body.fullname.trim().split(' ').join('-').toLowerCase();
  console.log('id:', id);
  db.run('INSERT INTO posts (feedback_id, fullname, email, phone, message) VALUES (?, ?, ?, ?, ?)', [
    id,
    req.body.fullname,
    req.body.email,
    req.body.phone,
    req.body.message,
  ], err => {
    if (err) next(err);

    res.redirect('/contact/' + id);
  });
});


module.exports = router;