/**
 * Created by carl on 2016/1/2.
 */

var calc = module.exportsl;

calc.playerToMonsterDamage = function(playerAtk, bossDef ,crit, bossHp, fightInfo) {
    var damage = 0;
    if (crit) {
        damage = (playerAtk - bossDef) * 1.5;
    }  else {
        damage = playerAtk - bossDef;
    }
    if (fightInfo.bossNotHurtState) {
        return 0;
    } else {
        if (fightInfo.player20Hurt) {
            fightInfo.player20Hurt = 0;
            return bossInitHp * 0.2;
        } else {
            return (damage < 0 ? 0 : damage);
        }
    }
};

calc.monsterToPlayerDamage = function(bossAtk, playerDef, crit, playerHp, fightInfo) {
    var damage = 0;
    if (crit) {
        damage = bossAtk * 1.5 - playerDef;
    }  else {
        damage = bossAtk = playerDef;
    }
    if (notHurtState) {
        return 0;
    } else {
        if (fightInfo.boss20Hurt) {
            fightInfo.boss20Hurt = 0;
            return playerHp * 0.2;
        } else {
            return (damage < 0 ? 0 : damage);
        }
    }
};