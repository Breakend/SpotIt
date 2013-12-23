var mongoose  = require( 'mongoose' );
var Post     = mongoose.model( 'Post' );
var User     = mongoose.model( 'User' );
var Comment     = mongoose.model( 'Comment' );

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

// exports.near = function(req, res) {
//   Party.find({coords : { $near : [req.params.lon, req.params.lat], $maxDistance : req.params.dist/68.91}},
//     function (error, party) {
//       //TODO: When issue fixed in Mongodb should be one search function
//       var current = new Date();
//       for( var x in party) {
//         if( party[x].date < current) delete party[x];
//       }
//       res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
//       console.log(party);
//       res.send(JSON.stringify(party));
//     });
// };

exports.rendernear = function(req, res) {
  //TODO: not hardcoded?
  Post.find({},
    function (error, post) {
      //TODO: When issue fixed in Mongodb should be one search function
      console.log(error);
      console.log("Posts: ", post);
      // var current = new Date();
      // for( var x in party) {
      //   if( party[x].date < current) delete party[x];
      // }
      res.render( 'protohome', {
          posts : post
      });
    });
};

exports.create = function ( req, res ){
  var post = new Post({
    user_id: req.body.user,
    location: req.body.location,
    body: req.body.postbody
  });

  //TODO: Figure our video and pix posting

  post.date = new Date();
  //TODO: If you're creating a post, don't really need to worry about comments, do you?
  post.comments = [];
  // for(var j =0;j< party.comments.length; j++) {
  //   party.comments[j].created_at = new Date();
  // }

  if(req.body.postlat && req.body.postlon){
    post.coords = [req.body.postlon, req.body.postlat];
    post.save(function(err){
      //Should we really throw it up???
      if (err) throw err;
      res.redirect('/');
    });
  }
  else{
    geocode(post.location, function(results){
      post.coords = results;
      post.save(function (err) {
        if (err) throw err;
        // console.log(post);
        // TODO: Should we really redirect here?
        res.redirect( '/' );
      });
    });
  }
};

// exports.addComment = function(req, res){
//   console.log("in add comment");
//   console.log("body", req.body.body);
//   console.log("party id", req.body.id);
//   User.findOne({_id: req.session.user}, function(error, userFound) {
//     if( error ) console.log(error);
//     else{
//       console.log("found user", userFound);
//       var comment = new Comment({
//         user      : userFound,
//         date      : new Date(),
//         body      : req.body.body
//       });
//       console.log("created comment", comment);
//       Party.findOne({_id: req.body.id}, function(error, party){
//         console.log("found it!", party);
//       });
//       Party.update({_id: req.body.id},
//         {"$push": {comments: comment}},
//         function(error, party){
//           console.log(party);
//           if( error ) console.log(error);
//         });
//     }
//   });
// };

// exports.followParty= function(req, res){
// User.findOne({_id: req.session.user}, function(error, userFound) {
//     if( error ) console.log(error);
//     else{
//       Party.update({_id: req.body.id},
//       {"$push" : {attending: userFound}}, function(error, party){
//         console.log(party);
//         if(error) console.log(error);
//       });
//     }
//   });
// };

exports.findById = function(req, res) {
  Post.findOne({_id: req.params.id}, function(error, post) {
    res.render( 'post', {
      post: post
    });
  });
};