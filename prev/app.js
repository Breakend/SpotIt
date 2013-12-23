
/**
 * Module dependencies.
 */

 var express = require('express')
 , db = require( './db' )
 , index = require('./routes/index')
 , user = require('./routes/user')
 , http = require('http')
 , path = require('path')
 , connection = require('mongodb').Connection
 , server = require('mongodb').Server
 , passport = require('passport')
 , LocalStrategy = require('passport-local').Strategy
 // , socket = require('socket.io').listen(app)
 , app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 4040);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'PaRtY1522345'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//----------------------------------------
//  PASSPORT AUTHENTICATION
//----------------------------------------
passport.use(new LocalStrategy({
  usernameField: 'email'
},
function(email, password, done) {
    // Find the user by username.  If there is no user with the given
    // username, or the password is not correct, set the user to `false` to
    // indicate failure.  Otherwise, return the authenticated `user`.
    db.authenticate(email, password, function(err, user) {
      return done(err, user);
    });
  }
  ));

// Passport session setup.

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  db.findById(id, function (err, user) {
    done(err, user);
  });
});

//----------------------------------
// SOCKETS
//----------------------------------

// socket.on('connection', function(client){
//   client.on('start', function(userid){
//     user.getLatestUpdates(userid);
//   });
// });

//app.get('/', routes.index);
//----------------------------------
// HTTP REQUESTS
//----------------------------------
app.get('/map', function(req, res){
  res.render('map.ejs',{
  });
});

app.get('/party/near/:lon/:lat/:dist?', index.near);
app.get('/register', function(req, res){
  res.render('register.ejs',{});
});
app.get('/login', function(req, res){
  res.render('login.ejs',{});
});
app.get('/party/create', function(req, res) {
  res.render('newparty.ejs', {});
});
app.get('/party/findById/:id?', index.findById);
app.get('/logout', user.logout);
app.post('/login', user.login);
app.post('/register', user.create);
app.post('/party/post', index.addPost);
app.get('/users', user.list);
app.get('/', index.rendernear);
// app.get('/', function(req, res){
//   // check if the user's credentials are saved in a cookie //
//   if (req.session.user === undefined){
//     res.render('home', {} );
//   } else{
//     res.render('home-member',{});
//   }
// });
app.post('/party/create', index.create);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
