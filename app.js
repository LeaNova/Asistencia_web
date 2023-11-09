var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')

var auth = require('./middleware/auth')

// rutes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usuario');
var asistenciaRouter = require('./routes/asistencia');
var empleadoRouter = require('./routes/empleado');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'Asistencia_secretosa_55',
  resave: true,
  saveUninitialized: true
}))

// controllers
app.use('/', indexRouter);
app.use('/usuario', usersRouter);
app.use('/asistencia', auth, asistenciaRouter);
app.use('/empleado', auth, empleadoRouter);

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
