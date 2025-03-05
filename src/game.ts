import { sleep } from "bun";
import { loadedDecks, shuffleDecks } from "./lib/decks";
import { joinRoundRow, buildStartRoundEmbed, pickWinnerRow } from "./lib/templates/public";
import { blockQuote, inlineCode, userMention } from "discord.js";
import { addToLeaderboard } from "./lib/leaderboard";
import { setCurrentGame } from ".";

function stylizedCurrentCard(card: string) {
    return `**${card.replace(/_/g, inlineCode('______'))}**`;
}

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
    cardsInPlay: { player: string, cards: string[] }[];
    currentlyPicking: boolean;
    currentlyJudging: boolean;
    roundWinner: string;
    roundWinningCard: string;
    winnerPicked: boolean;
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
        cardsInPlay: [],
        currentlyPicking: false,
        currentlyJudging: false,
        roundWinner: '',
        roundWinningCard: '',
        winnerPicked: false,
    };
    return game;
}

function resetRoundProps(game: Gamestate) {
    game.currentCzar = '';
    game.currentCard = '';
    game.currentPick = 0;
    game.cardsInPlay = [];
    game.currentlyPicking = false;
    game.currentlyJudging = false;
    game.roundWinner = '';
    game.roundWinningCard = '';
    game.winnerPicked = false;
    game.players.forEach(player => {
        player.isCzar = false;
    });
}

export function addPlayer(game: Gamestate, player: string) {
    if (game.players.find(x => x.player === player)) return;
    let hand: any[] = [];
    for (let i = 0; i < 7; i++) {
        let randomDeck = Math.floor(Math.random() * game.currentDecks.length);
        let _card;
        while (!_card) {
            let whiteCard = Math.floor(Math.random() * game.currentDecks[randomDeck].white.length);
            _card = game.currentDecks[randomDeck].white[whiteCard];
        }
        let cardIndex = game.currentDecks[randomDeck].white.indexOf(_card);
        if (cardIndex > -1) {
            game.currentDecks[randomDeck].white.splice(cardIndex, 1);
        }
        hand.push(_card.text);
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
            let _card;
            while (!_card) {
                let whiteCard = Math.floor(Math.random() * game.currentDecks[randomDeck].white.length);
                _card = game.currentDecks[randomDeck].white[whiteCard];
            }
            let cardIndex = game.currentDecks[randomDeck].white.indexOf(_card);
            if (cardIndex > -1) {
                game.currentDecks[randomDeck].white.splice(cardIndex, 1);
            }
            _player.hand.push(_card.text);
        }
    }
}

export function setThreadName(game: Gamestate, threadName: string) {
    game.threadName = threadName;
}

export async function gameLoop(game: Gamestate, gameThread: any) {
    // Allow users to join
    console.log('Starting game in 60s...');
    gameThread.send('Type /play to join the game!');
    gameThread.send(`Game will start <t:${Math.floor((Date.now() + 60000) / 1000)}:R>...`).then(message => {
        setTimeout(() => message.delete(), 60_000);
    });
    await sleep(60000);

    // Global message waiting flag
    let messageActiveFlag = true;

    // Start
    console.log(`Starting game...\n${game.players.length} players:`);
    game.players.forEach(x => console.log(x.player));
    gameThread.send('Game starting now!').then(async message => {
        while (messageActiveFlag) {
            await sleep(1000);
        }
        message.delete();
    });
    game.active = true;

    // Shuffle and deal cards
    shuffleDecks();
    game.currentDecks.push(...loadedDecks);

    // Wait minimum 3s
    await sleep(3000).then(() => messageActiveFlag = false);

    // Game loop
    while (game.active) {
        messageActiveFlag = true;
        console.log('New round starting...')
        gameThread.send('Round starting...').then(async message => {
            while (messageActiveFlag) {
                await sleep(1000);
            }
            message.delete();
        });

        // Pick black card, set czar
        let _newCard;
        let _randomDeck = 0;
        while (!_newCard) {
            console.log('Picking black card...');
            _randomDeck = Math.floor(Math.random() * (game.currentDecks.length - 1));
            let blackCard = Math.floor(Math.random() * game.currentDecks[_randomDeck].black.length);
            _newCard = game.currentDecks[_randomDeck].black[blackCard];
            console.log('Random deck:', _randomDeck, 'Card:', _newCard.text);
            _newCard = game.currentDecks[_randomDeck].black[_newCard];
            console.log('New card:', _newCard.text);
        }

        // Stylize black card and pop it from array
        game.currentCard = stylizedCurrentCard(_newCard.text);
        game.currentPick = _newCard.pick;
        let blackCardIndex = game.currentDecks[_randomDeck].black.indexOf(_newCard);
        if (blackCardIndex > -1) {
            game.currentDecks[_randomDeck].black.splice(blackCardIndex, 1);
        }

        // Select czar
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

        // Wait for setup
        await sleep(3000).then(() => messageActiveFlag = false);

        // Begin round
        game.currentlyPicking = true;
        game.currentlyJudging = false;
        await gameThread.send({
            embeds: [buildStartRoundEmbed(game)],
        }).then(async message => {
            while (messageActiveFlag && game.currentlyPicking) {
                await sleep(1000);
            }
            message.delete();
        });
        await gameThread.send({
            components: [joinRoundRow],
        }).then(async message => {
            while (messageActiveFlag && game.currentlyPicking) {
                await sleep(1000);
            }
            message.delete();
        });
        console.log('Picking phase...');
        gameThread.send(`Round will end <t:${Math.floor((Date.now() + 300000) / 1000)}:R>...`).then(async message => {
            while (messageActiveFlag && game.currentlyPicking) {
                await sleep(1000);
            }
            message.delete();
        });
        for (let i = 0; i < 300; i++) {
            // Check if all players have played their cards
            let allPlayersPlayed = true;
            for (let player of game.players) {
                if (!game.cardsInPlay.find(x => x.player === player.player) && !player.isCzar) {
                    allPlayersPlayed = false;
                }
            }
            if (allPlayersPlayed) {
                game.currentlyPicking = false;
            }
            if (!game.currentlyPicking) break;
            await sleep(1000);
        }
        messageActiveFlag = false;
        console.log('Round ended');

        // Switch to judging phase
        game.currentlyPicking = false;
        game.currentlyJudging = true;

        console.log('Judging phase...');
        gameThread.send(`Time's up!`);
        await gameThread.send({ content: `Please wait while ${userMention(game.currentCzar)} picks a winner...` }).then(async message => {
            while (messageActiveFlag && game.currentlyJudging) {
                await sleep(1000);
            }
            message.delete();
        });
        await gameThread.send({
            components: [pickWinnerRow],
        }).then(async message => {
            while (messageActiveFlag && game.currentlyJudging) {
                await sleep(1000);
            }
            message.delete();
        });
        gameThread.send(`Judging will end <t:${Math.floor((Date.now() + 300000) / 1000)}:R>...`).then(async message => {
            while (messageActiveFlag && game.currentlyJudging) {
                await sleep(1000);
            }
            message.delete();
        });
        for (let i = 0; i < 300; i++) {
            if (game.winnerPicked) break;
            await sleep(1000);
        }
        messageActiveFlag = false;
        game.currentlyPicking = false;
        game.currentlyJudging = false;

        messageActiveFlag = true;
        gameThread.send(`Time's up!`).then(async message => {
            while (messageActiveFlag) {
                await sleep(1000);
            }
            message.delete();
        });

        // Draw cards to players
        for (let i = 0; i < game.players.length; i++) {
            await drawCards(game, game.players[i].player);
        }

        // Wait minimum 3s
        await sleep(3000).then(() => messageActiveFlag = false);

        messageActiveFlag = true;
        // Check if winner was picked
        if (!game.winnerPicked) {
            gameThread.send(`No winner was picked this round, everyone throw tomatoes at ${userMention(game.currentCzar)}!`)
                .then(async message => {
                    message.react('🍅');
                    while (messageActiveFlag) {
                        await sleep(1000);
                    }
                    message.delete();
                })
                .catch(console.error);
        } else {
            let winner = game.players.find(x => x.player === game.roundWinner);
            if (winner) {
                winner.score++;
                addToLeaderboard(game.roundWinner);
            }

            // Check for win condition
            if (game.players.find(x => x.score >= game.maxPoints)) {
                let _winner = game.players.find(x => x.score >= game.maxPoints);
                if (_winner) {
                    gameThread.send({ content: `Game over! The winner is ${userMention(_winner.player)}` })
                        .then(async message => {
                            message.react('🎉');
                            while (messageActiveFlag) {
                                await sleep(1000);
                            }
                            message.delete();
                            game.active = false;
                        })
                        .catch(console.error);
                }
                game.active = false;
            } else {
                // Or announce winner of round
                gameThread.send(`The winner is ${userMention(game.roundWinner)} with card(s):\n${blockQuote(game.roundWinningCard)}`).then(async message => {
                    message.react('🏆');
                    while (messageActiveFlag) {
                        await sleep(1000);
                    }
                    message.delete();
                });
            }
        }

        // Reset round props
        resetRoundProps(game);

        // If game is still active, prep for next round
        if (game.active) {
            // Check for low card count
            if (game.currentDecks.every(x => x.black.length <= 10) || game.currentDecks.every(x => x.white.length <= 10)) {
                console.log('Low cards, reshuffling...');
                game.currentDecks = [];
                shuffleDecks();
                game.currentDecks.push(...loadedDecks);
            }

            // Wait minimum 5s
            await sleep(5000).then(() => messageActiveFlag = false);

            // Stall between rounds
            messageActiveFlag = true;
            gameThread.send(`Next round will start <t:${Math.floor((Date.now() + 15000) / 1000)}:R>...`).then(async message => {
                while (messageActiveFlag) {
                    await sleep(1000);
                }
                message.delete();
            });
            await sleep(15000).then(() => messageActiveFlag = false);
        }
    }
}