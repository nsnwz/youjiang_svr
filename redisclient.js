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

redis.hget = function(sType, sField, cb) {
    redisDB.hget(sType, sField, function(err, res) {
        if (err != null) {
            console.log('hget error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};

redis.incr = function(sType, cb) {
    redisDB.incr(sType, function(err, res) {
        if (err != null) {
            console.log('hget error: ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};

redis.zadd = function(sType, score, member, cb) {
    var args = [ sType, score, member];
    console.log(sType, score, member);
    redisDB.zadd(args, function(err, res) {
        if (err != null) {
            console.log('zadd error ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);           ;
        }
    });
};

redis.zrevrange = function(sType, start, end, cb) {
    var args = [sType, start, end, 'withscores'];
    redisDB.zrevrange(args, function(err, res) {
        if (err != null) {
            console.log('zrevrange error ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};

redis.zincrby = function(sType, increment, member, cb) {
    var args = [sType, increment, member];
    redisDB.zincrby(args, function(err, res) {
        if (err != null) {
            console.log('zincrby error ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};

redis.zrevrank = function(sType, member, cb) {
    redisDB.zrevrank(sType, member, function(err, res) {
        if (err != null) {
            console.log('zincrby error ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};

redis.zcount = function(sType, min, max, cb) {
    redisDB.zcount(sType, min, max, function(err, res) {
        if (err != null) {
            console.log('zincrby error ' + err.message);
            utils.invokeCallback(cb, err.message, null);
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};