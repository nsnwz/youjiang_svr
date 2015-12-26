/**
 * Created by miller on 2015/12/16.
 */

var count = 0;

var fight = function(p1, p2) {
    this.id = ++count;
    this.player1 = null;
    this.player2 = null;
    console.log("new fight");
};

module.exports = fight;

var pro = fight.prototype;

pro.setPlayer = function(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
};

pro.getID = function() {
    return this.id;
};

