
/**
class : shizuMichiCtrl
しずみちAPIを制御するためのクラス

Author : ymiya
*/
function shizuMichiCtrl(element) {
    this.element = element;             // 現在未使用
    this.shokusaiLocate = [];           // 植栽データ
    this.staus = {
                    shokusaiOK : -1     // 植栽データ取得完了
                 };
}
///////////////////////////////////////////////////////////
// fuction : getShokusaiData
// param :  northlat  :描画領域北端
//          westlng   :西端
//          sounthlat :南端
//          eastlng   :東端
//          row       :ページ毎のデータ取得数(最大100)
//          page      :ページ番号
//          parent    :植栽データを取得する際、Ajaxで非同期でアクセスする。
//                     取得データ数が複数ページにおよぶ場合は、ページ毎に再帰的にこのコールする仕様としている。
//                     再帰的にコールされた時のため、ここに呼び出し時のオブジェクトを指定する。
//          callback  :データ取得時のコールバック
// return :
// note :  植栽データを取得する際、Ajaxで非同期でアクセスする。
//         取得データ数が複数ページにおよぶ場合は、ページ毎に再帰的にこのコールする仕様としている。
///////////////////////////////////////////////////////////
shizuMichiCtrl.prototype.getShokusaiData = function(northlat, westlng, sounthlat, eastlng, row, page, parent, callback) {
    if ( parent ) {
        shizuMichiCtrlObj = parent;
    } else {
        if ( this.staus.shokusaiOK == 0 ) {
            return;     // 検索中の場合は何もせずにreturn
        }
        shizuMichiCtrlObj = this;
        this.staus.shokusaiOK = 0;
        this.shokusaiLocate = [];
    }

    // ページ、ページ毎取得データ数
    if (!row) { row = 100; }
    if (!page) { page = 1 }

    // AjaxでしずみちAPIにアクセス
     var url = "https://openapi.city.shizuoka.jp/opendataapi/servicepoint/Shokusai_Pnt?extent="+ northlat +"," + westlng + "," + sounthlat + "," + eastlng + "&page=" + page + "&row=" + row;

    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(res) {
            for ( var i = 0;(i < res.PageRecord) && ( i + (page - 1) * row < res.TotalRecord); i++ ) {
                shizuMichiCtrlObj.shokusaiLocate[ i + (page-1) * row ] = { id:res.Data.features[i].properties.ogr_fid, coordinate:res.Data.features[i].geometry.coordinates };
            }

            if ( page < res.TotalPage ) {
                // 取得データが複数ページにおよぶ場合は、再帰的にコールする
                shizuMichiCtrlObj.getShokusaiData(northlat, westlng, sounthlat, eastlng, row, page + 1, shizuMichiCtrlObj, callback);
            } else {
                // 最終ページに取得した場合、完了。
                shizuMichiCtrlObj.staus.shokusaiOK = 1;
                callback();
            }
        }
	});
}
