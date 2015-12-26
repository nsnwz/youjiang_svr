/**
 * Created by miller on 2015/10/22.
 */
require('module-unique').init();
var playerSystem = require('./playerSystem');
var playerModel = require('./player');
var redisClient = require('./redisclient');
var async = require('async');
var fightModel = require('./fight');
var fightSystem = require('./fightSystem');
var code = require("./code");

var playerHandler = module.exports;

playerHandler.getPlayerInfo = function(req, res) {
    var openid = req.query.openid;
    console.log(req.query.openid);
    var p = playerSystem.getPlayer(req.query.openid);
    if (p != null) {
        console.log('found player: ', req.query.openid);
    } else {
        async.waterfall([
            function(cb) {
                redisClient.getKey(req.query.openid, cb);
            }, function(redis, cb) {
                if (res != null) {
                    p = new playerModel();
                    p.initFromDB(JSON.parse(redis));
                    playerSystem.addPlayer(p);
                    res.header("Access-Control-Allow-Origin", "*");
                    res.end(JSON.stringify({ret:0, nickname: p.nickname, sex: p.sex, language: p.language, city: p.city, province: p.province, country: p.country, headimgurl: p.headimgurl}));
                    console.log('get redis: ', redis);
                    console.log(p);
                    redisClient.hget(1000 + code.GAME_NAME, "item", cb);
                }
            }, function(redis, cb) {
                if (redis != null) {
                    p.initItem(JSON.parse(redis));
                    console.log(p.bag);
                    redisClient.hget(1000 + code.GAME_NAME, "fields", cb);
                 }
            }, function(redis, cb) {
                p.initFields(JSON.parse(redis));
                console.log(p.fields);
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
    p.addItem(1001, 1);
    return true;
    var player = playerSystem.getPlayer(req.query.openid);
    if (player != null) {
        player.addItem(1000, 1);
    }
};

playerHandler.putSeed = function(req, res) {
    console.log("put seed");
    var p = new playerModel();
    p.putSeed(10, 1);
    return true;
    var player = playerSystem.getPlayer(req.query.openid);
    if (player != null) {
        player.addItem(1000, 1);
    }
    console.log("put seed");
};

playerHandler.harvestSeed = function(req, res) {

};

playerHandler.getRank = function(req, res) {

};

playerHandler.accelerateGrow = function(req, res) {
    console.log("add item");
    var p = new playerModel();
   // p.addItem(1000, 1);
    p.putSeed(10, 1);
    return true;
    var player = playerSystem.getPlayer(req.query.openid);
    if (player != null) {
        player.addItem(1000, 1);
    }
};

playerHandler.enterFight = function(req, res) {
    var p1 = new playerModel();
    var p2 = new playerModel();
    var fight = new fightModel(p1,  p2);
    p1.fightID = fight.getID();
    p2.fightID = fight.getID();
    fightSystem.addFight(fight);
    console.log("create fight " + p1.fightID);
};


playerHandler.fight = function(req, res) {

};

