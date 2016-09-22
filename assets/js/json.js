/**
class : jsonCtrl
json制御クラス

Author : ymiya
*/
///////////////////////////////////////////////////////////
// fuction : jsonCtrl
// param :
// return :
// note :  コンストラクタ
///////////////////////////////////////////////////////////
function jsonCtrl(element) {
    this.element = element;
}

///////////////////////////////////////////////////////////
// fuction : readJsonFile
// param :
// return :
// note :  コンストラクタ
///////////////////////////////////////////////////////////
jsonCtrl.prototype.readJsonFile = function(filepath, callback) {

    var jsonCtrlObj = this;

    $.ajax({
        type: "GET",
        url: filepath,
        dataType: "json",
        success: function(res) {
            callback(res);
        }
    });
};
