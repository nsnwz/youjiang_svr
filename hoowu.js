/**
 * Created by miller on 2016/1/25.
 */

var querystring = require('querystring');
var url = require('url');
var http = require('http');
var crypto = require('crypto');
var utils = require('./utils');
var buffer = require("buffer").Buffer;

var appid = "8u5vbpxj";
var appKey = "9y0i90dfxrh5du4ykv5namehaz3zuccm";

var hoowu = module.exports;

function geneSign(params, secret){
    var stingA = "";

    for (var key of Object.keys(params).sort()) {
        if (!!!params[key] || key === 'sign') {
            continue;
        }
        if (!!!stingA.length) {
            stingA = key + "=" + params[key];
        }
        else {
            stingA += ("&" + key + "=" + params[key]);
        }
    }
    var strTemp = stingA + secret;
    var buf = new Buffer(strTemp);
//􀗛􁦤􀿥􀨁md5􀓞􁛘
    strTemp = buf.toString("binary");
    return crypto.createHash('md5').update(strTemp).digest(
        'hex');
};


function createSign(param, appkey) {
    var array = new Array();
    for (var key in param) {
        array.push(key);
    }
    array.sort();
    var str = "";
    for (var index in array) {
        var key = array[index];
        str += key + "=" + param[key];
    }
    str += appkey;
    console.log('create sign str...', str);
    var hasher = crypto.createHash("md5");
    hasher.update(str);
    return hasher.digest("hex");
};

var post = function(urlstr, obj, callback) {
    var contentStr = querystring.stringify(obj);


    var contentLen = Buffer.byteLength(contentStr, 'utf8');
    var urlData = url.parse(urlstr);

    //HTTP请求选项
    var opt = {
        hostname: urlData.hostname,
        path: urlData.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': contentLen
        }
    };

//处理事件回调
    var req = http.request(opt, function(httpRes) {
        var buffers = [];
        httpRes.on('data', function(chunk) {
            buffers.push(chunk);
        });

        httpRes.on('end', function(chunk) {
            var wholeData = Buffer.concat(buffers);
            var dataStr = wholeData.toString('utf8');
            callback(dataStr);
        });
    }).on('error', function(err) {
        console.log('error ' + err);
    });
    req.write(contentStr);
    req.end();
};


function getUserToken(code, callback) {
    var obj = {
        appid : appid,
        code : code
    };
    obj.sign = geneSign(obj, appKey);
    var urlstr = 'http://dev.api.web.51h5.com/auth/token';
    post(urlstr, obj, callback);
};

function getUserInfo_ex(token, callback) {
    var obj = {
        appid : appid,
        token : token
    };
    obj.sign = geneSign(obj, appKey);
    var urlstr = 'http://dev.api.web.51h5.com/auth/info';
    post(urlstr, obj, callback);
};

hoowu.getUserInfo = function(code, callback) {
    var token_result = undefined;
    getUserToken(code, function(result) {
        token_result = JSON.parse(result);
        getUserInfo_ex(token_result.data.access_token, function(result) {
            result = JSON.parse(result);
            callback(null, result, token_result)
        })
    });
};

hoowu.createOrder = function(total_fee, token, svrID, callback) {
    var subject = { 5 :   "500晶石",
                    10  :  "1000晶石(返利20%)",
                    50 :  "5000晶石(返利25%)礼包",
                    100 :  "1万晶石(返利30%)大礼包",
                    1000 :  "10万晶石(返利40%)超级礼包"
    };

    var obj = {
        appid : appid,
        token : token,
        total_fee : total_fee,
        subject : subject[total_fee],
        body :" "
    };
    obj.sign = geneSign(obj, appKey);

    var urlstr = 'http://dev.api.web.51h5.com/pay/order';
    post(urlstr, obj, callback);
};


hoowu.refreshToken = function(p) {
    var obj = {
        appid : appid,
        refresh : p.refresh_token
    };
    obj.sign = geneSign(obj, appKey);
    var urlstr = 'http://dev.api.web.51h5.com/auth/refresh';
    post(urlstr, obj, function(result) {
        result = JSON.parse(result);
        p.initHoowuToken(result);
    });
};