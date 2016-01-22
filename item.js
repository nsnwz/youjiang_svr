/**
 * Created by miller on 2016/1/1.
 */

var dataapi = require('./dataapi');

var item = module.exports;

item.getSeedTotalValue = function(seedID) {
    var elem = dataapi.seed.findById(seedID);
    if (!elem) {
        return 10000000;
    } else {
        var values = elem.time.split('/');
        var totalValue = 0;
        for (var key in values) {
            totalValue += parseInt(values[key]);
        }
        return totalValue;
    }
    return 0;
};

item.getSeedCoins = function(seedID) {
    var ele = dataapi.seed.findById(seedID);
    if (!ele) {
        return 0;
    }
    return ele.harvest;
};

item.getSkillMaxLevel = function() {
    var elem = dataapi.other.findById('skill1UpLevelCost');
    if (elem) {
        var costs = elem.val.split('/');
        return costs.length;
    }
    return 0;
};

item.getSkillLevelUpCost = function(curLevel) {
    var elem = dataapi.other.findById('skill1UpLevelCost');
    if (elem) {
        var costs = elem.val.split('/');
        if (curLevel < costs.length) {
            return costs[curLevel];
        }
    }
    return 0;
};

item.getSkillAddValue = function(lv) {
    var elem = dataapi.other.findById('skill1UpLevelUpVal');
    var values = elem.val.split('/');
    if (lv <= values.length) {
        return values[lv -1];
    } else {
        return 0;
    }
};

item.checkRandSeed = function (id) {
    var elem = dataapi.seedRandom.findById(id);
    if (elem == null) {
        return false;
    }
    return true;
};

item.getSeedRandom = function(id) {
    var elem = dataapi.seedRandom.findById(id);
    if (elem == null) {
        return -1;
    }
    var seedRand = [elem.seed2Random, elem.seed3Random, elem.seed4Random, elem.seed5Random];
    var itemID = [elem.seed2, elem.seed3, elem.seed4, elem.seed5];
    var rand = Math.random();
    var sum = 0;
    for (var key in seedRand) {
        sum = sum + seedRand[key];
        if (rand <= sum) {
            return itemID[key];
        }
    }
    return 0;
};

item.getStarNum = function(p, id, time, mode) {
    if (mode == 2) {//pve无尽模式
        if (p.attribute.bossFinishTask + 1 == id) {
            var elem = dataapi.bossFight.findById(id);
            if (elem) {
                if (isNaN(elem.star)) {
                    return 3;
                } else {
                    return elem.star;
                }
            }
            return 0;
        } else {
            return 0;
        }
    } else {//pve剧情模式
        if (id <= p.attribute.finishTask + 1) {
            var elem = dataapi.storyFight.findById(id);
            if (elem == null) {
                return 0;
            }
            var fightStarTime = dataapi.other.findById('fightStarTime').val.split('/');
            var fightStarRandom = dataapi.other.findById('fightStarRandom').val.split('/');
            for (var key in fightStarTime) {
                if (time < fightStarTime[key]) {
                    if (!isNaN(elem.star)) {
                        var num = parseInt(elem.star * fightStarRandom[key] / 3);
                        if (id <= p.attribute.finishTask) {
                            num = num;
                        }
                        return num;
                    } else {
                        return 3;
                    }
                }
            }
        }
    }
};

item.getSeedType = function(itemID) {
    return (parseInt(itemID / 10000));
};

item.getSeedLv = function(itemID) {
    return (itemID % 10);
};

item.checkConfig = function(callback) {

    callback(null);
};