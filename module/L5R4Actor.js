export default class L5R4Actor extends Actor {
  prepareData() {
    super.prepareData();

    let actorData = this.data;
    let data = actorData.data;

    // data for pcs
    if (actorData.type == "pc") {
      let skills = this.items.filter(function (item) { return item.type == "skill" });
      let armors = this.items.filter(function (item) { return item.type == "armor" });

      // calculate rings
      data.rings.air = Math.min(data.traits.ref, data.traits.awa);
      data.rings.earth = Math.min(data.traits.sta, data.traits.wil);
      data.rings.fire = Math.min(data.traits.agi, data.traits.int);
      data.rings.water = Math.min(data.traits.str, data.traits.per);

      // calculate initiative
      data.initiative.roll = parseInt(data.insight.rank) + parseInt(data.traits.ref) + parseInt(data.initiative.roll_mod);
      data.initiative.keep = data.traits.ref + data.initiative.keep_mod;

      // calculate wounds level values
      let previousLevel = 0;
      for (const [lvl, lvlData] of Object.entries(data.wound_lvl)) {
        if (lvl == "healthy") {
          lvlData.value = parseInt(data.rings.earth) * 5 + parseInt(data.woundsMod);
          previousLevel = parseInt(lvlData.value);
        } else {
          lvlData.value = parseInt(data.rings.earth) * 2 + previousLevel + parseInt(data.woundsMod);
          previousLevel = parseInt(lvlData.value);
        }
      }
      // calculate armor tn
      data.armor_tn.base = parseInt((data.traits.ref * 5)) + 5;
      data.armor_tn.bonus = 0;

      //data.armor_tn.current = data.armor_tn.base + parseInt(data.armor_tn.mod);

      let armorData = {};
      let armorBonus = 0;
      armors.forEach(armor => {
        armorData = armor.getRollData();
        if (armorData.equiped) {
          if ( parseInt(armorData.bonus)>armorBonus) {
            armorBonus = parseInt(armorData.bonus);
          }
        }
      });
      data.armor_tn.bonus = armorBonus;
      data.armor_tn.current = data.armor_tn.base + parseInt(data.armor_tn.mod) + data.armor_tn.bonus;


      // calculate current "hp"
      data.wounds.max = data.wound_lvl.out.value;
      data.wounds.value = parseInt(data.wounds.max) - parseInt(data.suffered);

      // calculate current would level
      for (const [lvl, lvlData] of Object.entries(data.wound_lvl)) {
        if (data.suffered >= lvlData.value && lvl != "healthy") {
          lvlData.current = true;
        } else if (lvl == "healthy") {
          lvlData.current = true;
        } else {
          lvlData.current = false;
        }
      }

      // calculate insight points
      let insightRings = ((data.rings.air + data.rings.earth + data.rings.fire + data.rings.water + data.rings.void.rank) * 10);
      let insighSkills = 0;
      for (const [skill, skillData] of Object.entries(skills)) {
        insighSkills += parseInt(skillData.data.data.rank);
      }
      data.insight.points = insightRings + insighSkills;

    }

    if (actorData.type == "npc") {
      // calculate current "hp"
      
      data.wounds.value = parseInt(data.wounds.max) - parseInt(data.suffered);
    }
  }
}