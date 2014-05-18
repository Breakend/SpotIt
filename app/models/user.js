var mongoose = require('mongoose'),
	hash = require('../util/hash'),
    Schema = mongoose.Schema,
    nodemailer = require("nodemailer"),
    handlebars = require('handlebars');



UserSchema = mongoose.Schema({
	firstName:  String,
	lastName:   String,
	email:      String,
	profile_picture: String, //this is the url of the profile picture
	salt:       String,
	hash:       String,
	google:{
		id:       String,
		email:    String,
		name:     String,
		profile_picture: String
	},
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
  	connectionRequests	: [{ type: Schema.Types.ObjectId, ref: 'Connection'}], //i.e. someone requested to connect with you
  	tasks : [{type: Schema.Types.ObjectId, ref: 'Task'}] //This is temporarily here, but maybe will remove on launch in favor of two different sites
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


UserSchema.statics.sendForgotPassEmail = function(email, resets, callback){
	User.findOne({email: email}, function(err, user){
		if(err){
			callback(err, null);
			return;
		}
					// create reusable transport method (opens pool of SMTP connections)
		var smtpTransport = nodemailer.createTransport("SMTP",{
		    service: "Gmail",
		    auth: {
		        user: "contact.spotit@gmail.com",
		        pass: "spottitemail"
		    }
		});

		 var template = handlebars.compile([
                '<p>You requested a password reset for the following account(s).</p>',
                '<ul>',
                '{{#each resets}}',
                        '<li>{{name}}: <a href="{{url}}">{{url}}</a></li>',
                '{{/each}}',
                '</ul>'
        ].join('\n'));

		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: "The SpotIt Team", // sender address
		    to: user.email, // list of receivers
		    subject: "SpotIt: Forgot your password?", // Subject line
            body: template({ resets: resets })
		}

		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions, function(error, response){
		    if(error){
		        console.log(error);
		        callback(error, null);
		        smtpTransport.close(); // shut down the connection pool, no more messages

		    }else{
		        console.log("Message sent: " + response.message);
		        callback(null, true);
		        smtpTransport.close(); 
		    }
		});
	})

}

UserSchema.statics.updatePassword = function(id, newPass, callback)
{
        User.findOne({_id: id}, function(e, o){
                if (e){
                        callback(e, null);
                }        else{
                        hash(newPass, function(err, salt, hash){
                        o.hash = hash;
                        o.salt = salt
                        o.save(callback);
                        });
                }
        });
}

UserSchema.statics.findOrCreateGoogleUser = function(profile, done){
	console.log("profile id:" ,profile.id);
	this.findOne({ 'google.id' : profile.id }, function(err, user){
		console.log('google profile: ', profile);
		if(err) throw err;
		// if (err) return done(err);
		if(user){
			done(null, user);
		}else{
			User.findOne({'email':profile.emails[0].value}, function(err, user){
				if(user){
					user.google = {
						id : profile.id,
						email : profile.emails[0].value,
						name : profile.displayName,
						profile_picture: 'https://plus.google.com/s2/photos/profile/'+ profile.id+'?sz=100' //bit of a hack but nothing else works
					}

					if(!user.profile_picture){
						user.profile_picture = user.google.profile_picture;
					}

					user.save();
				}
				else{
					User.create({
						firstName:  profile.name.givenName,
						lastName:   profile.name.familyName,
						email : profile.emails[0].value,
						profile_picture: 'https://plus.google.com/s2/photos/profile/'+ profile.id+'?sz=100', //bit of a hack but nothing else works
						google : {
							id:    profile.id,
							email: profile.emails[0].value,
							name:  profile.displayName,
							profile_picture: 'https://plus.google.com/s2/photos/profile/'+ profile.id+'?sz=100' //bit of a hack but nothing else works
						}
					}, function(err, user){
						if(err) throw err;
						// if (err) return done(err);
						done(null, user);
					});
				}
			})
		}
	});	
}



UserSchema.statics.findOrCreateFaceBookUser = function(profile, done){
	this.findOne({ 'facebook.id' : profile.id }, function(err, user){
		console.log('facebook profile: ', profile);
		if(err) throw err;
		// if (err) return done(err);
		if(user){
			done(null, user);
		}else{
			User.findOne({'email':profile.emails[0].value}, function(err, user){
				if(user){
					user.facebook = {
						id : profile.id,
						email : profile.emails[0].value,
						name : profile.displayName,
						profile_picture: 'https://graph.facebook.com/'+profile.username+'/picture', //bit of a hack but nothing else works
					}

					if(!user.profile_picture){
						user.profile_picture = user.facebook.profile_picture;
					}

					user.save();
					done(null, user);
				}
				else{
					User.create({
						firstName:  profile.name.givenName,
						lastName:   profile.name.familyName,
						email : profile.emails[0].value,
						profile_picture: 'https://graph.facebook.com/'+profile.username+'/picture', //bit of a hack but nothing else works
						facebook : {
							id:    profile.id,
							email: profile.emails[0].value,
							name:  profile.displayName,
							profile_picture: 'https://graph.facebook.com/'+profile.username+'/picture', //bit of a hack but nothing else works
						}
					}, function(err, user){
						if(err) throw err;
						// if (err) return done(err);
						done(null, user);
					});
				}
			});
		}
	});	
}

var User = mongoose.model("User", UserSchema);
module.exports = User;