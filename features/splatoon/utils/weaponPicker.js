const fs = require('fs');
const path = require('path');

const WEAPONS = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/weapons.json'), 'utf-8')
);

/* ---------- 内部ヘルパ ---------- */
function shuffle(arr) {
  return arr.map(v => [v, Math.random()])
            .sort((a, b) => a[1] - b[1])
            .map(v => v[0]);
}
/* -------------------------------- */

/**
 * options:
 *   type   : "シューター", "ローラー" … などカテゴリ絞り込み
 *   tier   : "S" / "A" / "B" … (tier を後から付けた時用)
 *   count  : 取り出す数 (既定 8)
 */
function pickRandom({ type = null, tier = null, count = 8 } = {}) {
  let pool = WEAPONS;

  if (type) pool = pool.filter(w => w.type === type);
  if (tier) pool = pool.filter(w => (w.tier || '').toUpperCase() === tier.toUpperCase());

  return shuffle(pool).slice(0, count);
}

module.exports = { pickRandom };
