/**
 * Created by miller on 2015/10/21.
 */

require('module-unique').init();
var redis_moudule = require('redis');
var redisconfig = require('./config/redis');
var utils = require('./utils');

var connect = function() {
    var redis = redis_moudule.createClient(redisconfig.port, redisconfig.host) || null;
  if (null != redis) {
      redis.select(Number(redisconfig.db), function(err, res) {
          console.log('create redisclient11', res);
      })
      return redis;
  }
};


var redisDB = connect();

var redis = module.exports;

redis.test = function() {
    console.log("redis test");
};

redis.updateKey = function(sType, nScore, cb) {
    redisDB.set(sType, nScore, function(err, res) {
        if (err != null) {
            console.log('[redisclient update socre error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};

redis.getKey = function(sType, cb) {
    redisDB.get(sType, function(err, res) {
        if (err != null) {
            console.log("[redisclient get socre error: " + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};

redis.hgetall = function(sType, cb) {
    redisDB.hgetall(sType, function(err, res) {
        if (err != null) {
            console.log('hgetall error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};

redis.hset = function(sType, sField, sValue, cb) {
    redisDB.hset(sType, sField, sValue, function(err, res) {
        if (err != null) {
            console.log('hgetall error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};