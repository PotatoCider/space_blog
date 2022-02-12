const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { convert } = require('html-to-text');

const db = require('../db');
const upload = multer({ dest: '.uploads/' });
fs.mkdirSync('public/uploads', { recursive: true });

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
    if (!row) return res.status(404).send('Error post not found'); // redirect 404?
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
  res.render('edit_post', { user: req.user, post: {} });
});

router.post('/admin/add_post', upload.single('picture'), (req, res, next) => {
  if (!req.user || req.user.username != process.env.ADMIN_USERNAME)
    return res.redirect('/');

  const id = req.body.title.trim().split(' ').join('-').toLowerCase();


  const insert = (picturePath) => db.run('INSERT INTO posts (post_id, title, category, date, picture_path, picture_caption, authors, content) VALUES (?, ?, ?, ?, ?, ? ,?, ?)', [
    id,
    req.body.title,
    req.body.category,
    new Date().toISOString(),
    picturePath,
    req.body.caption,
    req.body.authors.map(a => a.replace(',', '')).filter(a => a).join(','),
    req.body.content,
  ], err => {
    if (err) next(err);

    res.redirect('/posts/' + id);
  });
  console.log('body:', req.body);
  console.log('id:', id);

  db.get('SELECT COUNT(1) as count FROM posts WHERE post_id = ?', [id], (err, row) => {
    if (err) return next(err);

    if (row.count > 0) {
      return res.status(400)
    }

    console.log(row);
    if (req.file) {
      const newPath = `public/uploads/${id}.jpg`
      fs.rename(req.file.path, newPath, err => {
        if (err) return next(err);
        insert(newPath);
      });
    } else {
      insert(null);
    }
  })


});


router.get('/admin/edit_post/:post_id', (req, res) => {
  if (!req.user || req.user.username != process.env.ADMIN_USERNAME)
    return res.redirect('/');

  db.get('SELECT * FROM posts WHERE post_id = ?', [req.params['post_id']], (err, row) => {
    if (err) return next(err);
    if (!row) return res.status(404).send('Error post not found'); // redirect 404?

    row.authors = row.authors.split(',');

    res.render('edit_post', {
      user: req.user, post: row,
    });
  });
});

router.post('/admin/delete_post/:post_id', (req, res) => {
  if (!req.user || req.user.username != process.env.ADMIN_USERNAME)
    return res.redirect('/');

  db.run('DELETE FROM posts WHERE post_id = ?', [req.params['post_id']], err => {
    if (err) return next(err);

    res.redirect('/posts');
  });
});

router.post('/admin/edit_post/:post_id', (req, res, next) => {
  if (!req.user || req.user.username != process.env.ADMIN_USERNAME)
    return res.redirect('/');

  console.log('body2:', req.body);
  const { category, caption } = req.body;
  if (req.body['authors[]']) req.body.authors = req.body['authors[]'];
  var fields = '';
  fields += `category = '${category}', `;
  if (caption) fields += `picture_caption = '${caption}', `;
  fields += `authors = '${req.body.authors.filter(a => a.trim()).join(',')}', `;
  // fields += `content = '${content}', `;
  // if (title != old_title) {
  //   console.log('1');
  // } else if (category != old_category) {
  //   console.log('2');
  // } else if (caption != old_caption) {
  //   console.log('3');
  // } else if (authors.join(',') != old_authors.join(', ')) {
  //   console.log('4');
  // } else if (content != old_content) {
  //   console.log('5');
  // }
  if (fields.length > 0) fields = fields.slice(0, -2);

  db.run(`UPDATE posts SET ${fields} WHERE post_id = ?`, [req.params['post_id']], err => {
    if (err) return next(err);

    res.redirect('/posts/' + req.params['post_id']);
  });
});

module.exports = router;