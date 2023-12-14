import * as Dice from "../dice.js";
import * as Chat from "../chat.js";

export default class L5R4PcSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/l5r4/templates/sheets/pc-sheet.hbs",
      classes: ["l5r4", "pc"],
      width: 879,
    });
  }

  itemContextMenu = [
    {
      name: game.i18n.localize("l5r4.sheet.edit"),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const item = this.actor.items.get(element.data("item-id"));
        item.sheet.render(true);
      },
    },
    {
      name: game.i18n.localize("l5r4.mech.toChat"),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const item = this.actor.items.get(element.data("item-id"));
        item.roll();
      },
    },
    {
      name: game.i18n.localize("l5r4.sheet.delete"),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
      },
    },
  ];

  get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/l5r4/templates/sheets/limited-pc-sheet.hbs";
    }
    return this.options.template;
  }

  getData() {
    // Retrieve the data structure from the base sheet.
    const baseData = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to base structure for easier access
    baseData.system = actorData.system;

    // Add config data to base sctructure
    baseData.config = CONFIG.l5r4;

    baseData.commonItems = baseData.items.filter(function(item) {
      return item.type == "commonItem";
    });
    baseData.weapons = baseData.items.filter(function(item) {
      return item.type == "weapon";
    });
    baseData.bows = baseData.items.filter(function(item) {
      return item.type == "bow";
    });
    baseData.armors = baseData.items.filter(function(item) {
      return item.type == "armor";
    });
    baseData.skills = baseData.items.filter(function(item) {
      return item.type == "skill";
    });
    baseData.techniques = baseData.items.filter(function(item) {
      return item.type == "technique";
    });
    baseData.advantages = baseData.items.filter(function(item) {
      return item.type == "advantage";
    });
    baseData.disadvantages = baseData.items.filter(function(item) {
      return item.type == "disadvantage";
    });
    baseData.spells = baseData.items.filter(function(item) {
      return item.type == "spell";
    });
    baseData.katas = baseData.items.filter(function(item) {
      return item.type == "kata";
    });
    baseData.kihos = baseData.items.filter(function(item) {
      return item.type == "kiho";
    });

    baseData.masteries = [];
    for (const skill of baseData.skills) {
      if (skill.system.mastery_3 != "" && skill.system.rank >= 3) {
        baseData.masteries.push({_id: skill._id, name: `${skill.name} 3`, mastery: skill.system.mastery_3});
      }
      if (skill.system.mastery_5 != "" && skill.system.rank >= 5) {
        baseData.masteries.push({_id: skill._id, name: `${skill.name} 5`, mastery: skill.system.mastery_5});
      }
      if (skill.system.mastery_7 != "" && skill.system.rank >= 7) {
        baseData.masteries.push({_id: skill._id, name: `${skill.name} 7`, mastery: skill.system.mastery_7});
      }
    }

    return baseData;
  }

  activateListeners(html) {
    // TEMPLATE: html.find(cssSelector).event(this._someCallBack.bind(this));

    // only owners should edit and add things
    if (this.actor.isOwner) {
      html.find(".item-create").click(this._onItemCreate.bind(this));
      html.find(".item-edit").click(this._onItemEdit.bind(this));
      html.find(".item-delete").click(this._onItemDelete.bind(this));
      html.find(".inline-edit").change(this._onInlineItemEdit.bind(this));

      new ContextMenu(html, ".skill-item", this.itemContextMenu);
      new ContextMenu(html, ".commonItem-card", this.itemContextMenu);
      new ContextMenu(html, ".armor-card", this.itemContextMenu);
      new ContextMenu(html, ".weapon-card", this.itemContextMenu);
      new ContextMenu(html, ".spell-card", this.itemContextMenu);
      new ContextMenu(html, ".technique-card", this.itemContextMenu);
      new ContextMenu(html, ".advantage-card", this.itemContextMenu);
      new ContextMenu(html, ".disadvantage-card", this.itemContextMenu);
      new ContextMenu(html, ".kata-card", this.itemContextMenu);
      new ContextMenu(html, ".kiho-card", this.itemContextMenu);

      html.find(".item-roll").click(this._onItemRoll.bind(this));
      html.find(".weapon-roll").click(this._onWeaponRoll.bind(this));
      html.find(".skill-roll").click(this._onSkillRoll.bind(this));
      html.find(".ring-roll").click(this._onRingRoll.bind(this));
      html.find(".trait-roll").click(this._onTraitRoll.bind(this));
    }

    super.activateListeners(html);
  }

  async _onRingRoll(event) {
    const ringRank = event.currentTarget.dataset.ringRank;
    const ringName = event.currentTarget.dataset.ringName;
    const systemRing = event.currentTarget.dataset.systemRing;
    const schoolRank = this.actor.system.insight.rank;

    // FIXTHIS: Use active effects for the Spellcraft bonus
    const spellcraft = this.actor.items.find(
        (i) => i.type === "skill" && i.name.toLowerCase() === "spellcraft",
    )?.system?.rank || 0;

    let spell = false;

    spell = await Dice.ringRoll(
        {
          woundPenalty: this.actor.system.woundPenalty,
          ringRank: ringRank,
          ringName: ringName,
          systemRing: systemRing,
          schoolRank: schoolRank,
          askForOptions: event.shiftKey,
          // FIXTHIS: Use active effects for the Spellcraft bonus
          spellcraftBonus: Number(spellcraft >= 5),
          actor: this.actor,
        },
    );
    if (spell.voidSlot) {
      this._consumeSpellSlot("void");
    } else if (spell.spellSlot) {
      this._consumeSpellSlot(spell.systemRing, spell.ringName);
    }
  }

  _consumeSpellSlot(systemRing, ringName) {
    const currentSlots = this.actor.system.spellSlots[systemRing];
    if (currentSlots <= 0) {
      const warning = `${game.i18n.localize("l5r4.errors.noSpellSlots")}: ${ringName}`;
      ui.notifications.warn(warning);
      return;
    }
    const newSlotValue = currentSlots - 1;
    const ringToUpdate = `system.spellSlots.${systemRing}`;
    this.actor.update({[`${ringToUpdate}`]: newSlotValue});
  }

  _onTraitRoll(event) {
    const traitRank = event.currentTarget.dataset.traitRank;
    const traitName = event.currentTarget.dataset.traitName;
    Dice.traitRoll(
        {
          woundPenalty: this.actor.system.woundPenalty,
          traitRank: traitRank,
          traitName: traitName,
          askForOptions: event.shiftKey,
          actor: this.actor,
        },
    );
  }

  _onWeaponRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);

    const weaponName = item.name;
    const rollData = item.getRollData();
    let actorTrait;
    let diceRoll;
    let diceKeep;
    if (item.type == "weapon") {
      actorTrait = this.actor.system.traits.str;
      diceRoll = parseInt(actorTrait) + parseInt(item.system.damageRoll);
    } else if (item.data.type == "bow") {
      diceRoll = rollData.damageRoll;
      diceKeep = rollData.damageKeep;
    } else {
      return ui.notifications.error("y u do dis?");
    }


    diceKeep = parseInt(item.system.damageKeep);
    Dice.weaponRoll(
        {
          diceRoll: diceRoll,
          diceKeep: diceKeep,
          weaponName: weaponName,
          description: rollData.description,
          askForOptions: event.shiftKey,
          actor: this.actor,
        },
    );
  }

  _onSkillRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);
    const skillTrait = item.system.trait;
    let actorTrait = null;
    // some skills use the void ring as a trait
    if (skillTrait == "void") {
      actorTrait = this.actor.system.rings.void.rank;
    } else {
      actorTrait = this.actor.system.traits[skillTrait];
    }
    const skillRank = item.system.rank;
    const skillName = item.name;

    Dice.skillRoll({
      woundPenalty: this.actor.system.woundPenalty,
      actorTrait: actorTrait,
      skillRank,
      skillName,
      askForOptions: event.shiftKey,
      skillTrait,
      inFAStance: this.actor.system.inFAStance,
      actor: this.actor,
    });
  }


  _onItemRoll(event) {
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);

    item.roll();
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const elementType = element.dataset.type;
    let itemData = {};
    if (elementType == "equipment") {
      const equipmentOptions = await Chat.getItemOptions(elementType);
      if (equipmentOptions.cancelled) {
        return;
      }
      itemData = {
        name: equipmentOptions.name,
        type: equipmentOptions.type,
      };
      return this.actor.createEmbeddedDocuments("Item", [itemData]);
    } else if (elementType == "spell") {
      const spellOptions = await Chat.getItemOptions(elementType);
      if (spellOptions.cancelled) {
        return;
      }
      itemData = {
        name: spellOptions.name,
        type: spellOptions.type,
      };
      return this.actor.createEmbeddedDocuments("Item", [itemData]);
    } else {
      itemData = {
        name: game.i18n.localize("l5r4.sheet.new"),
        type: element.dataset.type,
      };
      return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }
  }

  _onItemEdit(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.closest(".item").dataset.itemId;

    return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async _onInlineItemEdit(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    const field = element.dataset.field;


    if (element.type == "checkbox") {
      return await item.update({[field]: element.checked});
    }

    return await item.update({[field]: element.value});
  }
}
