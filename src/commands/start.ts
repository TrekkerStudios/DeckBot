import { SlashCommandBuilder, CommandInteraction, ThreadAutoArchiveDuration } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start a game of Cards")
    .addNumberOption(option =>
        option
            .setName('points')
            .setDescription('Amount of points to win')
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    const pointsMax = interaction.options.getNumber('points');

    // Check if channel exists and isn't a thread
    if (!interaction.channel || interaction.channel.isThread()) {
        return interaction.reply('Please use this command in a text channel!');
    }

    try {
        // Create thread in the current channel
        const thread = await interaction.channel.threads.create({
            name: `Cards Game - ${pointsMax} points`,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
            reason: `Cards game started by ${interaction.user.tag}`,
        });

        // Reply with thread mention
        await interaction.reply({
            content: `🎮 Game started with ${pointsMax} points! Join ${thread} and type /play to participate!`,
            allowedMentions: { parse: [] }, // Prevents pinging everyone
        });
    } catch (error) {
        console.error(error);
        await interaction.reply('❌ Failed to create game thread!');
    }
}