'use strict';
/* ============ المنطق (2): الأنماط، الاستنتاج، التفكير متعدد الخطوات ============ */

MV.css(`
.seqrow{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:14px 0;direction:ltr}
.seqbox{min-width:54px;height:54px;padding:0 10px;display:grid;place-items:center;border:2px solid var(--line2);border-radius:12px;background:var(--surface);font-family:var(--f-disp);font-size:1.35rem;font-variant-numeric:tabular-nums}
.seqbox.q{border-style:dashed;color:var(--accent-t);border-color:var(--accent)}
.seqbox.sv{width:60px;height:60px;padding:0}
.story{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 18px;max-width:640px;margin:0 auto 10px;line-height:1.9}
.story ul{margin:6px 0;padding-inline-start:22px}
.story .qq{margin-top:8px;font-weight:700}
.stmt{display:block;padding:3px 0}
`);

/* ---------- مكتبة الأنماط ---------- */
const Pat = (() => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
  const F = [
    { d: [0, 3], f: r => { const a = r.int(1, 15), d = r.int(2, 7); return { s: range(6, i => a + d * i), rule: `كل عدد = السابق + ${d}` }; } },
    { d: [0, 3], f: r => { const a = r.int(1, 3), m = r.int(2, 3); return { s: range(6, i => a * m ** i), rule: `كل عدد = السابق × ${m}` }; } },
    { d: [0, 4], f: r => { const a = r.int(40, 90), d = r.int(3, 9); return { s: range(6, i => a - d * i), rule: `كل عدد = السابق − ${d}` }; } },
    { d: [2, 5], f: r => { const a = r.int(1, 8), d0 = r.int(1, 3), k = r.int(1, 3); const s = [a]; for (let i = 0; i < 5; i++) s.push(s[i] + d0 + k * i); return { s, rule: `الفروق بين الأعداد تبدأ من ${d0} وتزداد ${k} في كل مرة` }; } },
    { d: [2, 6], f: r => { const a = r.int(4, 9), b = r.int(1, a - 1), st = r.int(5, 20); const s = [st]; for (let i = 0; i < 6; i++) s.push(s[i] + (i % 2 ? -b : a)); return { s, rule: `يتناوب النمط: + ${a} ثم − ${b}` }; } },
    { d: [3, 6], f: r => { const n = r.int(1, 4), c = r.int(0, 5); return { s: range(6, i => (n + i) ** 2 + c), rule: c ? `مربعات الأعداد المتتالية مضافاً إليها ${c}` : 'مربعات الأعداد المتتالية' }; } },
    { d: [3, 7], f: r => { const a = r.int(1, 5), b = r.int(1, 6); const s = [a, b]; for (let i = 2; i < 7; i++) s.push(s[i - 1] + s[i - 2]); return { s, rule: 'كل عدد = مجموع العددين السابقين' }; } },
    { d: [4, 7], f: r => { const x = r.int(1, 10), y = r.int(20, 40), p = r.int(2, 5), q = r.int(2, 6); const s = []; for (let i = 0; i < 4; i++) { s.push(x + p * i); s.push(y + q * i); } return { s: s.slice(0, 7).concat([s[7]]), rule: `متتاليتان متداخلتان: الأولى تزيد ${p} والثانية تزيد ${q}` }; } },
    { d: [4, 8], f: r => { const b = r.int(1, 3), x = r.int(1, 3); const s = [x]; for (let i = 0; i < 5; i++) s.push(2 * s[i] + b); return { s, rule: `كل عدد = ضعف السابق + ${b}` }; } },
    { d: [5, 8], f: r => { const k = r.int(2, 6), x = r.int(1, 5); const s = [x]; for (let i = 0; i < 6; i++) s.push(i % 2 ? s[i] + k : s[i] * 2); return { s, rule: `يتناوب النمط: × 2 ثم + ${k}` }; } },
    { d: [5, 9], f: r => { const n = r.int(1, 3); return r.chance(0.5) ? { s: range(6, i => (n + i) ** 3), rule: 'مكعبات الأعداد المتتالية' } : { s: range(6, i => ((n + i) * (n + i + 1)) / 2), rule: 'الأعداد المثلثية: 1، 3، 6، 10 … (كل مرة نضيف عدداً أكبر بواحد)' }; } },
    { d: [6, 10], f: r => { const st = r.int(0, 10); return { s: primes.slice(st, st + 6), rule: 'أعداد أولية متتالية' }; } },
    { d: [7, 10], f: r => { const a = r.int(2, 6), b = r.int(1, 4), x = r.int(3, 8); const s = [x]; for (let i = 0; i < 7; i++) { const o = i % 3; s.push(o === 0 ? s[i] + a : o === 1 ? s[i] * 2 : s[i] - b); } return { s, rule: `نمط ثلاثي متكرر: + ${a}، ثم × 2، ثم − ${b}` }; } },
    { d: [8, 10], f: r => { const p = r.int(2, 5), x = r.int(1, 6), y = r.int(1, 3); const s = []; for (let i = 0; i < 4; i++) { s.push(x + p * i); s.push(y * 2 ** i); } return { s: s.slice(0, 8), rule: `متتاليتان متداخلتان: حسابية (+${p}) وهندسية (×2)` }; } },
  ];
  function num(diff, r) {
    const pool = F.filter(f => diff >= f.d[0] && diff <= f.d[1]);
    for (let t = 0; t < 20; t++) {
      const g = r.pick(pool).f(r), s = g.s; if (s.some(v => !isFinite(v) || v < -999 || v > 9999)) continue;
      const ans = s[s.length - 1], shown = s.slice(0, -1);
      const naive = shown[shown.length - 1] + (shown[shown.length - 1] - shown[shown.length - 2]);
      const cands = new Set([naive, ans + 1, ans - 1, ans + 2, ans * 2 - shown[shown.length - 1], ans + r.int(3, 9), ans - r.int(2, 6), Math.round(shown[shown.length - 1] * 2)]);
      cands.delete(ans); const opts = r.sample([...cands].filter(v => v > -1000), 3);
      if (opts.length < 3) continue;
      return { shown, ans, opts: r.shuffle([ans, ...opts]), rule: g.rule };
    }
    return num(0, r);
  }
  const SHP = ['triangle', 'cross', 'pentagon', 'diamond', 'hexagon', 'star'];
  function shapes(diff, r) {
    const sh = r.sample(SHP, 3), cols = r.sample(kit.PAL, 3), L = 7;
    const useCol = diff >= 3, useRot = diff >= 7, shapePer = diff <= 3 ? (r.chance(0.5) ? 3 : 1) : 3, colPer = diff <= 3 ? (shapePer === 1 ? 3 : 1) : 2;
    const el = i => ({ shape: sh[i % shapePer], col: cols[i % colPer], rot: useRot ? (i * 45) % 360 : 0 });
    const all = range(L, el), ans = all[L - 1], shown = all.slice(0, L - 1);
    const key = e => e.shape + e.col + e.rot;
    const opts = [ans]; let g = 0;
    while (opts.length < 4 && g++ < 40) {
      const d = { ...ans }; const k = r.int(0, useRot ? 2 : 1);
      if (k === 0) d.shape = r.pick(sh.filter(x => x !== ans.shape).concat(SHP.filter(x => !sh.includes(x)).slice(0, 1))); else if (k === 1) d.col = r.pick(cols.filter(x => x !== ans.col)); else d.rot = (ans.rot + 45 * r.pick([1, 2, 3, -1])) % 360;
      if (!opts.some(o => key(o) === key(d))) opts.push(d);
    }
    const rule = diff <= 3 ? 'العناصر تتكرر بنمط دوري ثابت' : useRot ? 'الشكل يتكرر كل 3، واللون كل 2، والدوران يزداد 45° في كل خطوة' : 'الشكل يتكرر كل 3 والألوان كل 2';
    return { shown, ans, opts: r.shuffle(opts), rule };
  }
  const draw = (e, size = 46) => kit.shapeSvg(e.shape, e.col, size, e.rot || 0);
  const comps = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 65, 69, 75, 77, 85, 91, 95];
  function odd(diff, r) {
    const kinds = ['mult', 'even', 'square', 'prime', 'dsum', 'ap'].filter((k, i) => diff >= [0, 0, 2, 4, 5, 6][i]);
    const k = r.pick(kinds); let set, oddV, rule;
    if (k === 'mult') { const m = r.int(3, 9); set = r.sample(range(14, i => m * (i + 1)), 4); do { oddV = r.int(10, 90); } while (oddV % m === 0); rule = `كل الأعداد من مضاعفات ${m} ما عدا ${oddV}`; }
    else if (k === 'even') { const ev = r.chance(0.5); set = r.sample(range(40, i => 2 * (i + 1) + (ev ? 0 : 1)), 4); oddV = r.int(5, 80); oddV = ev ? (oddV % 2 ? oddV : oddV + 1) : (oddV % 2 ? oddV + 1 : oddV); rule = ev ? `كلها زوجية ما عدا ${oddV}` : `كلها فردية ما عدا ${oddV}`; }
    else if (k === 'square') { set = r.sample(range(12, i => (i + 2) ** 2), 4); do { oddV = r.int(10, 150); } while (Math.sqrt(oddV) % 1 === 0); rule = `الأعداد مربعات كاملة ما عدا ${oddV}`; }
    else if (k === 'prime') { set = r.sample([5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47], 4); oddV = r.pick(comps); rule = `الأعداد أولية ما عدا ${oddV} (له قواسم أخرى)`; }
    else if (k === 'dsum') { const t = r.int(8, 16); const pool = []; for (let n = 10; n < 200; n++) if ((n + '').split('').reduce((a, b) => a + +b, 0) === t) pool.push(n); set = r.sample(pool, 4); do { oddV = r.int(10, 199); } while ((oddV + '').split('').reduce((a, b) => a + +b, 0) === t); rule = `مجموع أرقام كل عدد = ${t} ما عدا ${oddV}`; }
    else { const d = r.int(3, 9), a = r.int(2, 20); const ap = range(5, i => a + d * i); const idx = r.int(1, 3); oddV = ap[idx] + r.pick([-2, -1, 1, 2]); set = ap.filter((_, i) => i !== idx).slice(0, 4); const all = r.shuffle(set.concat([oddV])); return { set: all, ans: oddV, rule: `الأعداد متتالية حسابية فرقها ${d} ما عدا ${oddV}` }; }
    const all = r.shuffle(set.concat([oddV])); return { set: all, ans: oddV, rule };
  }
  return { num, shapes, odd, draw };
})();
MV.pat = Pat;

MV.define({
  id: 'pattern', name: 'اكتشاف الأنماط', en: 'Pattern Recognition', realms: ['logic', 'abstract'], skills: ['patterns', 'deduction'], type: 'quiz', minutes: 5,
  blurb: 'تسلسلات من الأعداد والأشكال: اكتشف القاعدة الخفية ثم حدّد العنصر التالي أو العنصر المختلف.',
  rules: ['انظر إلى التسلسل واكتشف ما الذي يتغير من عنصر إلى آخر.', 'اختر العنصر الذي يكمل التسلسل (أو العنصر الشاذ).', 'بعد كل خطأ ستُشرح لك القاعدة.'],
  levelNote: l => ['تسلسلات حسابية بسيطة', 'أنماط متدرّجة وأشكال', 'أنماط متداخلة', 'قواعد مركّبة', 'أنماط متعددة المراحل'][l - 1],
  selfTest() { const r = RNG(2), o = []; for (let d = 0; d <= 10; d++) { const n = Pat.num(d, r), s = Pat.shapes(d, r), od = Pat.odd(d, r); o.push(n.opts.includes(n.ans) && new Set(n.opts).size === 4 && s.opts.length === 4 && od.set.length === 5); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 14,
      make(diff, i, r) { const k = r.weighted(['num', 'shape', 'odd'], x => ({ num: 6, shape: 2.5, odd: 1.5 }[x])); return Object.assign({ kind: k }, k === 'num' ? Pat.num(diff, r) : k === 'shape' ? Pat.shapes(diff, r) : Pat.odd(diff, r)); },
      render(box, it, api) {
        if (it.kind === 'num') {
          box.append(kit.title('ما العدد الذي يكمل التسلسل؟'), h('div', { class: 'seqrow' }, it.shown.map(v => h('div', { class: 'seqbox' }, String(v))), h('div', { class: 'seqbox q' }, '؟')));
          kit.mc(box, { cols: 4, options: it.opts.map(v => ({ label: String(v), correct: v === it.ans })), onAnswer: ok => api.done(ok) });
        } else if (it.kind === 'shape') {
          box.append(kit.title('أي شكل يكمل التسلسل؟'), h('div', { class: 'seqrow' }, it.shown.map(e => h('div', { class: 'seqbox sv' }, Pat.draw(e))), h('div', { class: 'seqbox sv q' }, '؟')));
          kit.mc(box, { cols: 4, options: it.opts.map(e => ({ node: Pat.draw(e, 50), correct: e === it.ans })), onAnswer: ok => api.done(ok) });
        } else {
          box.append(kit.title('أي عدد يختلف عن البقية؟'), h('div', { class: 'seqrow' }, ''));
          kit.mc(box, { cols: 3, cls: 'wide', options: it.set.map(v => ({ label: String(v), correct: v === it.ans })), onAnswer: ok => api.done(ok) });
        }
      },
      explain: it => 'القاعدة: ' + it.rule + (it.kind === 'num' ? ` ← الجواب ${it.ans}` : it.kind === 'odd' ? '' : ''),
    });
  },
});

/* ---------- ألغاز الاستنتاج ---------- */
const DED = (() => {
  const NM = ['أحمد', 'علي', 'عمر', 'سامر', 'كريم', 'يوسف'];
  function stText(names, st) {
    const X = names[st.x], Y = names[st.y];
    return { liar: `${X} كاذب`, knight: `${X} صادق`, both: `${X} و${Y} كلاهما كاذب`, one: `أحد ${X} و${Y} على الأقل كاذب`, same: `${X} و${Y} من النوع نفسه`, diff: `${X} و${Y} من نوعين مختلفين`, count: `عدد الكاذبين بيننا ${st.k}` }[st.t];
  }
  function stTrue(st, a) { // a[i] = true صادق
    switch (st.t) { case 'liar': return !a[st.x]; case 'knight': return a[st.x]; case 'both': return !a[st.x] && !a[st.y]; case 'one': return !a[st.x] || !a[st.y]; case 'same': return a[st.x] === a[st.y]; case 'diff': return a[st.x] !== a[st.y]; case 'count': return a.filter(v => !v).length === st.k; }
  }
  function knights(n, r) {
    const names = r.sample(NM, n), types = ['liar', 'knight', 'both', 'one', 'same', 'diff', 'count'];
    for (let t = 0; t < 600; t++) {
      const sts = range(n, i => { const tp = r.pick(types); let x, y; do { x = r.int(0, n - 1); } while (x === i); do { y = r.int(0, n - 1); } while (y === i || y === x); return { t: tp, x, y: n > 2 ? y : x, k: r.int(0, n) }; });
      const sols = []; for (let m = 0; m < (1 << n); m++) { const a = range(n, i => !!(m >> i & 1)); if (sts.every((st, i) => stTrue(st, a) === a[i])) { sols.push(a); if (sols.length > 1) break; } }
      if (sols.length === 1) return { names, sts, sol: sols[0] };
    }
    return knights(n, r);
  }
  function ordering(n, r) {
    const names = r.sample(NM, n), order = r.shuffle(range(n)); // order[i] = ترتيب الشخص i (0 = الأقصر)
    const perms = []; (function g(a, rest) { if (!rest.length) { perms.push(a); return; } rest.forEach((x, i) => g([...a, x], rest.filter((_, j) => j !== i))); })([], range(n));
    const ok = (cl, p) => cl.t === 'gt' ? p[cl.x] > p[cl.y] : (p[cl.x] < p[cl.z] && p[cl.z] < p[cl.y]) || (p[cl.y] < p[cl.z] && p[cl.z] < p[cl.x]);
    const cnt = cls => perms.filter(p => cls.every(c => ok(c, p))).length;
    let cls = [];
    for (let g = 0; g < 80 && cnt(cls) !== 1; g++) {
      let x = r.int(0, n - 1), y; do { y = r.int(0, n - 1); } while (y === x);
      let cl; if (n >= 4 && r.chance(0.3)) { let z; do { z = r.int(0, n - 1); } while (z === x || z === y); cl = { t: 'bt', x, y, z }; } else cl = { t: 'gt', x, y };
      if (!ok(cl, order)) continue; const before = cnt(cls); cls.push(cl); if (cnt(cls) >= before) cls.pop();
    }
    for (let i = cls.length - 1; i >= 0; i--) { const t = cls.filter((_, j) => j !== i); if (cnt(t) === 1) cls = t; }
    return { names, order, cls: r.shuffle(cls) };
  }
  const LET = ['س', 'ص', 'ع', 'ل', 'م', 'ن'];
  const ST = { A: (x, y) => `كل ${x} هو ${y}`, E: (x, y) => `لا ${x} هو ${y}`, I: (x, y) => `بعض ${x} هو ${y}`, O: (x, y) => `بعض ${x} ليس ${y}` };
  function evalSt(t, a, b, e) { const A = e[a], B = e[b]; switch (t) { case 'A': return !A || B; case 'E': return !(A && B); } }
  function holdsModel(st, model) { // model: عناصر، كل عنصر مصفوفة 3 منطقيات
    const [t, a, b] = st; const els = model;
    if (t === 'A') return els.every(e => !e[a] || e[b]); if (t === 'E') return els.every(e => !(e[a] && e[b]));
    if (t === 'I') return els.some(e => e[a] && e[b]); return els.some(e => e[a] && !e[b]);
  }
  function syllogism(r, wantValid) {
    const names = r.sample(LET, 3), types = ['A', 'E', 'I', 'O'];
    const types8 = range(8, m => [!!(m & 1), !!(m & 2), !!(m & 4)]);
    for (let t = 0; t < 400; t++) {
      const t1 = r.pick(types), t2 = r.pick(types), tc = r.pick(types);
      const fig = r.int(0, 3); // S=0, M=1, P=2
      const p1 = fig & 1 ? [t1, 1, 0] : [t1, 0, 1], p2 = fig & 2 ? [t2, 2, 1] : [t2, 1, 2], c = [tc, 0, 2];
      if (['I', 'O'].includes(tc) && !['I', 'O'].includes(t1) && !['I', 'O'].includes(t2)) continue;
      let valid = true, counter = null;
      const m4 = (function* () { for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) for (let c2 = 0; c2 < 8; c2++) for (let d = 0; d < 8; d++) yield [types8[a], types8[b], types8[c2], types8[d]]; })();
      for (const m of m4) { if (holdsModel(p1, m) && holdsModel(p2, m) && !holdsModel(c, m)) { valid = false; counter = m; break; } }
      if (valid !== wantValid) continue;
      let exp = '';
      if (valid) exp = 'النتيجة تتحقق في كل الحالات التي تصح فيها المقدمتان، لذلك هي نتيجة لازمة.';
      else { const seen = new Map(); counter.forEach(e => { const k = e.map((v, i) => v ? names[i] : '').filter(Boolean).join(' و') || 'لا شيء من الثلاثة'; seen.set(k, 1); }); exp = 'يمكن تصوّر حالة تصح فيها المقدمتان وتفشل النتيجة: توجد عناصر من الأنواع: ' + [...seen.keys()].map(k => `(${k})`).join('، ') + ' — فالنتيجة غير لازمة.'; }
      return { text: [ST[p1[0]](names[p1[1]], names[p1[2]]), ST[p2[0]](names[p2[1]], names[p2[2]])], concl: ST[c[0]](names[0], names[2]), valid, exp };
    }
    return syllogism(r, wantValid);
  }
  return { knights, ordering, syllogism, stText, stTrue };
})();

MV.define({
  id: 'deduction', name: 'ألغاز الاستنتاج', en: 'Deduction Puzzles', realms: ['logic'], skills: ['deduction', 'solving'], type: 'quiz', minutes: 7,
  blurb: 'معلومات متفرقة وأسئلة تُجاب بالاستنتاج وحده: الصادقون والكاذبون، ترتيب الأشخاص، والاستدلال المنطقي.',
  rules: ['اقرأ المعطيات بعناية؛ كل لغز له حل واحد يمكن الوصول إليه بالتفكير.', 'لا تعتمد على التخمين — جرّب افتراضاً واختبر تناقضه.', 'بعد الإجابة يظهر شرح للحل.'],
  levelNote: l => ['3 أشخاص', 'أشخاص وترتيب', 'ألغاز أطول', 'استدلال منطقي', 'أكبر تعقيداً'][l - 1],
  selfTest() { const r = RNG(9); const k = DED.knights(4, r), o = DED.ordering(4, r), a = DED.syllogism(r, true), b = DED.syllogism(r, false); return { ok: !!k && o.cls.length > 0 && a.valid && !b.valid, out: [k.sts.length, o.cls.length] }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 6, quickRounds: 3, par: 40,
      make(diff, i, r) {
        const n = diff <= 3 ? 3 : diff <= 7 ? 4 : 5; const kind = r.weighted(['kn', 'ord', 'syl'], x => ({ kn: 4, ord: 3, syl: diff >= 2 ? 3 : 0 }[x]));
        if (kind === 'kn') { const k = DED.knights(n, r), liars = k.sol.filter(v => !v).length; let q; if (liars === 1) q = { t: 'liar' }; else if (k.sol.filter(v => v).length === 1) q = { t: 'knight' }; else if (r.chance(0.5)) q = { t: 'count' }; else q = { t: 'type', x: r.int(0, n - 1) }; return { kind, k, q, n }; }
        if (kind === 'ord') { const o = DED.ordering(n, r); const qs = ['tallest', 'shortest', 'rank']; const q = r.pick(qs); return { kind, o, q, rank: r.int(1, n - 2), n }; }
        return { kind, s: DED.syllogism(r, r.chance(0.5)) };
      },
      render(box, it, api, i) {
        if (it.kind === 'kn') {
          const { k, q } = it, nm = k.names;
          const qt = q.t === 'liar' ? 'من هو الكاذب الوحيد؟' : q.t === 'knight' ? 'من هو الصادق الوحيد؟' : q.t === 'count' ? 'كم عدد الكاذبين؟' : `هل ${nm[q.x]} صادق أم كاذب؟`;
          box.append(h('div', { class: 'story' }, h('div', null, 'على جزيرة، الصادق يقول الحقيقة دائماً والكاذب يكذب دائماً. قال كل شخص جملة:'), h('ul', null, k.sts.map((st, j) => h('li', null, h('b', null, nm[j] + ': '), '«' + DED.stText(nm, st) + '»'))), h('div', { class: 'qq' }, qt)));
          let opts;
          if (q.t === 'liar') opts = nm.map((x, j) => ({ label: x, correct: !k.sol[j] })); else if (q.t === 'knight') opts = nm.map((x, j) => ({ label: x, correct: k.sol[j] }));
          else if (q.t === 'count') { const c = k.sol.filter(v => !v).length; opts = range(Math.min(it.n, 4) + 1, v => ({ label: String(v), correct: v === c })); if (!opts.some(o => o.correct)) opts.push({ label: String(c), correct: true }); }
          else opts = [{ label: 'صادق', correct: k.sol[q.x] }, { label: 'كاذب', correct: !k.sol[q.x] }];
          kit.mc(box, { cols: opts.length > 3 ? 3 : opts.length, options: opts, onAnswer: ok => api.done(ok) });
        } else if (it.kind === 'ord') {
          const { o, q } = it, nm = o.names, txt = c => c.t === 'gt' ? `${nm[c.x]} أطول من ${nm[c.y]}` : `${nm[c.z]} أطول من أحدهما وأقصر من الآخر، وهما ${nm[c.x]} و${nm[c.y]}`;
          const ord = range(it.n).sort((a, b) => o.order[a] - o.order[b]); // من الأقصر للأطول
          const qt = q === 'tallest' ? 'من هو الأطول؟' : q === 'shortest' ? 'من هو الأقصر؟' : `من يحتل المرتبة ${['', 'الأولى', 'الثانية', 'الثالثة', 'الرابعة'][it.rank]} من حيث الطول (من الأقصر)؟`;
          const ans = q === 'tallest' ? ord[it.n - 1] : q === 'shortest' ? ord[0] : ord[it.rank - 1];
          it.ansName = nm[ans]; it.ord = ord;
          box.append(h('div', { class: 'story' }, h('div', null, `${it.n} أشخاص بأطوال مختلفة. المعلومات:`), h('ul', null, o.cls.map(c => h('li', null, txt(c)))), h('div', { class: 'qq' }, qt)));
          kit.mc(box, { cols: it.n > 3 ? 2 : it.n, options: nm.map((x, j) => ({ label: x, correct: j === ans })), onAnswer: ok => api.done(ok) });
        } else {
          const s = it.s;
          box.append(h('div', { class: 'story' }, h('div', null, 'إذا كان:'), h('ul', null, s.text.map(t => h('li', null, t + '.'))), h('div', { class: 'qq' }, `فهل يلزم منطقياً أن: ${s.concl}؟`)));
          kit.mc(box, { cols: 2, options: [{ label: 'نعم، تلزم', correct: s.valid }, { label: 'لا، لا تلزم', correct: !s.valid }], onAnswer: ok => api.done(ok) });
        }
      },
      explain(it) {
        if (it.kind === 'kn') { const nm = it.k.names; return h('div', null, 'الحل: ' + nm.map((x, j) => `${x} ${it.k.sol[j] ? 'صادق' : 'كاذب'}`).join('، ') + '.', h('br'), 'تحقّق: ' + it.k.sts.map((st, j) => `قول ${nm[j]} ${DED.stTrue(st, it.k.sol) ? 'صحيح' : 'خاطئ'} وهو ${it.k.sol[j] ? 'صادق' : 'كاذب'} ✓`).join('؛ ')); }
        if (it.kind === 'ord') return `الترتيب من الأقصر إلى الأطول: ${it.ord.map(j => it.o.names[j]).join(' ← ')}.`;
        return it.s.exp;
      },
    });
  },
});

/* ---------- التفكير متعدد الخطوات ---------- */
const MS = (() => {
  const NM = ['أحمد', 'علي', 'عمر', 'سامر', 'كريم', 'يوسف', 'حسين', 'زيد'];
  const CTX = [
    { u: 'سنة', ask: x => `كم عمر ${x}؟`, more: (a, b, d) => `${a} أكبر من ${b} بـ ${d} سنوات`, less: (a, b, d) => `${a} أصغر من ${b} بـ ${d} سنوات`, dbl: (a, b) => `عمر ${a} ضعف عمر ${b}`, half: (a, b) => `عمر ${a} نصف عمر ${b}`, range: [4, 60] },
    { u: 'ألف دينار', ask: x => `كم ألف دينار يملك ${x}؟`, more: (a, b, d) => `${a} يملك أكثر من ${b} بمقدار ${d} آلاف دينار`, less: (a, b, d) => `${a} يملك أقل من ${b} بمقدار ${d} آلاف دينار`, dbl: (a, b) => `${a} يملك ضعف ما يملكه ${b}`, half: (a, b) => `${a} يملك نصف ما يملكه ${b}`, range: [4, 80] },
    { u: 'كتاباً', ask: x => `كم كتاباً يملك ${x}؟`, more: (a, b, d) => `${a} يملك ${d} كتب أكثر مما يملكه ${b}`, less: (a, b, d) => `${a} يملك ${d} كتب أقل مما يملكه ${b}`, dbl: (a, b) => `${a} يملك ضعف عدد كتب ${b}`, half: (a, b) => `${a} يملك نصف عدد كتب ${b}`, range: [4, 60] },
  ];
  function chain(diff, r) {
    const steps = 2 + Math.floor(diff / 2.5), ctx = r.pick(CTX), names = r.sample(NM, steps + 1);
    for (let t = 0; t < 200; t++) {
      const vals = [r.int(ctx.range[0], ctx.range[1])]; // قيمة المعلوم (الأخير في السلسلة p_k)، نبني للخلف
      const rel = [];
      let cur = vals[0]; const seq = [cur]; let ok = true;
      for (let s = 0; s < steps; s++) {
        const op = r.weighted(['more', 'less', 'dbl', 'half'], x => ({ more: 3, less: 3, dbl: diff >= 3 ? 1.5 : 0.4, half: diff >= 4 ? 1.2 : 0 }[x]));
        let nv, d = r.int(2, 9);
        if (op === 'more') nv = cur + d; else if (op === 'less') { nv = cur - d; } else if (op === 'dbl') nv = cur * 2; else { if (cur % 2) { ok = false; break; } nv = cur / 2; }
        if (nv < 1 || nv > 150) { ok = false; break; }
        rel.push({ op, d }); seq.push(nv); cur = nv;
      }
      if (!ok) continue;
      // seq[0] معلوم (الشخص الأخير)، seq[steps] هو المطلوب. العلاقات: p_{j} = f(p_{j+1}) تُبنى كجمل بين الاسم j و j+1 بترتيب عكسي
      const known = names[steps], target = names[0];
      const lines = rel.map((rr, s) => { const A = names[steps - 1 - s], B = names[steps - s]; const text = rr.op === 'more' ? ctx.more(A, B, rr.d) : rr.op === 'less' ? ctx.less(A, B, rr.d) : rr.op === 'dbl' ? ctx.dbl(A, B) : ctx.half(A, B); return { text, A, B, rr, val: seq[s + 1] }; });
      // ملاحظة: الشخص p_{steps-1-s} هو نتيجة تطبيق العلاقة على p_{steps-s}
      const ans = seq[steps];
      const wrong = new Set([ans + 2, ans - 2, ans + 5, ans * 2, Math.max(1, Math.round(ans / 2)), ans + 1, ans - 3, ans + 10]); wrong.delete(ans);
      const opts = r.shuffle([ans, ...r.sample([...wrong].filter(v => v > 0), 3)]);
      return { ctx, names, known, target, knownVal: seq[0], lines: r.shuffle(lines.slice()), ordered: lines, ans, opts };
    }
    return chain(0, r);
  }
  const PROPS = [
    { f: n => n % 2 === 0, t: 'عدد زوجي' }, { f: n => n % 2 === 1, t: 'عدد فردي' }, { f: n => n % 3 === 0, t: 'من مضاعفات 3' }, { f: n => n % 5 === 0, t: 'من مضاعفات 5' }, { f: n => n % 7 === 0, t: 'من مضاعفات 7' },
    { f: n => n % 4 === 0, t: 'من مضاعفات 4' }, { f: n => Math.sqrt(n) % 1 === 0, t: 'مربع كامل' }, { f: n => n > 1 && ![...Array(n - 2)].some((_, i) => n % (i + 2) === 0), t: 'عدد أولي' },
    { f: n => (n + '').split('').reduce((a, b) => a + +b, 0) % 2 === 0, t: 'مجموع أرقامه زوجي' }, { f: n => n > 99, t: 'مؤلف من ثلاثة أرقام' }, { f: n => n < 100 && n > 9, t: 'مؤلف من رقمين' },
  ];
  function numPuzzle(diff, r) {
    const nClues = 3 + Math.floor(diff / 3);
    for (let t = 0; t < 300; t++) {
      const lo = r.int(10, 60), hi = lo + r.int(30, 90), props = r.sample(PROPS, nClues);
      const cands = range(hi - lo + 1, i => lo + i).filter(n => props.every(p => p.f(n)));
      if (cands.length !== 1) continue;
      const ans = cands[0];
      const distract = range(hi - lo + 1, i => lo + i).filter(n => n !== ans && props.filter(p => p.f(n)).length >= nClues - 1);
      if (distract.length < 3) continue;
      return { lo, hi, props, ans, opts: r.shuffle([ans, ...r.sample(distract, 3)]) };
    }
    return numPuzzle(0, r);
  }
  return { chain, numPuzzle };
})();

MV.define({
  id: 'multistep', name: 'التفكير متعدد الخطوات', en: 'Multi-step Reasoning', realms: ['logic'], skills: ['deduction', 'math', 'solving'], type: 'quiz', minutes: 6,
  blurb: 'مسائل لا تُحلّ بخطوة واحدة: سلاسل علاقات وشروط متعددة تقودك إلى جواب واحد دقيق.',
  rules: ['اقرأ كل المعطيات ثم رتّبها: من المعلوم إلى المطلوب.', 'بعض المسائل سلاسل علاقات وبعضها أعداد تُحدَّد بشروط متعددة.', 'اختر الجواب الصحيح؛ التخمين لا ينفع لأن الخيارات متقاربة.'],
  levelNote: l => ['خطوتان', '3 خطوات', 'ثلاث خطوات مع ضعف ونصف', 'أربع خطوات', 'خمس خطوات وشروط كثيرة'][l - 1],
  selfTest() { const r = RNG(4); const o = []; for (let d = 0; d <= 10; d++) { const c = MS.chain(d, r), n = MS.numPuzzle(d, r); o.push(c.opts.includes(c.ans) && n.props.every(p => p.f(n.ans))); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 6, quickRounds: 3, par: 35,
      make(diff, i, r) { return r.chance(0.65) ? Object.assign({ kind: 'chain' }, MS.chain(diff, r)) : Object.assign({ kind: 'num' }, MS.numPuzzle(diff, r)); },
      render(box, it, api) {
        if (it.kind === 'chain') {
          box.append(h('div', { class: 'story' }, h('div', null, `نعلم أن ${it.ctx.u === 'سنة' ? 'عمر' : 'ما يملكه'} ${it.known} هو ${it.knownVal} ${it.ctx.u}. والعلاقات التالية صحيحة:`), h('ul', null, it.lines.map(l => h('li', null, l.text))), h('div', { class: 'qq' }, it.ctx.ask(it.target))));
          kit.mc(box, { cols: 4, options: it.opts.map(v => ({ label: String(v), correct: v === it.ans })), onAnswer: ok => api.done(ok) });
        } else {
          box.append(h('div', { class: 'story' }, h('div', null, `عدد بين ${it.lo} و${it.hi}، وتتحقق فيه كل الشروط التالية:`), h('ul', null, it.props.map(p => h('li', null, p.t))), h('div', { class: 'qq' }, 'ما هذا العدد؟')));
          kit.mc(box, { cols: 4, options: it.opts.map(v => ({ label: String(v), correct: v === it.ans })), onAnswer: ok => api.done(ok) });
        }
      },
      explain(it) {
        if (it.kind === 'chain') return 'نبدأ من المعلوم ونتبع السلسلة: ' + it.ordered.map(l => `${l.B} ← ${l.A} = ${l.val}`).join('، ') + `. إذن الجواب ${it.ans}.`;
        return `الجواب ${it.ans}: يحقق كل الشروط، أما بقية الخيارات فتخالف شرطاً واحداً على الأقل.`;
      },
    });
  },
});
