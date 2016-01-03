/**
 * Created by carl on 2016/1/2.
 */

var calc = module.exports

calc.playerToMonsterDamage = function(playerAtk, bossDef ,crit, fightInfo) {
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
            return fightInfo.bossInitHp * 0.2;
        } else {
            return (damage < 0 ? 0 : damage);
        }
    }
};

calc.monsterToPlayerDamage = function(bossAtk, playerDef, crit, fightInfo) {
    var damage = 0;
    if (crit) {
        damage = bossAtk * 1.5 - playerDef;
    }  else {
        damage = bossAtk - playerDef;
    }
    if (fightInfo.playerNotHurtState) {
        return 0;
    } else {
        if (fightInfo.boss20Hurt) {
            fightInfo.boss20Hurt = 0;
            return fightInfo.playerInitHp * 0.2;
        } else {
            return (damage < 0 ? 0 : damage);
        }
    }
};