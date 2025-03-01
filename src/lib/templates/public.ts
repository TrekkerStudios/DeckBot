import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, bold, userMention } from "discord.js";
import type { Gamestate } from "../../game";

const join = new ButtonBuilder()
    .setCustomId('joinRound')
    .setLabel('Join Round')
    .setStyle(ButtonStyle.Primary);

export const joinRoundRow = new ActionRowBuilder()
    .addComponents(join);

export function buildStartRoundEmbed(game: Gamestate) {
    const embed = new EmbedBuilder()
        .setTitle('Round Started')
        .setDescription('A new round has started! Click the button below to join.')
        .addFields({ name: 'The current czar is:', value: `${userMention(game.currentCzar)}` })
        .addFields({ name: 'Black card:', value: `${game.currentCard}` })
        .setDescription(`Pick ${game.currentPick} card(s)!`);
    return embed;
}