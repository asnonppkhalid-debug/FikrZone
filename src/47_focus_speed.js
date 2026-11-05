'use strict';
/* ============ عالم التركيز (5) + عالم السرعة (5) ============ */
MV.css(`
.field{position:relative;width:min(100%,330px);aspect-ratio:1;margin:10px auto;border:1px solid var(--line2);border-radius:14px;background:var(--surface);overflow:hidden;direction:ltr}
.field .it{position:absolute;display:grid;place-items:center;border:0;background:none;padding:0;cursor:pointer}
.field .it.mk{outline:3px solid var(--accent);border-radius:8px}
.field .it.ok{outline:3px solid var(--ok);border-radius:8px}.field .it.bad{outline:3px solid var(--bad);border-radius:8px}
.tgt{display:flex;gap:10px;align-items:center;justify-content:center;margin:6px 0}
.stroop{font-family:var(--f-disp);font-size:3.6rem;text-align:center;margin:18px 0;min-height:5rem}
.cue{display:inline-block;padding:6px 18px;border-radius:999px;border:1px solid var(--line2);font-weight:600;margin:6px 0}
.big2{display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:420px;margin:12px auto}
.big2 button{padding:22px 10px;font-size:1.3rem;border-radius:14px;border:1px solid var(--line2);background:var(--surface);color:var(--text);cursor:pointer}
.big2 button.ok{background:color-mix(in srgb,var(--ok) 55%,var(--surface))}.big2 button.bad{background:color-mix(in srgb,var(--bad) 55%,var(--surface))}
.eq{font-family:var(--f-disp);font-size:2.6rem;text-align:center;margin:16px 0;direction:ltr}
.dgrid{display:grid;gap:6px;max-width:300px;margin:6px auto;direction:ltr}
.dgrid .c{aspect-ratio:1;border-radius:8px;border:1px solid var(--line2);background:var(--surface);display:grid;place-items:center;padding:0;cursor:pointer}
.dgrid.ref .c{cursor:default;background:var(--surface2)}
.dgrid .c.mk{outline:3px solid var(--accent)}
.arena{position:relative;width:min(100%,360px);height:340px;margin:10px auto;border:1px solid var(--line2);border-radius:16px;background:var(--surface);overflow:hidden;touch-action:manipulation}
.arena .dot{position:absolute;width:64px;height:64px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 6px color-mix(in srgb,var(--accent) 30%,transparent);border:0;padding:0}
.gng{width:min(100%,340px);height:260px;margin:10px auto;border-radius:16px;border:1px solid var(--line2);background:var(--surface);display:grid;place-items:center;cursor:pointer;user-select:none;touch-action:manipulation}
.gng i{display:block;width:120px;height:120px;border-radius:50%}
`);

const WCOL = [{ n: 'أحمر', c: '#e0463a' }, { n: 'أزرق', c: '#3f8fe6' }, { n: 'أخضر', c: '#4fb858' }, { n: 'أصفر', c: '#e9c14f' }, { n: 'برتقالي', c: '#f0883e' }, { n: 'بنفسجي', c: '#9b7fe0' }];
const R_ = (r, a, b) => r.int(a, b);
function scatter(n, size, cell, r) { // مواضع بلا تداخل
  const cols = Math.ceil(Math.sqrt(n * 1.5)), rows = Math.ceil(n * 1.5 / cols), cw = size / cols, ch = size / rows, slots = r.shuffle(range(cols * rows)).slice(0, n);
  return slots.map(sl => ({ x: (sl % cols) * cw + (cw - cell) / 2 + r.int(-3, 3) * Math.max(0, (cw - cell) / 8), y: Math.floor(sl / cols) * ch + (ch - cell) / 2 + r.int(-3, 3) * Math.max(0, (ch - cell) / 8) }));
}

/* ============ ستروب ============ */
MV.define({
  id: 'stroop', name: 'لون الحبر', en: 'Stroop', realms: ['focus'], skills: ['attention', 'speed'], type: 'quiz', minutes: 4,
  blurb: 'كلمة تدل على لون مكتوبة بلون مختلف. اختر ما يُطلب منك: لون الحبر أو معنى الكلمة، وتجاهل الآخر.',
  rules: ['اقرأ السؤال أولاً: «لون الحبر» أم «معنى الكلمة»؟', 'تجاهل الجانب الآخر حتى لو كان أسرع إلى ذهنك.', 'لكل سؤال وقت محدد.'],
  levelNote: l => ['3 ألوان', '4 ألوان', '5 ألوان وتبديل السؤال', '6 ألوان وتبديل سريع', '6 ألوان ووقت قصير'][l - 1],
  selfTest() { return { ok: WCOL.length === 6 }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 14, quickRounds: 8, par: 3,
      timeLimit: (it, d) => MV.testMode ? 30 : Math.max(2.2, 5 - d * 0.28),
      make(diff, i, r) {
        const k = diff <= 1 ? 3 : diff <= 3 ? 4 : diff <= 5 ? 5 : 6, cs = WCOL.slice(0, k), word = r.pick(cs); let ink = word;
        if (r.chance(diff <= 1 ? 0.5 : 0.8)) ink = r.pick(cs.filter(c => c !== word));
        const ask = diff >= 4 && r.chance(0.4) ? 'word' : 'ink';
        return { cs, word, ink, ask };
      },
      render(box, it, api) {
        box.append(h('div', { style: 'text-align:center' }, h('span', { class: 'cue' }, it.ask === 'ink' ? 'ما لون الحبر؟' : 'ما معنى الكلمة؟')), h('div', { class: 'stroop', style: `color:${it.ink.c}` }, it.word.n));
        const ans = it.ask === 'ink' ? it.ink : it.word;
        kit.mc(box, { cols: it.cs.length > 4 ? 3 : 2, options: it.cs.map(c => ({ label: c.n, correct: c === ans })), onAnswer: ok => api.done(ok, { fast: true }) });
      },
      explain: it => `الإجابة: ${(it.ask === 'ink' ? it.ink : it.word).n}`,
    });
  },
});

/* ============ البحث البصري ============ */
MV.define({
  id: 'vsearch', name: 'البحث البصري', en: 'Visual Search', realms: ['focus'], skills: ['attention'], type: 'quiz', minutes: 4,
  blurb: 'اعثر على الشكل المطلوب وسط عشرات الأشكال المتشابهة بأسرع ما تستطيع.',
  rules: ['انظر إلى الشكل المطلوب في الأعلى.', 'ابحث عنه في الحقل واضغط عليه.', 'كلما ازداد عدد الأشكال وتشابهها صار البحث أصعب.'],
  levelNote: l => ['فروق لونية واضحة', 'أشكال أكثر', 'بحث مركّب (لون + شكل)', 'أشكال كثيرة متشابهة', 'حقل مزدحم ووقت قصير'][l - 1],
  selfTest() { return { ok: true }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 7,
      timeLimit: (it, d) => MV.testMode ? 30 : Math.max(6, 16 - d),
      make(diff, i, r) {
        const n = 10 + diff * 3, shapes = r.sample(kit.SHAPES, 4), cols = r.sample(kit.PAL, 4), t = { s: shapes[0], c: cols[0] }, conj = diff >= 4;
        const list = [];
        for (let k = 0; k < n - 1; k++) {
          if (!conj) list.push({ s: r.pick(shapes.slice(0, 1)), c: r.pick(cols.slice(1)) });
          else { const m = r.int(0, 2); list.push(m === 0 ? { s: t.s, c: r.pick(cols.slice(1)) } : m === 1 ? { s: r.pick(shapes.slice(1)), c: t.c } : { s: r.pick(shapes.slice(1)), c: r.pick(cols.slice(1)) }); }
        }
        const items = list.concat([t]); const pos = scatter(n, 330, 38, r); return { t, items: r.shuffle(items.map((x, k) => Object.assign({}, x, { tgt: x === t }))), pos };
      },
      render(box, it, api) {
        box.append(h('div', { class: 'tgt' }, h('span', null, 'ابحث عن'), kit.shapeSvg(it.t.s, it.t.c, 38)));
        const f = h('div', { class: 'field' }); box.append(f);
        it.items.forEach((x, k) => f.append(h('button', { class: 'it', 'data-ok': MV.testMode && x.tgt ? '1' : null, style: `left:${it.pos[k].x / 3.3}%;top:${it.pos[k].y / 3.3}%;width:38px;height:38px`, onClick: e => { [...f.children].forEach(c => c.disabled = true); e.currentTarget.classList.add(x.tgt ? 'ok' : 'bad'); if (!x.tgt) f.children[it.items.findIndex(z => z.tgt)].classList.add('ok'); api.done(x.tgt, { fast: true }); } }, kit.shapeSvg(x.s, x.c, 36))));
      },
      explain: () => 'الشكل المطلوب مؤطّر بالأخضر.',
    });
  },
});

/* ============ اكتشاف الفروق ============ */
MV.define({
  id: 'finddiff', name: 'اكتشاف الفروق', en: 'Spot the Difference', realms: ['focus'], skills: ['attention', 'vmem'], type: 'quiz', minutes: 5,
  blurb: 'شبكتان متقاربتان تختلفان في عدة خانات. حدّد كل الفروق بدقة دون أن تُخطئ.',
  rules: ['الشبكة العلوية هي المرجع، والسفلية هي التي تضغط عليها.', 'علّم كل خانة تظن أنها تختلف عن المرجع ثم اضغط «تأكيد».', 'الخانات المعلّمة خطأً تخصم من نتيجتك.'],
  levelNote: l => ['3×3 وفرقان', '4×4 وفرقان', '4×4 و3 فروق', '5×5 و3 فروق', '5×5 و4 فروق'][l - 1],
  selfTest() { return { ok: true }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 5, quickRounds: 3, par: 25,
      make(diff, i, r) {
        const g = diff < 2 ? 3 : diff < 7 ? 4 : 5, k = diff < 4 ? 2 : diff < 8 ? 3 : 4, shapes = r.sample(kit.SHAPES, 5), cols = r.sample(kit.PAL, 5);
        const a = range(g * g, () => ({ s: r.pick(shapes), c: r.pick(cols) })), ch = r.sample(range(g * g), k), b = a.map(x => Object.assign({}, x));
        ch.forEach(c => { if (r.chance(0.5)) b[c].s = r.pick(shapes.filter(x => x !== a[c].s)); else b[c].c = r.pick(cols.filter(x => x !== a[c].c)); });
        return { g, a, b, ch };
      },
      render(box, it, api) {
        const mk = new Set(); const sz = it.g === 5 ? 28 : 34;
        const mkGrid = (arr, ref) => h('div', { class: 'dgrid' + (ref ? ' ref' : ''), style: `grid-template-columns:repeat(${it.g},1fr);max-width:${it.g * (sz + 12)}px` }, arr.map((x, i) => h('button', { class: 'c', 'data-ok': MV.testMode && !ref && it.ch.includes(i) ? '1' : null, disabled: ref, onClick: e => { if (mk.has(i)) { mk.delete(i); e.currentTarget.classList.remove('mk'); } else { mk.add(i); e.currentTarget.classList.add('mk'); } } }, kit.shapeSvg(x.s, x.c, sz))));
        box.append(h('div', { class: 'muted small', style: 'text-align:center' }, 'المرجع'), mkGrid(it.a, true), h('div', { class: 'muted small', style: 'text-align:center;margin-top:6px' }, `علّم الخانات المختلفة (${it.ch.length} فروق)`));
        const g2 = mkGrid(it.b, false); box.append(g2);
        const go = h('button', { class: 'btn primary', id: 'fd-go', onClick: () => { go.disabled = true; let hit = 0, wrong = 0; [...g2.children].forEach((c, i) => { c.disabled = true; c.classList.remove('mk'); if (it.ch.includes(i)) { c.classList.add(mk.has(i) ? 'ok' : 'bad'); if (mk.has(i)) hit++; } else if (mk.has(i)) { c.classList.add('bad'); wrong++; } }); it.hit = hit; it.wrong = wrong; api.done(clamp((hit - wrong) / it.ch.length, 0, 1)); } }, 'تأكيد');
        box.append(h('div', { class: 'chtools' }, go));
        ctx.debug.solve = () => { [...g2.children].forEach((c, i) => { if (it.ch.includes(i) && !c.classList.contains('mk')) c.click(); }); go.click(); };
      },
      explain: it => `وجدت ${it.hit} من ${it.ch.length} وأخطأت في ${it.wrong}. الفروق الحقيقية مؤطّرة.`, explainAlways: true,
    });
  },
});

/* ============ الانتباه المستمر (A-X) ============ */
MV.define({
  id: 'cpt', name: 'المراقب اليقظ', en: 'Sustained Attention', realms: ['focus'], skills: ['attention'], type: 'reaction', minutes: 4,
  blurb: 'تظهر حروف متتابعة. اضغط فقط حين يظهر الحرف X مباشرة بعد A. يقيس قدرتك على الاستمرار في الانتباه.',
  rules: ['راقب الحروف المتتابعة بصمت.', 'اضغط «X بعد A» فقط حين يظهر X وكان الحرف السابق A.', 'ظهور X وحده أو A وحده ليس هدفاً — لا تضغط.'],
  levelNote: l => ['بطيء وأهداف واضحة', 'متوسط السرعة', 'أسرع', 'أسرع وأطول', 'سريع وطويل'][l - 1],
  selfTest() { const q = cptGen(RNG(2), 40); let t = 0; q.seq.forEach((x, i) => { if (i && x === 'X' && q.seq[i - 1] === 'A') t++; }); return { ok: t === q.targets.filter(Boolean).length && t >= 3 }; },
  run(ctx) {
    const L = ctx.level, len = ctx.quick ? 24 : [30, 36, 42, 50, 56][L - 1], ms = MV.testMode ? 200 : [1400, 1200, 1050, 950, 850][L - 1];
    const { seq, targets } = cptGen(ctx.rng, len);
    const stim = h('div', { class: 'nb-stim' }), msg = h('div', { class: 'mm-msg' }, 'اضغط فقط عندما يظهر X بعد A مباشرة'), cnt = h('div', { class: 'muted small ig-count', style: 'text-align:center' });
    const btn = h('button', { class: 'btn primary nb-btn', id: 'cpt-press', onClick: press }, 'X بعد A');
    mount(ctx.root, h('div', { class: 'stack' }, cnt, stim, btn, msg));
    let i = -1, pressed = false, hits = 0, miss = 0, fa = 0, cr = 0;
    function press() { if (i < 0 || pressed) return; pressed = true; stim.style.opacity = .55; Sound.play('click'); }
    ctx.listen(document, 'keydown', e => { if (e.code === 'Space') { e.preventDefault(); press(); } });
    function score() { if (i < 0) return; const t = targets[i]; if (t) { if (pressed) { hits++; ctx.correct(); } else { miss++; ctx.mistake(); } } else if (pressed) { fa++; ctx.mistake(); } else cr++; }
    function tick() {
      score(); i++; if (i >= len) return end();
      pressed = false; stim.style.opacity = 1; stim.textContent = seq[i]; cnt.textContent = `${i + 1} / ${len}`;
      ctx.timeout(() => { if (i < len) stim.textContent = ''; }, ms * 0.55);
    }
    function end() { const nT = targets.filter(Boolean).length, nN = len - nT, acc = ((nT ? hits / nT : 1) + (nN ? cr / nN : 1)) / 2; stim.textContent = ''; msg.textContent = `إصابات ${hits} من ${nT} · إنذارات كاذبة ${fa}`; btn.disabled = true; ctx.timeout(() => ctx.finish({ acc, items: len, mistakes: miss + fa, complexity: 2 + L * 1.6 }), 1300); }
    ctx.interval(tick, ms); tick();
    ctx.debug.solve = () => { if (i >= 0 && targets[i] && !pressed) press(); };
  },
});
function cptGen(r, len) {
  const L = ['A', 'B', 'C', 'K', 'X', 'M', 'T', 'Z'], seq = [], targets = [];
  while (seq.length < len) {
    if (seq.length + 2 <= len && r.chance(0.17)) { seq.push('A', 'X'); targets.push(false, true); continue; }
    let x; do { x = r.pick(L); } while (seq.length && seq[seq.length - 1] === 'A' && x === 'X'); seq.push(x); targets.push(false);
  }
  return { seq, targets };
}

/* ============ الانتباه الانتقائي: عدّ الأهداف ============ */
MV.define({
  id: 'counting', name: 'عدّ الأهداف', en: 'Selective Counting', realms: ['focus'], skills: ['attention', 'math'], type: 'quiz', minutes: 4,
  blurb: 'حقل مزدحم بالأشكال: عُدّ فقط الشكل المطلوب بلونه وتجاهل المشتتات المشابهة له.',
  rules: ['انظر إلى الهدف: شكل بلون محدّد.', 'عُدّ عدد مرّات ظهوره في الحقل فقط (لا الأشكال المشابهة).', 'اختر العدد الصحيح قبل انتهاء الوقت.'],
  levelNote: l => ['أهداف قليلة وفروق واضحة', 'أهداف أكثر', 'مشتتات مشابهة', 'حقل مزدحم', 'مزدحم ووقت قصير'][l - 1],
  selfTest() { return { ok: true }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 9,
      timeLimit: (it, d) => MV.testMode ? 30 : Math.max(7, 16 - d),
      make(diff, i, r) {
        const shapes = r.sample(kit.SHAPES, 4), cols = r.sample(kit.PAL, 4), t = { s: shapes[0], c: cols[0] }, nT = r.int(3, 5 + Math.floor(diff / 2)), nD = 10 + diff * 2;
        const items = range(nT, () => ({ s: t.s, c: t.c, tg: 1 }));
        for (let k = 0; k < nD; k++) { const m = diff >= 3 ? r.int(0, 2) : 2; items.push(m === 0 ? { s: t.s, c: r.pick(cols.slice(1)) } : m === 1 ? { s: r.pick(shapes.slice(1)), c: t.c } : { s: r.pick(shapes.slice(1)), c: r.pick(cols.slice(1)) }); }
        const pos = scatter(items.length, 330, 34, r), w = new Set([nT + 1, nT - 1, nT + 2, nT - 2].filter(v => v > 0)); const opts = r.shuffle([nT, ...r.sample([...w], 3)]);
        return { t, items: r.shuffle(items), pos, nT, opts };
      },
      render(box, it, api) {
        box.append(h('div', { class: 'tgt' }, h('span', null, 'عُدّ'), kit.shapeSvg(it.t.s, it.t.c, 34)));
        const f = h('div', { class: 'field' }); it.items.forEach((x, k) => f.append(h('div', { class: 'it', style: `left:${it.pos[k].x / 3.3}%;top:${it.pos[k].y / 3.3}%;width:34px;height:34px;cursor:default` }, kit.shapeSvg(x.s, x.c, 32)))); box.append(f);
        kit.mc(box, { cols: 4, options: it.opts.map(v => ({ label: String(v), correct: v === it.nT })), onAnswer: ok => api.done(ok) });
      },
      explain: it => `العدد الصحيح: ${it.nT}`,
    });
  },
});

/* ========================== السرعة ========================== */
MV.define({
  id: 'mentalmath', name: 'الحساب الذهني', en: 'Mental Math', realms: ['speed'], skills: ['math', 'speed'], type: 'quiz', minutes: 5,
  blurb: 'عمليات حسابية متدرّجة تُحلّ ذهنياً ضمن وقت محدد: من الجمع البسيط إلى العمليات المركّبة.',
  rules: ['احسب ذهنياً (دون ورقة) واكتب الناتج بلوحة الأرقام.', 'لكل مسألة وقت محدد.', 'الدقة أهم من التسرّع: الخطأ لا يُعوَّض بالسرعة.'],
  levelNote: l => ['جمع وطرح بسيطان', 'أعداد من رقمين', 'جدول الضرب', 'عمليات مختلطة', 'عمليات مركّبة'][l - 1],
  selfTest() { const r = RNG(6), o = []; for (let d = 0; d <= 10; d++) { const q = mmMake(d, r); o.push(Number.isInteger(q.ans)); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 12, quickRounds: 6, par: 7,
      timeLimit: (it, d) => MV.testMode ? 60 : 7 + d * 1.2,
      make: (d, i, r) => mmMake(d, r),
      render(box, it, api) {
        box.append(h('div', { class: 'eq' }, it.q + ' = ؟'));
        const np = kit.numpad(ctx, box, { neg: true, max: 6, onSubmit: v => { const ok = +v === it.ans; api.done(ok, { fast: ok }); np.el.style.opacity = .5; } });
        ctx.debug.solve = () => { np.set(it.ans); np.el.querySelector('.np-ok').click(); };
      },
      explain: it => `الناتج: ${it.ans}`,
    });
  },
});
function mmMake(d, r) {
  let a, b, c, q, ans;
  if (d <= 1) { a = r.int(3, 19); b = r.int(2, 12); const add = r.chance(0.6); if (!add && b > a) [a, b] = [b, a]; q = `${a} ${add ? '+' : '−'} ${b}`; ans = add ? a + b : a - b; }
  else if (d <= 3) { a = r.int(20, 99); b = r.int(11, 89); const add = r.chance(0.5); if (!add && b > a) [a, b] = [b, a]; q = `${a} ${add ? '+' : '−'} ${b}`; ans = add ? a + b : a - b; }
  else if (d <= 5) { a = r.int(3, 12); b = r.int(3, 12); q = `${a} × ${b}`; ans = a * b; }
  else if (d <= 7) { a = r.int(6, 15); b = r.int(3, 9); c = r.int(5, 40); const m = r.chance(0.5); q = m ? `${a} × ${b} + ${c}` : `${a} × ${b} − ${c}`; ans = m ? a * b + c : a * b - c; }
  else if (d <= 9) { a = r.int(3, 12); b = r.int(2, 9); c = r.int(2, 9); q = `(${a} + ${b}) × ${c}`; ans = (a + b) * c; }
  else { a = r.int(12, 25); b = r.int(3, 9); c = r.int(11, 40); const k = r.int(2, 9); q = r.chance(0.5) ? `${a} × ${b} − ${k} × ${k}` : `${c * k} ÷ ${k} + ${a}`; ans = q.includes('÷') ? c + a : a * b - k * k; }
  return { q, ans };
}

MV.define({
  id: 'qcompare', name: 'المقارنة الخاطفة', en: 'Quick Compare', realms: ['speed'], skills: ['math', 'speed'], type: 'quiz', minutes: 3,
  blurb: 'ناتجان في لمح البصر: أيهما أكبر؟ تقدير سريع بلا آلة حاسبة.',
  rules: ['ستُعرض عمليتان أو عددان.', 'اضغط على الأكبر (أو الأصغر عندما يُطلب ذلك).', 'الوقت قصير جداً: اعتمد على التقدير.'],
  levelNote: l => ['فرق واضح', 'فرق متوسط', 'فرق صغير', 'عمليات مختلفة', 'فرق ضئيل جداً'][l - 1],
  selfTest() { const r = RNG(1); for (let d = 0; d <= 10; d++) { const q = qcMake(d, r); if (q.a.v === q.b.v) return { ok: false }; } return { ok: true }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 14, quickRounds: 8, par: 2.5,
      timeLimit: (it, d) => MV.testMode ? 30 : Math.max(2.5, 5 - d * 0.2),
      make: (d, i, r) => qcMake(d, r),
      render(box, it, api) {
        box.append(h('div', { style: 'text-align:center' }, h('span', { class: 'cue' }, it.big ? 'أيهما الأكبر؟' : 'أيهما الأصغر؟')));
        const win = it.big ? (it.a.v > it.b.v ? it.a : it.b) : (it.a.v < it.b.v ? it.a : it.b);
        const g = h('div', { class: 'big2' }); box.append(g);
        [it.a, it.b].forEach(x => g.append(h('button', { 'data-ok': MV.testMode && x === win ? '1' : null, style: 'direction:ltr;font-family:var(--f-disp)', onClick: e => { [...g.children].forEach(c => c.disabled = true); const ok = x === win; e.currentTarget.classList.add(ok ? 'ok' : 'bad'); if (!ok) [...g.children].find((c, i) => [it.a, it.b][i] === win).classList.add('ok'); api.done(ok, { fast: true }); } }, x.t)));
      },
      explain: it => `${it.a.t} = ${it.a.v} ، ${it.b.t} = ${it.b.v}`,
    });
  },
});
function qcMake(d, r) {
  const gap = [30, 22, 15, 9, 6, 4, 3, 2, 2, 1, 1][d];
  const mk = () => { const t = r.int(0, d >= 3 ? 2 : 1); if (t === 0) { const a = r.int(10, 60), b = r.int(10, 60); return { t: `${a} + ${b}`, v: a + b }; } if (t === 1) { const a = r.int(3, 12), b = r.int(3, 12); return { t: `${a} × ${b}`, v: a * b }; } const a = r.int(30, 99), b = r.int(5, 40); return { t: `${a} − ${b}`, v: a - b }; };
  for (let t = 0; t < 400; t++) { const a = mk(), b = mk(); const df = Math.abs(a.v - b.v); if (df > 0 && df <= gap && (df >= Math.max(1, gap / 2) || d >= 8)) return { a, b, big: r.chance(0.6) }; }
  const a = { t: '12 × 7', v: 84 }, b = { t: '9 × 8', v: 72 }; return { a, b, big: true };
}

/* ============ اذهب / لا تذهب ============ */
MV.define({
  id: 'gonogo', name: 'اذهب / لا تذهب', en: 'Go / No-Go', realms: ['speed', 'focus'], skills: ['speed', 'attention'], type: 'reaction', minutes: 3,
  blurb: 'اضغط بسرعة عند ظهور الدائرة الخضراء، وامتنع تماماً عند ظهور الحمراء. اختبار للسرعة وكبح الاندفاع.',
  rules: ['دائرة خضراء = اضغط فوراً.', 'دائرة حمراء = لا تضغط.', 'في المستويات العليا قد تنعكس القاعدة في منتصف الجولة — سيُعلَن ذلك بوضوح.'],
  levelNote: l => ['بطيء', 'متوسط', 'أسرع', 'سريع مع محفّزات حمراء أكثر', 'سريع مع انعكاس القاعدة'][l - 1],
  selfTest() { return { ok: true }; },
  run(ctx) {
    const L = ctx.level, n = ctx.quick ? 20 : [30, 36, 40, 44, 50][L - 1], on = MV.testMode ? 150 : [900, 780, 680, 600, 540][L - 1], gap = MV.testMode ? 60 : 420, pNo = [0.25, 0.3, 0.3, 0.4, 0.4][L - 1];
    const seq = range(n, () => ctx.rng.chance(pNo) ? 'no' : 'go'); const flipAt = L === 5 ? Math.floor(n / 2) : -1;
    const stim = h('div', { class: 'gng', id: 'gng', onPointerdown: press }, h('i', { style: 'visibility:hidden' }));
    const msg = h('div', { class: 'mm-msg' }, 'الأخضر = اضغط · الأحمر = لا تضغط'), cnt = h('div', { class: 'muted small ig-count', style: 'text-align:center' });
    mount(ctx.root, h('div', { class: 'stack' }, cnt, stim, msg));
    const dot = stim.firstChild; let i = -1, pressed = false, shown = false, hits = 0, fa = 0, miss = 0, cr = 0, flipped = false, rts = [], t0 = 0;
    const isGo = k => flipped ? seq[k] === 'no' : seq[k] === 'go';
    function press(e) { if (e) e.preventDefault(); if (!shown || pressed) return; pressed = true; if (isGo(i)) rts.push(performance.now() - t0); Sound.play('click'); }
    ctx.listen(document, 'keydown', e => { if (e.code === 'Space') { e.preventDefault(); press(); } });
    function judge() { if (i < 0) return; if (isGo(i)) { if (pressed) { hits++; ctx.correct(); } else { miss++; ctx.mistake(); } } else if (pressed) { fa++; ctx.mistake(); } else cr++; }
    function next() {
      judge(); i++; shown = false; dot.style.visibility = 'hidden';
      if (i >= n) return end();
      if (i === flipAt) { flipped = true; msg.textContent = 'انعكست القاعدة! الآن الأحمر = اضغط والأخضر = لا تضغط'; ctx.pause(); ctx.timeout(() => { ctx.resume(); show(); }, MV.testMode ? 200 : 2200); return; }
      ctx.timeout(show, gap);
    }
    function show() { pressed = false; shown = true; t0 = performance.now(); dot.style.background = seq[i] === 'go' ? '#4fb858' : '#e0463a'; dot.style.visibility = 'visible'; cnt.textContent = `${i + 1} / ${n}`; ctx.timeout(next, on); }
    function end() { const nGo = seq.filter((x, k) => (k >= flipAt && flipAt >= 0 ? x === 'no' : x === 'go')).length, nNo = n - nGo; const acc = ((nGo ? hits / nGo : 1) + (nNo ? cr / nNo : 1)) / 2; msg.textContent = `إصابات ${hits} · إنذارات كاذبة ${fa} · فوات ${miss}`; ctx.timeout(() => ctx.finish({ acc, items: n, mistakes: fa + miss, complexity: 2 + L * 1.7 }), 1300); }
    ctx.timeout(next, 800);
    ctx.debug.solve = () => { if (shown && !pressed && isGo(i)) press(); };
  },
});

/* ============ تبديل القواعد ============ */
MV.define({
  id: 'ruleswitch', name: 'تبديل القواعد', en: 'Rule Switching', realms: ['speed', 'abstract'], skills: ['speed', 'attention', 'solving'], type: 'quiz', minutes: 4,
  blurb: 'القاعدة تتغيّر بين الحين والآخر: مرة اللون، ومرة الشكل، ومرة الحجم. استجب للقاعدة الحالية فقط.',
  rules: ['انظر إلى لافتة القاعدة في أعلى الشاشة.', 'أجب عن الصفة المطلوبة فقط وتجاهل الباقي.', 'تتبدّل القاعدة دون إنذار طويل — ابقَ متيقظاً.'],
  levelNote: l => ['قاعدتان وتبديل بطيء', 'قاعدتان وتبديل أسرع', 'ثلاث قواعد', 'ثلاث قواعد وتبديل متكرر', 'ثلاث قواعد ووقت قصير'][l - 1],
  selfTest() { return { ok: true }; },
  run(ctx) {
    const RULES = { color: { n: 'اللون', opts: [['أحمر', '#e0463a'], ['أزرق', '#3f8fe6']] }, shape: { n: 'الشكل', opts: [['دائرة', 'circle'], ['مربع', 'square']] }, size: { n: 'الحجم', opts: [['كبير', 'big'], ['صغير', 'small']] } };
    let cur = 'color', left = 0;
    kit.itemGame(ctx, {
      rounds: 16, quickRounds: 8, par: 2.5,
      timeLimit: (it, d) => MV.testMode ? 30 : Math.max(2.2, 4.2 - d * 0.17),
      make(diff, i, r) {
        const pool = diff >= 4 ? ['color', 'shape', 'size'] : ['color', 'shape'], run = diff >= 6 ? r.int(1, 2) : diff >= 2 ? r.int(2, 3) : r.int(3, 4);
        if (left <= 0) { cur = r.pick(pool.filter(x => x !== cur)); left = run; } left--;
        return { rule: cur, color: r.int(0, 1), shape: r.int(0, 1), size: r.int(0, 1) };
      },
      render(box, it, api) {
        const R = RULES[it.rule], col = RULES.color.opts[it.color][1], sz = it.size ? 40 : 90;
        box.append(h('div', { style: 'text-align:center' }, h('span', { class: 'cue' }, 'القاعدة: ' + R.n)), h('div', { style: 'height:120px;display:grid;place-items:center' }, kit.shapeSvg(it.shape ? 'square' : 'circle', col, sz)));
        const ans = it[it.rule]; kit.mc(box, { cols: 2, options: R.opts.map((o, k) => ({ label: o[0], correct: k === ans })), onAnswer: ok => api.done(ok, { fast: true }) });
      },
      explain: it => `القاعدة كانت «${RULES[it.rule].n}».`,
    });
  },
});

/* ============ الاستجابة السريعة ============ */
MV.define({
  id: 'reaction', name: 'الاستجابة السريعة', en: 'Quick Reaction', realms: ['speed'], skills: ['speed'], type: 'reaction', minutes: 3,
  blurb: 'تظهر دائرة في موضع عشوائي بعد انتظار غير متوقّع. المسها بأسرع ما يمكن، ولا تتسرّع قبل ظهورها.',
  rules: ['انتظر حتى تظهر الدائرة المضيئة.', 'المسها فوراً — يُقاس زمن استجابتك بالمللي ثانية.', 'اللمس المبكر (قبل الظهور) يُعدّ خطأً ويُعاد الاختبار.'],
  levelNote: l => `هدف الاستجابة ${[650, 560, 480, 420, 370][l - 1]} م.ث`,
  selfTest() { return { ok: true }; },
  run(ctx) {
    const par = [650, 560, 480, 420, 370][ctx.level - 1], n = ctx.quick ? 5 : 8, fast = MV.testMode;
    const arena = h('div', { class: 'arena', id: 'arena', onPointerdown: arenaTap }), msg = h('div', { class: 'mm-msg' }, 'انتظر…'), cnt = h('div', { class: 'muted small ig-count', style: 'text-align:center' });
    mount(ctx.root, h('div', { class: 'stack' }, cnt, arena, msg));
    let k = 0, scores = [], rts = [], state = 'idle', t0 = 0, dotEl = null, early = 0;
    function arm() {
      if (k >= n) return end(); cnt.textContent = `${k + 1} / ${n}`; state = 'wait'; msg.textContent = 'انتظر…'; arena.textContent = '';
      ctx.timeout(() => { if (state !== 'wait') return; state = 'go'; dotEl = h('button', { class: 'dot', 'data-ok': '1', style: `left:${ctx.rng.int(3, 74)}%;top:${ctx.rng.int(3, 70)}%`, onPointerdown: hit }); arena.append(dotEl); t0 = performance.now(); msg.textContent = 'الآن!'; }, fast ? 150 : ctx.rng.int(1100, 3200));
    }
    function hit(e) { e.stopPropagation(); if (state !== 'go') return; const rt = performance.now() - t0; state = 'idle'; rts.push(rt); const sc = rt <= par ? 1 : clamp(1 - (rt - par) / (par * 1.6), 0.1, 1); scores.push(sc); sc >= .5 ? ctx.correct() : ctx.mistake(); arena.textContent = ''; msg.textContent = `${Math.round(rt)} م.ث`; k++; ctx.timeout(arm, 800); }
    function arenaTap() { if (state === 'wait') { state = 'idle'; early++; ctx.mistake(); msg.textContent = 'مبكّر جداً! سنعيد المحاولة'; ctx.timeout(arm, 1100); } }
    function end() { const med = rts.slice().sort((a, b) => a - b)[Math.floor(rts.length / 2)] || 0, acc = Math.max(0.05, avg(scores) - early * 0.04); msg.textContent = `الوسيط ${Math.round(med)} م.ث · مبكر ${early}`; ctx.timeout(() => ctx.finish({ acc, items: n, mistakes: early, complexity: 2 + ctx.level * 1.5 }), 1200); }
    arm();
    ctx.debug.solve = () => { if (state === 'go' && dotEl) dotEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); };
  },
});
