/**
 * Created by miller on 2016/1/9.
 */

var dataapi = require('./dataapi');

var task = module.exports = {};

task.checkFinTask = function(p, taskID) {
    var ele = dataapi.task.findById(taskID);
    if (!ele) {
        return false;
    }
    if (ele.seedLv1 && p.dayHarvest[ele.type][ele.seedLv1] < (p.task.day[taskID] + 1) * ele.seedLv1) {
        return false;
    }
    if (ele.seedLv2 && p.dayHarvest[ele.type][ele.seedLv2] < (p.task.day[taskID] + 1) * ele.seedLv2) {
        return false;
    }
    if (ele.seedLv2 && p.dayHarvest[ele.type][ele.seedLv3] < (p.task.day[taskID] + 1) * ele.seedLv3) {
        return false;
    }
    if (ele.seedLv4 && p.dayHarvest[ele.type][ele.seedLv4] < (p.task.day[taskID] + 1) * ele.seedLv4) {
        return false;
    }
    if (ele.seedLv5 && p.dayHarvest[ele.type][ele.seedLv5] < (p.task.day[taskID] + 1) * ele.seedLv5) {
        return false;
    }
    return true;
};
