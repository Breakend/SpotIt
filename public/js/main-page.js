$(document).ready(function(){

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
		for(var i = 0; i< comments.length;i++){
			comments.removeClass("hidden");
			msnry.layout();
			comments.addClass('animated bounceInDown').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
	      		$(this).removeClass("animated bounceInDown");
	    	});
		}
			
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