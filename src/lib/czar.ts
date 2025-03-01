import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from "discord.js";

const entryStateRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('endRound')
            .setLabel('Read Responses')
    );

const votingStateRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('vote')
            .setPlaceholder('Pick a winning card...')
    );