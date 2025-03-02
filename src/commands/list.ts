import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { loadedDecks } from "../lib/decks";

export const data = new SlashCommandBuilder()
    .setName("list")
    .setDescription("List available decks");

export async function execute(interaction: CommandInteraction) {
    let decks = loadedDecks.slice(205).map((deck, index) => `${index+2} - ${deck.name}`).join('\n');
    return interaction.reply(`Available decks:\n1 - Base Sets\n${decks}`);
}