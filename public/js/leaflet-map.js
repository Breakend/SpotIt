// create a map in the "map" div, set the view to a given place and zoom
var map;
$(document).ready(function(){


if (navigator.geolocation){
	navigator.geolocation.getCurrentPosition(
		function(pos){
			displayMap(pos);
		}, 
		function(err){
			displayError("This page won't really be as fun without your position. You can try to find yourself on the map and we'll use the center of that for posting, though.", "error");
			displayMap();
		}
	);
}
else{
	displayError("This page won't really be as fun without your position. You can try to find yourself on the map and we'll use the center of that for posting, though.", "error");
	displayMap();
}


});


function displayMap(currentLocation){
	if(typeof(currentLocation) === 'undefined'){
		 map = L.map('map', {zoomControl: false}).setView([51.505, -0.09], 13);
	} else{
		 map = L.map('map', {zoomControl: false}).setView([currentLocation.coords.latitude, currentLocation.coords.longitude], 13);
	} 
	// add an OpenStreetMap tile layer
	L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
	    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
	}).addTo(map);
}

function repositionMap(){
	map.setView(currentLocation.coords, 13);
}

