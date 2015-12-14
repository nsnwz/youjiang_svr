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

player.prototype.addItem = function(nID, nAmount){
    /*
    if(nID == 0){
        this.lastError = code.ITEM_ERROR.ERRORITEMCONFIGID;
        return false;
    }


    var bagLength = Object.getOwnPropertyNames(this.bag).length;
    if(bagLength >= def.PLAYER.ITEMBAG_MAX){
        this.lastError = code.ITEM_ERROR.MAXBAGCOUNT;
        return false;
    }else{
        if(!!this.bag[nID]){
            var item = this.bag[nID];
            item.amount += nAmount;
            if(item.carryLimit != 0){
                if(item.amount > item.carryLimit){
                    //this.itemBagOverflow(nID,(item.amount-item.carryLimit));
                    item.amount = item.carryLimit;
                }
            }
            this.modifyItemDirty(nID);
            this.onBagChange([],[],[nID]);
            this.onViewChange(def.VIEW_CHANGE_TYPE.TYPE_ITEM, nID, nAmount);


        }else{
            var item = new Item();
            item.initFromDB({configid:nID,
                amount:nAmount,
                status:0
            });
            if(item.configid == 0){
                item = null;
                logger.error('add item with config id is 0');
                return false;
            }
            this.bag[nID] = item;
            if(item.carryLimit != 0){
                if(item.amount > item.carryLimit){
                    //this.itemBagOverflow(nID,(item.amount-item.carryLimit));
                    item.amount = item.carryLimit;
                }
            }
            this.addItemDirty(nID);
            this.onBagChange([nID],[],[]);
            this.onViewChange(def.VIEW_CHANGE_TYPE.TYPE_ITEM, nID, nAmount);


        }*/
    if (!this.bag[nID]) {
        console.log(this.bag[nID]);
        this.bag[nID] = 0;
        this.bag[nID] += nAmount;
        console.log(this.bag[nID], nAmount);
    } else {
        this.bag[nID] += nAmount;
    }
    console.log(JSON.stringify(this.bag));
    redisClient.hset(1000 + "PLANT", "item", JSON.stringify(this.bag), null);
    return true;
};

player.prototype.putSeed = function(nID, fieldID) {
    var seed = new fieldSeed();
    seed.itemId = nID;
    seed.starttime = date.getTime();
    seed.idx = fieldID;
    this.fields[fieldID] = seed;
    redisClient.hset(1000 + "PLANT", "item", JSON.stringify(this.bag), null);
};




module.exports = player;