import { ObjectDefinitions, type ObjectDefinition } from "../utils/objectDefinitions";
import { Ammos } from "./items/ammos";
import { Guns } from "./items/guns";
import { HealingItems } from "./items/healingItems";
import { Melees } from "./items/melees";
import { Throwables } from "./items/throwables";

export enum EmoteCategory {
    People,
    Text,
    Memes,
    Icons,
    Misc,
    Team,
    Weapon
}

export interface EmoteDefinition extends ObjectDefinition {
    readonly category: EmoteCategory
    readonly scale?: number
    readonly hideInLoadout?: boolean
}

const emote = (name: string, category: EmoteCategory): EmoteDefinition => ({
    idString: name.toLowerCase().replace(/ /g, "_"),
    name,
    category
});

export const Emotes = new ObjectDefinitions<EmoteDefinition>([
    ...[
        "Happy Face",
        "Sad Face",
        "Thumbs Up",
        "Thumbs Down",
        "Wave",
        "Disappointed Face",
        "Sobbing Face",
        "Angry Face",
        "Heart Face",
        "Flushed Face",
        "Joyful Face",
        "Cool Face",
        "Upside Down Face",
        "Picasso Face",
        "Alien",
        "Headshot",
        "Panned",
        "Dab",
        "Devil Face",
        "Bandaged Face",
        "Cold Face",
        "Thinking Face",
        "Nervous Face",
        "Sweating Face",
        "Greedy Face",
        "Creepy Clown",
        "Lying Face",
        "Nerd Face",
        "Side Eye Face",
        "Man Face",
        "Skull",
        "Blind Walking",
        "Melting Face",
        "Grimacing Face",
        "Vomiting Face",
        "Screaming Face",
        "Pleading Face",
        "Sad Smiling Face",
        "Triumphant Face",
        "Questioning Face",
        "Shrugging Face",
        "Facepalm",
        "Smirking Face",
        "Blushing Face",
        "Saluting Face",
        "Neutral Face",
        "Relieved Face",
        "Monocle Face",
        "Partying Face",
        "Shushing Face",
        "Sighing Face",
        "Yawning Face",
        "Frustrated Face",
        "Weary Face",
        "Pensive Face",
        "Zipper Mouth Face",
        "Zombie Face"
    ].map(name => emote(name, EmoteCategory.People)),
    ...[
        "Suroi Logo",
        "AEGIS Logo",
        "Flint Logo",
        "Duel",
        "Chicken Dinner",
        "Trophy"
    ].map(name => emote(name, EmoteCategory.Icons)),
    ...[
        "Troll Face",
        "Clueless",
        "Pog",
        "Froog",
        "Bleh",
        "Muller",
        "Suroi General Chat",
        "RIP",
        "Leosmug",
        "awhhmahgawd",
        "emoji_50",
        "Boykisser",
        "Grr"
    ].map(name => emote(name, EmoteCategory.Memes)),
    ...[
        "Question Mark",
        "Team = Ban",
        "Hack = Ban",
        "gg",
        "ez",
        "Hi5",
        "oof",
        "real",
        "fake",
        "Colon Three"
    ].map(name => emote(name, EmoteCategory.Text)),
    ...[
        "Fire",
        "Carrot",
        "Egg",
        "Penguin",
        "Squid",
        "Tomato",
        "Leek",
        "Eagle"
    ].map(name => emote(name, EmoteCategory.Misc)),
    ...[
        ...Ammos,
        ...HealingItems
    ].map(({ idString, name }) => ({
        idString,
        name,
        category: EmoteCategory.Team,
        scale: 0.7,
        hideInLoadout: true
    })),
    ...[
        ...Guns,
        ...Melees,
        ...Throwables
    ].map(({ idString, name }) => ({
        idString,
        name,
        category: EmoteCategory.Weapon,
        hideInLoadout: true
    }))
]);
