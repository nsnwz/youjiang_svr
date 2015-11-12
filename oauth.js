/**
 * Created by miller on 2015/10/26.
 */

var async = require('async');
var oauth = require('wechat-oauth');
var oauthConfig = require('./config/oauth');

var client = new oauth(oauthConfig.appid, oauthConfig.secret);

var weiXin = module.exports;

//http://www.jingwentian.com/t-292 微信授权参考实例

weiXin.getAuthorizeURL = function(res, req) {
    var url = client.getAuthorizeURL('http://wx.1766.com/weixin/userinfo', 'state', 'snsapi_userinfo');
    req.setHeader("Access-Control-Allow-Origin", "*");
    req.send(JSON.stringify({dress:url}));
};

weiXin.getWeiXinUserInfo = function(res, req) {
    var accessToken;
    var openid;
    async.waterfall([
        function(cb) {
            client.getAccessToken(res.query.code, function(err, result) {
                accessToken = result.data.access_token;
                openid = result.data.openid;
                console.log("accessToken " + accessToken);
                console.log("openid " + openid);
                cb(null);
            });
        }, function(cb) {
            client.getUser(openid, function(err, res) {
                var userInfo = res;
                req.send(userInfo);
                console.log(userInfo);
            })
        }
    ], function(err, res) {
            console.log('get weinxin userinfo error');
    });
};