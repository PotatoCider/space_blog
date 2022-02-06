const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');

const db = require('../db');

passport.use(new LocalStrategy((username, password, done) => {
  // fetch user by username
  db.get('SELECT rowid AS id, * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) return done(err);

    // if user not found, show error message
    if (!row) return done(null, false, { message: 'Incorrect username or password.' });

    // check if password is equal in database.
    crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', (err, hashedPwd) => {
      if (err) return done(err);
      if (!crypto.timingSafeEqual(row.password_hash, hashedPwd))
        return done(null, false, { message: 'Incorrect username or password.' });

      return done(null, row);
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, { id: user.id, username: user.username });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const router = express.Router();

router.get('/login', (req, res, next) => {
  res.render('login');
});

router.post('/login/password', passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureMessage: true
}));

router.post('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', (req, res, next) => {
  const salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', (err, hashedPwd) => {
    if (err) return next(err);

    db.run('INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)', [
      req.body.username,
      hashedPwd,
      salt
    ], err => {
      if (err) return next(err);

      req.login({
        id: this.lastID,
        username: req.body.username
      }, (err) => {
        if (err) return next(err);
        res.redirect('/');
      });
    });
  });
});

module.exports = router;