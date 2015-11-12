/**
 * Created by miller on 2015/10/22.
 */

var exp = module.exports;

var players = {};

exp.addPlayer = function(player) {
    var id = player.id;
    if (!!players[id]) {
        console.log('add player twice : ', player.id);
        return false;
    }
    players[id] = player;
    return true;
};

exp.removePlayer = function(id) {
    if (!!players[id]) {
        delete players[id];
        return true;
    }
    console.log('remove player error not exist : ', id);
    return false;
};

exp.getPlayer = function(id) {
    if (!!players[id]) {
        return players[id];
    } else {
        console.log('player not fond: ', id);
        return null;
    }
};

exp.getNumbersOfPlayers = function() {
    return players.length;
};

exp.save = function(res) {
    var nID = res.id;
    var pPlayer = players[nID];
    if (!!pPlayer) {
        //pPlayer.save();
    }
};