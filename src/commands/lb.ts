import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, userMention, inlineCode } from "discord.js";
import { leaderboard } from "../lib/leaderboard";

export const data = new SlashCommandBuilder()
    .setName("lb")
    .setDescription("Check leaderboard");

function buildLeaderboardEmbed(leaderboard: { [player: string]: { total: number } }) {
    const embed = new EmbedBuilder()
        .setTitle('CAH Leaderboard');

    const sortedLeaderboard = Object.entries(leaderboard)
        .sort(([, a], [, b]) => b.total - a.total)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    let i = 1;
    for (const player in sortedLeaderboard) {
        embed.addFields({ name: `${i}: ${userMention(player)}`, value: `${inlineCode(leaderboard[player].total.toString())}`, inline: true });
        i++;
    }
    
    return embed;
};

export async function execute(interaction: CommandInteraction) {
    await interaction.reply({ content: `${buildLeaderboardEmbed(leaderboard)}` });
}