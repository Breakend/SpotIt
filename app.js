/**
 * Module dependencies.
 */
var express = require('express'),
  fs = require('fs'),
  http = require('http'),
  path = require('path'),
  mongoose = require('mongoose'),
  passport = require("passport"),
  FacebookStrategy = require('passport-facebook').Strategy,
  flash = require("connect-flash"),
  passReset = require('pass-reset');

var env = process.env.NODE_ENV || 'development',
  config = require('./config/config')[env];

//Configure Facebook Strategy for Passport
passport.use(new FacebookStrategy(config.facebook,
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() { //asynch (might be the thing causing problems)
      User.findOrCreateFaceBookUser(profile, function(err, user) {
        if (err) { return done(err); }
        done(null, user);
      });
    });
  }
));

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
var models = ['user.js','comments.js', 'posts.js', 'messages.js', 'connections.js'];
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

/**
* Setup Pass Reset
*/

var passreset  = require('pass-reset');

PassResetToken = require(__dirname + '/app/models/passresettoken.js')
function MongooseStore() {
        // this.client = mongoose.createConnection(conf);
        this.init.bind(this);
}

MongooseStore.prototype.init = function() {
        // Check for expired tokens periodically and remove them
        setInterval(function() {
                var expired = {expires: {'$lte': new Date}};
                PassResetToken.remove(expired).exec();
        }.bind(this));
};

MongooseStore.prototype.create = function(id, token, callback) {
        (PassResetToken.create({key: id, token: token}, callback));
};

MongooseStore.prototype.lookup = function(token, callback) {
        PassResetToken.findOne({token: token}, function(err, token) {
                if (err) {
                        return callback(err);
                }
                // Not found
                if (! token) {
                        return callback(null, false);
                }
                // Expired
                if (Date.now() > token.expired) {
                        token.remove();
                        return callback(null, false);
                }
                // Good token found
                callback(null, token.key);
        });
};

MongooseStore.prototype.destroy = function(token, callback) {
        PassResetToken.remove({token: token}, callback);
};

passreset.storage.setStore(new MongooseStore());

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