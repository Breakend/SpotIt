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
  	connections     : [{ type: Schema.Types.ObjectId, ref: 'Connection'}],
  	connectionPending  : [{ type: Schema.Types.ObjectId, ref: 'Connection'}], //i.e. you requested to connect with someone
  	connectionRequests	: [{ type: Schema.Types.ObjectId, ref: 'Connection'}] //i.e. someone requested to connect with you
});

UserSchema.statics.signup = function(firstname, lastname, email, password, done){
	console.log("user.js: Creating user => email = "+email+ ", password = "+ password);
	var User = this;
	hash(password, function(err, salt, hash){
		if(err) throw err;
		// if (err) return done(err);
		User.create({
			firstName : firstname,
			lastName : lastname,
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