var mongoose  = require( 'mongoose' );
var passport = require('passport');
var User     = mongoose.model( 'User' );

exports.list = function(req, res){
    User.find( function ( err, users, count ){
    res.render( 'users', {
        mainTitle : 'Express Todo Example',
        users : users
    });
  });
};

exports.create = function(req, res) {
  var user = new User();
  user.email = req.param('email');
  user.password = req.param('password');
  user.name.first = req.param('name.first');
  user.name.last = req.param('name.last');
  user.dob = new Date(req.param('birthYear'), req.param('birthMonth'), req.param('birthDay'));
  user.gender = req.param('gender');
  user.agreed = true;

  var self = this;
  user.save(function (err) {
    if (err)
        console.log(err);
    else{
      req.session.user = user._id;
      res.redirect('/');
    }
  });
};

exports.login = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      req.session.user = user._id;
      return res.redirect('/');
    });
  })(req, res, next);
};

exports.getLatestUpdates = function(userid){
  User.findOne({_id: userid}, function(error, userFound) {
    if( error ) console.log(error);
    // else{
})};

exports.logout = function(req, res) {
    // destroy session
  if (req.session.user) {
    req.session.destroy();
  }
  req.logout();
  res.redirect('/');
};

