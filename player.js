/**
 * Created by miller on 2015/10/21.
 */

require('module-unique').init();

var redisClient = require('./redisclient');

/**
 * 用户数据信息
 */
var player = function() {
    this.uid = 0;
    this.name = 'default';
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



module.exports = player;