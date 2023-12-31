export default class L5R4Actor extends Actor {
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    if (this.type === "pc") {
      // pc token settings
      this.prototypeToken.updateSource(
          {
            bar1: {"attribute": "wounds"},
            name: this.name,
            vision: true,
            actorLink: true,
          });
      this.updateSource({img: "systems/l5r4/assets/icons/helm.png"});
    } else {
      // npc token settings
      this.prototypeToken.updateSource(
          {
            bar1: {"attribute": "wounds"},
            name: this.name,
            vision: true,
          });
      this.updateSource({img: "systems/l5r4/assets/icons/ninja.png"});
    }
  }

  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {
    const actorData = this;
    const l5r4Data = actorData.system;
    l5r4Data.inFAStance = false;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._preparePcData(actorData, l5r4Data);
    this._prepareNpcData(actorData, l5r4Data);
  }

  /**
  * Prepare Character type specific data
  * @param {Actor} actorData - Actor object
  * @param {any} l5r4Data - Actor system data
  */
  _preparePcData(actorData, l5r4Data) {
    if (actorData.type !== "pc") return;

    // get skills and armors
    const skills = this.items.filter(function(item) {
      return item.type == "skill";
    });
    const armors = this.items.filter(function(item) {
      return item.type == "armor";
    });

    // calculate rings
    l5r4Data.rings.air = Math.min(l5r4Data.traits.ref, l5r4Data.traits.awa);
    l5r4Data.rings.earth = Math.min(l5r4Data.traits.sta, l5r4Data.traits.wil);
    l5r4Data.rings.fire = Math.min(l5r4Data.traits.agi, l5r4Data.traits.int);
    l5r4Data.rings.water = Math.min(l5r4Data.traits.str, l5r4Data.traits.per);

    // calculate initiative
    l5r4Data.initiative.roll = parseInt(l5r4Data.insight.rank) + parseInt(l5r4Data.traits.ref) + parseInt(l5r4Data.initiative.roll_mod);
    l5r4Data.initiative.keep = l5r4Data.traits.ref + l5r4Data.initiative.keep_mod;

    // calculate wounds level values
    let previousLevel = 0;
    for (const [lvl, lvlData] of Object.entries(l5r4Data.wound_lvl)) {
      if (lvl == "healthy") {
        lvlData.value = parseInt(l5r4Data.rings.earth) * 5 + parseInt(l5r4Data.woundsMod);
        previousLevel = parseInt(lvlData.value);
      } else {
        lvlData.value = parseInt(l5r4Data.rings.earth) * 2 + previousLevel + parseInt(l5r4Data.woundsMod);
        previousLevel = parseInt(lvlData.value);
      }
    }
    // calculate heal rate
    l5r4Data.wounds.heal_rate = parseInt((l5r4Data.traits.sta * 2)) + parseInt(l5r4Data.insight.rank) + parseInt(l5r4Data.wounds.mod);

    // calculate armor tn
    l5r4Data.armor_tn.base = parseInt((l5r4Data.traits.ref * 5)) + 5;
    l5r4Data.armor_tn.bonus = 0;


    let armorReduction = 0;
    let armorData = {};
    let armorBonus = 0;
    armors.forEach((armor) => {
      armorData = armor.getRollData();
      if (armorData.equipped) {
        /* FIXTHIS: Put back when active effects are in
        if (parseInt(armorData.bonus) > armorBonus) {
          armorBonus = parseInt(armorData.bonus);
        }
        if (parseInt(armorData.reduction) > armorReduction) {
          armorReduction = parseInt(armorData.reduction);
        }
         */
        armorBonus += parseInt(armorData.bonus) || 0;
        armorReduction += parseInt(armorData.reduction) || 0;
      }
    });
    l5r4Data.armor_tn.bonus = armorBonus;
    l5r4Data.armor_tn.reduction = armorReduction;
    l5r4Data.armor_tn.current = l5r4Data.armor_tn.base + (parseInt(l5r4Data.armor_tn.mod) || 0) + l5r4Data.armor_tn.bonus;


    // calculate current "hp"
    l5r4Data.wounds.max = l5r4Data.wound_lvl.out.value;
    l5r4Data.wounds.value = parseInt(l5r4Data.wounds.max) - parseInt(l5r4Data.suffered);


    // calculate current wound level
    let prev = {value: -1};
    for (const lvlData of Object.values(l5r4Data.wound_lvl)) {
      if (l5r4Data.suffered <= lvlData.value && l5r4Data.suffered > prev.value) {
        lvlData.current = true;
      } else {
        lvlData.current = false;
      }
      prev = lvlData;
    }
    // calculate woundPenalty
    const woundLvls = Object.values(l5r4Data.wound_lvl);
    l5r4Data.currentWoundLevel = woundLvls.filter((lvl) => lvl.current)[0] || this.actor.system.wound_lvl.healthy;
    l5r4Data.woundPenalty = l5r4Data.currentWoundLevel.penalty;

    // calculate insight points
    const insightRings = ((l5r4Data.rings.air + l5r4Data.rings.earth + l5r4Data.rings.fire + l5r4Data.rings.water + l5r4Data.rings.void.rank) * 10);
    let insightSkills = 0;
    for (const skillData of Object.values(skills)) {
      insightSkills += parseInt(skillData.system.rank) + parseInt(skillData.system.insight_bonus);
    }
    l5r4Data.insight.points = insightRings + insightSkills;
  }

  _prepareNpcData(actorData, l5r4Data) {
    if (actorData.type !== "npc") return;

    // calculate current "hp"
    l5r4Data.wounds.value = parseInt(l5r4Data.wounds.max) - parseInt(l5r4Data.suffered);

    // calculate nr of wound lvls
    const nrWoundLvls = parseInt(l5r4Data.nrWoundLvls);

    l5r4Data.woundLvlsUsed = Object.fromEntries(
        Object.entries(l5r4Data.wound_lvl).slice(0, nrWoundLvls));

    // calculate current wound level
    for (const lvlData of Object.values(l5r4Data.wound_lvl)) {
      if (l5r4Data.suffered >= lvlData.value) {
        lvlData.current = true;
      } else {
        lvlData.current = false;
      }
    }
  }
}


