export default function registerSystemSettings() {
  game.settings.register("l5r4", "showTraitRollOptions", {
    config: true,
    scope: "client",
    name: "SETTINGS.showTraitRollOptions.name",
    hint: "SETTINGS.showTraitRollOptions.label",
    type: Boolean,
    default: true,
  });
  game.settings.register("l5r4", "showSpellRollOptions", {
    config: true,
    scope: "client",
    name: "SETTINGS.showSpellRollOptions.name",
    hint: "SETTINGS.showSpellRollOptions.label",
    type: Boolean,
    default: true,
  });
  game.settings.register("l5r4", "showSkillRollOptions", {
    config: true,
    scope: "client",
    name: "SETTINGS.showSkillRollOptions.name",
    hint: "SETTINGS.showSkillRollOptions.label",
    type: Boolean,
    default: true,
  });
  game.settings.register("l5r4", "allowNpcVoidPoints", {
    config: true,
    scope: "client",
    name: "SETTINGS.allowNpcVoidPoints.name",
    hint: "SETTINGS.allowNpcVoidPoints.label",
    type: Boolean,
    default: false,
  });
  game.settings.register("l5r4", "useLtTenDiceRule", {
    config: true,
    scope: "world",
    name: "SETTINGS.useLtTenDiceRule.name",
    hint: "SETTINGS.useLtTenDiceRule.label",
    type: Boolean,
    default: false,
  });
  game.settings.register("l5r4", "addBangToStance", {
    config: true,
    scope: "world",
    name: "SETTINGS.addBangToStance.name",
    hint: "SETTINGS.addBangToStance.label",
    type: Boolean,
    default: false,
    requiresReload: true,
  });
}
