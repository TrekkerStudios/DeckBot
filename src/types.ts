export type Gamestate = {
    gameStarted: string;
    gameUUID: string;
    players: { player: string, score: number }[];
    currentCzar: string;
    currentCard: string;
    currentDecks: [];
}