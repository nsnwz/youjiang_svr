/**
 * Created by miller on 2016/1/3.
 */


var shopList =  {
    600005 : function(p, num) {
        p.attribute.buyPowerNum += num * 10;
        p.saveAttribute();
    },
    600006 : function(p, num) {
        p.skills[20001].useTimes++;
        p.saveSkills();
    },
    600007 : function(p, num) {
        p.skills[20002].useTimes++;
        p.saveSkills();
    },
    600008 : function(p, num) {
        var mood = [[1, 2], [0, 2], [0, 1]];
        p.attribute.mood = mood[p.attribute.mood][Math.floor(Math.random() * ( 1 + 1))]
        p.saveAttribute();
    }
};

module.exports = shopList;