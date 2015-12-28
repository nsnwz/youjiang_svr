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
     */
    1002 : playerHandler.plant,

    1003 : playerHandler.addItem
};

module.exports = cmds;