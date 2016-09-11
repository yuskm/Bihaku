function mapCtrl(mapElement, guideElement) {
/*** class propertyies start ***/
    this.zoom = 16;
    this.mapElement  = mapElement;
    this.guideElement = guideElement;
//    this.curlatlng = new google.maps.LatLng(35.681099,139.767084);     // initial locate = Tokyo station
    this.curlatlng = new google.maps.LatLng(34.975783,138.387355); // 新静岡
    this.map = new google.maps.Map( this.mapElement,  { zoom: this.zoom,
                                                        center: this.curlatlng,
                                                        mapTypeId: google.maps.MapTypeId.ROADMAP
                                                      } );

    this.heatmap = new google.maps.visualization.HeatmapLayer({
        radius : 8, //ヒートマップの各ポイントの大きさ
        gradient:[
                'rgba(0, 255, 0, 0)',
                'rgba(0, 255, 0, 1)',
                'rgba(0, 191, 0, 1)',
                'rgba(0, 127, 0, 1)',
                'rgba(0, 63, 0, 1)',
                'rgba(0, 0, 0, 1)',
                'rgba(0, 0, 0, 1)',
                'rgba(0, 0, 0, 1)',
                'rgba(0, 0, 0, 1)',
                'rgba(0, 0, 0, 1)',
                'rgba(0, 0, 0, 1)',
                'rgba(0, 0, 0, 1)',
                'rgba(0, 0, 0, 1)',
                'rgba(0, 0, 0, 1)'
        ]
    });

    this.markerInfo = [];
    this.routeInfo = [];
    this.routeLocate = [];
    this.CalcRouteOK = 0;
    this.CalcRoutePlaceOK = 0;

    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer( { map: this.map,
                                                                   suppressMarkers : true
                                                                 } );
    this.directionsDisplay.setMap(this.map);
    this.directionsDisplay.setPanel(this.guideElement);

    this.bounds = new google.maps.LatLngBounds();


    this.infoWnd;
/*** class propertyies end ***/
}

mapCtrl.prototype.getCurrentLocation = function(callback) {
    var mapCtrlObj = this;   // obj for callback
    if ( navigator.geolocation ) {
        navigator.geolocation.getCurrentPosition ( funcGetCurPos );
    }
	function funcGetCurPos( position ) {
		callback(position.coords.latitude, position.coords.longitude);
////    callback(34.975783,138.387355);
    }
}

mapCtrl.prototype.setGMapEventListener = function(event, callback) {
    var mapCtrlObj = this;   // obj for callback

    google.maps.event.addListener(this.map, "bounds_changed", function() {
        var pos = mapCtrlObj.map.getBounds();
        var latNE = pos.getNorthEast().lat();
        var lngNE = pos.getNorthEast().lng();
        var latSW = pos.getSouthWest().lat();
        var lngSW = pos.getSouthWest().lng();
        callback( latNE, lngNE, latSW, lngSW );
    });
}


mapCtrl.prototype.addMarker = function(id, lat, lng, name, address, url, iconStr, iconRGB, orderNum) {

    if(this.map === undefined){
        return;
    }
    if ( lat=="" || lng=="" ) {
        return;
    }
    if ( ( lat < -90 || lat > 90 ) || ( lng < -180 || lng > 180 ) ) {
        return;
    }

    // マーカー追加
    var pos = new google.maps.LatLng(lat, lng);
    var marker = new google.maps.Marker({
        draggable: false,
        animation: google.maps.Animation.DROP,
        position: pos,
        icon: new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld="+ iconStr/*文字*/ + "|" + iconRGB + "|000000"/*背景RGB|文字RGB*/),
        map: this.map,
        zIndex: 20      /* てきとー */
    });
    if ( orderNum ) {
        marker.zIndex = orderNum;
    }

    var makerInfo = { marker : marker,
                      id : id,
                      lat : lat,
                      lng : lng,
                      name : name,
                      address : address,
                      url : url,
                      iconStr : iconStr,
                      iconRGB :  iconRGB };
    this.markerInfo.push( makerInfo );


    // 情報ウィンドウ追加
    var contentString = "<dl class='info_window'><dt>" + " " + name + "<br />" + address + "<br /></dd></dl>";

    if ( url ) {
        contentString += " <a href='" + url + "'>ホームページ</a>";
    }
    var infowindow = new google.maps.InfoWindow ( {
        content: contentString
    } );

    this.bounds.extend(　pos );
    this.map.fitBounds( this.bounds );

    var mapCtrlObj = this; // obj for callback
    google.maps.event.addListener(marker, 'click', function() {
        if ( mapCtrlObj.infoWnd ) {
            // すでに開いている情報ウィンドウがあれば閉じる
            mapCtrlObj.infoWnd.close();
        }
        infowindow.open(　mapCtrlObj.map, marker　);
        mapCtrlObj.infoWnd = infowindow;
    });
}

mapCtrl.prototype.clearMarkers = function() {
    for (var i=0; i < this.markerInfo.length; i++){
        this.markerInfo[i].marker.setMap(null);
    }
    this.markerInfo = [];
    delete this.bounds;
    this.bounds = new google.maps.LatLngBounds();
}

mapCtrl.prototype.clearMarker = function(id) {
    for ( var i = 0; i < this.markerInfo.length; i++ ) {
        if ( this.markerInfo[i].id == id ) {
            this.markerInfo[i].marker.setMap(null);
            this.markerInfo.splice(i,1);
            return;
        }
    }
}

mapCtrl.prototype.pickMarkers = function(id) {
    var splicePos = [];
    for ( var i = 0; i < this.markerInfo.length; i++ ) {
        for ( var j = 0; j < id.length; j++ ) {
            if ( this.markerInfo[i].id == id[ j ] ) {
                splicePos.push( i );
                break;
            }
        }
        if ( j >= id.length ) {
            this.markerInfo[ i ].marker.setMap( null );
        }
    }

    for ( var i = 0; i < splicePos.length; i++ ) {
        this.markerInfo.splice( i, splicePos[ i ] - i );
    }
    this.markerInfo.splice( splicePos.length, this.markerInfo.length - splicePos.length );
}


mapCtrl.prototype.calcRoute = function( destLatlng, wayPointLatlng, guide ) {


//    var wayPoints = [ {
//             location: new google.maps.LatLng( parseFloat(wayPointLatlng[0].lat), parseFloat(wayPointLatlng[0].lng) )
//            location: new google.maps.LatLng(36.554016559725554, 136.67215079069138)
//    } ];

    var request = {
		origin : this.curlatlng ,
		destination : new google.maps.LatLng(destLatlng.lat, destLatlng.lng),
		travelMode : google.maps.DirectionsTravelMode.DRIVING,
        unitSystem : google.maps.DirectionsUnitSystem.METRIC,
        optimizeWaypoints : false,
        provideRouteAlternatives : true,
//        waypoints : wayPoints,
        avoidHighways : true,
	};

    if ( wayPointLatlng.length > 0 ) {
        var wayPt = [];
        for ( var i = 0; i < wayPointLatlng.length ; i++ ) {
            wayPt.push( { location : new google.maps.LatLng(
            parseFloat( wayPointLatlng[ i ].lat ), parseFloat( wayPointLatlng[ i ].lng ) ) } );
        }
        request.waypoints = wayPt;
    }

//  描画領域を初期化する
//  delete this.bounds;
//  this.bounds = new google.maps.LatLngBounds();
    this.routeInfo = [];
    this.CalcRouteOK = 0;
    var mapCtrlObj = this; // obj for callback
	this.directionsService.route( request, function( result, status ) {
		if ( status == google.maps.DirectionsStatus.OK ) {

			mapCtrlObj.routeInfo = result.routes[ 0 ].overview_path;

           if ( guide ) {
                var bounds = new google.maps.LatLngBounds();
    			for (var i = 0; i < mapCtrlObj.routeInfo.length; i++ /* i+=Math.floor( resultPoints.length / (10) 探索値を間引く場合 )*/ ){
                    bounds.extend(　mapCtrlObj.routeInfo[i]　);
                }
                mapCtrlObj.directionsDisplay.setDirections(　result　);
                mapCtrlObj.map.fitBounds(　bounds　);
    		}
        }
        mapCtrlObj.CalcRouteOK = 1;
	});
}

mapCtrl.prototype.calcRoutePlace = function( destStr ) {

    var request = {
		origin : this.curlatlng ,
		destination : destStr,
		travelMode : google.maps.DirectionsTravelMode.WALKING,
        unitSystem : google.maps.DirectionsUnitSystem.METRIC,
        optimizeWaypoints : false,
        provideRouteAlternatives : true,
//        waypoints : wayPoints,
        avoidHighways : true,
	};

    var mapCtrlObj = this; // obj for callback
    this.CalcRoutePlaceOK = 0;
	this.directionsService.route( request, function( result, status ) {
		if ( status == google.maps.DirectionsStatus.OK ) {
            var lineColor = [ '#FF0000', "#00FF00", "#0000FF" ];
            for ( var i = 0; i < result.routes.length; i++ ) {
//			    mapCtrlObj.routeLocate[ i ].path = result.routes[ i ].overview_path;
//              mapCtrlObj.routeLocate[ i ].dist = result.routes[ i ].legs[0].distance;
                mapCtrlObj.routeLocate[ i ] = { path : result.routes[ i ].overview_path,
                                                dist : result.routes[ i ].legs[0].distance };

                var bounds = new google.maps.LatLngBounds();
                var flightPath = new google.maps.Polyline({
                    path: mapCtrlObj.routeLocate[ i ].path,
                    geodesic: true,
                    strokeColor: lineColor[ i % 3 ],
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                  });
                flightPath.setMap(mapCtrlObj.map);

    			for (var j = 0; j < mapCtrlObj.routeLocate[ i ].path.length; j++ /* j+=Math.floor( resultPoints.length / (10) 探索値を間引く場合 )*/ ){
                    bounds.extend(　mapCtrlObj.routeLocate[ i ].path[ j ]　);
                }
//                mapCtrlObj.directionsDisplay.setDirections(　result　);
//                mapCtrlObj.map.fitBounds(　bounds　);
    		}
        }
        mapCtrlObj.CalcRoutePlaceOK = 1;
	});
}

mapCtrl.prototype.setCenter = function(lat, lng) {
    var latlng = new google.maps.LatLng( lat , lng ) ;
    this.map.setCenter( latlng );
}



mapCtrl.prototype.findLandmark = function(lat, lng, type, rad, idOfst ) {
    var mapCtrlObj = this; // obj for callback
    var request = {
        location: new google.maps.LatLng( lat, lng ),
        radius: '800',
        types: ['parking']
    };
    var service = new google.maps.places.PlacesService( this. map );

    service.nearbySearch(request, function (res, status) {
        if ( status == google.maps.places.PlacesServiceStatus.OK ) {
            for ( var i = 0; i < res.length; i++ ) {
                mapCtrlObj.addMarker( idOfst + i,
                                    res[i].geometry.location.lat(),
                                    res[i].geometry.location.lng(),
                                    res[i].name,
                                    res[i].vicinity,
                                    "",
                                    "P",
                                    "0040ff"
                                    ,1　/* 目的地より後面におきたい */);
            }
        }
    });
}


/////////////////////////////////////////////////////////
mapCtrl.prototype.showHeatmap = function(pointData) {
    //ヒートマップ用のデータの作成
//    var bounds = new google.maps.LatLngBounds();
    var  latlng, point = [];
    for ( var i = 0; i < pointData.length; i++ ) {
        latlng = new google.maps.LatLng( pointData[i].coordinate[1], pointData[i].coordinate[0]);
        point.push({
            location : latlng,
            opacity : 0.1,
            weight : 1
        });
//        bounds.extend(latlng);
    }
//    this.map.fitBounds(bounds);       //全てのデータが画面に収まる様に表示を変更

    this.heatmap.setData(point);
    this.heatmap.setMap(this.map);
}




/////////////////////////////////////////////////////////
mapCtrl.prototype.zoomUp = function() {
    if ( this.zoom < 21 ) {
        this.zoom++;
        this.map.setZoom( zoom );
    }
}

mapCtrl.prototype.zoomDown = function()  {
    if ( this.zoom > 1 ) {
        this.zoom--;
        this.map.setZoom( zoom );
    }
}
