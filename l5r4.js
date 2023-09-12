import {l5r4} from "./module/config/config.js";
import preloadHandlebarsTemplates from "./module/config/templates.js";
import registerSystemSettings from "./module/config/settings.js";
import registerHandlebarsHelpers from "./module/config/hbs-helpers.js";
import initializeActiveEffects from "./module/config/active-effects.js";

import L5R4Actor from "./module/L5R4Actor.js";
import L5R4Item from "./module/L5R4Item.js";
import L5R4ItemSheet from "./module/sheets/L5R4ItemSheet.js";
import L5R4PcSheet from "./module/sheets/L5R4PcSheet.js";
import L5R4NpcSheet from "./module/sheets/L5R4NpcSheet.js";

Hooks.once("init", function() {
  console.log("l5r4 | Initialising Legend of the Five Rings 4e system");

  CONFIG.l5r4 = l5r4;
  CONFIG.Item.documentClass = L5R4Item;
  CONFIG.Actor.documentClass = L5R4Actor;

  // custom initiative
  Combatant.prototype._getInitiativeFormula = function() {
    const actor = this.actor;
    const initRoll = actor.system.initiative.roll;
    const initKeep = actor.system.initiative.keep;
    if (actor.type == "npc") {
      return `${initRoll}d10k${initKeep}x10`;
    }
    const initMod = actor.system.initiative.total_mod;

    return `${initRoll}d10k${initKeep}x10+${initMod}`;
  };

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("l5r4", L5R4ItemSheet, {makeDefault: true});


  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("l5r4", L5R4PcSheet, {types: ["pc"], makeDefault: true});
  Actors.registerSheet("l5r4", L5R4NpcSheet, {types: ["npc"], makeDefault: true});

  handleLegacyBehavior();
  preloadHandlebarsTemplates();
  registerHandlebarsHelpers();
  registerSystemSettings();
  initializeActiveEffects();
  initializeStatusEffects();
});

function handleLegacyBehavior() {
  // Disable legacy active effect transferral
  CONFIG.ActiveEffect.legacyTransferral = false;
}

function initializeStatusEffects() {
  const l5r4Conditions = CONFIG.l5r4.statusConditions;

  // Remove any default statuses that share an id or icon with ours
  const statusEffects = CONFIG.statusEffects.filter(
      (s) => !l5r4Conditions.some(
          (c) => c.icon === s.icon) && !l5r4Conditions.some((c) => c.id === s.id),
  );

  // Add L5R4 conditions and stance effects
  CONFIG.statusEffects = l5r4.stanceEffects
      .concat(l5r4Conditions)
      .concat(statusEffects);
}
