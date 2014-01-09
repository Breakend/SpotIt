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

      //TODO: error handling
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end();
    });
 });
};

PostSchema.statics.getAll = function(done) {
  this.find().sort({date: -1}).populate('comments ups downs').exec(function (error, posts) {
      done(error, posts);
      console.log(posts);
    });
};

PostSchema.statics.createPost = function ( req, res ){
  console.log("User", req.body.user);
  console.log("request: ", req);
  console.log("In post create");
  //TODO: Figure our video and pix posting
  if(req.body.postlat && req.body.postlon){
    //This is if it gets the location automatically, otherwise gets it from the address bar
    Post.create({
      user_id: req.user._id,
      location: req.body.location,
      sublocation: req.body.sublocation,
      body: req.body.body,
      coords: [req.body.postlon, req.body.postlat],
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
    //Don't know if we really need the geostuff, but leaving it in for now
    geocode(req.body.location, function(results){
      console.log("In geocode callback");
      Post.create({
        user_id: req.user._id,
        location: req.body.location,
        sublocation: req.body.sublocation,
        body: req.body.body,
        coords: results,
        date : new Date()
      },
        function(err, post){
        //Should show error page
        if (err) console.log("Error when saving party: ", err);
        console.log("post created");
        console.log(post);
        res.redirect('/');
      });
    });
  }
};

var geocoder = require('geocoder');
function geocode(address, callback) {
  if(typeof address != 'undefined' && address !== null) {
    geocoder.geocode( address, function( err , data) {
      console.log(err);
      console.log(data);
      if(err){ callback([-45, 70]); return;}
      var coords = [data.results[0].geometry.location.lng, data.results[0].geometry.location.lat];
      callback(coords);
    });
  }
}

var User      = mongoose.model( 'User' );
var Post      = mongoose.model('Post', PostSchema);
var Comment   = mongoose.model( 'Comment' );

module.exports = Post;
// module.exports = mongoose.model('Comment', CommentSchema);