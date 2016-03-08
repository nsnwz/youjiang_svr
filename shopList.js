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
        p.addTotalStar();
    },
    600015 : function(p, num) {
        p.addCoins(num * 80000000);
        p.saveAttribute();
    },
    600016 : function(p, num) {
        p.attribute.atk = p.attribute.atk + parseInt(p.attribute.atk * 0.1);
        p.attribute.def = p.attribute.def + parseInt(p.attribute.def * 0.1);
        p.attribute.hp = p.attribute.hp + parseInt(p.attribute.hp * 0.1);
        p.saveAttribute();
    }
};

module.exports = shopList;