/****************************************************************
 * プラべ管理ストア（メモリ保持）
 *  - 途中参加 / 退出 に対応
 ****************************************************************/
let data = null;

function reset() { data = null; }

function init(players, winTarget) {
  data = {
    winTarget,
    players,                    // ["Alice", ...]
    scores: Object.fromEntries(players.map(p => [p, 0])),
    round: 0,
    teams: null                 // { A: [...], B: [...] }
  };
}

function addPlayer(name) {
  if (!data || data.players.includes(name)) return false;
  data.players.push(name);
  data.scores[name] = 0;
  return true;
}

function removePlayer(name) {
  if (!data || !data.players.includes(name)) return false;
  data.players = data.players.filter(p => p !== name);
  delete data.scores[name];
  return true;
}

function randomTeams() {
  if (!data) return null;
  const shuffled = [...data.players].sort(() => Math.random() - 0.5);
  const half = Math.ceil(shuffled.length / 2);
  data.teams = { A: shuffled.slice(0, half), B: shuffled.slice(half) };
  data.round += 1;
  return data.teams;
}

function addWin(teamKey) {
  if (!data || !data.teams) return;
  for (const p of data.teams[teamKey]) {
    if (data.scores[p] !== undefined) data.scores[p] += 1;
  }
}

function getWinners() {
  if (!data) return [];
  return data.players.filter(p => data.scores[p] >= data.winTarget);
}

function getData() { return data; }

module.exports = {
  init, reset, randomTeams, addWin, getWinners,
  addPlayer, removePlayer, getData
};
