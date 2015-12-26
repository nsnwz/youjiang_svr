/**
 * Created by miller on 2015/10/19.
 */

var express = require('express');
var app = express();
var router = express.Router();
var playerHandler = require('../playerHandler');
var weiXin = require('../oauth');
var payment = require('../payment');


router.get('/user/get', playerHandler.getPlayerInfo);

router.get('/weixin/geturl', weiXin.getAuthorizeURL);
router.get('/weixin/userinfo', weiXin.getWeiXinUserInfo);

router.get('/pay', payment.pay);

router.get('/item', playerHandler.addItem);

router.get('/putseed', playerHandler.putSeed);

router.get('/enterfight', playerHandler.enterFight);

module.exports = router;