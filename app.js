/**
 * Created by miller on 2015/12/26.
*/

'use strict';
var http = require("http");
var cmds = require('./cmd');
var code = require('./code');
var log = require('./log.js').helper;

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

httpServer.listen(8000);
log.writeInfo("server start");


process.on('uncaughtException', function (err) {
    log.writeErr(' Caught exception: ', err.stack);
    console.log(' Caught exception: ', err.stack);
});