/**
 * Created by miller on 2015/12/27.
 */

var playerHandler = require('./playerHandler');

var cmds = {};


cmds = {
    1000 : playerHandler.getPlayerInfo, /*登入*/
    1001 : playerHandler.addPlayer /*注册*/
};

module.exports = cmds;