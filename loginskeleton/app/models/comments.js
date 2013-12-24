var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  user_id      : String,
  date      : Date,
  body      : String,
  img_url   : String,
  vid_url   : String
});

// CommentSchema.statics.getAll = function(done) {
//   this.find({}, function (error, posts) {
//       done(error, posts);
//     });
// };

module.exports = mongoose.model('Comment', CommentSchema);