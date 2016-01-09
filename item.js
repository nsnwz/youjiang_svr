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

item.getSeedRandom = function(id) {
    var elem = dataapi.seedRandom.findById(id);
    if (elem == null) {
        return -1;
    }
    var seedRand = [elem.seed2Random, elem.seed3Random, elem.seed3Random, elem.seed4Random];
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

item.getStarNum = function(id, time) {
    var elem = dataapi.storyFight.findById(id);
    if (elem == null) {
        return 0;
    }
    var fightStarTime = dataapi.other.findById('fightStarTime').val.split('/');
    var fightStarRandom = dataapi.other.findById('fightStarRandom').val.split('/');
    for (var key in fightStarTime) {
        if (time < fightStarTime[key]) {
            return (elem.star * fightStarRandom[key] / 3);
        }
    }
};

item.getSeedType = function(itemID) {
  return (parseInt(itemID / 10000));
};

item.getSeedLv = function(itemID) {
  return (itemID % 10);
};