/**
 * Created by miller on 2015/10/22.
 */
require('module-unique').init();
var playerSystem = require('./playerSystem');
var playerModel = require('./player');
var redisClient = require('./redisclient');
var async = require('async');

var playerHandler = module.exports;

playerHandler.getPlayerInfo = function(req, res) {
    var id = req.query.id;
    console.log(req.query.id);
    var player = playerSystem.getPlayer(req.query.id);
    if (player != null) {
        console.log('found player: ', req.query.id);
    } else {
        async.waterfall([
            function(db) {
                redisClient.hgetall(id, 'base_' + req.query.id, function(err, redis) {
                    var p = new playerModel();
                    p.initFromDB(redis);
                    playerSystem.addPlayer(p);
                    console.log('get redis: ', redis);
                    console.log(p);
                })
            }
        ], function(err, res) {
            if (err != null) {
                console.log('get redis error');
            }
        });
     }
};
