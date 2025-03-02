import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ManyDeck } from "../lib/ManyDecks";
import { loadDecksMD } from "../lib/decks";

export const data = new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add ManyDecks deck from code")
    .addStringOption(option =>
        option.setName('code')
            .setDescription('Deck code to add.')
            .setMinLength(5)
            .setMaxLength(5)
            .setRequired(true));

export async function execute(interaction: CommandInteraction) {
    const deckCode = interaction.options.getString('code');
    const newDeck = await ManyDeck.fromJSON(deckCode, true);
    loadDecksMD(newDeck);
    await interaction.reply({ content: `Deck added: ${newDeck.deck?.name}` });
}