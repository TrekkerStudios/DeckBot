import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, userMention, inlineCode } from "discord.js";
import type { Gamestate } from "../../game";

const join = new ButtonBuilder()
    .setCustomId('joinRound')
    .setLabel('Join Round')
    .setStyle(ButtonStyle.Primary);

const vote = new ButtonBuilder()
    .setCustomId('pickWinner')
    .setLabel('Pick Winner')
    .setStyle(ButtonStyle.Primary);

export const joinRoundRow = new ActionRowBuilder()
    .addComponents(join);

export const pickWinnerRow = new ActionRowBuilder()
    .addComponents(vote);

export function buildStartRoundEmbed(game: Gamestate) {
    const embed = new EmbedBuilder()
        .setTitle('Round Started')
        .setDescription('A new round has started! Click the button below to join.')
        .addFields({ name: 'The current czar is:', value: `${userMention(game.currentCzar)}` })
        .addFields({ name: 'Black card:', value: `${game.currentCard}` });
    if (game.currentPick > 1) {
        embed.setDescription(`Pick ${game.currentPick} cards!`);
    } else if (game.currentPick === 1) {
        embed.setDescription(`Pick ${game.currentPick} card!`);
    }
    return embed;
}