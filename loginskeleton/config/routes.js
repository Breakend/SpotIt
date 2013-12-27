/*
 *	routes.js
 *	
 *	This file contains all the routes served by the node.js app 
 */

var User = require('../app/models/user'); // User api
var Post = require('../app/models/posts');
var Comment = require('../app/models/comments');
var Auth = require('./middlewares/authorization.js');

module.exports = function(app, passport){

	app.post('/post/new', Post.createPost);
	app.post('/post/:id/comment', Post.comment);
	app.post('/post/:id/down', Post.downvote);
	app.post('/post/:id/up', Post.upvote);
	app.post('/comment/:id/up', Comment.upvote);
	app.post('/comment/:id/down', Comment.downvote);

	app.get('/connections', function(req, res){
		if(req.isAuthenticated()){
			User.findOne({_id: req.user._id}).populate('connections connectionPending connectionRequests')
			.exec(function(error, user){
				console.log(user);
				res.render('connections', {user: user});
			});
		}else{
			res.redirect("/login");
		}
			
	});
	app.post('/user/:id/connect', User.requestConnection);
	app.post('/user/:id/connection/accept', User.acceptConnection);
	app.post('/user/:id/connection/reject', User.rejectConnection);

	
	// Get: message screen
	app.get('/message', function(req, res){
		if(req.isAuthenticated()){
			res.render('message',{ user : req.user}); // Should render the messages for a group of users (prob just 2)
		}else{
			res.redirect("/login");
		}	
	});	


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
				//This is to make the chevron light up
				//it probably shouldn't be here but ejs is being a pain
				//and not allowing me to compare user ids in the ups and downs
				// arrays to check there...
		        posts.forEach(function(post){
		        	post.ups.forEach(function(puser){
		        		if(puser._id.equals(req.user._id)) post.hasUp=true;
		        	});
		        	post.downs.forEach(function(puser){
		        		if(puser._id.equals(req.user._id)) post.hasDown=true;
		        	});
		        	post.comments.forEach(function(comment){
		        		// console.log(comment);
			        	comment.ups.forEach(function(cuser){
			        		if(cuser.equals(req.user._id)) comment.hasUp=true;
			        	});
			        	comment.downs.forEach(function(cuser){
			        		if(cuser.equals(req.user._id)) comment.hasDown=true;
			        	});
		        	});
      			});

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