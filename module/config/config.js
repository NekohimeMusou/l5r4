export const l5r4 = {};

l5r4.arrows = {
  armor: "l5r4.arrows.armor",
  flesh: "l5r4.arrows.flesh",
  humming: "l5r4.arrows.humming",
  rope: "l5r4.arrows.rope",
  willow: "l5r4.arrows.willow",
};

l5r4.rings = {
  fire: "l5r4.rings.fire",
  water: "l5r4.rings.water",
  air: "l5r4.rings.air",
  earth: "l5r4.rings.earth",
  void: "l5r4.rings.void",
};

l5r4.traits = {
  sta: "l5r4.traits.sta",
  wil: "l5r4.traits.wil",
  str: "l5r4.traits.str",
  per: "l5r4.traits.per",
  ref: "l5r4.traits.ref",
  awa: "l5r4.traits.awa",
  agi: "l5r4.traits.agi",
  int: "l5r4.traits.int",
  void: "l5r4.rings.void",
};

l5r4.npcTraits = {
  sta: "l5r4.traits.sta",
  wil: "l5r4.traits.wil",
  str: "l5r4.traits.str",
  per: "l5r4.traits.per",
  ref: "l5r4.traits.ref",
  awa: "l5r4.traits.awa",
  agi: "l5r4.traits.agi",
  int: "l5r4.traits.int",
};

l5r4.skillTypes = {
  high: "l5r4.skillTypes.high",
  bugei: "l5r4.skillTypes.bugei",
  merch: "l5r4.skillTypes.merch",
  low: "l5r4.skillTypes.low",
};

l5r4.actionTypes = {
  simple: "l5r4.mech.simple",
  complex: "l5r4.mech.complex",
  free: "l5r4.mech.free",
};

l5r4.kihoTypes = {
  internal: "l5r4.kiho.internal",
  karmic: "l5r4.kiho.karmic",
  martial: "l5r4.kiho.martial",
  mystic: "l5r4.kiho.mystic",
};

l5r4.advantageTypes = {
  physical: "l5r4.advantage.physical",
  mental: "l5r4.advantage.mental",
  social: "l5r4.advantage.social",
  material: "l5r4.advantage.material",
  spiritual: "l5r4.advantage.spiritual",
};

const iconPath = "systems/l5r4/assets/icons";
const {ADD/** , CUSTOM, DOWNGRADE, MULTIPLY, OVERRIDE, UPGRADE*/} = CONST.ACTIVE_EFFECT_MODES;

l5r4.stanceEffects = [
  {
    id: "attack",
    name: "l5r4.stances.attack",
    icon: `${iconPath}/water.png`,
  },
  {
    id: "fullAttack",
    name: "l5r4.stances.fullAttack",
    icon: `${iconPath}/fire.png`,
    changes: [
      {
        key: "system.armor_tn.current",
        value: -10,
        mode: ADD,
      },
    ],
  },
  {
    id: "defense",
    name: "l5r4.stances.defense",
    icon: `${iconPath}/air.png`,
  },
  {
    id: "fullDefense",
    name: "l5r4.stances.fullDefense",
    icon: `${iconPath}/earth.png`,
  },
  {
    id: "center",
    name: "l5r4.stances.center",
    icon: `${iconPath}/void.png`,
  },
];
