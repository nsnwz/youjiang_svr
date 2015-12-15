/**
 * Created by miller on 2015/12/15.
 */
/**
 * Created with JetBrains WebStorm.
 * User: ma.ji
 * Date: 13-7-9
 * Time: 下午2:39
 * To change this template use File | Settings | File Templates.
 */

// require json files
var fs = require('fs');
var item = require('./config/data/item_item');

/**
 * Data model `new Data()`
 *
 * @param {Array}
 *
 */
var Data = function(data,sFileName) {
    var fields = {};

    data[0].forEach(function(i, k) {
        fields[i] = k;
    });
    data.splice(0, 1);

    var result = {}, item;
    var length = 0;
    data.forEach(function(k) {
        item = mapData(fields, k);
        result[item.id] = item;
        ++length;
    });

    this.data = result;
    this.length = length;
    this.filename= sFileName;

};

/**
 * map the array data to object
 *
 * @param {Object}
 * @param {Array}
 * @return {Object} result
 * @api private
 */
var mapData = function(fields, item) {
    var obj = {};
    for (var k in fields) {
        obj[k] = item[fields[k]];
    }
    return obj;
};

/**
 * find items by attribute
 *
 * @param {String} attribute name
 * @param {String|Number} the value of the attribute
 * @return {Array} result
 * @api public
 */
Data.prototype.findBy = function(attr, value) {
    var result = [];
    var i, item;
    for (i in this.data) {
        item = this.data[i];
        if (item[attr] == value) {
            result.push(item);
        }
    }
    return result;
};

Data.prototype.findBigger = function(attr, value) {
    var result = [];
    value = Number(value);
    var i, item;
    for (i in this.data) {
        item = this.data[i];
        if (Number(item[attr]) >= value) {
            result.push(item);
        }
    }
    return result;
};

Data.prototype.findSmaller = function(attr, value) {
    var result = [];
    value = Number(value);
    var i, item;
    for (i in this.data) {
        item = this.data[i];
        if (Number(item[attr]) <= value) {
            result.push(item);
        }
    }
    return result;
};

/**
 * find item by id
 *
 * @param id
 * @return {Obj}
 * @api public
 */
Data.prototype.findById = function(id) {
    return this.data[id];
};

/**
 * find all item
 *
 * @return {array}
 * @api public
 */
Data.prototype.all = function() {
    return this.data;
};

Data.prototype.reload = function(){
    var self = this;
    if(this.filename == null){
        return 'failed';
    }

    var path = './config/data/'+ this.filename +'.json';
    fs.readFile(path, 'utf8', function (err, data) {
        if (err){
            console.log('********error');
            console.log(JSON.stringify(self.data));
            return 'failed';
        }
        console.log('********before');
        console.log(JSON.stringify(self.data));
        delete  self.data;

        var fields = {};
        data = JSON.parse(data);
        data[0].forEach(function(i, k) {
            fields[i] = k;
        });
        data.splice(0, 1);

        var result = {}, item;
        var length = 0;
        data.forEach(function(k) {
            item = mapData(fields, k);
            result[item.id] = item;
            ++length;
        });

        self.data = result;
        self.length = length;
        console.log('********after');
        console.log(JSON.stringify(self.data));

        return 'success';
    });
};

module.exports = {
    item: new Data(item,'item_item')
};
