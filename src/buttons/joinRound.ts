import { CommandInteraction, MessageFlags } from "discord.js";
import { type Gamestate } from "../game";
import { buildPlayerSelectDialog } from "../lib/templates/player";

export async function execute(interaction: CommandInteraction, game: Gamestate) {
    // Check if the user is in the game
    // if (!game.players.find(x => x.player === interaction.user.id)) {
    //     await interaction.editReply('You are not in this game.');
    //     return;
    // } else {
    //     // Check if the user is the Card Czar
    //     const player = game.players.find(x => x.player === interaction.user.id);
    //     if (player?.isCzar) {
    //         await interaction.editReply('You are the Card Czar for this round, please wait for the other players to pick their cards.');
    //         return;
    //     }
    // }

    // If player, show hand and allow them to pick cards
    const response = await interaction.reply({ embeds: [buildPlayerSelectDialog(interaction, game)], withResponse: true, flags: MessageFlags.Ephemeral});

    try {
        if (!response.resource?.message) {
            throw new Error('No message found in response.');
        } else {
            let message = response.resource.message;
            await message.react('1️⃣');
            await message.react('2️⃣');
            await message.react('3️⃣');
            await message.react('4️⃣');
            await message.react('5️⃣');
            await message.react('6️⃣');
            await message.react('7️⃣');
        }
    } catch (error) {
        console.error('One of the emojis failed to react:', error);
    }

    let selectedCards: number[] = [];

    const collectorFilter = (reaction, user) => {
        if (user.id === interaction.user.id) {
            let normalizedReact = 0;
            switch (reaction.emoji.name) {
                case '1️⃣':
                    normalizedReact = 1;
                    break;
                case '2️⃣':
                    normalizedReact = 2;
                    break;
                case '3️⃣':
                    normalizedReact = 3;
                    break;
                case '4️⃣':
                    normalizedReact = 4;
                    break;
                case '5️⃣':
                    normalizedReact = 5;
                    break;
                case '6️⃣':
                    normalizedReact = 6;
                    break;
                case '7️⃣':
                    normalizedReact = 7;
                    break;
                default:
                    return false;
            }
            selectedCards.push(normalizedReact);
            return true;
        } else {
            return false;
        };
    };

    response.resource?.message?.awaitReactions({ filter: collectorFilter, max: game.maxPoints, time: 120_000, errors: ['time'] })
        .then(collected => {
            console.log(collected);
            const player = game.players.find(x => x.player === interaction.user.id);
            let _cards: string[];
            if (player) {
                _cards = player?.hand.filter((card, index) => selectedCards.includes(index)).map(card => card.text);
                game.cardsInPlay.push({ player: interaction.user.id, cards: _cards });
                console.log(`${interaction.user.id}: Selected cards: ${_cards}`);
            }
        })
        .catch(collected => {
            console.log(`${interaction.user.id}: Error selecting cards.`);
        });

}