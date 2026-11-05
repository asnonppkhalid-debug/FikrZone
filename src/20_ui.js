'use strict';
/* ============ مكوّنات بصرية: رموز المناطق، الشخصية، الرسوم، الخريطة ============ */

/* ---------- رموز المناطق ---------- */
function glyph(realmId, size = 40, color = 'currentColor', sw = 2.4) {
  const st = { fill: 'none', stroke: color, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const g = {
    logic: () => [s('path', { ...st, d: 'M24 4 L44 24 L24 44 L4 24 Z' }), s('path', { ...st, d: 'M14 14 L34 34 M34 14 L14 34' }), s('circle', { cx: 24, cy: 24, r: 3, fill: color })],
    strategy: () => [s('path', { ...st, d: 'M11 41h26M13 41V23h22v18M11 23h26v-9h-5v4h-4v-4h-6v4h-4v-4h-5z' }), s('path', { ...st, d: 'M21 41v-8a3 3 0 0 1 6 0v8' })],
    memory: () => [s('circle', { ...st, cx: 24, cy: 24, r: 5, fill: color }), s('circle', { ...st, cx: 24, cy: 24, r: 12, 'stroke-dasharray': '3 4' }), s('circle', { ...st, cx: 24, cy: 24, r: 19, 'stroke-dasharray': '2 6' })],
    focus: () => [s('circle', { ...st, cx: 24, cy: 24, r: 14 }), s('circle', { cx: 24, cy: 24, r: 4.5, fill: color }), s('path', { ...st, d: 'M24 3v9M24 36v9M3 24h9M36 24h9' })],
    speed: () => [s('path', { ...st, d: 'M27 4 L12 27 H22 L19 44 L36 20 H26 Z', fill: color, 'fill-opacity': 0.25 })],
    spatial: () => [s('path', { ...st, d: 'M24 5 L41 14.5 V33.5 L24 43 L7 33.5 V14.5 Z' }), s('path', { ...st, d: 'M24 24 V43 M24 24 L7 14.5 M24 24 L41 14.5' })],
    language: () => [s('path', { ...st, d: 'M8 10h32a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H22l-8 7v-7H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z' }), s('text', { x: 24, y: 29, 'text-anchor': 'middle', 'font-size': 18, fill: color, stroke: 'none', 'font-family': 'MV Kufi, sans-serif' }, 'ع')],
    abstract: () => [s('path', { ...st, d: 'M24 24 C24 11 5 11 5 24 S24 37 24 24 S43 11 43 24 S24 37 24 24' })],
  };
  return svgRoot(48, 48, { width: size, height: size, class: 'glyph', 'aria-hidden': 'true' }, ...(g[realmId] ? g[realmId]() : []));
}

/* ---------- رادار القدرات ---------- */
function radarChart(items, size = 340) {
  const c = size / 2, R = size * 0.34, n = items.length;
  const ang = i => (-90 + i * 360 / n) * Math.PI / 180;
  const pt = (i, r) => [c + r * Math.cos(ang(i)), c + r * Math.sin(ang(i))];
  const kids = [];
  for (const f of [0.25, 0.5, 0.75, 1]) kids.push(s('polygon', { points: range(n, i => pt(i, R * f).join(',')).join(' '), class: 'rd-grid' }));
  items.forEach((it, i) => { const [x, y] = pt(i, R); kids.push(s('line', { x1: c, y1: c, x2: x, y2: y, class: 'rd-axis' })); });
  const vals = items.map(it => it.score == null ? 0.02 : Math.max(0.03, it.score));
  kids.push(s('polygon', { points: vals.map((v, i) => pt(i, R * v).join(',')).join(' '), class: 'rd-area' }));
  items.forEach((it, i) => {
    const [x, y] = pt(i, R * vals[i]);
    kids.push(s('circle', { cx: x, cy: y, r: 5, fill: it.color, class: 'rd-dot', opacity: it.score == null ? 0.35 : 0.35 + 0.65 * (it.rel == null ? 1 : it.rel) }));
    const [lx, ly] = pt(i, R + 26);
    kids.push(s('text', { x: lx, y: ly + 4, 'text-anchor': 'middle', class: 'rd-label', fill: it.color }, it.label));
  });
  return svgRoot(size, size, { class: 'radar', role: 'img', 'aria-label': 'خريطة القدرات' }, ...kids);
}

/* ---------- مخطط خطي بسيط ---------- */
function lineChart(points, opts = {}) {
  const w = opts.w || 520, hgt = opts.h || 160, pad = 26;
  const ys = points.map(p => p.y), lo = opts.min != null ? opts.min : 0, hi = opts.max != null ? opts.max : Math.max(1, ...ys);
  const X = i => pad + (points.length <= 1 ? (w - 2 * pad) / 2 : i * (w - 2 * pad) / (points.length - 1));
  const Y = v => hgt - pad - (v - lo) / (hi - lo || 1) * (hgt - 2 * pad);
  const kids = [];
  for (let k = 0; k <= 4; k++) { const y = pad + k * (hgt - 2 * pad) / 4; kids.push(s('line', { x1: pad, x2: w - pad, y1: y, y2: y, class: 'ch-grid' })); }
  if (points.length) {
    const d = points.map((p, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join('');
    if (points.length > 1) kids.push(s('path', { d: d + `L${X(points.length - 1)} ${hgt - pad}L${X(0)} ${hgt - pad}Z`, class: 'ch-fill', style: `fill:${opts.color || 'var(--text)'}` }));
    kids.push(s('path', { d, class: 'ch-line', style: `stroke:${opts.color || 'var(--text)'}` }));
    points.forEach((p, i) => kids.push(s('circle', { cx: X(i), cy: Y(p.y), r: 3.5, style: `fill:${opts.color || 'var(--text)'}` }, s('title', null, (p.label || '') + ' ' + (opts.fmt ? opts.fmt(p.y) : p.y)))));
    const step = Math.max(1, Math.ceil(points.length / 7));
    points.forEach((p, i) => { if (p.label && i % step === 0) kids.push(s('text', { x: X(i), y: hgt - 6, 'text-anchor': 'middle', class: 'ch-lab' }, p.label)); });
  } else kids.push(s('text', { x: w / 2, y: hgt / 2, 'text-anchor': 'middle', class: 'ch-lab' }, 'لا توجد بيانات بعد'));
  return svgRoot(w, hgt, { class: 'linechart', preserveAspectRatio: 'xMidYMid meet' }, ...kids);
}

/* ---------- خريطة العالم ---------- */
function blobPath(cx, cy, r, seed, n = 14, jit = 0.28) {
  const rg = RNG(seed), pts = [];
  const phase = rg.f() * 6;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, rr = r * (1 - jit / 2 + jit * (0.5 + 0.5 * Math.sin(a * 2 + phase)) * 0.6 + rg.f() * jit * 0.55);
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a) * 0.86]);
  }
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (i === 0) d += `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}
const MAP_LAND = {
  land: [
    { id: 'logic', x: 190, y: 170, r: 100 }, { id: 'strategy', x: 455, y: 105, r: 92 }, { id: 'memory', x: 740, y: 170, r: 96 },
    { id: 'language', x: 150, y: 430, r: 98 }, { id: 'abstract', x: 465, y: 320, r: 118 }, { id: 'focus', x: 850, y: 380, r: 92 },
    { id: 'spatial', x: 320, y: 545, r: 90 }, { id: 'speed', x: 665, y: 535, r: 92 }], vb: [1000, 640],
  port: [
    { id: 'logic', x: 165, y: 130, r: 106 }, { id: 'strategy', x: 435, y: 120, r: 100 }, { id: 'memory', x: 165, y: 330, r: 104 }, { id: 'focus', x: 435, y: 340, r: 100 },
    { id: 'speed', x: 165, y: 540, r: 102 }, { id: 'spatial', x: 435, y: 550, r: 100 }, { id: 'language', x: 165, y: 750, r: 104 }, { id: 'abstract', x: 435, y: 760, r: 108 }], vb: [600, 880],
};
const MAP_LINKS = [['logic', 'strategy'], ['strategy', 'memory'], ['logic', 'abstract'], ['strategy', 'abstract'], ['memory', 'abstract'], ['memory', 'focus'], ['abstract', 'focus'], ['abstract', 'language'], ['logic', 'language'], ['abstract', 'spatial'], ['abstract', 'speed'], ['language', 'spatial'], ['spatial', 'speed'], ['speed', 'focus']];

function worldMap(o = {}) {
  const port = o.portrait != null ? o.portrait : window.innerWidth < 760;
  const layout = port ? MAP_LAND.port : MAP_LAND.land;
  const wv = port ? 600 : 1000, hv = port ? 880 : 640;
  const kids = [];
  // مياه وشبكة إحداثيات
  kids.push(s('rect', { width: wv, height: hv, class: 'm-sea' }));
  for (let i = 1; i < 6; i++) kids.push(s('ellipse', { cx: wv / 2, cy: hv / 2, rx: wv * (0.12 + i * 0.16), ry: hv * (0.1 + i * 0.15), class: 'm-grat' }));
  const pos = Object.fromEntries(layout.map(l => [l.id, l]));
  for (const [a, b] of MAP_LINKS) {
    const A = pos[a], B = pos[b]; if (!A || !B) continue;
    const mx = (A.x + B.x) / 2 + (B.y - A.y) * 0.08, my = (A.y + B.y) / 2 - (B.x - A.x) * 0.08;
    kids.push(s('path', { d: `M${A.x} ${A.y}Q${mx} ${my} ${B.x} ${B.y}`, class: 'm-route' }));
  }
  const regions = [];
  layout.forEach((l, idx) => {
    const realm = REALM[l.id], sk = Skill.realm(l.id), games = MV.games.filter(g => g.realms.includes(l.id)).length;
    const d = blobPath(l.x, l.y, l.r, hashStr(l.id), 14);
    const g = s('g', { class: 'isl', tabindex: 0, role: 'link', 'aria-label': `${realm.name}، ${games} لعبة`, style: `--c:${realm.color}`, onClick: () => o.onPick ? o.onPick(l.id) : Router.go('/world/' + l.id), onKeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); Router.go('/world/' + l.id); } } });
    g.append(s('path', { d: blobPath(l.x + 5, l.y + 9, l.r * 1.03, hashStr(l.id), 14), class: 'isl-shadow' }));
    g.append(s('path', { d, class: 'isl-land' }));
    for (const f of [0.78, 0.58, 0.38]) {
      g.append(s('path', { d: blobPath(l.x, l.y, l.r * f, hashStr(l.id) + Math.round(f * 10), 14, 0.22), class: 'isl-contour' }));
    }
    g.append(s('g', { transform: `translate(${l.x - 22} ${l.y - 40})`, style: `color:${realm.color}` }, glyph(l.id, 44, realm.color)));
    const cr = 33, circ = 2 * Math.PI * cr;
    g.append(s('circle', { cx: l.x, cy: l.y - 18, r: cr, class: 'isl-ring-bg' }));
    if (sk.score != null) g.append(s('circle', { cx: l.x, cy: l.y - 18, r: cr, class: 'isl-ring', 'stroke-dasharray': `${circ * sk.score} ${circ}`, transform: `rotate(-90 ${l.x} ${l.y - 18})`, style: `opacity:${0.5 + 0.5 * sk.rel}` }));
    g.append(s('text', { x: l.x, y: l.y + 38, 'text-anchor': 'middle', class: 'isl-name' }, realm.name));
    if (!o.compact) g.append(s('text', { x: l.x, y: l.y + 58, 'text-anchor': 'middle', class: 'isl-sub' }, sk.score == null ? `${games} ألعاب · لم تبدأ` : `${games} ألعاب · تقدير ${Math.round(sk.score * 100)}%`));
    regions.push(g);
  });
  kids.push(...regions);
  // بوصلة
  const cx = port ? 70 : 940, cy = port ? 840 : 590;
  kids.push(s('g', { class: 'm-compass', transform: `translate(${cx} ${cy})` }, s('circle', { r: 26, fill: 'none' }), s('path', { d: 'M0 -24L5 0L0 24L-5 0Z' }), s('path', { d: 'M-24 0L0 -5L24 0L0 5Z', opacity: .4 }), s('text', { y: -30, 'text-anchor': 'middle' }, 'ش')));
  return svgRoot(wv, hv, { class: 'worldmap' + (o.compact ? ' compact' : ''), role: 'group', 'aria-label': 'خريطة عالم فِكْر زُون' }, ...kids);
}

/* ---------- حلقة تقدّم ---------- */
function ring(frac, size = 56, color = 'var(--accent)', label = '') {
  const r = size / 2 - 5, c = 2 * Math.PI * r;
  return svgRoot(size, size, { width: size, height: size, class: 'ringp' },
    s('circle', { cx: size / 2, cy: size / 2, r, class: 'rg-bg' }),
    s('circle', { cx: size / 2, cy: size / 2, r, class: 'rg-fg', style: `stroke:${color}`, 'stroke-dasharray': `${c * clamp(frac, 0, 1)} ${c}`, transform: `rotate(-90 ${size / 2} ${size / 2})` }),
    s('text', { x: size / 2, y: size / 2 + 4, 'text-anchor': 'middle', class: 'rg-t' }, label));
}
