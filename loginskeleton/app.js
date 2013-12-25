// // Require 
// var express = require('express'),
// db = require( './db' ),
// http = require('http'),
// path = require('path'),
// passport = require('passport'),
// LocalStrategy = require('passport-local').Strategy,
// //FacebookStrategy = require('passport-facebook').Strategy,
// app = express();

// // Specify port
// var port = 8080;
// //var ip = "192.168.1.105";

/*
//  *	Configure the nodejs express server here
//  *  Middlewares here 
//  */
// app.configure(function(){
// 	app.set('port', port);
// 	//app.set('port', process.env.PORT || 4040);
// 	app.set('views', __dirname + '/app/views');
// 	app.set('view engine', 'ejs');
// 	//app.use(express.favicon());
// 	//app.use(express.logger('dev'));
// 	//app.use(express.bodyParser());
// 	//app.use(express.methodOverride());
// 	//app.use(express.cookieParser());
// 	//app.use(express.session({ secret: 'PaRtY1522345'}));
// 	app.use(express.cookieParser());
// 	app.use(express.bodyParser());
// 	app.use(express.session({ secret: 'SECRET' }));
// 	app.use(passport.initialize());
// 	app.use(passport.session());
// 	app.use(app.router);
//   	app.use(express.static(path.join(__dirname, 'public')));
// });


/**
 * Module dependencies.
 */
var express = require('express'),
  fs = require('fs'),
  http = require('http'),
  path = require('path'),
  mongoose = require('mongoose'),
  passport = require("passport"),
  flash = require("connect-flash");

var env = process.env.NODE_ENV || 'development',
  config = require('./config/config')[env];

// Connect to mongodb
mongoose.connect(config.db);

//TODO: problem this loads in alphabetical order, but we need a particular order
//      since post relies on userschema which has to be registered first with 
//      mongoose, hence has to be loaded first. Hard coding for now, should
//      fix later.
var models_dir = __dirname + '/app/models';
// fs.readdirSync(models_dir).forEach(function (file) {
//   if(file[0] === '.') return; 
//   require(models_dir+'/'+ file);
// });
var models = ['user.js','comments.js', 'posts.js'];
models.forEach(function(model){
  require(models_dir+'/'+model);
});


// Require passport.js
require('./config/passport')(passport, config)

var app = express();


/*
 *	Configure the nodejs express server here
 *  Middlewares here 
 */
app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/app/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.methodOverride());
  app.use(flash());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

// Handle 500 error
app.use(function(err, req, res, next){
  res.status(err.status || 500);
  res.render('500', { error: err });
});

// Handle 404 error 
app.use(function(req, res, next){
  res.status(404);
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }
  res.type('txt').send('Not found');
});






/*
 *	Declare Routes
 */ 
require('./config/routes')(app, passport);

/*
 *	Create server and listen 
 */
http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});