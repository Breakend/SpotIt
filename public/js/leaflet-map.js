// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map',{ zoomControl: false }).setView([
39.905687,-75.166955], 14);

// add MapQuest tile layer, must give proper OpenStreetMap attribution according to MapQuest terms
L.tileLayer('http://otile4.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
