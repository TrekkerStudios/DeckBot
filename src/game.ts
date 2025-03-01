import { sleep } from "bun";
import { loadedDecks, shuffleDecks } from "./lib/decks";
import { joinRoundRow, buildStartRoundEmbed } from "./lib/templates/public";
import { buildCzarSelectDialog } from "./lib/templates/czar";

export type Gamestate = {
    gameStarted: string;
    gameUUID: string;
    players: { player: string, score: number, isCzar: boolean, hand: any[] }[];
    currentCzar: string;
    currentCard: string;
    currentPick: number;
    currentDecks: any[];
    maxPoints: number;
    threadName: string;
    globalWhiteDeck: number;
    cardsInPlay: { player: string, cards: string[] }[];
    currentlyPicking: boolean;
    currentlyJudging: boolean;
    roundWinner: string;
    roundWinningCard: string;
}

export function createGame(points: number) {
    const game: Gamestate = {
        gameStarted: new Date().toISOString(),
        gameUUID: Math.random().toString(36).substring(2, 6),
        players: [],
        currentCzar: '',
        currentCard: '',
        currentPick: 0,
        currentDecks: [],
        maxPoints: points,
        threadName: '',
        globalWhiteDeck: 0,
        cardsInPlay: [],
        currentlyPicking: false,
        currentlyJudging: false,
        roundWinner: '',
        roundWinningCard: '',
    };
    game.currentDecks.push(...loadedDecks);
    return game;
}

export function addPlayer(game: Gamestate, player: string) {
    if (game.players.find(x => x.player === player)) return;
    let hand: any[] = [];
    for (let i = 0; i < 7; i++) {
        let randomDeck = Math.floor(Math.random() * game.currentDecks.length);
        hand.push(game.currentDecks[randomDeck].white[game.globalWhiteDeck]);
        game.globalWhiteDeck++;
    }
    console.log(`Adding player ${player} to game ${game.gameUUID}`);
    game.players.push({ player, score: 0, isCzar: false, hand });
}

export function setThreadName(game: Gamestate, threadName: string) {
    game.threadName = threadName;
}

export async function gameLoop(game: Gamestate, gameThread: any) {
    console.log('Starting game in 30s...');
    gameThread.send('Type /play to join the game!');
    gameThread.send('Game will start in 30 seconds...');
    await sleep(5000);
    // FIX
    console.log('10s left...');
    gameThread.send('10s left...');
    await sleep(5000);
    // FIX
    console.log(`Starting game...\n${game.players.length} players:`);
    game.players.forEach(x => console.log(x.player));
    gameThread.send('Game starting now!');

    // while (true) {
        console.log('New round starting...');

        // shuffleDecks();

        // Pick black card, set czar
        let blackCounter = 0;
        let randomDeck = Math.floor(Math.random() * game.currentDecks.length);
        let _newCard = game.currentDecks[randomDeck].black[blackCounter];
        game.currentCard = _newCard.text;
        game.currentPick = _newCard.pick;
        let prevCzar = game.currentCzar
        let newCzar = game.players[Math.floor(Math.random() * game.players.length)].player;
        while (newCzar === prevCzar) {
            newCzar = game.players[Math.floor(Math.random() * game.players.length)].player;
        }
        game.currentCzar = newCzar;

        // Begin round
        game.currentlyPicking = true;
        game.currentlyJudging = false;
        await gameThread.send({
            embeds: [buildStartRoundEmbed(game)],
        });
		await gameThread.send({
			components: [joinRoundRow],
		});
        await sleep(30000).then(() => {
            game.currentlyPicking = false;
            game.currentlyJudging = true;
            gameThread.send(`Time's up!`);
        });
        await gameThread.send({ embed: buildCzarSelectDialog(game) });
        

        blackCounter++;
    // }
}