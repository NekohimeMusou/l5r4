export async function SkillRoll({
  woundPenalty = 0,
  actorTrait = null,
  skillRank = null,
  skillName = null,
  askForOptions = true,
  npc = false,
  skillTrait = null } = {}) {
  const messageTemplate = "systems/l5r4/templates/chat/simple-roll.hbs";

  const traitString = skillTrait === "void" ? "l5r4.rings.void" : `l5r4.traits.${skillTrait}`;

  let optionsSettings = game.settings.get("l5r4", "showSkillRollOptions");
  let rollType = game.i18n.localize("l5r4.mech.skillRoll");
  let label = `${rollType}: ${skillName} / ${game.i18n.localize(traitString)}`;
  let emphasis = false;
  let rollMod = 0;
  let keepMod = 0;
  let totalMod = 0;
  let applyWoundPenalty = true;

  if (askForOptions != optionsSettings) {
    const noVoid = npc && !game.settings.get("l5r4", "allowNpcVoidPoints");
    let checkOptions = await GetSkillOptions(skillName, noVoid);
    if (checkOptions.cancelled) {
      return;
    }

    emphasis = checkOptions.emphasis;
    applyWoundPenalty = checkOptions.applyWoundPenalty
    rollMod = parseInt(checkOptions.rollMod);
    keepMod = parseInt(checkOptions.keepMod);
    totalMod = parseInt(checkOptions.totalMod);

    if (checkOptions.void) {
      rollMod += 1;
      keepMod += 1;
      label += ` ${game.i18n.localize("l5r4.rings.void")}!`;
    }
  }

  if (applyWoundPenalty) {
    totalMod = totalMod - woundPenalty;
  }

  let diceToRoll = parseInt(actorTrait) + parseInt(skillRank) + parseInt(rollMod);
  let diceToKeep = parseInt(actorTrait) + parseInt(keepMod);
  let { diceRoll, diceKeep, bonus } = TenDiceRule(diceToRoll, diceToKeep, totalMod);
  let rollFormula = `${diceRoll}d10k${diceKeep}x10+${bonus}`;

  if (emphasis) {
    label += ` (${game.i18n.localize("l5r4.mech.emphasis")})`;
    rollFormula = `${diceRoll}d10r1k${diceKeep}x10+${bonus}`;
  }
  let rollResult = await new Roll(rollFormula).roll({ async: true });

  let renderedRoll = await rollResult.render({
    template: messageTemplate,
    flavor: label
  });

  let messageData = {
    speaker: ChatMessage.getSpeaker(),
    content: renderedRoll
  }
  rollResult.toMessage(messageData);

}

export async function RingRoll({
  woundPenalty = 0,
  ringRank = null,
  ringName = null,
  systemRing = null,
  schoolRank = null,
  askForOptions = true } = {}) {
  const messageTemplate = "systems/l5r4/templates/chat/simple-roll.hbs";
  let rollType = game.i18n.localize("l5r4.mech.ringRoll");
  let label = `${rollType}: ${ringName}`;
  let optionsSettings = game.settings.get("l5r4", "showSpellRollOptions");
  let affinity = false;
  let deficiency = false;
  let normalRoll = true;
  let rollMod = 0;
  let keepMod = 0;
  let totalMod = 0;
  let voidRoll = false;
  let applyWoundPenalty = true;
  let spellSlot = false;
  let voidSlot = false;

  if (askForOptions != optionsSettings) {
    let checkOptions = await GetSpellOptions(ringName);

    if (checkOptions.cancelled) {
      return false;
    }

    applyWoundPenalty = checkOptions.applyWoundPenalty
    affinity = checkOptions.affinity;
    deficiency = checkOptions.deficiency;
    normalRoll = checkOptions.normalRoll;
    rollMod = parseInt(checkOptions.rollMod);
    keepMod = parseInt(checkOptions.keepMod);
    totalMod = parseInt(checkOptions.totalMod);
    voidRoll = checkOptions.void;
    spellSlot = checkOptions.spellSlot;
    voidSlot = checkOptions.voidSlot;

    if (voidRoll) {
      rollMod += 1;
      keepMod += 1;
      label += ` ${game.i18n.localize("l5r4.rings.void")}!`
    }
  }

  if (applyWoundPenalty) {
    totalMod = totalMod - woundPenalty;
  }

  if (normalRoll) {
    let diceToRoll = parseInt(ringRank) + parseInt(rollMod);
    let diceToKeep = parseInt(ringRank) + parseInt(keepMod);
    let { diceRoll, diceKeep, bonus } = TenDiceRule(diceToRoll, diceToKeep, totalMod);
    let rollFormula = `${diceRoll}d10k${diceKeep}x10+${bonus}`;
    let rollResult = await new Roll(rollFormula).roll({ async: true });

    let renderedRoll = await rollResult.render({
      template: messageTemplate,
      flavor: label
    });

    let messageData = {
      speaker: ChatMessage.getSpeaker(),
      content: renderedRoll
    }
    rollResult.toMessage(messageData);
  } else {
    rollType = game.i18n.localize("l5r4.mech.spellCasting");
    label = `${rollType}: ${ringName}`
    if (voidRoll) {
      label += ` ${game.i18n.localize("l5r4.rings.void")}!`
    }
    if (affinity) {
      schoolRank += 1;
    }
    if (deficiency) {
      schoolRank -= 1;
    }
    if (schoolRank <= 0) {
      return ui.notifications.error(game.i18n.localize("l5r4.errors.scoolRankZero"));
    }
    let diceToRoll = parseInt(ringRank) + parseInt(schoolRank) + parseInt(rollMod);
    let diceToKeep = parseInt(ringRank) + parseInt(keepMod);
    let { diceRoll, diceKeep, bonus } = TenDiceRule(diceToRoll, diceToKeep, totalMod);
    let rollFormula = `${diceRoll}d10k${diceKeep}x10+${bonus}`;
    let rollResult = await new Roll(rollFormula).roll({ async: true });

    let renderedRoll = await rollResult.render({
      template: messageTemplate,
      flavor: label
    });

    let messageData = {
      speaker: ChatMessage.getSpeaker(),
      content: renderedRoll
    }
    rollResult.toMessage(messageData);
    return {spellSlot: spellSlot, voidSlot: voidSlot, systemRing: systemRing, ringName: ringName};
  }
  return false;
}

export async function TraitRoll({
  woundPenalty = 0,
  traitRank = null,
  traitName = null,
  askForOptions = true,
  unskilled = false } = {}) {
  const messageTemplate = "systems/l5r4/templates/chat/simple-roll.hbs";
  let rollType = game.i18n.localize("l5r4.mech.traitRoll");
  let label = `${rollType}: ${traitName}`

  let optionsSettings = game.settings.get("l5r4", "showTraitRollOptions");

  let rollMod = 0;
  let keepMod = 0;
  let totalMod = 0;
  let applyWoundPenalty = true;

  if (askForOptions != optionsSettings) {
    let checkOptions = await GetTraitRollOptions(traitName);

    if (checkOptions.cancelled) {
      return;
    }

    unskilled = checkOptions.unskilled;
    applyWoundPenalty = checkOptions.applyWoundPenalty;
    rollMod = parseInt(checkOptions.rollMod);
    keepMod = parseInt(checkOptions.keepMod);
    totalMod = parseInt(checkOptions.totalMod);

    if (checkOptions.void) {
      rollMod += 1;
      keepMod += 1;
      label += ` ${game.i18n.localize("l5r4.rings.void")}!`
    }
  }
  if (applyWoundPenalty) {
    totalMod = totalMod - woundPenalty;
  }

  let diceToRoll = parseInt(traitRank) + parseInt(rollMod);
  let diceToKeep = parseInt(traitRank) + parseInt(keepMod);
  let { diceRoll, diceKeep, bonus } = TenDiceRule(diceToRoll, diceToKeep, totalMod);
  let rollFormula = `${diceRoll}d10k${diceKeep}x10+${bonus}`;
  let rollResult = await new Roll(rollFormula).roll({ async: true });
  if (unskilled) {
    rollFormula = `${diceRoll}d10k${diceKeep}`;
    rollResult = await new Roll(rollFormula).roll({ async: true });
    label += ` (${game.i18n.localize("l5r4.mech.unskilledRoll")})`
  }

  let renderedRoll = await rollResult.render({
    template: messageTemplate,
    flavor: label
  });

  let messageData = {
    speaker: ChatMessage.getSpeaker(),
    content: renderedRoll
  }

  rollResult.toMessage(messageData);
}

async function GetSkillOptions(skillName, noVoid) {
  const template = "systems/l5r4/templates/chat/roll-modifiers-dialog.hbs"
  const html = await renderTemplate(template, { skill: true, noVoid });

  return new Promise(resolve => {
    const data = {
      title: game.i18n.format("l5r4.chat.skillRoll", { skill: skillName }),
      content: html,
      buttons: {
        normal: {
          label: game.i18n.localize("l5r4.mech.roll"),
          callback: html => resolve(_processSkillRollOptions(html[0].querySelector("form")))
        },
        cancel: {
          label: game.i18n.localize("l5r4.mech.cancel"),
          callback: () => resolve({ cancelled: true })
        }
      },
      default: "normal",
      close: () => resolve({ cancelled: true })
    };

    new Dialog(data, null).render(true);
  });
}

function _processSkillRollOptions(form) {
  return {
    applyWoundPenalty: form.woundPenalty.checked,
    emphasis: form.emphasis.checked,
    rollMod: form.rollMod.value,
    keepMod: form.keepMod.value,
    totalMod: form.totalMod.value,
    void: form.void?.checked ?? false
  }
}

async function GetTraitRollOptions(traitName) {
  const template = "systems/l5r4/templates/chat/roll-modifiers-dialog.hbs"
  const html = await renderTemplate(template, { trait: true });

  return new Promise(resolve => {
    const data = {
      title: game.i18n.format("l5r4.chat.traitRoll", { trait: traitName }),
      content: html,
      buttons: {
        normal: {
          label: game.i18n.localize("l5r4.mech.roll"),
          callback: html => resolve(_processTraitRollOptions(html[0].querySelector("form")))
        },
        cancel: {
          label: game.i18n.localize("l5r4.mech.cancel"),
          callback: () => resolve({ cancelled: true })
        }
      },
      default: "normal",
      close: () => resolve({ cancelled: true })
    };

    new Dialog(data, null).render(true);
  });
}

function _processTraitRollOptions(form) {
  return {
    applyWoundPenalty: form.woundPenalty.checked,
    unskilled: form.unskilled.checked,
    rollMod: form.rollMod.value,
    keepMod: form.keepMod.value,
    totalMod: form.totalMod.value,
    void: form.void.checked
  }
}

async function GetSpellOptions(ringName) {
  const template = "systems/l5r4/templates/chat/roll-modifiers-dialog.hbs"
  const html = await renderTemplate(template, { spell: true, ring: ringName });

  return new Promise(resolve => {
    const data = {
      title: game.i18n.format("l5r4.chat.ringRoll", { ring: ringName }),
      content: html,
      buttons: {
        normalRoll: {
          label: game.i18n.localize("l5r4.mech.ringRoll"),
          callback: html => resolve(_processRingRollOptions(html[0].querySelector("form")))
        },
        spell: {
          label: game.i18n.localize("l5r4.mech.spellCasting"),
          callback: html => resolve(_processSpellRollOptions(html[0].querySelector("form")))
        },
        cancel: {
          label: game.i18n.localize("l5r4.mech.cancel"),
          callback: () => resolve({ cancelled: true })
        }
      },
      default: "normal",
      close: () => resolve({ cancelled: true })
    };

    new Dialog(data, null).render(true);
  });
}

function _processSpellRollOptions(form) {
  return {
    applyWoundPenalty: form.woundPenalty.checked,
    affinity: form.affinity.checked,
    deficiency: form.deficiency.checked,
    rollMod: form.rollMod.value,
    keepMod: form.keepMod.value,
    totalMod: form.totalMod.value,
    void: form.void.checked,
    spellSlot: form.spellSlot.checked,
    voidSlot: form.voidSlot.checked
  }
}

function _processRingRollOptions(form) {
  return {
    applyWoundPenalty: form.woundPenalty.checked,
    rollMod: form.rollMod.value,
    keepMod: form.keepMod.value,
    totalMod: form.totalMod.value,
    void: form.void.checked,
    normalRoll: true
  }
}

export async function WeaponRoll({
  diceRoll = null,
  diceKeep = null,
  weaponName = null,
  description = null,
  askForOptions = true } = {}) {
  const messageTemplate = "systems/l5r4/templates/chat/weapon-chat.hbs";

  let optionsSettings = game.settings.get("l5r4", "showSkillRollOptions");
  let rollType = game.i18n.localize("l5r4.mech.damageRoll");
  let label = `${rollType}: ${weaponName}`

  let rollMod = 0;
  let keepMod = 0;
  let totalMod = 0;

  if (askForOptions != optionsSettings) {
    let checkOptions = await GetWeaponOptions(weaponName);

    if (checkOptions.cancelled) {
      return;
    }

    rollMod = parseInt(checkOptions.rollMod);
    keepMod = parseInt(checkOptions.keepMod);
    totalMod = parseInt(checkOptions.totalMod);

    if (checkOptions.void) {
      rollMod += 1;
      keepMod += 1;
      label += ` ${game.i18n.localize("l5r4.rings.void")}!`
    }
  }

  let diceToRoll = parseInt(diceRoll) + parseInt(rollMod);
  let diceToKeep = parseInt(diceKeep) + parseInt(keepMod);
  let rollFormula = `${diceToRoll}d10k${diceToKeep}x10+${totalMod}`;

  let rollResult = await new Roll(rollFormula).roll({ async: true });
  let renderedRoll = await rollResult.render();

  let templateContext = {
    flavor: label,
    weapon: weaponName,
    description: description,
    roll: renderedRoll
  }

  let chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    content: await renderTemplate(messageTemplate, templateContext),
    sound: CONFIG.sounds.dice,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL
  }

  ChatMessage.create(chatData);
}

async function GetWeaponOptions(weaponName) {
  const template = "systems/l5r4/templates/chat/roll-modifiers-dialog.hbs"
  const html = await renderTemplate(template, { weapon: true });

  return new Promise(resolve => {
    const data = {
      title: game.i18n.format("l5r4.chat.damageRoll", { weapon: weaponName }),
      content: html,
      buttons: {
        normal: {
          label: game.i18n.localize("l5r4.mech.roll"),
          callback: html => resolve(_processWeaponRollOptions(html[0].querySelector("form")))
        },
        cancel: {
          label: game.i18n.localize("l5r4.mech.cancel"),
          callback: () => resolve({ cancelled: true })
        }
      },
      default: "normal",
      close: () => resolve({ cancelled: true })
    };

    new Dialog(data, null).render(true);
  });
}

function _processWeaponRollOptions(form) {
  return {
    rollMod: form.rollMod.value,
    keepMod: form.keepMod.value,
    totalMod: form.totalMod.value,
    void: form.void.checked
  }
}

export async function NpcRoll({
  woundPenalty = 0,
  diceRoll = null,
  diceKeep = null,
  rollName = null,
  description = null,
  toggleOptions = true,
  rollType = null } = {}) {
  let label = `${rollName}`;
  let bonus = 0;

  // Make sure our numbers are numbers
  [diceRoll, diceKeep] = [diceRoll, diceKeep].map(e => parseInt(e));

  // Should we show the options dialog?
  const settingsKeys = {
    trait: "showTraitRollOptions",
    ring: "showSpellRollOptions",
    skill: "showSkillRollOptions"
  };

  const settingsKey = settingsKeys[rollType];

  const showOptions = game.settings.get("l5r4", settingsKey) ^ toggleOptions;

  if (showOptions) {
    const noVoid = !game.settings.get("l5r4", "allowNpcVoidPoints");
    const { rollMod, keepMod, totalMod, applyWoundPenalty, cancelled } = await getNpcRollOptions(rollName, noVoid);

    if (cancelled) return;

    diceRoll += rollMod;
    diceKeep += keepMod;
    bonus += totalMod;

    if (applyWoundPenalty) {
      bonus -= woundPenalty;
    }
  }

  ({ diceRoll, diceKeep, bonus } = TenDiceRule(diceRoll, diceKeep, bonus));

  const rollFormula = `${diceRoll}d10k${diceKeep}x10+${bonus}`;

  if (description) {
    label += ` (${description})`
  }

  const messageData = {
    flavor: label,
    speaker: ChatMessage.getSpeaker()
  }

  return await new Roll(rollFormula).roll({ async: true }).toMessage(messageData)
}

async function getNpcRollOptions(rollName, noVoid) {
  function _processNpcRollOptions(form) {
    return {
      rollMod: parseInt(form.rollMod.value),
      keepMod: parseInt(form.keepMod.value),
      totalMod: parseInt(form.totalMod.value)
    }
  }

  const template = "systems/l5r4/templates/chat/roll-modifiers-dialog.hbs";
  const html = await renderTemplate(template, { noVoid });

  return new Promise(resolve => {
    const data = {
      title: rollName,
      content: html,
      buttons: {
        normal: {
          label: game.i18n.localize("l5r4.mech.roll"),
          callback: html => resolve(_processNpcRollOptions(html[0].querySelector("form")))
        },
        cancel: {
          label: game.i18n.localize("l5r4.mech.cancel"),
          callback: () => resolve({ cancelled: true })
        }
      },
      default: "normal",
      close: () => resolve({ cancelled: true })
    };

    new Dialog(data, null).render(true);
  });
}

function TenDiceRule(diceRoll, diceKeep, bonus) {
  // Check for house rule before mutating any numbers
  const LtHouseRule = game.settings.get("l5r4", "useLtTenDiceRule");
  const addLtBonus = LtHouseRule && diceRoll > 10 && diceRoll % 2;

  let extras = 0;
  if (diceRoll > 10) {
    extras = diceRoll - 10;
    diceRoll = 10;
  }

  if (diceRoll < 10) {
    if (diceKeep > 10) {
      diceKeep = 10;
    }
  } else if (diceKeep >= 10) {
    extras += diceKeep - 10;
    diceKeep = 10;
  }

  while (diceKeep < 10) {
    if (extras > 1) {
      diceKeep++;
      extras -= 2;
    } else {
      break;
    }
  }

  // LT house rule: If there's an odd number of excess rolled dice
  // and fewer than 10 kept dice, add +2 to the total
  if (addLtBonus && diceKeep < 10) {
    bonus += 2;
  }

  if (diceKeep === 10 && diceRoll === 10) {
    bonus += extras * 2;
  }

  return { diceRoll, diceKeep, bonus }
} 