const file = Bun.file("../leaderboard.json");

const fileCheck = await file.exists();

if (!fileCheck) {
    await file.write(JSON.stringify({}));
}

export let leaderboard = await file.json();

export async function addToLeaderboard(player: string){
    if (!leaderboard[player]) {
        leaderboard[player] = { total: 0 };
    }
    leaderboard[player].total++;
    await file.write(JSON.stringify(leaderboard));
}