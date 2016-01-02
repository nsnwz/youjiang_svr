/**
 * Created by carl on 2016/1/2.
 */
var item = require('./item');

var skill = module.exports;

skill = {
    10001 : function(pos, lv, fightInfo, updateTime) {
                val addValue = item.getSkillAddValue(lv);
                if (pos == 0) {//�û�
                    fightInfo.posLeftAtk += fightInfo.playerInitAtk * addValue;
                } else {
                    fightInfo.posRightAtk += fightInfo.bossInitAtk * addValue;
                }
              },
    10002 : function(pos, lv, fightInfo, updateTime) {
            val addValue = item.getSkillAddValue(lv);
            if (pos == 0) {//�û�
                fightInfo.posLeftDef += fightInfo.playerInitDef * addValue;
            } else {
                fightInfo.posRightDef += fightInfo.bossInitDef * addValue;
            }
    },
    10003 : function(pos, lv, fightInfo, updateTime) {
            val addValue = item.getSkillAddValue(lv);
            if (pos == 0) {//�û�
                fightInfo.posLeftHp += fightInfo.playerInitHp * addValue;
            } else {
                fightInfo.posRightHp += fightInfo.bossInitHp * addValue;
            }
    },
    20001 : function(pos, lv, fightInfo, updateTime) {
            if (pos == 0) {//�û�ʹ��
                if (fightInfo.playerUseSkills[20001] > 0) {
                    fightInfo.playerUseSkills[2001] -= 1;
                    fightInfo.player20Hurt = 1;
                }
            } else {
                fightInfo.boss20Hurt = 1;
            }
    },
    20002 : function(pos, lv, fightInfo, updateTime) {
            if (pos == 0) {//�û�ʹ��
                if (fightInfo.playerUseSkills[20002] > 0) {
                    fightInfo.playerUseSkills[2002] -= 1;
                    fightInfo.playerNotHurtState = 1;
                    fightInfo.playerNotHurtTime = updateTime;
                }
            } else {
                fightInfo.bossNotHurtState = 1;
                fightInfo.bossNotHurtTime = updateTime;
            }
   }
};

