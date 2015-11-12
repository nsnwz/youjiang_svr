/**
 * Created by miller on 2015/10/21.
 */

require('module-unique').init();

/**
 * 用户数据信息
 */
var player = function() {
    this.uid = 0;
    this.name = 'default';
};

player.prototype.initFromDB = function(dbrecord) {
    this.uid = dbrecord.uid;
    this.name = dbrecord.name;
    this.score = dbrecord.score;
};

player.prototype.test = function() {
    console.log('this just test');
}



module.exports = player;