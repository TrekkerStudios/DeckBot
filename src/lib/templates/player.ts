import { EmbedBuilder, CommandInteraction, inlineCode } from "discord.js";
import type { Gamestate } from "../../game";

export function buildPlayerSelectDialog(interaction: CommandInteraction, game: Gamestate) {
    const embed = new EmbedBuilder()
    if (game.currentPick > 1) {
        embed.setTitle(`Pick ${game.currentPick} cards:`);
    } else if (game.currentPick === 1) {
        embed.setTitle(`Pick ${game.currentPick} card:`);
    }
    if (game.players.find(x => x.player === interaction.user.id)) {
        const player = game.players.find(x => x.player === interaction.user.id);
        if (player) {
            player.hand.forEach((card: { text: string, pack: number }, index: number) => {
                if (index != 0 && index % 3 === 0) {
                    embed.addFields({ name: '\u200B', value: '\u200B' });
                };
                embed.addFields({ name: `Card ${index + 1}`, value: inlineCode(card.text), inline: true });
            });
        }
    }
    embed.setFooter({ text: 'To select a card, type `/select` followed by the card number(s) you wish to play. Separate multiple cards with a comma (i.e. `/select 1,2,3`).' });
    return embed;
};