# DeckBot

Custom locally-run CAH bot for Discord that I made in a weekend.

Thanks to [crhallberg](https://github.com/crhallberg/json-against-humanity) for the CAHDeck JSON library and [Reread Games](https://github.com/Lattyware/massivedecks/tree/main) for the ManyDecks format.

## Requires:
* Bun
* Discord Developer Access
* Friends

## Commands:

* `/cah [max-points]` - Start new game with given point limit in new thread of channel
* `/play` - Join game in thread
* `/select [number(s)]` - Select card(s) to play, or winner as Czar
* `/add [code]` - [See below](#how-to-add-decks)

## How to run:

1. Clone repo
2. Install [bun](https://bun.sh) and run `bun install`
3. Make .env and fill the following values from [Discord.dev Dashboard](discord.dev):
```
DISCORD_TOKEN=<TOKEN>
DISCORD_CLIENT_ID=<CLIENT_ID>
DISCORD_GUILD_ID=<GUILD>
```

4. Run `bun run src/index.ts`
5. Add to server
6. Play the game

## How to add decks:

### Easy method (ManyDecks):
1. Get a deck code from [Many Decks](https://decks.rereadgames.com/).
2. Type `/add <CODE>` into Discord.

### Harder method (ManyDecks & JSON Against Humanity):
1. Download deck file
    * JSON Against Humanity:
        - [Go to the website](https://crhallberg.com/cah/), select your decks and download in 'full' format.
    * ManyDecks:
        - If you made the deck, login to [ManyDecks](https://decks.rereadgames.com/) go into the edit page for the deck and click "Download"
        - If you didn't make the deck, you can go to `https://decks.rereadgames.com/api/decks/CODE` (replace CODE with deck code) and download the .json5 file that appears in the browser
2. Drop in either `decks/json` or `decks/manydecks` based on source.
3. Reload bot