import { EmbedBuilder, CommandInteraction } from "discord.js";
import type { Gamestate } from "../../game";

export function buildPlayerSelectDialog(interaction: CommandInteraction, game: Gamestate) {
    const embed = new EmbedBuilder()
        .setTitle(`Pick ${game.currentPick} card(s):`);
    if (game.players.find(x => x.player === interaction.user.id)) {
        const player = game.players.find(x => x.player === interaction.user.id);
        if (player) {
            player.hand.forEach((card: { text: string, pack: number }, index: number) => {
                if (index != 0 && index % 3 === 0) {
                    embed.addFields({ name: '\u200B', value: '\u200B' });
                };
                embed.addFields({ name: `Card ${index + 1}`, value: card.text, inline: true });
            });
        }
    }
    return embed;
};