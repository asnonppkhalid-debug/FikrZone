'use strict';
/* ============ المنطق (1): سودوكو، نونوغرام، الألغاز الثنائية، شبكات المنطق ============ */

/* ---------- أدوات الشبكات ---------- */
MV.css(`
.grid-wrap{display:flex;flex-direction:column;align-items:center;gap:12px}
.tools{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.sd{display:grid;direction:ltr;width:min(94vw,470px);aspect-ratio:1;border:2.5px solid var(--text);border-radius:6px;overflow:hidden;background:var(--surface);user-select:none;touch-action:manipulation}
.sd-c{position:relative;display:grid;place-items:center;border:1px solid var(--line2);font-family:var(--f-disp);font-size:clamp(1.1rem,4.6vw,1.7rem);cursor:pointer;background:var(--surface);min-width:0;min-height:0;padding:0}
.sd-c.g{background:var(--surface2);font-weight:700}
.sd-c.peer{background:color-mix(in srgb,var(--accent) 7%,var(--surface))}.sd-c.g.peer{background:color-mix(in srgb,var(--accent) 9%,var(--surface2))}
.sd-c.same{background:color-mix(in srgb,var(--accent) 22%,var(--surface))}
.sd-c.sel{background:color-mix(in srgb,var(--accent) 38%,var(--surface));outline:2px solid var(--accent);outline-offset:-2px;z-index:1}
.sd-c.err{color:var(--bad);background:color-mix(in srgb,var(--bad) 16%,var(--surface))}
.sd-c.hint{box-shadow:inset 0 0 0 3px var(--warn)}
.sd-c.bR{border-right:2.5px solid var(--text)}.sd-c.bB{border-bottom:2.5px solid var(--text)}
.sd-c.v{color:var(--accent-t)}
.notes{position:absolute;inset:1px;display:grid;font-size:clamp(.5rem,1.9vw,.72rem);line-height:1;color:var(--muted);font-family:var(--f-body);direction:ltr}
.notes i{font-style:normal;display:grid;place-items:center}
.digits.draft .dg{background:color-mix(in srgb,var(--accent) 10%,var(--surface));border-style:dashed;font-size:.95em}.digits.draft .dg::before{content:'✎';position:absolute;top:2px;inset-inline-start:4px;font-size:.6rem;opacity:.7}.sd.draftmode{outline:2px dashed var(--accent);outline-offset:3px}
.digits{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:470px}
.dg{min-width:42px;height:48px;border:1.5px solid var(--line2);background:var(--surface);border-radius:10px;font-family:var(--f-disp);font-size:1.25rem;position:relative;padding:0 6px}
.dg small{position:absolute;bottom:1px;inset-inline:0;font-size:.58rem;color:var(--dim);font-family:var(--f-body)}
.dg.done{opacity:.3}
.hintbox{min-height:40px;max-width:470px;text-align:center;color:var(--warn);font-size:.93rem}
.tgl.on{background:var(--accent);color:#14181d;border-color:var(--accent)}
`);

/* =============================== سودوكو =============================== */
const SD = (() => {
  const pop = m => { let n = 0; while (m) { m &= m - 1; n++; } return n; };
  function dims(N) { return N === 6 ? [2, 3] : [3, 3]; }
  function count(grid, N, limit = 2, rng) {
    const [br, bc] = dims(N), full = (1 << N) - 1;
    const rows = Array(N).fill(0), cols = Array(N).fill(0), boxes = Array(N).fill(0), g = grid.slice();
    const boxOf = (r, c) => Math.floor(r / br) * (N / bc) + Math.floor(c / bc);
    for (let i = 0; i < N * N; i++) if (g[i]) { const r = (i / N) | 0, c = i % N, b = 1 << (g[i] - 1), k = boxOf(r, c); if ((rows[r] | cols[c] | boxes[k]) & b) return { count: 0, sol: null }; rows[r] |= b; cols[c] |= b; boxes[k] |= b; }
    let n = 0, sol = null;
    (function rec() {
      let best = -1, bm = 0, bn = 99;
      for (let i = 0; i < N * N; i++) {
        if (g[i]) continue; const r = (i / N) | 0, c = i % N;
        const m = ~(rows[r] | cols[c] | boxes[boxOf(r, c)]) & full, k = pop(m);
        if (k === 0) return; if (k < bn) { bn = k; best = i; bm = m; if (k === 1) break; }
      }
      if (best < 0) { n++; if (!sol) sol = g.slice(); return; }
      let vals = []; for (let v = 0; v < N; v++) if (bm & (1 << v)) vals.push(v);
      if (rng) vals = rng.shuffle(vals);
      const r = (best / N) | 0, c = best % N, k = boxOf(r, c);
      for (const v of vals) {
        const b = 1 << v; g[best] = v + 1; rows[r] |= b; cols[c] |= b; boxes[k] |= b;
        rec();
        g[best] = 0; rows[r] &= ~b; cols[c] &= ~b; boxes[k] &= ~b;
        if (n >= limit) return;
      }
    })();
    return { count: n, sol };
  }
  /* حلّال بشري: يسمح بتقنيات محددة */
  function human(puz, N, tech) {
    const [br, bc] = dims(N), full = (1 << N) - 1, g = puz.slice();
    const boxOf = (r, c) => Math.floor(r / br) * (N / bc) + Math.floor(c / bc);
    const cand = Array(N * N).fill(0);
    const units = [];
    for (let r = 0; r < N; r++) units.push(range(N, c => r * N + c));
    for (let c = 0; c < N; c++) units.push(range(N, r => r * N + c));
    for (let b = 0; b < N; b++) { const u = []; for (let i = 0; i < N * N; i++) if (boxOf((i / N) | 0, i % N) === b) u.push(i); units.push(u); }
    const peers = i => { const r = (i / N) | 0, c = i % N, b = boxOf(r, c), o = new Set(); units.forEach(u => { if (u.includes(i)) u.forEach(x => { if (x !== i) o.add(x); }); }); return [...o]; };
    const P = range(N * N, peers);
    const place = (i, v) => { g[i] = v; cand[i] = 0; P[i].forEach(j => { cand[j] &= ~(1 << (v - 1)); }); };
    for (let i = 0; i < N * N; i++) cand[i] = g[i] ? 0 : full;
    for (let i = 0; i < N * N; i++) if (g[i]) { const v = g[i]; g[i] = v; P[i].forEach(j => { cand[j] &= ~(1 << (v - 1)); }); }
    let usedAdv = false, usedHidden = false;
    for (let guard = 0; guard < 400; guard++) {
      let prog = false;
      for (let i = 0; i < N * N; i++) if (!g[i] && pop(cand[i]) === 1) { place(i, Math.log2(cand[i]) + 1); prog = true; }
      if (prog) continue;
      if (tech.hidden) {
        for (const u of units) for (let v = 0; v < N; v++) {
          const cells = u.filter(i => !g[i] && (cand[i] & (1 << v)));
          if (cells.length === 1 && !u.some(i => g[i] === v + 1)) { place(cells[0], v + 1); prog = true; usedHidden = true; }
        }
        if (prog) continue;
      }
      if (tech.adv) {
        // أزواج عارية
        for (const u of units) {
          const cells = u.filter(i => !g[i]);
          for (let a = 0; a < cells.length; a++) for (let b = a + 1; b < cells.length; b++) {
            const m = cand[cells[a]];
            if (pop(m) === 2 && cand[cells[b]] === m) cells.forEach(x => { if (x !== cells[a] && x !== cells[b] && (cand[x] & m)) { cand[x] &= ~m; prog = true; usedAdv = true; } });
          }
        }
        // أزواج مؤشِّرة (مربع ← صف/عمود)
        for (let b = 0; b < N; b++) {
          const u = units[2 * N + b];
          for (let v = 0; v < N; v++) {
            const cells = u.filter(i => !g[i] && (cand[i] & (1 << v)));
            if (cells.length < 2) continue;
            const rs = new Set(cells.map(i => (i / N) | 0)), cs = new Set(cells.map(i => i % N));
            if (rs.size === 1) { const r = [...rs][0]; for (let c = 0; c < N; c++) { const x = r * N + c; if (!u.includes(x) && (cand[x] & (1 << v))) { cand[x] &= ~(1 << v); prog = true; usedAdv = true; } } }
            if (cs.size === 1) { const c = [...cs][0]; for (let r = 0; r < N; r++) { const x = r * N + c; if (!u.includes(x) && (cand[x] & (1 << v))) { cand[x] &= ~(1 << v); prog = true; usedAdv = true; } } }
          }
        }
      }
      if (!prog) break;
    }
    return { solved: g.every(x => x), adv: usedAdv, hidden: usedHidden };
  }
  const LV = { 1: { N: 6, clues: [14, 18] }, 2: { N: 9, clues: [38, 42] }, 3: { N: 9, clues: [32, 35] }, 4: { N: 9, clues: [27, 30] }, 5: { N: 9, clues: [22, 26] } };
  function generate(level, rng) {
    const { N, clues } = LV[level];
    let best = null;
    for (let attempt = 0; attempt < (level >= 4 ? 30 : 12); attempt++) {
      const sol = count(Array(N * N).fill(0), N, 1, rng).sol;
      const puz = sol.slice(), order = rng.shuffle(range(N * N)), target = rng.int(clues[0], clues[1]);
      let left = N * N;
      for (const i of order) {
        if (left <= target) break;
        const v = puz[i]; puz[i] = 0;
        if (count(puz, N, 2).count !== 1) puz[i] = v; else left--;
      }
      const naked = human(puz, N, {}).solved, singles = human(puz, N, { hidden: true }).solved, adv = human(puz, N, { hidden: true, adv: true });
      const ok = level === 1 ? true : level === 2 ? naked : level === 3 ? singles : level === 4 ? (!singles && adv.solved) : !singles;
      best = { puz, sol, N, level, singles, naked, adv: adv.solved };
      if (ok) return best;
    }
    return best;
  }
  return { count, human, generate, dims, LV };
})();

MV.define({
  id: 'sudoku', name: 'سودوكو', en: 'Sudoku', realms: ['logic'], skills: ['deduction', 'patterns'], type: 'puzzle', minutes: 8, canSave: true, longSession: false,
  blurb: 'املأ الشبكة بحيث لا يتكرر أي رقم في صفّه أو عموده أو مربّعه. كل لغز له حل وحيد يُستنتج بالمنطق.',
  rules: ['اختر خلية ثم اضغط رقماً لوضعه (أو استخدم لوحة المفاتيح).', 'الأرقام لا تتكرر في الصف ولا العمود ولا المربع السميك.', '«المسودة»: فعّلها (زر ✎ أو مفتاح N) ثم اضغط الأرقام لتدوين الاحتمالات الممكنة في الخلية بخط صغير. زر «املأ الاحتمالات» يكتبها لك تلقائياً لكل الخلايا الفارغة، و«امسح المسودة» يحذفها.', 'عند وضع رقم صحيح يُشطب تلقائياً من مسودة الخلايا المجاورة (الصف والعمود والمربع).', 'التلميح يشرح التقنية المنطقية (وحيد عارٍ / وحيد مخفي) ثم يكشف الرقم عند الضغط الثاني.'],
  levelNote: l => ({ 1: 'شبكة 6×6', 2: 'تسعة بتسعة، تكفي تقنية الوحيد العاري', 3: 'تحتاج الوحيد المخفي', 4: 'تحتاج أزواجاً ومؤشّرات', 5: 'ألغاز قليلة المعطيات' }[l]),
  parTime: l => [240, 600, 800, 1100, 1500][l - 1],
  selfTest() {
    const rng = RNG(7), out = [];
    for (let l = 1; l <= 5; l++) { const t0 = performance.now(); const p = SD.generate(l, rng); const c = SD.count(p.puz, p.N, 2); out.push({ l, unique: c.count === 1, match: c.sol.every((v, i) => v === p.sol[i]), clues: p.puz.filter(x => x).length, ms: Math.round(performance.now() - t0), singles: p.singles }); }
    return { ok: out.every(o => o.unique && o.match), out };
  },
  run(ctx) {
    let st = ctx.saved;
    if (!st) { const p = SD.generate(ctx.level, ctx.rng); st = { puz: p.puz, sol: p.sol, N: p.N, grid: p.puz.slice(), notes: Array(p.N * p.N).fill(0), m: 0, hn: 0, el: 0, hist: [] }; }
    else { ctx.addTime(st.el || 0); if (st.m) ctx.mistake(st.m); for (let i = 0; i < (st.hn || 0); i++) ctx.hint(); }
    const N = st.N, [br, bc] = SD.dims(N), root = ctx.root;
    let sel = -1, noteMode = false, hintCell = -1, hintStage = 0, hintFor = null, errSet = new Set(); const hintMsg = h('div', { class: 'hintbox' });
    const boxOf = i => Math.floor(((i / N) | 0) / br) * (N / bc) + Math.floor((i % N) / bc);
    const cells = range(N * N, i => {
      const r = (i / N) | 0, c = i % N;
      const el = h('button', { class: 'sd-c' + (st.puz[i] ? ' g' : '') + ((c + 1) % bc === 0 && c < N - 1 ? ' bR' : '') + ((r + 1) % br === 0 && r < N - 1 ? ' bB' : ''), 'aria-label': `خلية ${r + 1}،${c + 1}`, onClick: () => select(i) });
      return el;
    });
    const board = h('div', { class: 'sd', style: `grid-template-columns:repeat(${N},1fr);grid-template-rows:repeat(${N},1fr)` }, cells);
    function paint() {
      const sv = sel >= 0 ? st.grid[sel] : 0;
      cells.forEach((el, i) => {
        const r = (i / N) | 0, c = i % N, v = st.grid[i];
        let cls = 'sd-c' + (st.puz[i] ? ' g' : '') + ((c + 1) % bc === 0 && c < N - 1 ? ' bR' : '') + ((r + 1) % br === 0 && r < N - 1 ? ' bB' : '');
        if (sel >= 0) { if (i === sel) cls += ' sel'; else if (v && v === sv) cls += ' same'; else if (r === ((sel / N) | 0) || c === sel % N || boxOf(i) === boxOf(sel)) cls += ' peer'; }
        if (errSet.has(i)) cls += ' err'; else if (v && !st.puz[i]) cls += ' v';
        if (i === hintCell) cls += ' hint';
        el.className = cls;
        clear(el);
        if (v) el.append(String(v));
        else if (st.notes[i]) { const nb = h('div', { class: 'notes', style: `grid-template-columns:repeat(${bc},1fr);grid-template-rows:repeat(${br},1fr)` }); for (let k = 1; k <= N; k++) nb.append(h('i', null, st.notes[i] & (1 << (k - 1)) ? String(k) : '')); el.append(nb); }
      });
      dgBtns.forEach((b, k) => { const used = st.grid.filter(x => x === k + 1).length; b.classList.toggle('done', used >= N); b.lastChild.textContent = String(N - used); });
    }
    function select(i) { sel = i; paint(); }
    function persist() { st.el = ctx.elapsed(); st.hn = ctx.hints; st.m = ctx.mistakes; ctx.save({ puz: st.puz, sol: st.sol, N, grid: st.grid, notes: st.notes, m: st.m, hn: st.hn, el: st.el }); }
    function peersOf(i) { const r = (i / N) | 0, c = i % N, o = []; for (let k = 0; k < N * N; k++) if (k !== i && (((k / N) | 0) === r || k % N === c || boxOf(k) === boxOf(i))) o.push(k); return o; }
    function put(v) {
      if (sel < 0 || st.puz[sel]) return;
      if (hintCell >= 0) { hintCell = -1; hintStage = 0; hintMsg.textContent = ''; }
      if (v === 0) { st.hist.push([sel, st.grid[sel], st.notes[sel]]); st.grid[sel] = 0; st.notes[sel] = 0; errSet.delete(sel); paint(); persist(); return; }
      if (noteMode) { if (st.grid[sel]) return; st.hist.push([sel, st.grid[sel], st.notes[sel]]); st.notes[sel] ^= (1 << (v - 1)); paint(); persist(); return; }
      if (st.grid[sel] === v) return;
      st.hist.push([sel, st.grid[sel], st.notes[sel]]);
      st.grid[sel] = v; st.notes[sel] = 0;
      if (v !== st.sol[sel]) { errSet.add(sel); ctx.mistake(); ctx.sound('bad'); }
      else { errSet.delete(sel); ctx.correct(); ctx.sound('click'); peersOf(sel).forEach(j => { st.notes[j] &= ~(1 << (v - 1)); }); }
      paint(); persist();
      if (st.grid.every((x, i) => x === st.sol[i])) { ctx.clearSave(); ctx.timeout(win, 350); }
    }
    function win() {
      const empties = st.puz.filter(x => !x).length;
      ctx.finish({ acc: clamp(1 - ctx.mistakes / Math.max(6, empties * 0.35), 0, 1), parTime: SD_PAR[ctx.level - 1], summary: ctx.level === 1 ? 'لغز 6×6' : 'أنهيت اللغز بنجاح' });
    }
    const SD_PAR = [240, 600, 800, 1100, 1500];
    function undo() { const u = st.hist.pop(); if (!u) return; if (u.bulk) { st.notes = u.bulk.slice(); paint(); persist(); return; } st.grid[u[0]] = u[1]; st.notes[u[0]] = u[2]; errSet.delete(u[0]); if (st.grid[u[0]] && st.grid[u[0]] !== st.sol[u[0]]) errSet.add(u[0]); sel = u[0]; paint(); persist(); }
    /* تلميح شارح */
    function findHint() {
      const g = st.grid, full = (1 << N) - 1, cand = i => { let m = full; peersOf(i).forEach(j => { if (g[j]) m &= ~(1 << (g[j] - 1)); }); return m; };
      for (let i = 0; i < N * N; i++) if (!g[i]) { const m = cand(i); if (pop2(m) === 1) return { i, v: Math.log2(m) + 1, why: 'وحيد عارٍ: هذه الخلية لا تقبل بحسب الصف والعمود والمربع إلا رقماً واحداً.' }; }
      const units = []; for (let r = 0; r < N; r++) units.push([range(N, c => r * N + c), 'الصف']); for (let c = 0; c < N; c++) units.push([range(N, r => r * N + c), 'العمود']);
      for (let b = 0; b < N; b++) units.push([range(N * N).filter(i => boxOf(i) === b), 'المربع']);
      for (const [u, nm] of units) for (let v = 1; v <= N; v++) { if (u.some(i => g[i] === v)) continue; const cs = u.filter(i => !g[i] && (cand(i) & (1 << (v - 1)))); if (cs.length === 1) return { i: cs[0], v, why: `وحيد مخفي: الرقم ${v} لا يمكن أن يقع في ${nm} إلا في هذه الخلية.` }; }
      const wrong = st.grid.findIndex((x, i) => x && x !== st.sol[i]); if (wrong >= 0) return { i: wrong, v: st.sol[wrong], why: 'يوجد خطأ في هذه الخلية — راجع الرقم الذي وضعته.', fix: true };
      const e = st.grid.findIndex(x => !x); return e >= 0 ? { i: e, v: st.sol[e], why: 'لا توجد خطوة بتقنية بسيطة هنا؛ هذا هو الرقم الصحيح بحسب الحل.' } : null;
    }
    const pop2 = m => { let n = 0; while (m) { m &= m - 1; n++; } return n; };
    function doHint() {
      if (hintFor && hintFor.i >= 0 && hintStage === 1) { // ضغطة ثانية: اكشف
        sel = hintFor.i; hintCell = -1; hintStage = 0; const v = hintFor.v; hintMsg.textContent = ''; st.grid[sel] = v; st.notes[sel] = 0; errSet.delete(sel); ctx.hint(); peersOf(sel).forEach(j => { st.notes[j] &= ~(1 << (v - 1)); }); paint(); persist();
        if (st.grid.every((x, i) => x === st.sol[i])) { ctx.clearSave(); ctx.timeout(win, 350); }
        return;
      }
      const hnt = findHint(); if (!hnt) return;
      ctx.hint(); hintFor = hnt; hintCell = hnt.i; sel = hnt.i; hintStage = 1; hintMsg.textContent = hnt.why + ' (اضغط «تلميح» مرة ثانية لكشف الرقم)'; paint(); persist();
    }
    const dgBtns = range(N, k => h('button', { class: 'dg', onClick: () => put(k + 1) }, String(k + 1), h('small', null, String(N))));
    const setDraft = on => { noteMode = on; nb.classList.toggle('on', on); nb.setAttribute('aria-pressed', on ? 'true' : 'false'); digitsEl.classList.toggle('draft', on); board.classList.toggle('draftmode', on); hintMsg.textContent = on ? '✎ وضع المسودة: الأرقام التي تضغطها تُدوَّن كاحتمالات صغيرة ولا تُحتسب إجابة.' : ''; };
    const nb = h('button', { class: 'btn ghost sm tgl', id: 'sd-draft', 'aria-pressed': 'false', onClick: () => setDraft(!noteMode) }, '✎ مسودة');
    const candOf = i => { let m = (1 << N) - 1; peersOf(i).forEach(j => { if (st.grid[j]) m &= ~(1 << (st.grid[j] - 1)); }); return m; };
    const autoFill = () => { st.hist.push({ bulk: st.notes.slice() }); for (let i = 0; i < N * N; i++) st.notes[i] = st.grid[i] ? 0 : candOf(i); paint(); persist(); };
    const clearDraft = () => { if (!st.notes.some(x => x)) return; st.hist.push({ bulk: st.notes.slice() }); st.notes.fill(0); paint(); persist(); };
    const tools = h('div', { class: 'tools' }, nb, h('button', { class: 'btn ghost sm', id: 'sd-fill', onClick: autoFill }, 'املأ الاحتمالات'), h('button', { class: 'btn ghost sm', id: 'sd-cleard', onClick: clearDraft }, 'امسح المسودة'), h('button', { class: 'btn ghost sm', onClick: undo }, 'تراجع'), h('button', { class: 'btn ghost sm', onClick: () => put(0) }, 'مسح'), ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', id: 'sd-hint', onClick: doHint }, 'تلميح') : null);
    const digitsEl = h('div', { class: 'digits' }, dgBtns);
    mount(root, h('div', { class: 'grid-wrap' }, board, digitsEl, tools, hintMsg));
    ctx.listen(document, 'keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (/^[1-9]$/.test(e.key) && +e.key <= N) put(+e.key);
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') put(0);
      else if (e.key.toLowerCase() === 'n') setDraft(!noteMode);
      else if (e.key.startsWith('Arrow') && sel >= 0) { const r = (sel / N) | 0, c = sel % N; const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key]; select(clamp(r + d[0], 0, N - 1) * N + clamp(c + d[1], 0, N - 1)); e.preventDefault(); }
    });
    st.grid.forEach((v, i) => { if (v && !st.puz[i] && v !== st.sol[i]) errSet.add(i); });
    paint();
    ctx.debug.solve = () => { st.grid = st.sol.slice(); st.notes.fill(0); paint(); ctx.timeout(win, 50); };
    ctx.debug.state = st;
  },
});

/* =============================== نونوغرام =============================== */
const NG = (() => {
  function clues(line) { const o = []; let k = 0; for (const x of line) { if (x) k++; else if (k) { o.push(k); k = 0; } } if (k) o.push(k); return o.length ? o : [0]; }
  /* حلّال سطر: state: -1 مجهول, 0 فارغ, 1 ممتلئ. يعيد سطراً مُحدَّثاً أو null عند التناقض */
  function solveLine(cl, line) {
    const n = line.length, k = cl[0] === 0 ? 0 : cl.length;
    const can1 = Array(n).fill(false), can0 = Array(n).fill(false);
    const memo = new Map();
    // f(i,j): هل يمكن إكمال الأسطر من الخلية i والكتلة j؟ مع تسجيل الاحتمالات (برمجة ديناميكية بالذاكرة)
    const okF = (i, j) => {
      const key = i * 40 + j; if (memo.has(key)) return memo.get(key);
      let res = false;
      if (i >= n) res = j === k;
      else {
        // خلية فارغة
        if (line[i] !== 1 && okF(i + 1, j)) res = true;
        // بدء كتلة
        if (j < k && line[i] !== 0) {
          const len = cl[j]; let good = i + len <= n;
          if (good) for (let t = i; t < i + len; t++) if (line[t] === 0) { good = false; break; }
          if (good && i + len < n && line[i + len] === 1) good = false;
          if (good && okF(Math.min(n, i + len + 1), j + 1)) res = true;
        }
      }
      memo.set(key, res); return res;
    };
    if (!okF(0, 0)) return null;
    // استخراج الاحتمالات بتتبّع المسارات الممكنة
    const seen = new Set();
    (function walk(i, j) {
      const key = i * 40 + j; if (seen.has(key)) return; seen.add(key);
      if (i >= n) return;
      if (line[i] !== 1 && okF(i + 1, j)) { can0[i] = true; walk(i + 1, j); }
      if (j < k && line[i] !== 0) {
        const len = cl[j]; let good = i + len <= n;
        if (good) for (let t = i; t < i + len; t++) if (line[t] === 0) { good = false; break; }
        if (good && i + len < n && line[i + len] === 1) good = false;
        if (good && okF(Math.min(n, i + len + 1), j + 1)) { for (let t = i; t < i + len; t++) can1[t] = true; if (i + len < n) can0[i + len] = true; walk(Math.min(n, i + len + 1), j + 1); }
      }
    })(0, 0);
    return line.map((v, i) => can1[i] && !can0[i] ? 1 : can0[i] && !can1[i] ? 0 : -1);
  }
  function solve(rc, cc, R, C) {
    const g = Array(R * C).fill(-1); let ch = true, guard = 0;
    while (ch && guard++ < 200) {
      ch = false;
      for (let r = 0; r < R; r++) { const line = range(C, c => g[r * C + c]), nl = solveLine(rc[r], line); if (!nl) return { ok: false }; nl.forEach((v, c) => { if (v !== line[c]) { g[r * C + c] = v; ch = true; } }); }
      for (let c = 0; c < C; c++) { const line = range(R, r => g[r * C + c]), nl = solveLine(cc[c], line); if (!nl) return { ok: false }; nl.forEach((v, r) => { if (v !== line[r]) { g[r * C + c] = v; ch = true; } }); }
    }
    return { ok: true, solved: g.every(x => x !== -1), g };
  }
  const SZ = { 1: 5, 2: 7, 3: 10, 4: 12, 5: 15 };
  function generate(level, rng) {
    const n = SZ[level]; let best = null;
    for (let att = 0; att < 400; att++) {
      let g = range(n * n, () => rng.chance(0.55 + (level > 3 ? 0.05 : 0)) ? 1 : 0);
      for (let pass = 0; pass < 1 + (level > 2 ? 1 : 0); pass++) { // تنعيم لشكل أكثر طبيعية
        g = g.map((v, i) => { const r = (i / n) | 0, c = i % n; let s2 = 0, t = 0; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < n && cc >= 0 && cc < n) { s2 += g[rr * n + cc]; t++; } } return s2 / t > 0.5 ? 1 : s2 / t < 0.4 ? 0 : v; });
      }
      const rc = range(n, r => clues(range(n, c => g[r * n + c]))), cc = range(n, c => clues(range(n, r => g[r * n + c])));
      if (rc.some(x => x[0] === 0) || cc.some(x => x[0] === 0)) continue;
      const res = solve(rc, cc, n, n);
      best = { g, rc, cc, n, level, line: res.solved };
      if (res.solved) return best;
    }
    return best;
  }
  return { clues, solveLine, solve, generate, SZ };
})();

MV.define({
  id: 'nonogram', name: 'نونوغرام', en: 'Nonograms', realms: ['logic', 'spatial'], skills: ['deduction', 'spatial'], type: 'puzzle', minutes: 8, canSave: true,
  blurb: 'الأرقام على الأطراف تخبرك بطول كل مقطع من الخلايا الممتلئة في الصف والعمود. ارسم الصورة المخفية بالمنطق.',
  rules: ['كل رقم يدل على مقطع متصل من الخلايا الممتلئة، وبين المقاطع خلية فارغة على الأقل.', 'اضغط خلية لتعبئتها، أو فعّل وضع «×» لتعليم الخلايا الفارغة. يمكنك السحب لتعبئة عدة خلايا.', 'كل لغز له حل وحيد يُستنتج دون تخمين.'],
  levelNote: l => `شبكة ${NG.SZ[l]}×${NG.SZ[l]}`,
  selfTest() {
    const rng = RNG(11), out = [];
    for (let l = 1; l <= 5; l++) { const t0 = performance.now(); const p = NG.generate(l, rng); const r = NG.solve(p.rc, p.cc, p.n, p.n); out.push({ l, n: p.n, lineSolvable: r.solved, same: r.solved && r.g.every((v, i) => v === p.g[i]), ms: Math.round(performance.now() - t0) }); }
    return { ok: out.every(o => o.lineSolvable && o.same), out };
  },
  run(ctx) {
    let st = ctx.saved;
    if (!st) { const p = NG.generate(ctx.level, ctx.rng); st = { n: p.n, g: p.g, rc: p.rc, cc: p.cc, cur: Array(p.n * p.n).fill(0), m: 0, hn: 0, el: 0 }; }
    else { ctx.addTime(st.el || 0); if (st.m) ctx.mistake(st.m); for (let i = 0; i < (st.hn || 0); i++) ctx.hint(); }
    const n = st.n, sol = st.g; let mode = 'fill', painting = null, errs = new Set();
    const cell = 'clamp(18px,' + (88 / (n + 4)) + 'vmin,36px)';
    const maxR = Math.max(...st.rc.map(x => x.length)), maxC = Math.max(...st.cc.map(x => x.length));
    const cellsEl = range(n * n, i => h('div', { class: 'ng-c', dataset: { i } }));
    const rowCl = range(n, r => h('div', { class: 'ng-rc' }, st.rc[r].map(x => h('span', null, String(x)))));
    const colCl = range(n, c => h('div', { class: 'ng-cc' }, st.cc[c].map(x => h('span', null, String(x)))));
    const board = h('div', { class: 'ng', style: `--cs:${cell};--n:${n};--mr:${maxR};--mc:${maxC}` },
      h('div', { class: 'ng-corner' }), h('div', { class: 'ng-cols', style: `grid-template-columns:repeat(${n},var(--cs))` }, colCl),
      h('div', { class: 'ng-rows', style: `grid-template-rows:repeat(${n},var(--cs))` }, rowCl),
      h('div', { class: 'ng-grid', style: `grid-template-columns:repeat(${n},var(--cs));grid-template-rows:repeat(${n},var(--cs))` }, cellsEl));
    function lineOf(arr, idxs) { return NG.clues(idxs.map(i => arr[i] === 1 ? 1 : 0)); }
    function paint() {
      cellsEl.forEach((el, i) => { const v = st.cur[i]; el.className = 'ng-c' + (v === 1 ? ' on' : v === 2 ? ' x' : '') + (errs.has(i) ? ' err' : '') + (((i % n) + 1) % 5 === 0 && i % n < n - 1 ? ' b5r' : '') + (((((i / n) | 0) + 1) % 5 === 0) && ((i / n) | 0) < n - 1 ? ' b5b' : ''); el.textContent = v === 2 ? '×' : ''; });
      for (let r = 0; r < n; r++) { const ok = JSON.stringify(lineOf(st.cur, range(n, c => r * n + c))) === JSON.stringify(st.rc[r]); rowCl[r].classList.toggle('ok', ok); }
      for (let c = 0; c < n; c++) { const ok = JSON.stringify(lineOf(st.cur, range(n, r => r * n + c))) === JSON.stringify(st.cc[c]); colCl[c].classList.toggle('ok', ok); }
    }
    function persist() { st.el = ctx.elapsed(); st.m = ctx.mistakes; st.hn = ctx.hints; ctx.save(st); }
    function apply(i, v) {
      const cur = st.cur[i]; if (cur === v) return;
      if (v === 1 && cur !== 1) { if (sol[i] !== 1) { errs.add(i); ctx.mistake(); ctx.sound('bad'); } }
      if (cur === 1 && v !== 1) errs.delete(i);
      st.cur[i] = v; if (v === 1 && sol[i] === 1) errs.delete(i);
    }
    function checkWin() {
      if (sol.every((v, i) => (v === 1) === (st.cur[i] === 1))) { ctx.clearSave(); ctx.timeout(() => ctx.finish({ acc: clamp(1 - ctx.mistakes / (n * 1.2), 0, 1), parTime: [120, 300, 600, 900, 1500][ctx.level - 1] }), 350); }
    }
    const nextVal = i => mode === 'fill' ? (st.cur[i] === 1 ? 0 : 1) : (st.cur[i] === 2 ? 0 : 2);
    board.addEventListener('pointerdown', e => { const el = e.target.closest('.ng-c'); if (!el) return; e.preventDefault(); const i = +el.dataset.i; const rightMode = e.button === 2; const m = rightMode ? 'x' : mode; painting = { v: m === 'fill' ? (st.cur[i] === 1 ? 0 : 1) : (st.cur[i] === 2 ? 0 : 2) }; apply(i, painting.v); paint(); });
    board.addEventListener('pointerover', e => { if (!painting) return; const el = e.target.closest('.ng-c'); if (!el) return; const i = +el.dataset.i; if (st.cur[i] === 0 || painting.v === 0) { apply(i, painting.v); paint(); } });
    board.addEventListener('contextmenu', e => e.preventDefault());
    ctx.listen(document, 'pointerup', () => { if (painting) { painting = null; persist(); checkWin(); } });
    const fb = h('button', { class: 'btn ghost sm tgl on', onClick: () => { mode = 'fill'; fb.classList.add('on'); xb.classList.remove('on'); } }, '■ تعبئة'), xb = h('button', { class: 'btn ghost sm tgl', onClick: () => { mode = 'x'; xb.classList.add('on'); fb.classList.remove('on'); } }, '× علامة');
    const hintMsg = h('div', { class: 'hintbox' });
    const hb = ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', onClick: () => {
      // يكشف خلية صحيحة في السطر الأكثر تقدماً
      const cand = []; for (let i = 0; i < n * n; i++) if (sol[i] === 1 && st.cur[i] !== 1) cand.push(i);
      if (!cand.length) return; const i = ctx.rng.pick(cand); ctx.hint(); apply(i, 1); errs.delete(i); hintMsg.textContent = `خلية ممتلئة في الصف ${((i / n) | 0) + 1}، العمود ${(i % n) + 1}.`; paint(); persist(); checkWin();
    } }, 'تلميح') : null;
    const rst = h('button', { class: 'btn ghost sm', onClick: () => { st.cur.fill(0); errs.clear(); paint(); persist(); } }, 'مسح الكل');
    mount(ctx.root, h('div', { class: 'grid-wrap' }, h('div', { class: 'ng-holder' }, board), h('div', { class: 'tools' }, fb, xb, hb, rst), hintMsg));
    paint();
    ctx.debug.solve = () => { st.cur = sol.map(v => v === 1 ? 1 : 0); paint(); checkWin(); };
  },
});
MV.css(`
.ng-holder{max-width:100%;overflow:auto;padding:4px}
.ng{display:grid;grid-template-columns:auto auto;direction:ltr;gap:4px;width:max-content;margin:auto}
.ng-corner{width:calc(var(--mr)*var(--cs)*.62);height:calc(var(--mc)*var(--cs)*.62)}
.ng-cols{display:grid;align-items:end}.ng-cc{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;font-size:calc(var(--cs)*.42);line-height:1.1;color:var(--muted);padding-bottom:2px;font-variant-numeric:tabular-nums}
.ng-rows{display:grid;justify-items:end}.ng-rc{display:flex;gap:calc(var(--cs)*.22);align-items:center;justify-content:flex-end;font-size:calc(var(--cs)*.46);color:var(--muted);padding-inline-end:5px;font-variant-numeric:tabular-nums}
.ng-cc.ok,.ng-rc.ok{color:var(--ok);opacity:.55}
.ng-grid{display:grid;border:2px solid var(--text);background:var(--surface);touch-action:none;user-select:none}
.ng-c{border:1px solid var(--line2);display:grid;place-items:center;font-size:calc(var(--cs)*.6);color:var(--dim);cursor:pointer}
.ng-c.on{background:var(--accent)}.ng-c.x{color:var(--muted)}.ng-c.err{background:var(--bad)}
.ng-c.b5r{border-right:2px solid var(--text)}.ng-c.b5b{border-bottom:2px solid var(--text)}
`);

/* =============================== الألغاز الثنائية =============================== */
const BN = (() => {
  /* خلايا: -1 مجهول، 0/1 */
  function lineOK(a, n) { // لا ثلاثة متتالية، العدّ لا يتجاوز n/2
    let c0 = 0, c1 = 0;
    for (let i = 0; i < n; i++) { if (a[i] === 0) c0++; else if (a[i] === 1) c1++; if (i >= 2 && a[i] !== -1 && a[i] === a[i - 1] && a[i] === a[i - 2]) return false; }
    return c0 <= n / 2 && c1 <= n / 2;
  }
  function propagate(g, n) {
    let ch = true;
    while (ch) {
      ch = false;
      const lines = []; for (let r = 0; r < n; r++) lines.push(range(n, c => r * n + c)); for (let c = 0; c < n; c++) lines.push(range(n, r => r * n + c));
      for (const L of lines) {
        const a = L.map(i => g[i]);
        for (let k = 0; k < n; k++) {
          if (a[k] !== -1) continue;
          for (const v of [0, 1]) { a[k] = v; if (!lineOK(a, n)) { a[k] = 1 - v; g[L[k]] = 1 - v; ch = true; break; } a[k] = -1; }
          if (g[L[k]] !== -1) { a[k] = g[L[k]]; if (!lineOK(a, n)) return false; }
        }
        const z = a.filter(x => x === 0).length, o = a.filter(x => x === 1).length;
        if (z > n / 2 || o > n / 2) return false;
        if (z === n / 2 && o < n / 2) { L.forEach(i => { if (g[i] === -1) { g[i] = 1; ch = true; } }); }
        if (o === n / 2 && z < n / 2) { L.forEach(i => { if (g[i] === -1) { g[i] = 0; ch = true; } }); }
      }
    }
    return true;
  }
  function uniqLines(g, n) {
    for (const rowsOrCols of [0, 1]) {
      const seen = new Set();
      for (let a = 0; a < n; a++) { const line = range(n, b => rowsOrCols ? g[b * n + a] : g[a * n + b]); if (line.includes(-1)) continue; const k = line.join(''); if (seen.has(k)) return false; seen.add(k); }
    }
    return true;
  }
  function count(grid, n, limit = 2, rng) {
    let found = 0, sol = null;
    (function rec(g) {
      if (!propagate(g, n) || !uniqLines(g, n)) return;
      const i = g.indexOf(-1);
      if (i < 0) { found++; if (!sol) sol = g.slice(); return; }
      let vals = [0, 1]; if (rng) vals = rng.shuffle(vals);
      for (const v of vals) { const g2 = g.slice(); g2[i] = v; rec(g2); if (found >= limit) return; }
    })(grid.slice());
    return { count: found, sol };
  }
  const SZ = { 1: 6, 2: 6, 3: 8, 4: 10, 5: 12 };
  function generate(level, rng) {
    const n = SZ[level]; const full = count(Array(n * n).fill(-1), n, 1, rng).sol;
    const puz = full.slice(), order = rng.shuffle(range(n * n)), keep = Math.round(n * n * [0.5, 0.42, 0.4, 0.36, 0.33][level - 1]);
    let left = n * n;
    for (const i of order) { if (left <= keep) break; const v = puz[i]; puz[i] = -1; if (count(puz, n, 2).count !== 1) puz[i] = v; else left--; }
    return { n, puz, sol: full, level };
  }
  /* خطوة منطقية قابلة للشرح من الحالة الحالية */
  function hintStep(g, n) {
    const lines = []; for (let r = 0; r < n; r++) lines.push([range(n, c => r * n + c), `الصف ${r + 1}`]); for (let c = 0; c < n; c++) lines.push([range(n, r => r * n + c), `العمود ${c + 1}`]);
    for (const [L, nm] of lines) {
      const a = L.map(i => g[i]);
      for (let k = 0; k < n; k++) {
        if (a[k] !== -1) continue;
        if (k >= 2 && a[k - 1] !== -1 && a[k - 1] === a[k - 2]) return { i: L[k], v: 1 - a[k - 1], why: `في ${nm}: لا يجوز ثلاثة أرقام متماثلة متتالية، فهذه الخانة تأخذ العكس.` };
        if (k + 2 < n && a[k + 1] !== -1 && a[k + 1] === a[k + 2]) return { i: L[k], v: 1 - a[k + 1], why: `في ${nm}: لا يجوز ثلاثة أرقام متماثلة متتالية، فهذه الخانة تأخذ العكس.` };
        if (k >= 1 && k + 1 < n && a[k - 1] !== -1 && a[k - 1] === a[k + 1]) return { i: L[k], v: 1 - a[k - 1], why: `في ${nm}: الرقمان على جانبي هذه الخانة متماثلان، فلو وضعنا مثلهما لظهر ثلاثي متتالٍ.` };
      }
      const z = a.filter(x => x === 0).length, o = a.filter(x => x === 1).length, k = a.indexOf(-1);
      if (k >= 0 && (z === n / 2 || o === n / 2)) return { i: L[k], v: z === n / 2 ? 1 : 0, why: `في ${nm}: اكتمل عدد ${z === n / 2 ? 'الأصفار' : 'الآحاد'} (${n / 2})، فالباقي من النوع الآخر.` };
    }
    return null;
  }
  return { count, generate, hintStep, SZ, propagate, uniqLines };
})();

MV.define({
  id: 'binary', name: 'الألغاز الثنائية', en: 'Binary Puzzles', realms: ['logic'], skills: ['deduction', 'patterns'], type: 'puzzle', minutes: 6, canSave: true,
  blurb: 'املأ الشبكة بالأصفار والآحاد وفق ثلاث قواعد بسيطة. لا تخمين: كل خانة تُستنتج.',
  rules: ['لا يجوز ثلاثة أرقام متماثلة متتالية في صف أو عمود.', 'في كل صف وعمود عدد الأصفار يساوي عدد الآحاد.', 'لا يتطابق صفّان ولا عمودان.', 'اضغط الخانة لتبديلها: فارغ ← 0 ← 1 ← فارغ.'],
  levelNote: l => `شبكة ${BN.SZ[l]}×${BN.SZ[l]}`,
  selfTest() {
    const rng = RNG(3), out = [];
    for (let l = 1; l <= 5; l++) { const t0 = performance.now(); const p = BN.generate(l, rng); const c = BN.count(p.puz, p.n, 2); out.push({ l, unique: c.count === 1, same: c.sol && c.sol.every((v, i) => v === p.sol[i]), ms: Math.round(performance.now() - t0) }); }
    return { ok: out.every(o => o.unique && o.same), out };
  },
  run(ctx) {
    let st = ctx.saved;
    if (!st) { const p = BN.generate(ctx.level, ctx.rng); st = { n: p.n, puz: p.puz, sol: p.sol, g: p.puz.slice(), m: 0, hn: 0, el: 0 }; }
    else { ctx.addTime(st.el || 0); if (st.m) ctx.mistake(st.m); for (let i = 0; i < (st.hn || 0); i++) ctx.hint(); }
    const n = st.n; let errs = new Set(), hintCell = -1; const hintMsg = h('div', { class: 'hintbox' });
    const cells = range(n * n, i => h('button', { class: 'sd-c bn', onClick: () => tap(i) }));
    const board = h('div', { class: 'sd bn-b', style: `grid-template-columns:repeat(${n},1fr);grid-template-rows:repeat(${n},1fr)` }, cells);
    function paint() {
      cells.forEach((el, i) => { const v = st.g[i], given = st.puz[i] !== -1; el.className = 'sd-c bn' + (given ? ' g' : '') + (errs.has(i) ? ' err' : v !== -1 && !given ? ' v' : '') + (i === hintCell ? ' hint' : ''); el.textContent = v === -1 ? '' : String(v); });
    }
    function persist() { st.el = ctx.elapsed(); st.m = ctx.mistakes; st.hn = ctx.hints; ctx.save(st); }
    function tap(i) {
      if (st.puz[i] !== -1) return; hintCell = -1; hintMsg.textContent = '';
      const cur = st.g[i], nxt = cur === -1 ? 0 : cur === 0 ? 1 : -1; st.g[i] = nxt;
      if (nxt !== -1) { if (nxt !== st.sol[i]) { errs.add(i); ctx.mistake(); ctx.sound('bad'); } else { errs.delete(i); ctx.correct(); ctx.sound('click'); } } else errs.delete(i);
      paint(); persist();
      if (st.g.every((v, k) => v === st.sol[k])) { ctx.clearSave(); ctx.timeout(() => ctx.finish({ acc: clamp(1 - ctx.mistakes / (n * 1.5), 0, 1), parTime: [150, 200, 300, 450, 700][ctx.level - 1] }), 350); }
    }
    const hb = ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', onClick: () => {
      const clean = st.g.map((v, i) => errs.has(i) ? -1 : v); const hs = BN.hintStep(clean, n);
      ctx.hint(); if (hs) { hintCell = hs.i; hintMsg.textContent = hs.why + ` (الرقم: ${hs.v})`; } else { const e = st.g.findIndex((v, i) => v !== st.sol[i]); if (e >= 0) { hintCell = e; hintMsg.textContent = 'راجع هذه الخانة — الرقم الصحيح ' + st.sol[e]; } }
      paint(); persist();
    } }, 'تلميح') : null;
    mount(ctx.root, h('div', { class: 'grid-wrap' }, board, h('div', { class: 'tools' }, hb), hintMsg));
    paint();
    ctx.debug.solve = () => { st.g = st.sol.slice(); errs.clear(); paint(); ctx.timeout(() => ctx.finish({ acc: 1 }), 50); };
  },
});
MV.css(`.sd.bn-b{width:min(94vw,440px)}.sd-c.bn{font-size:clamp(1.2rem,5vw,1.8rem);border:1px solid var(--line2)}.sd-c.bn.g{background:var(--surface2)}`);

/* =============================== شبكات المنطق =============================== */
const LG = (() => {
  const NAMES = ['أحمد', 'علي', 'عمر', 'حسين', 'كريم', 'يوسف', 'سامر', 'زيد'];
  const CATS = [
    { key: 'city', name: 'المدينة', items: [['بغداد', 'يسكن في بغداد', 'الساكن في بغداد'], ['البصرة', 'يسكن في البصرة', 'الساكن في البصرة'], ['أربيل', 'يسكن في أربيل', 'الساكن في أربيل'], ['النجف', 'يسكن في النجف', 'الساكن في النجف'], ['الموصل', 'يسكن في الموصل', 'الساكن في الموصل'], ['كربلاء', 'يسكن في كربلاء', 'الساكن في كربلاء']] },
    { key: 'job', name: 'المهنة', items: [['طبيب', 'يعمل طبيباً', 'الطبيب'], ['مهندس', 'يعمل مهندساً', 'المهندس'], ['معلّم', 'يعمل معلّماً', 'المعلّم'], ['صيدلي', 'يعمل صيدلياً', 'الصيدلي'], ['محامي', 'يعمل محامياً', 'المحامي'], ['خبّاز', 'يعمل خبّازاً', 'الخبّاز']] },
    { key: 'pet', name: 'الحيوان الأليف', items: [['قط', 'يملك قطاً', 'صاحب القط'], ['ببغاء', 'يملك ببغاء', 'صاحب الببغاء'], ['سمكة', 'يملك سمكة', 'صاحب السمكة'], ['أرنب', 'يملك أرنباً', 'صاحب الأرنب'], ['حمامة', 'يملك حمامة', 'صاحب الحمامة'], ['سلحفاة', 'يملك سلحفاة', 'صاحب السلحفاة']] },
    { key: 'drink', name: 'المشروب', items: [['الشاي', 'يشرب الشاي', 'شارب الشاي'], ['القهوة', 'يشرب القهوة', 'شارب القهوة'], ['العصير', 'يشرب العصير', 'شارب العصير'], ['الحليب', 'يشرب الحليب', 'شارب الحليب'], ['الماء', 'يشرب الماء', 'شارب الماء'], ['اللبن', 'يشرب اللبن', 'شارب اللبن']] },
    { key: 'car', name: 'لون السيارة', items: [['حمراء', 'يملك سيارة حمراء', 'صاحب السيارة الحمراء'], ['زرقاء', 'يملك سيارة زرقاء', 'صاحب السيارة الزرقاء'], ['بيضاء', 'يملك سيارة بيضاء', 'صاحب السيارة البيضاء'], ['سوداء', 'يملك سيارة سوداء', 'صاحب السيارة السوداء'], ['فضية', 'يملك سيارة فضية', 'صاحب السيارة الفضية'], ['خضراء', 'يملك سيارة خضراء', 'صاحب السيارة الخضراء']] },
    { key: 'hobby', name: 'الهواية', items: [['القراءة', 'يهوى القراءة', 'هاوي القراءة'], ['الرسم', 'يهوى الرسم', 'هاوي الرسم'], ['السباحة', 'يهوى السباحة', 'هاوي السباحة'], ['الشطرنج', 'يهوى الشطرنج', 'هاوي الشطرنج'], ['التصوير', 'يهوى التصوير', 'هاوي التصوير'], ['الطبخ', 'يهوى الطبخ', 'هاوي الطبخ']] },
  ];
  const SIZES = { 1: [3, 3], 2: [4, 3], 3: [4, 4], 4: [5, 4], 5: [5, 5] }; // [n, عدد التصنيفات بما فيها الأسماء]
  /* حلّ: sol[k][p] = فهرس عنصر التصنيف k للشخص p (k=0 هو الأسماء وفق الترتيب p) */
  function holds(cl, asg) { // asg[k] = مصفوفة أشخاص→عنصر ; نبحث عن الشخص الذي لديه العنصر
    const who = (k, it) => asg[k].indexOf(it);
    switch (cl.t) {
      case 'same': return who(cl.a[0], cl.a[1]) === who(cl.b[0], cl.b[1]);
      case 'diff': return who(cl.a[0], cl.a[1]) !== who(cl.b[0], cl.b[1]);
      case 'either': { const p = who(cl.a[0], cl.a[1]); return p === who(cl.b[0], cl.b[1]) || p === who(cl.c[0], cl.c[1]); }
      case 'neither': { const p = who(cl.a[0], cl.a[1]); return p !== who(cl.b[0], cl.b[1]) && p !== who(cl.c[0], cl.c[1]); }
    }
    return false;
  }
  const catsOf = cl => { const s2 = new Set([cl.a[0], cl.b[0]]); if (cl.c) s2.add(cl.c[0]); return s2; };
  /* عدّ الحلول: نسند الأشخاص واحداً واحداً (كل التصنيفات معاً) ونفحص التلميحات بعد اكتمال كل شخص */
  function countSolutions(n, nc, clues, limit = 2) {
    const pos = [range(n)]; for (let k = 1; k < nc; k++) pos.push(Array(n).fill(-1));
    const used = Array.from({ length: nc }, () => Array(n).fill(false));
    let found = 0;
    const ok = p => {
      const w = (k, i) => { const v = pos[k][i]; return v >= 0 && v <= p ? v : -1; };
      for (const cl of clues) {
        const wa = w(cl.a[0], cl.a[1]), wb = w(cl.b[0], cl.b[1]);
        switch (cl.t) {
          case 'same': if ((wa >= 0 || wb >= 0) && wa !== wb) return false; break;
          case 'diff': if (wa >= 0 && wa === wb) return false; break;
          case 'either': { const wc = w(cl.c[0], cl.c[1]); if (wa >= 0) { if (wb !== wa && wc !== wa) return false; } else if (wb >= 0 && wc >= 0) return false; break; }
          case 'neither': { const wc = w(cl.c[0], cl.c[1]); if (wa >= 0 && (wb === wa || wc === wa)) return false; break; }
        }
      }
      return true;
    };
    (function person(p) {
      if (found >= limit) return;
      if (p === n) { found++; return; }
      (function cat(k) {
        if (found >= limit) return;
        if (k === nc) { if (ok(p)) person(p + 1); return; }
        for (let i = 0; i < n; i++) {
          if (used[k][i]) continue;
          used[k][i] = true; pos[k][i] = p; cat(k + 1); used[k][i] = false; pos[k][i] = -1;
          if (found >= limit) return;
        }
      })(1);
    })(0);
    return found;
  }
  function randClue(rng, n, nc, asg) {
    const k1 = rng.int(0, nc - 1); let k2 = rng.int(0, nc - 1); while (k2 === k1) k2 = rng.int(0, nc - 1);
    const A = [k1, rng.int(0, n - 1)], pa = asg[k1].indexOf(A[1]); // الشخص الذي لديه A
    const t = rng.weighted(['same', 'diff', 'either', 'neither'], x => ({ same: 3, diff: 2, either: 2, neither: 1.5 }[x]));
    const itemOf = (k, p) => [k, asg[k][p]];
    if (t === 'same') return { t, a: A, b: itemOf(k2, pa) };
    if (t === 'diff') { let pb; do { pb = rng.int(0, n - 1); } while (pb === pa); return { t, a: A, b: itemOf(k2, pb) }; }
    let x, y; do { x = rng.int(0, n - 1); y = rng.int(0, n - 1); } while (x === y);
    if (t === 'either') { // أحدهما هو الصحيح
      const first = rng.chance(0.5); let wrong; do { wrong = rng.int(0, n - 1); } while (wrong === pa);
      const B = itemOf(k2, pa), C = itemOf(k2, wrong); return first ? { t, a: A, b: B, c: C } : { t, a: A, b: C, c: B };
    }
    let w1, w2; do { w1 = rng.int(0, n - 1); w2 = rng.int(0, n - 1); } while (w1 === w2 || w1 === pa || w2 === pa);
    return { t: 'neither', a: A, b: itemOf(k2, w1), c: itemOf(k2, w2) };
  }
  function generate(level, rng) {
    const [n, nc] = SIZES[level];
    const names = rng.sample(NAMES, n), cats = rng.sample(CATS, nc - 1).map(c => ({ name: c.name, items: rng.sample(c.items, n) }));
    const all = [{ name: 'الاسم', items: names.map(x => [x, x, x]) }, ...cats];
    const asg = [range(n)]; for (let k = 1; k < nc; k++) asg.push(rng.shuffle(range(n)));
    let clues = [];
    for (let guard = 0; guard < 400; guard++) {
      const cl = randClue(rng, n, nc, asg); if (!holds(cl, asg)) continue;
      clues.push(cl);
      if (countSolutions(n, nc, clues, 2) === 1) break;
    }
    if (countSolutions(n, nc, clues, 2) !== 1) return generate(level, rng);
    for (let i = clues.length - 1; i >= 0; i--) { const t = clues.slice(0, i).concat(clues.slice(i + 1)); if (countSolutions(n, nc, t, 2) === 1) clues = t; }
    return { n, nc, all, asg, clues, level };
  }
  function phrase(all, kc, which) { const it = all[kc.k !== undefined ? 0 : 0]; return null; }
  const item = (all, k, i) => all[k].items[i];
  const refOf = (all, [k, i]) => k === 0 ? item(all, k, i)[0] : item(all, k, i)[2];
  const predOf = (all, [k, i]) => item(all, k, i)[1];
  function text(all, cl) {
    const A = cl.a, B = cl.b;
    if (cl.t === 'same') return B[0] === 0 ? `${refOf(all, A)} هو ${refOf(all, B)}` : `${refOf(all, A)} ${predOf(all, B)}`;
    if (cl.t === 'diff') return B[0] === 0 ? `${refOf(all, A)} ليس ${refOf(all, B)}` : `${refOf(all, A)} لا ${predOf(all, B)}`;
    if (cl.t === 'either') return `${refOf(all, A)} هو إمّا ${refOf(all, cl.b)} أو ${refOf(all, cl.c)}`;
    return `${refOf(all, A)} ليس ${refOf(all, cl.b)} ولا ${refOf(all, cl.c)}`;
  }
  return { generate, text, countSolutions, holds, SIZES };
})();

MV.define({
  id: 'logicgrid', name: 'ألغاز شبكات المنطق', en: 'Logic Grid Puzzles', realms: ['logic'], skills: ['deduction', 'solving'], type: 'puzzle', minutes: 10, canSave: false,
  blurb: 'مجموعة أصدقاء، ولكل منهم مدينة ومهنة وحيوان… اقرأ التلميحات واستبعد الاحتمالات حتى يبقى حل واحد.',
  rules: ['كل تلميح صحيح دائماً. اضغط الخانة مرة لوضع ✕ (ليس هو) ومرتين لوضع ✓ (هو).', 'عند وضع ✓ تُستبعد تلقائياً بقية الخانات في الصف والعمود (يمكن إيقافه).', 'الهدف: تحديد ما يخص كل شخص في جداول «الاسم».', 'لكل لغز حل وحيد مضمون يُستنتج منطقياً.'],
  levelNote: l => `${LG.SIZES[l][0]} أشخاص و${LG.SIZES[l][1] - 1} صفات`,
  selfTest() {
    const rng = RNG(5), out = [];
    for (let l = 1; l <= 5; l++) { const t0 = performance.now(); const p = LG.generate(l, rng); out.push({ l, clues: p.clues.length, unique: LG.countSolutions(p.n, p.nc, p.clues, 2) === 1, trueAll: p.clues.every(c => LG.holds(c, p.asg)), ms: Math.round(performance.now() - t0), sample: LG.text(p.all, p.clues[0]) }); }
    return { ok: out.every(o => o.unique && o.trueAll), out };
  },
  run(ctx) {
    const P = LG.generate(ctx.level, ctx.rng), { n, nc, all, asg } = P;
    // الحالة: tables[(i,j)][a][b] = 0 فارغ، 1 ✕، 2 ✓  (الصف: عنصر التصنيف i ، العمود: عنصر التصنيف j)
    const tables = {}; for (let i = 0; i < nc - 1; i++) for (let j = i + 1; j < nc; j++) tables[i + '-' + j] = Array.from({ length: n }, () => Array(n).fill(0));
    let auto = true; const errCells = new Set();
    // الأسطر: i = التصنيف الأول (الأسماء مثلاً) في الصفوف؛ نعرض الجداول بالمنظور (j صفوف، i أعمدة)؟ نبقيها i صفوف
    const truth = (i, a, j, b) => asg[i].indexOf(a) === asg[j].indexOf(b);
    const holder = h('div', { class: 'lg-tables' });
    const clueEls = P.clues.map((c, i) => h('li', { class: 'lg-clue', onClick: e => e.currentTarget.classList.toggle('struck') }, LG.text(all, c) + '.'));
    function draw() {
      mount(holder);
      for (let i = 0; i < nc - 1; i++) for (let j = i + 1; j < nc; j++) {
        const T = tables[i + '-' + j];
        const tb = h('table', { class: 'lg-t' }, h('thead', null, h('tr', null, h('th', { class: 'corner' }, `${all[i].name} / ${all[j].name}`), all[j].items.map(it => h('th', null, h('span', null, it[0]))))),
          h('tbody', null, all[i].items.map((ri, a) => h('tr', null, h('th', null, ri[0]), all[j].items.map((ci, b) => {
            const v = T[a][b], key = `${i}-${j}-${a}-${b}`;
            return h('td', { class: 'lg-c v' + v + (errCells.has(key) ? ' err' : ''), onClick: () => tap(i, j, a, b) }, v === 1 ? '✕' : v === 2 ? '✓' : '');
          })))));
        holder.append(h('div', { class: 'lg-wrap' }, tb));
      }
    }
    function tap(i, j, a, b) {
      const T = tables[i + '-' + j], nv = (T[a][b] + 1) % 3, key = `${i}-${j}-${a}-${b}`;
      const t = truth(i, a, j, b); T[a][b] = nv; errCells.delete(key);
      if (nv === 2 && !t) { errCells.add(key); ctx.mistake(); ctx.sound('bad'); }
      else if (nv === 1 && t) { errCells.add(key); ctx.mistake(); ctx.sound('bad'); }
      else if (nv) ctx.sound('click');
      if (nv === 2 && auto && t) { for (let x = 0; x < n; x++) { if (x !== a && T[x][b] === 0) T[x][b] = 1; if (x !== b && T[a][x] === 0) T[a][x] = 1; } }
      draw(); check();
    }
    function check() {
      for (let j = 1; j < nc; j++) { const T = tables['0-' + j]; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (truth(0, a, j, b) !== (T[a][b] === 2)) return; }
      ctx.timeout(() => ctx.finish({ acc: clamp(1 - ctx.mistakes / (n * (nc - 1) * 1.5), 0, 1), parTime: [180, 300, 480, 720, 1000][ctx.level - 1] }), 400);
    }
    const hintMsg = h('div', { class: 'hintbox' });
    const hb = ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', onClick: () => {
      const cand = []; for (let j = 1; j < nc; j++) { const T = tables['0-' + j]; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (truth(0, a, j, b) && T[a][b] !== 2) cand.push([j, a, b]); }
      if (!cand.length) return; const [j, a, b] = ctx.rng.pick(cand); ctx.hint(); const T = tables['0-' + j]; T[a][b] = 2; errCells.delete(`0-${j}-${a}-${b}`);
      for (let x = 0; x < n; x++) { if (x !== a && T[x][b] === 0) T[x][b] = 1; if (x !== b && T[a][x] === 0) T[a][x] = 1; }
      hintMsg.textContent = `${all[0].items[a][0]}: ${all[j].items[b][0]} (${all[j].name}).`; draw(); check();
    } }, 'تلميح') : null;
    const au = h('label', { class: 'check', style: 'margin:0' }, h('input', { type: 'checkbox', checked: true, onChange: e => { auto = e.target.checked; } }), ' استبعاد تلقائي');
    mount(ctx.root, h('div', { class: 'lg' },
      h('div', { class: 'lg-side panel' }, h('h3', null, 'التلميحات'), h('ol', null, clueEls), h('p', { class: 'muted small' }, 'اضغط تلميحاً لشطبه بعد استخدامه.'), h('div', { class: 'tools' }, au, hb), hintMsg),
      holder));
    draw();
    ctx.debug.solve = () => { for (let j = 1; j < nc; j++) { const T = tables['0-' + j]; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) T[a][b] = truth(0, a, j, b) ? 2 : 1; } draw(); check(); };
  },
});
MV.css(`
.lg{display:grid;grid-template-columns:minmax(240px,320px) 1fr;gap:16px;align-items:start}
@media(max-width:900px){.lg{grid-template-columns:1fr}}
.lg-side ol{padding-inline-start:22px;margin:0}.lg-side li{margin:7px 0;cursor:pointer;line-height:1.6}.lg-clue.struck{text-decoration:line-through;color:var(--dim)}
.lg-tables{display:flex;flex-wrap:wrap;gap:14px}
.lg-wrap{overflow:auto;max-width:100%}
.lg-t{border-collapse:collapse;font-size:.82rem;background:var(--surface)}
.lg-t th,.lg-t td{border:1px solid var(--line2);padding:0;text-align:center}
.lg-t th{background:var(--surface2);font-weight:500;padding:3px 6px;white-space:nowrap;min-width:46px}
.lg-t thead th{height:84px;vertical-align:bottom}.lg-t thead th span{display:inline-block;writing-mode:vertical-rl;transform:rotate(180deg)}
.lg-t th.corner{writing-mode:horizontal-tb;font-size:.7rem;color:var(--dim);vertical-align:middle;max-width:92px;white-space:normal}
.lg-c{width:34px;height:34px;cursor:pointer;font-size:1.05rem}.lg-c.v1{color:var(--muted)}.lg-c.v2{color:var(--ok);font-weight:700;background:color-mix(in srgb,var(--ok) 12%,transparent)}.lg-c.err{background:color-mix(in srgb,var(--bad) 28%,transparent)}
`);
