export default async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/l5r4/templates/partials/pc-honor-and-combat.hbs",
    "systems/l5r4/templates/partials/commonItem-card.hbs",
    "systems/l5r4/templates/partials/armor-card.hbs",
    "systems/l5r4/templates/partials/weapon-card.hbs",
    "systems/l5r4/templates/partials/spell-card.hbs",
    "systems/l5r4/templates/partials/skill-card.hbs",
    "systems/l5r4/templates/partials/technique-card.hbs",
    "systems/l5r4/templates/partials/advantage-card.hbs",
    "systems/l5r4/templates/partials/disadvantage-card.hbs",
    "systems/l5r4/templates/partials/kata-card.hbs",
    "systems/l5r4/templates/partials/kiho-card.hbs",
    "systems/l5r4/templates/partials/pc-wounds.hbs",
    "systems/l5r4/templates/partials/pc-stats.hbs",
    "systems/l5r4/templates/partials/pc-skills.hbs",
    "systems/l5r4/templates/partials/pc-equipment.hbs",
    "systems/l5r4/templates/partials/pc-spells-techniques.hbs",
    "systems/l5r4/templates/partials/pc-spell-slots.hbs",
    "systems/l5r4/templates/partials/pc-armors.hbs",
    "systems/l5r4/templates/partials/pc-armor-tn.hbs",
    "systems/l5r4/templates/partials/npc-skills.hbs",
    "systems/l5r4/templates/partials/npc-wounds.hbs",
    "systems/l5r4/templates/partials/npc-stats.hbs",
    "systems/l5r4/templates/partials/npc-rings.hbs",
    "systems/l5r4/templates/chat/simple-roll.hbs",
    "systems/l5r4/templates/chat/weapon-chat.hbs",
    "templates/dice/roll.html",
    "systems/l5r4/templates/partials/tabs/active-effects.hbs",
    "systems/l5r4/templates/partials/tabs/main.hbs",
  ];

  return loadTemplates(templatePaths);
}
