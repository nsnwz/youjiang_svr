/**
 * Created by dengze on 8/9/15.
 */

var https = require("https");
//var https = require("http");
var port = 443;
var Q = require("q");

var hosts = ["apibj.beecloud.cn",
            "apisz.beecloud.cn",
            "apiqd.beecloud.cn",
            "apihz.beecloud.cn"];

var BCErrMsg = {
    NEED_PARAM:"需要字段"
}

var postFactory = function(path, paramCheck) {
    return function(params, timeout) {
        if (typeof(paramCheck) == "function") {
            //will throw error
            paramCheck(params);
        }

        var seed = Math.floor(Math.random()*hosts.length);
        var deferred = Q.defer();
        var postData = JSON.stringify(params);
        var options = {
            hostname: hosts[seed],
            port: port,
            path: path,
            method: 'POST',
            headers: {
                'content-type': 'application/json;charset=utf-8',
                'content-length' : Buffer.byteLength(postData, 'utf8')
            },

        };

        var timer = setTimeout(function(){
            deferred.reject("request time out");
        }, !timeout ? 30000 : timeout);
        var req = https.request(options, function(res) {
            res.on('data', function(data) {
                clearTimeout(timer);
                deferred.resolve(data);
            });
        });
        req.on('error', function(e) {
            clearTimeout(timer);
            deferred.reject(e);
        });
        req.end(postData);

        return deferred.promise;
    };
};

var getFactory = function(path, paramCheck) {
    return function(params, timeout) {
        if (typeof(paramCheck) == "function") {
            //will throw error
            paramCheck(params);
        }

        var seed = Math.floor(Math.random()*hosts.length);
        var deferred = Q.defer();

        var getData = JSON.stringify(params);
        var options = {
            hostname: hosts[seed],
            port: port,
            path: path + "?para=" + encodeURIComponent(getData),
            method: 'GET'
        };

        var timer = setTimeout(function(){
            deferred.reject("request time out");
        }, !timeout ? 30000 : timeout);

        var req = https.request(options, function(res) {
            res.on('data', function(data) {
                clearTimeout(timer);
                deferred.resolve(data);
            });
        });
        req.on('error', function(e) {
            clearTimeout(timer);
            deferred.reject(e);
        });
        req.end();

        return deferred.promise;
    };
}

var commParamCheck = function(data) {
    if (!data["app_id"]) {
        throw new Error(BCErrMsg.NEED_PARAM + "app_id");
    }

    if (!data["timestamp"]) {
        throw new Error(BCErrMsg.NEED_PARAM + "timestamp");
    }

    if (!data["app_sign"]) {
        throw new Error(BCErrMsg.NEED_PARAM + "app_sign");
    }
}
module.exports = {
    bill : postFactory('/1/rest/bill', function(data) {
        commParamCheck(data);
        switch (data["channel"]) {
            case "ALI":
            case "ALI_WEB":
            case "ALI_WAP":
            case "ALI_QRCODE":
            case "ALI_APP":
            case "ALI_OFFLINE_QRCODE":
            case "UN":
            case "UN_WEB":
            case "UN_APP":
            case "WX":
            case "WX_APP":
            case "WX_JSAPI":
            case "WX_NATIVE":
                break;
            default:
                throw new Error(BCErrMsg.NEED_PARAM + "channel");
                break;
        }
    }),
    refund : postFactory('/1/rest/refund', function(data) {
        commParamCheck(data);
        if (!data["refund_no"]) {
            throw new Error(BCErrMsg.NEED_PARAM + "refund_no");
        }
    }),
    transfers: postFactory('/1/rest/transfers', null),
    bills : getFactory('/1/rest/bills', commParamCheck),
    refunds: getFactory('/1/rest/refunds', commParamCheck),
    refundStatus: getFactory('/1/rest/refund/status', function(data) {
        commParamCheck(data);
        if (!data["refund_no"]) {
            throw new Error(BCErrMsg.NEED_PARAM + "refund_no");
        }
    })
};

