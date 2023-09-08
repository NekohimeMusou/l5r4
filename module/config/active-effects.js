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
