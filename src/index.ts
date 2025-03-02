import { Client } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { buttons } from "./buttons";
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

client.once("ready", () => {
  console.log("Discord bot is ready! 🤖");
});

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