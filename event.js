/**
 * Created by miller on 2016/1/9.
 */

var eventEmitter = require('events').EventEmitter;
var item = require('./item');

var event = new eventEmitter();
module.exports = event;

event.on('harvest', function(p, itemID) {
    if (p.dayHarvest[item.getSeedType(itemID)][item.getSeedLv(itemID)] == undefined) {
        p.dayHarvest[item.getSeedType(itemID)][item.getSeedLv(itemID)] = 0;
    }
    p.dayHarvest[item.getSeedType(itemID)][item.getSeedLv(itemID)] += 1;
});



