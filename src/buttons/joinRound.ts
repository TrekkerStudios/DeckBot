import { CommandInteraction, MessageFlags } from "discord.js";
import { type Gamestate } from "../game";
import { buildPlayerSelectDialog } from "../lib/templates/player";

export async function execute(interaction: CommandInteraction, game: Gamestate) {
    // Check if the user is in the game
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const player = game.players.find(x => x.player === interaction.user.id);

    // if (!game.players.find(x => x.player === interaction.user.id)) {
    //     await interaction.editReply('You are not in this game.');
    //     return;
    // }

    // Check if the user is the Card Czar
    if (player?.isCzar) {
        await interaction.editReply('You are the Card Czar for this round, please wait for the other players to pick their cards.');
    }

    if (!(player?.isCzar)) {
        // If player, show hand and allow them to pick cards
        await interaction.editReply({ embeds: [buildPlayerSelectDialog(interaction, game)] });
    }
}