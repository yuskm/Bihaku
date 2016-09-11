
/**/ var log = document.getElementById( 'log' );

var gShizuData  = new shizuDataCtrl();
var gShizuMichi = new shizuMichiCtrl();
var gMap        = new mapCtrl( document.getElementById('map'), document.getElementById('guide') );

var timer4Redraw = 0;
(function() {
    // 以下はAjaxで処理、処理分散させたいため非同期で処理
    // あえて deffered は使わない
//    checkParkLocation();

    // 現在地取得
    var cbGetCurrentLocate = function(lat,lng) {
        gMap.setCenter(lat,lng);
///////////
        gMap.calcRoutePlace( "駿府城公園" );
        var timerId = setInterval( function() {
            if ( gShizuMichi.staus.shokusaiOK && gMap.CalcRoutePlaceOK ) {
                treeCount();
                clearInterval(timerId);
            }
        }, 3000 );
//////////
    }
    var cbBoundsChange = function(latNE,lngNE,latSW,lngSW) {
        if ( timer4Redraw == 0 ) {
            gShizuMichi.getShokusaiData(latNE, lngNE, latSW, lngSW, 100, 1);
            checkShokusaiData();
            timer4Redraw = 1;
            var timerId = setInterval( function() {
                timer4Redraw = 0;
                clearInterval(timerId);
            }, 1000);
        }
    }
    gMap.getCurrentLocation(cbGetCurrentLocate);
    gMap.setGMapEventListener("bounds_changed", cbBoundsChange);
}());



///////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////
function checkShokusaiData() {
    // 以下はAjaxで処理、処理分散させたいため非同期で処理
    // あえて deffered は使わない
    var timerId = setInterval( function() {
        if ( gShizuMichi.staus.shokusaiOK ) {
            gMap.showHeatmap( gShizuMichi.shokusaiLocate );
/*
            for ( var i = 0; i < gShizuMichi.shokusaiLocate.length; i++ ) {
                gMap.addMarker( i + gDestinationIDOffset, gShizuMichi.shokusaiLocate[i].coordinate[1], gShizuMichi.shokusaiLocate[i].coordinate[0],
                "つぶやき", "1234567890123456789012345678901234567890", "", String( i ), "227426" );
            }
*/
            clearInterval(timerId);
        }
    }, 1000);
}
////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////
function treeCount() {
            var treeCount = [[],[],[]];
            for ( var k = 0; k < gMap.routeLocate.length; k++) {
                var routeLatLng = gMap.routeLocate[ k ];
                for ( var i  = 0; i < gShizuMichi.shokusaiLocate.length; i++ ) {
                    var treeXY = getXY( gShizuMichi.shokusaiLocate[ i ].coordinate[ 1 ] ,gShizuMichi.shokusaiLocate[ i ].coordinate[ 0 ] ,8 );
    /**/            for ( var j = 0; j < routeLatLng.path.length - 1 ; j++ ) {      // 方法1
    ////            for ( var j = 0; j < gMap.routeInfo.length ; j++ ) {          // 方法2
                    // ルート内 各ステップの開始点/終了点の座標
                        var startXY = getXY( routeLatLng.path[j].lat() ,routeLatLng.path[j].lng() ,8 );

                        // ＜方法１>　ステップ開始点/終了点 を結んだ直線 と 飲食店 の垂線距離を算出
                        // 処理重たいのでとりあえず使用しない
                        var endXY = getXY( routeLatLng.path[ j + 1 ].lat(), routeLatLng.path[ j + 1 ].lng() ,8 );
                        var dest = calcDistLinetoPoint( startXY.x, startXY.y, endXY.x, endXY.y, treeXY.x, treeXY.y );

                        // 開始端/終端座標より 2000m 外側にある場合は無条件でNG
                        // これを跳ねないと始端/終端を超えた直線上からの垂線距離で条件を満たしてしまうから
                        if ( startXY.x < endXY.x ) {
                            if ( ( ( startXY.x - treeXY.x ) < -10 ) ||
                                 ( ( endXY.x - treeXY.x ) > 10 ) ) {
                                continue;
                            }
                        } else {
                            if ( ( ( endXY.x - treeXY.x ) < -10 ) ||
                                 ( ( startXY.x - treeXY.x ) > 10 ) ) {
                                continue;
                            }
                        }
                        if ( startXY.y < endXY.y ) {
                            if ( ( ( startXY.y - treeXY.y ) < -10 ) ||
                                 ( ( endXY.y - treeXY.y ) > 10 ) ) {
                                continue;
                            }
                        } else {
                            if ( ( ( endXY.y - treeXY.y ) < -10 ) ||
                                 ( ( startXY.y - treeXY.y ) > 10 ) ) {
                                continue;
                            }
                        }
                        // ＜方法2>　ステップ開始点/終了点 を結んだ直線 と 飲食店 の垂線距離を算出
                        // 開始点と終了点の距離が離れている場合はpickできない可能性あり
                        // とりあえず現状は方法1と結果変わらないので、こちらを使う。
                        /***
                        var dest = calcDistPointtoPoint( startXY.x, startXY.y, treeXY.x, treeXY.y)
                        ***/
                        // 垂線距離が 2000m 以内の場合は pick up
                        if ( dest < 10  ) {
                            treeCount[k]++;
                        }
                    }
                }
            }

            logWrite(treeCount);
            logWrite(gMap.routeLocate[0].dist);
            logWrite(gMap.routeLocate[1].dist);
            logWrite(gMap.routeLocate[2].dist);

            logWrite( 10 * treeCount[0] * 100 / gMap.routeLocate[0].dist.value);
            logWrite( 10 * treeCount[1] * 100 / gMap.routeLocate[1].dist.value);
            logWrite( 10 * treeCount[2] * 100 / gMap.routeLocate[2].dist.value);
}


///////////////////////////////////////////////////////////
function checkParkLocation() {
    // 以下はAjaxで処理、処理分散させたいため非同期で処理
    // あえて deffered は使わない
    var timerId = setInterval( function() {
        if ( gShizuData.staus.parkMapOK ) {
            for ( var i = 0; i < gShizuData.park.length; i++ ) {
                gMap.addMarker( i + gParkIDOffset ,gShizuData.park[ i ].lat, gShizuData.park[ i ].lng,
                gShizuData.park[ i ].name,　gShizuData.park[ i ].address, "", String( i + 1 ), "ff7e73" );
            }
            clearInterval(timerId);
            makeParkTable();
        }
    }, 2000);
}

function makeParkTable() {
	var parkTable = document.getElementById("parkTable");

    for (var i = 0; i < parkTable.rows.length; i++ ) {
        parkTable.deleteRow( 0 );
    }

    for (var i = 0; i < gShizuData.park.length; i++ ) {
        var row  = parkTable.insertRow( i );
	    var cell = row.insertCell( 0 );
        cell.appendChild( document.createTextNode( gShizuData.park[i].name ) );
        cell = row.insertCell( 1 );
        cell.appendChild( document.createTextNode( gShizuData.park[i].address ) );
	    cell = row.insertCell( 2 );
        var eButton = document.createElement('button');
        eButton.innerHTML = 'GO!';
        eButton.setAttribute('type', "button");
        var id = i + gParkIDOffset
        eButton.setAttribute('onclick', "setDestination(" + id + ");");
        cell.appendChild( eButton );
    }
}

///////////////////////////////////////////////////////////
function checkClosedRoad() {
    // 以下はAjaxで処理、処理分散させたいため非同期で処理
    // あえて deffered は使わない
    var id = setInterval( function() {
        if ( gShizuMichi.staus.closedRoadOK ) {
            for ( var i = 0; i < gShizuMichi.closedRoad.length; i++ ) {
                gMap.addMarker( i + gClosedIDOffset, gShizuMichi.closedRoad[ i ].midPointLat, gShizuMichi.closedRoad[ i ].midPointLng,
                "通行止め", "", "", "通行止め", "ffff00" );
                clearInterval(id);
            }
        }
    }, 2000);
}

///////////////////////////////////////////////////////////
function fadeOut(element, time, callback) {
    var fadeTime     = (time) ? time : 400,
        keyFrame     = 30,
        stepTime     = fadeTime / keyFrame,
        minOpacity   = 0,
        stepOpacity  = 1 / keyFrame,
        opacityValue = 1,
        sId          = '';

    if (!element) return;

    element.setAttribute('data-fade-stock-display', element.style.display.replace('none', ''));

    var setOpacity = function(setNumber) {
        if ('opacity' in element.style) {
            element.style.opacity = setNumber;
        } else {
            element.style.filter = 'alpha(opacity=' + (setNumber * 100) + ')';

            if (navigator.userAgent.toLowerCase().match(/msie/) &&
                !window.opera && !element.currentStyle.hasLayout) {
                element.style.zoom = 1;
            }
        }
    };

    if (!callback || typeof callback !== 'function') {
        callback = function() {};
    }

    setOpacity(1);

    sId = setInterval(function() {
        opacityValue = Number((opacityValue - stepOpacity).toFixed(12));

        if (opacityValue < minOpacity) {
            opacityValue = minOpacity;
            element.style.display = 'none';
            clearInterval(sId);
        }

        setOpacity(opacityValue);

        if (opacityValue === minOpacity) {
            callback();
        }
    }, stepTime);

    return element;
};

///////////////////////////////////////////////////////////
function recongitionStart() {
    speech.recongitionStart();
}
function test() {
    shizudata.test();
}

function logWrite(text) {
    console.log(text);
/**/log.appendChild( document.createTextNode(text));
/**/log.appendChild(document.createElement("br"))
}
