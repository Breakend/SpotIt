var mongoose = require('mongoose'),
	hash = require('../util/hash'),
    Schema = mongoose.Schema;



UserSchema = mongoose.Schema({
	firstName:  String,
	lastName:   String,
	email:      String,
	salt:       String,
	hash:       String,
	facebook:{
		id:       String,
		email:    String,
		name:     String
	},
	twitter:{
		id:       String,
		email:    String,
		name:     String
	},
  	connections     : [{ type: Schema.Types.ObjectId, ref: 'User'}],
  	connectionPending  : [{ type: Schema.Types.ObjectId, ref: 'User'}], //i.e. you requested to connect with someone
  	connectionRequests	: [{ type: Schema.Types.ObjectId, ref: 'User'}] //i.e. someone requested to connect with you
});

UserSchema.statics.requestConnection = function(req, res){
	User.findOne({_id : req.user._id}, function(err, me){
		User.findOne({_id : req.params.id}, function(err, requested){
			if(!me.connectionPending) me.connectionPending = []
			if(!requested.connectionRequests) requested.connectionRequests = []

			if(me.connectionPending.indexOf(requested._id) < 0 
				&& me.connections.indexOf(requested._id) < 0){
				me.connectionPending.push(requested);
				requested.connectionRequests.push(me);
				me.save();
				requested.save();
			}
			//Otherwise have that connection so shouldn't add it again
			//TODO: error handling
	        res.writeHead(200, { 'Content-Type': 'application/json' });
	        res.end();
		});
	});
}

UserSchema.statics.acceptConnection = function(req, res){
	User.findOne({_id : req.user._id}, function(err, me){
		User.findOne({_id : req.params.id}, function(err, requested){
			if(!me.connectionRequests) me.connectionRequests = []
			if(!requested.connectionPending) requested.connectionPending = []
			if(!me.connections) me.connections = []
			if(!requested.connections) requested.connections = []

			var index = me.connectionRequests.indexOf(requested._id);
	        if (index > -1) {
	          me.connectionRequests.splice(index, 1);
	        }
			me.connections.push(requested);

			var index = requested.connectionPending.indexOf(me._id);
			if (index > -1) {
	          requested.connectionPending.splice(index, 1);
	        }
			requested.connections.push(me);

			me.save();
			requested.save();
			//TODO: error handling
      		res.writeHead(200, { 'Content-Type': 'application/json' });
      		res.end();
		});
	});
}

UserSchema.statics.rejectConnection = function(req, res){
	//TODO: should maybe have rejected list to block users from requesting again?
	console.log(req.params);
	User.findOne({_id : req.user._id}, function(err, me){
		User.findOne({_id : req.params.id}, function(err, requested){
			if(!me.connectionRequests) me.connectionRequests = []
			if(!requested.connectionPending) requested.connectionPending = []

			var index = me.connectionRequests.indexOf(requested._id);
	        if (index > -1) {
	          me.connectionRequests.splice(index, 1);
	        }

			var index = requested.connectionPending.indexOf(me._id);
			if (index > -1) {
	          requested.connectionPending.splice(index, 1);
	        }

			me.save();
			requested.save();
			//TODO: error handling
      		res.writeHead(200, { 'Content-Type': 'application/json' });
      		res.end();
		});
	});
}

UserSchema.statics.signup = function(email, password, done){
	console.log("user.js: Creating user => email = "+email+ ", password = "+ password);
	var User = this;
	hash(password, function(err, salt, hash){
		if(err) throw err;
		// if (err) return done(err);
		User.create({
			email : email,
			salt : salt,
			hash : hash
		}, function(err, user){
			if(err) throw err;
			//if(err) return done(err);		
			done(null, user);
		});
	});
}


UserSchema.statics.isValidUserPassword = function(email, password, done) {
	console.log("user.js: isValidUserPassword: email = "+email+ ", password = "+ password);
	this.findOne({email : email}, function(err, user){
		// if(err) throw err;
		if(err) return done(err);
		if(!user) return done(null, false, { message : 'Incorrect email.' });
		hash(password, user.salt, function(err, hash){
			if(err) return done(err);
			if(hash == user.hash) return done(null, user);
			done(null, false, {
				message : 'Incorrect password'
			});
		});
	});
};



UserSchema.statics.findOrCreateFaceBookUser = function(profile, done){
	var User = this;
	this.findOne({ 'facebook.id' : profile.id }, function(err, user){
		if(err) throw err;
		// if (err) return done(err);
		if(user){
			done(null, user);
		}else{
			User.create({
				email : profile.emails[0].value,
				facebook : {
					id:    profile.id,
					email: profile.emails[0].value,
					name:  profile.displayName
				}
			}, function(err, user){
				if(err) throw err;
				// if (err) return done(err);
				done(null, user);
			});
		}
	});	
}

var User = mongoose.model("User", UserSchema);
module.exports = User;