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
    }
};

module.exports = shopList;