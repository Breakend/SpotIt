
/**
* Helper Functions
*/

function displayError(message, type){
	if(typeof(type) === undefined) type = "error";
	$(".home-menu").first().append('<div class="pure-alert pure-alert-' + type + '\"> <button class="close" onclick="removeElement(this)">&times;</button>' + message + "</div>");
}

function removeElement(element){
	$(element).parents().first().remove();
}



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

$(document).on('click', '#display-post-form-button', function(event){
	var form = $(this).parents().first().children(".add-post-form");
	$(form).slideToggle();
})

});