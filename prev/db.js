var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var bcrypt = require('bcrypt');

var PostSchema = new Schema({
  user_id      : String,
  location  : String,
  coords    : [Number, Number],
  date      : Date,
  body      : String,
  img_url   : String,
  vid_url   : String,
  comments  : [CommentSchema]
});

var CommentSchema = new Schema({
  user      : [UserSchema],
  date      : Date,
  body      : String,
});

PostSchema.index({'coords': '2d'});

var UserSchema = new Schema({
    email: { type: String, required: true, index: { unique: true }, lowercase: true },
    hash: {type: String, required: true},
    salt: {type: String, required: true},
    dob: Date,
    gender: String,
    agreed: Boolean,
    name: {
        first: {type: String, required: true},
        last: {type: String, required: true}
    },
    connections: [{type: Number}] //user id's 
  });

UserSchema.virtual('password').get(function () {
  return this._password;
}).set(function (password) {
  this._password = password;
  var salt = this.salt = bcrypt.genSaltSync(10);
  this.hash = bcrypt.hashSync(password, salt);
});

UserSchema.method('checkPassword', function (password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

UserSchema.static('authenticate', function (email, password, callback) {
  this.findOne({ email: email }, function(err, user) {
    if (err)
      return callback(err);

    if (!user)
      return callback(null, false);

    user.checkPassword(password, function(err, passwordCorrect) {
      if (err)
        return callback(err);

      if (!passwordCorrect)
        return callback(null, false);

      return callback(null, user);
    });
  });
});
// Use the schema to register a model with MongoDb
module.exports = mongoose.model('Post', PostSchema);
module.exports = mongoose.model('Comment', CommentSchema);
module.exports = mongoose.model('User', UserSchema);
mongoose.connect( 'mongodb://localhost/partyup' );