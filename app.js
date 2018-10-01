var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const ejs = require('ejs');
var goods = require('./routes/goods')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html',ejs.__express)
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 拦截器
app.use((req, res, next) => {
  if (req.cookies.userId) { // 已登录
    next();
  } else { // 未登录
    // 拦截器白名单
    let whiteList = req.path == '/users/login' || req.path == '/users/logout'||
                    req.originalUrl.indexOf('/goods/list') > -1 
    if (whiteList) {
      next()
    } else {
      res.json({
        status: '101',
        msg: '当前未登录',
        result: ''
      })
    }

  }
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/goods',goods);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
