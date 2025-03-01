import { CAHDeck } from "./CAHDeck";
import fs from 'fs';
import path from 'path';

const decksDir = path.resolve(__dirname, '../decks');
const deckFiles = fs.readdirSync(decksDir);

function shuffle(arr) {
    arr.sort((a, b) => Math.random() * 2 - 1); // Random number instead of comparison
}

export let loadedDecks = [];

let deck;

function loadDecks(_deck, i) {
    deck = _deck;
    let packs = deck.listPacks();
    packs.forEach((p, i) => p.index = i);
    for (let pack of packs) {
        let _deck = deck.getPack(pack.index);
        shuffle(_deck.white);
        shuffle(_deck.black);
        loadedDecks.push(_deck);
    }
}

export async function shuffleDecks() {
    loadedDecks.forEach(deck => {
        shuffle(deck.white);
        shuffle(deck.black);
    });
};

deckFiles.forEach(async (file, i) => {
    const filePath = path.join(decksDir, file);
    const deckData = fs.readFileSync(filePath, 'utf-8');
    loadDecks(await CAHDeck.fromFull(deckData, false), i);
});