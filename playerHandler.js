/**
 * Created by miller on 2015/10/22.
 */
require('module-unique').init();
var playerSystem = require('./playerSystem');
var playerModel = require('./player');
var redisClient = require('./redisclient');
var async = require('async');

var playerHandler = module.exports;

playerHandler.getPlayerInfo = function(req, res) {
    var openid = req.query.openid;
    console.log(req.query.openid);
    var player = playerSystem.getPlayer(req.query.openid);
    if (player != null) {
        console.log('found player: ', req.query.openid);
    } else {
        async.waterfall([
            function(db) {
                redisClient.getKey(req.query.openid, function(err, redis) {
                    if (redis != null) {
                        var p = new playerModel();
                        p.initFromDB(JSON.parse(redis));
                        playerSystem.addPlayer(p);
                        res.end(JSON.stringify({ret:0, nickname: p.nickname, sex: p.sex, language: p.language, city: p.city, province: p.province, country: p.country, headimgurl: p.headimgurl}));
                        console.log('get redis: ', redis);
                        console.log(p);
                    } else {
                        res.end(JSON.stringify({ret:1}));
                    }
                })
            }
        ], function(err, res) {
            if (err != null) {
                console.log('get redis error');
            }
        });
     }
};


playerHandler.addItem = function(req, res) {
    console.log("add item");
    var p = new playerModel();
    p.addItem(1000, 1);
    return true;
    var player = playerSystem.getPlayer(req.query.openid);
    if (player != null) {
        player.addItem(1000, 1);
    }
};