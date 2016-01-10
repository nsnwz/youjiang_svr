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
        ITEM_NOT_ENOUGH : 6003
    },
    PLANT : {
        NOT_ENOUGH_TO_HARVEST : 7000,
        FIELD_CANNOT_PLANT : 7001,
        NOT_HAVE_ITEM_IN_FIELD : 7002,
        HAVE_GOT_MAX_FIELDS : 7003,
        HAVE_GOT_MAX_LEVEL : 7004,
        NOT_ENOUGH_STEAL_NUM : 7005,
        ID_NOT_IN_STEAL_RANK : 7006
    },
    RANK : {
        RANK_ERROR : 8000
    },
    TASK : {
      HAVE_NOT_FIN_PRE_TASK : 9000,
      TASK_NOT_EXIST : 9001
    },
    SKILL : {
      NOT_RIGHT_USE_SKILL : 10000
    },
    FIGHT : {
        CHECK_NOT_CORRECT : 20000,
        FITHT_LOST : 20001
    },
    MAX_FREE_STEAL_NUM : 5
};