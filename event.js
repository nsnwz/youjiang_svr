/**
 * Created by carl on 2016/1/4.
 */

var eventEmitter = require('events').EventEmitter;

var ee = new eventEmitter();

ee.on('login', function(id, itemID, count) {
    console.log('login ', id);
});



module.exports = ee;