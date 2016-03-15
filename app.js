/**
 * Created by miller on 2015/12/26.
*/

'use strict';
var http = require("http");
var async = require('async');
var cmds = require('./cmd');
var code = require('./code');
var log = require('./log.js').helper;
var playerSystem = require('./playerSystem');
var items = require('./item.js');

var httpServer = http.createServer(function (req, res) {
    var dataChunks = undefined;
    req.on('data', function (chunk) {
        console.log("receive data");
        if(dataChunks === undefined)
            dataChunks = [];
            dataChunks.push(chunk);
        });

    req.on('end', function () {
        var body;
        if(dataChunks && dataChunks.length !== 0){
            body = Buffer.concat(dataChunks);
        }
        if(req.method === "OPTIONS"){
            res.writeHead(200, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Max-Age": "1728000", "Content-Type" :"text/plain; charset=UTF-8"});
            res.end();
        }else{
            res.setHeader("Access-Control-Allow-Origin", "*");
            try {
                req.body = JSON.parse(body.toString('utf-8'));
                log.writeDebug(req.body.uid + '|' + req.body.cmdID + '|' + req.body.cmdParams);
                console.log(req.body.uid + '|' + req.body.cmdID + '|' + req.body.cmdParams);
                if (typeof cmds[req.body.cmdID] == 'function') {
                    var p = playerSystem.getPlayer(req.body.uid, req.body.svrID);
                    if (p) {
                        log.writeDebug(p.fields);
                    }
                    cmds[req.body.cmdID](req, res);
                } else {
                    res.end(JSON.stringify({cmdID : req.body.cmdID, ret: code.SYSTEM_ERROR}));
                }
            } catch(err) {
                var errorMsg = 'Error ' + new Date().toISOString() + req.body + err.stack + err.message;
                log.writeErr(errorMsg);
                res.end(JSON.stringify({ret:code.SYSTEM_ERROR}));
            }
        }

    });
    req.on('error', function (err) {
        log.writeErr("request from client err ", err);
    });
});

async.waterfall([
    function(callback) {
        items.checkConfig(function(err) {
           callback(err);
        });
    }, function(callback) {
        httpServer.listen(8000);
        log.writeInfo("server start");
        callback(null);
    }, function(callback) {
        var oneSecond = 1000 * 1 * 60; // one second = 1000 x 1 ms
        setInterval(function() {
            playerSystem.delExpirePlayer();
        }, oneSecond);
        callback(null);
    }
    ], function(err) {
        if (err) {
            log.writeErr('start err');
        }
    });

process.on('uncaughtException', function (err) {
    log.writeErr(' Caught exception: ', err.stack);
    console.log(' Caught exception: ', err.stack);
});