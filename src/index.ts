import { Client } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { buttons } from "./buttons";
import { deployCommands } from "./deploy-commands";
import type { Gamestate } from "./game";

export const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

let currentGame: Gamestate;
export function setCurrentGame(game: Gamestate) {
  currentGame = game;
  return currentGame;
}
export function getCurrentGame() {
  return currentGame;
}

deployCommands({ guildId: config.DISCORD_GUILD_ID });

client.once("ready", () => {
  console.log("Discord bot is ready! 🤖");
});

// client.on("guildCreate", async (guild) => {
//   await deployCommands({ guildId: guild.id });
// });

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(interaction, currentGame);
    }
  } else if (interaction.isButton()) {
    const { customId } = interaction;
    if (buttons[customId as keyof typeof buttons]) {
      buttons[customId as keyof typeof buttons].execute(interaction, currentGame);
    }
  } else {
    return;
  }
});

client.login(config.DISCORD_TOKEN);