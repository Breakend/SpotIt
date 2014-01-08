var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var CommentSchema = new mongoose.Schema({
  user_id      : String,
  date      : Date,
  body      : String,
  img_url   : String,
  vid_url   : String,
  ups       : [{ type: Schema.Types.ObjectId, ref: 'User'}],
  downs     : [{ type: Schema.Types.ObjectId, ref: 'User'}]
});

// CommentSchema.statics.getAll = function(done) {
//   this.find({}, function (error, comments) {
//       done(error, comments);
//     });
// };

CommentSchema.statics.upvote = function(req, res){
 Comment.findOne({_id: req.params.id}, function(error, comment) {
    User.findOne({_id: req.user._id}, function(error, user){


      if (comment.ups.indexOf(user._id) < 0){
        comment.ups.push(user);
        //if in the downs, remove from downs and put in the ups
        var index = comment.downs.indexOf(user._id);
        if (index > -1) {
          comment.downs.splice(index, 1);
        }
        comment.save();
      } else{
        //Want to unvote...
        var index = comment.ups.indexOf(user._id);
        if (index > -1) {
          comment.ups.splice(index, 1);
        }
        comment.save();

      }

      //TODO: error handling
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end();
    })
 })
};

CommentSchema.statics.downvote = function(req, res){
 Comment.findOne({_id: req.params.id}, function(error, comment) {
    User.findOne({_id: req.user._id}, function(error, user){
      if (comment.downs.indexOf(user._id) < 0 && !error){
        comment.downs.push(user);
        var index = comment.ups.indexOf(user._id);
        if (index > -1) {
          comment.ups.splice(index, 1);
        }
        comment.save();
      }
      else{
        //Want to unvote...
        var index = comment.downs.indexOf(user._id);
        if (index > -1) {
          comment.downs.splice(index, 1);
        }
        comment.save();

      }

      //TODO: error handling
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end();
    });
 });
};

var User      = mongoose.model( 'User' );
var Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;