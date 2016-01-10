/**
 * Created by miller on 2015/10/22.
 */

var utils = module.exports;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function(cb) {
    if(!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

/**
 * clone an object
 */
utils.clone = function(origin) {
    if(!origin) {
        return;
    }

    var obj = {};
    for(var f in origin) {
        if(origin.hasOwnProperty(f)) {
            obj[f] = origin[f];
        }
    }
    return obj;
};

utils.size = function(obj) {
    if(!obj) {
        return 0;
    }

    var size = 0;
    for(var f in obj) {
        if(obj.hasOwnProperty(f)) {
            size++;
        }
    }

    return size;
};

utils.hasSomeElement = function(e, o){
    for(var i in o){
        if(o[i] == e){
            return true;
        }
    }
    return false;
};

utils.get0Today = function(){
    var zeroToday = new Date();
    zeroToday.setHours(0,0,0,0);
    return (Math.round(zeroToday.getTime() / 1000));
};

utils.getSecond = function() {
    return parseInt(new Date().getTime() / 1000);
};
