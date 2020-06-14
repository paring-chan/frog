let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan')('dev');
let sassMiddleware = require('node-sass-middleware');
let session = require('express-session')
let indexRouter = require('./routes/index');
let RedisStore = require('connect-redis')(session)

let app = express();

const bot = require('./discord/app')
app.use(function (req, res, next) {
  req.bot = bot
  next()
})
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_KEY,
  store: new RedisStore({
    client: require('./redis')
  })
}))
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));

app.use('/', indexRouter);
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
