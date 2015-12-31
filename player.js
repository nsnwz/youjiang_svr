/**
 * Created by miller on 2015/10/21.
 */

require('module-unique').init();

var redisClient = require('./redisclient');
var code = require("./code");
var dataapi = require('./dataapi');
var fieldSeed = require('./fieldSeed');

/**
 * 用户数据信息
 */
var player = function() {
    /*
    this.openid = null;
    this.nickname = 'default';
    this.sex = null;
    this.language = null;
    this.city = null;
    this.province = null;
    this.country = null;
    this.headimgurl = null;
    this.privilege = null;
    */
    this.id = undefined;
    this.name = 'default';
    this.pic = undefined;
    this.attribute = {coins:0, diamonds:0, maxFieldNum : 6, attack : 0};
    this.bag = {};
    this.fields = {};
    this.fieldsAttribute = {};
    this.atk = 0;
    this.def = 0;
    this.skills = {};
    this.session = null;
    this.fightID = 0;
};

player.prototype.initFromDB = function(dbrecord) {
    /*
    this.openid = dbrecord.openid;
    this.nickname = dbrecord.nickname;
    this.sex = dbrecord.sex;
    this.language = dbrecord.language;
    this.city = dbrecord.city;
    this.province = dbrecord.province;
    this.country = dbrecord.country;
    this.headimgurl = dbrecord.headimgurl;
    this.privilege = dbrecord.privilege;
    */
    this.id = dbrecord.id;
    this.name = dbrecord.name;
    this.pic = dbrecord.pic;
};

player.prototype.getLoginJson = function() {
    return JSON.stringify({id:this.id, name:this.name, pic:this.pic, item:JSON.stringify(this.bag), fields : JSON.stringify(this.fields), attribute : JSON.stringify(this.attribute)});
};

player.prototype.initItem = function(dbrecord) {
    this.bag = dbrecord;
};

player.prototype.initFields = function(dbrecord) {
    this.fields = dbrecord;
};

player.prototype.initAttribute = function(dbrecord) {
    for (var key in dbrecord) {
        this.attribute[key] = dbrecord[key];
    }
};

player.prototype.initFromWeiXin = function(weixin) {
    this.openid = weixin.openid;
    this.nickname = weixin.nickname;
    this.sex = weixin.sex;
    this.language = weixin.language;
    this.city = weixin.city;
    this.province = weixin.province;
    this.country = weixin.country;
    this.headimgurl = weixin.headimgurl;
    this.privilege = weixin.privilege;
};

player.prototype.saveBaseinfo = function() {
    //var data = {openid:this.openid, nickname:this.nickname, sex:this.sex, language:this.language, city:this.city, province:this.province, country:this.country, headimgurl:this.headimgurl, privilege:this.privilege};
    var data = {id:this.id, name:this.name, pic:this.pic};
    redisClient.updateKey(this.id, JSON.stringify(data));
};

player.prototype.test = function() {
    console.log('this just test');
};

player.prototype.getItemAmount = function(nID) {
  if (!!this.bag[nID]) {
      return this.bag[nID];
  }  else {
      return 0;
  }
};

player.prototype.reduceItem = function(nID, nNum) {
    if (this.getItemAmount(nID) < nNum) {
        return false;
    } else {
        this.bag[nID] -= nNum;
        if (this.bag[nID] <= 0) {
            delete this.bag[nID];
        }
    }
    console.log(JSON.stringify(this.bag));
    redisClient.hset(this.id + code.GAME_NAME, "item", JSON.stringify(this.bag), null);
    return true;
};

player.prototype.addItem = function(nID, nAmount) {
    if (!!this.bag[nID]) {
        console.log(this.bag[nID]);
        this.bag[nID] += nAmount;
        console.log(this.bag[nID], nAmount);
    } else {
        this.bag[nID] = 0;
        this.bag[nID] += nAmount;
    }
    console.log(JSON.stringify(this.bag));
    redisClient.hset(this.id + code.GAME_NAME, "item", JSON.stringify(this.bag), null);
    return true;
};

player.prototype.putSeed = function(nID, fieldID) {
    //if (this.reduceItem(nID, 1)) {
        var seed = new fieldSeed();
        seed.itemId = nID;
        //seed.starttime = date.getTime();
        seed.starttime = 1000;
        seed.idx = fieldID;
        this.fields[fieldID] = seed;
    //}
    redisClient.hset(this.id + code.GAME_NAME, "fields", JSON.stringify(this.fields), null);
};

player.prototype.accelerateGrow = function(nID, fieldID) {
    var field = this.fields[fieldID];
    if (!!field) {
        field.addvaule += 2;
        redisClient.hset(this.id + code.GAME_NAME, "fields", JSON.stringify(this.fields), null);
    }
};

player.prototype.checkCanPlant = function(fieldID) {
    if (fieldID > this.attribute.maxFieldNum) {
      return false;
    }
    if (this.fields.hasOwnProperty(fieldID) && this.fields[fieldID].itemID) {
        return false;
    }
    return true;
};

player.prototype.saveFields = function() {
    redisClient.hset(this.id + code.GAME_NAME, "fields", JSON.stringify(this.fields), null);
};

player.prototype.saveAttribute = function() {
    redisClient.hset(this.id + code.GAME_NAME, "attribute", JSON.stringify(this.attribute), null);
};

player.prototype.sendError = function(req, res, errorCode) {
    res.end(JSON.stringify({cmdID:req.body.cmdID, ret : errorCode}));
}

module.exports = player;