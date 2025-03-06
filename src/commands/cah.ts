import { SlashCommandBuilder, CommandInteraction, ThreadAutoArchiveDuration, MessageFlags } from "discord.js";
import { addPlayer, createGame, setThreadName, gameLoop } from "../game";
import { getCurrentGame, setCurrentGame } from "../index";
import { loadedDecks } from "../lib/decks";

export const data = new SlashCommandBuilder()
    .setName("cah")
    .setDescription("Start a game of CAH")
    .addNumberOption(option =>
        option
            .setName('max-points')
            .setDescription('Amount of points to win')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('decks')
            .setDescription('Select decks to play with')
            .setRequired(false)
    );

export async function execute(interaction: CommandInteraction) {
    let _game = await getCurrentGame();

    if (_game != undefined && _game.active == true) {
        return interaction.reply({ content: 'A game is already in progress!', flags: MessageFlags.Ephemeral });
    }

    const pointsMax = interaction.options.getNumber('max-points');
    _game = setCurrentGame(createGame(pointsMax));
    addPlayer(_game, interaction.user.id);

    const decks = interaction.options.getString('decks');
    if (decks) {
        const selectedDecks = decks.split(',');
        _game.currentDecks = selectedDecks.map(index => loadedDecks[parseInt(index)]);
    }

    if (!interaction.channel || interaction.channel.isThread()) {
        return interaction.reply({ content: 'Please use this command in a text channel!', flags: MessageFlags.Ephemeral });
    }

    try {
        const thread = await interaction.channel.threads.create({
            name: `DeckBot - First to ${pointsMax} (#${_game.gameUUID})`,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
            reason: `${_game.maxPoints} points - Game started by ${interaction.user.tag}`,
        });
        setThreadName(_game, thread.name);
        if (thread.joinable) await thread.join();

        gameLoop(_game, interaction.channel.threads.cache.find(x => x.name === _game.threadName));
        
        await interaction.reply({
            content: `🎮 Game started with ${_game.maxPoints} points! Join ${thread} and type /play to participate!`,
            allowedMentions: { parse: [] }, // Prevents pinging everyone
        });
    } catch (error) {
        console.error(error);
        await interaction.reply('❌ Failed to create game thread!');
    }
}