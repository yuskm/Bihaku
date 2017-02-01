
function resasCtrl(element) {
    this.element = element;
    this.kanokoChi = [];
    this.status = {  kankoChiOK : 0,
                    reciveCount : 0 // 20170201 ymiyama 他に良い手段ないものか・・・
    };
}

resasCtrl.prototype.getKankochi = function() {
    var resasCtrlObj = this;
    var deferred = new $.Deferred();

    this.status.kankoChiOK = 0;
    this.status.reciveCount = 0;
    this.kanokoChi =[];

    var shizuokaCityCode = [22100,22101,22102,20103];

    for ( var i = 0; i < shizuokaCityCode.length; i++ ) {

        $.ajax({
            type: "GET",
            url: escape_html("ajax_resas.php?url=https://opendata.resas-portal.go.jp/api/v1/tourism/attractions?prefCode=22&cityCode="+shizuokaCityCode[i]),
            dataType: "json",
            success: function(res) {
                resasCtrlObj.status.reciveCount++;
                if ( res.result ) {
                    for ( var j = 0; j < res.result.data.length; j++ ) {
                        resasCtrlObj.kanokoChi[resasCtrlObj.kanokoChi.length]
                        = {name : res.result.data[j].resourceName,
                           lat : res.result.data[j].lat,
                           lng : res.result.data[j].lng};
                    }
                }

                if (resasCtrlObj.status.reciveCount== shizuokaCityCode.length) {
                    resasCtrlObj.status.kankoChiOK = 1;
                    deferred.resolve();
                }
                if (resasCtrlObj.status.reciveCount > shizuokaCityCode.length){
                    console.error("resas data overflow");
                }
            },
            error: function(response){
                return response;
            }
        });
    }
    return deferred;
}
