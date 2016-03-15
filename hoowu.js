/**
 * Created by miller on 2016/1/25.
 */

var querystring = require('querystring');
var url = require('url');
var http = require('http');
var https = require('https');
var util = require('util');
var crypto = require('crypto');
var utils = require('./utils');

var appid = " 8u5vbpxj";
var appKey = "9y0i90dfxrh5du4ykv5namehaz3zuccm";

var hoowu = module.exports;

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
    obj.sign = createSign(obj, appKey);
    var urlstr = 'http://dev.api.web.51h5.com/auth/token';
    post(urlstr, obj, callback);
};

function getUserInfo(token, callback) {
    var obj = {
        appid : appid,
        token : token
    };
    obj.sign = createSign(obj, appKey);
    var urlstr = 'http://dev.api.web.51h5.com/auth/info';
    post(urlstr, obj, callback);
};

hoowu.getUserInfo = function(code, callback) {
    var token_result = undefined;
    getUserToken(code, function(result) {
        token_result = JSON.parse(result);
        getUserInfo(token_result.access_token, function(result) {
            result = JSON.parse(result);
            callback(err, result, token_result)
        })
    });
};

hoowu.createOrder = function(total_fee, token, callback) {
    var obj = {
        appid : appid,
        token : token,
        total_fee : total_fee,
        subject : '晶钻',
        body : '充值所得'
    };
    obj.sign = createSign(obj, appKey);
    var urlstr = 'http://dev.api.web.51h5.com/pay/order';
    post(urlstr, obj, callback);
};


hoowu.refreshToken = function(p) {
    var obj = {
        appid : appid,
        refresh : refresh_token
    };
    obj.sign = createSign(obj, appKey);
    var urlstr = 'http://dev.api.web.51h5.com/pay/order';
    post(urlstr, obj, function(result) {
        result = JSON.parse(result);
        p.accessToken = result.accessToken;
        p.refresh_token = result.refresh_token;
        p.expire_in = result.expire_in;
        p.refreshTime = utils.getSecond();
    });
};