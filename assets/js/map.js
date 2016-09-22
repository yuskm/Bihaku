/**
class : mapCtrl
google maps API 制御クラス

Author : ymiya
*/
///////////////////////////////////////////////////////////
// fuction : mapCtrl
// param : mapElement : Google Maps 制御対象map要素
//         guideElement : 探索結果表示div要素
// return :
// note :  コンストラクタ
///////////////////////////////////////////////////////////
function mapCtrl(mapElement, guideElement) {
/*** class propertyies end ***/
    this.zoom = 16;                     // zoom
    this.mapElement  = mapElement;      // Google Maps 制御対象mapオブジェクト
    this.guideElement = guideElement;   // 探索結果表示divオブジェクト
//    this.curlatlng = new google.maps.LatLng(35.681099,139.767084);     // default ; Tokyo station
    this.curlatlng = new google.maps.LatLng(34.975783,138.387355);       // default ; 新静岡
    // 制御用マップオブジェクト生成
    this.map = new google.maps.Map( this.mapElement,  { zoom: this.zoom,
                                                        center: this.curlatlng,
                                                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                                                        minZoom:14     // これ以上の領域の日陰探索は現状のアルゴリズムでは探索に時間がかかりすぎる
                                                      } );
    // 現在の描画領域
    this.curRegion = {latNE : 0, lngNE : 0, latSW : 0, lngSW : 0};

    // ヒートマップ オブジェクト
    this.heatmap = new google.maps.visualization.HeatmapLayer({
        radius : 8, //ヒートマップの各ポイントの大きさ
/**/    // 植栽データ表示用のカラー設定
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
/**/
    });

    this.markerInfo = [];           // Map上のMarker情報
    this.routeInfo = [];            // 探索ルート情報(ステップ毎のロケーション)

    // 経路探索用オブジェクト各種
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer( { map: this.map,
                                                                   suppressMarkers : true
                                                                 } );
    this.directionsDisplay.setMap(this.map);
    this.directionsDisplay.setPanel(this.guideElement);

    this.polyLine = [];

    this.bounds = new google.maps.LatLngBounds();
    this.infoWnd;         // Markerを押した時に表示する小窓オブジェクトを格納
/*** class propertyies end ***/
}

///////////////////////////////////////////////////////////
// fuction : getCurrentLocation
// param :  callback : 処理完了時のコールバック
// return :
// note :  ブラウザから現在地を取得する
///////////////////////////////////////////////////////////
mapCtrl.prototype.getCurrentLocation = function(callback) {
    var mapCtrlObj = this;   // obj for callback
    if ( navigator.geolocation ) {
        navigator.geolocation.getCurrentPosition ( funcGetCurPos );
    }
	function funcGetCurPos( position ) {
//        var lat = 34.971470;
//        var lng = 138.389172;
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
		callback( lat, lng );
        mapCtrlObj.curlatlng = new google.maps.LatLng( lat, lng );
    }
}

///////////////////////////////////////////////////////////
// fuction : setGMapEventListener
// param :  event : 対象イベント
//          callback : 対象イベントが発生した際のコールバック
// return :
// note :  google map にイベントが発生した際のコールバックを設定
///////////////////////////////////////////////////////////
mapCtrl.prototype.setGMapEventListener = function(event, callback) {
    var mapCtrlObj = this;   // obj for callback

    google.maps.event.addListener(this.map, "bounds_changed", function() {
            var pos = mapCtrlObj.map.getBounds();
            var latNE = mapCtrlObj.curRegion.latNE = pos.getNorthEast().lat();
            var lngNE = mapCtrlObj.curRegion.lngNE = pos.getNorthEast().lng();
            var latSW = mapCtrlObj.curRegion.latSW = pos.getSouthWest().lat();
            var lngSW = mapCtrlObj.curRegion.lngSW = pos.getSouthWest().lng();
            callback();
    });
}

///////////////////////////////////////////////////////////
// fuction : addMarker
// param :  id : ID
//          lat : Marker緯度
//          lng : Marker経度
//          name : 場所名
//          address : 住所
//          url : URL
//          iconStr : アイコンに表示する文字列
//          iconRGB : アイコンのRGB
//          orderNum : アイコンの重なり順序
// return :
// note :  google map にMarkerを追加する
///////////////////////////////////////////////////////////
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

/*
    this.bounds.extend(　pos );
    this.map.fitBounds( this.bounds );
*/
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

///////////////////////////////////////////////////////////
// fuction : clearMarkers
// param :
// return :
// note : 全Marker削除
///////////////////////////////////////////////////////////
mapCtrl.prototype.clearMarkers = function() {
    for (var i=0; i < this.markerInfo.length; i++){
        this.markerInfo[i].marker.setMap(null);
    }
    this.markerInfo = [];
    delete this.bounds;
    this.bounds = new google.maps.LatLngBounds();
}

///////////////////////////////////////////////////////////
// fuction : clearMarker
// param : id : 削除するMarkerのID
// return :
// note : 一つのMarker削除。ID指定
///////////////////////////////////////////////////////////
mapCtrl.prototype.clearMarker = function(id) {
    for ( var i = 0; i < this.markerInfo.length; i++ ) {
        if ( this.markerInfo[i].id == id ) {
            this.markerInfo[i].marker.setMap(null);
            this.markerInfo.splice(i,1);
            return;
        }
    }
}

///////////////////////////////////////////////////////////
// fuction : pickMarkers
// param : id : 残すMarkerのIDが格納された配列
// return :
// note : 引数で指定したMarker以外を削除
///////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////
// fuction : calcRoute
// param : destLatlng : 行き先の緯度経度
//         wayPointLatlng : 寄り道先の緯度経度を格納した配列
//         guide : 探索結果を表示するか(true/false)
//         callback : 探索完了時のコールバック
// return :
// note : 現在地から引数で指定した場所までの経路探索を行う
///////////////////////////////////////////////////////////
mapCtrl.prototype.calcRoute = function( destLatlng, wayPointLatlng, guide, callback ) {

    var request = {
		origin : this.curlatlng ,
		destination : new google.maps.LatLng(destLatlng.lat, destLatlng.lng),
		travelMode : google.maps.DirectionsTravelMode.DRIVING,
        unitSystem : google.maps.DirectionsUnitSystem.METRIC,
        optimizeWaypoints : false,
        provideRouteAlternatives : true,
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

// 探索開始
    var mapCtrlObj = this; // obj for callback
    this.routeInfo = [];

	this.directionsService.route( request, function( result, status ) {
		if ( status == google.maps.DirectionsStatus.OK ) {
            for ( var i = 0; i < result.routes.length; i++ ) {
			     mapCtrlObj.routeInfo[i] = result.routes[ i ].overview_path;
                var bounds = new google.maps.LatLngBounds();
                // 表示領域 設定
                for (var j = 0; j < mapCtrlObj.routeInfo.length;　j++ /* i+=Math.floor( resultPoints.length / (10) 探索値を間引く場合 )*/ ){
                    bounds.extend(　mapCtrlObj.routeInfo[i][j]　);
                }
    		}

            if ( guide ) {
                // 表示領域設定
                mapCtrlObj.map.fitBounds(　bounds　);
                // 探索結果表示
                mapCtrlObj.directionsDisplay.setDirections(　result　);
            }
            callback();
        }
	});
}

///////////////////////////////////////////////////////////
// fuction : calcRoutebyName
// param : destStr : 行き先の名称
//         callback : 探索完了時のコールバック
// return :
// note : 現在地から引数で指定した場所までの経路探索を行う
///////////////////////////////////////////////////////////
mapCtrl.prototype.calcRoutebyName = function( destStr, callback ) {

    var request = {
		origin : this.curlatlng ,
		destination : destStr,
		travelMode : google.maps.DirectionsTravelMode.WALKING,
        unitSystem : google.maps.DirectionsUnitSystem.METRIC,
        optimizeWaypoints : false,
        provideRouteAlternatives : true,
        avoidHighways : true,
	};

    // 探索開始
    var mapCtrlObj = this; // obj for callback
    this.routeInfo =[];

    if ( this.polyLine ) {
        for ( var i = 0; i < this.polyLine.length; i++) {
            this.polyLine[i].setMap(null);
            this.polyLine[i] =[];
        }
    }
	this.directionsService.route( request, function( result, status ) {
		if ( status == google.maps.DirectionsStatus.OK ) {
            var routeInfo = [];  // ルート表示用データ格納変数

            for ( var i = 0; i < result.routes.length; i++ ) {
                mapCtrlObj.routeInfo[ i ] = { path : result.routes[ i ].overview_path,
                                              dist : result.routes[ i ].legs[0].distance };
                // 表示領域 設定
                var bounds = new google.maps.LatLngBounds();
    			for (var j = 0; j < mapCtrlObj.routeInfo[ i ].path.length; j++ /* j+=Math.floor( resultPoints.length / (10) 探索値を間引く場合 )*/ ){
                    bounds.extend(　mapCtrlObj.routeInfo[ i ].path[ j ]　);
                }
                routeInfo[i] = 　mapCtrlObj.routeInfo[ i ].path;
    		}
            mapCtrlObj.map.fitBounds(　bounds　);
            mapCtrlObj.displayCalcRoute(routeInfo);
            callback();
        }
	});
}

///////////////////////////////////////////////////////////
// fuction : displayCalcRoute
// param : routeInfo : 検索ルート結果
// return :
// note : 検索ルート結果をpolylineで表示する
///////////////////////////////////////////////////////////
mapCtrl.prototype.displayCalcRoute = function( routeInfo ) {
    var lineColor = [ '#00ffff',"#bf00ff", "#00ffbf", "#ffff00", "#0000FF", "#00ff00", "#0000FF", "#00ffbf" ];  // polyLineの色
    for ( var i = 0; i < routeInfo.length; i++ ) {
        this.polyLine[i] = new google.maps.Polyline({
            path: routeInfo[ i ],
            geodesic: true,
            strokeColor: lineColor[ i % lineColor.length ],
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        this.polyLine[i].setMap( this.map );
    }
}

///////////////////////////////////////////////////////////
// fuction : setCenter
// param : lat, lng : 緯度, 経度
// return :
// note : 地図の中心地を指定
///////////////////////////////////////////////////////////
mapCtrl.prototype.setCenter = function(lat, lng) {
    var latlng = new google.maps.LatLng( lat , lng ) ;
    this.map.setCenter( latlng );
}

///////////////////////////////////////////////////////////
// fuction : findLandmark
// param : lat, lng : 緯度, 経度
//         type : 以下のURLを参照
//                https://developers.google.com/places/supported_types?hl=ja
//         rad : 探索範囲(メートル)
//         idOffset : MarkerのId(複数ある場合は、ここで指定した値がオフセットとなる)
// return :
// note : 地図の中心地を指定
///////////////////////////////////////////////////////////
mapCtrl.prototype.findLandmark = function(lat, lng, type, rad, idOfst ) {
    var mapCtrlObj = this; // obj for callback
    var request = {
        location: new google.maps.LatLng( lat, lng ),
        radius: rad,
        types: [ type ]
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

///////////////////////////////////////////////////////////
// fuction : showHeatmap
// param : pointData : ヒートポイント
// return :
// note : ヒートマップを表示する
///////////////////////////////////////////////////////////
mapCtrl.prototype.showHeatmap = function(pointData) {
    //ヒートマップ用のデータの作成
//    var bounds = new google.maps.LatLngBounds();
    var  latlng, point = [];
    for ( var i = 0; i < pointData.length; i++ ) {
        latlng = new google.maps.LatLng( pointData[i].coordinate[1], pointData[i].coordinate[0] );
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

///////////////////////////////////////////////////////////
// fuction : zoomUp, zoomDown
// param :
// return :
// note : ズーム値変更
///////////////////////////////////////////////////////////
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
