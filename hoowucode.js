/**
 * Created by miller on 2016/4/3.
 */
var log = require('./log.js').helper;
var utils = require('./utils.js');


var exp = module.exports;

var codes = {};

exp.setTokenAndUserInfo = function(code, token, userInfo) {
    codes[code] = {};
    codes[code].token = token;
    codes[code].userInfo = userInfo;
};

exp.getToken = function(code) {
    return codes[code].token;
};

exp.getUserInfo = function(code) {
    return codes[code].userInfo;
}

exp.delCode = function(code) {
    delete codes[code];
};