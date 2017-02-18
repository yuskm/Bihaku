
function restCtrl() {
    this.resData;
}

restCtrl.prototype.getData = function(url, dataType, callback) {
    var deferred = new $.Deferred();
    var restCtrlObj = this;
    $.ajax({
        type: "GET",
        url: escape_html(url),
        dataType: (dataType)?dataType:"text",
        success: function(res) {
            restCtrlObj.resData = res;
            if (callback) {
                callback(res);
            }
            deferred.resolve();
        },
        error: function(response){
            return response;
        }
    });
    return deferred;
}
