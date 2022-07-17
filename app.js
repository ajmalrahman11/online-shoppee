var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs=require('express-handlebars');
var fileUpload = require('express-fileupload')

// var mv = require('mv');
// const upload=require(express-fileUpload)

// require('dotenv').config();
// const fast2sms = require('fast-two-sms')
// const config = require('./config/api')
// const client =  require('twilio')(config.accountSID,config.authToken)


var session=require('express-session')


var userRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var sellerRouter=require('./routes/sellers')

var app = express();
var db= require('./config/connection')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
// app.use(upload())

app.use(session({
  secret:"key123",
  resave : false ,
  saveUninitialized : true ,
  cookie:{maxAge:1500000}}))

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/sellers',sellerRouter)

db.connect((err)=>{
  if(err)
  console.log("ConnectionError"+err);
  else
  console.log("Connected");

})

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
