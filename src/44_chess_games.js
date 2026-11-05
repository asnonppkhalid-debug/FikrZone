'use strict';
/* ============ الشطرنج: لعبة كاملة ضد الحاسوب + ألغاز كش مات ============ */
MV.css(`
.chwrap{position:relative;width:min(100%,440px);margin:0 auto;padding:7px;border-radius:16px;background:linear-gradient(145deg,#2b3a40,#1b262b);box-shadow:0 10px 28px rgba(0,0,0,.32),inset 0 0 0 1px rgba(255,255,255,.07)}
:root[data-theme=light] .chwrap{background:linear-gradient(145deg,#8a7a5c,#6a5d44)}
.chb{display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);aspect-ratio:1;direction:ltr;border-radius:8px;overflow:hidden;box-shadow:0 0 0 1px rgba(0,0,0,.35)}
.chb .sq{min-width:0;min-height:0;overflow:hidden;position:relative;display:grid;place-items:center;border:0;padding:0;cursor:pointer;background:#ead9b8;transition:background .12s}
.chb .sq.d{background:#6f8f86}
.chb .sq.last::before,.chb .sq.sel::before,.chb .sq.chk::before,.chb .sq.hnt::before,.chb .sq.mk::before{content:'';position:absolute;inset:0;pointer-events:none}
.chb .sq.last::before{background:rgba(240,200,70,.42)}
.chb .sq.sel::before{background:rgba(70,150,230,.55)}
.chb .sq.chk::before{background:radial-gradient(circle,rgba(230,60,50,.95) 0,rgba(230,60,50,.55) 55%,rgba(230,60,50,0) 78%)}
.chb .sq.hnt::before{background:rgba(40,190,160,.6)}
.chb .sq.mk::before{background:rgba(250,120,60,.55)}
.chb .co{position:absolute;font-size:clamp(8px,2.4vw,11px);font-weight:700;line-height:1;pointer-events:none;opacity:.8;color:#6f8f86}
.chb .sq.d .co{color:#ead9b8}
.chb .co.f{bottom:2px;right:3px}.chb .co.r{top:2px;left:3px}
.chb .pc{pointer-events:none;display:block;width:94%;height:94%;position:relative;z-index:1;filter:drop-shadow(0 1.5px 1.5px rgba(0,0,0,.35))}
.chb .pc.w{--pf:#fbf6e8;--ps:#2a2116}
.chb .pc.b{--pf:#2a3038;--ps:#0c0e11}
.chb .pc *{fill:var(--pf);stroke:var(--ps);stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round}
.chb .pc .ln{fill:none}
.chb .pc.b .ln{stroke:#9aa4b0}
.chb .pc .ey{fill:var(--ps);stroke:none}
.chb .dot{position:absolute;width:28%;height:28%;border-radius:50%;background:rgba(15,25,30,.34);pointer-events:none;z-index:2}
.chb .dot.cap{width:90%;height:90%;background:none;border:4px solid rgba(15,25,30,.34)}
.charr{position:absolute;left:7px;top:7px;right:7px;bottom:7px;pointer-events:none;z-index:4;width:calc(100% - 14px);height:calc(100% - 14px)}
.chpromo{position:absolute;inset:0;display:none;place-items:center;background:rgba(0,0,0,.55);border-radius:16px;z-index:6}
.chpromo.on{display:grid}
.chpromo div{display:flex;gap:10px;background:var(--surface);padding:12px;border-radius:12px}
.chpromo button{width:62px;height:62px;border-radius:10px;border:1px solid var(--line2);background:#6f8f86;padding:4px;display:grid;place-items:center}
.chpromo .pc{width:100%;height:100%}
.chpromo .pc.w{--pf:#fbf6e8;--ps:#2a2116}.chpromo .pc.b{--pf:#2a3038;--ps:#0c0e11}
.chpromo .pc *{fill:var(--pf);stroke:var(--ps);stroke-width:1.5;stroke-linejoin:round}
.chpromo .pc .ln{fill:none}
.chstat{text-align:center;margin:10px 0;min-height:1.6em;font-weight:600}
.chstat .think{display:inline-flex;gap:4px;margin-inline-start:6px;vertical-align:middle}
.chstat .think i{width:6px;height:6px;border-radius:50%;background:var(--accent,var(--text));animation:chdot 1s infinite ease-in-out}
.chstat .think i:nth-child(2){animation-delay:.15s}.chstat .think i:nth-child(3){animation-delay:.3s}
@keyframes chdot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
.chmoves{text-align:center;color:var(--muted);font-size:.85rem;direction:ltr;min-height:1.4em;margin-bottom:6px}
.chtools{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:8px}
`);

const CHG = (() => {
  /* ---- قطع SVG أصلية (مجموعة موحّدة بدل رموز الخط) ---- */
  const PIECES = {
    p: '<path d="M22.5 8.2a5.2 5.2 0 0 1 2.6 9.7c3.4 1.7 5.4 5 5.4 9.4 0 2.2-.5 3.6-1.6 5.2h3.6v3.5H12.5v-3.5h3.6c-1.1-1.6-1.6-3-1.6-5.2 0-4.4 2-7.7 5.4-9.4a5.2 5.2 0 0 1 2.6-9.7z"/><path class="ln" d="M14 39.5h17"/>',
    r: '<path d="M11.5 39.5h22v-4.2l-3-2.2V19.6l3-2.6V9.4h-5v3.2h-3.6V9.4h-3.8v3.2h-3.6V9.4h-5V17l3 2.6v13.5l-3 2.2z"/><path class="ln" d="M15.5 19.6h14M15.5 33h14"/>',
    n: '<path d="M12.5 39.5c-.3-6.8 1.4-11.8 6.4-15.6-2.5-.7-4.4-1.9-6.5-3.7.2-2.2 2-4.6 4.7-6.3l.4-4.7 3.4 2.6c7.2.4 12.3 5.5 12.3 14.2 0 4.6-.5 9.5-.6 13.5z"/><circle class="ey" cx="19.6" cy="14.2" r="1.45"/><path class="ln" d="M12.8 21.3c1.4.8 2.6 1 3.9.6"/>',
    b: '<path d="M12 39.5h21v-3.4c-2.1-.9-3.2-2.3-3.6-3.6H15.6c-.4 1.3-1.5 2.7-3.6 3.6z"/><path d="M16.2 32.5c-1.2-4.3-.8-8.3 2.2-11.6a6 6 0 1 1 8.2 0c3 3.3 3.4 7.3 2.2 11.6z"/><circle cx="22.5" cy="8.6" r="2.4"/><path class="ln" d="M22.5 14.6v5.2M20 17.2h5"/>',
    q: '<path d="M10.5 39.5h24v-3.8c-1-1.3-1.7-2.7-1.9-4.4l3.9-15.2-6.9 8.6-2.1-12-3.5 11-3.5-11-2.1 12-6.9-8.6 3.9 15.2c-.2 1.7-.9 3.1-1.9 4.4z"/><circle cx="8.8" cy="14.5" r="2.3"/><circle cx="15.3" cy="9.8" r="2.3"/><circle cx="22.5" cy="8" r="2.3"/><circle cx="29.7" cy="9.8" r="2.3"/><circle cx="36.2" cy="14.5" r="2.3"/><path class="ln" d="M13.5 35.8h18"/>',
    k: '<path d="M10.5 39.5h24v-3.4c-1.7-1.4-2.6-3.1-2.8-5.2 4.4-2.8 6.1-6.2 4.6-10.2-1.5-3.8-6.1-6.1-13.8-6.1s-12.3 2.3-13.8 6.1c-1.5 4 .2 7.4 4.6 10.2-.2 2.1-1.1 3.8-2.8 5.2z"/><path d="M22.5 4v9.2M18.4 7.6h8.2"/><path class="ln" d="M13.5 36h18"/>',
  };
  const pieceSvg = p => {
    const t = p.toLowerCase(), w = p === p.toUpperCase();
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 45 45'); el.setAttribute('class', 'pc ' + (w ? 'w' : 'b')); el.setAttribute('aria-hidden', 'true');
    el.innerHTML = PIECES[t]; return el;
  };
  const g = pieceSvg;   // للتوافق مع الاستدعاءات السابقة
  function boardUI(o) { // o: {flip, canMove(), onMove(m), onSquare(i), coords}
    const el = h('div', { class: 'chb' }), wrap = h('div', { class: 'chwrap' }, el), promo = h('div', { class: 'chpromo' });
    const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSvg.setAttribute('class', 'charr'); arrowSvg.setAttribute('viewBox', '0 0 800 800');
    wrap.append(arrowSvg, promo);
    const cells = [];
    let st = null, sel = -1, dests = [], last = null, hint = [], marks = [], arrows = [], flip = !!o.flip;
    const build = () => {
      el.innerHTML = ''; cells.length = 0;
      for (let v = 0; v < 64; v++) {
        const rr = Math.floor(v / 8), ff = v % 8, i = flip ? rr * 8 + (7 - ff) : (7 - rr) * 8 + ff;
        const c = h('button', { class: 'sq', 'data-sq': CH.name(i), 'aria-label': CH.name(i), onClick: () => click(i) });
        cells.push({ el: c, i, ff, rr }); el.append(c);
      }
    };
    function drawArrows() {
      const cx = i => { const f = i & 7; return (flip ? 7 - f : f) * 100 + 50; }, cy = i => { const r = i >> 3; return (flip ? r : 7 - r) * 100 + 50; };
      arrowSvg.innerHTML = '<defs><marker id="chah" markerWidth="5" markerHeight="5" refX="3.2" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5z" fill="rgba(250,130,40,.92)"/></marker></defs>' +
        arrows.map(([f, t]) => { const x1 = cx(f), y1 = cy(f), x2 = cx(t), y2 = cy(t), L = Math.hypot(x2 - x1, y2 - y1) || 1, ex = x2 - (x2 - x1) / L * 34, ey = y2 - (y2 - y1) / L * 34; return `<line x1="${x1}" y1="${y1}" x2="${ex}" y2="${ey}" stroke="rgba(250,130,40,.88)" stroke-width="15" stroke-linecap="round" marker-end="url(#chah)"/>`; }).join('');
    }
    function render() {
      const chk = st && CH.inCheck(st) ? st.b.indexOf(st.turn === 'w' ? 'K' : 'k') : -1;
      cells.forEach(({ el: c, i, ff, rr }) => {
        const p = st.b[i], dark = ((i >> 3) + (i & 7)) % 2 === 0, d = dests.find(m => m.t === i);
        c.className = 'sq' + (dark ? ' d' : '') + (sel === i ? ' sel' : '') + (last && (last.f === i || last.t === i) ? ' last' : '') + (chk === i ? ' chk' : '') + (hint.includes(i) ? ' hnt' : '') + (marks.includes(i) ? ' mk' : '');
        c.textContent = '';
        if (o.coords !== false) { if (rr === 7) c.append(h('span', { class: 'co f' }, 'abcdefgh'[i & 7])); if (ff === 0) c.append(h('span', { class: 'co r' }, String((i >> 3) + 1))); }
        if (p) c.append(pieceSvg(p));
        if (d) c.append(h('i', { class: 'dot' + (d.cap ? ' cap' : '') }));
      });
      drawArrows();
    }
    function choosePromo(list) {
      promo.innerHTML = '';
      promo.append(h('div', null, list.map(m => h('button', { 'data-promo': m.p.toLowerCase(), 'aria-label': m.p, onClick: () => { promo.classList.remove('on'); sel = -1; dests = []; o.onMove(m); } }, pieceSvg(m.p)))));
      promo.classList.add('on');
    }
    function click(i) {
      if (o.onSquare) o.onSquare(i);
      if (!st || !o.canMove() || promo.classList.contains('on')) return;
      const p = st.b[i], mine = p && CH.isW(p) === (st.turn === 'w'), here = dests.filter(m => m.t === i);
      if (sel >= 0 && here.length) {
        if (here.length > 1) return choosePromo(here);
        sel = -1; dests = []; return o.onMove(here[0]);
      }
      if (mine) { sel = i; dests = CH.legal(st).filter(m => m.f === i); } else { sel = -1; dests = []; }
      render();
    }
    build();
    return {
      el: wrap,
      set(s, l) { st = s; last = l || null; sel = -1; dests = []; hint = []; marks = []; arrows = []; promo.classList.remove('on'); render(); },
      hint(sqs) { hint = sqs; render(); },
      marks(sqs) { marks = sqs || []; render(); },
      arrows(list) { arrows = list || []; drawArrows(); },
      flip(v) { flip = !!v; build(); render(); },
      play(m) { sel = -1; dests = []; o.onMove(m); },
    };
  }

  /* ---- سلّم الخصوم (تقديرات إيلو داخلية — تُعايَر بمباريات ذاتية بين المستويات) ---- */
  const OPP = [
    { elo: 400, depth: 1, noise: 500, time: 200, name: 'مبتدئ جداً', note: 'يتحرك شبه عشوائياً ويترك قطعاً' },
    { elo: 600, depth: 1, noise: 200, time: 300, name: 'مبتدئ', note: 'يأخذ المجاني لكنه لا يحسب' },
    { elo: 850, depth: 2, noise: 150, time: 700, name: 'مبتدئ متقدّم', note: 'يرى نقلتين ويخطئ أحياناً' },
    { elo: 1050, depth: 2, noise: 40, time: 1000, name: 'هاوٍ', note: 'يحسب بدقة معقولة' },
    { elo: 1250, depth: 3, noise: 60, time: 1600, name: 'هاوٍ متقدّم', note: 'يرى التكتيك البسيط' },
    { elo: 1500, depth: 4, noise: 0, time: 2600, name: 'لاعب نادٍ', note: 'يحسب 4 نقلات بدقة' },
  ];
  const LV_OPP = [1, 2, 3, 4, 5];            // مستوى الصعوبة التكيّفي (1–5) → فهرس الخصم
  const oppFor = lv => OPP[LV_OPP[clamp(lv, 1, 5) - 1]];
  return { boardUI, OPP, LV_OPP, oppFor, g, pieceSvg };
})();
MV.chg = CHG;

/* ---------- تصنيف إيلو (Elo) ضد خصوم التطبيق ---------- */
const ChessElo = {
  START: 800,
  rec() { const c = D().chess || (D().chess = {}); if (!c.hist) c.hist = []; if (!c.opp) c.opp = {}; if (!c.course) c.course = {}; if (c.games == null) c.games = 0; if (c.peak == null) c.peak = 0; if (c.elo === undefined) c.elo = null; return c; },
  cur() { const c = this.rec(); return Math.round(c.elo == null ? this.START : c.elo); },
  provisional() { return this.rec().games < 10; },
  expected(a, b) { return 1 / (1 + Math.pow(10, (b - a) / 400)); },
  /* score: 1 فوز، 0.5 تعادل، 0 خسارة */
  apply(oppElo, score) {
    const c = this.rec(), before = c.elo == null ? this.START : c.elo;
    const K = c.games < 10 ? 40 : c.games < 30 ? 32 : 24;
    const after = Math.max(100, before + K * (score - this.expected(before, oppElo)));
    c.elo = after; c.games++; c.peak = Math.max(c.peak, Math.round(after));
    c.hist.push({ ts: Date.now(), elo: Math.round(after), opp: oppElo, s: score }); if (c.hist.length > 300) c.hist.shift();
    const r = c.opp[oppElo] || (c.opp[oppElo] = { w: 0, d: 0, l: 0 }); if (score === 1) r.w++; else if (score === 0.5) r.d++; else r.l++;
    Store.save();
    return { before: Math.round(before), after: Math.round(after), delta: Math.round(after) - Math.round(before), K };
  },
  /* الخصم الأنسب للاعب الآن: أقرب خصم لتصنيفه (أو أعلى منه قليلاً) */
  suggest() { const e = this.cur(); let bi = 0; CHG.OPP.forEach((o, i) => { if (Math.abs(o.elo - (e + 60)) < Math.abs(CHG.OPP[bi].elo - (e + 60))) bi = i; }); return bi; },
  band(e) { return e < 600 ? 'مبتدئ' : e < 900 ? 'مبتدئ متقدّم' : e < 1200 ? 'هاوٍ' : e < 1500 ? 'هاوٍ متقدّم' : e < 1800 ? 'لاعب نادٍ' : 'قوي'; },
};
MV.ChessElo = ChessElo;

MV.define({
  id: 'chess', name: 'الشطرنج', en: 'Chess', realms: ['strategy'], skills: ['planning', 'decision'], type: 'board', minutes: 15, canSave: true, longSession: true,
  blurb: 'مباراة شطرنج كاملة بقواعدها (تبييت، أخذ «بالمرور»، ترقية) ضد حاسوب بتصنيف إيلو معروف. كل مباراة تحدّث تصنيفك.',
  rules: ['تلعب ضد الحاسوب بلون يُختار عشوائياً؛ الأبيض يبدأ. الحاسوب يأخذ وقتاً للتفكير كاللاعب البشري.', 'اضغط القطعة ثم المربع الذي تريد الانتقال إليه — تظهر لك النقلات القانونية فقط.', 'لكل مستوى خصم تصنيف إيلو تقديري، ونتيجة المباراة (فوز/تعادل/خسارة) تغيّر تصنيفك بحسب قوة الخصم.', 'تنتهي المباراة بالكش مات أو التعادل أو الاستسلام (خسارة)، أو بعد 80 نقلة منك فيُحكم بالمادة. يمكنك حفظ المباراة والعودة إليها.'],
  levelNote: l => ['خصم مبتدئ يخطئ كثيراً', 'يرى نقلتين ويخطئ أحياناً', 'يحسب بدقة معقولة', 'يحسب 3 نقلات', 'خصم قوي (4 نقلات)'][l - 1] + ` — تصنيفه ≈ ${CHG.oppFor(l).elo}`,
  selfTest() {
    const out = []; let s = CH.fromFEN(CH.START), seen = {}, plies = 0;
    while (plies < 60) { const oc = CH.outcome(s, seen); if (oc) break; const b = CH.best(s, { depth: 1, time: 200, noise: 100 }); if (!b || !CH.legal(s).some(m => CH.sameMove(m, b.move))) return { ok: false, out: ['illegal', plies] }; s = CH.make(s, b.move); const k = CH.posKey(s); seen[k] = (seen[k] || 0) + 1; plies++; }
    out.push(plies);
    const m = CH.fromFEN('6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1'); out.push(CH.matesIn(m, 1).length);
    // تحقق من معادلة إيلو: فوز على خصم مساوٍ يرفع ≈ K/2
    const e = ChessElo.expected(1000, 1000), e2 = ChessElo.expected(1400, 1000);
    out.push(e, +e2.toFixed(3));
    return { ok: plies > 10 && CH.matesIn(m, 1).length === 1 && Math.abs(e - 0.5) < 1e-9 && e2 > 0.9 && e2 < 0.92, out };
  },
  run(ctx) {
    const sv = ctx.saved;
    let oi = ctx.opts && ctx.opts.opp != null ? ctx.opts.opp : (sv && sv.oi != null ? sv.oi : CHG.LV_OPP[clamp(ctx.level, 1, 5) - 1]);
    const cfg = CHG.OPP[oi];
    let state, seen = {}, hist = [], pw, moves = 0, over = false, busy = false, resignArmed = false;
    if (sv) { state = CH.fromFEN(sv.fen); pw = sv.pw; seen = sv.seen; hist = sv.hist; moves = sv.moves; }
    else { pw = ctx.rng.chance(0.5); state = CH.fromFEN(CH.START); seen[CH.posKey(state)] = 1; }
    const mineTurn = () => (state.turn === 'w') === pw;
    const stat = h('div', { class: 'chstat' }), ml = h('div', { class: 'chmoves' });
    const ui = CHG.boardUI({ flip: !pw, canMove: () => !over && !busy && mineTurn(), onMove: m => apply(m, true) });
    const hintB = ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', id: 'ch-hint', onClick: doHint }, 'تلميح') : null;
    const resB = h('button', { class: 'btn ghost sm', id: 'ch-resign', onClick: () => { if (over) return; if (!resignArmed) { resignArmed = true; resB.textContent = 'اضغط للتأكيد'; ctx.timeout(() => { resignArmed = false; resB.textContent = 'استسلام'; }, 3000); } else end({ r: pw ? 'b' : 'w', why: 'استسلمت' }, true); } }, 'استسلام');
    const oppTag = h('div', { class: 'muted small', style: 'text-align:center;margin-bottom:6px' }, `الخصم: تصنيف ≈ ${cfg.elo} · تصنيفك ${ChessElo.cur()}${ChessElo.provisional() ? ' (مؤقّت)' : ''}`);
    mount(ctx.root, h('div', { class: 'stack' }, oppTag, stat, ui.el, ml, h('div', { class: 'chtools' }, hintB, resB)));
    const showMoves = () => { ml.textContent = hist.slice(-6).join('  '); };
    const persist = () => ctx.save({ fen: CH.toFEN(state), pw, seen, hist, moves, oi });
    function say() {
      if (over) { stat.textContent = ''; return; }
      stat.textContent = ''; if (mineTurn()) stat.append(CH.inCheck(state) ? 'كش! دورك' : 'دورك');
      else stat.append('الحاسوب يفكّر', h('span', { class: 'think' }, h('i'), h('i'), h('i')));
    }
    /* تفكير بشري: نحسب النقلة فوراً ثم ننتظر مدة عشوائية قبل تنفيذها */
    function oppMove(first) {
      busy = true;
      const wait = MV.testMode ? 40 : (first ? 1300 : 900) + Math.round(ctx.rng.f() * 1500);
      const t0 = performance.now();
      ctx.timeout(() => {
        const r = CH.best(state, Object.assign({ rng: ctx.rng }, cfg));
        const rest = Math.max(0, wait - (performance.now() - t0));
        ctx.timeout(() => { busy = false; if (r && !over) apply(r.move, false); }, rest);
      }, 60);
    }
    function apply(m, byMe) {
      hist.push(CH.san(state, m)); state = CH.make(state, m);
      const k = CH.posKey(state); seen[k] = (seen[k] || 0) + 1; ui.set(state, m); ctx.sound(m.cap ? 'bad' : 'click');
      if (byMe) moves++;
      showMoves(); const oc = CH.outcome(state, seen);
      if (oc) return end(oc);
      if (moves >= 80 && byMe) return adjudicate();
      persist(); say();
      if (!mineTurn()) oppMove(false);
    }
    function adjudicate() {
      const cp = CH.evaluate(state) * (mineTurn() ? 1 : -1);
      end(cp > 400 ? { r: pw ? 'w' : 'b', why: 'تفوّق ساحق بالمادة بعد 80 نقلة', adj: 1 } : cp < -400 ? { r: pw ? 'b' : 'w', why: 'تأخّر كبير بالمادة بعد 80 نقلة', adj: 1 } : { r: 'draw', why: 'تعادل بعد 80 نقلة' });
    }
    function end(oc, resign) {
      over = true; ctx.clearSave();
      const win = oc.r === (pw ? 'w' : 'b'), draw = oc.r === 'draw';
      const score = win ? 1 : draw ? 0.5 : 0;
      const el = ctx.assess ? null : ChessElo.apply(cfg.elo, score);
      const acc = win ? 1 : draw ? 0.55 : resign ? 0.1 : 0.22;
      stat.textContent = (win ? 'فزت! ' : draw ? 'تعادل. ' : 'خسرت. ') + oc.why + (el ? ` — تصنيفك ${el.after} (${el.delta >= 0 ? '+' : ''}${el.delta})` : '');
      if (!win) ctx.mistake(); else { ctx.correct(); if (!resign && !oc.adj) { const st = D().stats || (D().stats = {}); st.chessWins = (st.chessWins || 0) + 1; Store.save(); } }
      const summary = el ? `التصنيف: ${el.before} ← ${el.after} (${el.delta >= 0 ? '+' : ''}${el.delta}) أمام خصم ≈ ${cfg.elo}` : '';
      ctx.timeout(() => ctx.finish({ acc, items: Math.max(1, moves), complexity: ctx.level * 2, mistakes: win ? 0 : 1, summary }), MV.testMode ? 200 : 1800);
    }
    function doHint() {
      if (over || busy || !mineTurn()) return; ctx.hint();
      const r = CH.best(state, { depth: 2, time: 600 }); if (r) ui.hint([r.move.f, r.move.t]);
    }
    ui.set(state, null); showMoves(); say();
    if (!mineTurn()) oppMove(true);
    ctx.debug.state = () => state; ctx.debug.pw = () => pw; ctx.debug.over = () => over; ctx.debug.opp = () => cfg.elo;
    ctx.debug.autoMove = () => { if (over || busy || !mineTurn()) return false; const r = CH.best(state, { depth: 1, time: 100 }); ui.play(r.move); return true; };
  },
});

MV.define({
  id: 'chesspuzzle', name: 'ألغاز الكش مات', en: 'Chess Puzzles', realms: ['strategy', 'logic'], skills: ['planning', 'solving'], type: 'quiz', minutes: 6,
  blurb: 'مواضع حقيقية يتحقق منها المحرّك: أوجد النقلة (أو النقلتين) التي تفرض كش مات على الخصم مهما أجاب.',
  rules: ['الدور عليك. أوجد نقلة تُنهي المباراة بالكش مات.', 'في ألغاز «مات في نقلتين» العب النقلة الأولى ثم سيرد الخصم، وبعدها أنهِ المات.', 'كل لغز له حل صحيح يتحقق منه محرّك الشطرنج — لا تخمين.'],
  levelNote: l => ['مات في نقلة بسيط', 'مات في نقلة مع قطع كثيرة', 'مات في نقلة صعب', 'مات في نقلتين', 'مات في نقلتين صعب'][l - 1],
  selfTest() {
    const bad = []; let c1 = 0, c2 = 0;
    for (const [fen, n] of CHBANK) {
      const s = CH.fromFEN(fen), a = CH.matesIn(s, 1);
      if (n === 1) { c1++; if (!a.length) bad.push(fen); } else { c2++; if (a.length || !CH.matesIn(s, 2).length) bad.push(fen); }
    }
    return { ok: bad.length === 0 && c1 > 50 && c2 > 50, out: [c1, c2, bad.slice(0, 2)] };
  },
  run(ctx) {
    const used = new Set();
    kit.itemGame(ctx, {
      rounds: 6, quickRounds: 3, par: 30,
      make(diff, i, r) {
        const want = clamp(diff, 1, 10);
        let pool = CHBANK.filter(e => Math.abs(e[2] - want) <= 1 && !used.has(e[0]));
        if (!pool.length) pool = CHBANK.filter(e => !used.has(e[0]));
        const e = r.pick(pool); used.add(e[0]);
        const s = CH.fromFEN(e[0]); return { fen: e[0], n: e[1], state: s, sols: CH.matesIn(s, e[1]), par: e[1] === 1 ? 25 : 55 };
      },
      render(box, it, api) {
        const w = it.state.turn === 'w'; let st = it.state, phase = 1, locked = false;
        const stat = h('div', { class: 'chstat' }, it.n === 1 ? 'مات في نقلة واحدة' : 'مات في نقلتين');
        box.append(kit.title(`الدور على ${w ? 'الأبيض' : 'الأسود'}`, 'أوجد الكش مات'), stat);
        const ui = CHG.boardUI({
          flip: !w, canMove: () => !locked,
          onMove(m) {
            if (it.n === 1) { locked = true; const ok = it.sols.some(x => CH.sameMove(x, m)); st = CH.make(st, m); ui.set(st, m); it.played = CH.san(it.state, m); api.done(ok); return; }
            if (phase === 1) {
              const ok = it.sols.some(x => CH.sameMove(x, m)); it.played = CH.san(st, m); st = CH.make(st, m); ui.set(st, m);
              if (!ok) { locked = true; return api.done(false); }
              phase = 2; locked = true; stat.textContent = 'الخصم يردّ…';
              ctx.timeout(() => { const rep = CH.legal(st); const rr = ctx.rng.pick(rep); st = CH.make(st, rr); ui.set(st, rr); locked = false; stat.textContent = 'أنهِ المات الآن'; }, 600);
            } else {
              locked = true; const ok = CH.matesIn(st, 1).some(x => CH.sameMove(x, m)); st = CH.make(st, m); ui.set(st, m); api.done(ok);
            }
          },
        });
        box.append(ui.el);
        ui.set(st, null);
        kit.hintBtn(ctx, box, () => { const ms = phase === 1 ? it.sols : CH.matesIn(st, 1); if (ms.length) ui.hint([ms[0].f]); });
        ctx.debug.solve = () => { if (phase === 1) ui.play(it.sols[0]); else ui.play(CH.matesIn(st, 1)[0]); };
      },
      explain: it => `الحل: ${CH.san(it.state, it.sols[0])}${it.n === 2 ? ' — ثم يُنهى المات بعد ردّ الخصم (كل ردوده تؤدي للمات)' : ' كش مات'}.`,
    });
  },
});
