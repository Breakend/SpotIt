// create a map in the "map" div, set the view to a given place and zoom
var map;
var geocoder;
var progress = document.getElementById('progress');
var progressBar = document.getElementById('progress-bar');
var permissionsAllowed = false;

function codeAddress(address, callback) {
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      callback(null, results[0]);
    } else {
  		callback('Geocode was not successful for the following reason: ' + status, null);
    }
  });
}

function addGeolocationToForms(loc){
	$(".lon").val(loc.lng);
	$(".lat").val(loc.lat);
}

function addGeolocationToFormsFromCenter(){
	addGeolocationToForms(map.getCenter());
}

function goToByScroll(id){
      // Scroll
    $('html,body').animate({
        scrollTop: $(id).offset().top-65},
        'slow');
}

function updateProgressBar(processed, total, elapsed, layersArray) {
	if (elapsed > 1000) {
		// if it takes more than a second to load, display the progress bar:
		progress.style.display = 'block';
		progressBar.style.width = Math.round(processed/total*100) + '%';
	}

	if (processed === total) {
		// all markers processed - hide the progress bar:
		progress.style.display = 'none';
	}
}

$(document).ready(function(){
geocoder = new google.maps.Geocoder();


if (navigator.geolocation){
	navigator.geolocation.getCurrentPosition(
		function(pos){
			displayMap(pos);
			addGeolocationToForms(pos);
			permissionsAllowed = true;
		}, 
		function(err){
			displayError("This page won't really be as fun without your position. You can try to find yourself on the map and we'll use the center of that for posting, though.", "error");
			displayMap();
			addGeolocationToFormsFromCenter();
		}
	);
}
else{
	displayError("This page won't really be as fun without your position. You can try to find yourself on the map and we'll use the center of that for posting, though.", "error");
	displayMap();
	addGeolocationToFormsFromCenter();
}


$(".add-post-form").submit(function(event){
	console.log("submitting");
	var form = $(this)
	var address = $(this).children("#location").first().val()
	if(address){
		event.preventDefault(); //prevent the submit
		codeAddress(address, function(err, coords){
			if(coords){
				form.children(".lat").val(coords.geometry.location.lat());
				form.children(".lon").val(coords.geometry.location.lng());
				form[0].submit();
			}else{
				alert(err);
			}
		})
	}
})

});

function selectPost(event){
	var id = "#" + event.target.options.title;
	goToByScroll(id);
	$(id).toggleClass("selected-shadow");
}

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
	
	var markerList = [];

	$(".post").each(function(i, post){
		if(typeof($(post).attr("longitude")) != 'undefined' && typeof($(post).attr("latitude"))!='undefined'){
			markerList.push(L.marker([$(post).attr("longitude"), $(post).attr("latitude")], {title : $(post).attr("id")}).on("click", selectPost));
		}
	})
	.promise()
    .done( function() {
		var markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: updateProgressBar });
		markers.addLayers(markerList);
		map.addLayer(markers);
    });;

	map.on("dragend", function(event){
		if(!permissionsAllowed)
			addGeolocationToFormsFromCenter();		
	})
}

function repositionMap(){
	map.setView(currentLocation.coords, 13);
}

