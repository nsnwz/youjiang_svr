/**
 * Created by miller on 2016/1/9.
 */

var eventEmitter = require('events').EventEmitter;
var item = require('./item');

var event = new eventEmitter();

event.on('harvest', function(p, itemID) {
    p.task.updateTask10001(itemID);
    p.task.updateTask10002(itemID);
    p.task.updateTask10003(itemID);
    p.task.updateTask10004(itemID);
    p.task.updateTask10005(itemID);
    p.task.updateTask10006(itemID);
    p.task.updateTask10007(itemID);
    p.task.updateTask10008(itemID);
    p.task.updateTask10001(itemID);
    p.task.updateTask20001To20020(itemID);
    p.saveTask();
});

event.on('fight', function(p, starNum) {
    p.task.updateTask30001(starNum);
    p.task.updateTask40001To40005(starNum);
    p.saveTask();
});

event.on('61000', function(p) {
    p.task.updateTask100000();
});

module.exports = event;

