'use strict';
/* ============ عالم الإدراك المكاني (5) ============ */
MV.css(`
.poly{display:inline-block}
.mc.o4{max-width:380px;margin:12px auto}
.mc.o4 .mc-opt{display:grid;place-items:center;padding:12px;min-height:110px}
.pfig{display:grid;place-items:center;margin:10px auto;padding:10px}
.hole-board{display:grid;gap:2px;margin:10px auto;direction:ltr;width:max-content;padding:6px;border:1px solid var(--line2);border-radius:10px;background:var(--surface)}
.hole-board i{width:30px;height:30px;border-radius:5px;background:var(--surface2);display:block}
.hole-board i.f{background:color-mix(in srgb,var(--accent) 55%,var(--surface))}
.hole-board i.h{background:transparent;border:2px dashed var(--line2)}
.mirrorbox{display:flex;gap:0;justify-content:center;align-items:center;margin:10px auto;direction:ltr}
.mirrorbox .axis{width:3px;align-self:stretch;background:repeating-linear-gradient(to bottom,var(--accent) 0 6px,transparent 6px 12px);margin:0 8px}
.pgrid{display:grid;gap:2px;direction:ltr}.pgrid i{display:block;border-radius:3px;background:var(--surface2)}.pgrid i.f{background:var(--accent)}
.maze{display:grid;margin:10px auto;direction:ltr;width:min(100%,360px);aspect-ratio:1;border:3px solid var(--line2);background:var(--surface)}
.maze .mzc{position:relative;border:0 solid var(--text);box-sizing:border-box;display:grid;place-items:center;font-size:0}
.maze .mzc.fog{background:#0a0e13}
.maze .mzc.me::after{content:"";width:55%;height:55%;border-radius:50%;background:var(--accent)}
.maze .mzc.goal::after{content:"★";font-size:clamp(10px,3.2vw,20px);color:var(--warn)}
.maze .mzc.seen{background:color-mix(in srgb,var(--accent) 12%,var(--surface))}
.dpad{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,56px);gap:6px;justify-content:center;margin:8px auto;direction:ltr}
.dpad button{border-radius:12px;border:1px solid var(--line2);background:var(--surface);color:var(--text);font-size:1.4rem;cursor:pointer}
.dpad .u{grid-column:2;grid-row:1}.dpad .l{grid-column:1;grid-row:2}.dpad .d{grid-column:2;grid-row:2}.dpad .r{grid-column:3;grid-row:2}
`);

/* ---------- أدوات متعددات المربعات ---------- */
const PO = (() => {
  const norm = c => { const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1])); return c.map(p => [p[0] - mx, p[1] - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
  const key = c => norm(c).map(p => p.join(',')).join(';');
  const rot = c => norm(c.map(([x, y]) => [y, -x])), flip = c => norm(c.map(([x, y]) => [-x, y]));
  const rots = c => { const o = [norm(c)]; for (let i = 0; i < 3; i++) o.push(rot(o[i])); return o; };
  const congruent = (a, b) => rots(a).some(r => key(r) === key(b));
  const chiral = c => !congruent(c, flip(c));
  function rand(n, r) {
    const cells = [[0, 0]], has = (x, y) => cells.some(p => p[0] === x && p[1] === y);
    while (cells.length < n) { const [x, y] = r.pick(cells), [dx, dy] = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); if (!has(x + dx, y + dy)) cells.push([x + dx, y + dy]); }
    return norm(cells);
  }
  const connected = c => { const set = new Set(c.map(p => p.join(','))), seen = new Set([c[0].join(',')]), q = [c[0]]; while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (set.has(k) && !seen.has(k)) { seen.add(k); q.push([x + dx, y + dy]); } } } return seen.size === c.length; };
  function chiralRand(n, r) { for (let t = 0; t < 500; t++) { const c = rand(n, r); if (chiral(c)) return c; } return rand(n, r); }
  function mutate(c, r) { // نقل مربع واحد مع بقاء الاتصال
    for (let t = 0; t < 100; t++) {
      const i = r.int(0, c.length - 1), rest = c.filter((_, j) => j !== i), [x, y] = r.pick(rest), [dx, dy] = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      if (rest.some(p => p[0] === x + dx && p[1] === y + dy)) continue; const m = norm(rest.concat([[x + dx, y + dy]]));
      if (connected(m) && !congruent(m, c) && key(m) !== key(c)) return m;
    }
    return null;
  }
  function svg(c, u = 22, col = 'var(--accent)') {
    const w = Math.max(...c.map(p => p[0])) + 1, hh = Math.max(...c.map(p => p[1])) + 1;
    return svgRoot(w * u, hh * u, { width: w * u, height: hh * u, class: 'poly' }, c.map(([x, y]) => s('rect', { x: x * u + 1, y: y * u + 1, width: u - 2, height: u - 2, rx: 4, fill: col })));
  }
  return { norm, key, rot, flip, rots, congruent, chiral, rand, chiralRand, mutate, svg, connected };
})();

/* ============ تدوير الأشكال ============ */
MV.define({
  id: 'rotation', name: 'تدوير الأشكال', en: 'Mental Rotation', realms: ['spatial'], skills: ['spatial'], type: 'quiz', minutes: 5,
  blurb: 'شكل مصنوع من مربعات: أي الخيارات هو نفسه بعد تدويره؟ احذر من الصورة المنعكسة في المرآة فهي شكل مختلف.',
  rules: ['تخيّل تدوير الشكل الأصلي في ذهنك (دون قلبه).', 'اختر الخيار المطابق للشكل بعد التدوير.', 'الصورة المعكوسة (كما في المرآة) لا تُعدّ مطابقة.'],
  levelNote: l => ['5 مربعات', '6 مربعات', '7 مربعات', '8 مربعات', '9 مربعات'][l - 1],
  selfTest() { const r = RNG(3), o = []; for (let d = 0; d <= 10; d++) { const q = rotMake(d, r); o.push(q.opts.filter(x => PO.congruent(x.c, q.base)).length === 1 && q.opts.length === 4); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 12,
      make: (d, i, r) => rotMake(d, r),
      render(box, it, api) {
        box.append(kit.title('أي شكل هو الشكل الأصلي بعد تدويره؟', 'لا تقلبه — دوّره فقط'), h('div', { class: 'pfig' }, PO.svg(it.base, 24, '#4c9be0')));
        kit.mc(box, { cols: 2, cls: 'o4', options: it.opts.map(o => ({ node: PO.svg(o.c, 20, '#4c9be0'), correct: PO.congruent(o.c, it.base) })), onAnswer: ok => api.done(ok) });
      },
      explain: () => 'الشكل الصحيح هو الوحيد الذي يمكن الوصول إليه بالتدوير فقط؛ الآخرون إما معكوسون أو مختلفون بمربع واحد.',
    });
  },
});
function rotMake(d, r) {
  const n = 5 + Math.min(4, Math.floor(d / 2.5)), base = PO.chiralRand(n, r);
  const rr = k => { let c = base; for (let i = 0; i < k; i++) c = PO.rot(c); return c; };
  const ans = rr(r.int(1, 3)), opts = [{ c: ans }];
  const nm = d >= 4 ? 2 : 1;
  for (let i = 0; i < nm; i++) { let m = PO.flip(base); for (let k = r.int(0, 3); k > 0; k--) m = PO.rot(m); if (!opts.some(o => PO.key(o.c) === PO.key(m))) opts.push({ c: m }); }
  let g = 0; while (opts.length < 4 && g++ < 60) { const m = PO.mutate(base, r); if (!m) continue; let mm = m; for (let k = r.int(0, 3); k > 0; k--) mm = PO.rot(mm); if (!PO.congruent(mm, base) && !opts.some(o => PO.congruent(o.c, mm))) opts.push({ c: mm }); }
  if (opts.length < 4) return rotMake(d, r);
  return { base, opts: r.shuffle(opts) };
}

/* ============ القطعة المناسبة ============ */
MV.define({
  id: 'fitpiece', name: 'القطعة المناسبة', en: 'Fit the Piece', realms: ['spatial'], skills: ['spatial', 'solving'], type: 'quiz', minutes: 5,
  blurb: 'لوحة فيها فراغ بشكل غريب: أي قطعة تملؤه تماماً؟ يمكن تدوير القطعة لكن لا يمكن قلبها.',
  rules: ['انظر إلى شكل الفراغ المنقّط.', 'اختر القطعة التي تملؤه بالضبط (بعد تدويرها إن لزم).', 'القطعة المعكوسة لا تناسب الفراغ.'],
  levelNote: l => ['فراغ من 4 مربعات', '5 مربعات', '5 مربعات ولوحة أكبر', '6 مربعات', '7 مربعات'][l - 1],
  selfTest() { const r = RNG(7), o = []; for (let d = 0; d <= 10; d++) { const q = fitMake(d, r); o.push(q.opts.filter(x => PO.congruent(x.c, q.hole)).length === 1); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 14,
      make: (d, i, r) => fitMake(d, r),
      render(box, it, api) {
        box.append(kit.title('أي قطعة تملأ الفراغ تماماً؟'));
        const hs = new Set(it.hole.map(p => (p[0] + it.ox) + ',' + (p[1] + it.oy)));
        const b = h('div', { class: 'hole-board', style: `grid-template-columns:repeat(${it.g},30px)` }); for (let y = 0; y < it.g; y++) for (let x = 0; x < it.g; x++) b.append(h('i', { class: hs.has(x + ',' + y) ? 'h' : 'f' }));
        box.append(b);
        kit.mc(box, { cols: 2, cls: 'o4', options: it.opts.map(o => ({ node: PO.svg(o.c, 20, '#4c9be0'), correct: PO.congruent(o.c, it.hole) })), onAnswer: ok => api.done(ok) });
      },
      explain: () => 'القطعة الصحيحة تتطابق مع الفراغ بعد تدويرها فقط.',
    });
  },
});
function fitMake(d, r) {
  const n = d < 3 ? 4 : d < 6 ? 5 : d < 8 ? 6 : 7, g = d < 4 ? 4 : d < 7 ? 5 : 6;
  for (let t = 0; t < 80; t++) {
    const hole = PO.chiralRand(n, r), w = Math.max(...hole.map(p => p[0])) + 1, hh = Math.max(...hole.map(p => p[1])) + 1; if (w > g || hh > g) continue;
    const ox = r.int(0, g - w), oy = r.int(0, g - hh); let ans = hole; for (let k = r.int(0, 3); k > 0; k--) ans = PO.rot(ans);
    const opts = [{ c: ans }]; let m = PO.flip(hole); for (let k = r.int(0, 3); k > 0; k--) m = PO.rot(m); opts.push({ c: m });
    let gg = 0; while (opts.length < 4 && gg++ < 60) { const mm = PO.mutate(hole, r); if (mm && !opts.some(o => PO.congruent(o.c, mm)) && !PO.congruent(mm, hole)) opts.push({ c: r.chance(.5) ? PO.rot(mm) : mm }); }
    if (opts.length === 4) return { hole, g, ox, oy, opts: r.shuffle(opts) };
  }
  return fitMake(0, r);
}

/* ============ المرآة (التناظر) ============ */
MV.define({
  id: 'mirror', name: 'المرآة', en: 'Mirror Image', realms: ['spatial', 'abstract'], skills: ['spatial', 'patterns'], type: 'quiz', minutes: 4,
  blurb: 'نمط من المربعات الملوّنة بجوار مرآة عمودية. أي الخيارات هو انعكاسه الصحيح؟',
  rules: ['المرآة هي الخط المنقّط على يمين النمط.', 'اختر الصورة التي تظهر في المرآة بالضبط.', 'انتبه: قلب النمط رأسياً أو تدويره ليس انعكاساً في المرآة.'],
  levelNote: l => ['شبكة 3×3', '4×4', '4×4 بفروق دقيقة', '5×5', '5×5 بفروق دقيقة'][l - 1],
  selfTest() { const r = RNG(2), o = []; for (let d = 0; d <= 10; d++) { const q = mirMake(d, r); o.push(q.opts.filter(x => x.ok).length === 1 && new Set(q.opts.map(x => x.k)).size === 4); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    const grid = (c, g, u) => h('div', { class: 'pgrid', style: `grid-template-columns:repeat(${g},${u}px);grid-auto-rows:${u}px` }, c.map(v => h('i', { class: v ? 'f' : '' })));
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 10,
      make: (d, i, r) => mirMake(d, r),
      render(box, it, api) {
        const u = it.g === 5 ? 24 : 30;
        box.append(kit.title('أي صورة تظهر في المرآة؟'), h('div', { class: 'mirrorbox' }, grid(it.c, it.g, u), h('div', { class: 'axis' })));
        kit.mc(box, { cols: 2, cls: 'o4', options: it.opts.map(o => ({ node: grid(o.c, it.g, 18), correct: o.ok })), onAnswer: ok => api.done(ok) });
      },
      explain: () => 'الانعكاس في مرآة عمودية يقلب اليمين باليسار مع بقاء الأعلى في الأعلى.',
    });
  },
});
function mirMake(d, r) {
  const g = d < 2 ? 3 : d < 6 ? 4 : 5, fill = Math.round(g * g * 0.4);
  const flipH = c => c.map((_, i) => c[Math.floor(i / g) * g + (g - 1 - i % g)]), flipV = c => c.map((_, i) => c[(g - 1 - Math.floor(i / g)) * g + i % g]), rot180 = c => c.slice().reverse();
  for (let t = 0; t < 200; t++) {
    const c = Array(g * g).fill(0); r.sample(range(g * g), fill).forEach(i => c[i] = 1);
    const ans = flipH(c), distr = [c, flipV(c), rot180(c)]; if (d >= 2) { const a2 = ans.slice(), i = r.int(0, g * g - 1); a2[i] = 1 - a2[i]; distr.push(a2); }
    const pool = (d >= 4 ? [distr[3], distr[0], distr[1]] : distr.slice(0, 3)).filter(Boolean).map(x => ({ c: x, ok: false })), keys = new Set([ans.join('')]), opts = [{ c: ans, ok: true }];
    pool.forEach(o => { if (!keys.has(o.c.join(''))) { keys.add(o.c.join('')); opts.push(o); } });
    if (opts.length === 4) return { g, c, opts: r.shuffle(opts).map(o => Object.assign(o, { k: o.c.join('') })) };
  }
  return mirMake(2, r);
}

/* ============ عدّ المكعبات ============ */
MV.define({
  id: 'cubes', name: 'عدّ المكعبات', en: 'Cube Counting', realms: ['spatial'], skills: ['spatial', 'math'], type: 'quiz', minutes: 5,
  blurb: 'مجسّم من مكعبات مرصوصة في أعمدة. كم مكعباً فيه بالمجموع؟ بعضها مخفي خلف غيره — فكّر بالأبعاد الثلاثة.',
  rules: ['كل عمود مصمت من الأرض إلى قمته، فلا فراغات تحته.', 'عُدّ جميع المكعبات بما فيها المخفية خلف الأعمدة الأمامية.', 'اختر العدد الصحيح.'],
  levelNote: l => ['3×3 وارتفاع ≤ 2', '3×3 وارتفاع ≤ 3', '4×4 وارتفاع ≤ 3', '4×4 وارتفاع ≤ 4', '4×4 وارتفاع ≤ 5'][l - 1],
  selfTest() { const r = RNG(4), o = []; for (let d = 0; d <= 10; d++) { const q = cubeMake(d, r); o.push(q.total === q.h.flat().reduce((a, b) => a + b, 0) && q.opts.includes(q.total)); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 7, quickRounds: 4, par: 15,
      make: (d, i, r) => cubeMake(d, r),
      render(box, it, api) {
        box.append(kit.title('كم مكعباً في المجسّم؟', 'عُدّ المخفي أيضاً'), h('div', { class: 'pfig' }, isoCubes(it.h)));
        kit.mc(box, { cols: 4, options: it.opts.map(v => ({ label: String(v), correct: v === it.total })), onAnswer: ok => api.done(ok) });
      },
      explain: it => `المجموع = ${it.h.map(r => r.join(' + ')).join(' + ')} = ${it.total}`,
    });
  },
});
function cubeMake(d, r) {
  const g = d < 4 ? 3 : 4, mh = d < 2 ? 2 : d < 5 ? 3 : d < 8 ? 4 : 5, hts = range(g, () => range(g, () => r.chance(0.2) ? 0 : r.int(1, mh)));
  const total = hts.flat().reduce((a, b) => a + b, 0), set = new Set([total + 1, total - 1, total + 2, total - 2, total + 3].filter(v => v > 0));
  return { h: hts, total, opts: r.shuffle([total, ...r.sample([...set], 3)]) };
}
function isoCubes(hts) {
  const g = hts.length, W = 22, H = 12, V = 22, maxh = Math.max(...hts.flat()), width = (g * 2) * W + 20, height = g * H * 2 + maxh * V + 30;
  const ox = g * W + 10, oy = maxh * V + 10, out = [];
  const poly = (pts, fill) => s('polygon', { points: pts.map(p => p.join(',')).join(' '), fill, stroke: 'rgba(0,0,0,.45)', 'stroke-width': 1, 'stroke-linejoin': 'round' });
  for (let x = 0; x < g; x++) for (let y = 0; y < g; y++) for (let z = 0; z < hts[x][y]; z++) {
    const cx = ox + (x - y) * W, cy = oy + (x + y) * H - z * V;
    out.push(poly([[cx, cy - H], [cx + W, cy], [cx, cy + H], [cx - W, cy]].map(p => [p[0], p[1] - V]), '#8fd0f5'));
    out.push(poly([[cx - W, cy - V], [cx, cy + H - V], [cx, cy + H], [cx - W, cy]], '#4c9be0'));
    out.push(poly([[cx + W, cy - V], [cx, cy + H - V], [cx, cy + H], [cx + W, cy]], '#2f6fb0'));
  }
  return svgRoot(width, height, { width, height, class: 'iso' }, out);
}

/* ============ المتاهة ============ */
MV.define({
  id: 'maze', name: 'المتاهة', en: 'Maze', realms: ['spatial', 'strategy'], skills: ['spatial', 'planning'], type: 'puzzle', minutes: 5,
  blurb: 'اعثر على طريق الخروج في متاهة مولَّدة بحيث لها مسار واحد فقط. في المستويات العليا يغطي الضباب ما لم تستكشفه.',
  rules: ['تحرّك بأزرار الأسهم (أو أسهم لوحة المفاتيح) من الدائرة إلى النجمة.', 'لكل متاهة مسار وحيد؛ كل خطوة زائدة تخفض نتيجتك قليلاً.', 'في المستويات 4 و5 لا ترى إلا ما حولك — ارسم الخريطة في ذهنك.'],
  levelNote: l => `${[5, 7, 9, 11, 13][l - 1]}×${[5, 7, 9, 11, 13][l - 1]}${l >= 4 ? ' مع ضباب' : ''}`,
  selfTest() { const r = RNG(9), m = mazeGen(7, r); const p = mazePath(m, 7, 0, 7 * 7 - 1); return { ok: !!p && p.length >= 12, out: [p && p.length] }; },
  run(ctx) {
    const n = [5, 7, 9, 11, 13][ctx.level - 1], fog = ctx.level >= 4, m = mazeGen(n, ctx.rng), goal = n * n - 1;
    let pos = 0, steps = 0, solved = false; const seen = new Set([0]); const opt = mazePath(m, n, 0, goal).length;
    const grid = h('div', { class: 'maze', style: `grid-template-columns:repeat(${n},1fr);grid-template-rows:repeat(${n},1fr)` });
    const cells = range(n * n, i => { const c = h('div', { class: 'mzc', style: `border-width:${m[i].n ? '2px' : '0'} ${m[i].e ? '2px' : '0'} ${m[i].s ? '2px' : '0'} ${m[i].w ? '2px' : '0'}` }); grid.append(c); return c; });
    const stat = h('div', { class: 'chstat pstat' });
    const mv = (dx, dy) => { if (solved) return; const x = pos % n, y = (pos / n) | 0; const dir = dx === 1 ? 'e' : dx === -1 ? 'w' : dy === 1 ? 's' : 'n'; if (m[pos][dir]) { Sound.play('bad'); return; } pos = (y + dy) * n + (x + dx); steps++; seen.add(pos); Sound.play('click'); draw(); if (pos === goal) win(); };
    const pad = h('div', { class: 'dpad' }, [['u', '↑', 0, -1], ['l', '←', -1, 0], ['d', '↓', 0, 1], ['r', '→', 1, 0]].map(([c, t, dx, dy]) => h('button', { class: c, 'data-dir': c, 'aria-label': t, onClick: () => mv(dx, dy) }, t)));
    const hintB = ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', id: 'mz-hint', onClick: () => { ctx.hint(); const p = mazePath(m, n, pos, goal); if (p && p.length > 1) { const nx = p[1]; cells[nx].style.background = 'color-mix(in srgb,var(--accent) 45%,var(--surface))'; } } }, 'تلميح') : null;
    mount(ctx.root, h('div', { class: 'stack' }, stat, grid, pad, h('div', { class: 'chtools' }, hintB)));
    ctx.listen(document, 'keydown', e => { const k = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key]; if (k) { e.preventDefault(); mv(...k); } });
    function draw() {
      const px = pos % n, py = (pos / n) | 0;
      cells.forEach((c, i) => { const x = i % n, y = (i / n) | 0, near = Math.abs(x - px) + Math.abs(y - py) <= 2; c.className = 'mzc' + (i === pos ? ' me' : '') + (i === goal && (!fog || near || seen.has(i)) ? ' goal' : '') + (fog && !near && !seen.has(i) ? ' fog' : seen.has(i) ? ' seen' : ''); });
      stat.textContent = ''; stat.append(h('span', null, 'الخطوات ', h('bdi', null, String(steps))), h('span', null, 'الأقصر ', h('bdi', null, String(opt - 1))));
    }
    function win() { solved = true; const acc = clamp((opt - 1) / Math.max(steps, opt - 1), 0.2, 1); ctx.correct(); ctx.timeout(() => ctx.finish({ acc, items: 1, parTime: n * n * 1.4, complexity: 2 + ctx.level * 1.6 }), 900); }
    ctx.debug.step = () => { if (solved) return; const p = mazePath(m, n, pos, goal); const nx = p[1], dx = (nx % n) - (pos % n), dy = ((nx / n) | 0) - ((pos / n) | 0); mv(dx, dy); };
    draw();
  },
});
function mazeGen(n, r) { // جدران: n,e,s,w = true إن وُجد جدار
  const m = range(n * n, () => ({ n: true, e: true, s: true, w: true })), vis = new Set([0]), st = [0], D = [['n', 0, -1, 's'], ['e', 1, 0, 'w'], ['s', 0, 1, 'n'], ['w', -1, 0, 'e']];
  while (st.length) {
    const c = st[st.length - 1], x = c % n, y = (c / n) | 0, nb = D.filter(([, dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && nx < n && ny >= 0 && ny < n && !vis.has(ny * n + nx); });
    if (!nb.length) { st.pop(); continue; } const [d, dx, dy, o] = r.pick(nb), nc = (y + dy) * n + x + dx; m[c][d] = false; m[nc][o] = false; vis.add(nc); st.push(nc);
  }
  return m;
}
function mazePath(m, n, from, to) { // تسلسل الخلايا من البداية إلى النهاية
  const prev = new Map([[from, null]]), q = [from];
  while (q.length) { const c = q.shift(); if (c === to) break; const nb = []; if (!m[c].n) nb.push(c - n); if (!m[c].s) nb.push(c + n); if (!m[c].e) nb.push(c + 1); if (!m[c].w) nb.push(c - 1); for (const x of nb) if (!prev.has(x)) { prev.set(x, c); q.push(x); } }
  if (!prev.has(to)) return null; const p = []; let c = to; while (c != null) { p.push(c); c = prev.get(c); } return p.reverse();
}
