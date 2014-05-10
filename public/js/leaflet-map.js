// create a map in the "map" div, set the view to a given place and zoom
var map;
$(document).ready(function(){
	if(typeof(currentLocation) === 'undefined'){
		 map = L.map('map', {zoomControl: false}).setView([51.505, -0.09], 13);
	} else{
		 map = L.map('map', {zoomControl: false}).setView(currentLocation.coords, 13);
	} 
	// add an OpenStreetMap tile layer
	L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {
	    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
	}).addTo(map);

})

function repositionMap(){
	map.setView(currentLocation.coords, 13);
}

