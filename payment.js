/**
 * Created by miller on 2015/10/26.
 */

var md5 = require('md5');
var api = require('beecloud-node-dev');
var payConfig = require('./config/payment');

var payment = module.exports;

payment.pay = function(res, req) {
    var app_id = payConfig.appid;
    var app_secret =  payConfig.appsecret;
    var timestamp = new Date().getTime();
    var app_sign = md5(app_id + timestamp + app_secret);
    var data = {
        app_id : app_id,
        timestamp: timestamp,
        app_sign: app_sign,
        channel: "ALI_WEB",
        total_fee: 1,
        bill_no: "bctest" + timestamp,
        title: "游将网络",
        return_url: "beecloud.cn",
        optional: { myMsg: "none"}
    }
    try {
        var promise = api.bill(data);
        promise.then(function(data) {
            console.log("data: " + data);
        }, function(err) {
            console.log(err);
        })
    } catch (err) {
        process.stdout.write(err.message);
    }
};

