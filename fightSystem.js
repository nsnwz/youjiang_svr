/**
 * Created by miller on 2015/12/16.
 */

var fights = {};

var exp = module.exports;

exp.addFight = function(fight) {
    var id = fight.id;
    if (!!fights[id]) {
        console.log('add player twice : ', fight.id);
        return false;
    }
    fights[id] = fight;
    return true;
};

exp.getFight = function(id) {
    if (!!fights[id]) {
        return fights[id];
    } else {
        console.log('player not fond: ', id);
        return null;
    }
};
