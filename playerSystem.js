/**
 * Created by miller on 2015/10/22.
 */

var log = require('./log.js').helper;
var utils = require('./utils.js');
var channel = require('./config/channel.json');
var code = require("./code");
var hoowu = require('./hoowu');

var exp = module.exports;

var players = {};

exp.addPlayer = function(player) {
    var id = player.id;
    var svrID = player.svrID;
    if (!players[svrID]) {
        players[svrID] = {};
    }
    if (!!players[svrID][id]) {
        log.writeErr('add player twice ' + player.id);
        return false;
    }
    players[svrID][id] = player;
    return true;
};

exp.removePlayer = function(id, svrID) {
    if (!!players[svrID] && !!players[svrID][id]) {
        delete players[svrID][id];
        return true;
    }
    log.writeErr('remove player error not exist ' + id);
    return false;
};

exp.getPlayer = function(id, svrID) {
    if (!!players[svrID] && !!players[svrID][id]) {
        return players[svrID][id];
    } else {
        console.log('player not fond: ', id);
        return null;
    }
};


exp.delExpirePlayer = function() {
    var delPlayers = [];
    for (var key in players) {
        for (var index in players[key]) {
            if (utils.getSecond() - players[key][index].onlineUpdateTime > 2 * 60 * 60) {
                var idSvrID = [players[key][index].id, players[key][index].svrID];
                delPlayers.push(idSvrID);
            }
        }
    }
    for (var key in delPlayers) {
        exp.removePlayer(delPlayers[key][0], delPlayers[key][1]);
    }

    if (channel.channel == code.CHANNEL.HOOWU) {
        for (var key in players) {
            for (var index in players[key]) {
                if (utils.getSecond() - players[key][index].refreshTime > 60 * 60) {
                    hoowu.refreshToken(players[key][index]);
                }
            }
        }
    }


};
