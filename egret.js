/**
 * Created by miller on 2016/1/9.
 */

var querystring = require('querystring');
var url = require('url');
var http = require('http');
var https = require('https');
var util = require('util');
var crypto = require('crypto');
var utils = require('./utils');

var appId = "89846";
var appKey = "9gK85qgWqpwuKfMaLna6P"

var egret = module.exports;

function createSign(param, appkey) {
    var array = new Array();
    for (var key in param) {
        array.push(key);
    }
    array.sort();
    var str = "";
    for (var index in array) {
        var key = array[index];
        str += (key + "=" + param[key]);
    }
    str += appkey;
    console.log('create sign str...', str);
    var hasher = crypto.createHash("md5");
    hasher.update(str);
    return hasher.digest("hex");
};

var post = function(urlstr, obj, callback) {
    var contentStr = JSON.stringify(obj);
    var contentLen = Buffer.byteLength(contentStr, 'utf8');
    var urlData = url.parse(urlstr);

    //HTTP请求选项
    var opt = {
        hostname: urlData.hostname,
        path: urlData.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
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
            //console.log(JSON.parse(dataStr));
            console.log('content ' + wholeData);
            callback(dataStr);
        });
    }).on('error', function(err) {
        console.log('error ' + err);
    });

    console.log('write str ', contentStr, contentLen);
    req.write(contentStr);
    req.end();
};

egret.getUserInfo = function(token, callback) {
    var obj = {
        token : token,
        time : utils.getSecond(),
        appId : appId
    };
    obj.sign = createSign(obj, appKey);
    var urlstr = 'http://api.egret-labs.org/v2/user/getInfo';
    post(urlstr, obj, callback);
    console.log('obj ...', obj);
};
/*
egret.getUserInfo("58990123456767", function(str) {
    console.log('str ..', str);
});
    */