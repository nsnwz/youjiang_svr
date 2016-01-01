/**
 * Created by miller on 2015/12/14.
 */
/*
 各种错误代码定义
 */

module.exports = {
    GAME_NAME : "PLANT",
    OK : 0,
    SYSTEM_ERROR : 500,
    NOT_FIND_PALYER_ERROR : 501,
    ITEM_ERROR : {
        NOT_EXIST_ITEM : 6000,
        NOT_ENOUGH_COINS_BUY_ITEM : 6001,
        DOMAIN_NOT_ENOUGH : 6002,
    },
    PLANT : {
        NOT_ENOUGH_TO_HARVEST : 7000,
        FIELD_CANNOT_PLANT : 7001,
        NOT_HAVE_ITEM_IN_FIELD : 7002,
        HAVE_GOT_MAX_FIELDS : 7003,
        HAVE_GOT_MAX_LEVEL : 7004
    }
};