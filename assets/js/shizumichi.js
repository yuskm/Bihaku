function shizuMichiCtrl(element) {
    this.element = element;
    this.shokusaiLocate = [];
    this.staus = { shokusaiOK : 0 };
}

shizuMichiCtrl.prototype.getShokusaiData = function(northlat, westlng, sounthlat, eastlng, row, page, parent ) {
    if ( parent ) {
        shizuMichiCtrlObj = parent;
    } else {
        shizuMichiCtrlObj = this;
        this.staus.shokusaiOK = 0;
    }

    if (!row) { row = 100; }
    if (!page) { page = 1 }

    var url = "https://openapi.city.shizuoka.jp/opendataapi/servicepoint/Shokusai_Pnt?extent="+ northlat +"," + westlng + "," + sounthlat + "," + eastlng + "&page=" + page + "&row=" + row;

    $.ajax({
        type: "GET",
        url: url,
        dataType: "json",
        success: function(res) {
            for ( var i = 0;(i < res.PageRecord) && ( i + (page - 1) * row < res.TotalRecord); i++ ) {
                shizuMichiCtrlObj.shokusaiLocate[ i + (page-1) * row ] = { id:res.Data.features[i].id, coordinate:res.Data.features[i].geometry.coordinates };
            }

            if ( page < res.TotalPage ) {
                shizuMichiCtrlObj.getShokusaiData(northlat, westlng, sounthlat, eastlng, row, page + 1, shizuMichiCtrlObj);
            } else {
                shizuMichiCtrlObj.staus.shokusaiOK = 1;
            }
        }
	});
}
