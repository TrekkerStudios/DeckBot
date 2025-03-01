import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

const entryStateRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('selectedCard')
            .setPlaceholder('Pick a card, any card...')
    );