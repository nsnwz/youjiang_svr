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
var dataapi = require('./dataapi');


var playerHandler = module.exports;

playerHandler.addPlayer = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    redisClient.incr("guid", function(err, redis) {
        p = new playerModel();
        p.id = redis + 5000;
        p.name = params.name;
        p.pic = "1234";
        p.saveBaseinfo();
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK,  cmdParams : JSON.stringify({uid : p.id, name : p.name, pic : p.pic })}));
    });
};

playerHandler.getPlayerInfo = function(req, res) {
    var id = req.body.uid;
    console.log(req.body.uid);
    var p = playerSystem.getPlayer(req.body.uid);
    if (p != null) {
        console.log('found player: ', req.body.uid);
        res.end(p.getLoginJson());
        return;
    } else {
        async.waterfall([
            function(cb) {
                redisClient.getKey(req.body.uid, cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p = new playerModel();
                    p.initFromDB(JSON.parse(redis));
                    playerSystem.addPlayer(p);
                    console.log('get redis: ', redis);
                    console.log(p);
                    redisClient.hget(p.id + code.GAME_NAME, "item", cb);
                } else {
                    res.end(JSON.stringify({cmdID: req.body.cmdID, ret:code.NOT_FIND_PALYER_ERROR}));
                    return;
                }
            }, function(redis, cb) {
                if (redis != null) {
                    p.initItem(JSON.parse(redis));
                    console.log(p.bag);
                }
                redisClient.hget(p.id + code.GAME_NAME, "fields", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p.initFields(JSON.parse(redis));
                    console.log(p.fields);
                }
                redisClient.hget(p.id + code.GAME_NAME, "attribute", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p.initAttribute(JSON.parse((redis)));
                    console.log(p.attribute);
                }
                res.end(JSON.stringify({cmdID : req.body.cmdID, ret : 0, cmdParams : p.getLoginJson()}));
            }
        ], function(err, res) {
            if (err != null) {
                console.log('get redis error');
            }
        });
     }
};


playerHandler.addItem = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        p.sendError(req, res, code.NOT_FIND_PALYER_ERROR);
        return;
    }
    for (var key in params) {
        if (!dataapi.seed.findById(parseInt(key))) {
            console.log(params.itemID, " not exist");
            p.sendError(req, res, code.ITEM_ERROR.NOT_EXIST_ITEM);
            return;
        }
        p.addItem(parseInt(key), params.count);
    }
    res.end(JSON.stringify({cmdID:req.body.cmdID, ret:code.OK}));
};

playerHandler.plant = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        p.sendError(req, res, code.NOT_FIND_PALYER_ERROR);
        return;
    }
    for (var key in params) {
        if (!p.checkCanPlant(parseInt(key))) {
            p.sendError(req, res, code.NOT_FIND_PALYER_ERROR);
            return;
        }
        if (p.getItemAmount[params[key]] < 0) {
            p.sendError(req, res, code.NOT_FIND_PALYER_ERROR);
            return;
        }
    }

    for (var key in params) {
        p.reduceItem(params[key], 1);
        p.fields[parseInt(key)] = {itemID:params[key], startTime:new Date().getSeconds(), growpValue:0};
    }
    p.saveFields();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK,  cmdParams : JSON.stringify(p.fields)}));
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

