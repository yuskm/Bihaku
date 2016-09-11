
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
       gMap.calcRoutePlace( "駿府城公園" );
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
