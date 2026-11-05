'use strict';
/* ============ أكاديمية الشطرنج: صفحة التصنيف + مشغّل الدروس التفاعلية ============ */
MV.css(`
.acad-top{display:grid;gap:14px;grid-template-columns:1fr}
@media(min-width:900px){.acad-top{grid-template-columns:1.1fr 1fr}}
.elo-card{display:flex;flex-direction:column;gap:10px}
.elo-big{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.elo-big b{font-family:var(--f-disp);font-size:3.2rem;line-height:1;direction:ltr;unicode-bidi:isolate}
.elo-big .tag{font-size:.8rem}
.elo-goal{font-size:.85rem;color:var(--muted)}
.opp-list{display:grid;gap:8px}
.opp{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-s);background:var(--surface2);text-align:start;color:var(--text)}
.opp.on{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent) inset}
.opp .e{font-family:var(--f-disp);font-size:1.25rem;min-width:3.4em;direction:ltr;unicode-bidi:isolate}
.opp .n{flex:1;min-width:0}.opp .n small{display:block;color:var(--muted)}
.opp .rec{font-size:.78rem;color:var(--muted);direction:ltr;unicode-bidi:isolate}
.stage{border:1px solid var(--line);border-radius:var(--r);background:var(--surface);padding:14px;margin-bottom:12px}
.stage-h{display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap}
.stage-h h3{margin:0}
.stage-h .rng{font-size:.78rem;color:var(--muted);direction:ltr;unicode-bidi:isolate}
.les-list{display:grid;gap:6px;margin-top:10px}
.les{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:var(--r-s);border:1px solid var(--line);background:var(--surface2);color:var(--text);text-decoration:none}
.les:hover{border-color:var(--line2)}
.les .ck{width:24px;height:24px;border-radius:50%;border:1.5px solid var(--line2);display:grid;place-items:center;font-size:.8rem;flex:none}
.les.done .ck{background:var(--ok);border-color:var(--ok);color:#0d1218}
.les.next{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent) inset}
.les .t{flex:1;min-width:0}.les .t small{display:block;color:var(--muted)}
.les .st{font-size:.8rem;color:var(--warn);letter-spacing:1px}
.lsn-wrap{max-width:760px;margin:0 auto}
.lsn-top{display:flex;align-items:center;gap:10px;margin-bottom:6px}
.lsn-dots{display:flex;gap:4px;flex-wrap:wrap;margin:8px 0 12px}
.lsn-dots i{height:5px;flex:1;min-width:10px;border-radius:5px;background:var(--line2)}
.lsn-dots i.on{background:var(--accent)}.lsn-dots i.cur{background:var(--text)}
.lsn-text{margin-bottom:12px}
.lsn-text p{margin:.35em 0}
.lsn-text .big{font-size:1.1rem;font-weight:600}
.fb{min-height:2.6em;margin:10px 0;padding:10px 12px;border-radius:var(--r-s);border:1px solid var(--line);background:var(--surface2);font-size:.95rem}
.fb.ok{border-color:var(--ok);background:color-mix(in srgb,var(--ok) 12%,var(--surface))}
.fb.bad{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 10%,var(--surface))}
.fb.info{border-color:var(--accent)}
.lsn-ctl{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px}
.lsn-q{display:grid;gap:8px;margin:10px 0}
.lsn-q button{text-align:start;padding:11px 13px;border-radius:var(--r-s);border:1px solid var(--line2);background:var(--surface2);color:var(--text);font:inherit}
.lsn-q button.ok{border-color:var(--ok);background:color-mix(in srgb,var(--ok) 16%,var(--surface))}
.lsn-q button.bad{border-color:var(--bad);background:color-mix(in srgb,var(--bad) 14%,var(--surface))}
.lsn-done{text-align:center;padding:26px 10px}
.lsn-done .stars{font-size:2.2rem;color:var(--warn);letter-spacing:6px}
.cap{margin:8px 0;text-align:center;min-height:1.6em;color:var(--muted)}
.cap b{color:var(--text)}
.mini-board-note{font-size:.85rem;color:var(--muted);text-align:center}
`);

const ChessCourse = { stages: [], byId: {}, order: [] };
function chessStage(def) { ChessCourse.stages.push(def); def.lessons.forEach(l => { l.stage = def.id; ChessCourse.byId[l.id] = l; ChessCourse.order.push(l.id); }); }
const SQ = n => CH.unname(n);
const uciOf = m => CH.uci(m);
function parseUci(state, u) { return CH.legal(state).find(m => CH.uci(m) === u) || null; }

/* ---------- حالة الدورة ---------- */
const Course = {
  rec(id) { return ChessElo.rec().course[id] || null; },
  done(id) { return !!this.rec(id); },
  count() { return Object.keys(ChessElo.rec().course).filter(k => ChessCourse.byId[k]).length; },
  next() { return ChessCourse.order.find(id => !this.done(id)) || null; },
  complete(id, stars) {
    const c = ChessElo.rec().course, first = !c[id];
    if (first) c[id] = { ts: Date.now(), stars };
    else c[id].stars = Math.max(c[id].stars || 0, stars);
    let xp = 0;
    if (first) { xp = 18 + stars * 4; D().xp += xp; }
    Streak.touch(); Store.save(true);
    const fresh = checkAchievements(); Store.save(true);
    return { first, xp, fresh };
  },
  milestoneDone(l) { const o = CHG.OPP[l.opp]; const r = ChessElo.rec().opp[o.elo]; return !!(r && r.w > 0); },
};
MV.Course = Course; MV.ChessCourse = ChessCourse;

/* ---------- صفحة الأكاديمية ---------- */
Router.add('/chess', (view) => {
  const E = ChessElo, rec = E.rec(), cur = E.cur();
  let pick = E.suggest();
  const saved = D().inprog.chess;
  const list = h('div', { class: 'opp-list' });
  const drawOpp = () => mount(list, CHG.OPP.map((o, i) => {
    const r = rec.opp[o.elo] || { w: 0, d: 0, l: 0 };
    return h('button', { class: 'opp' + (pick === i ? ' on' : ''), style: '--accent:var(--strategy)', onClick: () => { pick = i; drawOpp(); } },
      h('span', { class: 'e' }, String(o.elo)),
      h('span', { class: 'n' }, h('b', null, o.name), h('small', null, i === E.suggest() ? 'الأنسب لتصنيفك الآن' : o.note)),
      h('span', { class: 'rec' }, `${r.w}-${r.d}-${r.l}`));
  }));
  drawOpp();
  const pts = rec.hist.slice(-30).map(x => ({ y: x.elo, label: fmtDate(x.ts) }));
  const ys = pts.map(p => p.y), lo = Math.max(0, Math.min(...ys, cur) - 100), hi = Math.max(...ys, cur) + 100;
  const total = ChessCourse.order.length, doneN = Course.count(), nxt = Course.next();
  const goal = 1500;
  mount(view, h('div', { class: 'page', style: '--accent:var(--strategy)' },
    pageHead('أكاديمية الشطرنج', 'دورة كاملة من تعلّم حركة القطع حتى مستوى ≈ 1500 إيلو، ومباريات مصنّفة ضد خصوم بتصنيفات معروفة داخل التطبيق.'),
    h('div', { class: 'acad-top' },
      h('section', { class: 'panel elo-card' },
        h('h3', null, 'تصنيفك (Elo)'),
        h('div', { class: 'elo-big' }, h('b', null, String(cur)), h('span', { class: 'chip' }, E.band(cur)), E.provisional() ? h('span', { class: 'chip warn tag' }, 'مؤقّت — يستقر بعد 10 مباريات') : null),
        bar(clamp((cur - 400) / (goal - 400), 0, 1), 'var(--strategy)'),
        h('div', { class: 'elo-goal' }, cur >= goal ? 'بلغتَ هدف الدورة (1500). أكمل بمواجهة الخصم الأقوى.' : `الهدف: ${goal} · متبقٍّ ${goal - cur} نقطة`),
        h('div', { class: 'kv-grid four' }, [['المباريات', rec.games], ['أعلى تصنيف', rec.peak || '—'], ['الدروس', `${doneN}/${total}`], ['التقدّم', Math.round(doneN / total * 100) + '%']].map(([k, v]) => h('div', { class: 'kv' }, h('div', { class: 'v' }, String(v)), h('div', { class: 'k' }, k)))),
        pts.length > 1 ? lineChart(pts, { min: lo, max: hi, color: 'var(--strategy)', fmt: v => Math.round(v) }) : h('p', { class: 'muted small' }, 'ستظهر هنا منحنى تصنيفك بعد مباراتك الثانية.'),
        h('p', { class: 'muted small' }, 'التصنيف داخلي مبنيّ على نتائجك أمام خصوم التطبيق (معادلة إيلو القياسية) — ليس تصنيفاً رسمياً من FIDE أو أي موقع.')),
      h('section', { class: 'panel' },
        h('h3', null, 'مباراة مصنّفة'),
        h('p', { class: 'muted small' }, 'اختر خصماً. الفوز على خصم أقوى يرفع تصنيفك أكثر، والخسارة أمام أضعف منك تخفضه أكثر. الأرقام يمين كل خصم: فوز-تعادل-خسارة.'),
        list,
        h('div', { class: 'actions', style: 'margin-top:12px' },
          h('button', { class: 'btn primary', id: 'btn-rated', onClick: () => Play.start('chess', { level: 3, kind: 'manual', opp: pick }) }, 'ابدأ المباراة'),
          saved ? h('button', { class: 'btn ghost', id: 'btn-rated-resume', onClick: () => Play.start('chess', { level: 3, kind: 'manual', resume: true }) }, 'متابعة مباراة محفوظة') : null,
          h('a', { class: 'btn ghost', href: '#/game/chesspuzzle' }, 'ألغاز الكش مات')))),
    h('div', { class: 'ph-row', style: 'margin-top:22px' }, h('h2', null, 'الدورة'), nxt ? h('a', { class: 'btn primary sm', id: 'btn-next-lesson', href: '#/chess/lesson/' + nxt }, doneN ? 'الدرس التالي' : 'ابدأ الدورة') : h('span', { class: 'chip ok' }, 'أكملتَ كل الدروس')),
    h('p', { class: 'muted' }, 'كل الدروس مفتوحة؛ الترتيب مقترح فقط. كل تمرين يتحقق منه محرّك الشطرنج. الدورة تعلّمك المعرفة، والتصنيف يقيس أثرها في اللعب الفعلي.'),
    ChessCourse.stages.map(st => {
      const ds = st.lessons.filter(l => l.t === 'milestone' ? Course.milestoneDone(l) || Course.done(l.id) : Course.done(l.id)).length;
      return h('section', { class: 'stage' },
        h('div', { class: 'stage-h' }, h('h3', null, st.title), h('span', { class: 'rng' }, `${st.range} · ${ds}/${st.lessons.length}`)),
        h('p', { class: 'muted small', style: 'margin:4px 0 0' }, st.blurb),
        h('div', { class: 'les-list' }, st.lessons.map(l => {
          const dn = l.t === 'milestone' ? (Course.milestoneDone(l) || Course.done(l.id)) : Course.done(l.id), r = Course.rec(l.id);
          return h('a', { class: 'les' + (dn ? ' done' : '') + (l.id === nxt ? ' next' : ''), href: '#/chess/lesson/' + l.id }, h('span', { class: 'ck' }, dn ? '✓' : ''), h('span', { class: 't' }, h('b', null, l.title), h('small', null, l.sub || '')), r && r.stars ? h('span', { class: 'st' }, '★'.repeat(r.stars)) : null);
        })));
    })));
}, 'chess');

/* ---------- مشغّل الدرس ---------- */
Router.add('/chess/lesson/:id', (view, { id }) => {
  const L = ChessCourse.byId[id]; if (!L) { Router.go('/chess'); return; }
  if (L.t === 'milestone') return milestonePage(view, L);
  let si = 0, mistakes = 0;
  const dots = h('div', { class: 'lsn-dots' }), body = h('div');
  const exit = () => Router.go('/chess');
  const closedNow = () => !body.isConnected;
  mount(view, h('div', { class: 'page lsn-wrap', style: '--accent:var(--strategy)' },
    h('div', { class: 'lsn-top' }, h('button', { class: 'back-link', onClick: exit }, '→ الأكاديمية'), h('span', { class: 'muted small' }, (ChessCourse.stages.find(s => s.id === L.stage) || {}).title || '')),
    h('h1', { class: 'display', style: 'margin:.2em 0' }, L.title), dots, body));
  const drawDots = () => mount(dots, L.steps.map((_, i) => h('i', { class: i < si ? 'on' : i === si ? 'cur' : '' })));
  function go(i) { si = i; drawDots(); renderStep(); window.scrollTo(0, 0); }
  const next = () => { if (si + 1 >= L.steps.length) finish(); else go(si + 1); };
  function finish() {
    const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;
    const r = Course.complete(id, stars), nx = Course.next();
    mount(dots);
    mount(body, h('div', { class: 'panel lsn-done' },
      h('div', { class: 'stars' }, '★'.repeat(stars) + '☆'.repeat(3 - stars)),
      h('h2', null, 'أحسنت! أكملتَ الدرس'), h('p', { class: 'muted' }, mistakes === 0 ? 'بلا أخطاء.' : `أخطاء: ${mistakes}`),
      r.first ? h('p', { class: 'note ok' }, `+${r.xp} XP`) : h('p', { class: 'muted small' }, 'أعدتَ درساً سبق إكماله (لا نقاط إضافية).'),
      r.fresh.length ? h('div', { class: 'unlock' }, r.fresh.map(a => h('div', null, '★ إنجاز جديد: ', h('b', null, a.name)))) : null,
      h('div', { class: 'actions', style: 'justify-content:center' },
        nx && nx !== id ? h('a', { class: 'btn primary lg', id: 'btn-lesson-next', href: '#/chess/lesson/' + nx }, 'الدرس التالي') : null,
        h('a', { class: 'btn ghost lg', href: '#/chess' }, 'الأكاديمية'))));
  }
  /* ---- لبنات مشتركة ---- */
  const textPanel = st => h('section', { class: 'panel lsn-text' }, (Array.isArray(st.text) ? st.text : [st.text]).filter(Boolean).map((p, i) => h('p', { class: i === 0 && st.lead ? 'big' : '' }, p)));
  const flipFor = (st, state) => st.flip != null ? st.flip : state.turn === 'b';
  const mkFb = () => h('div', { class: 'fb info' }, '');
  const setFb = (el, kind, msg) => { el.className = 'fb ' + kind; el.textContent = msg; };
  const ctlRow = (...btns) => h('div', { class: 'lsn-ctl' }, btns.filter(Boolean));
  const nextBtn = (label = 'التالي', hidden = false) => { const b = h('button', { class: 'btn primary', id: 'lsn-next', onClick: next }, label); if (hidden) b.style.display = 'none'; return b; };
  const solveArrow = (ui, st, state) => { const u = (st.ok && st.ok[0]) || null; let m = u && parseUci(state, u); if (!m && st.mate) m = CH.matesIn(state, st.mate)[0]; if (!m) { const b = CH.best(state, { depth: 3, time: 900 }); m = b && b.move; } if (m) { ui.arrows([[m.f, m.t]]); ui.hint([m.f]); } return m; };

  const R = {
    /* نص + رقعة ثابتة اختيارية */
    show(st) {
      const parts = [textPanel(st)];
      if (st.fen) { const s0 = CH.fromFEN(st.fen), ui = CHG.boardUI({ flip: flipFor(st, s0), canMove: () => false }); ui.set(s0); if (st.marks) ui.marks(st.marks.map(SQ)); if (st.arrows) ui.arrows(st.arrows.map(a => [SQ(a.slice(0, 2)), SQ(a.slice(2, 4))])); parts.push(ui.el); if (st.caption) parts.push(h('p', { class: 'mini-board-note' }, st.caption)); }
      parts.push(ctlRow(nextBtn()));
      mount(body, parts);
    },
    /* تجريب حركة القطعة: يتكرر n مرات */
    explore(st) {
      let n = 0; const s0 = CH.fromFEN(st.fen), fb = mkFb(); setFb(fb, 'info', `اضغط على القطعة لترى نقلاتها، ثم انقلها. (${st.n} محاولات)`);
      const nb = nextBtn('التالي', true);
      const ui = CHG.boardUI({ flip: flipFor(st, s0), canMove: () => n < st.n, onMove(m) {
        n++; const s1 = CH.make(s0, m); ui.set(s1, m);
        if (n >= st.n) { setFb(fb, 'ok', st.done || 'ممتاز — أنت تتقن حركتها.'); nb.style.display = ''; }
        else { setFb(fb, 'info', `جيد! بقي ${st.n - n}.`); setTimeout(() => { if (!closedNow() && n < st.n) ui.set(s0); }, 700); }
      } });
      ui.set(s0); mount(body, textPanel(st), ui.el, fb, ctlRow(nb));
      ctxDebug.solve = () => { const ms = CH.legal(s0); if (ms.length) { n = 0; for (let k = 0; k < st.n; k++) ui.play(ms[k % ms.length]); } };
    },
    /* تحديد مربعات بالاسم */
    find(st) {
      const s0 = CH.fromFEN(st.fen || '8/8/8/8/8/8/8/8 w - - 0 1'), targets = st.squares.slice(); let k = 0;
      const fb = mkFb(), q = h('div', { class: 'lsn-text panel' }); const nb = nextBtn('التالي', true);
      const ask = () => { q.textContent = ''; q.append(h('p', { class: 'big' }, `اضغط على المربع: `, h('b', { style: 'direction:ltr;unicode-bidi:isolate;display:inline-block' }, targets[k]))); };
      const ui = CHG.boardUI({ flip: false, canMove: () => false, onSquare(i) {
        if (k >= targets.length) return;
        if (i === SQ(targets[k])) { k++; ui.marks([i]); if (k >= targets.length) { setFb(fb, 'ok', 'أحسنت! عرفتَ كل المربعات.'); q.textContent = 'تم!'; nb.style.display = ''; } else { setFb(fb, 'ok', 'صحيح!'); ask(); } }
        else { mistakes++; setFb(fb, 'bad', `ليس هذا. المربع ${targets[k]}: العمود ${targets[k][0]} (من اليسار) والصف ${targets[k][1]} (من الأسفل).`); }
      } });
      ui.set(s0); ask(); setFb(fb, 'info', 'الأبيض في الأسفل: الأعمدة a–h من اليسار، والصفوف 1–8 من الأسفل.');
      mount(body, textPanel(st), q, ui.el, fb, ctlRow(nb));
      ctxDebug.solve = () => { while (k < targets.length) { const e = ui.el.querySelector('[data-sq="' + targets[k] + '"]'); if (!e) break; e.click(); } };
    },
    /* تمرين نقلة واحدة (أو ثنائية) مع تحقق */
    task(st) {
      const s0 = CH.fromFEN(st.fen), fb = mkFb(); let locked = false, tries = 0, scores = null, ui;
      const nb = nextBtn('التالي', true), solveB = h('button', { class: 'btn ghost', id: 'lsn-solve', style: 'display:none', onClick: () => { solveArrow(ui, st, s0); setFb(fb, 'info', 'هذه هي النقلة — جرّبها بنفسك.'); } }, 'أرني الحل');
      setFb(fb, 'info', st.prompt || 'اختر النقلة الأفضل.');
      const accepted = m => {
        const u = uciOf(m);
        if ((st.ok || []).includes(u)) return { ok: 1 };
        if ((st.alt || []).includes(u)) return { ok: 1, alt: 1 };
        if (st.mate && CH.matesIn(s0, st.mate).some(x => CH.sameMove(x, m))) return { ok: 1 };
        if (st.noMate) { const ns = CH.make(s0, m); return CH.matesIn(ns, 1).length ? { ok: 0 } : { ok: 1 }; }
        if (st.tactic) { if (!scores) scores = CH.scoreMoves(s0, 3, 1500); const b = scores[0] ? scores[0].score : 0, me = scores.find(x => CH.sameMove(x.move, m)); if (me && me.score >= b - 40) return { ok: 1 }; }
        return { ok: 0 };
      };
      ui = CHG.boardUI({ flip: flipFor(st, s0), canMove: () => !locked, onMove(m) {
        locked = true; const a = accepted(m), s1 = CH.make(s0, m); ui.set(s1, m);
        if (a.ok) { setFb(fb, 'ok', (a.alt ? (st.altMsg || 'نقلة مقبولة، لكن هناك ما هو أفضل.') + ' ' : 'صحيح! ') + (st.why || '')); nb.style.display = ''; solveB.style.display = 'none'; }
        else {
          mistakes++; tries++; setFb(fb, 'bad', (st.wrong || 'ليست أفضل نقلة هنا.') + ' حاول مرة أخرى.');
          setTimeout(() => { if (closedNow()) return; ui.set(s0); locked = false; if (tries >= 2) solveB.style.display = ''; }, 1100);
        }
      } });
      ui.set(s0); mount(body, textPanel(st), ui.el, fb, ctlRow(solveB, nb));
      ctxDebug.solve = () => { const m = st.ok && parseUci(s0, st.ok[0]) || (st.mate && CH.matesIn(s0, st.mate)[0]) || (st.noMate && CH.legal(s0).find(x => !CH.matesIn(CH.make(s0, x), 1).length)) || CH.best(s0, { depth: 3, time: 900 }).move; ui.play(m); };
    },
    /* سؤال اختيار من متعدد */
    quiz(st) {
      const fb = mkFb(); const nb = nextBtn('التالي', true); let got = false;
      setFb(fb, 'info', 'اختر الإجابة الصحيحة.');
      const parts = [textPanel(st)];
      if (st.fen) { const s0 = CH.fromFEN(st.fen), ui = CHG.boardUI({ flip: flipFor(st, s0), canMove: () => false }); ui.set(s0); if (st.marks) ui.marks(st.marks.map(SQ)); if (st.arrows) ui.arrows(st.arrows.map(a => [SQ(a.slice(0, 2)), SQ(a.slice(2, 4))])); parts.push(ui.el); }
      const opts = h('div', { class: 'lsn-q' }, st.opts.map((o, i) => { const b = h('button', { 'data-i': i, 'data-ok': i === st.a ? '1' : '0', onClick: () => {
        if (got) return;
        if (i === st.a) { got = true; b.classList.add('ok'); setFb(fb, 'ok', 'صحيح! ' + (st.why || '')); nb.style.display = ''; }
        else { mistakes++; b.classList.add('bad'); setFb(fb, 'bad', st.hint || 'ليست الإجابة الصحيحة — فكّر مرة أخرى.'); }
      } }, o); return b; }));
      parts.push(opts, fb, ctlRow(nb)); mount(body, parts);
      ctxDebug.solve = () => $$('button[data-ok="1"]', opts)[0].click();
    },
    /* عرض نقلات متتالية بشرح */
    demo(st) {
      const s0 = CH.fromFEN(st.fen || CH.START); let state = s0, k = 0;
      const cap = h('div', { class: 'cap' }, st.start || 'اضغط «النقلة التالية» لتشاهد.');
      const nb = nextBtn('التالي', true);
      const ui = CHG.boardUI({ flip: !!st.flip, canMove: () => false }); ui.set(s0);
      const stepB = h('button', { class: 'btn primary', id: 'demo-step', onClick: () => {
        if (k >= st.moves.length) return;
        const [u, c] = st.moves[k], m = parseUci(state, u); if (!m) { cap.textContent = '⚠ نقلة غير قانونية في العرض'; return; }
        const label = CH.san(state, m), w = state.turn === 'w'; state = CH.make(state, m); ui.set(state, m); k++;
        cap.textContent = ''; cap.append(h('b', { style: 'direction:ltr;unicode-bidi:isolate;display:inline-block' }, `${w ? Math.ceil(k / 2) + '.' : Math.ceil(k / 2) + '...'} ${label}`), ' — ' + (c || ''));
        if (k >= st.moves.length) { stepB.disabled = true; nb.style.display = ''; if (st.end) cap.append(h('div', { style: 'margin-top:6px' }, st.end)); }
      } }, 'النقلة التالية'), resetB = h('button', { class: 'btn ghost', onClick: () => { state = s0; k = 0; ui.set(s0); cap.textContent = st.start || ''; stepB.disabled = false; } }, 'من البداية');
      mount(body, textPanel(st), ui.el, cap, ctlRow(stepB, resetB, nb));
      ctxDebug.solve = () => { while (k < st.moves.length) stepB.click(); };
    },
    /* لعب ضد المحرّك حتى هدف */
    play(st) {
      const s0 = CH.fromFEN(st.fen), me = s0.turn, cfg = st.eng || { depth: 2, noise: 0, time: 500 };
      let state = s0, locked = false, mv = 0, over = false, seen = {}; seen[CH.posKey(s0)] = 1;
      const fb = mkFb(); setFb(fb, 'info', st.prompt || 'ابدأ — الدور عليك.');
      const nb = nextBtn('التالي', true);
      const rst = () => { state = s0; locked = false; mv = 0; over = false; seen = {}; seen[CH.posKey(s0)] = 1; ui.set(s0); setFb(fb, 'info', 'بدأنا من جديد — الدور عليك.'); };
      const hintB = h('button', { class: 'btn ghost', id: 'play-hint', onClick: () => { if (over || locked) return; mistakes += 0.25; const b = CH.best(state, { depth: 4, time: 1200 }); if (b) { ui.arrows([[b.move.f, b.move.t]]); setFb(fb, 'info', 'تلميح: النقلة المقترحة معروضة بالسهم.'); } } }, 'تلميح');
      const resetB = h('button', { class: 'btn ghost', onClick: rst }, 'إعادة');
      const fail = msg => { over = true; mistakes++; setFb(fb, 'bad', msg + ' اضغط «إعادة».'); };
      const check = () => {
        const oc = CH.outcome(state, seen);
        if (st.goal === 'mate') { if (oc && oc.r === (me === 'w' ? 'w' : 'b')) { over = true; setFb(fb, 'ok', 'كش مات! أحسنت. ' + (st.why || '')); nb.style.display = ''; return true; } if (oc) { fail(oc.why === 'تعادل بالجمود (لا نقلات قانونية)' ? 'وقع جمود (تعادل) — انتبه ألا تترك للخصم دون نقلات.' : 'انتهت بتعادل.'); return true; } if (mv >= (st.max || 30)) { fail(`تجاوزتَ ${st.max || 30} نقلة.`); return true; } }
        if (st.goal === 'promote') {
          const q = state.b.some(p => p === (me === 'w' ? 'Q' : 'q'));
          if (q) { over = true; setFb(fb, 'ok', 'رُقّي البيدق إلى وزير وهو آمن! ' + (st.why || '')); nb.style.display = ''; return true; }
          const pawn = state.b.some(p => p === (me === 'w' ? 'P' : 'p'));
          if (!pawn) { fail('خسرتَ البيدق.'); return true; } if (oc) { fail('انتهت بتعادل.'); return true; } if (mv >= (st.max || 25)) { fail('نفد عدد النقلات.'); return true; }
        }
        return false;
      };
      const reply = () => {
        if (over) return; locked = true;
        const oc = CH.outcome(state, seen); if (oc) return;
        setTimeout(() => { if (closedNow() || over) return; const r = CH.best(state, Object.assign({}, cfg)); if (!r) return; state = CH.make(state, r.move); const k = CH.posKey(state); seen[k] = (seen[k] || 0) + 1; ui.set(state, r.move); locked = false; if (!check()) setFb(fb, 'info', CH.inCheck(state) ? 'كش! دورك.' : 'دورك.'); }, MV.testMode ? 30 : 450);
      };
      const ui = CHG.boardUI({ flip: me === 'b', canMove: () => !locked && !over && state.turn === me, onMove(m) {
        state = CH.make(state, m); const k = CH.posKey(state); seen[k] = (seen[k] || 0) + 1; mv++; ui.set(state, m);
        if (!check()) reply();
      } });
      ui.set(s0); mount(body, textPanel(st), ui.el, fb, ctlRow(hintB, resetB, nb));
      ctxDebug.solve = () => { let g = 0; const iv = () => { if (over || g++ > 80) return; if (!locked && state.turn === me) { const b = CH.best(state, { depth: 4, time: 800 }); ui.play(b.move); } setTimeout(iv, MV.testMode ? 60 : 80); }; iv(); };
    },
    /* تمارين من بنك مُولَّد ومتحقَّق بالمحرّك */
    bank(st) {
      const pool = (st.kind === 'mate1' ? CHBANK.filter(e => e[1] === 1) : st.kind === 'mate2' ? CHBANK.filter(e => e[1] === 2) : TBANK).filter(e => e[2] >= (st.lvl ? st.lvl[0] : 0) && e[2] <= (st.lvl ? st.lvl[1] : 99));
      const all = st.kind === 'tac' ? TBANK : st.kind === 'mate1' ? CHBANK.filter(e => e[1] === 1) : CHBANK.filter(e => e[1] === 2);
      const picks = RNG().sample(pool.length >= (st.count || 4) ? pool : all, st.count || 4);
      let k = 0;
      const stepNext = () => { if (k >= picks.length) return next(); const e = picks[k++]; const state = CH.fromFEN(e[0]);
        const sub = st.kind === 'tac' ? { t: 'task', fen: e[0], text: [`تمرين ${k} من ${picks.length} — ${st.kind === 'tac' ? 'أوجد النقلة التي تربح مادة' : e[1] === 1 ? 'مات في نقلة' : 'مات في نقلتين'}.`], tactic: true, ok: [e[1]], why: 'أحسنت!', wrong: 'ليست الأفضل — تحقّق من الكشوف والأخذ والتهديدات.' }
          : { t: 'task', fen: e[0], text: [`تمرين ${k} من ${picks.length} — ${e[1] === 1 ? 'مات في نقلة' : 'مات في نقلتين'}.`], mate: e[1], why: 'كش مات!', wrong: 'ليست النقلة المطلوبة.' };
        if (st.kind === 'tac') sub.ok = [e[1]];
        bankTask(sub, stepNext, e); };
      stepNext();
    },
    /* نقاط بلوغ تصنيف (تُعرض كدرس خاص) */
    milestone() { },
  };
  /* مهمّة البنك: مثل task لكن زر التالي يسحب التمرين التالي. للمات في نقلتين نكمل بعد ردّ الخصم */
  function bankTask(st, onDone, e) {
    const s0 = CH.fromFEN(st.fen), fb = mkFb(); let locked = false, tries = 0, scores = null, ui, phase = 1, state = s0, last;
    const nb = h('button', { class: 'btn primary', id: 'lsn-next', style: 'display:none', onClick: onDone }, 'التالي');
    const solveB = h('button', { class: 'btn ghost', id: 'lsn-solve', style: 'display:none', onClick: () => { solveArrow(ui, phase === 1 ? st : { mate: 1 }, state); } }, 'أرني الحل');
    setFb(fb, 'info', 'اختر النقلة.');
    const need2 = st.mate === 2;
    ui = CHG.boardUI({ flip: s0.turn === 'b', canMove: () => !locked, onMove(m) {
      locked = true;
      let okm;
      if (st.mate) okm = phase === 1 ? CH.matesIn(state, st.mate).some(x => CH.sameMove(x, m)) : CH.matesIn(state, 1).some(x => CH.sameMove(x, m));
      else { if (!scores) scores = CH.scoreMoves(s0, 3, 1500); const b = scores[0] ? scores[0].score : 0, me = scores.find(x => CH.sameMove(x.move, m)); okm = uciOf(m) === st.ok[0] || (me && me.score >= b - 40); }
      const prev = state; state = CH.make(state, m); ui.set(state, m);
      if (!okm) { mistakes++; tries++; setFb(fb, 'bad', st.wrong); setTimeout(() => { if (closedNow()) return; state = prev; ui.set(prev); locked = false; if (tries >= 2) solveB.style.display = ''; }, 1000); return; }
      if (need2 && phase === 1) { phase = 2; setFb(fb, 'info', 'الخصم يردّ…'); setTimeout(() => { if (closedNow()) return; const rr = RNG().pick(CH.legal(state)); state = CH.make(state, rr); ui.set(state, rr); locked = false; setFb(fb, 'info', 'أنهِ المات الآن.'); }, MV.testMode ? 30 : 600); return; }
      setFb(fb, 'ok', st.why); nb.style.display = ''; solveB.style.display = 'none';
    } });
    ui.set(s0); mount(body, textPanel(st), ui.el, fb, ctlRow(solveB, nb));
    ctxDebug.solve = () => { let m; if (st.mate) m = phase === 1 ? CH.matesIn(state, st.mate)[0] : CH.matesIn(state, 1)[0]; else m = parseUci(state, st.ok[0]); ui.play(m); };
  }
  const ctxDebug = (MV.lessonDebug = {});
  function renderStep() {
    const st = L.steps[si];
    ctxDebug.solve = null; ctxDebug.step = st;
    (R[st.t] || R.show)(st);
  }
  MV.lessonCtl = { go, next, get si() { return si; }, get steps() { return L.steps.length; }, get mistakes() { return mistakes; }, close() { } };
  go(0);
}, 'chess');

/* ---------- درس «نقطة بلوغ»: التغلب على خصم محدّد ---------- */
function milestonePage(view, l) {
  const o = CHG.OPP[l.opp], r = ChessElo.rec().opp[o.elo] || { w: 0, d: 0, l: 0 }, done = Course.milestoneDone(l);
  if (done && !Course.done(l.id)) { Course.complete(l.id, 3); }
  mount(view, h('div', { class: 'page lsn-wrap', style: '--accent:var(--strategy)' },
    h('div', { class: 'lsn-top' }, h('button', { class: 'back-link', onClick: () => Router.go('/chess') }, '→ الأكاديمية')),
    h('h1', { class: 'display' }, l.title),
    h('section', { class: 'panel lsn-text' }, (Array.isArray(l.text) ? l.text : [l.text]).map(p => h('p', null, p))),
    h('div', { class: 'kv-grid four' }, [['الخصم (تصنيف)', o.elo], ['فوز', r.w], ['تعادل', r.d], ['خسارة', r.l]].map(([k, v]) => h('div', { class: 'kv' }, h('div', { class: 'v' }, String(v)), h('div', { class: 'k' }, k)))),
    done ? h('p', { class: 'note ok' }, 'أنجزتَ هذه النقطة — تغلّبتَ على هذا الخصم.') : h('p', { class: 'note' }, 'تُنجَز النقطة تلقائياً عند أول فوز على هذا الخصم.'),
    h('div', { class: 'actions' }, h('button', { class: 'btn primary lg', id: 'btn-milestone', onClick: () => Play.start('chess', { level: 3, kind: 'manual', opp: l.opp }) }, 'العب ضد خصم ' + o.elo), h('a', { class: 'btn ghost lg', href: '#/chess' }, 'الأكاديمية'))));
}
