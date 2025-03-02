import { sleep } from "bun";
import { loadedDecks, shuffleDecks } from "./lib/decks";
import { joinRoundRow, buildStartRoundEmbed, pickWinnerRow } from "./lib/templates/public";
import { blockQuote, userMention } from "discord.js";

export type Gamestate = {
    gameStarted: string;
    gameUUID: string;
    active: boolean;
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
    winnerPicked: boolean;
    blackCounter: number;
}

export function createGame(points: number) {
    const game: Gamestate = {
        gameStarted: new Date().toISOString(),
        gameUUID: Math.random().toString(36).substring(2, 6),
        active: false,
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
        winnerPicked: false,
        blackCounter: 0,
    };
    game.currentDecks.push(...loadedDecks);
    return game;
}

export function addPlayer(game: Gamestate, player: string) {
    if (game.players.find(x => x.player === player)) return;
    let hand: any[] = [];
    for (let i = 0; i < 7; i++) {
        let randomDeck = Math.floor(Math.random() * game.currentDecks.length);
        let _card = game.currentDecks[randomDeck].white[game.globalWhiteDeck];
        if (!_card) {
            console.log('Out of white cards, reshuffling...');
            game.globalWhiteDeck = 0;
            randomDeck = Math.floor(Math.random() * game.currentDecks.length);
            _card = game.currentDecks[randomDeck].white[game.globalWhiteDeck];
        }
        hand.push(_card);
        game.globalWhiteDeck++;
    }
    console.log(`Adding player ${player} to game ${game.gameUUID}`);
    game.players.push({ player, score: 0, isCzar: false, hand });
}

async function drawCards(game: Gamestate, player: string) {
    if (!game.players.find(x => x.player === player)) return;

    let _player = game.players.find(x => x.player === player);
    if (_player) {
        for (let i = 0; i < 7 - _player.hand.length; i++) {
            let randomDeck = Math.floor(Math.random() * game.currentDecks.length);
            let _card = game.currentDecks[randomDeck].white[game.globalWhiteDeck];
            if (!_card) {
                console.log('Out of white cards, reshuffling...');
                game.globalWhiteDeck = 0;
                randomDeck = Math.floor(Math.random() * game.currentDecks.length);
                _card = game.currentDecks[randomDeck].white[game.globalWhiteDeck];
            }
            if (game.players.some(p => p.hand.includes(_card))) {
                console.log('Card already in another player\'s hand, drawing another...');
                randomDeck = Math.floor(Math.random() * game.currentDecks.length);
                _card = game.currentDecks[randomDeck].white[game.globalWhiteDeck];
            }
            _player.hand.push(_card);
            game.globalWhiteDeck++;
        }
    }
}

export function setThreadName(game: Gamestate, threadName: string) {
    game.threadName = threadName;
}

export async function gameLoop(game: Gamestate, gameThread: any) {
    console.log('Starting game in 30s...');
    gameThread.send('Type /play to join the game!');
    gameThread.send(`Game will start <t:${Math.floor((Date.now() + 30000) / 1000)}:R>...`).then(message => {
        setTimeout(() => message.delete(), 30_000);
    });
    await sleep(30000);
    console.log(`Starting game...\n${game.players.length} players:`);
    game.players.forEach(x => console.log(x.player));
    gameThread.send('Game starting now!');
    game.active = true;

    while (game.active) {
        console.log('New round starting...');

        shuffleDecks();

        // Pick black card, set czar
        console.log('Picking black card...', game.blackCounter);
        let randomDeck = Math.floor(Math.random() * game.currentDecks.length);
        console.log('Random deck:', randomDeck);
        let _newCard = game.currentDecks[randomDeck].black[game.blackCounter];
        console.log('New card:', _newCard.text);

        if (!_newCard) {
            console.log('Out of black cards, reshuffling...');
            console.log('Picking black card...', game.blackCounter);
            let randomDeck = Math.floor(Math.random() * game.currentDecks.length);
            console.log('Random deck:', randomDeck);
            let _newCard = game.currentDecks[randomDeck].black[game.blackCounter];
            console.log('New card:', _newCard.text);
        }

        game.currentCard = _newCard.text;
        game.currentPick = _newCard.pick;
        let prevCzar = game.currentCzar
        let newCzar = game.players[Math.floor(Math.random() * game.players.length)].player;
        while (newCzar === prevCzar) {
            newCzar = game.players[Math.floor(Math.random() * game.players.length)].player;
        }
        game.currentCzar = newCzar;
        let _setCzarPlayer = game.players.find(x => x.player === game.currentCzar);
        if (_setCzarPlayer) {
            _setCzarPlayer.isCzar = true;
        }
        console.log('New czar:', game.currentCzar);

        // Begin round
        game.currentlyPicking = true;
        game.currentlyJudging = false;
        await gameThread.send({
            embeds: [buildStartRoundEmbed(game)],
        });
        await gameThread.send({
            components: [joinRoundRow],
        });
        gameThread.send(`You have 90 seconds...`).then(message => {
            setTimeout(() => message.delete(), 90_000);
        });
        for (let i = 0; i < 90; i++) {
            if (!game.currentlyPicking) break;
            if (i === 30) {
                gameThread.send(`Round will end <t:${Math.floor((Date.now() + 90000) / 1000)}:R>...`).then(message => {
                    setTimeout(() => message.delete(), 90_000);
                });
            }
            await sleep(1000);
        }
        game.currentlyPicking = false;
        game.currentlyJudging = true;
        gameThread.send(`Time's up!`);
        await gameThread.send({ content: `Please wait while ${userMention(game.currentCzar)} picks a winner...` });
        await gameThread.send({
            components: [pickWinnerRow],
        });
        gameThread.send(`Judging will end <t:${Math.floor((Date.now() + 60000) / 1000)}:R>...`).then(message => {
            setTimeout(() => message.delete(), 60_000);
        });
        for (let i = 0; i < 60; i++) {
            if (game.winnerPicked) break;
            await sleep(1000);
        }
        game.currentlyPicking = false;
        game.currentlyJudging = true;
        gameThread.send(`Time's up!`);

        // Draw cards to players
        for (let i = 0; i < game.players.length; i++) {
            await drawCards(game, game.players[i].player);
        }

        // Check if winner was picked
        if (!game.winnerPicked) {
            gameThread.send(`No winner was picked this round, everyone throw tomatoes at ${userMention(game.currentCzar)}!`)
                .then(message => {
                    message.react('🍅');
                })
                .catch(console.error);
        } else {
            gameThread.send(`The winner is ${userMention(game.roundWinner)} with card(s):\n${blockQuote(game.roundWinningCard)}`);
            let winner = game.players.find(x => x.player === game.roundWinner);
            if (winner) {
                winner.score++;
            }
        }

        // Reset round props
        game.currentCzar = '';
        game.currentCard = '';
        game.currentPick = 0;
        game.cardsInPlay = [];
        game.currentlyPicking = false;
        game.currentlyJudging = false;
        game.roundWinner = '';
        game.roundWinningCard = '';
        game.winnerPicked = false;
        game.blackCounter++;

        // Check for win condition
        if (game.players.find(x => x.score >= game.maxPoints)) {
            let _winner = game.players.find(x => x.score >= game.maxPoints);
            await sleep(1000);
            if (_winner) {
                game.active = false;
                gameThread.send({ content: `Game over! The winner is ${userMention(_winner.player)}` })
                    .then(message => {
                        message.react('🎉');
                    })
                    .catch(console.error);
            }
            await sleep(2000);
        }

        // Stall between rounds
        await sleep(2000);
    }
}