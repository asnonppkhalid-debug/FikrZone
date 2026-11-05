'use strict';
/* ============ الاستراتيجية: توقّع الخصم، القرار، التخطيط، إدارة الموارد ============ */
MV.css(`
.ttt{display:grid;grid-template-columns:repeat(3,76px);gap:6px;justify-content:center;margin:12px auto;direction:ltr}
.ttt button{width:76px;height:76px;border-radius:12px;border:1px solid var(--line2);background:var(--surface);font-family:var(--f-disp);font-size:2.2rem;color:var(--text);cursor:pointer}
.ttt button.X{color:var(--accent)}.ttt button.O{color:#e2699a}
.ttt button:disabled{cursor:default}
.ttt button.ok{background:rgba(61,181,165,.3)}.ttt button.bad{background:rgba(217,89,76,.3)}
.heaps{display:flex;flex-direction:column;gap:8px;align-items:center;margin:10px 0}
.heap{display:flex;gap:5px;align-items:center;direction:ltr}.heap i{width:12px;height:30px;border-radius:4px;background:var(--accent)}.heap b{min-width:26px;text-align:center;font-weight:600;color:var(--muted)}
.opt-tbl{border-collapse:collapse;margin:8px auto;font-size:.95rem}.opt-tbl td,.opt-tbl th{border:1px solid var(--line);padding:5px 12px;text-align:center}
.mc.col{display:flex;flex-direction:column;gap:8px}.mc.col .mc-opt{text-align:start;line-height:1.7}
.hanoi{display:flex;gap:10px;justify-content:center;margin:14px 0;direction:ltr}
.peg{position:relative;flex:1;max-width:120px;min-height:190px;display:flex;flex-direction:column-reverse;align-items:center;gap:3px;padding:6px 0;border-radius:12px;border:1px solid var(--line);background:var(--surface);cursor:pointer}
.peg::before{content:"";position:absolute;bottom:0;top:12px;width:6px;background:var(--line2);border-radius:3px;z-index:0}
.peg.sel{outline:3px solid var(--accent)}
.disc{position:relative;z-index:1;height:20px;border-radius:10px;box-shadow:0 1px 0 rgba(0,0,0,.3)}
.slide{display:grid;grid-template-columns:repeat(3,72px);gap:6px;justify-content:center;margin:14px auto;direction:ltr}
.slide button{height:72px;border-radius:12px;border:1px solid var(--line2);background:var(--surface);font-family:var(--f-disp);font-size:1.7rem;color:var(--text);cursor:pointer}
.slide button.e{visibility:hidden}
.jugs{display:flex;gap:26px;justify-content:center;margin:12px 0;direction:ltr}
.jug{display:flex;flex-direction:column;align-items:center;gap:6px}.jug .vessel{width:66px;border:3px solid var(--line2);border-top:0;border-radius:0 0 14px 14px;position:relative;display:flex;align-items:flex-end;overflow:hidden}
.jug .vessel i{display:block;width:100%;background:#4c9be0;transition:height .3s}
.jug .lab{font-weight:600}
.jact{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:420px;margin:8px auto}
.rsrc{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:460px;margin:8px auto}
.rsrc .kv{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center}
.evlist{margin:8px auto;max-width:460px;padding:0;list-style:none;font-size:.92rem;color:var(--muted)}
.evlist li{padding:3px 0}.evlist li.now{color:var(--text);font-weight:600}
`);

/* ---------- أدوات مشتركة ---------- */
function bfsPath(startKey, nbrs, goalFn, cap = 400000) {
  const prev = new Map([[startKey, null]]); const q = [startKey]; let qi = 0;
  while (qi < q.length) {
    const k = q[qi++];
    if (goalFn(k)) { const path = []; let c = k; while (prev.get(c)) { const pr = prev.get(c); path.push(pr.m); c = pr.k; } return path.reverse(); }
    for (const [nk, m] of nbrs(k)) if (!prev.has(nk)) { prev.set(nk, { k, m }); q.push(nk); }
    if (q.length > cap) break;
  }
  return null;
}

/* ============ توقّع الخصم ============ */
const TT = (() => {
  const LN = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const win = (b, p) => LN.some(l => l.every(i => b[i] === p));
  const memo = new Map();
  function val(b, p) {
    const k = b.join('-') + p; if (memo.has(k)) return memo.get(k);
    let r; if (win(b, 'X')) r = 1; else if (win(b, 'O')) r = -1; else if (b.every(Boolean)) r = 0;
    else { const vs = []; for (let i = 0; i < 9; i++) if (!b[i]) { b[i] = p; vs.push(val(b, p === 'X' ? 'O' : 'X')); b[i] = ''; } r = p === 'X' ? Math.max(...vs) : Math.min(...vs); }
    memo.set(k, r); return r;
  }
  function best(b, p) {
    const all = []; for (let i = 0; i < 9; i++) if (!b[i]) { b[i] = p; const v = val(b, p === 'X' ? 'O' : 'X'); b[i] = ''; all.push({ i, s: p === 'X' ? v : -v }); }
    const m = Math.max(...all.map(o => o.s)); return { moves: all.filter(o => o.s === m).map(o => o.i), score: m, all };
  }
  function imm(b, p, i) { const o = p === 'X' ? 'O' : 'X'; const t = b.slice(); t[i] = p; if (win(t, p)) return true; const u = b.slice(); u[i] = o; return win(u, o); }
  function gen(diff, r) {
    for (let t = 0; t < 600; t++) {
      const marks = r.int(2, diff >= 5 ? 6 : 5), b = Array(9).fill(''); let p = 'X', ok = true;
      for (let k = 0; k < marks; k++) { const e = range(9).filter(i => !b[i]); b[r.pick(e)] = p; p = p === 'X' ? 'O' : 'X'; if (win(b, 'X') || win(b, 'O')) { ok = false; break; } }
      if (!ok) continue;
      const bs = best(b, p); if (bs.moves.length !== 1) continue;
      const easy = imm(b, p, bs.moves[0]);
      if (diff <= 3 && !easy) continue; if (diff >= 5 && easy && t < 500) continue;
      return { b, p, ans: bs.moves[0], score: bs.score, easy };
    }
    return gen(2, r);
  }
  return { gen, best, win };
})();

function nimXor(h) { return h.reduce((a, b) => a ^ b, 0); }
MV.define({
  id: 'predict', name: 'توقّع الخصم', en: 'Predict the Opponent', realms: ['strategy'], skills: ['planning', 'deduction'], type: 'quiz', minutes: 6,
  blurb: 'الخصم يلعب دائماً أفضل نقلة ممكنة. توقّع ردّه أو اختر النقلة التي تتفوّق عليه — في ألعاب لها حل رياضي دقيق.',
  rules: ['في «إكس أو» الخصم (O) لا يخطئ أبداً: ابحث عن النقلة الوحيدة المثلى.', 'في لعبة الأعواد: من يأخذ آخر عود يفوز؛ في كل دور تأخذ عدداً من كومة واحدة فقط.', 'التفكير بما سيفعله الخصم بعد نقلتك هو جوهر الاستراتيجية.'],
  levelNote: l => ['ردود مباشرة (فوز أو منع)', 'مواضع أبسط', 'مواضع أعمق', 'نقلات غير بديهية', 'نقلات مضاعفة التفكير'][l - 1],
  selfTest() { const r = RNG(5), o = []; for (let d = 0; d <= 10; d++) { const g = TT.gen(d, r); o.push(TT.best(g.b.slice(), g.p).moves.length === 1); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 18,
      make(diff, i, r) {
        if (diff >= 2 && r.chance(0.35)) {
          const n = diff >= 6 ? 4 : 3, hp = range(n, () => r.int(1, diff >= 6 ? 9 : 6));
          if (nimXor(hp) === 0) hp[0]++;
          const wins = []; hp.forEach((x, j) => { const t = x ^ nimXor(hp); if (t < x) wins.push({ j, k: x - t }); });
          const opts = wins.slice(0, 1); const bad = [];
          hp.forEach((x, j) => { for (let k = 1; k <= x; k++) { const t = hp.slice(); t[j] -= k; if (nimXor(t) !== 0) bad.push({ j, k }); } });
          const pick = r.sample(bad, 3); return { kind: 'nim', hp, wins, opts: r.shuffle(opts.concat(pick)) };
        }
        const g = TT.gen(diff, r), asX = g.p === 'X'; return Object.assign({ kind: 'ttt', asX }, g);
      },
      render(box, it, api) {
        if (it.kind === 'ttt') {
          box.append(kit.title(it.asX ? 'أنت X وعليك الدور: أين تلعب؟' : 'الخصم O ماهر ولا يخطئ: أين سيلعب الآن؟', 'اختر المربّع'));
          const g = h('div', { class: 'ttt' });
          it.b.forEach((v, i) => g.append(h('button', { class: v, 'data-ok': MV.testMode && i === it.ans ? '1' : null, disabled: !!v, onClick: e => { [...g.children].forEach(c => c.disabled = true); const ok = i === it.ans; e.currentTarget.classList.add(ok ? 'ok' : 'bad'); if (!ok) g.children[it.ans].classList.add('ok'); api.done(ok); } }, v)));
          box.append(g);
        } else {
          box.append(kit.title('لعبة الأعواد: أنت تبدأ', 'من يأخذ آخر عود يفوز. اختر النقلة التي تضمن لك الفوز.'));
          box.append(h('div', { class: 'heaps' }, it.hp.map((n, j) => h('div', { class: 'heap' }, h('b', null, `كومة ${j + 1}`), range(n).map(() => h('i'))))));
          const win = (j, k) => it.wins.some(w => w.j === j && w.k === k);
          kit.mc(box, { cols: 2, options: it.opts.map(o => ({ label: `خذ ${o.k} من الكومة ${o.j + 1}`, correct: win(o.j, o.k) })), onAnswer: ok => api.done(ok) });
        }
      },
      explain: it => it.kind === 'ttt' ? (it.easy ? 'هذه النقلة إما تفوز فوراً أو تمنع فوز الخصم الفوري.' : 'هذه هي النقلة الوحيدة التي تحقق أفضل نتيجة ممكنة مع لعب سليم من الطرفين (تنشئ تهديدين أو تمنع فخاً).') : `الحل: اجعل ناتج XOR لأحجام الأكوام = 0 بعد نقلتك (خذ ${it.wins[0].k} من الكومة ${it.wins[0].j + 1}). عندها يخسر الخصم مهما فعل.`,
    });
  },
});

/* ============ اتخاذ القرار ============ */
MV.define({
  id: 'decision', name: 'اتخاذ القرار', en: 'Decision Making', realms: ['strategy'], skills: ['decision', 'math'], type: 'quiz', minutes: 6,
  blurb: 'قرارات تحت عدم اليقين وقيود الوقت: قارن المخاطر بالعوائد، وارسم أفضل خطة ضمن الميزانية.',
  rules: ['في أسئلة الاحتمالات: اختر الخيار ذي أعلى قيمة متوقعة (مجموع الاحتمال × القيمة).', 'في أسئلة المهام: اختر المجموعة التي تحقق أعلى قيمة دون تجاوز الوقت المتاح.', 'لا توجد إجابة «تبدو جيدة» — هناك إجابة واحدة هي الأفضل رياضياً.'],
  levelNote: l => ['قيمة متوقعة بسيطة', 'ثلاث نتائج للخيار', 'مهام وميزانية', 'فروق أضيق', 'مسائل أصعب وأدق'][l - 1],
  selfTest() { const r = RNG(8), o = []; for (let d = 0; d <= 10; d++) { const q = r.chance(0.5) ? DEC.ev(d, r) : DEC.knap(d, r); o.push(!!q && q.opts.filter(x => x.correct).length === 1); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 6, quickRounds: 3, par: 38,
      make(diff, i, r) { return diff >= 3 && r.chance(0.5) ? DEC.knap(diff, r) : DEC.ev(diff, r); },
      render(box, it, api) {
        if (it.kind === 'ev') {
          box.append(kit.title('أي خيار يعطيك أعلى قيمة متوقعة؟', 'القيمة المتوقعة = مجموع (الاحتمال × الناتج)'));
          kit.mc(box, { cols: 1, cls: 'col', options: it.opts.map(o => ({ label: o.label, correct: o.correct })), onAnswer: ok => api.done(ok) });
        } else {
          box.append(kit.title(`لديك ${it.budget} ساعات فقط. أي مجموعة مهام تحقق أعلى قيمة؟`, 'لا تتجاوز الوقت المتاح'));
          box.append(h('table', { class: 'opt-tbl' }, h('tr', null, h('th', null, 'المهمة'), h('th', null, 'الوقت (ساعة)'), h('th', null, 'القيمة')), it.tasks.map(t => h('tr', null, h('td', null, t.n), h('td', null, t.t), h('td', null, t.v)))));
          kit.mc(box, { cols: 1, cls: 'col', options: it.opts.map(o => ({ label: o.label, correct: o.correct })), onAnswer: ok => api.done(ok) });
        }
      },
      explain: it => it.exp,
    });
  },
});
const DEC = (() => {
  const fmt = v => v >= 0 ? `+${v}` : `−${-v}`;
  function ev(diff, r) {
    const n3 = diff >= 2; const margin = Math.max(1.5, 8 - diff * 0.6);
    for (let t = 0; t < 300; t++) {
      const opts = range(4, () => {
        const sure = r.chance(0.2);
        let probs = sure ? [100] : r.pick(n3 && r.chance(0.6) ? [[50, 30, 20], [60, 30, 10], [40, 40, 20], [70, 20, 10]] : [[50, 50], [60, 40], [70, 30], [80, 20], [25, 75]]);
        const vals = probs.map(() => r.int(-8, 24) * 5);
        const e = probs.reduce((a, p, i) => a + p * vals[i] / 100, 0);
        return { e, label: probs.map((p, i) => `${p}% ← ${fmt(vals[i])}`).join('، '), p: probs, v: vals };
      });
      const so = opts.slice().sort((a, b) => b.e - a.e);
      if (so[0].e - so[1].e < margin || so[0].e < 0) continue;
      opts.forEach((o, i) => { o.label = 'الخيار ' + 'أبجد'[i] + ':  ' + o.label; o.correct = o === so[0]; });
      return { kind: 'ev', opts, exp: 'القيم المتوقعة: ' + opts.map(o => `${o.label.split(':')[0]} = ${(+o.e.toFixed(1))}`).join('، ') + ' ← الأعلى هو الصحيح.' };
    }
    return ev(0, r);
  }
  const NAMES = ['تقرير', 'اجتماع', 'برمجة', 'تدريب', 'مراجعة', 'تصميم', 'اتصال', 'تسليم'];
  function knap(diff, r) {
    for (let t = 0; t < 400; t++) {
      const n = diff >= 7 ? 7 : diff >= 5 ? 6 : 5, names = r.sample(NAMES, n);
      const tasks = names.map(x => ({ n: x, t: r.int(1, 5), v: r.int(3, 20) })), total = tasks.reduce((a, x) => a + x.t, 0), budget = Math.max(4, Math.round(total * r.pick([0.4, 0.5, 0.6])));
      const subs = []; for (let m = 1; m < (1 << n); m++) { let tm = 0, v = 0; const idx = []; for (let i = 0; i < n; i++) if (m >> i & 1) { tm += tasks[i].t; v += tasks[i].v; idx.push(i); } subs.push({ m, tm, v, idx }); }
      const feas = subs.filter(s => s.tm <= budget).sort((a, b) => b.v - a.v);
      if (feas.length < 4 || feas[0].v === feas[1].v) continue;
      const over = subs.filter(s => s.tm > budget && s.v > feas[0].v && s.tm <= budget + 3).sort((a, b) => a.tm - b.tm);
      const near = feas.slice(1, 6).filter(s => s.v < feas[0].v);
      if (!over.length || near.length < 2) continue;
      const pick = [feas[0], over[0], ...r.sample(near, 2)];
      const lab = s => s.idx.map(i => tasks[i].n).join(' + ');
      const opts = r.shuffle(pick.map(s => ({ label: lab(s), correct: s === feas[0], s })));
      return { kind: 'knap', tasks, budget, opts, exp: `الأفضل: ${lab(feas[0])} (وقت ${feas[0].tm} وقيمة ${feas[0].v}). الخيارات الأخرى إمّا تتجاوز ${budget} ساعات أو تحقق قيمة أقل.` };
    }
    return ev(2, r);
  }
  return { ev, knap };
})();

/* ============ التخطيط ============ */
MV.define({
  id: 'planning', name: 'التخطيط', en: 'Planning', realms: ['strategy', 'logic'], skills: ['planning', 'solving'], type: 'puzzle', minutes: 7,
  blurb: 'أبراج هانوي، لغز الإزاحة، وألغاز سكب الماء: حلّها بأقل عدد من النقلات بالتخطيط المسبق.',
  rules: ['كل لغز له حدّ أدنى من النقلات يحسبه الحاسوب بدقة (أقصر حل).', 'كلما اقتربت من الحدّ الأدنى زادت نتيجتك.', 'يمكنك إعادة المحاولة من البداية. التلميح يُظهر النقلة الأولى من أقصر حل.'],
  levelNote: l => ['أبراج 3 أقراص ولغز ماء بسيط', 'أبراج 4 أقراص وإزاحة سهلة', 'إزاحة متوسطة', 'أبراج 5 أقراص وإزاحة أصعب', 'أبراج 6 وإزاحة صعبة'][l - 1],
  selfTest() {
    const o = [];
    const hn = PL.hanoi(4); o.push(hn.opt === 15);
    const sl = PL.slideMake(2, RNG(3)); o.push(sl.opt > 0 && sl.opt <= 20);
    const jg = PL.jugsMake(3, RNG(4)); o.push(jg.opt >= 3);
    return { ok: o.every(Boolean), out: [o, sl.opt, jg.opt, jg.a, jg.b, jg.t] };
  },
  run(ctx) {
    const L = ctx.level, rng = ctx.rng;
    const kind = rng.pick(L <= 2 ? ['hanoi', 'jugs', 'slide'] : ['hanoi', 'slide', 'jugs']);
    const root = ctx.root; let moves = 0, solved = false, opt = 0, nextHint = null;
    const stat = h('div', { class: 'chstat' }), area = h('div'), tools = h('div', { class: 'chtools' });
    mount(root, h('div', { class: 'stack' }, stat, area, tools));
    const upd = () => { stat.className = 'chstat pstat'; stat.textContent = ''; stat.append(h('span', null, 'النقلات ', h('bdi', null, String(moves))), h('span', null, 'الأقصر ', h('bdi', null, String(opt)))); };
    function win() {
      if (solved) return; solved = true; const acc = clamp(opt / Math.max(moves, opt), 0.2, 1); stat.className = 'chstat'; stat.textContent = moves === opt ? 'حل مثالي بأقصر عدد من النقلات!' : `تم الحل في ${moves} نقلة (الأقصر ${opt})`;
      ctx.correct(); ctx.timeout(() => ctx.finish({ acc, items: 1, parTime: Math.max(40, opt * 5), complexity: 2 + L * 1.6 }), 1300);
    }
    const resetB = h('button', { class: 'btn ghost sm', onClick: () => init() }, 'إعادة اللغز');
    let hintFn = null;
    const hintB = ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', id: 'pl-hint', onClick: () => { if (solved || !hintFn) return; ctx.hint(); hintFn(true); } }, 'تلميح') : null;
    tools.append(hintB, resetB);
    let step = () => { };
    function init() {
      moves = 0; solved = false; clear(area); ctx.debug.step = () => step();
      if (kind === 'hanoi') hanoiUI(); else if (kind === 'slide') slideUI(); else jugsUI();
      upd();
    }
    function hanoiUI() {
      const n = Math.min(6, 2 + L), H = PL.hanoi(n); opt = H.opt;
      let pos = Array(n).fill(0), sel = -1;
      const top = (p, peg) => { for (let d = 0; d < n; d++) if (p[d] === peg) return d; return -1; };
      const pegs = [0, 1, 2].map(i => h('div', { class: 'peg', 'data-peg': i, onClick: () => tap(i) }));
      area.append(h('div', { class: 'hanoi' }, pegs));
      const cols = ['#e9c14f', '#d9594c', '#3db5a5', '#8cc152', '#4c9be0', '#9b7fe0'];
      const draw = () => pegs.forEach((pe, i) => { pe.className = 'peg' + (sel === i ? ' sel' : ''); pe.textContent = ''; for (let d = n - 1; d >= 0; d--) if (pos[d] === i) pe.append(h('div', { class: 'disc', style: `width:${28 + d * 13}px;background:${cols[d]}` })); });
      function mv(a, b) { const d = top(pos, a); pos[d] = b; moves++; ctx.sound('click'); sel = -1; draw(); upd(); if (pos.every(x => x === 2)) win(); }
      function tap(i) {
        if (solved) return;
        if (sel < 0) { if (top(pos, i) >= 0) sel = i; } else if (sel === i) sel = -1; else { const a = top(pos, sel), b = top(pos, i); if (b < 0 || b > a) return mv(sel, i); ctx.mistake(); sel = -1; toast('لا يمكن وضع قرص كبير فوق أصغر منه', 'bad'); }
        draw();
      }
      const path = () => PL.hanoiSolve(pos);
      hintFn = () => { const p = path(); if (p && p.length) { sel = p[0][0]; draw(); toast(`حرّك من العمود ${p[0][0] + 1} إلى العمود ${p[0][1] + 1}`); } };
      step = () => { const p = path(); if (p && p.length && !solved) mv(p[0][0], p[0][1]); };
      draw();
    }
    function slideUI() {
      const S = PL.slideMake(L, rng); opt = S.opt; let b = S.start.split('').map(Number);
      const g = h('div', { class: 'slide' }); area.append(g);
      const draw = () => { g.textContent = ''; b.forEach((v, i) => g.append(h('button', { class: v ? '' : 'e', 'data-i': i, onClick: () => tap(i) }, v ? String(v) : ''))); };
      function tap(i) {
        if (solved) return; const z = b.indexOf(0), dx = Math.abs((i % 3) - (z % 3)), dy = Math.abs(((i / 3) | 0) - ((z / 3) | 0));
        if (dx + dy !== 1) return; [b[i], b[z]] = [b[z], b[i]]; moves++; ctx.sound('click'); draw(); upd(); if (b.join('') === '123456780') win();
      }
      const path = () => bfsPath(b.join(''), PL.slideN, k => k === '123456780');
      hintFn = () => { const p = path(); if (p && p.length) { const i = b.indexOf(p[0]); g.children[i].style.outline = '3px solid var(--accent)'; } };
      step = () => { const p = path(); if (p && p.length && !solved) tap(b.indexOf(p[0])); };
      draw();
    }
    function jugsUI() {
      const J = PL.jugsMake(L, rng); opt = J.opt; let st = [0, 0];
      const vs = [0, 1].map(() => h('div', { class: 'vessel' }, h('i'))), labs = [0, 1].map(() => h('div', { class: 'lab' }));
      const cap = [J.a, J.b];
      area.append(h('div', { class: 'chstat' }, `المطلوب: الحصول على ${J.t} لتراً بالضبط في أحد الوعاءين`));
      area.append(h('div', { class: 'jugs' }, [0, 1].map(i => h('div', { class: 'jug' }, vs[i], labs[i]))));
      const acts = PL.jugAct;
      const g = h('div', { class: 'jact' }, acts.map((a, ai) => h('button', { class: 'btn ghost', 'data-a': ai, onClick: () => doAct(ai) }, a.label(J))));
      area.append(g);
      const draw = () => [0, 1].forEach(i => { vs[i].style.height = cap[i] * 18 + 'px'; vs[i].firstChild.style.height = (st[i] / cap[i] * 100) + '%'; labs[i].textContent = `\u2066${'AB'[i]}: ${st[i]} / ${cap[i]}\u2069`; });
      function doAct(ai) { if (solved) return; const ns = acts[ai].f(st, cap); if (ns[0] === st[0] && ns[1] === st[1]) return; st = ns; moves++; ctx.sound('click'); draw(); upd(); if (st[0] === J.t || st[1] === J.t) win(); }
      const path = () => bfsPath(st.join(','), k => { const s = k.split(',').map(Number); return acts.map((a, ai) => [a.f(s, cap).join(','), ai]); }, k => { const s = k.split(',').map(Number); return s[0] === J.t || s[1] === J.t; });
      hintFn = () => { const p = path(); if (p && p.length) g.children[p[0]].style.outline = '3px solid var(--accent)'; };
      step = () => { const p = path(); if (p && p.length && !solved) doAct(p[0]); };
      draw();
    }
    init();
  },
});
const PL = (() => {
  const hanoi = n => ({ n, opt: 2 ** n - 1 });
  function hanoiN(k) {
    const pos = k.split('').map(Number), n = pos.length, top = peg => { for (let d = 0; d < n; d++) if (pos[d] === peg) return d; return -1; }, out = [];
    for (let a = 0; a < 3; a++) { const d = top(a); if (d < 0) continue; for (let b = 0; b < 3; b++) { if (b === a) continue; const t = top(b); if (t < 0 || t > d) { const p = pos.slice(); p[d] = b; out.push([p.join(''), [a, b]]); } } }
    return out;
  }
  const hanoiSolve = pos => bfsPath(pos.join(''), hanoiN, k => /^2+$/.test(k));
  const slideN = k => {
    const z = k.indexOf('0'), r = (z / 3) | 0, c = z % 3, out = [];
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nr = r + dr, nc = c + dc; if (nr < 0 || nr > 2 || nc < 0 || nc > 2) continue; const j = nr * 3 + nc, a = k.split(''); [a[z], a[j]] = [a[j], a[z]]; out.push([a.join(''), +k[j]]); }
    return out;
  };
  function slideMake(level, r) {
    const lo = [5, 9, 13, 17, 21][level - 1], hi = lo + 4;
    for (let t = 0; t < 60; t++) {
      let k = '123456780', last = null;
      for (let s = 0; s < [10, 16, 24, 32, 44][level - 1]; s++) { const ns = slideN(k).filter(x => x[0] !== last); const [nk] = r.pick(ns); last = k; k = nk; }
      const p = bfsPath(k, slideN, x => x === '123456780'); if (p && p.length >= lo && p.length <= hi + 6) return { start: k, opt: p.length };
    }
    const k = '123456708', p = bfsPath(k, slideN, x => x === '123456780'); return { start: k, opt: p.length };
  }
  const jugAct = [
    { label: j => `املأ A (${j.a})`, f: (s, c) => [c[0], s[1]] }, { label: j => `املأ B (${j.b})`, f: (s, c) => [s[0], c[1]] },
    { label: () => 'أفرغ A', f: s => [0, s[1]] }, { label: () => 'أفرغ B', f: s => [s[0], 0] },
    { label: () => 'اسكب A ← B', f: (s, c) => { const m = Math.min(s[0], c[1] - s[1]); return [s[0] - m, s[1] + m]; } },
    { label: () => 'اسكب B ← A', f: (s, c) => { const m = Math.min(s[1], c[0] - s[0]); return [s[0] + m, s[1] - m]; } },
  ];
  function jugsMake(level, r) {
    const lo = 3 + level, hi = 5 + level * 2;
    for (let t = 0; t < 300; t++) {
      const a = r.int(3, 8), b = r.int(a + 1, 13), tg = r.int(1, b - 1); const cap = [a, b];
      const p = bfsPath('0,0', k => { const s = k.split(',').map(Number); return jugAct.map((x, i) => [x.f(s, cap).join(','), i]); }, k => { const s = k.split(',').map(Number); return s[0] === tg || s[1] === tg; });
      if (p && p.length >= Math.min(lo, 7) && p.length <= hi && tg !== a && tg !== b) return { a, b, t: tg, opt: p.length };
    }
    return { a: 3, b: 5, t: 4, opt: 6 };
  }
  return { hanoi, hanoiSolve, slideMake, slideN, jugsMake, jugAct };
})();

/* ============ إدارة الموارد ============ */
const RS = (() => {
  function make(level, r) {
    const T = 6 + level, y = r.int(7, 10), base = r.int(14, 20), g0 = r.int(25, 40);
    const tax = {}, nt = Math.min(3, Math.floor(level / 2) + (level > 1 ? 1 : 0));
    for (let i = 0; i < nt; i++) { const t = r.int(3, T - 1); tax[t] = r.int(20, 30) + level * 5; }
    const sale = r.int(2, T - 3);
    return { T, y, base, g0, tax, sale, w0: 1 };
  }
  const cost = (P, t, w) => Math.round((P.base + 3 * w) * (t === P.sale ? 0.6 : 1));
  function step(P, t, g, w, k) { // يرجع الحالة بعد دور واحد أو null إن لم تتوفر الميزانية
    let tot = 0; for (let j = 0; j < k; j++) tot += cost(P, t, w + j);
    if (tot > g) return null;
    let ng = g - tot + w * P.y, nw = w; const tx = P.tax[t];
    if (tx) { if (ng >= tx) ng -= tx; else { const lack = tx - ng; nw = Math.max(0, w - Math.ceil(lack / 10)); ng = 0; } if (nw < w) return { g: ng, w: nw + k - 0 }; }
    return { g: ng, w: nw + k };
  }
  function optimum(P, t0 = 1, g0 = P.g0, w0 = P.w0) {
    const memo = new Map();
    function f(t, g, w) {
      if (t > P.T) return { v: g, k: 0 };
      const key = t * 1e7 + g * 100 + w; if (memo.has(key)) return memo.get(key);
      let best = { v: -1, k: 0 };
      for (let k = 0; k <= 8; k++) { const s = step(P, t, g, w, k); if (!s) break; const r = f(t + 1, s.g, s.w).v; if (r > best.v) best = { v: r, k }; }
      memo.set(key, best); return best;
    }
    return f(t0, g0, w0);
  }
  function noHire(P) { let g = P.g0, w = P.w0; for (let t = 1; t <= P.T; t++) { const s = step(P, t, g, w, 0); g = s.g; w = s.w; } return g; }
  return { make, cost, step, optimum, noHire };
})();

MV.define({
  id: 'resources', name: 'إدارة الموارد', en: 'Resource Management', realms: ['strategy'], skills: ['planning', 'decision', 'math'], type: 'board', minutes: 8,
  blurb: 'ورشة صغيرة: وظّف عمّالاً يزيدون دخلك، لكن الضرائب والتخفيضات المعلنة مسبقاً تفرض توقيتاً ذكياً. هل تستثمر الآن أم تدّخر؟',
  rules: ['كل عامل يدرّ ربحاً ثابتاً في كل دور، لكنه يبدأ العمل في الدور التالي لتوظيفه.', 'تكلفة التوظيف ترتفع مع عدد العمال، وفي دور التخفيض تنخفض 40%.', 'الضرائب المعلنة تُسحب في أدوارها؛ إن عجزت عن دفعها تخسر عمالاً.', 'الهدف: أكبر رصيد في نهاية الأدوار (العمال لا قيمة لهم في النهاية).', 'نتيجتك تُقارَن بالحل الأمثل الذي يحسبه الحاسوب.'],
  levelNote: l => `${6 + l} أدوار${l > 1 ? ' مع ضرائب' : ''}`,
  selfTest() { const o = []; for (let l = 1; l <= 5; l++) { const P = RS.make(l, RNG(l)), opt = RS.optimum(P); o.push(opt.v >= RS.noHire(P)); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    const P = RS.make(ctx.level, ctx.rng), opt = RS.optimum(P), base = RS.noHire(P);
    let t = 1, g = P.g0, w = P.w0, hire = 0, over = false;
    const kvs = {}; const kv = (k, lab) => { kvs[k] = h('div', { class: 'v' }, '0'); return h('div', { class: 'kv' }, kvs[k], h('div', { class: 'k' }, lab)); };
    const top = h('div', { class: 'rsrc' }, kv('t', 'الدور'), kv('g', 'الرصيد'), kv('w', 'العمّال'));
    const info = h('div', { class: 'chstat' }), ev = h('ul', { class: 'evlist' }), msg = h('div', { class: 'muted small', style: 'text-align:center;min-height:1.4em' });
    const addB = h('button', { class: 'btn primary', id: 'rs-hire', onClick: () => { const c = hireCost(hire); if (c <= g - hireSpent()) { hire++; draw(); } else toast('رصيدك لا يكفي', 'bad'); } });
    const subB = h('button', { class: 'btn ghost', onClick: () => { if (hire > 0) { hire--; draw(); } } }, 'إلغاء توظيف');
    const endB = h('button', { class: 'btn', id: 'rs-end', onClick: endTurn }, 'إنهاء الدور');
    const hintB = ctx.hintsAllowed ? h('button', { class: 'btn ghost sm', id: 'rs-hint', onClick: () => { ctx.hint(); const o = RS.optimum(P, t, g, w); msg.textContent = `تلميح: الخيار الأنسب هذا الدور هو توظيف ${o.k} عامل.`; } }, 'تلميح') : null;
    mount(ctx.root, h('div', { class: 'stack' }, top, info, ev, h('div', { class: 'chtools' }, addB, subB), h('div', { class: 'chtools' }, endB, hintB), msg));
    const hireCost = j => RS.cost(P, t, w + j), hireSpent = () => { let s = 0; for (let j = 0; j < hire; j++) s += hireCost(j); return s; };
    function draw() {
      kvs.t.textContent = `${t} / ${P.T}`; kvs.g.textContent = g - hireSpent(); kvs.w.textContent = `${w}${hire ? ' (+' + hire + ')' : ''}`;
      info.textContent = `كل عامل يدرّ ${P.y} في الدور. ${t === P.sale ? 'دور التخفيض: التوظيف أرخص 40%!' : ''}`;
      addB.textContent = `وظّف عاملاً (−${hireCost(hire)})`;
      ev.textContent = ''; for (let i = t; i <= P.T; i++) { if (P.tax[i] || i === P.sale) ev.append(h('li', { class: i === t ? 'now' : '' }, i === P.sale ? `الدور ${i}: تخفيض على التوظيف` : `الدور ${i}: ضريبة ${P.tax[i]}`)); }
      if (!ev.children.length) ev.append(h('li', null, 'لا أحداث قادمة'));
    }
    function endTurn() {
      if (over) return; const prevW = w + hire, s = RS.step(P, t, g, w, hire), tx = P.tax[t];
      g = s.g; w = s.w; hire = 0;
      msg.textContent = tx ? (w < prevW ? 'عجزت عن دفع الضريبة وخسرت عمالاً!' : `دُفعت الضريبة ${tx}.`) : '';
      t++; if (t > P.T) return finish(); draw();
    }
    function finish() {
      over = true; const acc = opt.v > base ? clamp((g - base) / (opt.v - base), 0, 1) : 1;
      info.textContent = `رصيدك النهائي ${g} — الأمثل ${opt.v} — بدون توظيف ${base}`; kvs.t.textContent = 'انتهى'; addB.disabled = subB.disabled = endB.disabled = true;
      if (acc < 0.7) ctx.mistake(); else ctx.correct();
      ctx.timeout(() => ctx.finish({ acc, items: P.T, complexity: 2 + ctx.level * 1.5, parTime: P.T * 14 }), 1600);
    }
    ctx.debug.step = () => { if (over) return; const o = RS.optimum(P, t, g, w); hire = 0; for (let j = 0; j < o.k; j++) hire++; endTurn(); };
    draw();
  },
});
