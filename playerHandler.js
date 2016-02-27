/**
 * Created by miller on 2015/10/22.
 */
require('module-unique').init();
var playerSystem = require('./playerSystem');
var playerModel = require('./player');
var redisClient = require('./redisclient');
var async = require('async');
var code = require("./code");
var dataapi = require('./dataapi');
var item = require('./item');
var calc = require('./calc');
var skill = require('./skill');
var shopList = require('./shopList');
var event = require('./event');
var task = require('./task');
var egret = require('./egret');
var utils = require('./utils');
var log = require('./log.js').helper;
var querystring = require('querystring');

var playerHandler = module.exports;

playerHandler.addPlayer = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    redisClient.incr("guid", function(err, redis) {
        p = new playerModel();
        p.id = redis + 5000;
        p.name = params.name;
        p.pic = "1234";
        p.saveBaseinfo();
        p.attribute.coins = 0;
        p.attribute.totalCoins = p.attribute.coins;
        p.attribute.diamonds = 200;
        p.attribute.onlineUpdateTime = utils.getSecond();
        p.fields[3] = {itemID:10003, startTime:utils.getSecond(), growth:item.getSeedTotalValue(10003), updateTime : 0};
        p.fields[4] = {itemID:20003, startTime:utils.getSecond(), growth:item.getSeedTotalValue(20003), updateTime : 0};
        p.fields[5] = {itemID:30003, startTime:utils.getSecond(), growth:item.getSeedTotalValue(30003), updateTime : 0};
        p.fields[6] = {itemID:40003, startTime:utils.getSecond(), growth:item.getSeedTotalValue(40003), updateTime : 0};
        p.addItem(10002, 6);
        p.addItem(20002, 6);
        p.addItem(30002, 6);
        p.addItem(40002, 6);
        p.saveItem();
        p.saveAttribute();
        p.saveFields();
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK,  cmdParams : JSON.stringify({uid : p.id, name : p.name, pic : p.pic })}));
    });
};

playerHandler.getPlayerInfo = function(req, res) {
    var id = req.body.uid;
    console.log(req.body.uid);
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (p != null) {
        delete  p;
        /*
        log.writeDebug(p.id + "|" + 'get player info');
        p.dealSeedOffline();
        p.dealofflineCoins();
        p.dealDayValue();
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : 0, cmdParams : p.getLoginJson()}));
        return;
        */
    }// else {
        var egretPlayer = null;
        async.waterfall([
            function(cb) {
                egret.getUserInfo(req.body.token, function(str) {
                    cb(null, str);
                });
            },
            function(egret, cb) {
                egret = JSON.parse(egret);
                if (egret.code) {
                    res.end(JSON.stringify({cmdID: req.body.cmdID, ret : egret.code}));
                    return;
                }
                egretPlayer = egret.data;
                log.writeDebug(egretPlayer);
                redisClient.getKey(egretPlayer.id, cb);
            },function(redis, cb) {
                if (redis == null) {
                    redisClient.incr("guid", function(err, redis) {
                        var newUid = redis + 5000;
                        p = new playerModel();
                        p.register(egretPlayer, newUid);
                        playerSystem.addPlayer(p);
                        p.dealSeedOffline();
                        p.dealofflineCoins();
                        p.dealDayValue();
                        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams: JSON.stringify(p.getLoginJson())}));
                        return;
                    });
                } else {
                    p = new playerModel();
                    p.initFromDB(JSON.parse(redis));
                    log.writeDebug('got redis');
                    log.writeDebug(JSON.parse(redis));
                    if (!!playerSystem.getPlayer(p.id)) {
                        playerSystem.removePlayer(p.id);
                    }
                    playerSystem.addPlayer(p);
                    console.log('get redis: ', redis);
                    console.log(p);
                    redisClient.hget(p.id + code.GAME_NAME, "item", cb);
                }
            },function(redis, cb) {
                if (redis != null) {
                    p.initItem(JSON.parse(redis));
                }
                redisClient.hget(p.id + code.GAME_NAME, "fields", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p.initFields(JSON.parse(redis));
                }
                redisClient.hget(p.id + code.GAME_NAME, "attribute", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p.initAttribute(JSON.parse((redis)));
                    console.log(p.attribute);
                }
                redisClient.hget(p.id + code.GAME_NAME, "task", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p.initTask(JSON.parse(redis));
                }
                redisClient.hget(p.id + code.GAME_NAME, "cliSetData", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p.cliSetData = JSON.parse(redis);
                }
                redisClient.hget(p.id + code.GAME_NAME, "fieldsAttribute", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p.fieldsAttribute = JSON.parse(redis);
                }
                redisClient.hget(p.id + code.GAME_NAME, "skills", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p.skills = JSON.parse(redis);
                }
                redisClient.hget(p.id + code.GAME_NAME, "stealInfo", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p.stealInfo = JSON.parse(redis);
                }
                redisClient.hget(p.id + code.GAME_NAME, "stealMePlayers", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    p.stealMePlayers = JSON.parse(redis);
                }
                redisClient.hget(p.egretId + code.GAME_NAME, "money", cb);
            }, function(redis, cb) {
                if (redis != null) {
                    var num = parseInt(redis);
                    if (!isNaN(num)) {
                        p.charge(num);
                    }
                }
                cb(null);
            }
        ], function(err) {
            if (err != null) {
                log.writeErr(req.body.cmdID + '|' + 'redis err');
            } else {
                log.writeDebug(p.fields);
                p.dealSeedOffline();
                p.dealofflineCoins();
                p.dealDayValue();
                log.writeDebug(p.fields);
                log.writeDebug('login ' + p.id);
                res.end(JSON.stringify({cmdID : req.body.cmdID, ret : 0, cmdParams : p.getLoginJson()}));
                log.writeDebug(p.fields);
            }
        });
     //}
};


playerHandler.buyItem = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in params) {
        if (!dataapi.seed.findById(parseInt(key))) {
            log.writeErr(p.id + '|' + req.body.cmdID + "item error "  + parseInt(key));
            p.sendError(req, res, code.ITEM_ERROR.NOT_EXIST_ITEM);
            return;
        }
        var seed = dataapi.seed.findById(parseInt(key));
        if (seed.moneyType == null || seed.moneyType == 0) {
            if (p.attribute.coins < seed.buy * params[key]) {
                log.writeErr(p.id + '|' + req.body.cmdID + "coins not enough "  + '|' + p.attribute.coins + '|' + seed.buy * params[key]);
                p.sendError(req, res, code.ITEM_ERROR.NOT_ENOUGH_COINS_BUY_ITEM);
                return;
            }
        } else {
            if (p.attribute.diamonds < seed.buy * params[key]) {
                log.writeErr(p.id + '|' + req.body.cmdID + "diamonds not enough "  + '|' + p.attribute.diamonds + '|' + seed.buy * params[key]);
                p.sendError(req, res, code.ITEM_ERROR.DOMAIN_NOT_ENOUGH);
                return;
            }
        }
     }
    var buyItem = {};
    for (var key in params) {
        var seed = dataapi.seed.findById(parseInt(key));
        if (seed.moneyType == null || seed.moneyType == 0) {
            p.reduceCoins(seed.buy * params[key]);
        } else {
            p.reduceDiamonds(seed.buy * params[key]);
        }
        if (item.checkRandSeed(parseInt(key))) {
            for (var count = 0; count < params[key]; count++) {
                var seedRandomID = item.getSeedRandom(parseInt(key));
                if (seedRandomID != 0) {
                    p.addItem(seedRandomID, 1);
                    buyItem[seedRandomID] = buyItem[seedRandomID] == null ? 1 : buyItem[seedRandomID] + 1;
                }
            }
        } else {
            p.addItem(parseInt(key), params[key]);
            seedRandomID = parseInt(key);
            buyItem[parseInt(key)] = buyItem[parseInt(key)] == null ?  params[key] : buyItem[parseInt(key)] + params[key];
        }
    }
    p.saveAttribute();
    p.saveItem();
    res.end(JSON.stringify({cmdID:req.body.cmdID, ret:code.OK, cmdParams : JSON.stringify({attribute : JSON.stringify(p.attribute), buyItem : JSON.stringify(buyItem)})}));
};

playerHandler.getBag = function (req, res) {
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
  res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.bag)}));
};

playerHandler.plant = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in params) {
        if (!p.checkCanPlant(parseInt(key))) {
            p.sendError(req, res, code.PLANT.FIELD_CANNOT_PLANT);
            return;
        }
        if (p.getItemAmount[params[key]] < 1) {
            log.writeErr(p.id + '|' + req.body.cmdID + "item not enough "  + '|' + params[key]);
            p.sendError(req, res, code.ITEM_ERROR.ITEM_NOT_ENOUGH);
            return;
        }
    }

    for (var key in params) {
        p.reduceItem(params[key], 1);
        p.fields[key] = {itemID:params[key], startTime:utils.getSecond(), growth:0, updateTime : utils.getSecond()};
    }
    p.saveFields();
    p.saveItem();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK,  cmdParams : JSON.stringify(p.fields)}));
};

playerHandler.harvest = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in params.fields) {
        if (p.fields.hasOwnProperty(params.fields[key])) {
            var seed = dataapi.seed.findById(p.fields[params.fields[key]].itemID);
            var values = seed.time.split('/');
            var needGrowth = 0;
            for (var idx in values) {
                needGrowth += parseInt(values[idx]);
            }
            if ((p.fields[params.fields[key]].growth) < 20) {
                log.writeErr(p.id + '|' + req.body.cmdID + "growth not enough "  + '|' + p.fields[params.fields[key]].itemID + "|" + needGrowth + '|' + p.fields[params.fields[key]].growth);
		log.writeErr(key + "|" + typeof p.fields[params.fields[key]].growth + "|" + p.fields[params.fields[key]].growth);
                p.sendError(req, res, code.PLANT.NOT_ENOUGH_TO_HARVEST);
                return;
            }
        } else {
            log.writeErr(p.id + '|' + req.body.cmdID + "fields not exist "  + '|' + params.fields[key]);
            p.sendError(req, res, code.PLANT.NOT_HAVE_ITEM_IN_FIELD);
            return;
        }
    }
    for (var key in params.fields) {
        var seed = dataapi.seed.findById(p.fields[params.fields[key]].itemID);
        p.attribute.atk += seed.attack;
        p.attribute.def += seed.defense;
        p.attribute.hp += seed.hp;
        p.addCoins(seed.harvest);
        event.emit('harvest', p, p.fields[params.fields[key]].itemID);
        delete p.fields[params.fields[key]];
    }
    p.saveFields();
    p.saveAttribute();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK,  cmdParams : JSON.stringify({fields : JSON.stringify(p.fields), attribute : JSON.stringify(p.attribute)})}));
};

playerHandler.getRank = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var selfRank = -1;
    async.waterfall([
        function(cb) {
            redisClient.zrevrank(code.GAME_NAME + params.rankName, p.id, cb);
        },function(redis, cb) {
            if (redis != null) {
                selfRank = redis;
            }
            redisClient.zrevrange(code.GAME_NAME + params.rankName, params.startID, params.endID, cb);
        }, function(redis, cb) {
            res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({selfRank : selfRank, fields : JSON.stringify(redis)})}));
            return;
        }
    ], function(err, result) {
        if (err) {
            p.sendError(req, res, code.RANK.RANK_ERROR);
        }
    });
};

playerHandler.addGrowth = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in p.fields) {
        var now = utils.getSecond();
        if (params.addValue > (now - p.fields[key].updateTime) * 30) {
            params.addValue = (now - p.fields[key].updateTime) * 30;
        }
        p.fields[key].growth += params.addValue;
        p.fields[key].updateTime = utils.getSecond();
        if (p.fields[key].growth > item.getSeedTotalValue(p.fields[key].itemID)) {
            p.fields[key].growth = item.getSeedTotalValue(p.fields[key].itemID);
        }
    }
    p.saveFields();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.fields)}));
};

playerHandler.buyAccelerateGrowth = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var num = 0;
    for (var key in params) {
        var elem = dataapi.shopList.findById(key);
        if (!elem) {
            log.writeErr(p.id + '|' + req.body.cmdID + "shop key not exist "  + '|' + key);
            res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.ITEM_ERROR.NOT_EXIST_ITEM}));
            return;
        }
        num += elem.price * params[key];
    }

    if (!p.reduceDiamonds(num)) {
        log.writeErr(p.id + '|' + req.body.cmdID + "diamonds not enough "  + '|' + num);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.ITEM_ERROR.DOMAIN_NOT_ENOUGH}));
        return;
    }
    for (var key in params) {
        if (!!p.fieldsAttribute[key]) {
            if (p.fieldsAttribute[key] < utils.getSecond) {
                p.fieldsAttribute[key] = utils.getSecond() + params[key] * 20;
            } else {
                p.fieldsAttribute[key] += params[key] * 20;
            }
        } else {
            p.fieldsAttribute[key] = utils.getSecond() + params[key] * 20;
        }
    }
    p.saveFieldsAttribute();
    p.saveAttribute();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.fieldsAttribute)}));
};

playerHandler.buyFields = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var elem = dataapi.other.findById('openDiCost');
    var needCoins = elem.val.split('/');
    if (p.attribute.maxFieldNum > needCoins.length) {
        log.writeErr(p.id + '|' + req.body.cmdID + "out max fields "  + '|' + p.attribute.maxFieldNum);
        p.sendError(req, res, code.ITEM_ERROR.HAVE_GOT_MAX_FIELDS);
        return;
    }
    if (!p.reduceCoins(parseInt(needCoins[p.attribute.maxFieldNum - 1]))) {
        log.writeErr(p.id + '|' + req.body.cmdID + "coins not enough "  + '|' + needCoins[p.attribute.maxFieldNum - 1]);
        p.sendError(req, res, code.ITEM_ERROR.NOT_ENOUGH_COINS_BUY_ITEM);
        return;
    }
    p.attribute.maxFieldNum += 1;
    p.saveAttribute();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.attribute)}));
};

playerHandler.upFieldLevel = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var elem = dataapi.other.findById('diUpLevelCost');
    var values = elem.val.split('/');
    if (p.fieldsAttribute.fieldsLevel > values.length) {
        log.writeErr(p.id + '|' + req.body.cmdID + "out max fields level "  + '|' + p.fieldsAttribute.fieldsLevel);
        p.sendError(req, res, code.ITEM_ERROR.HAVE_GOT_MAX_LEVEL);
        return;
    }
    if (!p.reduceDiamonds(parseInt(values[p.fieldsAttribute.fieldsLevel - 1]))) {
        log.writeErr(p.id + '|' + req.body.cmdID + "diamonds not enough "  + '|' + num);
        p.sendError(req, res, code.ITEM_ERROR.DOMAIN_NOT_ENOUGH);
        return;
    }
    p.fieldsAttribute.fieldsLevel++;
    p.saveAttribute();
    p.saveFieldsAttribute();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.fieldsAttribute)}));
};

playerHandler.selectSkill = function (req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    p.setSkillSelected(params.selectedSKillID);
    p.saveSkills();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.skills)}));
};

playerHandler.upSkillLevel = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (!p.checkSkillCanLevelUp(params.skillID)) {
        log.writeErr(p.id + '|' + req.body.cmdID + "skill cannot up "  + '|' + params.skillID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var costNum = item.getSkillLevelUpCost(p.skills[params.skillID].lv);
    if (!p.reduceCoins(costNum)) {
        log.writeErr(p.id + '|' + req.body.cmdID + "skill up coins not enough "  + '|' + costNum);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    p.upSkillLevel(params.skillID);
    p.saveSkills();
    p.saveAttribute();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.skills)}));
};

playerHandler.getServerTime = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var nowTime = utils.getSecond();
    //var addTime = params.totalTime > p.attribute.onlineTime ? p.attribute.onlineTime - params.totaltime : 0;
    /*
    var nowTime = new Date().getTime();
    if (nowTime - p.attribute.onlineUpdateTime < 10) {
        if (addTime > 100) {
            console.log('addTime error!');
        }
        p.attribute.onlineUpdateTime = nowTime;
    } else {
        p.attribute.onlineUpdateTime = nowTime;
    }
    */
    /*
    if (isNaN(params.totalTime)) {
        log.writeErr('totalTime Not number', req.body.uid + '|' + req.body.cmdID + params.totalTime);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.PARAM_NOT_CORRECT}));
        return;
    }
    p.attribute.onlineTime = params.totalTime;
    p.attribute.onlineUpdateTime = nowTime;
    p.saveAttribute();
    */
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({now : nowTime})}));
};

playerHandler.getSeveralPlayersInfo = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var uidsInfo = [];
    async.eachSeries(params.uids,
        function(id, callback) {
            var info = {};
            async.waterfall([
                    /*
                function(callback) {
                    redisClient.getKey(id, function (err, redis) {
                        if (redis != null) {
                            info = JSON.parse(redis);
                            //uidsInfo.push(redis);
                        }
                        callback(null);
                    });
                },*/ function(callback) {
                    redisClient.hget(id + code.GAME_NAME, "attribute", callback);
                }, function(redis, callback) {
                        if (redis != null) {
                            var attribute = JSON.parse(redis);
                            info.coins = attribute.coins;
                            info.totalCoins = attribute.totalCoins;
                            info.starNum = attribute.starNum;
                            info.mood = attribute.mood;
                            info.diamonds = attribute.diamonds;
                            if (utils.getSecond() - attribute.onlineUpdateTime < 20 * 60) {
                                info.online = 1;
                            } else {
                                info.online = 0;
                            }
                            if (!attribute.hasOwnProperty('egretId')) {
                                attribute.egretId = id;
                            }
                            redisClient.getKey(attribute.egretId, callback);
                        } else {
                            callback(null);
                        }
                }, function(redis, callback) {
                        if (redis != null) {
                            redis = JSON.parse(redis);
                            info.egretId = redis.egretId;
                            info.name = redis.name;
                            info.pic = redis.pic;
                            info.id = redis.id;
                            uidsInfo.push(info);
                        }
                        callback(null);
                }], function(err) {
                    if (err) {
                        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.RANK.RANK_ERROR}));
                        return;
                    }
                    callback(null);
                }
            );
        }, function(err) {
            if (err) {
                res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.RANK.RANK_ERROR}));
            } else {
                res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({uids : uidsInfo})}));
            }
        }
    );
};

playerHandler.getRankNearPlayers = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var selfRank = -1;
    if (p.stealInfo.length > 0) {
        redisClient.zrevrank(code.GAME_NAME + params.rankName, p.id, function(err, redis) {
            selfRank = redis;
            res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams: JSON.stringify({fields: JSON.stringify(p.stealInfo), selfRank : selfRank})}));
            return;
        });
    }
    async.waterfall([
        function(cb) {
	    log.writeDebug(code.GAME_NAME + params.rankName + p.id);
            redisClient.zrevrank(code.GAME_NAME + params.rankName, p.id, cb);
        },function(redis, cb) {
            if (redis != null) {
                selfRank = redis;
                var startID = 0;
                var endID = selfRank + 50;
                if (selfRank > 50) {
                    startID = selfRank - 50;
                }
                redisClient.zrevrange(code.GAME_NAME + params.rankName, startID, endID, cb);
            } else {
                redisClient.zcount(code.GAME_NAME + params.rankName, '-inf', '+inf', function(err, redis) {
                    var count = redis;
                    var startID = 0;
                    if (count > 100) {
                        startID = count - 100;
                    }
                    redisClient.zrevrange(code.GAME_NAME + params.rankName, startID, count, cb);
                })
            }
        }, function(redis, cb) {
            var rank = [];
            for (var i = 0; i < redis.length / 2; i++) {
                var ele = [redis[2*i], redis[2*i + 1]];
                if (redis[2 * i] == p.id) {
                    continue;
                }
                rank.push(ele);
            }
            if (rank.length < 10) {
                p.stealInfo = rank;
            } else {
                var idx = [];
                for (var i = 0; i < rank.length; i++) {
                    idx.push(i);
                }
                idx.sort(function() {
                    return Math.random() - 0.5;
                });
                idx.length = 10;
                p.stealInfo = [];
                for (var i = 0; i < idx.length; i++) {
                    p.stealInfo.push(rank[i]);
                }
            }
	
  	        log.writeDebug(p.stealInfo);
            p.saveStealInfo();
            res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams: JSON.stringify({fields: JSON.stringify(p.stealInfo), selfRank:selfRank})}));
        }
    ], function(err, result) {
        if (err) {
            p.sendError(req, res, code.RANK.RANK_ERROR);
        }
    });
};

playerHandler.steal = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (!p.checkStealNum()) {
        log.writeErr(p.id + '|' + req.body.cmdID + "steam num not enough "  + '|' + p.attribute.freeStealNumUsed + '|' + p.attribute.buyStealNumLeft);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.PLANT.NOT_ENOUGH_STEAL_NUM}));
        return;
    }
    if (!p.checkStealID(params.id)) {
        log.writeErr(p.id + '|' + req.body.cmdID + "steam id not in steal "  + '|' + params.id);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.PLANT.ID_NOT_IN_STEAL_RANK}));
        return;
    }
    var nowTime = utils.getSecond();
    var totalNum = 0;
    async.waterfall([
        function(cb) {
            redisClient.hget(params.id + code.GAME_NAME, 'fields', cb);
        }, function(fields, cb) {
            fields = JSON.parse(fields);
            for (var key in fields) {
                if (fields[key].updateTime < nowTime) {
                    fields[key].growth += nowTime - fields[key].updateTime;
                }

                var val = item.getSeedTotalValue(fields[key].itemID);
                if (fields[key].growth >= val) {
                    var coins = item.getSeedCoins(fields[key].itemID);
                    totalNum += coins;
                }
            }
            p.addCoins(parseInt(totalNum * 0.1));
            redisClient.hget(params.id + code.GAME_NAME, 'stealMePlayers', cb);
        }, function(redis, cb) {
            var elem = [p.id, nowTime, parseInt(totalNum * 0.1)];
            var content = undefined;
            if (redis != null) {
                content = JSON.parse(redis);
                for (var i = content.length; i > 9; i--) {
                    content.shift();
                }

            } else {
                content = [];
            }
            content.push(elem);
            redisClient.hset(params.id + code.GAME_NAME, 'stealMePlayers', JSON.stringify(content), null);
            p.reduceStealNum();
            p.saveAttribute();
            p.clearNearPlayersInfo();
            p.stealInfo = [];
            p.saveStealInfo();
            res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams: JSON.stringify({attribute: JSON.stringify(p.attribute)})}));
        }
    ]);
};

playerHandler.getStealMePlayers = function(req, res) {
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    redisClient.hget(p.id + code.GAME_NAME, 'stealMePlayers', function(err, redis) {
        p.stealMePlayers = JSON.parse(redis);
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams: JSON.stringify({stealInfo: redis})}));
    });
};

playerHandler.getPlayerMatureSeed = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var nowTime = utils.getSecond();
    var matureSeed = [];
    async.waterfall([
        function(cb) {
            redisClient.hget(params.id + code.GAME_NAME, 'fields', function(err, fields) {
                cb(err, fields);
            });
        }, function(fields, cb) {
            fields = JSON.parse(fields);
            for (var key in fields) {
                if (fields[key].updateTime < nowTime) {
                    fields[key].growth += nowTime - fields[key].updateTime;
                }
                var val = item.getSeedTotalValue(fields[key].itemID);
                if (fields[key].growth >= val - 100) {
                    matureSeed.push(fields[key].itemID);
                }
                if (matureSeed.length > 5) {
                    break;
                }
            }
            res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams: JSON.stringify({matureSeed: matureSeed})}));
        }
    ]);
};

playerHandler.enterFight = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (!p.reducePower(params.mode)) {
        log.writeErr(p.id + '|' + req.body.cmdID + "power not enough "  + '|' + p.attribute.powerUsed + '|' + p.attribute.buyPowerNum);
        return res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
    }
    if (params.mode > 3) { //mode 1表示pve剧情模式，2表示pve无尽模式， 3表示星球BOSS模式， 800pve引导模式，801PVE随机事件，10PVP战斗模式
        p.fightInfo.mode = params.mode;
        p.fightInfo.id = params.id;
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK}));
        return;
    }
    if (params.mode == 1) {
        var elem = dataapi.storyFight.findById(params.id)
        if (elem == null) {
            log.writeErr(p.id + '|' + req.body.cmdID + "task id not exist "  + '|' + params.id);
            p.sendError(req, res, code.TASK.TASK_NOT_EXIST);
            return;
        }
    } else if (params.mode == 2) {
        var elem = dataapi.bossFight.findById(params.id)
        if (elem == null) {
            log.writeErr(p.id + '|' + req.body.cmdID + "boss task id not exist "  + '|' + params.id);
            p.sendError(req, res, code.TASK.TASK_NOT_EXIST);
            return;
        }
        if (p.attribute.bossFightHp <= 0) {
            log.writeErr(p.id + '|' + req.body.cmdID + "boss hp not enough "  + '|' + params.id);
            p.sendError(req, res, code.FIGHT.BOSS_HP_NOT_ENOUGH);
            return;
        }
    } else if (params.mode == 3) {
        var elem = dataapi.starBossFight.findById(params.id)
        if (elem == null) {
            log.writeErr(p.id + '|' + req.body.cmdID + "star boss id not exist "  + '|' + params.id);
            p.sendError(req, res, code.TASK.TASK_NOT_EXIST);
            return;
        }
        if (p.attribute.starNum + p.attribute.buyStarNum < ele.needStarNum) {
            log.writeErr(p.id + '|' + req.body.cmdID + "star num not enough "  + '|' + params.id + '|' + p.attribute.starNum + '|' + p.attribute.buStarNum);
            p.sendError(req, res, code.FIGHT.BOSS_HP_NOT_ENOUGH);
            return;
        }
    }
    p.fightInfo.mode = params.mode;
    p.fightInfo.id = params.id;
    p.fightInfo.startTime = utils.getSecond();
    if (params.mode == 1) {
        p.fightInfo.playerInitHp = p.fightInfo.posLeftHp = p.hp;
    } else if (params.mode == 2) {
        p.fightInfo.playerInitHp = p.fightInfo.posLeftHp = p.attribute.bossFightHp;
    }
    p.fightInfo.playerInitAtk = p.fightInfo.posLeftAtk = p.atk;
    p.fightInfo.playerInitDef  = p.fightInfo.posLeftDef = p.def;
    p.fightInfo.bossInitHp = p.fightInfo.posRightHp = elem.blood;
    p.fightInfo.bossInitAtk = p.fightInfo.posRightAtk = elem.atk;
    p.fightInfo.bossInitDef = p.fightInfo.posRightDef = elem.defence;
    res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams:JSON.stringify({bossHp : p.attribute.bossFightHp, powerUsed : p.attribute.powerUsed, buyPowerNum : p.attribute.buyPowerNum})}));
};

playerHandler.useSkill = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (params.pos == 1) {//boss使用技能不校验
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK}));
        return;
    } else {
        if (!p.checkCanUseSkill(params.skillID)) {
            res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.SKILL.NOT_RIGHT_USE_SKILL}));
            return;
        }
        p.fightInfo.playerUseSkills[params.skillID] += 1;
        p.reduceSkillUseTimes(params.skillID);
        p.saveSkills();
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK}));
    }
};

/*
    人对BOSS ： 基础伤害 (攻击 - 防御) , 暴击 (攻击 - 防御) * 1.5
    BOSS对人:  基础伤害 (攻击- 防御), 暴击 攻击 * 1.5 - 防御
 */
playerHandler.checkFight = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        log.writeErr('no ol', req.body.uid + '|' + req.body.cmdID);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if ((p.fightInfo.mode > 3 || p.fightInfo.mode == 0) && (p.fightInfo.mode != 800)) {
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK}));
        return;
    }

    /*
    var elem = dataapi.storyFight.findById(p.fightInfo.id);
    var data = JSON.parse(params.data);
    for (var key in data) {
        var type = data[key][0];
        var pos = data[key][1];
        var damage = data[key][2];
        var crit = data[key][3];
        var updateTime = data[key][4];
        console.log('type ', type);
        if (type == 0) { //伤害包
            var descHp = 0;
            if (pos == 0) {//用户受伤
                descHp = calc.monsterToPlayerDamage(p.fightInfo.posRightAtk, p.fightInfo.posLeftDef, crit, p.fightInfo);
            } else if (pos == 1) {// boss受伤
                descHp = calc.playerToMonsterDamage(p.fightInfo.posLeftAtk, p.fightInfo.posRightDef, crit, p.fightInfo);
            }
            if (pos == 0) { //用户伤害
                if (damage < descHp * 0.8) {
                    consoel.log(" fight check error");
                } else {
                    p.fightInfo.posLeftHp -= damage;
                }
            } else { //BOSS伤害
                if (damage > descHp * 1.2) {
                    console.log('fight check error');
                } else {
                    p.fightInfo.posRightHp -= damage;
                }
            }
        } else if (type == 1) {//技能
            if (pos == 0) {//用户使用技能
                skill[damage](pos, p.getSkillLv(damage), p.fightInfo, updateTime);
            } else { //BOSS使用技能
                skill[damage](pos, 1, p.fightInfo, updateTime);
            }

        }
        p.updateFightNoHurt(updateTime);
   }
    var win = 0;
    var nowTime = utils.getSecond();
    if (p.fightInfo.posRightHp < p.fightInfo.bossInitHp * 0.1 && nowTime - p.fightInfo.startTime < 70) {
        console.log('succ');
        win = 1;
    }
    */
    //if (win == params.win) {
    if (params.win) {
        var starNum = item.getStarNum(p, p.fightInfo.id, utils.getSecond() - p.fightInfo.startTime, p.fightInfo.mode);
        if (p.fightInfo.mode == 800) { //新手引导
            starNum = 3;
        } else if (p.fightInfo.mode == 3) {
            starNum = 0;
        }
        p.attribute.starNum += starNum;
        var elem;
        var addCoins = 0;
        var addMi = 0;
        var addItem = 0;
        if (p.fightInfo.mode == 2) { //pve无尽模式
            if (p.attribute.bossFinishTask + 1 == p.fightInfo.id) {
                elem = dataapi.bossFight.findById(p.fightInfo.id);
                p.addCoins(elem.awardCoin);
                p.addItem(elem.awardItem, 1);
                p.addDiamonds(elem.awardMi);
                addCoins = elem.awardCoin;
                addMi = elem.awardMi;
                addItem = elem.awardItem;
                p.attribute.bossFightHp = params.leftHp;
            }
        } else if (p.fightInfo.mode == 1) { //pve挑战模式
            var elem = dataapi.storyFight.findById(p.fightInfo.id);
            if (p.attribute.finishTask + 1 == p.fightInfo.id) {
                addCoins = elem.awardCoin;
                addMi = elem.awardMi;
                addItem = elem.awardItem;
            } else {
                addCoins = Math.floor(elem.awardCoin * 0.3);
		        if (elem.awardMi) {
                	var lastElem = dataapi.storyFight.findById(p.fightInfo.id - 1);
			        if (lastElem) {
				        addCoins += Math.floor(lastElem.awardCoin * 0.35);
			        }
		        }
            }
            p.addCoins(addCoins);
            p.addItem(addItem, 1);
            p.addDiamonds(addMi);
        } else if (p.fightInfo.mode == 800) {
            p.addCoins(100000);
            addCoins = 100000;
        } else if (p.fightInfo.mode == 3) {
            p.winPlantFight(req, res, p.fightInfo.id);
            return;
        }
        p.updateFightID(p.fightInfo.mode, p.fightInfo.id);
        p.saveAttribute();
        p.saveItem();
        redisClient.zincrby(code.GAME_NAME + 'star', starNum, p.id, null);
        event.emit('fight', p, starNum);
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams :  JSON.stringify({awardCoin : addCoins, awardItem : addItem, awardMi : addMi,
                               fightResult : params.win, bossFightHp : p.attribute.bossFightHp, starNum : starNum, finishTask : p.attribute.finishTask, bossFinishTask : p.attribute.bossFinishTask})}));
    } else {
        if (p.fightInfo.mode == 2) {
            p.attribute.bossFightHp = params.leftHp;
            p.saveAttribute();
        }
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams : JSON.stringify({fightResult : params.win})}));
    }
    p.clearFightInfo();
};

playerHandler.buyShopList = function (req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in params) {
        if (!dataapi.shopList.findById(key)) {
            p.sendError(req, res, code.ITEM_ERROR.NOT_EXIST_ITEM);
            return;
        }
        var seed = dataapi.shopList.findById(key);
        if (seed.moneyType == null || seed.moneyType == 0) {
            if (p.attribute.coins < seed.price * params[key]) {
                console.log("coins not enough!");
                p.sendError(req, res, code.ITEM_ERROR.NOT_ENOUGH_COINS_BUY_ITEM);
                return;
            }
        } else {
            if (p.attribute.diamonds < seed.price * params[key]) {
                console.log("diamonds not enough!");
                p.sendError(req, res, code.ITEM_ERROR.DOMAIN_NOT_ENOUGH);
                return;
            }
        }
    }

    for (var key in params) {
        var seed = dataapi.shopList.findById(parseInt(key));
        if (seed.moneyType == null || seed.moneyType == 0) {
            p.reduceCoins(seed.price * params[key]);
        } else {
            p.reduceDiamonds(seed.price * params[key]);
        }
        shopList[key](p, params[key]);
    }
    res.end(JSON.stringify({cmdID:req.body.cmdID, ret:code.OK, cmdParams : JSON.stringify({attribute : JSON.stringify(p.attribute), skills : JSON.stringify(p.skills)})}));
};

playerHandler.setClientKeyValue = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in params) {
        p.cliSetData[key] = params[key];
    }
    redisClient.hset(p.id + code.GAME_NAME,  'cliSetData', JSON.stringify(p.cliSetData), null);
    console.log(p.cliSetData);
    res.end(JSON.stringify({cmdID:req.body.cmdID, ret:code.OK}));
};

playerHandler.getClientKeyValue = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var params = JSON.parse(req.body.cmdParams);
    var values = {};
    for (var key in params.keys) {
        values[params.keys[key]] = p.cliSetData.hasOwnProperty(params.keys[key]) ? p.cliSetData[params.keys[key]] : 0;
    }
    res.end(JSON.stringify({cmdID:req.body.cmdID, ret:code.OK, cmdParams : JSON.stringify(values)}));
};

playerHandler.getRandEvent = function(req, res) {
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var needTimes = 0;
    if (p.attribute.randEventTimes == 0) {
        needTimes = 0;
    } else if (p.attribute.randEventTimes == 1) {
        needTimes = 5 * 60;
    } else if (p.attribute.randEventTimes == 2) {
        needTimes = 5 * 60;
    } else {
        needTimes = 5 * 60;
    }
    /*
    if (p.attribute.onlineTime - p.attribute.lastDoneRandEventOlTime < needTimes) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    */
    var eventRand = [0.26, 0.26, 0.26, 0.21, 0.01];
    var randNum = Math.random();
    var sum = 0;
    for (var key in eventRand) {
        sum = sum + eventRand[key];
        if (sum >= randNum) {
            p.attribute.randEventID = parseInt(key) + 1;
            return res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({ID : parseInt(key) + 1})}));
        }
    }
};

function addEvent1Reward(p, rand, result, req, res)
{
    var reward = [[450000,150000], [650000,250000], [850000,350000]];
    var addCoins = 0;
    if (result == 1) { //获胜
        addCoins = reward[rand][0];
    } else {
        addCoins = reward[rand][1];
    }
    if (p.attribute.mood == 3) {
        addCoins += 50000;
    } else if (p.attribute.mood == 1) {
        addCoins -= 50000;
    }
    p.addCoins(addCoins);
    p.saveAttribute();
    return res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({coins : addCoins})}));
}

function addEvent2Reward(p, rand, result, req, res)
{
    var reward = [[650000,150000], [850000,250000], [1050000,350000]];
    var addCoins = 0;
    if (result == 1) {
        addCoins = reward[rand][0];
    } else {
        addCoins = reward[rand][1];
    }
    if (p.attribute.mood == 3) {
        addCoins += 50000;
    } else if (p.attribute.mood == 1) {
        addCoins -= 50000;
    }
    p.addCoins(addCoins);
    p.saveAttribute();
    return res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({coins : addCoins})}));
}

function addEvent3Reward(p, rand, req, res)
{
    var seedRand = parseInt(Math.random() * 3);
    var itemID = 0;
    var itemNum = 0;
    var addCoins = 50000;
   if (rand == 0) {
       if (seedRand == 0) {
           itemID = parseInt(Math.random() * 4 + 1) * 10000 + 1;
           itemNum = 30;
       } else if (seedRand == 1) {
           itemID = parseInt(Math.random() * 4 + 1) * 10000 + 2;
           itemNum = 6;
       } else {
           itemID = parseInt(Math.random() * 4 + 1) * 10000 + 3;
           itemNum = 2;
       }
   } else if (rand == 1) {
       if (seedRand == 0) {
           itemID = parseInt(Math.random() * 4 + 1) * 10000 + 2;
           itemNum = 8;
       } else if (seedRand == 1) {
           itemID = parseInt(Math.random() * 4 + 1) * 10000 + 3;
           itemNum = 4;
       } else {
           itemID = parseInt(Math.random() * 4 + 1) * 10000 + 4;
           itemNum = 1;
       }
   } else {
       if (seedRand == 0) {
           itemID = parseInt(Math.random() * 4 + 1) * 10000 + 2;
           itemNum = 10;
       } else if (seedRand == 1) {
           itemID = parseInt(Math.random() * 4 + 1) * 10000 + 3;
           itemNum = 6;
       } else {
           itemID = parseInt(Math.random() * 4 + 1) * 10000 + 4;
           itemNum = 2;
       }
   }
   if (p.attribute.mood == 3) {
       addCoins += 50000;
   } else if (p.attribute.mood == 1) {
       addCoins -= 50000;
   }
    p.addCoins(addCoins);
    p.addItem(itemID, itemNum);
    p.saveAttribute();
    p.saveItem();
    return res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({coins : addCoins, itemID : itemID, itemNum : itemNum})}));
}

function addEvent4Reward(p, rand, req, res)
{
    var seedRand = parseInt(Math.random() * 3);
    var itemID = 0;
    var itemNum = 0;
    var addCoins = 50000;
    if (rand == 0) {
        if (seedRand == 0) {
           addCoins += 400000;
        } else if (seedRand == 1) {
            itemID = parseInt(Math.random() * 4 + 1) * 10000 + 2;
            itemNum = 8;
        } else {
            itemID = parseInt(Math.random() * 4 + 1) * 10000 + 3;
            itemNum = 4;
        }
    } else if (rand == 1) {
        if (seedRand == 0) {
           addCoins += 600000;
        } else if (seedRand == 1) {
            itemID = parseInt(Math.random() * 4 + 1) * 10000 + 3;
            itemNum = 6;
        } else {
            itemID = parseInt(Math.random() * 4 + 1) * 10000 + 4;
            itemNum = 2;
        }
    } else {
        if (seedRand == 0) {
           addCoins += 800000;
        } else if (seedRand == 1) {
            itemID = parseInt(Math.random() * 4 + 1) * 10000 + 3;
            itemNum = 8;
        } else {
            itemID = parseInt(Math.random() * 4 + 1) * 10000 + 4;
            itemNum = 3;
        }
    }
    if (p.attribute.mood == 3) {
        addCoins += 50000;
    } else if (p.attribute.mood == 1) {
        addCoins -= 50000;
    }
    p.addCoins(addCoins);
    p.addItem(itemID, itemNum);
    p.saveAttribute();
    p.saveItem();
    return res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({coins : addCoins, itemID : itemID, itemNum : itemNum})}));
}

function addEvent5Reward(p, rand, req, res)
{
    var addCoins = 50000;
    if (p.attribute.mood == 3) {
        addCoins += 50000;
    } else if (p.attribute.mood == 1) {
        addCoins -= 50000;
    }
    var itemID = itemID = parseInt(Math.random() * 4 + 1) * 10000 + 5;
    var itemNum = 1;
    p.addCoins(addCoins);
    p.addItem(itemID, itemNum);
    p.saveAttribute();
    p.saveItem();
    return res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({coins : addCoins, itemID : itemID, itemNum : itemNum})}));
}

playerHandler.getRandEventReward = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (!p.attribute.randEventID) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var rand = 0;
    if (p.attribute.onlineTime <= 5 * 60) {
        rand = 0;
    } else if (p.attribute.onlineTime <= 10 * 60) {
        rand = 1;
    } else {
        rand = 2;
    }
    if (p.attribute.randEventID == 1) {
        addEvent1Reward(p, rand, params.result, req, res);
    } else if (p.attribute.randEventID == 2) {
        addEvent2Reward(p, rand, params.result, req, res);
    } else if (p.attribute.randEventID == 3) {
        addEvent3Reward(p, rand, req, res);
    } else if (p.attribute.randEventID == 4) {
        addEvent4Reward(p, rand, req, res);
    } else if (p.attribute.randEventID == 5) {
        addEvent5Reward(p, rand, req, res);
    }
    p.attribute.randEventTimes  += 1;
    p.attribute.randEventID = 0;
    p.attribute.lastDoneRandEventOlTime = p.attribute.onlineTime;
    p.saveAttribute();
};

playerHandler.getTaskReward = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (!p.task.checkFinTask(p, params.taskID)) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var result = p.task.giveTaskReward(p,params.taskID);
    p.task.updateTaskFin(params.taskID);
    p.saveTask();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(result)}))
};

playerHandler.getTaskInfo = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.task)}))
};

playerHandler.addOnlineTime = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (isNaN(params.totalTime)) {
        log.writeErr('totalTime Not number', req.body.uid + '|' + req.body.cmdID + params.totalTime);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.PARAM_NOT_CORRECT}));
        return;
    }
    p.attribute.onlineTime = params.totalTime;
    p.attribute.onlineUpdateTime = utils.getSecond();
    p.saveAttribute();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.attribute)}))
};

playerHandler.charge = function(req, res) {
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    redisClient.hget(p.id + code.GAME_NAME, "money", function(err, redis) {
        if (redis != null) {
            var num = parseInt(redis);
            p.charge(num);
            res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({money : num})}));
        } else {
            log.writeErr(p.id + '|' + req.body.cmdID + "not charge money ");
            res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.CHARGE.NOT_ADD_ANY_MONEY }));
        }
    });
};


playerHandler.startFight = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (p.fightInfo.id) {
        p.fightInfo.startTime = utils.getSecond();
    }
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK}))
};

playerHandler.getPlantInfo = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    redisClient.hget(code.GAME_NAME, "stars", function(err, redis) {
        if (!err) {
            res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, stars : redis}));
        } else {
            res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.SYSTEM_ERROR}));
        }
    });
};