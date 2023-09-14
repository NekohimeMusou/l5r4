export default function initializeActiveEffects() {
  Hooks.on("applyActiveEffect", _applyTraitBonus);
}

function _applyTraitBonus(actor, change, current, delta, changes) {
  const targetPath = change.value;
  const traitValue = _getTraitValue(actor, targetPath);

  changes[change.key] = current + traitValue;
}

function _getTraitValue(actor, targetPath) {
  // traitType should be one of "skills", "rings", "traits"
  const [traitType, trait] = targetPath.split(".", 2);

  if (traitType === "skills") {
    const targetSkill = actor.items.find(
        (i) => i.name.toLowerCase() === trait,
    );

    return Number(targetSkill?.system?.rank) || 0;
  }

  return Number(actor.system?.[traitType]?.[trait]) || 0;
}

/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning document which manages this effect
 */
export async function onManageActiveEffect(event, owner) {
  event.preventDefault();
  const a = event.currentTarget;
  const li = a.closest("li");
  const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
  const actor = owner.actor;
  switch ( a.dataset.action ) {
    case "create":
      return await owner.createEmbeddedDocuments("ActiveEffect", [{
        "name": "New Effect",
        "icon": "icons/svg/aura.svg",
        "origin": owner.uuid,
        "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
        "disabled": li.dataset.effectType === "inactive",
      }]);
    case "edit":
      return await effect.sheet.render(true);
    case "delete":
      await owner.deleteEmbeddedDocuments("ActiveEffect", [effect._id]);
      if (actor) await actor.sheet.render(false);
      return;
    case "toggle":
      await owner.updateEmbeddedDocuments("ActiveEffect", [{_id: effect._id, disabled: !effect.disabled}]);
      if (actor) await actor.sheet.render(false);
      return;
  }
}

/**
   * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
   * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
   * @return {object}                   Data for rendering
   */
export function prepareActiveEffectCategories(effects) {
  // Define effect header categories
  const categories = {
    temporary: {
      type: "temporary",
      label: "Temporary Effects",
      effects: [],
    },
    passive: {
      type: "passive",
      label: "Passive Effects",
      effects: [],
    },
    inactive: {
      type: "inactive",
      label: "Inactive Effects",
      effects: [],
    },
  };

  // Iterate over active effects, classifying them into categories
  for ( const e of effects ) {
    if ( e.disabled ) categories.inactive.effects.push(e);
    else if ( e.isTemporary ) categories.temporary.effects.push(e);
    else categories.passive.effects.push(e);
  }
  return categories;
}

export async function showActiveEffectDialog(effects) {
  const templatePath = "systems/l5r4/templates/chat/active-effect-dialog.hbs";
  const content = await renderTemplate(templatePath, {effects});

  return new Promise((resolve) => {
    new Dialog({
      title: game.i18n.localize("l5r4.effects.activeEffects"),
      content,
      buttons: {
        close: {
          label: "Close",
          callback: (html) => resolve(null),
        },
      },
      close: () => resolve(null),
    }).render(true);
  });
}
