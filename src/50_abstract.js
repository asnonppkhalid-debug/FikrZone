'use strict';
/* ============ عالم التفكير المجرد (6) ============ */
MV.css(`
.mx{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:260px;margin:10px auto;direction:ltr}
.mx .c{aspect-ratio:1;border:1px solid var(--line2);border-radius:10px;background:var(--surface);display:grid;place-items:center}
.mx .c.q{border-style:dashed;color:var(--accent-t);font-size:1.8rem}
.exs{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:8px auto;max-width:420px}
.ex{display:grid;place-items:center;gap:2px;padding:8px;border-radius:10px;border:1px solid var(--line2);background:var(--surface);min-width:62px}
.ex.y{border-color:var(--ok)}.ex.n{border-color:var(--bad)}.ex small{font-size:.8rem}
.ex.y small{color:var(--ok)}.ex.n small{color:var(--bad)}
.eqrow{display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 0;font-family:var(--f-disp);font-size:1.5rem;direction:ltr}
.cdnums{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:12px 0}
.cdnum{min-width:64px;padding:14px 10px;border-radius:12px;border:2px solid var(--line2);background:var(--surface);font-family:var(--f-disp);font-size:1.5rem;color:var(--text);cursor:pointer}
.cdnum.sel{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 20%,var(--surface))}
.cdnum:disabled{opacity:.3}
.cdtarget{text-align:center;font-size:1rem;color:var(--muted)}.cdtarget b{display:block;font-family:var(--f-disp);font-size:3rem;color:var(--accent-t)}
.cdops{display:flex;gap:8px;justify-content:center;margin:6px 0}.cdops button{width:56px;height:52px;font-size:1.4rem;border-radius:12px;border:1px solid var(--line2);background:var(--surface);color:var(--text);cursor:pointer}
.cdlog{text-align:center;color:var(--muted);min-height:3em;font-size:.95rem;direction:ltr}
.lights{display:grid;gap:6px;margin:12px auto;direction:ltr;width:min(100%,300px)}
.lights button{aspect-ratio:1;border-radius:12px;border:1px solid var(--line2);background:var(--surface2);cursor:pointer;padding:0;transition:background .15s}
.lights button.on{background:var(--accent);box-shadow:0 0 14px color-mix(in srgb,var(--accent) 60%,transparent)}
.lights button.hn{outline:3px solid var(--warn)}
`);

/* ============ المصفوفات (على نمط رافن) ============ */
const MXS = ['triangle', 'square', 'circle', 'diamond', 'star', 'pentagon'];
MV.define({
  id: 'matrices', name: 'المصفوفات المجرّدة', en: 'Matrix Reasoning', realms: ['abstract', 'logic'], skills: ['patterns', 'deduction'], type: 'quiz', minutes: 6,
  blurb: 'شبكة 3×3 من الأشكال تحكمها قواعد خفية على الأسطر والأعمدة. أي شكل يملأ الخانة الأخيرة؟',
  rules: ['افحص كل صفة على حدة: الشكل، اللون، الحجم.', 'لكل صفة قاعدة: ثابتة في السطر أو العمود، أو موزّعة بحيث لا تتكرر.', 'اختر الخيار الوحيد الذي يتّسق مع كل القواعد.'],
  levelNote: l => ['صفة واحدة متغيّرة', 'صفتان (أحياناً)', 'صفتان', 'ثلاث صفات', 'ثلاث صفات وخيارات أكثر'][l - 1],
  selfTest() { const r = RNG(5), o = []; for (let d = 0; d <= 10; d++) { const q = mxMake(d, r); const keys = q.opts.map(x => x.s + x.c + x.z); o.push(new Set(keys).size === keys.length && q.opts.filter(x => x.s === q.ans.s && x.c === q.ans.c && x.z === q.ans.z).length === 1); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 6, quickRounds: 3, par: 22,
      make: (d, i, r) => mxMake(d, r),
      render(box, it, api) {
        box.append(kit.title('أي شكل يكمل المصفوفة؟'));
        const draw = x => kit.shapeSvg(x.s, x.c, x.z, 0);
        box.append(h('div', { class: 'mx' }, it.cells.map((x, k) => k === 8 ? h('div', { class: 'c q' }, '؟') : h('div', { class: 'c' }, draw(x)))));
        kit.mc(box, { cols: it.opts.length > 4 ? 3 : 2, options: it.opts.map(o => ({ node: draw(o), correct: o === it.ans })), onAnswer: ok => api.done(ok) });
      },
      explain: () => 'الخيار الصحيح هو الذي تنطبق عليه قاعدة كل صفة (الشكل واللون والحجم) في الصف والعمود الأخيرين.',
    });
  },
});
function mxMake(d, r) {
  const nVar = d < 3 ? 1 : d < 7 ? 2 : 3, attrs = r.sample(['s', 'c', 'z'], 3), sh = r.sample(MXS, 3), co = r.sample(kit.PAL, 3), sz = [24, 34, 44];
  const vals = { s: sh, c: co, z: sz }, rules = {};
  attrs.forEach((a, i) => { rules[a] = i < nVar ? r.pick(['latin', 'latin2', 'row', 'col']) : 'const'; });
  const f = (a, rr, cc) => { const V = vals[a], ru = rules[a]; return ru === 'latin' ? V[(rr + cc) % 3] : ru === 'latin2' ? V[(2 * rr + cc) % 3] : ru === 'row' ? V[rr] : ru === 'col' ? V[cc] : V[0]; };
  const cells = range(9, k => ({ s: f('s', (k / 3) | 0, k % 3), c: f('c', (k / 3) | 0, k % 3), z: f('z', (k / 3) | 0, k % 3) })), ans = cells[8];
  const opts = [ans]; let g = 0; const keyOf = x => x.s + x.c + x.z, nOpt = d >= 8 ? 6 : 4;
  while (opts.length < nOpt && g++ < 200) { const a = r.pick(attrs.filter(x => rules[x] !== 'const').concat(attrs)), nv = Object.assign({}, ans); nv[a] = r.pick(vals[a].filter(v => v !== ans[a])); if (r.chance(0.3)) { const b = r.pick(attrs); nv[b] = r.pick(vals[b]); } if (!opts.some(o => keyOf(o) === keyOf(nv))) opts.push(nv); }
  return { cells, ans, opts: r.shuffle(opts) };
}

/* ============ اكتشف القاعدة ============ */
const RF = (() => {
  const SH = ['circle', 'square', 'triangle'], CO = [kit.PAL[0], kit.PAL[1], kit.PAL[2]], OBJ = []; SH.forEach((s, i) => CO.forEach((c, j) => OBJ.push({ s: i, c: j, k: i * 3 + j })));
  const names = { s: ['الدائرة', 'المربع', 'المثلث'], c: ['الأصفر', 'الأحمر', 'الفيروزي'] };
  function rules(level) {
    const R = [];
    for (let i = 0; i < 3; i++) { R.push({ n: `الشكل ${names.s[i]}`, f: o => o.s === i }); R.push({ n: `اللون ${names.c[i]}`, f: o => o.c === i }); }
    if (level >= 1) for (let i = 0; i < 3; i++) { R.push({ n: `ليس ${names.s[i]}`, f: o => o.s !== i }); R.push({ n: `ليس اللون ${names.c[i]}`, f: o => o.c !== i }); }
    if (level >= 2) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R.push({ n: `${names.s[i]} و${names.c[j]} معاً`, f: o => o.s === i && o.c === j });
    if (level >= 2) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (i !== j) R.push({ n: `${names.s[i]} أو ${names.s[j]}`, f: o => o.s === i || o.s === j });
    return R;
  }
  function make(d, r) {
    const lv = d < 3 ? 0 : d < 6 ? 1 : 2, R = rules(lv);
    for (let t = 0; t < 400; t++) {
      const truth = r.pick(R), yes = OBJ.filter(truth.f), no = OBJ.filter(o => !truth.f(o)); if (yes.length < 2 || no.length < 2) continue;
      const ne = 4 + Math.min(2, lv + (d > 7 ? 1 : 0)), ex = r.shuffle([...r.sample(yes, Math.min(2, yes.length)), ...r.sample(no, 2)]); while (ex.length < ne) { const o = r.pick(OBJ); if (!ex.includes(o)) ex.push(o); }
      const cons = R.filter(ru => ex.every(o => ru.f(o) === truth.f(o))), pool = OBJ.filter(o => !ex.includes(o) && cons.every(ru => ru.f(o) === truth.f(o)));
      if (!pool.length || cons.length > (lv === 0 ? 3 : lv === 1 ? 5 : 8)) continue;
      const q = r.pick(pool); return { ex: ex.map(o => ({ o, y: truth.f(o) })), q, ans: truth.f(q), truth: truth.n };
    }
    return make(0, r);
  }
  return { make, names };
})();
MV.define({
  id: 'rulefind', name: 'اكتشف القاعدة', en: 'Rule Discovery', realms: ['abstract'], skills: ['patterns', 'deduction', 'creative'], type: 'quiz', minutes: 5,
  blurb: 'أمثلة مصنّفة «تنطبق» و«لا تنطبق» على قاعدة خفية. استنتج القاعدة ثم صنّف شكلاً جديداً.',
  rules: ['القاعدة تتعلق بالشكل أو اللون أو بهما معاً (أو نفيهما).', 'الأمثلة المُعلَّمة صحيحة دائماً.', 'يُختار الشكل المطلوب تصنيفه بحيث يكون جوابه محسوماً من الأمثلة.'],
  levelNote: l => ['قواعد بسيطة', 'مع النفي', 'قواعد مركّبة', 'أمثلة أقل', 'أصعب'][l - 1],
  selfTest() { const r = RNG(7), o = []; for (let d = 0; d <= 10; d++) { const q = RF.make(d, r); o.push(q.ex.length >= 4 && typeof q.ans === 'boolean'); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 6, quickRounds: 3, par: 25,
      make: (d, i, r) => RF.make(d, r),
      render(box, it, api) {
        const dr = o => kit.shapeSvg(['circle', 'square', 'triangle'][o.s], kit.PAL[o.c], 38);
        box.append(kit.title('ما القاعدة الخفية؟', 'الأخضر = تنطبق، الأحمر = لا تنطبق'), h('div', { class: 'exs' }, it.ex.map(e => h('div', { class: 'ex ' + (e.y ? 'y' : 'n') }, dr(e.o), h('small', null, e.y ? 'تنطبق' : 'لا تنطبق')))));
        box.append(h('div', { class: 'cdtarget' }, 'هل تنطبق القاعدة على هذا الشكل؟'), h('div', { class: 'pfig' }, dr(it.q)));
        kit.mc(box, { cols: 2, options: [{ label: 'تنطبق', correct: it.ans === true }, { label: 'لا تنطبق', correct: it.ans === false }], onAnswer: ok => api.done(ok) });
      },
      explain: it => `القاعدة المقصودة: ${it.truth}.`,
    });
  },
});

/* ============ المعادلات الرمزية ============ */
MV.define({
  id: 'symbols', name: 'المعادلات الرمزية', en: 'Symbol Equations', realms: ['abstract', 'logic'], skills: ['solving', 'math', 'deduction'], type: 'quiz', minutes: 5,
  blurb: 'كل رمز يمثّل عدداً صحيحاً من 1 إلى 9. اجمع المعطيات لتعرف قيمة كل رمز ثم احسب المطلوب.',
  rules: ['الرمز نفسه له القيمة نفسها في كل المعادلات.', 'القيم أعداد صحيحة بين 1 و9، وللنظام حل واحد فقط.', 'احسب ناتج المطلوب في آخر السؤال.'],
  levelNote: l => ['رمزان بجمع فقط', 'رمزان مع طرح وضرب', 'ثلاثة رموز', 'ثلاثة رموز بعمليات مختلطة', 'أربعة رموز'][l - 1],
  selfTest() { const r = RNG(1), o = []; for (let d = 0; d <= 10; d++) { const q = symMake(d, r); o.push(q.sols === 1 && q.opts.includes(q.ans)); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 6, quickRounds: 3, par: 22,
      make: (d, i, r) => symMake(d, r),
      render(box, it, api) {
        const ico = k => kit.shapeSvg(it.shapes[k], it.cols[k], 30);
        const term = (t) => h('span', { style: 'display:inline-flex;gap:4px;align-items:center' }, t.map(x => typeof x === 'number' ? ico(x) : h('span', null, x)));
        box.append(kit.title('ما قيمة المطلوب؟'));
        it.eqs.forEach(e => box.append(h('div', { class: 'eqrow' }, term(e.l), h('span', null, '='), h('span', null, String(e.v)))));
        box.append(h('div', { class: 'eqrow', style: 'color:var(--accent-t)' }, term(it.q), h('span', null, '= ؟')));
        kit.mc(box, { cols: 4, options: it.opts.map(v => ({ label: String(v), correct: v === it.ans })), onAnswer: ok => api.done(ok) });
      },
      explain: it => `القيم: ${it.vals.map((v, k) => `الرمز ${k + 1} = ${v}`).join('، ')}`,
    });
  },
});
function symMake(d, r) {
  const k = d < 3 ? 2 : d < 7 ? 3 : 4, shapes = r.sample(MXS, k), cols = r.sample(kit.PAL, k);
  for (let t = 0; t < 400; t++) {
    const vals = range(k, () => r.int(1, 9)); if (new Set(vals).size < k && r.chance(0.8)) continue;
    const eqs = []; let sols = 99;
    const count = () => { let c = 0; const rec = (i, a) => { if (i === k) { if (eqs.every(e => e.f(a) === e.v)) c++; return; } for (let v = 1; v <= 9; v++) { a[i] = v; rec(i + 1, a); } }; rec(0, []); return c; };
    for (let g = 0; g < 8 && sols !== 1; g++) {
      const a = r.int(0, k - 1); let b = r.int(0, k - 1), c = r.int(0, k - 1); const ops = d < 3 ? ['+', '++'] : d < 5 ? ['+', '++', '×', '−'] : ['+', '++', '×', '−', '+×'];
      const op = r.pick(ops); let e;
      if (op === '+') e = { l: [a, '+', b], f: x => x[a] + x[b], v: vals[a] + vals[b] }; else if (op === '++') e = { l: [a, '+', b, '+', c], f: x => x[a] + x[b] + x[c], v: vals[a] + vals[b] + vals[c] }; else if (op === '×') e = { l: [a, '×', b], f: x => x[a] * x[b], v: vals[a] * vals[b] }; else if (op === '−') { if (vals[a] <= vals[b]) continue; e = { l: [a, '−', b], f: x => x[a] - x[b], v: vals[a] - vals[b] }; } else e = { l: [a, '×', b, '+', c], f: x => x[a] * x[b] + x[c], v: vals[a] * vals[b] + vals[c] };
      if (eqs.some(z => z.l.join('') === e.l.join(''))) continue; eqs.push(e); sols = count();
    }
    if (sols !== 1) continue;
    const qa = r.int(0, k - 1), qb = r.int(0, k - 1), qc = r.int(0, k - 1), q = d < 4 ? [qa, '+', qb] : [qa, '×', qb, '+', qc]; const ans = q.length === 3 ? vals[qa] + vals[qb] : vals[qa] * vals[qb] + vals[qc];
    const set = new Set([ans + 1, ans - 1, ans + 2, ans - 2, ans + 3, ans + 5].filter(v => v > 0)); const opts = r.shuffle([ans, ...r.sample([...set], 3)]);
    eqs.forEach(e => { e.l = e.l.slice(); }); return { shapes, cols, eqs, q, ans, opts, vals, sols };
  }
  return symMake(0, r);
}

/* ============ الوصول إلى الهدف (Countdown) ============ */
MV.define({
  id: 'countdown', name: 'الوصول إلى الهدف', en: 'Reach the Target', realms: ['abstract', 'speed'], skills: ['creative', 'math', 'solving'], type: 'puzzle', minutes: 6,
  blurb: 'أعداد وعدد مستهدف: اجمع واطرح واضرب واقسم عددين في كل خطوة للوصول إلى الهدف. لكل لغز حل مضمون.',
  rules: ['اختر عددين ثم عملية؛ يحلّ الناتج محلّ العددين.', 'القسمة مسموحة عند القسمة التامة فقط، والطرح يعطي ناتجاً موجباً.', 'يكفي أن يظهر الهدف بين الأعداد. يمكنك التراجع وإعادة المحاولة.'],
  levelNote: l => ['3 أعداد صغيرة', '4 أعداد', '4 أعداد وهدف أكبر', '5 أعداد مع أعداد كبيرة', '6 أعداد'][l - 1],
  selfTest() { const r = RNG(2), o = []; for (let l = 1; l <= 5; l++) { const p = cdMake(l, r); let v = p.nums.slice(); p.steps.forEach(([a, b, op, res]) => { const i = v.indexOf(a); v.splice(i, 1); const j = v.indexOf(b); v.splice(j, 1); v.push(res); }); o.push(v.includes(p.target)); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    const P = cdMake(ctx.level, ctx.rng); let nums = P.nums.map(v => v), hist = [], sel = [], resets = 0, solved = false;
    const tgt = h('div', { class: 'cdtarget' }, 'الهدف', h('b', null, String(P.target))), box = h('div', { class: 'cdnums' }), log = h('div', { class: 'cdlog' });
    const opBtns = ['+', '−', '×', '÷'].map(o => h('button', { 'data-op': o, onClick: () => apply(o) }, o));
    const undoB = h('button', { class: 'btn ghost sm', onClick: undo }, 'تراجع'), resetB = h('button', { class: 'btn ghost sm', onClick: () => { nums = P.nums.slice(); hist = []; sel = []; resets++; draw(); } }, 'إعادة'), giveB = h('button', { class: 'btn ghost sm', onClick: () => finish(false) }, 'استسلام');
    const hintB = ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', id: 'cd-hint', onClick: () => { ctx.hint(); const st = nextStep(); if (st) toast(`جرّب: ${st[0]} ${st[2]} ${st[1]}`); } }, 'تلميح') : null;
    mount(ctx.root, h('div', { class: 'stack' }, tgt, box, h('div', { class: 'cdops' }, opBtns), log, h('div', { class: 'chtools' }, undoB, resetB, hintB, giveB)));
    function draw() { box.textContent = ''; nums.forEach((v, i) => box.append(h('button', { class: 'cdnum' + (sel.includes(i) ? ' sel' : ''), 'data-i': i, onClick: () => { if (solved) return; if (sel.includes(i)) sel = sel.filter(x => x !== i); else sel = sel.length >= 2 ? [sel[1], i] : sel.concat(i); draw(); } }, String(v)))); log.textContent = hist.map(x => x.t).join('   ·   '); if (nums.includes(P.target) && !solved) finish(true); }
    function apply(o) {
      if (sel.length !== 2 || solved) { toast('اختر عددين أولاً'); return; } const [i, j] = sel, a = nums[i], b = nums[j]; let res;
      if (o === '+') res = a + b; else if (o === '×') res = a * b; else if (o === '−') { res = Math.abs(a - b); } else { const hi = Math.max(a, b), lo = Math.min(a, b); if (lo === 0 || hi % lo) { toast('القسمة غير تامة', 'bad'); ctx.mistake(); return; } res = hi / lo; }
      if (o === '−' && res === 0) { toast('الناتج صفر غير مفيد', 'bad'); return; }
      const hiN = Math.max(a, b), loN = Math.min(a, b), txt = o === '−' ? `${hiN} − ${loN} = ${res}` : o === '÷' ? `${hiN} ÷ ${loN} = ${res}` : `${a} ${o} ${b} = ${res}`;
      hist.push({ prev: nums.slice(), t: txt }); nums = nums.filter((_, k) => k !== i && k !== j).concat(res); sel = []; Sound.play('click'); draw();
    }
    function undo() { const p = hist.pop(); if (p) { nums = p.prev; sel = []; draw(); } }
    function nextStep() { // أول خطوة من الحل الأصلي ممكنة من الحالة الحالية، وإلا من الصفر
      for (const st of P.steps) { if (nums.includes(st[0]) && nums.includes(st[1]) && (st[0] !== st[1] || nums.filter(x => x === st[0]).length > 1) && !hist.some(x => x.t.endsWith('= ' + st[3]))) return st; } return null;
    }
    function finish(ok) { if (solved) return; solved = true; const acc = ok ? clamp(1 - resets * 0.1 - ctx.hints * 0.12, 0.4, 1) : 0.15; if (ok) { ctx.correct(); log.textContent = 'وصلت إلى الهدف!'; } else { ctx.mistake(); log.textContent = 'الحل: ' + P.steps.map(s => `${s[0]} ${s[2]} ${s[1]} = ${s[3]}`).join(' ، '); } ctx.timeout(() => ctx.finish({ acc, items: 1, parTime: 20 + P.steps.length * 25, complexity: 2 + ctx.level * 1.6 }), ok ? 900 : 2600); }
    ctx.debug.step = () => { if (solved) return; const st = nextStep(); if (!st) return; const i = nums.indexOf(st[0]); sel = [i, nums.findIndex((v, k) => v === st[1] && k !== i)]; draw(); const op = st[2]; apply(op); };
    draw();
  },
});
function cdMake(level, r) {
  const n = [3, 4, 4, 5, 6][level - 1], big = level >= 4;
  for (let t = 0; t < 500; t++) {
    const nums = range(n, () => (big && r.chance(0.35)) ? r.pick([10, 25, 50, 75, 100]) : r.int(1, 9)); let v = nums.slice(), bad = false; const steps = [], k = r.int(Math.max(2, n - 2), n - 1);
    for (let s = 0; s < k; s++) {
      const i = r.int(0, v.length - 1); let j; do { j = r.int(0, v.length - 1); } while (j === i); const a = v[i], b = v[j], hi = Math.max(a, b), lo = Math.min(a, b);
      const ops = ['+', '×', '−']; if (lo && hi % lo === 0 && lo > 1) ops.push('÷'); const op = r.pick(level < 3 ? ops.filter(x => x !== '÷') : ops);
      const res = op === '+' ? a + b : op === '×' ? a * b : op === '−' ? hi - lo : hi / lo; if (res <= 0 || res > 999) { bad = true; break; }
      steps.push(op === '−' || op === '÷' ? [hi, lo, op, res] : [a, b, op, res]); v = v.filter((_, x) => x !== i && x !== j).concat(res);
    }
    if (bad || steps.length < 2) continue; const target = steps[steps.length - 1][3]; if (target < 10 || nums.includes(target)) continue;
    return { nums, steps, target };
  }
  return { nums: [3, 5, 7], steps: [[3, 5, '+', 8], [8, 7, '×', 56]], target: 56 };
}

/* ============ مفاتيح الأضواء ============ */
function lightsSolve(g, st) {
  const n = g * g, A = range(n, i => { const row = Array(n + 1).fill(0), x = i % g, y = (i / g) | 0; row[i] = 1; if (x > 0) row[i - 1] = 1; if (x < g - 1) row[i + 1] = 1; if (y > 0) row[i - g] = 1; if (y < g - 1) row[i + g] = 1; row[n] = st[i] ? 1 : 0; return row; });
  const piv = []; let rr = 0;
  for (let c = 0; c < n && rr < n; c++) { let p = -1; for (let i = rr; i < n; i++) if (A[i][c]) { p = i; break; } if (p < 0) continue; [A[rr], A[p]] = [A[p], A[rr]]; for (let i = 0; i < n; i++) if (i !== rr && A[i][c]) for (let k = 0; k <= n; k++) A[i][k] ^= A[rr][k]; piv.push(c); rr++; }
  for (let i = rr; i < n; i++) if (A[i][n]) return null;
  const free = range(n).filter(c => !piv.includes(c)), base = Array(n).fill(0); piv.forEach((c, i) => base[c] = A[i][n]);
  const basis = free.map(f => { const v = Array(n).fill(0); v[f] = 1; piv.forEach((c, i) => v[c] = A[i][f]); return v; });
  let best = null; for (let m = 0; m < (1 << basis.length); m++) { const x = base.slice(); basis.forEach((v, b) => { if (m >> b & 1) v.forEach((e, k) => x[k] ^= e); }); const w = x.reduce((a, b) => a + b, 0); if (!best || w < best.w) best = { x, w }; }
  return best;
}
MV.define({
  id: 'lightsout', name: 'مفاتيح الأضواء', en: 'Lights Out', realms: ['abstract', 'logic'], skills: ['solving', 'planning'], type: 'puzzle', minutes: 5,
  blurb: 'كل ضغطة تقلب المربّع وجيرانه الأربعة (تشغيل ↔ إطفاء). أطفئ كل الأضواء بأقل عدد من الضغطات.',
  rules: ['الضغط على مربّع يقلب حالته وحالة المربعات المجاورة له (أعلى/أسفل/يمين/يسار).', 'الهدف: إطفاء جميع المربعات المضيئة.', 'اللغز مولَّد من حالة مطفأة بضغطات عشوائية، فهو قابل للحل دائماً، والحاسوب يعرف أقل عدد ممكن من الضغطات.'],
  levelNote: l => `شبكة ${[3, 3, 4, 4, 5][l - 1]}×${[3, 3, 4, 4, 5][l - 1]}`,
  selfTest() { const r = RNG(1), o = []; for (const g of [3, 4, 5]) { const st = range(g * g, () => r.chance(0.4)); const mk = Array(g * g).fill(0); r.sample(range(g * g), 6).forEach(i => { const x = i % g, y = (i / g) | 0; [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx >= 0 && nx < g && ny >= 0 && ny < g) mk[ny * g + nx] ^= 1; }); }); const sol = lightsSolve(g, mk.map(Boolean)); o.push(!!sol && sol.w <= 6); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    const g = [3, 3, 4, 4, 5][ctx.level - 1], n = g * g, r = ctx.rng; let st = Array(n).fill(false);
    const press = i => { const x = i % g, y = (i / g) | 0;[[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx >= 0 && nx < g && ny >= 0 && ny < g) st[ny * g + nx] = !st[ny * g + nx]; }); };
    let sol; do { st = Array(n).fill(false); r.sample(range(n), 2 + ctx.level + (g > 3 ? 2 : 0)).forEach(press); sol = lightsSolve(g, st); } while (!st.some(Boolean) || !sol || sol.w < 2);
    const par = sol.w; let presses = 0, solved = false;
    const grid = h('div', { class: 'lights', style: `grid-template-columns:repeat(${g},1fr)` }), stat = h('div', { class: 'chstat pstat' });
    const btns = range(n, i => { const b = h('button', { 'data-i': i, 'aria-label': 'مفتاح', onClick: () => tap(i) }); grid.append(b); return b; });
    const hintB = ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', id: 'lo-hint', onClick: () => { ctx.hint(); const s = lightsSolve(g, st); if (s) { const i = s.x.findIndex(v => v); btns[i].classList.add('hn'); } } }, 'تلميح') : null;
    mount(ctx.root, h('div', { class: 'stack' }, stat, grid, h('div', { class: 'chtools' }, hintB)));
    function draw() { btns.forEach((b, i) => { b.className = st[i] ? 'on' : ''; }); stat.textContent = ''; stat.append(h('span', null, 'الضغطات ', h('bdi', null, String(presses))), h('span', null, 'الأقل ', h('bdi', null, String(par)))); }
    function tap(i) { if (solved) return; press(i); presses++; Sound.play('click'); draw(); if (!st.some(Boolean)) { solved = true; ctx.correct(); const acc = clamp(par / Math.max(presses, par), 0.2, 1); ctx.timeout(() => ctx.finish({ acc, items: 1, parTime: 15 + par * 8, complexity: 2 + ctx.level * 1.6 }), 900); } }
    ctx.debug.step = () => { if (solved) return; const s = lightsSolve(g, st); const i = s.x.findIndex(v => v); tap(i); };
    draw();
  },
});

/* ============ آلة الأعداد ============ */
const MACH = (() => {
  const fam = [];
  for (let a = 2; a <= 6; a++) for (let b = -6; b <= 9; b++) fam.push({ k: 'lin', n: `×${a} ثم ${b < 0 ? '−' + -b : '+' + b}`, f: x => a * x + b, lv: 0 });
  for (let a = 10; a <= 30; a++) fam.push({ k: 'rev', n: `${a} − س`, f: x => a - x, lv: 1 });
  for (let c = -9; c <= 9; c++) fam.push({ k: 'sq', n: `س² ${c < 0 ? '−' : '+'} ${Math.abs(c)}`, f: x => x * x + c, lv: 1 });
  for (let a = 1; a <= 4; a++) fam.push({ k: 'sqlin', n: `س² + ${a}س`, f: x => x * x + a * x, lv: 2 });
  for (let a = 1; a <= 9; a++) for (let b = 2; b <= 5; b++) fam.push({ k: 'par', n: `(س + ${a}) × ${b}`, f: x => (x + a) * b, lv: 2 });
  function make(d, r) {
    const lv = d < 3 ? 0 : d < 6 ? 1 : 2, pool = fam.filter(f => f.lv <= lv && (lv > 0 || true)), nEx = d < 4 ? 3 : 4;
    for (let t = 0; t < 400; t++) {
      const truth = r.pick(lv === 0 ? fam.filter(f => f.lv === 0 && f.n.startsWith('×2') || f.n.startsWith('×3') || f.n.startsWith('×4')) : pool.filter(f => f.lv >= Math.max(0, lv - 1)));
      if (!truth) continue; const xs = r.sample(range(9, i => i + 1), nEx + 1), exs = xs.slice(0, nEx), q = xs[nEx];
      const cons = pool.filter(f => exs.every(x => f.f(x) === truth.f(x))); if (cons.some(f => f.f(q) !== truth.f(q))) continue;
      const ans = truth.f(q); if (ans < -50 || ans > 400) continue;
      const set = new Set([ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans + q, ans - q].filter(v => v !== ans)); const opts = r.shuffle([ans, ...r.sample([...set], 3)]);
      return { exs: exs.map(x => [x, truth.f(x)]), q, ans, opts, rule: truth.n };
    }
    return make(0, r);
  }
  return { make };
})();
MV.define({
  id: 'machine', name: 'آلة الأعداد', en: 'Number Machine', realms: ['abstract', 'logic'], skills: ['patterns', 'solving', 'math'], type: 'quiz', minutes: 5,
  blurb: 'آلة غامضة تحوّل كل عدد تدخله إلى عدد آخر بقاعدة ثابتة. استنتج القاعدة وأخبرنا بناتج عدد جديد.',
  rules: ['كل زوج (مدخل ← مخرج) تم بالقاعدة نفسها.', 'ابحث عن العلاقة بين المدخل والمخرج.', 'طبّقها على المدخل الجديد؛ ستجدها محسومة بالأمثلة المعطاة.'],
  levelNote: l => ['قواعد خطية بسيطة', 'مع الطرح والمربعات', 'قواعد من خطوتين', 'مركّبة', 'أصعب'][l - 1],
  selfTest() { const r = RNG(3), o = []; for (let d = 0; d <= 10; d++) { const q = MACH.make(d, r); o.push(q.opts.includes(q.ans) && new Set(q.opts).size === 4); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 7, quickRounds: 4, par: 18,
      make: (d, i, r) => MACH.make(d, r),
      render(box, it, api) {
        box.append(kit.title('آلة الأعداد', 'ما ناتج العدد الجديد؟'), h('table', { class: 'opt-tbl', style: 'direction:ltr' }, h('tr', null, h('th', null, 'مدخل'), h('th', null, 'مخرج')), it.exs.map(([a, b]) => h('tr', null, h('td', null, String(a)), h('td', null, String(b)))), h('tr', null, h('td', { style: 'color:var(--accent-t);font-weight:700' }, String(it.q)), h('td', { style: 'color:var(--accent-t)' }, '؟'))));
        kit.mc(box, { cols: 4, options: it.opts.map(v => ({ label: String(v), correct: v === it.ans })), onAnswer: ok => api.done(ok) });
      },
      explain: it => `القاعدة: ${it.rule} ← الناتج ${it.ans}`,
    });
  },
});
