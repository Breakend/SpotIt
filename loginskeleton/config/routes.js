/*
 *	routes.js
 *	
 *	This file contains all the routes served by the node.js app 
 */

var User = require('../app/models/user'); // User api
var Post = require('../app/models/posts');
var Auth = require('./middlewares/authorization.js');

module.exports = function(app, passport){

	app.post('/post/new', Post.createPost);
	app.post('/post/:id/comment', Post.comment);

	// Get: login screen
	app.get('/login', function(req, res){
		res.render('login', { err : req.flash('error') } ); // Return index.ejs in root directory 
	});

	// Login post
	app.post("/login" 
		,passport.authenticate('local',{
			successRedirect : "/",
			failureRedirect : "/login",
			failureFlash: true, // prompt user to try again
		})
	);

	// Get: signup
	app.get("/signup", function(req, res){ 
		console.log("THE REQ:" +req.Object);
		res.render("signup", { err : req.flash('error') } );
	});

	// Sign 
	app.post("/signup", Auth.userExist, function (req, res, next) {
		console.log("routes.js: start sign up");
		User.signup(req.body.email, req.body.password, function(err, user){
			console.log("routes.js: req.body.email = "+req.body.email+" req.body.password = "+req.body.password);
			if(err) throw err;
			req.login(user, function(err){
				if(err) return next(err);
				return res.redirect("/"); //profile
			});
		});
	});

	// Get: login request
	app.get('/', function(req, res){
		Post.getAll(function(error, posts){
			if(req.isAuthenticated()){
				res.render("feed", { user : req.user, posts: posts}); 
			}else{
				res.render("feed", { user : null, posts: posts});
			}
		});
	});

	// Get: logout
	// Logs out the current users and redirects to root
	app.get('/logout', function(req, res){
  		req.logout();
  		res.redirect('/');
	});



}