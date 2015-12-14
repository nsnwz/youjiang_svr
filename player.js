/**
 * Created by miller on 2015/10/21.
 */

require('module-unique').init();

var redisClient = require('./redisclient');

/**
 * 用户数据信息
 */
var player = function() {
    this.openid = null;
    this.nickname = 'default';
    this.sex = null;
    this.language = null;
    this.city = null;
    this.province = null;
    this.country = null;
    this.headimgurl = null;
    this.privilege = null;
    this.bag = {};
    this.fields = {};
    this.atk = 0;
    this.def = 0;
    this.skills = {};
    this.session = null;
};

player.prototype.initFromDB = function(dbrecord) {
    this.openid = dbrecord.openid;
    this.nickname = dbrecord.nickname;
    this.sex = dbrecord.sex;
    this.language = dbrecord.language;
    this.city = dbrecord.city;
    this.province = dbrecord.province;
    this.country = dbrecord.country;
    this.headimgurl = dbrecord.headimgurl;
    this.privilege = dbrecord.privilege;
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
    var data = {openid:this.openid, nickname:this.nickname, sex:this.sex, language:this.language, city:this.city, province:this.province, country:this.country, headimgurl:this.headimgurl, privilege:this.privilege};
    redisClient.updateKey(this.openid, JSON.stringify(data));
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

player.prototype.descItem = function(nID, nNum) {
    if (this.getItemAmount(nID) < nNum) {
        return false;
    } else {
        this.bag[nID] -= nNum;
    }
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
    redisClient.hset(1000 + "PLANT", "item", JSON.stringify(this.bag), null);
    return true;
};

player.prototype.putSeed = function(nID, fieldID) {
    if (this.descItem(nID, 1)) {
        var seed = new fieldSeed();
        seed.itemId = nID;
        seed.starttime = date.getTime();
        seed.idx = fieldID;
        this.fields[fieldID] = seed;
    }
    redisClient.hset(1000 + "PLANT", "item", JSON.stringify(this.bag), null);
};




module.exports = player;