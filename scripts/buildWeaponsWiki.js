/**
 * buildWeaponsAltema.js
 *  ― https://altema.jp/splatoon3/bukilist の保存 HTML から
 *     全武器 (武器名・種別・サブ・スペシャル・画像) を抽出 → JSON 出力
 *
 * 使い方:
 *   1. ページを「名前を付けて保存」で reading.html に保存
 *   2. このファイルを scripts/ に置く
 *   3. node scripts/buildWeaponsAltema.js
 */

const fs      = require('fs');
const path    = require('path');
const cheerio = require('cheerio');

// 1) 保存 HTML 読み込み  -------------------------------------------------
const SRC = path.join(__dirname, 'reading.html');      // 読み込み元
const OUT = path.join(__dirname, '../features/splatoon/data/weapons.json'); // 出力先

const html = fs.readFileSync(SRC, 'utf-8');
const $    = cheerio.load(html);

// 2) パース  -------------------------------------------------------------
const results = [];

$('h3').each((_, h3) => {
  const type  = $(h3).text().trim();                          // 見出し → 武器種
  const table = $(h3).nextAll('table.tableLine').first();     // 直後の表が武器一覧

  table.find('tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length !== 3) return; // 見出し行などはスキップ

    const imgRel  = $(tds[0]).find('img').attr('src') || '';
    const image   = imgRel.startsWith('http') ? imgRel : `https://altema.jp${imgRel}`;
    const name    = $(tds[0]).text().trim().replace(/\s+/g, ' ');
    const sub     = $(tds[1]).text().trim().replace(/\s+/g, ' ');
    const special = $(tds[2]).text().trim().replace(/\s+/g, ' ');

    // 同名の武器が既に push 済みなら飛ばす（重複対策）
    if (results.some(w => w.name === name)) return;

    results.push({ name, type, sub, special, image });
  });
});

// 3) JSON 出力  ----------------------------------------------------------
fs.writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf-8');
console.log(`✅ 解析完了。${results.length} 件を書き出しました → ${OUT}`);
