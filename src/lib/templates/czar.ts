import { EmbedBuilder, CommandInteraction } from "discord.js";
import type { Gamestate } from "../../game";

export function buildCzarSelectDialog(game: Gamestate) {
    const embed = new EmbedBuilder()
        .setTitle(`Pick a winner:`);

    game.cardsInPlay.forEach((player, index) => {
        if (index != 0 && index % 3 === 0) {
            embed.addFields({ name: '\u200B', value: '\u200B' });
        };
        embed.addFields({ name: `Option ${index + 1}`, value: player.cards.join('\n'), inline: true });
    });

    return embed;
};