
/**
美白ナビ制御 Script

Author : ymiya
*/
///////////////////////////////////////////////////////////
// global変数
var gShizuMichi = new shizuMichiCtrl();     // しずみちAPI制御
var gMap        = new mapCtrl( document.getElementById('map'), document.getElementById('guide') );  // google MAP API制御
var gJson       = new jsonCtrl();
var gResas      = new resasCtrl();
var gRest       = new restCtrl();
///////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////
// temporary
var timer4Redraw  = 0;    // 描画領域変更後、一定時間経過した時のみ植栽データを取得する
var doGetShokusai = 0;    // 一定時間描画領域が変更されなければ、最新の描画領域を元に植栽データ取得
var log = document.getElementById( 'log' ); // log表示
///////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////
// 20170218 resas コンテスト用
var machipo=[];

var clickEvent = function(i) {
    gMap.setCenter( machipo[i].lat, machipo[i].lng );
    gMap.addMarker( 0x1000, machipo[i].lat, machipo[i].lng, machipo[i].title, machipo[i].comment, machipo[i].url, "", "E82E11", null);
};
///////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////
// fuction : 即時関数
// param :
// return :
// note : 現在地を取得して、Google map の中心地をそこに設定する
//        描画領域が変更された時のコールバックを指定。描画領域にある植栽データを取得する
//        (gShizuMichi.getShokusaiData)
// input : gMap.curRegion : google Map の表示領域
///////////////////////////////////////////////////////////
( function() {
/////////////////////////////////////////////////////////////////
// resas コンテスト用処理
// ymiyama 20170201 まちぽ から イベント情報を取得する
    var GetMachipoInfo = function(lat, lng) {
        var lat = 34.975783;
        var lng = 138.387355;

        var machipoTable = document.getElementById("machipoTable");
        machipoTable.style.textAlign ="right";

        for (var i = 0; i < machipoTable.rows.length; i++ ) {
            machipoTable.deleteRow( i );
        }

        var cbMachipo = function(res) {
            for ( var i = 0; i < res.events.length; i++ ) {
                if ( ( res.events[i].categories.indexOf(3) >= 0 ) ||
                     ( res.events[i].categories.indexOf(5) >= 0 ) ||
                     ( res.events[i].categories.indexOf(7) >= 0 ) ||
                     ( res.events[i].categories.indexOf(8) >= 0 ) ||
                     ( res.events[i].categories.indexOf(10) >= 0 )
                ) {
                    machipo[machipo.length] = { title : res.events[i].title,
                                   comment : res.events[i].content,
                                   url : res.events[i].event_url,
                                   start : res.events[i].start_at,
                                   end : res.events[i].end_at,
                                   lat : res.events[i].location.lat,
                                   lng : res.events[i].location.lng,
                                   location : res.events[i].location.name };
                }
            }
            console.log(machipo);

            for ( var i = 0; i < machipo.length; i++ ) {
                var row  = machipoTable.insertRow( i );
                var cell = row.insertCell( 0 );
                cell.style.color = "black";
                cell.appendChild( document.createTextNode( machipo[i].title ) );
                cell = row.insertCell( 1 );
                var eButton = document.createElement('button');
                eButton.innerHTML = 'GO!';
                eButton.setAttribute('type', "button");
                eButton.setAttribute('onclick', "clickEvent(" + i + ");" );
                cell.appendChild( eButton );
            }
        };
        gRest.getData("ajax.php?url=https://machipo.jp/api/v2/event/search.json?date=active&lat="+lat+"&lng="+lng+"&radus=3","json", cbMachipo);
    };
// resas コンテスト用処理
/////////////////////////////////////////////////////////////////

    // 現在地取得時のコールバック
    var cbGetCurrentLocate = function(lat,lng) {
        gMap.setCenter(lat,lng);
        GetMachipoInfo(lat,lng);
    }

    // 植栽データ取得時のコールバック
    var cbGetShokusai = function() {
        if ( gShizuMichi.staus.shokusaiOK == 1) {
/***
// ymiyma 20160925 植栽データ取得は起動時に静的なjsonファイルで全領域分を取得し、ヒートマップレイヤーを作成するように修正した
//            gMap.showHeatmap( gShizuMichi.shokusaiLocate );
//            removeProcessing();
***/
        }
    }

    // 描画領域変更時のコールバック
    // 描画領域変更されたら、領域内の植栽データ取得
    var cbBoundsChange = function() {
/***
// ymiyma 20160925 植栽データ取得は起動時に静的なjsonファイルで全領域分を取得し、ヒートマップレイヤーを作成するように修正した
        dispProcessing();
        if ( timer4Redraw == 0 ) {
            var timerId = setInterval( function() {
                if ( doGetShokusai == 0 ) {
                    gShizuMichi.getShokusaiData( gMap.curRegion.latNE, gMap.curRegion.lngNE, gMap.curRegion.latSW, gMap.curRegion.lngSW, 100, 1, null, cbGetShokusai );
                    timer4Redraw = 0;
                    clearInterval(timerId);
                } else {
                    doGetShokusai = 0;
                }
            }, 500);
        }
        doGetShokusai = 1;
***/
    }

    gMap.getCurrentLocation(cbGetCurrentLocate); // 現在地取得
    gMap.setGMapEventListener("bounds_changed", cbBoundsChange); // 描画領域変更時のコールバック設定

    // 口コミ情報をDB(postgresから取得)
    $.ajax({
        type: "GET",
        url: "assets/php/kuchikomi_get.php",
        success: function(res) {
            for ( var i = 0; i < res.length; i++ ) {
                gMap.addMarker( res[i].id, res[i].lat, res[i].lng, "", "", "", "", "6DF79C", null);
            }
        }
    });

// ymiyma 20160925 植栽データ取得は起動時に静的なjsonファイルで全領域分を取得し、ヒートマップレイヤーを作成するように修正した
    var cbShokusaiJsonRead = function(res) {
        gMap.showHeatmap( res );
        removeProcessing();
    }
    gJson.readJsonFile("assets/json/shokusai.json",cbShokusaiJsonRead);

/////////////////////////////////////////////////////////////////
// resas コンテスト用処理
// ymiyama 20170201 RESASデータから観光資源を取得。
    var deferred = gResas.getKankochi();
    //　完了の通知がきたら、一覧表示
    deferred.done(function(){
        var kankoChiTable = document.getElementById("kankoChiTable");
        kankoChiTable.style.textAlign ="right";

        for (var i = 0; i < kankoChiTable.rows.length; i++ ) {
            kankoChiTable.deleteRow( i );
        }

        for ( var i = 0; i < gResas.kanokoChi.length; i++ ) {
            var row  = kankoChiTable.insertRow( i );
        	var cell = row.insertCell( 0 );
            cell.style.color = "black";
            cell.appendChild( document.createTextNode( gResas.kanokoChi[i].name ) );
            cell = row.insertCell( 1 );
            var eButton = document.createElement('button');
            eButton.innerHTML = 'GO!';
            eButton.setAttribute('type', "button");
            eButton.setAttribute('onclick', "gMap.setCenter(" + gResas.kanokoChi[i].lat + "," + gResas.kanokoChi[i].lng + ");");
            cell.appendChild( eButton );
        }
    });
// resas コンテスト用処理
/////////////////////////////////////////////////////////////////
}());


///////////////////////////////////////////////////////////
// fuction : treecount
// param :
// return :
// note :  google maps API で取得した目的地への探索経路 と
//         しずみちAPIから取得した植栽の位置データを使い、探索経路中の植栽数をカウントする
// input :
// gMap.routeInfo : google maps API で取得した目的地への探索結果(ステップごと)
// gShizuMichi.shokusaiLocate : しずみちAPIから取得した植栽の位置データ
///////////////////////////////////////////////////////////
function treeCount() {
////// temporary
// これらの値は算出結果を見ながら変更していく
    var perpendicularMax = 20;      // 日陰とみなす垂線距離の最大値
    var treeShadowMeter = 5;        // 一つの植栽における影のサイズ(メートル)
//////

    var treeCount = [[],[],[]];
    for ( var k = 0; k < gMap.routeInfo.length; k++) {
        var routeLatLng = gMap.routeInfo[ k ];
        for ( var i  = 0; i < gShizuMichi.shokusaiLocate.length; i++ ) {
            var treeXY = getXY( gShizuMichi.shokusaiLocate[ i ].coordinate[ 1 ] ,gShizuMichi.shokusaiLocate[ i ].coordinate[ 0 ] ,8 );  // 植栽の平面座標

            // ＜方法１>　ステップ開始点/終了点 を結んだ直線 と 植栽 の垂線距離を算出し、一定距離以内であれば日陰とみなす
            for ( var j = 0; j < routeLatLng.path.length - 1 ; j++ ) {
                // ルート内 各ステップの開始点/終了点の座標
                var startXY = getXY( routeLatLng.path[j].lat() ,routeLatLng.path[j].lng() ,8 );             // ルートステップにおける開始点の平面座標
                var endXY = getXY( routeLatLng.path[ j + 1 ].lat(), routeLatLng.path[ j + 1 ].lng() ,8 );   // ルートステップにおける終了点の平面座標
                var dest = calcDistLinetoPoint( startXY.x, startXY.y, endXY.x, endXY.y, treeXY.x, treeXY.y );   //　ステップ開始点/終了点 を結んだ直線 と 植栽 の垂線距離

                // 開始端/終端座標より 一定距離の外側にある場合は無条件でNG
                // これを跳ねないと始端/終端を超えた直線上からの垂線距離で条件を満たしてしまうから
                if ( startXY.x < endXY.x ) {
                    if ( ( ( startXY.x - treeXY.x ) < -perpendicularMax ) ||
                         ( ( endXY.x - treeXY.x ) > perpendicularMax ) ) {
                            continue;
                    }
                } else {
                    if ( ( ( endXY.x - treeXY.x ) < -perpendicularMax ) ||
                         ( ( startXY.x - treeXY.x ) > perpendicularMax ) ) {
                        continue;
                    }
                }

                if ( startXY.y < endXY.y ) {
                    if ( ( ( startXY.y - treeXY.y ) < -perpendicularMax ) ||
                         ( ( endXY.y - treeXY.y ) > perpendicularMax ) ) {
                        continue;
                    }
                } else {
                    if ( ( ( endXY.y - treeXY.y ) < -perpendicularMax ) ||
                         ( ( startXY.y - treeXY.y ) > perpendicularMax ) ) {
                        continue;
                    }
                }
                // 垂線距離が一定距離以内の場合は pick up
                if ( dest < perpendicularMax  ) {
                    treeCount[k]++;
                }
            }
        }

        // ＜方法2>　ステップ開始点/終了点 を結んだ直線 と 飲食店 の垂線距離を算出
        // 開始点と終了点の距離が離れている場合はpickできない可能性あり
////        for ( var j = 0; j < gMap.routeInfo.length ; j++ ) {            // 方法2
////            // ルート内 各ステップの開始点/終了点の座標
////            var startXY = getXY( routeLatLng.path[j].lat() ,routeLatLng.path[j].lng() ,8 );
////            var dest = calcDistPointtoPoint( startXY.x, startXY.y, treeXY.x, treeXY.y)
////            // 垂線距離が一定距離以内の場合は pick up
////            if ( dest < perpendicularMax  ) {
////                treeCount[k]++;
////            }
////        }
    }

    var lineColor = [ '#00ffff',"#bf00ff", "#00ffbf", "#ffff00", "#0000FF", "#00ff00", "#0000FF", "#00ffbf" ];
    $("#hikage").empty();
    for ( var i = 0; i < gMap.routeInfo.length; i++) {



//    $("#hikage").html("<BR><BR><BR>ルート1   日陰率 : " + Math.floor(treeShadowMeter * treeCount[i] * 100 / gMap.routeInfo[i].dist.value) + "%" );
    $("#hikage").append(
        $("<tr></tr>")
            .append($("<th bgcolor=" + lineColor[ i % lineColor.length ] + "></th>").text("ルート"+(i+1) ))
            .append($("<td></td>").text("の日陰率は　"))
            .append($("<td style='font-weight: bold'></td>").text( ( Math.floor(treeShadowMeter * treeCount[i] * 100 / gMap.routeInfo[i].dist.value) ) + "%"))
        );

    logWrite( "ルート1 日陰率: " + Math.floor(treeShadowMeter * treeCount[i] * 100 / gMap.routeInfo[i].dist.value) + "%");
    }
}

///////////////////////////////////////////////////////////
// fuction : dispProcessing/Calculating
// param :
// return :
// note :  処理中ポップアップ表示
///////////////////////////////////////////////////////////
function dispProcessing() {
    $("#processing").show();
}
function dispCalculating() {
    $("#calculating").show();
}

///////////////////////////////////////////////////////////
// fuction : dispProcessing/Calculating
// param :
// return :
// note :  処理中ポップアップ表示
///////////////////////////////////////////////////////////
function removeProcessing() {
	$("#processing").hide();
}
function removeCalculating() {
    $("#calculating").hide();
}

///////////////////////////////////////////////////////////
// fuction : calcHikageRitsu
// param :
// return :
// note : 現在地から目的地までの日陰率を算出
//        HTMLのid=place から目的地を取得
///////////////////////////////////////////////////////////
function calcHikageRitsu() {
    dispCalculating();

    var cbGetShokusai = function() {
        if ( gShizuMichi.staus.shokusaiOK ) {
            treeCount();        // 日陰率を算出する
/***
// ymiyma 20160925 植栽データ取得は起動時に静的なjsonファイルで全領域分を取得し、ヒートマップレイヤーを作成するように修正した
//            gMap.showHeatmap( gShizuMichi.shokusaiLocate );
***/
            removeCalculating();
        }
    };

    // ルート探索完了時のコールバック
    var cbGetCalcRoute = function() {
        gShizuMichi.getShokusaiData( gMap.curRegion.latNE, gMap.curRegion.lngNE, gMap.curRegion.latSW, gMap.curRegion.lngSW, 100, 1, null, cbGetShokusai );
        var timerId = setInterval( function() {
            if ( gShizuMichi.staus.shokusaiOK == 1 ) {
                clearInterval(timerId);
            }
        }, 1000 );
    }

    // 現在地取得時のコールバック
    var cbGetCurrentLocate = function(lat,lng) {
        gMap.setCenter(lat,lng);

        // ルート探索開始
        var place = $("#place").val();
        gMap.calcRoutebyName( place, cbGetCalcRoute );
    }
    gMap.getCurrentLocation( cbGetCurrentLocate ); // 現在地取得
}

///////////////////////////////////////////////////////////
// fuction : postHikagePoint
// param :
// return :
// note : 日陰ポイントをPostする
///////////////////////////////////////////////////////////
function postHikagePoint() {
// 現在地取得時のコールバック
    var cbGetCurrentLocate = function(lat,lng) {
        gMap.setCenter(lat,lng);
        gMap.addMarker( 0, lat, lng, "", "", "", "", "6DF79C", null);

        $.ajax({
            type: "POST",
            url: "assets/php/kuchikomi_post.php",
            data: {
                "lat" : lat,
                "lng" : lng
            },
            success: function(res) {
                console.log(res);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                alert('Error : ' + errorThrown);
            }
        });
    }
    gMap.getCurrentLocation( cbGetCurrentLocate ); // 現在地取得
}

///////////////////////////////////////////////////////////
// fuction : escape_html
// param :
// return :
// note : escape文字変換
///////////////////////////////////////////////////////////
function escape_html (string) {
  if(typeof string !== 'string') {
    return string;
  }
  return string.replace(/[&'`"<>]/g, function(match) {
    return {
      '&': '%26',
      "'": '%27',
      '`': '%60',
      '"': '%22',
      '<': '%3C',
      '>': '%3E',
    }[match]
  });
}
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
// functions for debugging
function logWrite(text) {
    console.log(text);
/**/log.appendChild( document.createTextNode(text));
/**/log.appendChild(document.createElement("br"))
}
