/*
 *	routes.js
 *	
 *	This file contains all the routes served by the node.js app 
 */

var User = require('../app/models/user'); // User api
var Post = require('../app/models/posts');
var Comment = require('../app/models/comments');
var Connection = require('../app/models/connections');
var Auth = require('./middlewares/authorization.js');
var deepPopulate = require('../app/util/mongoose-helper.js');

module.exports = function(app, passport){

	app.post('/post/new', Post.createPost);
	app.post('/post/new/anonymous', Post.anonPost);
	app.post('/post/:id/comment', Post.comment);
	app.post('/post/:id/comment/anonymous', Post.anonComment); //TODO: remove this, just for test for now
	app.post('/post/:id/down', Post.downvote);
	app.post('/post/:id/up', Post.upvote);
	app.post('/comment/:id/up', Comment.upvote);
	app.post('/comment/:id/down', Comment.downvote);
	// app.post('/post/:id/down/anonymous', Post.anondownvote);
	// app.post('/post/:id/up/anonymous', Post.anonupvote);
	// app.post('/comment/:id/up/anonymous', Comment.anonupvote);
	// app.post('/comment/:id/down/anonymous', Comment.anondownvote);

	app.get('/connections', function(req, res){
		if(req.isAuthenticated()){
			User.findOne({_id: req.user._id})
			// .populate('connections connectionPending connectionRequests')
			.exec(function(error, user){
			//TODO: maybe make this better so not populating so much..?
 			deepPopulate(user, "connections connectionPending connectionRequests connectionRequests.users connections.users connectionPending.users connections.messages connections.messages.sender", 
 				{sort:{_id:-1}}, function(err, user){
 					Connection.addNumUnread(user, function(user){
						res.render('connections-updated', {user: user});
 					});
 				});
			});
		}else{
			res.redirect("/login");
		}
			
	});
	app.post('/user/:id/connect', Connection.requestConnection);
	app.post('/user/:id/connection/accept', Connection.acceptConnection);
	app.post('/user/:id/connection/reject', Connection.rejectConnection);
	app.post('/connection/:id/remove', Connection.removeConnection);
	app.post('/connection/:id/message/send', Connection.sendMessage);
	app.get('/connection/:id/messages', function(req, res){
		if(req.isAuthenticated()){
			Connection.findOne({_id: req.params.id})
			.exec(function(error, conn){
				deepPopulate(conn, 'messages user messages.sender',{sort:{created:1}},
				 function(err, conn){
					conn.messages.forEach(function(message){
						if(!message.sender._id.equals(req.user._id)){
					    	message.read = true;
					    	message.save();
					    }
					});
				 	conn.save();
					res.render('message', {connection: conn,
											user: req.user});
				});
			});
		}else{
			res.redirect("/login");
		}
	});

	/*
	 * Setup pass-reset. 
	 * TODO: This should probably be moved to the app.js. But there were problems,
	 * So temporarily it's here...
	 *
	 */
	var passreset = require('pass-reset');
	
	passreset.expireTimeout(12, 'hours');

	passreset.lookupUsers(function(login, callback) {
	    User.find({ email: login }, function(err, users) {
	        if (err) {return callback(err);}
	        if (! users.length) {return callback(null, false);}
	        var user = users[0];
	        callback(null, {
	            email: user.email,
	            users: [{
	                id: user.id,
	                name: user.first_name
	            }]
	        });
	    });
	});

	passreset.setPassword(User.updatePassword);
	passreset.sendEmail(User.sendForgotPassEmail);
	//Forgot your password
	app.post('/password/reset',
	        passreset.requestResetToken({
	        	    loginParam: 'email',
	                callbackURL: 'http://agile-ridge-8948.herokuapp.com/password/reset/{token}',

	                // If this function is given you can handle errors yourself. Otherwise,
	                // errors will be sent automatically in a JSON format
	                error: function(err, status, req, res) {
	                        res.send(status, err);
	                },

	                // If the "next" option is given, the action taken after successful
	                // request can be controled. A string will be treated as a redirect URL,
	                // and if a function is given it will be called after the request is
	                // processed. Otherwise, a simple JSON {status: 'OK'} will be sent.
	                next: function(req, res) {
	                        res.send(200, 'Success!');
	                }
	        })
	);

	app.get('/password/reset/:token', function(req, res) {
        res.render('reset-password.ejs', {token: req.params.token});
	});

	app.put('/password/reset',
	        passreset.resetPassword()
	);

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

	/**
	* Facebook sign in
	*/
	app.get("/auth/facebook", passport.authenticate("facebook", {scope: "email"}));
    app.get("/auth/facebook/callback", 
        passport.authenticate("facebook",{ 
        	successRedirect : "/",
			failureRedirect : "/login",
			failureFlash: true
		})
     );

    /**
    * Google signin
    */
    app.get('/auth/google', passport.authenticate('google',  { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }));
	app.get('/auth/google/callback', 
	  passport.authenticate('google', 
	  	{failureRedirect: '/login' }),
	      function(req,res){
	      	res.redirect('/');
	      }
	);

	// Get: signup
	app.get("/signup", function(req, res){ 
		console.log("THE REQ:" +req.Object);
		res.render("signup", { err : req.flash('error') } );
	});

	// Sign 
	app.post("/signup", Auth.userExist, function (req, res, next) {
		console.log("routes.js: start sign up");
		User.signup(req.body.firstName, req.body.lastName, req.body.email, req.body.password, function(err, user){
			console.log("routes.js: req.body.email = "+req.body.email+" req.body.password = "+req.body.password);
			if(err) throw err;
			req.login(user, function(err){
				if(err) return next(err);
				return res.redirect("/"); //profile
			});
		});
	});

	app.get('/posts/:location', function(req, res){
		Post.find({location: req.params.location})
		.populate('comments ups downs')
		.sort({date:-1})
		.exec(function(error, posts){
			if(error) console.log(error);
			console.log(posts);
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

				res.render("feed", { user : req.user, posts: posts, location: req.params.location}); 
			}else{
				res.render("feed", { user : null, posts: posts, location: req.params.location});
			}
		});
	});

	
	app.get('/map/:location', function(req, res){
		Post.find({location: req.params.location})
		.populate('comments ups downs')
		.sort({date:-1})
		.exec(function(error, posts){
			if(error) console.log(error);
			// console.log(posts);
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

				res.render("map", { user : req.user, posts: posts, location: req.params.location}); 
			}else{
				res.render("map", { user : null, posts: posts, location: req.params.location});
			}
		});
	});

	




	// Get: login request
	app.get('/', function(req, res){
		// Post.getAll(function(error, posts){
		//Going to start off with just mcgill for now
		Post.find({location: 'McGill'})
		.populate('comments ups downs')
		.sort({date : -1})
		.exec(function(error, posts){
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

				res.render("map", { user : req.user, posts: posts, location: "McGill"}); 
			}else{
				res.render("map", { user : null, posts: posts, location: "McGill"});
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

//*******************
// EJS Filters
//*******************
var ejs = require('ejs')
  , moment = require('moment');

ejs.filters.fromNow = function(date){
  return moment(date).fromNow();
}
