function shizuDataCtrl(element) {
    this.element = element;
    this.park = [];
    this.staus = {  parkMapOK : 0,
                    parkMapProcessIdx : 0
    };

    this.getParkLocate();
}

shizuDataCtrl.prototype.getParkLocate = function() {
    var shizuDataCtrlObj = this;
    this.staus.parkMapOK = 0;
    this.staus.parkMapProcessIdx = 0;

    $.ajax({
        type: "GET",
        url: "ajax.php?url=http://dataset.city.shizuoka.jp/api/action/datastore_search?resource_id=83bba366-f187-4324-9d36-7d1320f1a0c2",
        dataType: "json",
        success: function(res) {
            shizuDataCtrlObj.park =[];
            for ( var i=0; i < res.result.records.length; i++ ) {
                shizuDataCtrlObj.park[i] = { name:res.result.records[i].公園名, address:"静岡県静岡市"+res.result.records[i].区名+res.result.records[i].所在地 };
            }
            shizuDataCtrlObj.getParkLatLng();
        }
	});
}

shizuDataCtrl.prototype.getParkLatLng = function() {

    var shizuDataCtrlObj = this;
    var geocoder = new google.maps.Geocoder();

    var getLatLng = function () {
        var idx = shizuDataCtrlObj.staus.parkMapProcessIdx;
        geocoder.geocode( { address : shizuDataCtrlObj.park[ idx ].address }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                shizuDataCtrlObj.park[ idx ].latlng = results[0].geometry.location;
                shizuDataCtrlObj.park[ idx ].lat    = results[0].geometry.location.lat();
                shizuDataCtrlObj.park[ idx ].lng    = results[0].geometry.location.lng();
            } else if ( status != "OK" ) {
                /* どうしましょう */
                logWrite( "google.maps.GeocoderStatus : " + status );
            }
            if ( idx >= shizuDataCtrlObj.park.length - 1 ) {
                shizuDataCtrlObj.staus.parkMapOK = 1;
            } else {
                shizuDataCtrlObj.staus.parkMapProcessIdx++;
                // interval を開けないと geocode 処理で Overlimit Query Error が発生する

                setTimeout( getLatLng, 1000);
            }
        })
    };
    getLatLng();
}

shizuDataCtrl.prototype.test = function() {
    for ( var i = 0; i < 5; i++ ) {
        map.addMarker( i+1, this.park[i].lat, this.park[i].lng,
        this.park[i].name, "", 0, 0, this.park[i].address, "");
    }
}
