import { CAHDeck } from "./CAHDeck";
import { ManyDeck } from "./ManyDecks";
import fs from 'fs';
import path from 'path';

const jsonDecksDir = path.resolve(__dirname, '../decks/json');
const jsonDeckFiles = fs.readdirSync(jsonDecksDir);
const mdDecksDir = path.resolve(__dirname, '../decks/manydecks');
const mdDeckFiles = fs.readdirSync(mdDecksDir);

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

export async function loadDecksMD(deck, i) {
    let _deck = deck.deck;
    shuffle(_deck.white);
    shuffle(_deck.black);
    loadedDecks.push(_deck);
}

export async function shuffleDecks() {
    loadedDecks.forEach(deck => {
        shuffle(deck.white);
        shuffle(deck.black);
    });
};

jsonDeckFiles.filter(file => path.extname(file) === '.json').forEach(async (file, i) => {
    const filePath = path.join(jsonDecksDir, file);
    const deckData = fs.readFileSync(filePath, 'utf-8');
    loadDecks(await CAHDeck.fromFull(deckData, false), i);
});

mdDeckFiles.filter(file => path.extname(file) === '.json5').forEach(async (file, i) => {
    const filePath = path.join(mdDecksDir, file);
    const deckData = fs.readFileSync(filePath, 'utf-8');
    loadDecksMD(await ManyDeck.fromJSON(deckData, false), i);
});