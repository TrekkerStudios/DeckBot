import { SlashCommandBuilder, CommandInteraction, MessageFlags } from "discord.js";
import { type Gamestate } from "../game";

export const data = new SlashCommandBuilder()
    .setName("select")
    .setDescription("Select your card(s) for the round. (comma-separated if multiple, i.e. /select 1,2,3)")
    .addStringOption(option =>
        option.setName('input')
            .setDescription('Selected card(s) for the round.')
            .setMinLength(1)
            .setRequired(true));

export async function execute(interaction: CommandInteraction, game: Gamestate) {
    // Run checks
    if (!interaction.channel?.isThread() || game.gameStarted === '' || !game.players.find(x => x.player === interaction.user.id)) {
        await interaction.reply({ content: 'You are not in a game or game channel!', flags: MessageFlags.Ephemeral });
        return;
    }

    const userInput = interaction.options.getString('input');
    let selectedCards: number[] = userInput.split(',').map(Number);
    selectedCards = selectedCards.map(num => num === 0 ? 1 : num - 1);
    selectedCards = selectedCards.slice(0, game.currentPick);

    if (game.currentlyPicking === true) {

        if (game.cardsInPlay.find(x => x.player === interaction.user.id)) {
            await interaction.reply({ content: 'You have already selected your card(s) for this round!', flags: MessageFlags.Ephemeral });
            return;
        }

        const player = game.players.find(x => x.player === interaction.user.id);
        let _cards: string[];
        if (player) {
            // Find cards
            _cards = player.hand.filter((card, index) => selectedCards.includes(index)).map(card => card.text);
            // Remove cards
            player.hand = player.hand.filter((card, index) => !selectedCards.includes(index));
            // Put cards in play
            game.cardsInPlay.push({ player: interaction.user.id, cards: _cards });
            console.log(`${interaction.user.id}: Selected cards: ${_cards}`);
            await interaction.reply({ content: `Selected card(s): ${_cards}`, flags: MessageFlags.Ephemeral });
        }
    } else if (game.currentlyJudging === true) {
        let winner = game.cardsInPlay[selectedCards[0]];
        game.roundWinner = winner.player;
        game.roundWinningCard = winner.cards.join('\n');
        console.log(`Round winner: ${game.roundWinner} with card(s): ${game.roundWinningCard}`);
        game.winnerPicked = true;
        await interaction.reply({ content: `Round decided.`, flags: MessageFlags.Ephemeral });
    } else {
        return;
    }
}