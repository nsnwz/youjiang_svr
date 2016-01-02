/**
 * Created by miller on 2015/12/27.
 */

var playerHandler = require('./playerHandler');

var cmds = {};


cmds = {
    /*
        CMD:登入
        INPUT：{cmdID, uid, token}
        OUTPUT: {cmdID, }
     */
    1000 : playerHandler.getPlayerInfo,
    /*
        CMD:注册用户信息
     */
    1001 : playerHandler.addPlayer,
    /*
        CMD:种植
        INPUT {fieldID : itemID, fieldID : itemID}
        OUTPUT {fieldID : {itemID, startTime, growth, updateTime}, ...}
     */
    1002 : playerHandler.plant,
    /*
        CMD:增加物品
        INPUT {itemID : count, itemID : count, ....}
     */
    1003 : playerHandler.buyItem,
    /*
        CMD 收获
        INPUT {fields : [fieldID, fieldID, ...]}
        OUTPUT {fields, p.attribute}
     */
    1004 : playerHandler.harvest,
    /*
        CMD 获取排名
        INPUT {rankNmae, startID, endID}
        OUTPUT [member, score, ...]
     */
    1005 : playerHandler.getRank,
    /*
        CMD 增加成长
        INPUT {addValue}
        OUTPUT {fields :{itemID, startTime, growth, updateTime}, ...}
     */
    1006 : playerHandler.addGrowth,
    /*
        CMD 购买加速成长
        INPUT {600001 : times, 600002 : times, 600003 : times}
     */
    1007 : playerHandler.buyAccelerateGrowth,
    /*
        CMD 进入战斗
        INPUT {id : }
     */
    1008 : playerHandler.enterFight,
    /*
        CMD 选择技能
        INPUT {selectedSKillID:}
     */
    1009 : playerHandler.selectSkill,
    /*
        CMD 校验战斗
        INPUT [fight : {[type, pos, damage] ...}]
        type 0为伤害， 1为技能
     */
    1010 : playerHandler.checkFight,
    /*
        CMD 获取背包
        OUTPUT {itemID : count, itemID : count}
     */
    1011 : playerHandler.getBag,
    /*
        CMD 购买土地
        INPUT
     */
    1012 : playerHandler.buyFields,
    /*
        CMD 土地升级
     */
    1013 : playerHandler.upFieldLevel,
    /*
        CMD 技能升级
        INPUT {skillID:}
     */
    1014 : playerHandler.upSkillLevel,
    /*
        CMD 获取服务器时间
     */
    1015 : playerHandler.getServerTime,
    /*
        CMD 获取用户信息
        INPUT {uids : [id, id, ...]}
     */
    1016 : playerHandler.getSeveralPlayersInfo,
    /*
        CMD 获取排行榜附近的用户
        INPUT {rankName}
     */
    1017 : playerHandler.getRankNearPlayers,
    /*
        CMD 偷
        INPUT {id : }
     */
    1018 : playerHandler.steal,
    /*
        CMD 获取偷取记录
     */
    1019 : playerHandler.getStealMePlayers,
    /*
        CMD 获取用户PLANT中的成熟粽子
        INPUT {id:}
     */
    1020 : playerHandler.getPlayerMatureSeed,
    /*
        CMD 使用技能
        INPUT {pos, skillID}
     */
    1021 : playerHandler.useSkill

};

module.exports = cmds;