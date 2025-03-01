import { SlashCommandBuilder, CommandInteraction, MessageFlags } from "discord.js";
import { addPlayer, type Gamestate } from "../game";

export const data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Join a game of CAH");

export async function execute(interaction: CommandInteraction, game: Gamestate) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (interaction.channel?.isThread()) {
        await addPlayer(game, interaction.user.id);
        await interaction.editReply('You have joined, please wait here for the game to start.');
    } else {
        await interaction.editReply('Please send this in a game thread!');
    }
}