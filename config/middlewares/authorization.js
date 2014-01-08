var User = require('../../app/models/user');

exports.isAuthenticated = function (req, res, next){
    console.log("authorization.js: isAuthenticated?");
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect("/"); // If not authenticated, redirect to root directory
    }
}

exports.userExist = function(req, res, next) {
    User.count({
        email: req.body.email
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            // Pass a flash message informing the page that the email already exists
            req.flash('error', 'Email already taken.'); 
            res.redirect("/signup");
        }
    });
}
