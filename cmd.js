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
     */
    1002 : playerHandler.plant,
    /*
        CMD:增加物品
     */

    1003 : playerHandler.addItem,

    /*
        CMD 收获
        INPUT {fields : []}
        OUTPUT
     */
    1004 : playerHandler.harvest,

    /*
        CMD 获取排名
        INPUT {rankNmae, startID, endID}
     */
    1005 : playerHandler.getRank,

    /*
        CMD 增加成长
        INPUT {addValue}
     */
    1006 : playerHandler.addGrowth

};

module.exports = cmds;