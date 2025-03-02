import { EmbedBuilder, inlineCode } from "discord.js";
import type { Gamestate } from "../../game";

export function buildCzarSelectDialog(game: Gamestate) {
    const embed = new EmbedBuilder()
        .setTitle(`Pick a winner:`);

    game.cardsInPlay.forEach((player, index) => {
        if (index != 0 && index % 3 === 0) {
            embed.addFields({ name: '\u200B', value: '\u200B' });
        };
        embed.addFields({ name: `Option ${index + 1}`, value: inlineCode(player.cards.join('\n')), inline: true });
    });
    embed.setFooter({ text: 'To select card(s), type `/select` followed by the winning option number.' });
    return embed;
};