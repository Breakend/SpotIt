var map;

var name = new Array("Leacock","Redpath", "McLennan");
var latlng = new Array( new google.maps.LatLng(45.504786, -73.578199),
						new google.maps.LatLng(45.503576, -73.576730),
						new google.maps.LatLng(45.503267, -73.575941) );
var markers = new Array();

function initialize() {
  var mapOptions = {
    zoom: 17,
    center: new google.maps.LatLng(45.505108, -73.577381)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  for (var i = 0; i < 3; i++) {
  	markers[i] = new google.maps.Marker({
	    position: latlng[i],
	    map: map,
	    title: name[i]
	});
	google.maps.event.addListener(markers[i], 'click', function() {
    	map.setZoom(18);
    	map.setCenter(markers[i].getPosition());

    	// For each marker click change the feed 

  	});
  }

}

google.maps.event.addDomListener(window, 'load', initialize);