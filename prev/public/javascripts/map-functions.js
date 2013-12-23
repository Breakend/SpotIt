var allMarkers = [];
var loggedIn = false;
function success(position) {
  var s = document.querySelector('#status');
  if (s){
    if (s.className == 'success') {
      return;
    }
    s.innerHTML = "";
    s.className = 'success';
  } else {
    var status = document.createElement('div');
    status.className = 'success';
    document.body.appendChild(status);
  }

  var mapcanvas = document.getElementById('mapcanvas');
  if(loggedIn !== true){
    mapcanvas.style.height = '400px';
    mapcanvas.style.width = '560px';
  } else{
    mapcanvas.style.height = '450px';
    mapcanvas.style.width = '860px';
  }
  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var myOptions = {
    zoom: 15,
    center: latlng,
    mapTypeControl: false,
    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);

  google.maps.event.addListener(map, 'bounds_changed', function() {
    populateMap(map);
  });

}

function error(msg) {
  var s = document.querySelector('#status');
  if(s){
    s.innerHTML = "";
    s.class = 'fail';
  } else {
    var status = document.createElement('div');
    status.class = 'fail';
    document.body.appendChild(status);
  }
  var mapcanvas = document.createElement('div');
  mapcanvas.id = 'mapcanvas';
  if(loggedIn !== true){
    mapcanvas.style.height = '400px';
    mapcanvas.style.width = '560px';
  } else{
    mapcanvas.style.height = '450px';
    mapcanvas.style.width = '860px';
  }

  document.querySelector('article').appendChild(mapcanvas);
  var latlng = new google.maps.LatLng(45.5081, -73.5550);
  var myOptions = {
    zoom: 15,
    center: latlng,
    mapTypeControl: false,
    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
}

function populateMap(map){
  bounds = map.getBounds();
  center = bounds.getCenter();
  ne = bounds.getNorthEast();

  // r = radius of the earth in statute miles
  var r = 3963.0;

  // Convert lat or lng from decimal degrees into radians (divide by 57.2958)
  var lat1 = center.lat() / 57.2958;
  var lon1 = center.lng() / 57.2958;
  var lat2 = ne.lat() / 57.2958;
  var lon2 = ne.lng() / 57.2958;

  // distance = circle radius from center to Northeast corner of bounds
  var dis = r * Math.acos(Math.sin(lat1) * Math.sin(lat2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1));

  getNearestParties(center.lng(), center.lat(), dis, function (data){
    console.log('recieved data');
    console.log(data);
     // var parties = jQuery.parseJSON(data);
     $.each( data, function( key, value ) {
       console.log(value.coords);
       if($.inArray(value._id, allMarkers) == -1){
        var latlng = new google.maps.LatLng(value.coords[1], value.coords[0]);
        var marker = new google.maps.Marker({
          id: value._id,
          position: latlng,
          map: map,
          title: value.title,
          description: value.description,
          address: value.address,
          date: value.date
        });
        allMarkers.push(value._id);

        var infowindow = new google.maps.InfoWindow({
          content: marker.get('title')
        });
        google.maps.event.addListener(marker, 'click', function() {
          $('body').append('<div id="modal" class="modal show fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
            <div class="modal-header">\
            <button type="button" class="close" id="close1" data-dismiss="modal" aria-hidden="true">×</button>\
            <h3 id="myModalLabel">PartyUp</h3>\
            </div>\
            <div class="modal-body">\
            </div>\
            <div class="modal-footer">\
            <button class="btn" data-dismiss="modal" id="close2" aria-hidden="true">Close</button>\
            </div>\
            </div>');
          if(loggedIn !== false){
            $('.modal-footer').append('<button id="more-info" class="btn btn-primary">More Info</button>');
          }else{
            $('.modal-footer').append('<button id="lifinfo" class="btn btn-primary">Log In for More Info</button>');
          }
          $.get('party/findById/'+ marker.id + '/', function(result) {
            $('.modal-body').html(result);
            $('#modal').modal('show');
            $('#close1').bind('click', function() {
              $('#modal').on('hidden', function () {
                rmModal();
              });
            });
            $('#close2').bind('click', function() {
              $('#modal').on('hidden', function () {
                rmModal();
              });
            });
            $('#lifinfo').bind('click', function(){
              $('#modal').modal('hide');
              $('#modal').on('hidden', function () {
                rmModal();
                liModal();
              });
            });
          });
        });
}
});
});

}

function getNearestParties(lon, lat, dist, callback) {
  $.ajax('/party/near/'+lon+'/'+lat+'/'+dist+'/', {
    type: 'GET',
    dataType: 'json',
    success: function(data) { if ( callback ) callback(data); },
    error  : function()     { if ( callback ) callback(null); }
  });
}

function initMap(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    error('not supported');
  }
}

function initMapLi(){
  loggedIn = true;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    error('not supported');
  }
}

jQuery(document).ready(function($) {

  $('#signup_btn').click(function() {
    rgModal();
  });

  $('#login_btn').click(function() {
    liModal();
  });

  $('#cp').click(function(){
    console.log("CP WAS CLICKED");
    cpModal();
  });

  $('#postbtn').click(function(){
    console.log("woot posting");
    rmModal();
  });

  var socket = new io.Socket(null, {port: 3000});
  socket.connect();

});

function rgModal(){
  $('body').append('<div id="modal" class="modal show fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
    <div class="modal-header">\
    <button type="button" class="close" id="close1" data-dismiss="modal" aria-hidden="true">×</button>\
    <h3 id="myModalLabel">Get started with PartyUp</h3>\
    </div>\
    <div class="modal-body">\
    </div>\
    <div class="modal-footer">\
    <button class="btn" data-dismiss="modal" id="close2" aria-hidden="true">Close</button>\
    <button type="submit" class="btn btn-primary" form="signupForm">Join</button>\
    </div>\
    </div>');
  $.get('/register', function(result) {
    $('.modal-body').html(result);
    $('#modal').modal('show');
    $('#close1').bind('click', function() {
      $('#modal').on('hidden', function () {
        rmModal();
      });
    });
    $('#close2').bind('click', function() {
      $('#modal').on('hidden', function () {
        rmModal();
      });
    });
  });
}

function cpModal(){
  $('body').append('<div id="modal" class="modal show fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
    <div class="modal-header">\
    <button type="button" class="close" id="close1" data-dismiss="modal" aria-hidden="true">×</button>\
    <h3 id="myModalLabel">Create A Party</h3>\
    </div>\
    <div class="modal-body">\
    </div>\
    <div class="modal-footer">\
    <button class="btn" data-dismiss="modal" id="close2" aria-hidden="true">Close</button>\
    <button type="submit" form="createform" class="btn btn-primary">Create!</button>\
    </div>\
    </div>');
  $.get('/party/create', function(result) {
   $('.modal-body').html(result);
   $('#modal').modal('show');
   $('#close1').bind('click', function() {
    $('#modal').on('hidden', function () {
      rmModal();
    });
  });
   $('#close2').bind('click', function() {
    $('#modal').on('hidden', function () {
      rmModal();
    });
  });
 });
}


function liModal(){
  $('body').append('<div id="modal" class="modal show fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">\
    <div class="modal-header">\
    <button type="button" class="close" id="close1" data-dismiss="modal" aria-hidden="true">×</button>\
    <h3 id="myModalLabel">Log into PartyUp</h3>\
    </div>\
    <div class="modal-body">\
    </div>\
    <div class="modal-footer">\
    <button class="btn" data-dismiss="modal" id="close2" aria-hidden="true">Close</button>\
    <button type="submit" form="loginForm" class="btn btn-primary">Sign In</button>\
    </div>\
    </div>');
  $.get('/login', function(result) {
   $('.modal-body').html(result);
   $('#modal').modal('show');
   $('#close1').bind('click', function() {
    $('#modal').on('hidden', function () {
      rmModal();
    });
  });
   $('#close2').bind('click', function() {
    $('#modal').on('hidden', function () {
      rmModal();
    });
  });
 });
}

function rmModal() {
  var elem = document.getElementById('modal');
  elem.parentNode.removeChild(elem);
  return false;
}