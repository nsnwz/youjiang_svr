/**
 * Created by miller on 2016/1/3.
 */


var shopList =  {
    600004 : function(p, num) {
        p.attribute.buyStealNumLeft += num * 5;
        p.saveAttribute();
    },
    600005 : function(p, num) {
        p.attribute.buyPowerNum += num * 10;
        p.saveAttribute();
    },
    600006 : function(p, num) {
        p.skills[20001].useTimes += num;
        p.saveSkills();
    },
    600007 : function(p, num) {
        p.skills[20002].useTimes += num;
        p.saveSkills();
    },
    600008 : function(p, num) {
        var mood = [[2, 3], [1, 3], [1, 2]];
        p.attribute.mood = mood[p.attribute.mood - 1][parseInt(Math.random() * 2)]
        p.saveAttribute();
    },
    600009 : function(p, num) {
        p.attribute.bossFightHp = p.attribute.hp;
        p.saveAttribute();
    },
    600014 : function(p, num) {
        p.attribute.buyStarNum += 1000 * num;
        p.saveAttribute();
    },
    600015 : function(p, num) {
        p.addCoins(num * 30000000);
        p.saveAttribute();
    }
};

module.exports = shopList;