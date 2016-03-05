/**
 * Created by miller on 2015/10/21.
 */

require('module-unique').init();

var redisClient = require('./redisclient');
var code = require("./code");
var dataapi = require('./dataapi');
var fieldSeed = require('./fieldSeed');
var item = require('./item');
var Task = require('./task');
var event = require('./event');
var utils = require('./utils');
var log = require('./log.js').helper;
var async = require('async');
var dataapi = require('./dataapi');

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
    this.egretId = undefined;
    this.attribute = {
                        coins:0, //钱数
                        totalCoins : 0, //累加获取的钱的总数
                        createRoleTime : 0,
                        egretId : null,
                        diamonds:0, //钻石数目
                        maxFieldNum : 1, //田块数目
                        atk : 300, //攻击
                        def : 200, //防御
                        hp : 900, //血量
                        fightTime : 1000, //攻击时间间隔
                        finishTask : 0, //剧情模式完成的数目
                        bossFinishTask : 0,//挑战模式完成的数目
                        buyStealNumLeft : 0, //购买的偷的次数
                        freeStealNumUsed : 0, //免费的偷的次数(每天清除)
                        powerUsed : 0, //已经使用的活力值数目(每天清除)
                        buyPowerNum : 0, //购买的活力点
                        cleanDayTime : 0, //上次清理每日数据的时间
                        bossFightHp : -1, //挑战模式用户保留的血量，-1表示需要初始化为初始血量(每天清除)
                        starNum : 0, //战斗星级
                        mood : 1, //心情 (初始值需要每天清除, 1表示差，2表示一般，3表示高兴)
                        onlineTime : 0, //在线时长(每天清除)
                        onlineUpdateTime : 0, //在线时长更新时间(登入额时候设置为登入时间)
                        lastDoneRandEventOlTime : 0, //上次昨晚随机事件的在线时长(每天清除)
                        randEventTimes : 0, //随机事件的次数(每天清除)
                        randEventID : 0, //随机到的事件(每天清除)
                        offlineCoins : 0, //离线增加的金钱数
                        firstCharge : 0, //首次充值
                        chargeGift : 0,
                        chargeGift1 :  0,
                        buyStarNum : 0 //购买的星数
                       }; //
    this.bag = {}; //背包
    this.fields = {}; //田块种植信息 (
    this.fieldsAttribute = {
                                600001 : 0, //田块种植技能1，value为持续的到期时间
                                600002 : 0, //田块种植技能2，value为持续的到期时间
                                600003 : 0, //田块种植技能3，value为持续的到期时间
                                fieldsLevel : 1 //田块的等级
                               };
    this.skills = {
                     10001 : {lv : 1, selected : true}, //战斗技能, 等级，是否选择
                     10002 : {lv : 1, selected : false}, //战斗技能, 等级，是否选择
                     10003 : {lv : 1, selected : false}, //战斗技能, 等级，是否选择
                     20001 : {useTimes : 1, selected : true}, //可以使用次数，是否选择
                     20002 : {useTimes : 1, selected : false}, //可以使用次数，是否选择
                     30001 : {lv : 0} //等级为零表示没有此技能，大于0表示有
                   };
    this.session = undefined;
    this.fightInfo = {
                         mode : 0,
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
                         boss20Hurt : 0
                        };
    this.stealInfo = []; //保存上次用户随机到的偷取哪些用户的信息
    this.stealMePlayers = [];//保存偷取自己的用户信息
    this.cliSetData = {};//客户端使用的key/value
    this.task = new Task(); //任务
    this.titles = [];
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
    this.egretId = dbrecord.egretId;
};

player.prototype.getLoginJson = function() {
    var nowTime = utils.getSecond();
    return JSON.stringify({id:this.id, name:this.name, pic:this.pic, egretId : this.egretId, item:JSON.stringify(this.bag), fields : JSON.stringify(this.fields), attribute : JSON.stringify(this.attribute),
    fieldsAttribute : JSON.stringify(this.fieldsAttribute), now : nowTime , skills : JSON.stringify(this.skills)});
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
    var data = {id:this.id, name:this.name, pic:this.pic, egretId : this.egretId};
    redisClient.updateKey(this.egretId, JSON.stringify(data));
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
    if (nID == 60000) {
        event.emit('60000', this);
    }
    console.log(JSON.stringify(this.bag));
    return true;
};

player.prototype.saveItem = function() {
    redisClient.hset(this.id + code.GAME_NAME, "item", JSON.stringify(this.bag), null);
};

player.prototype.reduceCoins = function(num) {
    if (isNaN(parseInt(num))) {
        log.writeErr('num is not number' + num);
        return false;
    }
    if (this.attribute.coins >= num) {
        this.attribute.coins -= num;
        return true;
    } else {
        console.log("coins not enough");
        return false;
    }
};

player.prototype.reduceDiamonds = function(num) {
    if (isNaN(parseInt(num))) {
        log.writeErr('num is not number' + num);
        return false;
    }
    if (this.attribute.diamonds >= num) {
        this.attribute.diamonds -= num;
        return true;
    } else {
        return false;
    }
};

player.prototype.checkCanPlant = function(fieldID) {
    if (fieldID > this.attribute.maxFieldNum * 6) {
        log.writeErr(this.id + "|" + "field out max" + "|" + fieldID + '|' + this.attribute.maxFieldNum * 6);
        return false;
    }
    if (this.fields.hasOwnProperty(fieldID) && this.fields[fieldID].itemID) {
        log.writeErr(this.id + "|" + "have item" + "|" + fieldID );
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
    var now = utils.getSecond();
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

player.prototype.dealofflineCoins = function() {
    var now = utils.getSecond();
    var diffTime = now > this.attribute.onlineUpdateTime ? now - this.attribute.onlineUpdateTime : 0;
    var addHour = parseInt(diffTime / (60 * 60)) > 5 ? 5 : parseInt(diffTime / (60 * 60));
    this.attribute.offlineCoins = addHour * 200000;
    this.addCoins(addHour * 200000);
    this.attribute.onlineUpdateTime = now;
    if (this.attribute.bossFightHp == -1) {
        this.attribute.bossFightHp = this.attribute.hp;
    }
};

player.prototype.setSkillSelected = function(skillID) {
    for (var key in this.skills) {
        if (this.skills[key].hasOwnProperty('selected') && (parseInt(key / 10000) == parseInt(skillID / 10000))) {
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
            if (this.skills[skillID].hasOwnProperty('lv') && this.skills[skillID].lv > 0) {
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
        this.attribute.freeStealNumUsed  = 0;
        this.attribute.powerUsed = 0;
        this.attribute.bossFightHp = -1;
        this.attribute.mood = parseInt(Math.random() * 2 + 1);
        this.attribute.onlineTime = 0;
        this.attribute.onlineUpdateTime = utils.getSecond();
        this.attribute.lastDoneRandEventOlTime = 0;
        this.attribute.randEventTimes = 0;
        this.attribute.randEventID = 0;
        this.task.cleanDayTask();
        this.attribute.cleanDayTime = today;
        this.attribute.bossFightHp = this.attribute.hp;
        this.attribute.bossFinishTask = 0;
    }
    this.saveAttribute();
    this.saveTask();
};

player.prototype.saveStealInfo = function() {
    redisClient.hset(this.id + code.GAME_NAME, "stealInfo", JSON.stringify(this.stealInfo), null);
};

player.prototype.saveTitle = function() {
    redisClient.hset(this.id + code.GAME_NAME, "title", JSON.stringify(this.title), null);
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
    for (var key in this.stealInfo) {
        if (this.stealInfo[key][0] == id) {
            return true;
        }
    }
    for (var key in this.stealMePlayers) {
        if (this.stealMePlayers[key][0] == id) {
            return true;
        }
    }
    return false;
};

player.prototype.clearNearPlayersInfo = function() {
    this.stealInfo.length = 0;
};

player.prototype.addCoins = function(addNum) {
    if (isNaN(parseInt(addNum))) {
        log.writeErr('num is not number' + addNum);
        return false;
    }
    this.attribute.coins += addNum;
    this.attribute.totalCoins += addNum;
    redisClient.zincrby(code.GAME_NAME + 'coins', addNum, this.id, null);
};

player.prototype.addDiamonds = function(addNum) {
    if (isNaN(parseInt(addNum))) {
        log.writeErr('num is not number' + addNum);
        return false;
    }
    this.attribute.diamonds += addNum;
};

player.prototype.saveTask = function() {
    redisClient.hset(this.id + code.GAME_NAME, "task", JSON.stringify(this.task._task), null);
};

player.prototype.saveDayHarvest = function(taskID) {
    redisClient.hset(this.id + code.GAME_NAME, "dayHarvest", JSON.stringify(this.dayHarvest), null);
};

player.prototype.checkCanUseSkill = function (id) {
    for (var key in this.skills) {
        if (id == parseInt(key) && this.skills[key].hasOwnProperty('useTimes') && this.skills[key].useTimes > 0
            && this.skills[key].hasOwnProperty('selected') && this.skills[key].selected) {
            return true;
        }
    }
    return false;
};

player.prototype.reduceSkillUseTimes = function(id) {
    for (var key in this.skills) {
        if (id == parseInt(key)
            && this.skills[key].hasOwnProperty('useTimes')
            && this.skills[key].useTimes > 0
            && this.skills[key].hasOwnProperty('selected')
            && this.skills[key].selected) {
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
        this.fightInfo.mode = 0;
        this.fightInfo.id  = 0;
        this.fightInfo.startTime = 0;
        this.fightInfo.playerInitHp = 0;
        this.fightInfo.bossInitHp = 0;
        this.fightInfo.playerInitAtk = 0;
        this.fightInfo.bossInitAtk = 0;
        this.fightInfo.playerInitDef = 0;
        this.fightInfo.bossInitDef = 0;
        this.fightInfo.posRightAtk = 0;
        this.fightInfo.posRightDef = 0;
        this.fightInfo.posRightHp = 0;
        this.fightInfo.posLeftAtk = 0;
        this.fightInfo.posLeftDef = 0;
        this.fightInfo.posLeftHp = 0;
        this.fightInfo.playerUseSkills = {};
        this.fightInfo.bossUseSkills = {};
        this.fightInfo.playerNotHurtState = 0;
        this.fightInfo.bossNotHurtState = 0;
        this.fightInfo.playerNotHurtTime = 0;
        this.fightInfo.bossNotHurtTime = 0;
        this.fightInfo.player20Hurt = 0;
        this.fightInfo.boss20Hurt = 0;
};

player.prototype.initTask = function (task) {
    this.task._task = task;

};

player.prototype.reducePower = function(mode) {
    var reduceValue  = 0;
    if (mode == 1) {
        reduceValue = 1;
    } else if (mode == 2) {
        reduceValue = 2;
    }
    if (this.attribute.powerUsed + reduceValue > 50 + this.attribute.buyPowerNum) {
        return false;
    }
    if (50 - this.attribute.powerUsed >= reduceValue) {
        this.attribute.powerUsed += reduceValue;
    } else {
        var value = reduceValue - (50 - this.attribute.powerUsed);
        this.attribute.powerUsed = 50;
        this.attribute.buyPowerNum -= value;
    }
    this.saveAttribute();
    return true;

};

player.prototype.register = function(egretPlayer, newUid) {
    this.id = newUid;
    this.egretId = egretPlayer.id;
    this.name = egretPlayer.name;
    this.pic = egretPlayer.pic;
    this.saveBaseinfo();
    this.attribute.egretId = egretPlayer.id;
    this.attribute.coins = 0;
    this.attribute.totalCoins = this.attribute.coins;
    this.attribute.diamonds = 200;
    this.attribute.createRoleTime = utils.getSecond();
    this.attribute.onlineUpdateTime = utils.getSecond();
    this.fields[3] = {itemID:10003, startTime:utils.getSecond(), growth:item.getSeedTotalValue(10003), updateTime : 0};
    this.fields[4] = {itemID:20003, startTime:utils.getSecond(), growth:item.getSeedTotalValue(20003), updateTime : 0};
    this.fields[5] = {itemID:30003, startTime:utils.getSecond(), growth:item.getSeedTotalValue(30003), updateTime : 0};
    this.fields[6] = {itemID:40003, startTime:utils.getSecond(), growth:item.getSeedTotalValue(40003), updateTime : 0};
    this.addItem(10002, 6);
    this.addItem(20002, 6);
    this.addItem(30002, 6);
    this.addItem(40002, 6);
    this.saveItem();
    this.saveAttribute();
    this.saveFields();
};

player.prototype.updateFightID = function(mode, id) {
    if (mode == 1) {
        if (id > this.attribute.finishTask && id == this.attribute.finishTask + 1) {
            this.attribute.finishTask = id;
        }
    } else if (mode == 2) {
        if (this.attribute.bossFinishTask + 1 == id) {
            this.attribute.bossFinishTask = id;
        }
    }
};

player.prototype.charge = function(num) {
    this.addDiamonds(num * 100);
    redisClient.hincrby(this.egretId + code.GAME_NAME, "money", -num, function(err) {});
    if (!this.attribute.firstCharge) {
        this.addDiamonds(num * 100 * 0.2);
        for (var i = 1; i < 5; i++) {
            this.addItem(i * 10000 + 5, 3);
        }
        this.skills[20001].useTimes += 10;
        this.skills[20002].useTimes += 10;
        this.attribute.firstCharge = 1;
    }
    if (num == 10) {
        this.addDiamonds(num * 100 * 0.2);
    } else if (num == 50) {
        this.addDiamonds(num * 100 * 0.25);
    } else if (num == 100) {
        this.skills[20001].useTimes += 20;
        this.skills[20002].useTimes += 20;
        for (var i = 1; i < 4; i++) {
            this.addItem(i * 10000 + 5, 12);
        }
        this.addItem(4 * 10000 + 5, 14);
        this.addItem(61000, 1);
        this.addDiamonds(num * 100 * 0.30);
    } else if (num == 1000) {
        this.skills[20001].useTimes += 200;
        this.skills[20002].useTimes += 200;
        for (var i = 1; i < 5; i++) {
            this.addItem(i * 10000 + 5, 150);
        }
        this.skills[30001].lv = 1;
        this.addDiamonds(num * 100 * 0.4);
    }
    this.saveSkills();
    this.saveItem();
    this.saveAttribute();
};

player.prototype.winPlantFight = function(req, res, id) {
    var stars = {};
    var first = false;
    var self = this;
    async.waterfall([
        function(cb) {
            redisClient.hget(code.GAME_NAME, "stars", function(err, redis) {
                if (redis) {
                    stars = JSON.parse(redis);
                }
                if (!stars.hasOwnProperty(id)) {
                    stars[id] = {uid : self.id, gotGiftTime : 0};
                    first = true;
                }
                cb(null);
            });
        }, function(cb) {
            redisClient.hset(code.GAME_NAME, "stars", JSON.stringify(stars), function(err, redis) {
                if (!err) {
                    var addCoins = 0;
                    var addMi = 0;
                    var addItem = 0;
                    if (first) {
                        var elem = dataapi.starBossFight.findById(id);
                        addCoins = elem.awardCoin;
                        addMi = elem.awardMi;
                        addItem = elem.awardItem;
                        self.addCoins(addCoins);
                        self.addItem(addItem, 1);
                        self.addDiamonds(addMi);
                        self.saveAttribute();
                        self.saveItem();
                    }
                    self.clearFightInfo();
                    res.end(JSON.stringify({cmdID: req.body.cmdID, ret: code.OK, cmdParams : JSON.stringify({awardCoin : addCoins, awardItem : addItem, awardMi : addMi,
                        fightResult : 1, bossFightHp : self.attribute.bossFightHp, starNum : 0, finishTask : self.attribute.finishTask, bossFinishTask : self.attribute.bossFinishTask})}));
                }
            });
        }
    ], function(err) {

    });
};

module.exports = player;
