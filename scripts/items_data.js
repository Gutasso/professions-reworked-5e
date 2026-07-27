/**
 * REPOSITÓRIO DE ITENS (RECOMPENSAS)
 * 
 * Estrutura:
 * Chave Principal: Nome da Profissão (Ex: "Alquimista")
 * Chave Secundária: Nome da chave de busca (Subtipo + Raridade/Qualidade ou Subtipo puro).
 * Valor: Objeto contendo a estratégia de criação.
 * 
 * Tipos de Estratégia:
 * 1. source: "compendium" -> Busca em um compêndio existente (SRD ou outro).
 *    Exige: { source: "compendium", pack: "dnd5e.items", name: "Potion of Healing" }
 * 2. source: "list" -> Exibe um modal para escolher entre opções. As opções podem ser
 *    strings (retrocompatibilidade) ou objetos especificando a origem ({ source: "compendium"/"manual", ... }).
 *    Exige: { source: "list", pack: "dnd5e.items", options: [...] }
 * 3. source: "manual" -> Cria o item do zero com os dados fornecidos.
 *    Exige: { source: "manual", name: "Nome", type: "tipo", img: "caminho", system: { ... } }
 */

export const RECOMPENSAS = {
    "Alquimista": {
        "Poção Comum": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Climbing" },
                {
                    source: "manual",
                    name: "Potion of Comprehension",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-round-corked-blue.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, you gain the effect of the <em>Comprehend Languages</em> spell for 1 hour.</p><p>This potion's liquid is a clear concoction with bits of salt and soot swirling in it.</p>" },
                        weight: 0.5,
                        price: { value: 50, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Healing" },
                {
                    source: "manual",
                    name: "Potion of Watchful Rest",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-conical-corked-yellow.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, you gain the following benefits for the next 8 hours: magic can't put you to sleep, and you can remain awake during a long rest and still gain its benefits.</p><p>This sweet, amber-colored brew has no effect on creatures that don't require sleep, such as elves.</p>" },
                        weight: 0.5,
                        price: { value: 40, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                }
            ]
        },
        "Poção Incomum": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                {
                    source: "manual",
                    name: "Bottled Breath",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-round-empty-glass.webp",
                    system: {
                        description: { value: "<p>This bottle contains a breath of elemental air. When you inhale it, you either exhale it or hold it.</p><p>If you exhale the breath, you gain the effect of the <em>Gust of Wind</em> spell. If you hold the breath, you don't need to breathe for 1 hour, though you can end this benefit early (for example, to speak). Ending it early doesn't give you the benefit of exhaling the breath.</p>" },
                        weight: 0.5,
                        price: { value: 150, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                { source: "compendium", pack: "dnd5e.items", name: "Oil of Slipperiness" },
                { source: "compendium", pack: "dnd5e.items", name: "Philter of Love" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Acid Resistance" },
                {
                    source: "manual",
                    name: "Potion of Advantage",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-bulb-corked-purple.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, you gain advantage on one ability check, attack roll, or saving throw of your choice that you make within the next hour.</p><p>This potion takes the form of a sparkling, golden mist that moves and pours like water.</p>" },
                        weight: 0.5,
                        price: { value: 120, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Animal Friendship" },
                {
                    source: "manual",
                    name: "Potion of Fire Breath",
                    type: "consumable",
                    img: "icons/consumables/potions/potion-flask-corked-orange.webp",
                    system: {
                        description: { value: "<p>After drinking this potion, you can take a Bonus Action to exhale fire at a target within 30 feet of yourself. The target makes a DC 13 Dexterity saving throw, taking 4d6 Fire damage on a failed save or half as much damage on a successful one. The effect ends after you exhale the fire three times or when 1 hour has passed.</p><p>This potion's orange liquid flickers, and smoke fills the top of the container and wafts out whenever it is opened.</p>" },
                        weight: 0.5,
                        price: { value: 250, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Greater Healing" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Growth" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Hill Giant Strength" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Poison" },
                {
                    source: "manual",
                    name: "Potion of Polychromy",
                    type: "consumable",
                    img: "icons/consumables/potions/potion-flash-open-blue.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, you and everything you are wearing or carrying take on a rainbow-hued appearance for 1 hour. During that time, you can use a bonus action to turn any color or combination of colors you choose. If you mimic the colors of your surroundings, your hues continually shift to match your surroundings, and you have advantage on Dexterity (Stealth) checks until you change your colors again or the potion wears off.</p><p>The potion is separated into seven brightly colored bands of immiscible liquids and has a syrupy taste.</p>" },
                        weight: 0.5,
                        price: { value: 100, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                {
                    source: "manual",
                    name: "Potion of Psionic Fortitude",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-bulb-corked-purple.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself.</p><p>This black potion swirls with shimmering flecks of pink and purple.</p>" },
                        weight: 0.5,
                        price: { value: 150, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                {
                    source: "manual",
                    name: "Potion of Pugilism",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-bulb-corked-green.webp",
                    system: {
                        description: { value: "<p>After you drink this potion, each Unarmed Strike you make deals an extra 1d6 Force damage on a hit. This effect lasts 10 minutes.</p><p>This potion is a thick green fluid that tastes like spinach.</p>" },
                        weight: 0.5,
                        price: { value: 150, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Water Breathing" },
                {
                    source: "manual",
                    name: "Potion of Resistance",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-conical-corked-cyan.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, you have Resistance to one type of damage for 1 hour. The DM chooses the type or determines it randomly by rolling a d10 on the following table:</p><ul><li>1: Acid</li><li>2: Cold</li><li>3: Fire</li><li>4: Force</li><li>5: Lightning</li><li>6: Necrotic</li><li>7: Poison</li><li>8: Psychic</li><li>9: Radiant</li><li>10: Thunder</li></ul>" },
                        weight: 0.5,
                        price: { value: 200, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Cold Resistance" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Fire Resistance" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Force Resistance" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Lightning Resistance" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Necrotic Resistance" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Poison Resistance" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Psychic Resistance" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Radiant Resistance" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Thunder Resistance" }
            ]
        },
        "Poção Raro": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                {
                    source: "manual",
                    name: "Elixir of Health",
                    type: "consumable",
                    img: "icons/consumables/potions/potion-flask-corked-labeled-pink.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, you are cured of all magical contagions. In addition, the following conditions end on you: Blinded, Deafened, Paralyzed, and Poisoned.</p><p>The clear, red liquid has tiny bubbles of light in it.</p>" },
                        weight: 0.5,
                        price: { value: 500, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                { source: "compendium", pack: "dnd5e.items", name: "Oil of Etherealness" },
                {
                    source: "manual",
                    name: "Potion of Aqueous Form",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-circular-corked-labeled-green.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, you transform into a pool of water. You return to your true form after 10 minutes or if you are incapacitated or die.</p><p><strong>Liquid Movement:</strong> You have a swimming speed of 30 feet. You can move over or through other liquids. You can enter and occupy the space of another creature. You can pass through even Tiny openings. You extinguish nonmagical flames in any space you enter.</p><p><strong>Watery Resilience:</strong> You have resistance to nonmagical damage. You also have advantage on Strength, Dexterity, and Constitution saving throws.</p><p><strong>Limitations:</strong> You can't talk, attack, cast spells, or activate magic items. Objects carried meld into your form.</p>" },
                        weight: 0.5,
                        price: { value: 600, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Clairvoyance" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Diminution" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Gaseous Form" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Heroism" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Invisibility" },
                {
                    source: "manual",
                    name: "Potion of Invulnerability",
                    type: "consumable",
                    img: "icons/consumables/potions/potion-flask-corked-tied-necklace-teal.webp",
                    system: {
                        description: { value: "<p>For 1 minute after you drink this potion, you have Resistance to all damage.</p><p>This potion's syrupy liquid looks like liquefied iron.</p>" },
                        weight: 0.5,
                        price: { value: 1500, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                {
                    source: "manual",
                    name: "Potion of Maximum Power",
                    type: "consumable",
                    img: "icons/consumables/potions/potion-vial-tube-yellow.webp",
                    system: {
                        description: { value: "<p>The first time you cast a damage-dealing spell of 4th level or lower within 1 minute after drinking the potion, instead of rolling dice to determine the damage dealt, you can instead use the highest number possible for each die.</p><p>This glowing purple liquid smells of sugar and plum, but it has a muddy taste.</p>" },
                        weight: 0.5,
                        price: { value: 1000, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                {
                    source: "manual",
                    name: "Potion of Mind Control (beast)",
                    type: "consumable",
                    img: "icons/consumables/potions/round-cork-leaf-green.webp",
                    system: {
                        description: { value: "<p>When you drink this potion of mind control, you can cast a dominate beast spell (save DC 15) on a beast if you do so before the end of your next turn. If you don't, the potion is wasted.</p><p>If the target's initial saving throw fails, the effect lasts for 1 hour, with no concentration required on your part. The charmed creature has disadvantage on new saving throws to break the effect during this time.</p>" },
                        weight: 0.5,
                        price: { value: 800, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                {
                    source: "manual",
                    name: "Potion of Mind Control (humanoid)",
                    type: "consumable",
                    img: "icons/consumables/potions/round-decorated-snake-green.webp",
                    system: {
                        description: { value: "<p>When you drink this potion of mind control, you can cast a dominate person spell (save DC 15) on a humanoid if you do so before the end of your next turn. If you don't, the potion is wasted.</p><p>If the target's initial saving throw fails, the effect lasts for 1 hour, with no concentration required on your part. The charmed creature has disadvantage on new saving throws to break the effect during this time.</p>" },
                        weight: 0.5,
                        price: { value: 1200, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                {
                    source: "manual",
                    name: "Potion of Mind Reading",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-conical-corked-labeled-shell-cyan.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, you gain the effect of the <em>Detect Thoughts</em> spell (save DC 13) for 10 minutes (no Concentration required).</p><p>This potion's dense, purple liquid has an ovoid cloud of pink floating in it.</p>" },
                        weight: 0.5,
                        price: { value: 600, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Superior Healing" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Fire Giant Strength" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Frost Giant Strength" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Stone Giant Strength" }
            ]
        },
        "Poção Muito Raro": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Oil of Sharpness" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Cloud Giant Strength" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Flying" },
                {
                    source: "manual",
                    name: "Potion of Greater Invisibility",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-bulb-empty-glass.webp",
                    system: {
                        description: { value: "<p>This potion's container looks empty but feels as though it holds liquid. When you drink the potion, you have the Invisible condition for 1 hour.</p>" },
                        weight: 0.5,
                        price: { value: 5000, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                {
                    source: "manual",
                    name: "Potion of Longevity",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-metal-yellow-gray.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, your physical age is reduced by 1d6 + 6 years, to a minimum of 13 years. Each time you subsequently drink a Potion of Longevity, there is 10 percent cumulative chance that you instead age by 1d6 + 6 years.</p><p>Suspended in this amber liquid is a tiny heart that, against all reason, is still beating. These ingredients vanish when the potion is opened.</p>" },
                        weight: 0.5,
                        price: { value: 9000, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                {
                    source: "manual",
                    name: "Potion of Mind Control (monster)",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-round-label-cork-green.webp",
                    system: {
                        description: { value: "<p>When you drink a potion of mind control, you can cast a dominate monster spell (save DC 15) on a creature if you do so before the end of your next turn. If you don't, the potion is wasted.</p><p>The charmed creature has disadvantage on new saving throws to break the effect during this time.</p>" },
                        weight: 0.5,
                        price: { value: 8000, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                {
                    source: "manual",
                    name: "Potion of Possibility",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-conical-corked-blue.webp",
                    system: {
                        description: { value: "<p>When you drink this clear potion, you gain two Fragments of Possibility, each of which looks like a Tiny, grayish bead of energy that follows you around, staying within 1 foot of you at all times. Each fragment lasts for 8 hours or until used.</p><p>When you make an attack roll, an ability check, or a saving throw, you can expend your fragment to roll an additional d20 and choose which of the d20s to use. Alternatively, when an attack roll is made against you, you can expend your fragment to roll a d20 and choose which of the d20s to use, the one you rolled or the one the attacker rolled.</p>" },
                        weight: 0.5,
                        price: { value: 6000, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Speed" },
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Supreme Healing" },
                {
                    source: "manual",
                    name: "Potion of Vitality",
                    type: "consumable",
                    img: "icons/consumables/potions/flask-decorated-label-pink.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, it removes any Exhaustion levels you have and ends the Poisoned condition on you. For the next 24 hours, you regain the maximum number of Hit Points for any Hit Point Dice you spend.</p><p>This potion's crimson liquid regularly pulses with dull light, calling to mind a heartbeat.</p>" },
                        weight: 0.5,
                        price: { value: 5000, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                }
            ]
        },
        "Poção Lendário": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Potion of Storm Giant Strength" },
                {
                    source: "manual",
                    name: "Potion of Dragon's Majesty",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-ornate-bat-teal.webp",
                    system: {
                        description: { value: "<p>This potion looks like liquid gold, with a single scale from a chromatic, gem, or metallic dragon suspended in it. When you drink this potion, you transform into an adult dragon of the same kind as the dragon the scale came from. The transformation lasts for 1 hour. Any equipment you are wearing or carrying melds into your new form or falls to the ground (your choice). For the duration, you use the game statistics of the adult dragon instead of your own, but you retain your languages, personality, and memories. You can't use a dragon's Change Shape or its legendary or lair actions.</p>" },
                        weight: 0.5,
                        price: { value: 25000, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                },
                {
                    source: "manual",
                    name: "Potion of Giant Size",
                    type: "consumable",
                    img: "icons/consumables/potions/bottle-round-flask-fumes-purple.webp",
                    system: {
                        description: { value: "<p>When you drink this potion, you become Huge for 24 hours if you are Medium or smaller. For that duration, your Strength becomes 25, and your hit point maximum is doubled reach of melee attacks increases by 5 feet.</p><p>When damage is rolled for weapons enlarged in this manner, roll three times the normal number of dice (e.g. 3d8 slashing for an enlarged longsword). This potion is a pale white liquid made from the tongue of a giant clam, with a pungent aroma.</p>" },
                        weight: 0.5,
                        price: { value: 20000, denomination: "gp" },
                        consumableType: "potion",
                        quantity: 1
                    }
                }
            ]
        },
        "Item de Aventureiro": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                "Acid (vial)", "Alchemist's Fire", "Antitoxin", "Candle", "Oil Flask",
                "Perfume", "Sealing Wax", "Soap"
            ]
        }
    },

    "Ferreiro": {
        "Arma Simples": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                "Club", "Dagger", "Greatclub", "Handaxe", "Javelin",
                "Light Hammer", "Mace", "Quarterstaff", "Sickle", "Spear"
            ]
        },
        "Arma Marcial": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                "Battleaxe", "Flail", "Glaive", "Greataxe", "Greatsword",
                "Halberd", "Lance", "Longsword", "Maul", "Morningstar",
                "Pike", "Rapier", "Scimitar", "Shortsword", "Trident",
                "War Pick", "Warhammer", "Whip"
            ]
        },
        "Armadura Média": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                "Chain Shirt", "Scale Mail", "Breastplate", "Half Plate Armor", "Shield"
            ]
        },
        "Armadura Pesada": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                "Ring Mail", "Chain Mail", "Splint Armor", "Plate Armor"
            ]
        }
    },

    "Escriba": {
        "Cópia de Texto": {
            source: "manual",
            name: "{projeto} - Texto Copiado - {complexidade}",
            type: "loot",
            img: "icons/sundries/scrolls/scroll-bound-brown.webp",
            system: {
                description: { value: "<p>Texto copiado por um escriba.</p>" },
                weight: 1,
                price: { value: 1, denomination: "gp" }
            }
        },
        "Obra de Arte": {
            source: "manual",
            name: "{projeto} - Obra de Arte - {complexidade}",
            type: "loot",
            img: "icons/sundries/documents/document-painting-canvas.webp",
            system: {
                description: { value: "<p>Obra de arte pintada por um escriba.</p>" },
                weight: 2,
                price: { value: 5, denomination: "gp" }
            }
        },
        "Escrita de Livro": {
            source: "manual",
            name: "{projeto} - Livro - {complexidade}",
            type: "loot",
            img: "icons/sundries/books/book-stack.webp",
            system: {
                description: { value: "<p>Livro escrito por um escriba.</p>" },
                weight: 3,
                price: { value: 10, denomination: "gp" }
            }
        },
        "Pergaminho de Magia Comum": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Spell Scroll (Cantrip)" },
                { source: "compendium", pack: "dnd5e.items", name: "Spell Scroll (1st Level)" }
            ]
        },
        "Pergaminho de Magia Incomum": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Spell Scroll (2nd Level)" },
                { source: "compendium", pack: "dnd5e.items", name: "Spell Scroll (3rd Level)" }
            ]
        },
        "Pergaminho de Magia Raro": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Spell Scroll (4th Level)" },
                { source: "compendium", pack: "dnd5e.items", name: "Spell Scroll (5th Level)" }
            ]
        },
        "Pergaminho de Magia Muito Raro": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Spell Scroll (6th Level)" },
                { source: "compendium", pack: "dnd5e.items", name: "Spell Scroll (7th Level)" },
                { source: "compendium", pack: "dnd5e.items", name: "Spell Scroll (8th Level)" }
            ]
        },
        "Pergaminho de Magia Lendário": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Spell Scroll (9th Level)" }
            ]
        }
    },

    "Joalheiro": {
        "Gema Lapidada": {
            source: "manual",
            name: "Gema Lapidada",
            type: "loot",
            img: "icons/commodities/gems/gem-faceted-diamond-red.webp",
            system: {
                description: { value: "<p>Uma gema lapidada com precisão.</p>" },
                weight: 0.1,
                price: { value: 0, denomination: "gp" }
            }
        }
    },

    "Cozinheiro": {
        "Squalid": {
            source: "manual",
            name: "Squalid Meal",
            type: "consumable",
            img: "icons/consumables/food/bowl-mush-gray.webp",
            system: {
                description: { value: "<p>A squalid meal, barely edible but prevents starvation.</p>" },
                weight: 1,
                consumableType: "food",
                price: { value: 3, denomination: "cp" }
            }
        },
        "Poor": {
            source: "manual",
            name: "Poor Meal",
            type: "consumable",
            img: "icons/consumables/food/bowl-stew-brown.webp",
            system: {
                description: { value: "<p>A poor meal, simple and plain.</p>" },
                weight: 1,
                consumableType: "food",
                price: { value: 6, denomination: "cp" }
            }
        },
        "Modest": {
            source: "manual",
            name: "Modest Meal",
            type: "consumable",
            img: "icons/consumables/food/bowl-stew-yellow.webp",
            system: {
                description: { value: "<p>A modest meal, satisfying and decent.</p>" },
                weight: 1,
                consumableType: "food",
                price: { value: 15, denomination: "cp" }
            }
        },
        "Comfortable": {
            source: "manual",
            name: "Comfortable Meal",
            type: "consumable",
            img: "icons/consumables/food/plate-beef-potatoes.webp",
            system: {
                description: { value: "<p>A comfortable meal, tasty and nourishing.</p>" },
                weight: 1,
                consumableType: "food",
                price: { value: 5, denomination: "sp" }
            }
        },
        "Wealthy": {
            source: "manual",
            name: "Wealthy Meal",
            type: "consumable",
            img: "icons/consumables/food/roast-chicken-clay.webp",
            system: {
                description: { value: "<p>A wealthy meal, rich and abundant.</p>" },
                weight: 1,
                consumableType: "food",
                price: { value: 8, denomination: "sp" }
            }
        },
        "Aristocrat": {
            source: "manual",
            name: "Aristocrat Meal",
            type: "consumable",
            img: "icons/consumables/food/platter-turkey.webp",
            system: {
                description: { value: "<p>An aristocrat meal, prepared with fine ingredients and exquisite flavor.</p>" },
                weight: 1,
                consumableType: "food",
                price: { value: 2, denomination: "gp" }
            }
        },
        "Banquete": {
            source: "manual",
            name: "Banquet",
            type: "consumable",
            img: "icons/consumables/food/feast-table.webp",
            system: {
                description: { value: "<p>Banquet prepared by a cook. Eating of this banquet gives [value] temporary hit points that last until the end of your next long rest.</p>" },
                weight: 5,
                consumableType: "food",
                price: { value: 10, denomination: "gp" }
            }
        }
    },

    "Sicário": {
        "Veneno Básico": {
            source: "compendium",
            pack: "dnd5e.items",
            name: "Poison (Basic)"
        },
        "Veneno de Dragão Verde": {
            source: "manual",
            name: "Veneno de Dragão Verde",
            type: "consumable",
            img: "icons/consumables/potions/bottle-conical-fumes-green.webp",
            system: {
                description: { value: "<p>Extraído diretamente das glândulas de um dragão verde.</p>" },
                weight: 0.5,
                consumableType: "poison",
                price: { value: 200, denomination: "gp" },
                damage: { parts: [["4d6", "poison"]] }
            }
        }
    },

    "Cartógrafo": {
        "Cópia de Mapa": {
            source: "manual",
            name: "{projeto} - Cópia de Mapa",
            type: "loot",
            img: "icons/sundry/books/scroll-bound-white.webp",
            system: {
                description: { value: "<p>Uma cópia precisa e detalhada de um mapa existente.</p>" },
                weight: 0.1,
                price: { value: 10, denomination: "gp" }
            }
        },
        "Desenho de Mapa": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                {
                    source: "manual",
                    name: "World Map - {projeto}",
                    type: "loot",
                    img: "icons/sundry/books/map-rolled-leather-tan.webp",
                    system: {
                        description: { value: "<p>Um mapa detalhado descrevendo terras conhecidas, continentes e oceanos.</p>" },
                        weight: 0.5,
                        price: { value: 100, denomination: "gp" }
                    }
                },
                {
                    source: "manual",
                    name: "Regional Map - {projeto}",
                    type: "loot",
                    img: "icons/sundry/books/map-rolled-leather-tan.webp",
                    system: {
                        description: { value: "<p>Um mapa detalhado descrevendo uma região específica, província ou reino.</p>" },
                        weight: 0.3,
                        price: { value: 50, denomination: "gp" }
                    }
                },
                {
                    source: "manual",
                    name: "Local Map - {projeto}",
                    type: "loot",
                    img: "icons/sundry/books/map-rolled-leather-tan.webp",
                    system: {
                        description: { value: "<p>Um mapa local detalhado descrevendo uma cidade, floresta ou área adjacente.</p>" },
                        weight: 0.2,
                        price: { value: 20, denomination: "gp" }
                    }
                },
                {
                    source: "manual",
                    name: "Specific Map - {projeto}",
                    type: "loot",
                    img: "icons/sundry/books/map-rolled-leather-tan.webp",
                    system: {
                        description: { value: "<p>Um mapa específico e focado, como o plano de uma masmorra, castelo ou ruína.</p>" },
                        weight: 0.1,
                        price: { value: 30, denomination: "gp" }
                    }
                }
            ]
        }
    },

    "Carpinteiro": {
        "Item de Aventureiro": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Arrow", quantity: 20 },
                { source: "compendium", pack: "dnd5e.items", name: "Blowgun Needle", quantity: 50 },
                { source: "compendium", pack: "dnd5e.items", name: "Crossbow Bolt", quantity: 20 },
                { source: "compendium", pack: "dnd5e.items", name: "Sling Bullet", quantity: 20 },
                { source: "compendium", pack: "dnd5e.items", name: "Abacus" },
                { source: "compendium", pack: "dnd5e.items", name: "Rod" },
                { source: "compendium", pack: "dnd5e.items", name: "Staff" },
                { source: "compendium", pack: "dnd5e.items", name: "Wand" },
                { source: "compendium", pack: "dnd5e.items", name: "Basket" },
                { source: "compendium", pack: "dnd5e.items", name: "Bucket" },
                { source: "compendium", pack: "dnd5e.items", name: "Crossbow Bolt Case" },
                { source: "compendium", pack: "dnd5e.items", name: "Scroll Case" },
                { source: "compendium", pack: "dnd5e.items", name: "Map Case" },
                { source: "compendium", pack: "dnd5e.items", name: "Map or Scroll Case" },
                { source: "compendium", pack: "dnd5e.items", name: "Chest" },
                { source: "compendium", pack: "dnd5e.items", name: "Totem" },
                { source: "compendium", pack: "dnd5e.items", name: "Yew Wand" },
                { source: "compendium", pack: "dnd5e.items", name: "Ladder (10-foot)" },
                { source: "compendium", pack: "dnd5e.items", name: "Pole" },
                { source: "compendium", pack: "dnd5e.items", name: "Quiver" },
                { source: "compendium", pack: "dnd5e.items", name: "Portable Ram" },
                { source: "compendium", pack: "dnd5e.items", name: "Tinderbox" },
                { source: "compendium", pack: "dnd5e.items", name: "Torch" }
            ]
        },
        "Arma Simples": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                "Club", "Greatclub", "Quarterstaff", "Shortbow"
            ]
        },
        "Arma Marcial": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                "Longbow", "Blowgun", "Light Crossbow", "Heavy Crossbow", "Hand Crossbow"
            ]
        },
        "Escudo": {
            source: "compendium",
            pack: "dnd5e.items",
            name: "Shield"
        },
        "Peça de Madeira": {
            source: "manual",
            name: "{projeto} - Peça de Madeira ({complexidade})",
            type: "loot",
            img: "icons/commodities/materials/wood-log-brown.webp",
            system: {
                description: { value: "<p>Uma peça de madeira trabalhada por um carpinteiro.</p>" },
                weight: 1,
                price: { value: 1, denomination: "gp" }
            }
        },
        "Preparo para Encantamento": {
            source: "manual",
            name: "{projeto} - Peça de Madeira pronta para encantamento - {raridade}",
            type: "loot",
            img: "icons/commodities/wood/plank-carved-glowing.webp",
            system: {
                description: { value: "<p>Uma base de madeira gravada com runas por um carpinteiro, pronta para receber um encantamento mágico.</p>" },
                weight: 1,
                price: { value: 10, denomination: "gp" }
            }
        }
    },

    "Coureiro": {
        "Item de Aventureiro": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Backpack" },
                { source: "compendium", pack: "dnd5e.items", name: "Pouch" },
                { source: "compendium", pack: "dnd5e.items", name: "Waterskin" },
                { source: "compendium", pack: "dnd5e.items", name: "Saddle, Pack" },
                { source: "compendium", pack: "dnd5e.items", name: "Saddle, Riding" }
            ]
        },
        "Armadura Leve": {
            source: "list",
            pack: "dnd5e.items",
            options: [
                { source: "compendium", pack: "dnd5e.items", name: "Leather Armor" },
                { source: "compendium", pack: "dnd5e.items", name: "Studded Leather Armor" }
            ]
        },
        "Armadura Média": {
            source: "compendium",
            pack: "dnd5e.items",
            name: "Hide Armor"
        },
        "Arma Estilingue": {
            source: "compendium",
            pack: "dnd5e.items",
            name: "Sling"
        },
        "Arma Chicote": {
            source: "compendium",
            pack: "dnd5e.items",
            name: "Whip"
        },
        "Item de Couro": {
            source: "manual",
            name: "{projeto} - Item de Couro ({complexidade})",
            type: "loot",
            img: "icons/commodities/leather/leather-roll-brown.webp",
            system: {
                description: { value: "<p>Um item de couro trabalhado por um coureiro.</p>" },
                weight: 1,
                price: { value: 1, denomination: "gp" }
            }
        },
        "Preparo para Encantamento": {
            source: "manual",
            name: "{projeto} - Peça de Couro pronta para encantamento - {raridade}",
            type: "loot",
            img: "icons/commodities/leather/rawhide-glowing.webp",
            system: {
                description: { value: "<p>Uma base de couro gravada com runas por um coureiro, pronta para receber um encantamento mágico.</p>" },
                weight: 1,
                price: { value: 10, denomination: "gp" }
            }
        }
    },

    "Engenheiro": {
        "Mecanismo Improvisado": {
            source: "manual",
            name: "{projeto} - Mecanismo Improvisado ({complexidade})",
            type: "loot",
            img: "icons/commodities/tech/cog-brass.webp",
            system: {
                description: { value: "<p>Um mecanismo improvisado criado por um engenheiro.</p>" },
                weight: 1,
                price: { value: 1, denomination: "gp" }
            }
        },
        "Mecanismo": {
            source: "manual",
            name: "{projeto} - Mecanismo ({complexidade})",
            type: "loot",
            img: "icons/commodities/tech/cogs-gold.webp",
            system: {
                description: { value: "<p>Um mecanismo completo projetado e construído por um engenheiro.</p>" },
                weight: 2,
                price: { value: 1, denomination: "gp" }
            }
        },
        "Planos de Estruturas": {
            source: "manual",
            name: "{projeto} - Planos de Estruturas ({complexidade})",
            type: "loot",
            img: "icons/sundries/scrolls/scroll-bound-blue.webp",
            system: {
                description: { value: "<p>Planos e esquemas de estrutura desenvolvidos por um engenheiro.</p>" },
                weight: 0.5,
                price: { value: 1, denomination: "gp" }
            }
        },
        "Preparo para Encantamento": {
            source: "manual",
            name: "{projeto} - Peça de Engenharia pronta para encantamento - {raridade}",
            type: "loot",
            img: "icons/commodities/tech/cog-glowing.webp",
            system: {
                description: { value: "<p>Uma base mecânica gravada com runas por um engenheiro, pronta para receber um encantamento mágico.</p>" },
                weight: 1,
                price: { value: 10, denomination: "gp" }
            }
        }
    }
};