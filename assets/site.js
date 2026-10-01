// 新NISA・iDeCoサイトのツール一覧と共通の計算（このサイト専用。ほかのサイトとは別管理）
const TOOLS = [
  { path: "/nisa/", name: "積立シミュレーション", desc: "毎月の積立額・利回り・年数から、将来の金額と運用益を計算" },
  { path: "/nisa/mokuhyo/", name: "目標金額から逆算", desc: "何年後に○○万円にするには、毎月いくら積み立てればいい？" },
  { path: "/nisa/ideco/", name: "iDeCo 節税額 計算（2026年12月改正対応）", desc: "掛金の上限と、所得税・住民税がいくら安くなるか" },
  { path: "/nisa/waku/", name: "NISA 投資枠 管理", desc: "年360万円・生涯1,800万円のうち、使った枠と残りを確認" },
  { path: "/nisa/zeikin/", name: "NISAでいくら得？（税金の差）", desc: "課税口座と比べて、NISAで払わずに済む税金を計算" },
  { path: "/nisa/tesuuryou/", name: "信託報酬（手数料）の差 計算", desc: "手数料0.1%の違いが、長い目で見るといくらになるか" },
  { path: "/nisa/torikuzushi/", name: "取り崩しシミュレーション", desc: "毎月いくら引き出すと何歳までもつか、逆に毎月いくら使えるか" },
  { path: "/nisa/rougo/", name: "老後資金 計算", desc: "年金と生活費から、老後に足りないお金と今からの積立額" },
];

const MAN = 10000;
const TAX = 0.20315; // 株式等の譲渡益・配当にかかる税率（所得税15%・復興特別所得税0.315%・住民税5%）
const yen = n => Math.round(n).toLocaleString("ja-JP") + "円";
const man = n => (Math.round(n / 1000) / 10).toLocaleString("ja-JP") + "万円";
const num = id => Math.max(0, Number(document.getElementById(id).value) || 0);

// 毎月積立の将来の金額（月複利：年利÷12で毎月運用）。initialは最初に入れる一括の金額
function accumulate(monthly, annualRate, months, initial = 0) {
  const r = annualRate / 12;
  const rows = [];
  let bal = initial, principal = initial;
  for (let m = 1; m <= months; m++) {
    bal = bal * (1 + r) + monthly;
    principal += monthly;
    if (m % 12 === 0 || m === months) rows.push({ year: Math.ceil(m / 12), bal, principal });
  }
  return { bal, principal, gain: bal - principal, rows };
}

// 元本と評価額の推移のグラフ（SVG）
function growthChart(rows) {
  if (!rows.length) return "";
  const W = 640, H = 220, L = 52, R = 10, T = 10, B = 26;
  const maxY = Math.max(...rows.map(r => r.bal)) || 1;
  const n = rows.length;
  const x = i => L + (n === 1 ? 0 : i / (n - 1)) * (W - L - R);
  const y = v => T + (1 - v / maxY) * (H - T - B);
  const area = key => `M${x(0)},${y(0)} ` + rows.map((r, i) => `L${x(i).toFixed(1)},${y(r[key]).toFixed(1)}`).join(" ") + ` L${x(n - 1)},${y(0)} Z`;
  let grid = "";
  const step = Math.pow(10, Math.floor(Math.log10(maxY / 4)));
  const unit = Math.ceil(maxY / 4 / step) * step;
  for (let v = 0; v <= maxY; v += unit) grid += `<line class="axis" x1="${L}" y1="${y(v)}" x2="${W - R}" y2="${y(v)}"/><text class="lbl" x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v / MAN).toLocaleString("ja-JP")}万</text>`;
  const every = Math.max(1, Math.ceil(n / 8));
  rows.forEach((r, i) => { if (i % every === 0 || i === n - 1) grid += `<text class="lbl" x="${x(i)}" y="${H - 8}" text-anchor="middle">${r.year}年</text>`; });
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="元本と評価額の推移">${grid}<path class="a2" d="${area("bal")}"/><path class="a1" d="${area("principal")}"/></svg>
    <div class="legend"><span class="l1">元本（積み立てた金額）</span><span class="l2">運用益</span></div></div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("related");
  if (!el) return;
  const here = location.pathname.replace(/index\.html$/, "");
  el.innerHTML = `<h2>ほかのツール</h2><ul class="tools">${TOOLS.filter(t => t.path !== here)
    .map(t => `<li><a href="${t.path}"><b>${t.name}</b><span>${t.desc}</span></a></li>`).join("")}</ul>`;
});
