var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
  user_id      : String,
  location  : String,
  coords    : [Number, Number],
  date      : Date,
  body      : String,
  img_url   : String,
  vid_url   : String,
  comments  : [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

PostSchema.index({'coords': '2d'});

PostSchema.statics.comment = function(req, res){
  console.log("in comment");
  var comment  = new Comment({
    user_id : req.body.user,
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

PostSchema.statics.getAll = function(done) {
  this.find().sort('date').populate('comments').exec(function (error, posts) {
      done(error, posts);
      console.log(posts);
    });
};

PostSchema.statics.createPost = function ( req, res ){
  console.log("In post create");
  //TODO: Figure our video and pix posting
  if(req.body.postlat && req.body.postlon){
    //This is if it gets the location automatically, otherwise gets it from the address bar
    Post.create({
      user_id: req.body.user,
      location: req.body.location,
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
    geocode(req.body.location, function(results){
      console.log("In geocode callback");
      Post.create({
        user_id: req.body.user,
        location: req.body.location,
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

var geocoder = require('Geocoder');
function geocode(address, callback) {
  if(typeof address != 'undefined' && address !== null) {
    geocoder.geocode( address, function( err , data) {
      console.log(data.results[0].geometry);
      var coords = [data.results[0].geometry.location.lng, data.results[0].geometry.location.lat];
      callback(coords);
    });
  }
}

var Post = mongoose.model('Post', PostSchema);
var Comment     = mongoose.model( 'Comment' );

module.exports = Post;
// module.exports = mongoose.model('Comment', CommentSchema);