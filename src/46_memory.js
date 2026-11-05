'use strict';
/* ============ عالم الذاكرة: 6 ألعاب ============ */
MV.css(`
.mm-grid{display:grid;gap:8px;max-width:330px;margin:12px auto;direction:ltr}
.mm-c{aspect-ratio:1;border-radius:12px;background:var(--surface);border:1px solid var(--line2);cursor:pointer;display:grid;place-items:center;transition:background .12s,transform .12s;padding:0;color:var(--text);font-size:1.4rem}
.mm-c.lit{background:var(--accent);transform:scale(.94)}
.mm-c.ok{background:color-mix(in srgb,var(--ok) 60%,var(--surface))}.mm-c.bad{background:color-mix(in srgb,var(--bad) 60%,var(--surface))}
.mm-c.tapped{background:color-mix(in srgb,var(--accent) 35%,var(--surface))}
.mm-c:disabled{cursor:default}
.mm-msg{text-align:center;min-height:1.8em;margin:6px 0;font-weight:600}
.mm-big{font-family:var(--f-disp);font-size:4rem;text-align:center;min-height:5.5rem;direction:ltr;color:var(--accent-t)}
.cards{display:grid;gap:8px;max-width:400px;margin:10px auto;direction:ltr}
.card{aspect-ratio:3/4;border-radius:12px;border:1px solid var(--line2);background:repeating-linear-gradient(45deg,var(--surface2),var(--surface2) 6px,var(--surface) 6px,var(--surface) 12px);display:grid;place-items:center;cursor:pointer;padding:0;position:relative}
.card .fc{display:none}
.card.up{background:var(--surface)}.card.up .fc{display:grid}
.card.done{opacity:.45;background:color-mix(in srgb,var(--ok) 25%,var(--surface))}.card.done .fc{display:grid}
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px auto;max-width:460px}
.wchip{padding:9px 16px;border-radius:999px;border:1px solid var(--line2);background:var(--surface);font-size:1.05rem;cursor:pointer;color:var(--text)}
.wchip.on{background:var(--accent);color:var(--ink);border-color:var(--accent)}
.wchip.good{background:color-mix(in srgb,var(--ok) 55%,var(--surface))}.wchip.miss{outline:2px dashed var(--warn)}.wchip.fa{background:color-mix(in srgb,var(--bad) 55%,var(--surface))}
.nb-stim{font-family:var(--f-disp);font-size:5.5rem;text-align:center;min-height:8rem;display:grid;place-items:center}
.nb-btn{display:block;margin:10px auto;min-width:220px;padding:16px 24px;font-size:1.2rem}
`);

MV.WORDS = {
  animals: ['أسد', 'حصان', 'جمل', 'ذئب', 'أرنب', 'غزال', 'ثعلب', 'فيل', 'نمر', 'بقرة', 'حمار', 'قرد'],
  food: ['تفاح', 'خبز', 'عنب', 'رز', 'تمر', 'جبن', 'عسل', 'بيض', 'لحم', 'سمك', 'موز', 'رمان'],
  home: ['كرسي', 'طاولة', 'سرير', 'باب', 'نافذة', 'مصباح', 'سجادة', 'مرآة', 'ساعة', 'خزانة', 'وسادة', 'مفتاح'],
  nature: ['جبل', 'نهر', 'بحر', 'شجرة', 'وردة', 'غيمة', 'صحراء', 'نجمة', 'قمر', 'بحيرة', 'وادي', 'شمس'],
  body: ['يد', 'عين', 'قلب', 'رأس', 'قدم', 'أذن', 'فم', 'أنف', 'ظهر', 'كتف', 'إصبع', 'ركبة'],
  clothes: ['قميص', 'حذاء', 'قبعة', 'معطف', 'وشاح', 'جورب', 'حزام', 'ثوب', 'قفاز', 'سروال', 'عباءة', 'خاتم'],
  vehicles: ['سيارة', 'قطار', 'طائرة', 'سفينة', 'دراجة', 'حافلة', 'قارب', 'شاحنة', 'مروحية', 'عربة', 'صاروخ', 'مترو'],
  tools: ['مطرقة', 'مسمار', 'منشار', 'مفك', 'فأس', 'إبرة', 'مقص', 'حبل', 'سلم', 'دلو', 'مجرفة', 'فرشاة'],
};

/* ---------- سلّم الامتداد (span): يصعد بالنجاح وينزل بالخطأ ---------- */
const spanAcc = (peak, start) => clamp(0.28 + 0.17 * (peak - start + 1), 0.15, 1);
function staircase(ctx, o) {
  const total = ctx.quick ? o.quickTrials : o.trials; let span = o.start, i = 0, peak = o.start - 1, okN = 0;
  const dots = h('span', { class: 'ig-dots' }), cnt = h('span', { class: 'ig-count' }), box = h('div', { class: 'ig-box' });
  const dEls = range(total, () => h('i')); dEls.forEach(d => dots.append(d));
  mount(ctx.root, h('div', { class: 'ig' }, h('div', { class: 'ig-head' }, cnt, dots), box));
  function next() {
    if (i >= total) return ctx.finish({ acc: spanAcc(peak, o.start), items: total, complexity: clamp(peak * o.cx, 1, 10), mistakes: total - okN });
    cnt.textContent = `${i + 1} / ${total}`; clear(box);
    o.trial(box, span, ok => {
      dEls[i].className = ok ? 'ok' : 'bad'; i++;
      if (ok) { ctx.correct(); okN++; peak = Math.max(peak, span); span++; } else { ctx.mistake(); span = Math.max(o.min, span - 1); }
      ctx.timeout(next, ok ? 600 : 1500);
    }, i);
  }
  next();
}

/* ============ ذاكرة المواقع ============ */
MV.define({
  id: 'spatialmem', name: 'ذاكرة المواقع', en: 'Spatial Memory', realms: ['memory', 'spatial'], skills: ['vmem', 'spatial'], type: 'memory', minutes: 5,
  blurb: 'تومض مربّعات في الشبكة بتسلسل معيّن؛ أعد النقر عليها بالترتيب نفسه. يطول التسلسل كلما نجحت.',
  rules: ['راقب المربّعات المضيئة وتذكّر ترتيبها.', 'ثم انقر عليها بالترتيب ذاته.', 'نجاحك يطيل التسلسل التالي، وخطؤك يقصّره — لا تُحسب الأخطاء عقوبة بل تُستخدم لضبط الصعوبة.'],
  levelNote: l => `شبكة ${[3, 3, 4, 4, 5][l - 1]}×${[3, 3, 4, 4, 5][l - 1]} وتسلسل يبدأ من ${[3, 4, 4, 5, 6][l - 1]}`,
  selfTest() { return { ok: spanAcc(5, 5) > spanAcc(4, 5) && spanAcc(8, 5) <= 1 }; },
  run(ctx) {
    const n = [3, 3, 4, 4, 5][ctx.level - 1], start = [3, 4, 4, 5, 6][ctx.level - 1], speed = MV.testMode ? 80 : [800, 700, 650, 600, 520][ctx.level - 1];
    staircase(ctx, {
      trials: 9, quickTrials: 5, start, min: 2, cx: 1.3,
      trial(box, span, cb) {
        const cells = range(n * n); const seq = []; let last = -1;
        while (seq.length < Math.min(span, n * n)) { const c = ctx.rng.pick(cells); if (c !== last && (span > n * n || !seq.includes(c))) { seq.push(c); last = c; } }
        const msg = h('div', { class: 'mm-msg' }, 'راقب الترتيب…'), grid = h('div', { class: 'mm-grid', style: `grid-template-columns:repeat(${n},1fr)` });
        const btns = cells.map(c => h('button', { class: 'mm-c', 'data-c': c, disabled: true, onClick: () => tap(c) }));
        btns.forEach(b => grid.append(b)); box.append(msg, grid);
        let phase = 'show', pos = 0;
        let k = 0; const play = () => { if (k >= seq.length) { phase = 'input'; msg.textContent = 'دورك: كرّر الترتيب'; btns.forEach(b => b.disabled = false); return; } btns[seq[k]].classList.add('lit'); ctx.timeout(() => { btns[seq[k]].classList.remove('lit'); k++; ctx.timeout(play, MV.testMode ? 40 : 220); }, speed); };
        ctx.timeout(play, MV.testMode ? 100 : 700);
        function tap(c) {
          if (phase !== 'input') return;
          const ok = c === seq[pos]; btns[c].classList.add(ok ? 'ok' : 'bad'); Sound.play(ok ? 'click' : 'bad');
          if (!ok) { phase = 'done'; btns.forEach(b => b.disabled = true); msg.textContent = 'ليس هذا الترتيب'; seq.forEach((s, j) => ctx.timeout(() => { btns[s].classList.add('lit'); }, j * 250)); return cb(false); }
          pos++; if (pos >= seq.length) { phase = 'done'; btns.forEach(b => b.disabled = true); msg.textContent = 'ممتاز!'; cb(true); }
        }
        ctx.debug.solve = () => { if (phase === 'input') { const c = seq[pos]; btns[c].click(); } };
      },
    });
  },
});

/* ============ ذاكرة الأرقام ============ */
MV.define({
  id: 'seqmem', name: 'ذاكرة الأرقام', en: 'Digit Span', realms: ['memory'], skills: ['wmem'], type: 'memory', minutes: 5,
  blurb: 'تظهر أرقام واحداً بعد الآخر؛ أعدها بالترتيب نفسه — وفي المستويات الأعلى بالعكس.',
  rules: ['ستظهر أرقام واحداً تلو الآخر، ركّز ولا تكتب أثناء العرض.', 'ثم اكتبها كما ظهرت (أو معكوسة حين يُطلب منك ذلك).', 'يتغيّر الطول تلقائياً بحسب أدائك.'],
  levelNote: l => ['تسلسل أمامي يبدأ بـ 4', 'أمامي يبدأ بـ 5', 'أمامي وخلفي', 'خلفي أغلب الأحيان', 'خلفي وأطول'][l - 1],
  selfTest() { return { ok: true }; },
  run(ctx) {
    const L = ctx.level, start = [4, 5, 4, 4, 5][L - 1];
    staircase(ctx, {
      trials: 8, quickTrials: 4, start, min: 2, cx: 1.1,
      trial(box, span, cb, idx) {
        const back = L >= 3 && (L >= 4 ? idx % 3 !== 0 : idx % 2 === 1);
        const digs = []; while (digs.length < span) { const d = ctx.rng.int(0, 9); if (d !== digs[digs.length - 1]) digs.push(d); }
        const msg = h('div', { class: 'mm-msg' }, back ? 'ستكتب الأرقام بالعكس' : 'ستكتب الأرقام بالترتيب'), big = h('div', { class: 'mm-big' }, '');
        box.append(msg, big);
        const ans = (back ? digs.slice().reverse() : digs).join(''); let k = 0, np = null, phase = 'show';
        const show = () => { if (k >= digs.length) { big.textContent = ''; msg.textContent = back ? 'اكتبها بالعكس' : 'اكتبها بالترتيب'; phase = 'input'; np = kit.numpad(ctx, box, { max: span + 1, onSubmit: submit }); return; } big.textContent = digs[k]; ctx.timeout(() => { big.textContent = ''; k++; ctx.timeout(show, MV.testMode ? 30 : 250); }, MV.testMode ? 80 : 800); };
        ctx.timeout(show, MV.testMode ? 100 : 900);
        function submit(v) { if (phase !== 'input') return; phase = 'done'; const ok = v === ans; msg.textContent = ok ? 'صحيح' : `الصحيح: ${ans.split('').join(' ')}`; big.textContent = ''; np.el.style.opacity = .4; cb(ok); }
        ctx.debug.solve = () => { if (phase === 'input' && np) { np.set(ans); np.el.querySelector('.np-ok').click(); } };
      },
    });
  },
});

/* ============ ذاكرة الأشكال (ما الذي تغيّر؟) ============ */
MV.define({
  id: 'vismem', name: 'ما الذي تغيّر؟', en: 'Change Detection', realms: ['memory', 'focus'], skills: ['vmem', 'attention'], type: 'quiz', minutes: 5,
  blurb: 'شبكة من الأشكال الملوّنة تُعرض لثوانٍ ثم تختفي وتعود وقد تغيّر شكل واحد. حدّده.',
  rules: ['احفظ مواقع الأشكال وألوانها قبل أن تُخفى.', 'ستعود الشبكة وقد تغيّر عنصر واحد (شكله أو لونه).', 'اضغط على الخانة التي تغيّرت.'],
  levelNote: l => ['أشكال قليلة ووقت طويل', 'أشكال أكثر', 'شبكة أكبر', 'وقت أقصر', 'شبكة كبيرة بوقت قصير'][l - 1],
  selfTest() { return { ok: true }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 12,
      make(diff, i, r) {
        const g = diff >= 6 ? 4 : 3, cnt = Math.min(g * g, 3 + Math.floor(diff * 0.7) + (g === 4 ? 2 : 0)), shapes = r.sample(kit.SHAPES, 5), cols = r.sample(kit.PAL, 5);
        const cells = r.sample(range(g * g), cnt), items = Array(g * g).fill(null);
        cells.forEach(c => items[c] = { s: r.pick(shapes), c: r.pick(cols) });
        const ch = r.pick(cells), o = items[ch]; const nw = Object.assign({}, o);
        if (r.chance(0.5)) { nw.s = r.pick(shapes.filter(x => x !== o.s)); } else nw.c = r.pick(cols.filter(x => x !== o.c));
        const after = items.slice(); after[ch] = nw;
        return { g, items, after, ch, study: MV.testMode ? 300 : clamp(4200 - diff * 260, 1500, 4200) };
      },
      render(box, it, api) {
        const title = kit.title('احفظ الأشكال ومواقعها'), tb = h('div', { class: 'tbar on' }, h('i', { style: 'width:100%;transition:width ' + it.study + 'ms linear' }));
        const grid = h('div', { class: 'mm-grid', style: `grid-template-columns:repeat(${it.g},1fr)` });
        const draw = (arr, active) => { grid.textContent = ''; arr.forEach((x, i) => grid.append(h('button', { class: 'mm-c', disabled: !active, 'data-ok': MV.testMode && active && i === it.ch ? '1' : null, onClick: () => { if (!active) return; [...grid.children].forEach(c => c.disabled = true); grid.children[i].classList.add(i === it.ch ? 'ok' : 'bad'); if (i !== it.ch) grid.children[it.ch].classList.add('ok'); api.done(i === it.ch); } }, x ? kit.shapeSvg(x.s, x.c, 40) : ''))); };
        box.append(title, tb, grid); draw(it.items, false);
        requestAnimationFrame(() => requestAnimationFrame(() => { tb.firstChild.style.width = '0%'; }));
        ctx.timeout(() => { draw(it.items.map(x => x ? { s: 'circle', c: 'rgba(120,130,140,.25)' } : null), false); title.firstChild.textContent = '…'; tb.remove(); ctx.timeout(() => { title.firstChild.textContent = 'أي خانة تغيّرت؟'; draw(it.after, true); }, 900); }, it.study);
      },
      explain: it => 'الخانة المميّزة هي التي تغيّرت.',
    });
  },
});

/* ============ مطابقة البطاقات ============ */
MV.define({
  id: 'pairs', name: 'مطابقة البطاقات', en: 'Card Pairs', realms: ['memory'], skills: ['vmem', 'planning'], type: 'memory', minutes: 4,
  blurb: 'اقلب بطاقتين في كل مرة وتذكّر أماكنها لتجد كل الأزواج المتطابقة بأقل عدد من المحاولات.',
  rules: ['اضغط بطاقتين: إن تطابقتا بقيتا مكشوفتين.', 'إن لم تتطابقا انقلبتا ثانيةً فتذكّر موضعهما.', 'كلما قلّت محاولاتك ارتفعت نتيجتك.'],
  levelNote: l => `${[6, 8, 10, 12, 15][l - 1]} أزواج`,
  selfTest() { return { ok: true }; },
  run(ctx) {
    const np = [6, 8, 10, 12, 15][ctx.level - 1], cols = np <= 6 ? 4 : np <= 10 ? 4 : 5;
    const combos = []; kit.SHAPES.forEach(s => kit.PAL.forEach(c => combos.push([s, c])));
    const pick = ctx.rng.sample(combos.filter(([s, c], i) => i % 3 !== 1), np), deck = ctx.rng.shuffle(pick.concat(pick).map((x, i) => ({ id: pick.indexOf(x), s: x[0], c: x[1] })));
    let open = [], attempts = 0, matched = 0, lock = false;
    const stat = h('div', { class: 'mm-msg' }), grid = h('div', { class: 'cards', style: `grid-template-columns:repeat(${cols},1fr)` });
    const cards = deck.map((d, i) => { const b = h('button', { class: 'card', 'data-id': d.id, 'aria-label': 'بطاقة', onClick: () => flip(i) }, h('div', { class: 'fc' }, kit.shapeSvg(d.s, d.c, 40))); grid.append(b); return b; });
    const hintB = ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', id: 'pr-hint', onClick: doHint }, 'تلميح') : null;
    mount(ctx.root, h('div', { class: 'stack' }, stat, grid, h('div', { class: 'chtools' }, hintB)));
    const upd = () => { stat.className = 'mm-msg pstat'; stat.textContent = ''; stat.append(h('span', null, 'محاولات ', h('bdi', null, String(attempts))), h('span', null, 'أزواج ', h('bdi', null, `${matched} / ${np}`))); }; upd();
    function flip(i) {
      if (lock || cards[i].classList.contains('up') || cards[i].classList.contains('done')) return;
      cards[i].classList.add('up'); open.push(i); Sound.play('click');
      if (open.length === 2) {
        attempts++; const [a, b] = open; lock = true;
        if (deck[a].id === deck[b].id) { cards[a].classList.replace('up', 'done'); cards[b].classList.replace('up', 'done'); open = []; matched++; lock = false; ctx.correct(); upd(); if (matched === np) fin(); }
        else { ctx.timeout(() => { cards[a].classList.remove('up'); cards[b].classList.remove('up'); open = []; lock = false; upd(); }, 800); upd(); }
      }
    }
    function doHint() { if (lock) return; ctx.hint(); const ids = deck.map((d, i) => i).filter(i => !cards[i].classList.contains('done') && !cards[i].classList.contains('up')); const i = ctx.rng.pick(ids); lock = true; cards[i].classList.add('up'); ctx.timeout(() => { cards[i].classList.remove('up'); lock = false; }, 900); }
    function fin() { const acc = clamp(1 - (attempts - np) / (np * 2.2), 0.2, 1); stat.textContent = `انتهيت في ${attempts} محاولة (الأفضل النظري ${np})`; ctx.timeout(() => ctx.finish({ acc, items: np, mistakes: attempts - np, parTime: np * 7, complexity: 2 + np / 2.5 }), 1200); }
    ctx.debug.solve = () => { if (lock) return; if (open.length === 1) { const j = deck.findIndex((d, k) => d.id === deck[open[0]].id && k !== open[0]); cards[j].click(); } else { const i = cards.findIndex(c => !c.classList.contains('done')); if (i >= 0) cards[i].click(); } };
  },
});

/* ============ ذاكرة N-back ============ */
MV.define({
  id: 'nback', name: 'ذاكرة N-back', en: 'N-Back', realms: ['memory', 'focus'], skills: ['wmem', 'attention'], type: 'reaction', minutes: 5,
  blurb: 'تظهر حروف متتابعة. اضغط «تطابق» كلما كان الحرف الحالي هو نفسه الذي ظهر قبل N خطوات. تمرين كلاسيكي للذاكرة العاملة.',
  rules: ['N=1: قارن مع الحرف السابق مباشرة؛ N=2: مع الحرف قبل السابق؛ وهكذا.', 'اضغط «تطابق» (أو مفتاح المسافة) عند التطابق فقط.', 'تُحسب الإصابات والإنذارات الكاذبة معاً — الضغط العشوائي لا ينفع.'],
  levelNote: l => `N = ${[1, 1, 2, 2, 3][l - 1]}`,
  selfTest() { const s = nbGen(RNG(1), 2, 20); let t = 0; s.seq.forEach((x, i) => { if (i >= 2 && x === s.seq[i - 2]) t++; }); return { ok: t === s.targets.filter(Boolean).length && t > 2, out: [t] }; },
  run(ctx) {
    const N = [1, 1, 2, 2, 3][ctx.level - 1], len = ctx.quick ? 14 : [16, 20, 22, 26, 28][ctx.level - 1], ms = MV.testMode ? 220 : [2400, 2200, 2400, 2100, 2300][ctx.level - 1];
    const { seq, targets } = nbGen(ctx.rng, N, len);
    const stim = h('div', { class: 'nb-stim' }), msg = h('div', { class: 'mm-msg' }, `اضغط «تطابق» إن كان الحرف نفسه كما قبل ${N === 1 ? 'خطوة واحدة' : N + ' خطوات'}`);
    const btn = h('button', { class: 'btn primary nb-btn', id: 'nb-press', onClick: press }, 'تطابق');
    const cnt = h('div', { class: 'muted small ig-count', style: 'text-align:center' });
    mount(ctx.root, h('div', { class: 'stack' }, cnt, stim, btn, msg));
    let i = -1, pressed = false, hits = 0, miss = 0, fa = 0, cr = 0, cur = false;
    function press() { if (i < 0 || pressed || cur === null) return; pressed = true; stim.style.opacity = .6; Sound.play('click'); }
    ctx.listen(document, 'keydown', e => { if (e.code === 'Space') { e.preventDefault(); press(); } });
    function score() {
      if (i < 0) return; const t = targets[i];
      if (t) { if (pressed) { hits++; ctx.correct(); } else { miss++; ctx.mistake(); } } else if (pressed) { fa++; ctx.mistake(); } else cr++;
    }
    function tick() {
      score(); i++;
      if (i >= len) return end();
      pressed = false; stim.style.opacity = 1; stim.textContent = seq[i]; cnt.textContent = `${i + 1} / ${len}`; cur = targets[i];
      ctx.timeout(() => { if (i < len) { stim.textContent = ''; } }, ms * 0.7);
    }
    function end() {
      const nT = targets.filter(Boolean).length, nN = targets.length - nT; const hr = nT ? hits / nT : 1, cr2 = nN ? cr / nN : 1; const acc = (hr + cr2) / 2;
      stim.textContent = ''; msg.textContent = `إصابات ${hits} من ${nT} · إنذارات كاذبة ${fa}`; btn.disabled = true;
      ctx.timeout(() => ctx.finish({ acc, items: len, mistakes: miss + fa, complexity: 2 + N * 2.3 }), 1400);
    }
    ctx.interval(tick, ms); tick();
    ctx.debug.solve = () => { if (i >= 0 && targets[i] && !pressed) press(); };
  },
});
function nbGen(r, N, len) {
  const L = ['ب', 'ت', 'د', 'ر', 'س', 'ع', 'ك', 'م', 'ن', 'ه'], seq = [], targets = [];
  for (let i = 0; i < len; i++) {
    if (i >= N && r.chance(0.32)) { seq.push(seq[i - N]); targets.push(true); }
    else { let x; do { x = r.pick(L); } while (i >= N && x === seq[i - N]); seq.push(x); targets.push(false); }
  }
  return { seq, targets };
}

/* ============ ذاكرة الكلمات ============ */
MV.define({
  id: 'wordmem', name: 'ذاكرة الكلمات', en: 'Word Memory', realms: ['memory', 'language'], skills: ['wmem', 'verbal'], type: 'quiz', minutes: 5,
  blurb: 'تُعرض عليك قائمة كلمات ثم تُخفى. بين كلمات أكثر، حدّد التي رأيتها فقط — والكلمات المشابهة فخّ!',
  rules: ['احفظ الكلمات المعروضة (حاول ربطها بصور أو قصة).', 'ثم اختر من القائمة الجديدة الكلمات التي رأيتها.', 'الاختيار الخاطئ يخصم من نتيجتك كما يضيف الاختيار الصحيح.'],
  levelNote: l => ['قوائم قصيرة وكلمات متباعدة', 'قوائم أطول', 'كلمات من التصنيف نفسه', 'قوائم طويلة', 'قوائم طويلة وفخاخ متشابهة'][l - 1],
  selfTest() { const o = []; const r = RNG(3); for (let d = 0; d <= 10; d++) { const q = wmMake(d, r); o.push(q.test.length === q.study.length * 2 && new Set(q.test).size === q.test.length && q.study.every(w => q.test.includes(w))); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 5, quickRounds: 3, par: 30,
      make: (diff, i, r) => wmMake(diff, r),
      render(box, it, api) {
        const tb = h('div', { class: 'tbar on' }, h('i', { style: `width:100%;transition:width ${it.time}ms linear` })), title = kit.title('احفظ هذه الكلمات'), chips = h('div', { class: 'chips' }, it.study.map(w => h('span', { class: 'wchip' }, w)));
        box.append(title, tb, chips); requestAnimationFrame(() => requestAnimationFrame(() => { tb.firstChild.style.width = '0%'; }));
        ctx.timeout(() => {
          clear(box); box.append(kit.title('اختر الكلمات التي رأيتها', `هناك ${it.study.length} كلمات صحيحة`));
          const sel = new Set(), wrap = h('div', { class: 'chips' }), chs = it.test.map(w => { const c = h('button', { class: 'wchip', 'data-ok': MV.testMode && it.study.includes(w) ? '1' : null, onClick: () => { if (sel.has(w)) { sel.delete(w); c.classList.remove('on'); } else { sel.add(w); c.classList.add('on'); } } }, w); wrap.append(c); return c; });
          const go = h('button', { class: 'btn primary', id: 'wm-go', onClick: () => { go.disabled = true; chs.forEach(c => c.disabled = true); let hit = 0, fa = 0; it.test.forEach((w, j) => { const old = it.study.includes(w), s = sel.has(w); chs[j].classList.remove('on'); if (old && s) { hit++; chs[j].classList.add('good'); } else if (old) chs[j].classList.add('miss'); else if (s) { fa++; chs[j].classList.add('fa'); } }); it.hit = hit; it.fa = fa; api.done(clamp((hit - fa) / it.study.length, 0, 1), { fast: false }); } }, 'تأكيد');
          box.append(wrap, h('div', { class: 'chtools' }, go));
          ctx.debug.solve = () => { chs.forEach((c, j) => { if (it.study.includes(it.test[j]) && !c.classList.contains('on')) c.click(); }); go.click(); };
        }, it.time);
      },
      explain: it => `أصبت ${it.hit} من ${it.study.length} وأخطأت في ${it.fa}. الكلمات الصحيحة: ${it.study.join('، ')}.`,
      explainAlways: true,
    });
  },
});
function wmMake(diff, r) {
  const n = 4 + Math.floor(diff / 2), cats = Object.keys(MV.WORDS), c1 = r.pick(cats), same = diff >= 4;
  let study;
  if (diff >= 4) { const c2 = r.pick(cats.filter(c => c !== c1)); study = r.sample(MV.WORDS[c1], Math.ceil(n / 2)).concat(r.sample(MV.WORDS[c2], Math.floor(n / 2))); }
  else { const cs = r.sample(cats, Math.min(cats.length, n)); study = cs.map(c => r.pick(MV.WORDS[c])).slice(0, n); }
  study = [...new Set(study)];
  const pool = [].concat(...cats.map(c => MV.WORDS[c])).filter(w => !study.includes(w));
  const near = same ? [].concat(...[...new Set(study.map(w => cats.find(c => MV.WORDS[c].includes(w))))].map(c => MV.WORDS[c])).filter(w => !study.includes(w)) : [];
  const fresh = r.sample(near, Math.min(near.length, Math.ceil(study.length * (diff >= 8 ? 1 : 0.6))));
  const rest = r.sample(pool.filter(w => !fresh.includes(w)), study.length - fresh.length);
  return { study, test: r.shuffle(study.concat(fresh, rest)), time: MV.testMode ? 300 : Math.round((study.length * (1500 - diff * 70) + 1500)), kind: 'wm' };
}
