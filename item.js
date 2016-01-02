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