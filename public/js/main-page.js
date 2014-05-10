var currentLocation;

/**
* Helper Functions
*/

function displayError(message, type){
	if(typeof(type) === undefined) type = "error";
	$(".home-menu").first().append('<div class="pure-alert pure-alert-"' + type + '">' + message + "</div>");
}

$(document).ready(function(){

// if (navigator.geolocation){
// 	navigator.geolocation.getCurrentPosition(
// 		function(pos){
// 			currentLocation = pos;
// 			currentLocation.lat = currentLocation.latitude;
// 			currentLocation.lon = currentLocation.longitude;
// 			repositionMap();
// 		}, 
// 		function(err){
// 			displayError("This page won't really be as fun without your position. You can try to find yourself on the map and we'll use the center of that for posting, though.")
// 			currentLocation = new Position()
// 			currentLocation.coords.lon = 51.505;
// 			currentLocation.coords.lat = -0.09;	
// 		}
// 	);
// }
// else{
// 	displayError("This page won't really be as fun without your position. You can try to find yourself on the map and we'll use the center of that for posting, though.")
// 	currentLocation = new Position()
// 	currentLocation.coords.lon = 51.505;
// 	currentLocation.coords.lat = -0.09;
// }

/*
* Event Bindings
*/

var container = document.querySelector('#r-container');
  var msnry = new Masonry( container, {
    isAnimated: true
  });

$(document).on("click", ".expand-comments", function(e){
	var comments = $(this).parents(".gen-post-wrapper").first().children(".comment");
	if(comments.first().hasClass("hidden")){
		comments.removeClass("hidden");
		$('textarea.comment-input').autosize({callback: function(){msnry.layout();}});
		msnry.layout();
		comments.addClass('animated bounceInDown').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      		$(this).removeClass("animated bounceInDown");
    	});	
	}
	else{
		comments.addClass('animated bounceOutUp').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      		$(this).removeClass("animated bounceOutUp");
      		$(this).addClass("hidden");
      		msnry.layout();
    	});
   	}
});

});