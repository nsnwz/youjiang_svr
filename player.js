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
    this.attribute = {
                        coins:0, //钱数
                        totalCoins : 0, //累加获取的钱的总数
                        diamonds:0, //钻石数目
                        maxFieldNum : 1, //田块数目
                        atk : 300, //攻击
                        def : 200, //防御
                        hp : 900, //血量
                        fightTime : 1000, //攻击时间间隔
                        finishTask : 0, //完成的任务数目
                        buyStealNumLeft : 0, //购买的偷的次数
                        freeStealNumUsed : 0, //免费的偷的次数
                        powerUsed : 0, //已经使用的活力值数目
                        cleanDayTime : 0 //上次清理每日数据的时间
                       };
    this.bag = {}; //背包
    this.fields = {}; //田块种植信息
    this.fieldsAttribute = {
                                600001 : 0, //田块种植技能1，value为持续的到期时间
                                600002 : 0, //田块种植技能2，value为持续的到期时间
                                600003 : 0, //田块种植技能3，value为持续的到期时间
                                fieldsLevel : 1 //拥有的总的田块数目
                               };
    this.skills = {
                     10001 : {lv : 1, selected : false}, //战斗技能
                     10002 : {lv : 1, selected : false},
                     10003 : {lv : 1, selected : true},
                     20001 : {useTimes : 0, selected : false},
                     20002 : {useTimes : 0, selected : true}
                   };
    this.session = undefined;
    this.fightInfo = {
                         id :0,
                         startTime : 0,
                         playerInitHp : 0,
                         bossInitHp : 0,
                         playerInitAtk : 0,
                         bossInitAtk : 0,
                         playerInitDef : 0,
                         bossInitDef : 0,
                         posRightAtk : 0,
                         posRightDef : 0,
                         posRightHp : 0,
                         posLeftAtk : 0,
                         posLeftDef : 0,
                         posLeftHp : 0,
                         playerUseSkills : {},
                         bossUseSkills : {},
                         playerNotHurtState : 0,
                         bossNotHurtState : 0,
                         playerNotHurtTime : 0,
                         bossNotHurtTime : 0,
                         player20Hurt : 0,
                         boss20Hurt : 0,
                        };
    this.dailyValue = {};
    this.stealInfo = [];
    this.stealMePlayers = [];
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

player.prototype.getSkillLv = function(skillID) {
    if (this.skills.hasOwnProperty(skillID)) {
        if (this.skills[skillID].hasOwnProperty('lv')) {
            return this.skills[skillID].lv;
        }
    }
    return  1;
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

player.prototype.saveStealInfo = function() {
    redisClient.hset(this.id + code.GAME_NAME, "stealInfo", JSON.stringify(this.stealInfo), null);
};

player.prototype.checkStealNum = function() {
    var freeStealNumLeft = this.attribute.freeStealNumUsed > code.MAX_FREE_STEAL_NUM ? 0 : code.MAX_FREE_STEAL_NUM - this.attribute.freeStealNumUsed;
    if (this.attribute.buyStealNumLeft + freeStealNumLeft > 0) {
        return true;
    }
    return false ;
};

player.prototype.reduceStealNum = function() {
    var freeStealNumLeft = this.attribute.freeStealNumUsed > code.MAX_FREE_STEAL_NUM ? 0 : code.MAX_FREE_STEAL_NUM - this.attribute.freeStealNumUsed;
    if (freeStealNumLeft > 0) {
        this.attribute.freeStealNumUsed += 1;
        return;
    } else {
        if (this.attribute.buyStealNumLeft > 0) {
            this.attribute.buyStealNumLeft -= 1;
            return;
        }
    }
};

player.prototype.checkStealID = function(id) {
    console.log("stealInfo ", this.stealInfo);
    for (var key in this.stealInfo) {
        if (this.stealInfo[key] == id && key % 2 == 0) {
            return true;
        }
    }
    return false;
};

player.prototype.clearNearPlayersInfo = function() {
    this.stealInfo.length = 0;
};

player.prototype.addCoins = function(addNum) {
    this.attribute.coins += addNum;
    this.attribute.totalCoins += addNum;
};

player.prototype.checkCanUseSkill = function (id) {
    for (var key in this.skills) {
        if (id == key && this.skills[key].hasOwnProperty('useTimes') && this.skills[key].useTimes > 0
            && this.skills[key].hasOwnProperty('selected') && this.skills[key].selected) {
            return true;
        }
    }
    return false;
};

player.prototype.reduceSkillUseTimes = function(id) {
    for (var key in this.skills) {
        if (id == key && this.skills[key].hasOwnProperty('useTimes') && this.skills[key].useTimes > 0
            && this.skills[key].hasOwnProperty('selected') && this.skills[key].selected) {
            this.skills[key].useTimes -= 1;
        }
    }
};

player.prototype.updateFightNoHurt = function(updateTime) {
    if (this.fightInfo.playerNotHurtTime < updateTime && updateTime - this.fightInfo.playerNotHurtTime > 7) {
        this.fightInfo.playerNotHurtState = 0;
        this.fightInfo.playerNotHurtTime = 0;
    }
    if (this.fightInfo.bossNotHurtTime < updateTime && updateTime - this.fightInfo.bossNotHurtTime > 7) {
        this.fightInfo.bossNotHurtState = 0;
        this.fightInfo.bossNotHurtTime = 0;
    }
};

player.prototype.clearFightInfo = function () {
    /*
        this.fightInfo.id  = 0;
        startTime : 0,
        playerInitHp : 0,
        bossInitHp : 0,
        playerInitAtk : 0,
        bossInitAtk : 0,
        playerInitDef : 0,
        bossInitDef : 0,
        posRightAtk : 0,
        posRightDef : 0,
        posRightHp : 0,
        posLeftAtk : 0,
        posLeftDef : 0,
        posLeftHp : 0,
        playerUseSkills : {},
    bossUseSkills : {},
    playerNotHurtState : 0,
        bossNotHurtState : 0,
        playerNotHurtTime : 0,
        bossNotHurtTime : 0,
        player20Hurt : 0,
        boss20Hurt : 0,
        */
};

module.exports = player;