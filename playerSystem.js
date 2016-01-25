/**
 * Created by miller on 2015/10/22.
 */

var log = require('./log.js').helper;

var exp = module.exports;

var players = {};

exp.addPlayer = function(player) {
    var id = player.id;
    if (!!players[id]) {
        log.writeErr('add player twice ' + player.id);
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
    log.writeErr('remove player error not exist ' + id);
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

exp.delExpirePlayer = function() {
    var delPlayers = [];
    for (var key in players) {
        if (utils.getSecond() - p.onlineUpdateTime > 2 * 60 * 60) {
            delPlayers.push(p.id)
        }
    }
    for (var key in delPlayers) {
        exp.removePlayer(delPlayers[key]);
    }
};