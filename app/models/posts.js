var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
  user_id      : String,
  location  : String,
  sublocation : String, //Experimental for now
  coords    : [Number, Number],
  date      : Date,
  body      : String,
  img_url   : String,
  vid_url   : String,
  ups       : [{ type: Schema.Types.ObjectId, ref: 'User'}],
  downs     : [{ type: Schema.Types.ObjectId, ref: 'User'}],
  comments  : [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.index({'coords': '2d'});

PostSchema.statics.comment = function(req, res){
  console.log("in comment");
  var comment  = new Comment({
    user_id : req.user._id,
    date : new Date(),
    body : req.body.body
  });
  if(req.body.postlon && req.body.postlat){
    comment.coords = [req.body.lat, req.body.lon]; 
  }
  comment.save();
  console.log(req.params.id);
 Post.findOne({_id: req.params.id}, function(error, post) {
    post.comments.push(comment);
    post.save();
    res.redirect('/');
  });
};

PostSchema.statics.upvote = function(req, res){
 Post.findOne({_id: req.params.id}, function(error, post) {
    User.findOne({_id: req.user._id}, function(error, user){


      if (post.ups.indexOf(user._id) < 0){
        post.ups.push(user);
        //if in the downs, remove from downs and put in the ups
        var index = post.downs.indexOf(user._id);
        if (index > -1) {
          post.downs.splice(index, 1);
        }
        post.save();
      } else{
        //Want to unvote...
        var index = post.ups.indexOf(user._id);
        if (index > -1) {
          post.ups.splice(index, 1);
        }
        post.save();

      }

      //TODO: error handling
      res.redirect('/');
      // res.writeHead(200, { 'Content-Type': 'application/json' });
      // res.end();
    })
 })
};

PostSchema.statics.downvote = function(req, res){
 Post.findOne({_id: req.params.id}, function(error, post) {
    User.findOne({_id: req.user._id}, function(error, user){
      if (post.downs.indexOf(user._id) < 0 && !error){
        post.downs.push(user);
        var index = post.ups.indexOf(user._id);
        if (index > -1) {
          post.ups.splice(index, 1);
        }
        post.save();
      }
      else{
        //Want to unvote...
        var index = post.downs.indexOf(user._id);
        if (index > -1) {
          post.downs.splice(index, 1);
        }
        post.save();

      }

      res.redirect('/');
      //TODO: error handling
      // res.writeHead(200, { 'Content-Type': 'application/json' });
      // res.end();
    });
 });
};

PostSchema.statics.getAll = function(done) {
  this.find().sort({date: -1}).populate('comments ups downs').exec(function (error, posts) {
      done(error, posts);
      console.log(posts);
    });
};

PostSchema.statics.createPost = function(req, res){
  //TODO: error handling and ajax call instead of redirect
  
  if(req.body.lat && req.body.lon){
    //This is if it gets the location automatically, otherwise gets it from the address bar
    Post.create({
      user_id: req.user._id,
      location: req.body.location,
      sublocation: req.body.sublocation,
      body: req.body.body,
      coords: [req.body.lat, req.body.lon],
      date : new Date()
    },
      function(err, post){
      //Should show error page
      if (err) console.log("Error when saving party: ", err);
      console.log(post);
      res.redirect('/');
    });
  }
  else{
     Post.create({
      user_id: req.user._id,
      location: req.body.location,
      sublocation: req.body.sublocation,
      body: req.body.body,
      date : new Date()
    },
      function(err, post){
      //Should show error page
      if (err) console.log("Error when saving party: ", err);
      console.log(post);
      res.redirect('/');
    });
  }
}

PostSchema.statics.remove = function(req, res){
  Post.findOne({_id: req.params.id}, function(err, post){
    if(!req.user || err || req.user._id != post.user_id)
      res.redirect('/'); //TODO: more obvious error handling and ajax response

    post.remove();
    res.redirect('/');
  })
}

var User      = mongoose.model( 'User' );
var Post      = mongoose.model('Post', PostSchema);
var Comment   = mongoose.model( 'Comment' );

module.exports = Post;
// module.exports = mongoose.model('Comment', CommentSchema);