import { SlashCommandBuilder, CommandInteraction } from "discord.js";
const wait = require('node:timers/promises').setTimeout;

export const data = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Join a game of CAH");

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    await wait(4_000);
    await interaction.editReply('Pong!');
}