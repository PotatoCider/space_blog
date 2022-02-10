require('./.pnp.cjs').setup(); // yarn
require('dotenv').config(); // read .env

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const logger = require('morgan');



const SQLiteStore = require('connect-sqlite3')(session);

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');

const app = express();

// setup logger for development
app.use(logger('dev'));

// setup views
app.set('views', 'views');
app.set('view engine', 'ejs');

// accept application/json and application/x-www-form-urlencoded from html forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// serve static html/css/js files
app.use('/public', express.static('public'));

// setup session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: new SQLiteStore({ db: 'sessions.db', dir: '.db/' })
}));

// try to authenticate using session first
app.use(passport.authenticate('session'));

// inject session messages into res.locals
// for views to access
app.use((req, res, next) => {
  res.locals.messages = req.session.messages || [];
  req.session.messages = [];
  next();
})

// routers
app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/', postsRouter);

app.listen(3000, () => console.log('Server started on http://localhost:3000'));