import { CommandInteraction, MessageFlags } from "discord.js";
import { type Gamestate } from "../game";
import { buildCzarSelectDialog } from "../lib/templates/czar";

export async function execute(interaction: CommandInteraction, game: Gamestate) {
    // Check if the user is in the game
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const player = game.players.find(x => x.player === interaction.user.id);

    if (!game.players.find(x => x.player === interaction.user.id)) {
        await interaction.editReply('You are not in this game.');
        return;
    }

    if (player?.isCzar) {
        // If czar, show results and allow them to pick cards
        await interaction.editReply({ embeds: [buildCzarSelectDialog(game)] });
    } else {
        await interaction.editReply('You are not the czar.');
    }
}