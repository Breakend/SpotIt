$(document).ready(function(){
   var myControl=  {
    create: function(tp_inst, obj, unit, val, min, max, step){
        $('<input class="ui-timepicker-input" value="'+val+'" style="width:50%">')
            .appendTo(obj)
            .spinner({
                min: min,
                max: max,
                step: step,
                change: function(e,ui){ // key events
                        // don't call if api was used and not key press
                        if(e.originalEvent !== undefined)
                            tp_inst._onTimeChange();
                        tp_inst._onSelectHandler();
                    },
                spin: function(e,ui){ // spin events
                        tp_inst.control.value(tp_inst, obj, unit, ui.value);
                        tp_inst._onTimeChange();
                        tp_inst._onSelectHandler();
                    }
            });
        return obj;
    },
    options: function(tp_inst, obj, unit, opts, val){
        if(typeof(opts) == 'string' && val !== undefined)
                return obj.find('.ui-timepicker-input').spinner(opts, val);
        return obj.find('.ui-timepicker-input').spinner(opts);
    },
    value: function(tp_inst, obj, unit, val){
        if(val !== undefined)
            return obj.find('.ui-timepicker-input').spinner('value', val);
        return obj.find('.ui-timepicker-input').spinner('value');
    }
    };

$('#editPartyDate').datetimepicker({
    controlType: myControl
    });
});

function codeAddress(address) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}
