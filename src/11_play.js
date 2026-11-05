'use strict';
/* ============ إطار تشغيل الألعاب: التعريف، اللعب، النتيجة ============ */
const Play = {
  cur: null,        // جلسة جارية
  pending: null,    // خيارات انتقالية { gameId, opts }
  playlist: null,   // { kind, title, items:[{game,...}], idx, results:[] }
  view: null,

  exitPlaylist() { this.playlist = null; Router.go('/home'); },

  open(gameId, opts = {}) { this.pending = { gameId, opts }; Router.go('/game/' + gameId); },

  /* ---------- شاشة التعريف ---------- */
  intro(view, gameId) {
    const def = MV.byId[gameId];
    if (!def) { Router.go('/games'); return; }
    this.view = view;
    const opts = (this.pending && this.pending.gameId === gameId) ? this.pending.opts : {};
    this.pending = null;
    if (opts.playlist) this.playlist = opts.playlist;
    const g = Adapt.rec(gameId), plan = Adapt.plan(gameId), color = gameRealmColor(def);
    let chosen = opts.level || 0; // 0 = تكيّفي
    const saved = D().inprog[gameId];
    const pl = this.playlist && this.playlist.items[this.playlist.idx] && this.playlist.items[this.playlist.idx].game === gameId ? this.playlist : null;
    const levelNote = l => def.levelNote ? def.levelNote(l) : '';
    const noteEl = h('p', { class: 'muted small' });
    const segBtns = [];
    function updNote() {
      const l = chosen || plan.level;
      noteEl.textContent = (chosen ? 'مستوى يدوي: ' : 'المستوى التكيّفي: ') + LEVELS_AR[l - 1] + ' (' + LEVELS[l - 1] + ')' + (levelNote(l) ? ' — ' + levelNote(l) : '');
      segBtns.forEach((b, i) => b.classList.toggle('on', i === chosen));
    }
    const seg = h('div', { class: 'seg', role: 'group' }, ['تكيّفي', 1, 2, 3, 4, 5].map((t, i) => {
      const b = h('button', { class: 'seg-b', onClick: () => { chosen = i; updNote(); } }, String(t));
      segBtns.push(b); return b;
    }));
    const start = (resume) => this.start(gameId, { level: chosen || plan.level, kind: chosen ? 'manual' : plan.kind, resume, quick: opts.quick, assess: opts.assess, opp: opts.opp });
    const recent = g.hist.slice(-5).reverse();
    const accs = D().sessions.filter(s => s.game === gameId).slice(-8);
    const favBtn = h('button', { class: 'btn ghost sm', onClick: () => { D().fav[gameId] = !D().fav[gameId]; if (!D().fav[gameId]) delete D().fav[gameId]; Store.save(); favBtn.textContent = D().fav[gameId] ? '★ في المفضلة' : '☆ إضافة للمفضلة'; } }, D().fav[gameId] ? '★ في المفضلة' : '☆ إضافة للمفضلة');
    const timerChk = h('input', { type: 'checkbox', checked: D().settings.timer, onChange: e => { D().settings.timer = e.target.checked; Store.save(); } });
    mount(view, h('div', { class: 'page intro', style: `--accent:${color}` },
      h('button', { class: 'back-link', onClick: () => pl ? Play.exitPlaylist() : Router.back('/games') }, pl ? '→ الرئيسية' : '→ المكتبة'),
      pl ? h('div', { class: 'pl-banner' }, h('span', null, `${pl.title} — التمرين ${pl.idx + 1} من ${pl.items.length}`), h('button', { class: 'btn ghost sm', id: 'btn-exit-pl', onClick: () => Play.exitPlaylist() }, pl.kind === 'daily' ? 'خروج (أواصل لاحقاً)' : 'خروج')) : null,
      h('div', { class: 'intro-head' },
        h('div', { class: 'realm-tags' }, def.realms.map(r => h('a', { class: 'tag', href: '#/world/' + r, style: `--accent:${REALM[r].color}` }, REALM[r].short))),
        h('h1', { class: 'display' }, def.name),
        h('div', { class: 'en' }, def.en),
        h('p', { class: 'lead' }, def.blurb)),
      h('button', { class: 'tut-btn' + (tutDone(gameId) ? ' done' : ''), id: 'btn-learn', onClick: () => Router.go('/learn/' + gameId) },
        h('span', { class: 'ic' }, tutDone(gameId) ? '✓' : '🎓'),
        h('span', null, h('b', null, 'المرحلة التعليمية'), h('small', null, tutDone(gameId) ? 'أنجزتَها — يمكنك مراجعتها متى شئت' : 'جديد في اللعبة؟ شرح خطوة بخطوة + أمثلة محلولة + جولة تدريب غير محتسبة'))),
      h('div', { class: 'intro-grid' },
        h('section', { class: 'panel' },
          h('h3', null, 'طريقة اللعب'),
          h('ol', { class: 'rules' }, def.rules.map(r => h('li', null, r))),
          def.skills ? h('div', { class: 'chips' }, def.skills.map(k => h('span', { class: 'chip' }, SKILLS[k]))) : null),
        h('section', { class: 'panel' },
          h('h3', null, 'الصعوبة'), seg, noteEl,
          plan.kind === 'intro' && !chosen ? h('p', { class: 'note' }, 'هذا تحدٍّ تمهيدي لمساعدتك على الاستقرار في مستوى مناسب.') : null,
          plan.kind.startsWith('probe') && !chosen ? h('p', { class: 'note' }, 'تحدٍّ إضافي لتحديد مستواك الحقيقي — لا تقلق من النتيجة.') : null,
          def.noTimer ? null : h('label', { class: 'check' }, timerChk, ' عرض الوقت أثناء اللعب')),
        h('section', { class: 'panel stats-panel' },
          h('h3', null, 'سجلّك في هذه اللعبة'),
          h('div', { class: 'kv-grid' },
            kv('مستوى اللعبة', 1 + Math.floor(Math.sqrt(g.gxp / 25))), kv('الصعوبة الحالية', LEVELS[g.lvl - 1]),
            kv('الدقة (آخر 8)', accs.length ? pct(avg(accs.map(s => s.acc))) : '—'), kv('أفضل نتيجة', g.best || '—'),
            kv('عدد المحاولات', g.attempts), kv('متوسط الوقت', accs.length ? fmtTime(avg(accs.map(s => s.time))) : '—'),
            kv('آخر تدريب', g.last ? ago(g.last) : '—')),
          recent.length ? h('div', { class: 'spark' }, recent.map(e => h('span', { class: 'sp', style: `height:${8 + e.perf * 34}px`, title: pct(e.perf) }))) : null)),
      h('div', { class: 'actions sticky' },
        saved ? h('button', { class: 'btn primary lg', onClick: () => start(true) }, 'متابعة اللغز الحالي') : null,
        h('button', { class: 'btn ' + (saved ? 'ghost' : 'primary') + ' lg', onClick: () => start(false), id: 'btn-start' }, saved ? 'بدء جديد' : 'ابدأ اللعب'),
        favBtn)));
    updNote();
    function kv(k, v) { return h('div', { class: 'kv' }, h('div', { class: 'v' }, String(v)), h('div', { class: 'k' }, k)); }
  },

  /* ---------- تشغيل ---------- */
  start(gameId, o) {
    const def = MV.byId[gameId];
    if (!o.resume && !o.tutorial) delete D().inprog[gameId];
    this.cur = { def, o, started: false };
    Router.go('/play/' + gameId);
  },

  run(view, gameId) {
    const cur = this.cur;
    if (!cur || cur.def.id !== gameId) { Router.go('/game/' + gameId); return; }
    this.view = view;
    const def = cur.def, o = cur.o, color = gameRealmColor(def);
    const S = { mistakes: 0, hints: 0, correct: 0, t0: performance.now(), paused: 0, pauseAt: null, done: false, cleanups: [] };
    cur.S = S;
    const stage = h('div', { class: 'play-stage' });
    const chipM = h('span', { class: 'chip bad' }, 'أخطاء 0'), chipH = h('span', { class: 'chip warn' }, 'تلميحات 0');
    const timerEl = h('span', { class: 'chip timer' }, '00:00');
    const status = h('span', { class: 'muted small pb-status' });
    const upd = () => { chipM.textContent = 'أخطاء ' + S.mistakes; chipH.textContent = 'تلميحات ' + S.hints; };
    const elapsed = () => ((S.pauseAt != null ? S.pauseAt : performance.now()) - S.t0 - S.paused) / 1000;
    const bar = h('div', { class: 'play-bar' },
      h('button', { class: 'icon-btn', 'aria-label': 'خروج', onClick: () => quit() }, '✕'),
      h('div', { class: 'pb-title' }, h('b', null, def.name), h('span', { class: 'chip lvl' }, LEVELS_AR[o.level - 1]), status),
      h('div', { class: 'pb-chips' }, chipM, def.noHints ? null : chipH, def.noTimer ? null : timerEl));
    const tutBanner = o.tutorial ? h('div', { class: 'tut-banner' }, h('span', null, '🎓 مرحلة تعليمية — تدرّب بهدوء، لا شيء يُحتسب في تقدّمك'), h('button', { class: 'btn ghost sm', id: 'btn-rules', onClick: () => modal({ title: 'طريقة اللعب', body: h('ol', { class: 'rules' }, def.rules.map(r => h('li', null, r))), actions: [{ label: 'حسناً', primary: true }] }) }, 'القواعد')) : null;
    mount(view, h('div', { class: 'play', style: `--accent:${color}` }, bar, tutBanner, stage));
    if (!o.tutorial && !def.noTimer && D().settings.timer) { const iv = setInterval(() => { timerEl.textContent = fmtTime(elapsed()); }, 500); S.cleanups.push(() => clearInterval(iv)); } else timerEl.style.display = 'none';

    const quit = async () => {
      if (S.done) { Router.go('/game/' + def.id); return; }
      if (o.tutorial) { this.cleanup(); Router.go('/learn/' + def.id); return; }
      const pl = this.playlist && this.playlist.items[this.playlist.idx] && this.playlist.items[this.playlist.idx].game === def.id ? this.playlist : null;
      const sv = def.canSave;
      if (pl && pl.kind !== 'assess') {
        // داخل برنامج: خروج حر إلى الرئيسية، ويُستأنف البرنامج لاحقاً بزر «مواصلة»
        modal({ title: 'الخروج من التدريب؟', body: h('p', null, (sv ? 'سيُحفظ تقدّمك في هذه اللعبة. ' : 'لن تُسجَّل هذه المحاولة. ') + (pl.kind === 'daily' ? 'وبرنامج اليوم محفوظ — تواصله لاحقاً من الرئيسية بزر «مواصلة».' : 'يمكنك بدء جولة جديدة متى شئت.')),
          actions: [{ label: 'متابعة اللعب' }, { label: 'الخروج إلى الرئيسية', primary: true, onClick: () => { this.cleanup(); Play.exitPlaylist(); } }] });
        return;
      }
      if (!D().settings.confirmQuit || await confirmBox('الخروج من اللعبة؟', sv ? 'سيُحفظ تقدّمك الحالي وتتابع لاحقاً.' : 'لن تُسجَّل هذه المحاولة.', 'خروج', 'متابعة اللعب')) {
        this.cleanup(); Router.go('/game/' + def.id);
      }
    };
    const ctx = {
      def, opts: o, level: o.level, kind: o.kind, root: stage, quick: !!o.quick, assess: !!o.assess, rng: RNG(), color,
      saved: o.resume && D().inprog[def.id] ? D().inprog[def.id].state : null,
      hintsAllowed: (o.tutorial || D().settings.hints) && !def.noHints,
      mistake(n = 1) { S.mistakes += n; upd(); },
      hint() { S.hints++; upd(); },
      correct(n = 1) { S.correct += n; },
      get mistakes() { return S.mistakes; }, get hints() { return S.hints; },
      status(t) { status.textContent = t || ''; },
      save(state) { if (o.tutorial) return; D().inprog[def.id] = { state, ts: Date.now(), level: o.level }; Store.save(); },
      clearSave() { if (o.tutorial) return; delete D().inprog[def.id]; Store.save(); },
      timeout(fn, ms) { const t = setTimeout(() => { if (!S.done) fn(); }, ms); S.cleanups.push(() => clearTimeout(t)); return t; },
      interval(fn, ms) { const t = setInterval(() => { if (!S.done) fn(); }, ms); S.cleanups.push(() => clearInterval(t)); return t; },
      onCleanup(fn) { S.cleanups.push(fn); },
      listen(target, ev, fn, opt) { target.addEventListener(ev, fn, opt); S.cleanups.push(() => target.removeEventListener(ev, fn, opt)); },
      elapsed, addTime(sec) { S.t0 -= sec * 1000; }, pause() { if (S.pauseAt == null) S.pauseAt = performance.now(); }, resume() { if (S.pauseAt != null) { S.paused += performance.now() - S.pauseAt; S.pauseAt = null; } },
      sound: n => Sound.play(n),
      finish: res => this.finish(res || {}),
      debug: {},
    };
    cur.ctx = ctx;
    ctx.listen(document, 'visibilitychange', () => { if (document.hidden) ctx.pause(); else ctx.resume(); });
    try { def.run(ctx); }
    catch (e) { console.error(e); toast('حدث خطأ أثناء تشغيل اللعبة', 'bad'); }
  },

  cleanup() {
    if (this.cur && this.cur.S) { this.cur.S.cleanups.forEach(f => { try { f(); } catch (e) { } }); this.cur.S.cleanups = []; }
  },

  /* ---------- إنهاء وتسجيل ---------- */
  finish(res) {
    const cur = this.cur; if (!cur || cur.S.done) return;
    const S = cur.S, def = cur.def, o = cur.o;
    S.done = true; this.cleanup();
    if (o.tutorial) return this.tutorialResult(def, res, S);
    const elapsed = ((S.pauseAt != null ? S.pauseAt : performance.now()) - S.t0 - S.paused) / 1000;
    let acc = res.acc; if (acc == null) { const t = S.correct + S.mistakes; acc = t ? S.correct / t : (res.ok === false ? 0 : 1); }
    acc = clamp(acc, 0, 1);
    const mistakes = res.mistakes != null ? res.mistakes : S.mistakes, hints = res.hints != null ? res.hints : S.hints;
    let timeScore = null;
    if (res.parTime) { const r = elapsed / res.parTime; timeScore = r <= 1 ? 1 : clamp(1 - (r - 1) * 0.5, 0.3, 1); }
    const hintScore = 1 - clamp(hints / (res.hintCap || 4), 0, 1) * 0.8;
    const mistakeScore = 1 - clamp(mistakes / (res.mistakeCap || 6), 0, 1);
    let perf = timeScore == null ? (0.62 * acc + 0.2 * hintScore + 0.18 * mistakeScore) : (0.5 * acc + 0.2 * timeScore + 0.16 * hintScore + 0.14 * mistakeScore);
    if (res.perf != null) perf = res.perf;
    if (res.ok === false || res.gaveUp) perf = Math.min(perf, 0.3);
    perf = clamp(perf, 0, 1);
    const lvl = o.level, g = Adapt.rec(def.id), data = D();
    const score = Math.min(1000, Math.round(perf * 100 * (5 + lvl)));
    const pb = g.attempts > 0 && score > g.best && !o.assess;
    // XP
    const todayKey = dayKey();
    const todayN = data.sessions.filter(s => s.game === def.id && dayKey(new Date(s.ts)) === todayKey).length;
    let rep = todayN < 3 ? 1 : todayN < 6 ? 0.4 : 0.1; let xpNote = '';
    if (lvl <= 2 && todayN >= 3) { rep = 0; xpNote = 'لا نقاط إضافية لتكرار مستوى سهل — جرّب لعبة أخرى أو مستوى أعلى.'; }
    else if (rep < 1) xpNote = 'تقلّ النقاط عند تكرار اللعبة نفسها كثيراً في اليوم.';
    let xp = Math.round((14 + 2 * def.minutes) * (0.35 + 0.65 * perf) * (1 + (lvl - 1) * 0.35) * rep * (res.gaveUp ? 0.2 : 1) * (pb ? 1.25 : 1));
    if (o.assess) xp = Math.round(xp * 0.5);
    const prevLv = levelFromXp(data.xp);
    data.xp += xp; g.gxp += xp; g.best = Math.max(g.best, score); g.last = Date.now(); g.time += elapsed;
    data.stats.totalTime += elapsed; data.stats.sessions++; if (pb) data.stats.pbs = (data.stats.pbs || 0) + 1;
    const lastDay = data.streak.last; const streakNote = Streak.touch();
    if (lastDay && dayDiff(lastDay, todayKey) >= 4) data.stats.comeback = true;
    const rec = { game: def.id, ts: Date.now(), lvl, perf: +perf.toFixed(3), acc: +acc.toFixed(3), time: Math.round(elapsed), mistakes, hints, score, xp, kind: o.kind || 'normal' };
    if (o.assess) rec.as = 1;
    data.sessions.push(rec); if (data.sessions.length > 1500) data.sessions.shift();
    const adapt = Adapt.record(def.id, lvl, perf, o.assess);
    delete data.inprog[def.id];
    let dailyBonus = null;
    const pl = this.playlist;
    if (pl && pl.items[pl.idx] && pl.items[pl.idx].game === def.id) {
      pl.results.push(rec);
      if (pl.kind === 'daily') dailyBonus = Daily.markDone(def.id, pl.key);
    } else if (!o.assess) {
      const p = data.daily[todayKey]; if (p) dailyBonus = Daily.markDone(def.id, todayKey);
    }
    if (dailyBonus) xp += dailyBonus.xp;
    const chal = Chal.check(); chal.forEach(c => { xp += c.reward.xp; });
    const fresh = checkAchievements();
    const newLv = levelFromXp(data.xp);
    Store.save(true);
    this.result(rec, { def, o, adapt, pb, xp, xpNote, streakNote, dailyBonus, chal, fresh, leveledUp: newLv > prevLv ? newLv : 0, elapsed, res, g });
  },

  /* نتيجة جولة التدريب التعليمية: لا تُسجَّل في الإحصاءات */
  tutorialResult(def, res, S) {
    const view = this.view, color = gameRealmColor(def), d = D();
    const t = S.correct + S.mistakes, acc = res.acc != null ? res.acc : (t ? S.correct / t : 1);
    const first = !(d.tutorials && d.tutorials[def.id]);
    if (!d.tutorials) d.tutorials = {};
    if (first) { d.tutorials[def.id] = { ts: Date.now() }; d.xp += 10; }
    Streak.touch(); Store.save(true);
    const fresh = checkAchievements(); Store.save(true);
    Sound.play('win');
    mount(view, h('div', { class: 'page result', style: `--accent:${color}` },
      h('div', { class: 'res-hero' },
        h('div', { class: 'res-score' }, h('span', { class: 'num' }, '🎓'), h('span', { class: 'lab' }, 'مرحلة تعليمية')),
        h('div', null, h('h1', { class: 'display' }, 'أحسنت! أنهيتَ التدريب'), h('p', { class: 'lead' }, def.name),
          h('p', { class: 'muted' }, acc >= 0.8 ? 'فهمتَ اللعبة جيداً — أنت جاهز للعب الحقيقي.' : 'لا بأس بالأخطاء، هي جزء من التعلّم. يمكنك إعادة التدريب أو مراجعة الشرح قبل أن تبدأ.'))),
      h('div', { class: 'kv-grid four' }, [['الدقة', pct(clamp(acc, 0, 1))], ['الأخطاء', S.mistakes], ['التلميحات', S.hints]].map(([k, v]) => h('div', { class: 'kv' }, h('div', { class: 'v' }, String(v)), h('div', { class: 'k' }, k)))),
      first ? h('div', { class: 'reward-row' }, h('span', { class: 'reward xp' }, '+10 XP')) : h('p', { class: 'muted small' }, 'أعدتَ مرحلة سبق إكمالها (لا نقاط إضافية).'),
      h('p', { class: 'note' }, 'هذه الجولة لم تُحتسب في إحصاءاتك ولا في مستواك.'),
      fresh.length ? h('div', { class: 'unlock' }, fresh.map(a => h('div', null, '★ إنجاز جديد: ', h('b', null, a.name)))) : null,
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary lg', id: 'btn-after-tut', onClick: () => Play.open(def.id) }, 'ابدأ اللعب الحقيقي'),
        h('button', { class: 'btn ghost lg', id: 'btn-retut', onClick: () => Play.start(def.id, { level: 1, kind: 'tutorial', quick: true, tutorial: true }) }, 'أعد التدريب'),
        h('a', { class: 'btn ghost lg', href: '#/learn/' + def.id }, 'مراجعة الشرح'))));
  },

  result(rec, X) {
    const view = this.view, def = X.def, color = gameRealmColor(def);
    const pl = this.playlist && this.playlist.items[this.playlist.idx] && this.playlist.items[this.playlist.idx].game === def.id ? this.playlist : null;
    const perf = rec.perf;
    const head = X.res.gaveUp ? 'تعلّمتَ منها' : perf >= 0.85 ? 'أداء ممتاز' : perf >= 0.65 ? 'أداء جيد' : perf >= 0.4 ? 'محاولة مقبولة' : 'كل محاولة تدرّب العقل';
    const sub = X.res.summary || '';
    Sound.play(perf >= 0.6 ? 'win' : 'lose');
    const next = () => {
      if (pl) { pl.idx++; if (pl.idx >= pl.items.length) { Router.go('/summary'); return; } Play.open(pl.items[pl.idx].game, { playlist: pl, quick: pl.quick, assess: pl.kind === 'assess' }); }
      else Play.open(def.id);
    };
    const kvs = [['الدقة', pct(rec.acc)], ['الوقت', fmtTime(rec.time)], ['الأخطاء', rec.mistakes], ['التلميحات', rec.hints]];
    mount(view, h('div', { class: 'page result', style: `--accent:${color}` },
      pl ? h('div', { class: 'pl-banner' }, `${pl.title} — ${pl.idx + 1} من ${pl.items.length}`) : null,
      h('div', { class: 'res-hero' },
        h('div', { class: 'res-score' }, h('span', { class: 'num' }, String(rec.score)), h('span', { class: 'lab' }, 'النتيجة' + (X.pb ? ' · رقم شخصي جديد' : ''))),
        h('div', null, h('h1', { class: 'display' }, head), h('p', { class: 'lead' }, def.name + ' · ' + LEVELS_AR[rec.lvl - 1]), sub ? h('p', { class: 'muted' }, sub) : null)),
      h('div', { class: 'kv-grid four' }, kvs.map(([k, v]) => h('div', { class: 'kv' }, h('div', { class: 'v' }, String(v)), h('div', { class: 'k' }, k)))),
      h('div', { class: 'reward-row' },
        h('span', { class: 'reward xp' }, '+' + X.xp + ' XP'),
        X.leveledUp ? h('span', { class: 'reward lv' }, 'ارتقيت إلى المستوى ' + X.leveledUp) : null),
      X.xpNote ? h('p', { class: 'note' }, X.xpNote) : null,
      D().settings.perfNote && X.adapt.msg && !X.o.assess ? h('div', { class: 'adapt-note' }, h('b', null, X.adapt.change === 'up' ? '↑ ' : X.adapt.change === 'down' ? '↓ ' : '• '), X.adapt.msg) : null,
      X.streakNote ? h('p', { class: 'note' }, X.streakNote) : null,
      X.dailyBonus ? h('p', { class: 'note ok' }, `أكملت برنامج اليوم! مكافأة +${X.dailyBonus.xp} XP`) : null,
      X.chal.length ? h('div', { class: 'unlock' }, X.chal.map(c => h('div', null, '✔ تحدٍّ مُنجَز: ', h('b', null, c.title), ` (+${c.reward.xp} XP)`))) : null,
      X.fresh.length ? h('div', { class: 'unlock' }, X.fresh.map(a => h('div', null, '★ إنجاز جديد: ', h('b', null, a.name), ' — ' + a.desc))) : null,
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary lg', id: 'btn-next', onClick: next }, pl ? (pl.idx + 1 >= pl.items.length ? 'عرض الملخص' : 'التمرين التالي') : 'تحدٍّ جديد'),
        pl ? null : h('button', { class: 'btn ghost lg', onClick: () => Router.go('/game/' + def.id) }, 'تفاصيل اللعبة'),
        pl ? h('button', { class: 'btn ghost lg', id: 'btn-exit-pl', onClick: () => Play.exitPlaylist() }, pl.kind === 'daily' ? 'خروج — أواصل لاحقاً' : 'إنهاء الآن') : h('button', { class: 'btn ghost lg', onClick: () => Router.go('/games') }, 'المكتبة'))));
  },

  /* ---------- قوائم التشغيل ---------- */
  startPlaylist(kind, title, items, extra = {}) {
    this.playlist = Object.assign({ kind, title, items, idx: 0, results: [], key: dayKey() }, extra);
    const first = items[0];
    this.open(first.game, { playlist: this.playlist, quick: this.playlist.quick, assess: kind === 'assess' });
  },
};
