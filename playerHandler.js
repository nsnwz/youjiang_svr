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
var item = require('./item');


var playerHandler = module.exports;

playerHandler.addPlayer = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    redisClient.incr("guid", function(err, redis) {
        p = new playerModel();
        p.id = redis + 5000;
        p.name = params.name;
        p.pic = "1234";
        p.saveBaseinfo();
        p.attribute.coins = 100000000000000;
        p.attribute.totalCoins = p.attribute.coins;
        p.attribute.diamonds = 10000000000;
        p.saveAttribute();
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK,  cmdParams : JSON.stringify({uid : p.id, name : p.name, pic : p.pic })}));
    });
};

playerHandler.getPlayerInfo = function(req, res) {
    var id = req.body.uid;
    console.log(req.body.uid);
    var p = playerSystem.getPlayer(req.body.uid);
    if (p != null) {
        console.log('found player: ', req.body.uid);
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : 0, cmdParams : p.getLoginJson()}));
        return;
    } else {
        console.log("redis player");
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
                p.dealSeedOffline();
                p.dealDayValue();
                p.attribute.coins = 100000000000000;
                res.end(JSON.stringify({cmdID : req.body.cmdID, ret : 0, cmdParams : p.getLoginJson()}));
            }
        ], function(err, res) {
            if (err != null) {
                console.log('get redis error');
            }
        });
     }
};


playerHandler.buyItem = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in params) {
        if (!dataapi.seed.findById(parseInt(key))) {
            console.log(params.itemID, " not exist");
            p.sendError(req, res, code.ITEM_ERROR.NOT_EXIST_ITEM);
            return;
        }
        var seed = dataapi.seed.findById(parseInt(key));
        console.log("seed ", seed, seed.hasOwnProperty('moneyType'));
        if (seed.moneyType == null || seed.moneyType == 0) {
            if (p.attribute.coins < seed.buy) {
                console.log("coins not enough!");
                p.sendError(req, res, code.ITEM_ERROR.NOT_ENOUGH_COINS_BUY_ITEM);
                return;
            }
        } else {
            if (p.attribute.diamonds < seed.buy) {
                console.log("diamonds not enough!");
                p.sendError(req, res, code.ITEM_ERROR.DOMAIN_NOT_ENOUGH);
                return;
            }
        }
     }
    for (var key in params) {
        var seed = dataapi.seed.findById(parseInt(key));
        if (seed.moneyType == null || seed.moneyType == 0) {
            p.reduceCoins(seed.buy);
        } else {
            p.reduceDiamonds(seed.buy);
        }
        p.addItem(parseInt(key), params[key]);
    }
    p.saveAttribute();
    p.saveItem();
    res.end(JSON.stringify({cmdID:req.body.cmdID, ret:code.OK, cmdParams : JSON.stringify(p.attribute)}));
};

playerHandler.getBag = function (req, res) {
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
  res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.bag)}));
};

playerHandler.plant = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in params) {
        if (!p.checkCanPlant(parseInt(key))) {
            p.sendError(req, res, code.PLANT.FIELD_CANNOT_PLANT);
            return;
        }
        if (p.getItemAmount[params[key]] < 0) {
            p.sendError(req, res, code.NOT_FIND_PALYER_ERROR);
            return;
        }
    }

    for (var key in params) {
        p.reduceItem(params[key], 1);
        p.fields[key] = {itemID:params[key], startTime:new Date().getTime(), growth:0, updateTime : new Date().getTime()};
    }
    p.saveFields();
    p.saveItem();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK,  cmdParams : JSON.stringify(p.fields)}));
};

playerHandler.harvest = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in params.fields) {
        console.log("harvest ", key, params.fields[key]);
        if (p.fields.hasOwnProperty(params.fields[key])) {
            var seed = dataapi.seed.findById(p.fields[params.fields[key]].itemID);
            var values = seed.time.split('/');
            var needGrowth = 0;
            for (var idx in values) {
                needGrowth += parseInt(values[idx]);
            }
            if (needGrowth > p.fields[params.fields[key]].growth) {
                console.log("check growth", needGrowth, p.fields[params.fields[key]].growth);
                p.sendError(req, res, code.PLANT.NOT_ENOUGH_TO_HARVEST);
                return;
            }
        } else {
            p.sendError(req, res, code.PLANT.NOT_HAVE_ITEM_IN_FIELD);
            return;
        }
    }
    for (var key in params.fields) {
        var seed = dataapi.seed.findById(p.fields[params.fields[key]].itemID);
        p.attribute.attack += seed.attack;
        p.attribute.def += seed.defense;
        p.attribute.hp += seed.hp;
        p.attribute.coins += seed.harvest;
        p.attribute.totalCoins += seed.harvest;
        delete p.fields[params.fields[key]];
        redisClient.zincrby(code.GAME_NAME + 'coins', seed.harvest, p.id, null);
    }
    p.saveFields();
    p.saveAttribute();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK,  cmdParams : JSON.stringify({fields : JSON.stringify(p.fields), attribute : JSON.stringify(p.attribute)})}));
};

playerHandler.getRank = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var selfRank = -1;
    async.waterfall([
        function(cb) {
            redisClient.zrevrank(code.GAME_NAME + params.rankName, p.id, cb);
        },function(redis, cb) {
            console.log("selfRank ", redis);
            if (redis != null) {
                selfRank = redis;
            }
            redisClient.zrevrange(code.GAME_NAME + params.rankName, params.startID, params.endID, cb);
        }, function(redis, cb) {
            res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({selfRank : selfRank, fields : JSON.stringify(redis)})}));
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
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in p.fields) {
        var now = new Date().getTime();
        if (now - p.fields[key].updateTime < params.addvaule / 10) {
            params.addvaule = (now - p.fields[key].updateTime) * 10;
        }
        p.fields[key].growth += params.addValue;
        p.fields[key].updateTime = new Date().getTime();
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
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var num = 0;
    for (var key in params) {
        var elem = dataapi.commodity.findById(key);
        if (!elem) {
            console.log('cannot find elem', key);
            res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
            return;
        }
        num += elem.price * params[key];
    }

    if (!p.reduceDiamonds(num)) {
        console.log('domain not enough');
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.ITEM_ERROR.DOMAIN_NOT_ENOUGH}));
        return;
    }
    for (var key in params) {
        if (!!p.fieldsAttribute[key]) {
            if (p.fieldsAttribute[key] < new Date().getTime()) {
                p.fieldsAttribute[key] = new Date().getTime() + params[key] * 20;
            } else {
                p.fieldsAttribute[key] += params[key] * 20;
            }
        } else {
            p.fieldsAttribute[key] = new Date().getTime() + params[key] * 20;
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
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var elem = dataapi.other.findById('openDiCost');
    var needCoins = elem.val.split('/');
    console.log("needCoins ", needCoins, p.attribute.maxFieldNum);
    if (p.attribute.maxFieldNum > needCoins.length) {
        p.sendError(req, res, code.ITEM_ERROR.HAVE_GOT_MAX_FIELDS);
        return;
    }
    if (!p.reduceCoins(parseInt(needCoins[p.attribute.maxFieldNum - 1]))) {
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
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var elem = dataapi.other.findById('diUpLevelCost');
    var values = elem.val.split('/');
    console.log("values ", values, values.length);
    if (p.fieldsAttribute.fieldsLevel > values.length) {
        p.sendError(req, res, code.ITEM_ERROR.HAVE_GOT_MAX_LEVEL);
        return;
    }
    if (!p.reduceDiamonds(parseInt(values[p.fieldsAttribute.fieldsLevel - 1]))) {
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
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (!p.checkSkillCanLevelUp(params.skillID)) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var costNum = item.getSkillLevelUpCost(p.skills[params.skillID].lv);
    if (!p.reduceCoins(costNum)) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    p.upSkillLevel(params.skillID);
    p.saveSkills();
    p.saveAttribute();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify(p.skills)}));
};

playerHandler.getServerTime = function(req, res) {
    var nowTime = new Date().getTime();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK, cmdParams : JSON.stringify({now : nowTime})}));
};

playerHandler.getSeveralPlayersInfo = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var uidsInfo = [];
    async.eachSeries(params.uids,
        function(id, callback) {
            redisClient.getKey(id, function(err, redis) {
                if (redis != null) {
                    uidsInfo.push(redis);
                }
                console.log('get id ', id, redis);
                callback(null);
            });
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
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (p.stealInfo.length > 0) {
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams: JSON.stringify({fields: JSON.stringify(p.stealInfo)})}));
        return;
    }
    var selfRank = -1;
    async.waterfall([
        function(cb) {
            redisClient.zrevrank(code.GAME_NAME + params.rankName, p.id, cb);
        },function(redis, cb) {
            console.log("selfRank ", redis);
            if (redis != null) {
                selfRank = redis;
                var startID = 0;
                var endID = selfRank + 50;
                if (selfRank > 50) {
                    startID -= 50;
                }
                redisClient.zrevrange(code.GAME_NAME + params.rankName, startID, endID, cb);
            } else {
                redisClient.zcount(code.GAME_NAME + params.rankName, -inf, +inf, function(err, redis) {
                    var count = redis;
                    var startID = 0;
                    if (count > 100) {
                        startID = count - 100;
                    }
                    redisClient.zrevrange(code.GAME_NAME + params.rankName, startID, count, cb);
                })
            }
        }, function(redis, cb) {
            if (redis.length < 10) {
                p.stealInfo = redis;
            } else {
                var idx = [];
                for (var i = 0; i < redis.length; i++) {
                    idx.push(i);
                }
                arr.sort(function() {
                    return Math.random() - 0.5;
                });
                arr.length = 10;
                for (var i = 0; i < arr.length; i++) {
                    p.stealInfo.push(redis[i]);
                }
            }
            res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams: JSON.stringify({fields: JSON.stringify(p.stealInfo)})}));
            p.saveStealInfo();
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
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (!p.checkStealNum()) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.PLANT.NOT_ENOUGH_STEAL_NUM}));
        return;
    }
    if (!p.checkStealID(params.id)) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.PLANT.ID_NOT_IN_STEAL_RANK}));
        return;
    }
    var nowTime = new Date().getTime();
    var totalNum = 0;
    async.waterfall([
        function(cb) {
            redisClient.hget(params.id + code.GAME_NAME, 'fields', cb);
        }, function(fields, cb) {
            for (var key in fields) {
                if (fields[key].updateTime < nowTime) {
                    fields[key].growth += nowTime - fields[key].updateTime;
                }
                var val = item.getSeedTotalValue(fields[key].itemID);
                if (fields[key].growth >= val) {
                    totalNum += val;
                }
            }
            p.addCoins(totalNum * 0.1);
            redisClient.hget(params.id + code.GAME_NAME, 'stealMePlayers', cb);
        }, function(redis, cb) {
            var elem = [p.id, nowTime, totalNum * 0.1];
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
            p.saveStealInfo();
            res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams: JSON.stringify({Attribute: JSON.stringify(p.attribute)})}));
        }
    ]);
};

playerHandler.getStealMePlayers = function(req, res) {
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    redisClient.hget(p.id + code.GAME_NAME, 'stealMePlayers', function(err, redis) {
        res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams: JSON.stringify({stealInfo: redis})}));
    });
};

playerHandler.getPlayerMatureSeed = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    var nowTime = new Date().getTime();
    var matureSeed = [];
    async.waterfall([
        function(cb) {
            redisClient.hget(params.id + code.GAME_NAME, 'fields', cb);
        }, function(fields, cb) {
            for (var key in fields) {
                if (fields[key].updateTime < nowTime) {
                    fields[key].growth += nowTime - fields[key].updateTime;
                }
                var val = item.getSeedTotalValue(fields[key].itemID);
                if (fields[key].growth >= val) {
                    matureSeed.push(val.itemID);
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
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (params.id != p.attribute.finishTask + 1) {
        p.sendError(req, res, code.TASK.HAVE_NOT_FIN_PRE_TASK);
        return;
    }
    p.fightInfo.id = params.id;
    p.fightInfo.startTime = new Date().getTime();
    p.sendError(req, res, code.OK);
};

playerHandler.useSkill = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    if (params == 1) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK}));
        return;
    }
    if (!p.checkCanUseSkill(params.id)) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.SKILL.NOT_RIGHT_USE_SKILL}));
        return;
    }
    p.fightInfo[params.id] += 1;
    p.reduceSkillUseTimes(params.id);
    p.saveSkills();
    res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.OK}));
};

playerHandler.checkFight = function(req, res) {
    var params = JSON.parse(req.body.cmdParams);
    var p = playerSystem.getPlayer(req.body.uid);
    if (!p) {
        res.end(JSON.stringify({cmdID : req.body.cmdID, ret : code.NOT_FIND_PALYER_ERROR}));
        return;
    }
    for (var key in params.fight) {
        var type = params.fight[key][0];
        var pos = params.fight[key][1];
        var damage = params.fight[key][2];
        if (type == 0) { //伤害包
            if (pos == 0) {//用户受伤

            }
        }
    }
};