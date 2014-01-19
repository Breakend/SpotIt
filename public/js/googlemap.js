
/* name, lat, lng, scale, zIndex */
var location_objects = [
  //['Leacock', 45.504786, -73.578199, 20, 1],
  //['Redpath', 45.503576, -73.576730, 20, 2],
  ['McLennan', 45.503267, -73.575941, 30, 3]
];



var minZoomLevel = 16;
var maxZoomLevel = 18;
var geocode_locations = [ 'Redpath Library', 'Redpath Museum', 
'Leacock Building', 'McGill Bookstore', 'McConnell Engineering', 'MacDonald Enginnering', 
'Ferrier Building', 'Trottier Building', 'Rutherford Physics', 'Maas Chemistry',
'McGill University' ];

var map;
var infowindow = new google.maps.InfoWindow();
var marker;
var i;


var iconcolor = '#800000';
var mapcolor = '#00cc00';

var icon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: iconcolor, //
    fillOpacity: 0.8,
    scale: 20,
    strokeColor: iconcolor,
    strokeWeight: 2
};

var mcgill = new google.maps.LatLng(45.504786, -73.578199);


// $(document).ready(function() {
//     initialize();
// });

function initialize(){
    map = createMap();
    setMarkers(map,geocode_locations);

    // Limit the zoom level
    google.maps.event.addListener(map, 'zoom_changed', function() {
        if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
        else if (map.getZoom() > maxZoomLevel) map.setZoom(maxZoomLevel);
    });
    //map.panTo(center);
}

function setMarkers(map, address) {
    for ( var i = 0; i < address.length; i++) {
        setGeocodeMarker(map, address[i])
    }
    for ( var i = 0; i < location_objects.length; i++) {
        setCustomMarker(map, location_objects[i]);
    }
}

function setGeocodeMarker(map, address) {
    geocoder = new google.maps.Geocoder();
    geocoder
            .geocode(
                    {
                        'address' : address
                    },
                    function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            map.setCenter(results[0].geometry.location);
                            var marker = new google.maps.Marker(
                                    {
                                        position : results[0].geometry.location,
                                        icon : icon,
                                        map : map
                                    });
                            google.maps.event.addListener(marker,
                                    "click", function() {
                                        alert(address);

                                        // Ajax here


                                    });
                            google.maps.event.addListener(marker,
                                    "mouseover", function() {
                                        infowindow.setContent(address);
                                        infowindow.open(map, marker);
                                    });
                            google.maps.event.addListener(marker,
                                    "mouseout", function() {
                                        infowindow.close(map, marker);
                                    });
                        } else {
                            alert("Geocode was not successful for the following reason: "
                                    + status);
                        }

                    });
}

function setCustomMarker(map, location) { 
    // Create Marker
    var latlng = new google.maps.LatLng(location[1], location[2]);
    var marker = new google.maps.Marker({
        position : latlng,
        icon :  {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: iconcolor, // #A22E42
                    fillOpacity: 0.8,
                    scale: location[3],
                    strokeColor: iconcolor,
                    strokeWeight: 2
                },
        map : map,
        title: location[0],
        zIndex: location[4] // Vertical order
    });

    // Event Listeners
    google.maps.event.addListener(marker,"click", function() {
            alert(location[0]);

            // Ajax here


    });
    google.maps.event.addListener(marker,"mouseover", function() {
            infowindow.setContent(location[0]);
            infowindow.open(map, marker);
    });
    google.maps.event.addListener(marker,"mouseout", function() {
            infowindow.close(map, marker);
    });


}




function createMap() {
    var MY_MAPTYPE_ID = 'custom_style';
    var featureOpts = [
        {
          stylers: [
            { hue: mapcolor }, // #7dddc4 // #38B2CE
            { visibility: 'simplified' },
            { gamma: 0.5 },
            { weight: 0.5 }
          ]
        },
        {
          elementType: 'labels',
          stylers: [
            { visibility: 'off' }
          ]
        },
        {
          featureType: 'water',
          stylers: [
            { color: mapcolor }
          ]
        }
    ];
    
    var mapOptions = {
        zoom: 17,
        center: mcgill,
        panControl: false,
        zoomControl: false,
        scaleControl: false,
        disableDefaultUI: true,
        scrollwheel: false,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
        draggable: false,

        mapTypeControlOptions: {
          mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
        },
        mapTypeId: MY_MAPTYPE_ID
    };

    var the_map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    var styledMapOptions = {
        name: 'Custom Style'
    };

    var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

    the_map.mapTypes.set(MY_MAPTYPE_ID, customMapType);

    return the_map; 
}

google.maps.event.addDomListener(window, 'load', initialize);
