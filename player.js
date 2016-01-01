/**
 * Created by miller on 2015/10/21.
 */

require('module-unique').init();

var redisClient = require('./redisclient');
var code = require("./code");
var dataapi = require('./dataapi');
var fieldSeed = require('./fieldSeed');
var item = require('./item');

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
    this.attribute = {coins:0, totalCoins : 0, diamonds:0, maxFieldNum : 1, attack : 300, def : 200, hp : 900, fightTime : 1000, finishTask : 0,
                        buyStealNumLeft : 0, FreeStealNumUsed : 0, powerUsed : 0, cleanDayTime : 0};
    this.bag = {};
    this.fields = {};
    this.fieldsAttribute = {600001 : 0, 600002 : 0, 600003 : 0, fieldsLevel : 1};
    this.skills = {10001 : {lv : 1, selected : false}, 10002 : {lv : 1, selected:false}, 1003 : {lv : 1, selected : true}, 20001 : {useTimes : 0}, 20002 : {useTimes : 0}};
    this.session = undefined;
    this.fightInfo = {};
    this.dailyValue = {};
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
    var nowTime = new Date().getTime();
    return JSON.stringify({id:this.id, name:this.name, pic:this.pic, item:JSON.stringify(this.bag), fields : JSON.stringify(this.fields), attribute : JSON.stringify(this.attribute),
    fieldsAttribute : JSON.stringify(this.fieldsAttribute), now : nowTime});
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
    //redisClient.hset(this.id + code.GAME_NAME, "item", JSON.stringify(this.bag), null);
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
    return true;
};

player.prototype.saveItem = function() {
    redisClient.hset(this.id + code.GAME_NAME, "item", JSON.stringify(this.bag), null);
};

player.prototype.reduceCoins = function(num) {
    if (this.attribute.coins > num) {
        this.attribute.coins -= num;
        return true;
    } else {
        console.log("coins not enough");
        return false;
    }
};

player.prototype.reduceDiamonds = function(num) {
    if (this.attribute.diamonds > num) {
        this.attribute.diamonds -= num;
        return true;
    } else {
        return false;
    }
};

player.prototype.checkCanPlant = function(fieldID) {
    if (fieldID > this.attribute.maxFieldNum * 6) {
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

player.prototype.saveFieldsAttribute = function() {
    redisClient.hset(this.id + code.GAME_NAME, "fieldsAttribute", JSON.stringify(this.fieldsAttribute), null);
};

player.prototype.sendError = function(req, res, errorCode) {
    res.end(JSON.stringify({cmdID:req.body.cmdID, ret : errorCode}));
};

player.prototype.dealSeedOffline = function() {
    var now = new Date().getTime();
    for (var key in this.fields) {
        if (this.fields[key].updateTime < now) {
            this.fields[key].growth += now - this.fields[key].updateTime;
        }
        if (this.fields[key].growth > item.getSeedTotalValue(this.fields[key].itemID)) {
            this.fields[key].growth = item.getSeedTotalValue(this.fields[key].itemID);
        }
    }
    this.saveFields();
};

player.prototype.setSkillSelected = function(skillID) {
    for (var key in this.skills) {
        if (this.skills[key].hasOwnProperty('selected')) {
            if (key == skillID) {
                this.skills[key].selected = true;
            } else {
                this.skills[key].selected = false;
            }
        }
    }
};

player.prototype.saveSkills = function() {
    redisClient.hset(this.id + code.GAME_NAME, "skills", JSON.stringify(this.skills), null);
};

player.prototype.checkSkillCanLevelUp = function(skillID) {
        if (this.skills.hasOwnProperty(skillID)) {
            if (this.skills[skillID].hasOwnProperty('lv')) {
                return true;
            }
        }
        return  false;
}

player.prototype.upSkillLevel = function(skillID) {
    this.skills[skillID].lv++;
};

player.prototype.dealDayValue = function() {
    var date = new Date();
    var today = date.getFullYear() * 10000 + (date.getMonth()  + 1) * 100 + date.getDate();
    if (this.attribute.cleanDayTime != today) {
        this.attribute.FreeStealNumUsed  = 0;
        this.attribute.powerUsed = 0;
        this.attribute.cleanDayTime = today;
    }
    this.saveAttribute();
};

module.exports = player;