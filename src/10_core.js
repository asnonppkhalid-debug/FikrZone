'use strict';
/* ============ المناطق والمهارات والسجل ============ */
const REALMS = [
  { id: 'logic', name: 'عالم المنطق', en: 'Logic Realm', short: 'المنطق', color: '#e9c14f', tagline: 'ألغاز تُحلّ بالاستنتاج لا بالتخمين', desc: 'الاستنتاج خطوة بعد خطوة، واكتشاف القواعد، وحل الألغاز التي لها حل واحد صحيح.' },
  { id: 'strategy', name: 'عالم الاستراتيجية', en: 'Strategy Realm', short: 'الاستراتيجية', color: '#d9594c', tagline: 'فكّر في ما بعد النقلة القادمة', desc: 'التخطيط بعيد المدى، وتوقّع ردود الخصم، واتخاذ القرار تحت القيود وإدارة الموارد.' },
  { id: 'memory', name: 'عالم الذاكرة', en: 'Memory Realm', short: 'الذاكرة', color: '#3db5a5', tagline: 'احتفظ بالمعلومة واستحضرها وقت الحاجة', desc: 'تدريب الذاكرة العاملة البصرية واللفظية والمكانية وذاكرة التسلسلات.' },
  { id: 'focus', name: 'عالم التركيز', en: 'Focus Realm', short: 'التركيز', color: '#8cc152', tagline: 'انتبه لما يهم وتجاهل ما سواه', desc: 'الانتباه الانتقائي والمستمر، والبحث البصري، واكتشاف الفروق الدقيقة.' },
  { id: 'speed', name: 'عالم السرعة', en: 'Speed Realm', short: 'السرعة', color: '#f0883e', tagline: 'سرعة الذهن مع الحفاظ على الدقة', desc: 'الحساب الذهني، والمقارنات الخاطفة، والاستجابة السريعة للقواعد المتغيرة.' },
  { id: 'spatial', name: 'عالم الإدراك المكاني', en: 'Spatial Realm', short: 'المكاني', color: '#4c9be0', tagline: 'أدِر الأشكال في ذهنك', desc: 'تدوير الأشكال ذهنياً، وتركيب القطع، وفهم الأبعاد الثلاثة والعلاقات المكانية.' },
  { id: 'language', name: 'عالم اللغة', en: 'Language Realm', short: 'اللغة', color: '#e2699a', tagline: 'الكلمات أدوات للتفكير', desc: 'الترابط بين الكلمات، والمفردات، وبناء الجمل، وألغاز اللغة.' },
  { id: 'abstract', name: 'عالم التفكير المجرد', en: 'Abstract Realm', short: 'المجرد', color: '#9b7fe0', tagline: 'قواعد خفية ومشكلات لم ترَ مثلها', desc: 'اكتشاف القواعد الخفية، والأنماط المركبة، والتفكير الإبداعي وحل المشكلات الجديدة.' },
];
const REALM = Object.fromEntries(REALMS.map(r => [r.id, r]));
const SKILLS = {
  deduction: 'الاستنتاج', patterns: 'الأنماط', planning: 'التخطيط', math: 'الحساب', vmem: 'الذاكرة البصرية', wmem: 'الذاكرة التسلسلية واللفظية',
  attention: 'الانتباه', speed: 'سرعة المعالجة', spatial: 'الإدراك المكاني', verbal: 'اللغة', creative: 'التفكير الإبداعي', solving: 'حل المشكلات', decision: 'اتخاذ القرار',
};
const GTYPES = { puzzle: 'ألغاز', board: 'لوحة وحركات', quiz: 'أسئلة متتابعة', memory: 'ذاكرة', reaction: 'استجابة وردّ فعل', build: 'بناء وترتيب', text: 'إدخال نصي' };
const LEVELS = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];
const LEVELS_AR = ['مبتدئ', 'سهل', 'متوسط', 'متقدم', 'خبير'];

MV.define = def => {
  def.minutes = def.minutes || 5;
  MV.games.push(def); MV.byId[def.id] = def; return def;
};
const gameRealmColor = def => REALM[def.realms[0]].color;

/* ============ الصعوبة التكيفية ============ */
const Adapt = {
  rec(id) {
    const g = D().games;
    if (!g[id]) g[id] = { lvl: 1, hist: [], attempts: 0, gxp: 0, best: 0, last: 0, probe: null, since: 0, intro: false, time: 0 };
    return g[id];
  },
  plan(id) {
    const g = this.rec(id);
    if (g.probe && g.probe.left > 0) {
      let dir = g.probe.next; let lv = g.lvl + dir;
      if (lv > 5 || lv < 1) { dir = -dir; lv = g.lvl + dir; }
      return { level: clamp(lv, 1, 5), kind: dir > 0 ? 'probe-up' : 'probe-down' };
    }
    return { level: g.lvl, kind: g.intro ? 'intro' : 'normal' };
  },
  record(id, level, perf, assess) {
    const g = this.rec(id);
    g.hist.push({ lvl: level, perf: +perf.toFixed(3), ts: Date.now(), as: assess ? 1 : 0 });
    if (g.hist.length > 40) g.hist.shift();
    g.attempts++;
    let change = 'stay', msg = '';
    if (assess) {
      return { change: 'stay', msg: '', newLevel: g.lvl };
    }
    if (g.intro) g.intro = false;
    if (g.probe) {
      if (level !== g.lvl) { g.probe.res.push({ lvl: level, perf }); g.probe.left--; g.probe.next *= -1; }
      else { g.probe.left--; }
      if (g.probe.left <= 0) {
        const up = g.probe.res.find(r => r.lvl > g.lvl), dn = g.probe.res.find(r => r.lvl < g.lvl);
        if (up && up.perf >= 0.68 && g.lvl < 5) { g.lvl++; change = 'up'; msg = 'بعد التحديات الإضافية تبيّن أن مستواك أعلى — رفعنا الصعوبة.'; }
        else if (dn && dn.perf < 0.55 && g.lvl > 1) { g.lvl--; change = 'down'; msg = 'اتّضح أن مستوى أبسط يناسبك الآن — خفّضنا الصعوبة مؤقتاً.'; g.intro = true; }
        else { msg = 'حددنا مستواك الحقيقي: المستوى الحالي مناسب لك.'; }
        g.probe = null; g.since = Date.now() + 1;
      } else { msg = 'أداؤك متذبذب — نقدّم تحديات إضافية لتحديد مستواك بدقة.'; change = 'probe'; }
      return { change, msg, newLevel: g.lvl };
    }
    const at = g.hist.filter(e => e.lvl === g.lvl && e.ts >= g.since && !e.as).slice(-4).map(e => e.perf);
    const n = at.length;
    if (n >= 3) {
      const l3 = at.slice(-3), m = avg(l3), sd = std(l3), mn = Math.min(...l3);
      if (m >= 0.78 && mn >= 0.6 && sd <= 0.14) {
        if (g.lvl < 5) { g.lvl++; g.since = Date.now() + 1; change = 'up'; msg = 'أداء ممتاز ومستقر عبر عدة محاولات — ارتفعت الصعوبة تدريجياً.'; }
        else msg = 'أنت في أعلى مستوى. ستتنوع التحديات لتبقى مثيرة.';
      } else if (sd > 0.24) {
        g.probe = { left: 2, next: g.lvl < 5 ? 1 : -1, res: [] }; change = 'probe'; msg = 'أداؤك متذبذب بين المحاولات. سنقدّم تحديين إضافيين لتحديد مستواك الحقيقي.';
      } else if (m < 0.5 && g.lvl > 1) {
        g.lvl--; g.since = Date.now() + 1; g.intro = true; change = 'down'; msg = 'وجدتَ صعوبة واضحة — خفّضنا الصعوبة مؤقتاً مع تحدٍّ تمهيدي.';
      } else msg = 'أداء جيد — نبقى في مستوى قريب مع تنويع التحديات.';
    } else if (n === 2 && avg(at) < 0.38 && g.lvl > 1) {
      g.lvl--; g.since = Date.now() + 1; g.intro = true; change = 'down'; msg = 'وجدتَ صعوبة واضحة — خفّضنا الصعوبة مؤقتاً مع تحدٍّ تمهيدي.';
    } else msg = n === 1 ? 'القرار بشأن مستواك يحتاج عدة محاولات — لا يكفي أداء واحد.' : 'نحتاج محاولة إضافية قبل تعديل الصعوبة.';
    return { change, msg, newLevel: g.lvl };
  },
};

/* ============ تقدير المهارات (خريطة القدرات) ============ */
const Skill = {
  game(id) {
    const g = D().games[id];
    if (!g || !g.hist.length) return null;
    const last = g.hist.slice(-5);
    const p = avg(last.map(e => e.perf)), l = avg(last.map(e => e.lvl));
    return { score: clamp(((l - 1) + p) / 5, 0, 1), n: g.attempts, perf: p };
  },
  realm(rid) {
    let w = 0, ws = 0, n = 0, ng = 0;
    for (const def of MV.games) {
      const idx = def.realms.indexOf(rid); if (idx < 0) continue;
      const sk = this.game(def.id); if (!sk) continue;
      const wt = (idx === 0 ? 1 : 0.5) * Math.min(1, 0.5 + sk.n / 6);
      w += sk.score * wt; ws += wt; n += sk.n * (idx === 0 ? 1 : 0.5); ng++;
    }
    const rel = clamp(n / 10, 0, 1) * (ng >= 2 ? 1 : 0.8);
    return { score: ws ? w / ws : null, attempts: Math.round(n), games: ng, rel, label: n < 3 ? 'بيانات غير كافية' : rel < 0.45 ? 'موثوقية منخفضة' : rel < 0.8 ? 'موثوقية متوسطة' : 'موثوقية جيدة' };
  },
};

/* ============ XP والمستوى والسلسلة ============ */
const xpCum = n => 50 * n * (n - 1);
function levelFromXp(xp) { return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2)); }
function levelInfo(xp = D().xp) {
  const lv = levelFromXp(xp), a = xpCum(lv), b = xpCum(lv + 1);
  return { level: lv, into: xp - a, need: b - a, frac: (xp - a) / (b - a) };
}
const LEVEL_TITLES = ['مستكشف', 'متأمل', 'محلّل', 'ملاحِظ', 'مخطِّط', 'مفكّر', 'استراتيجي', 'خبير', 'حكيم', 'سيّد العقل'];
const levelTitle = lv => LEVEL_TITLES[clamp(Math.floor((lv - 1) / 3), 0, LEVEL_TITLES.length - 1)];

const Streak = {
  touch() {
    const st = D().streak, t = dayKey();
    if (st.last === t) return '';
    let note = '';
    if (!st.last) st.cur = 1;
    else {
      const d = dayDiff(st.last, t);
      if (d === 1) st.cur++;
      else if (d === 2 && !(st.graceWeek === weekKey())) { st.cur++; st.graceWeek = weekKey(); note = 'يوم الراحة لم يكسر سلسلتك'; }
      else st.cur = 1;
    }
    st.last = t; st.best = Math.max(st.best, st.cur);
    return note;
  },
  current() {
    const st = D().streak, t = dayKey();
    if (!st.last) return 0;
    const d = dayDiff(st.last, t);
    if (d <= 1) return st.cur;
    if (d === 2 && st.graceWeek !== weekKey()) return st.cur;
    return 0;
  },
};

/* ============ الإنجازات والألقاب ============ */
const ACH = [
  { id: 'first', name: 'الخطوة الأولى', desc: 'أكمل أول جلسة تدريب', title: null, test: c => c.total >= 1 },
  { id: 'ten', name: 'عقل مواظب', desc: 'أكمل 10 جلسات', title: 'مواظب', test: c => c.total >= 10 },
  { id: 'fifty', name: 'نصف مئوية', desc: 'أكمل 50 جلسة', title: 'متمرّس', test: c => c.total >= 50 },
  { id: 'hundred', name: 'مئوية العقل', desc: 'أكمل 200 جلسة', title: 'سيّد التدريب', test: c => c.total >= 200 },
  { id: 'allrealms', name: 'رحّالة العوالم', desc: 'جرّب لعبة واحدة على الأقل من كل المناطق الثماني', title: 'رحّالة', test: c => c.realmsPlayed >= 8 },
  { id: 'perfect', name: 'بلا أخطاء', desc: 'أنهِ جلسة بدقة 100% في مستوى سهل فأعلى', test: c => c.sessions.some(s => s.acc >= 0.999 && s.lvl >= 2) },
  { id: 'nohints', name: 'اعتماد على النفس', desc: '5 جلسات بلا تلميحات في مستوى متوسط فأعلى', title: 'مستقلّ', test: c => c.sessions.filter(s => s.hints === 0 && s.lvl >= 3).length >= 5 },
  { id: 'streak3', name: 'ثلاثة أيام', desc: 'سلسلة تدريب 3 أيام', test: c => D().streak.best >= 3 },
  { id: 'streak7', name: 'أسبوع من التفكير', desc: 'سلسلة تدريب 7 أيام', title: 'ثابت', test: c => D().streak.best >= 7 },
  { id: 'streak30', name: 'شهر من العقل', desc: 'سلسلة 30 يوماً', title: 'راسخ', test: c => D().streak.best >= 30 },
  { id: 'daily1', name: 'يوم مكتمل', desc: 'أكمل برنامج تدريب يومي كاملاً', test: c => c.dailyDone >= 1 },
  { id: 'daily7', name: 'سبعة برامج', desc: 'أكمل 7 برامج يومية', title: 'منتظم', test: c => c.dailyDone >= 7 },
  { id: 'pb5', name: 'محطّم الأرقام', desc: 'حطّم رقمك الشخصي 5 مرات', test: c => (D().stats.pbs || 0) >= 5 },
  { id: 'expert', name: 'مستوى الخبراء', desc: 'ابلغ مستوى Expert في أي لعبة', title: 'خبير', test: c => Object.values(D().games).some(g => g.lvl >= 5) },
  { id: 'chesswin', name: 'كش مات!', desc: 'اهزم الحاسوب في الشطرنج', title: 'لاعب شطرنج', test: c => (D().stats.chessWins || 0) >= 1 },
  { id: 'chess10', name: 'طالب شطرنج', desc: 'أنهِ 10 دروس من دورة الشطرنج', test: c => Course.count() >= 10 },
  { id: 'chesscourse', name: 'خريج الأكاديمية', desc: 'أكمل كل دروس دورة الشطرنج', title: 'تلميذ الشطرنج', test: c => ChessCourse.order.length > 0 && Course.count() >= ChessCourse.order.length },
  { id: 'elo1000', name: 'إيلو 1000', desc: 'ابلغ تصنيف إيلو 1000 في الشطرنج', test: c => ChessElo.rec().games >= 5 && (ChessElo.rec().peak || 0) >= 1000 },
  { id: 'elo1500', name: 'إيلو 1500', desc: 'ابلغ تصنيف إيلو 1500 في الشطرنج', title: 'لاعب نادٍ', test: c => ChessElo.rec().games >= 5 && (ChessElo.rec().peak || 0) >= 1500 },
  { id: 'learner', name: 'متعلّم فضولي', desc: 'أنهِ المرحلة التعليمية في 10 ألعاب', title: 'متعلّم', test: c => Object.keys(D().tutorials || {}).length >= 10 },
  { id: 'sudokuadv', name: 'سيّد الأرقام', desc: 'أنهِ سودوكو بمستوى متقدم فأعلى', test: c => c.sessions.some(s => s.game === 'sudoku' && s.lvl >= 4 && s.perf >= 0.5) },
  { id: 'thinker', name: 'مفكّر هادئ', desc: '5 جلسات منطق أو استراتيجية بدقة 90% فأكثر', title: 'مفكّر', test: c => c.sessions.filter(s => s.acc >= 0.9 && ['logic', 'strategy'].includes(REALM_OF(s.game))).length >= 5 },
  { id: 'speedy', name: 'برق', desc: '10 جلسات في عالم السرعة', test: c => c.sessions.filter(s => REALM_OF(s.game) === 'speed').length >= 10 },
  { id: 'rounded', name: 'عقل متوازن', desc: 'تقدير 30% فأكثر في جميع المناطق الثماني', title: 'متوازن', test: c => REALMS.every(r => { const k = Skill.realm(r.id); return k.score != null && k.score >= 0.3 && k.attempts >= 3; }) },
  { id: 'lv10', name: 'المستوى 10', desc: 'ابلغ المستوى العام 10', test: c => levelFromXp(D().xp) >= 10 },
  { id: 'lv20', name: 'المستوى 20', desc: 'ابلغ المستوى العام 20', title: 'حكيم', test: c => levelFromXp(D().xp) >= 20 },
  { id: 'weekly', name: 'تحدٍّ أسبوعي', desc: 'أنجز تحدياً أسبوعياً', test: c => Object.keys(D().chal.claimed).some(k => k.startsWith('w:')) },
  { id: 'night', name: 'بومة الليل', desc: 'تدرّب بين منتصف الليل والخامسة فجراً', title: 'بومة', test: c => c.sessions.some(s => { const hh = new Date(s.ts).getHours(); return hh < 5; }) },
  { id: 'comeback', name: 'عودة هادئة', desc: 'عُد للتدريب بعد انقطاع 3 أيام أو أكثر', test: c => !!D().stats.comeback },
];
function REALM_OF(gameId) { const d = MV.byId[gameId]; return d ? d.realms[0] : null; }
const DEFAULT_TITLES = { explorer: 'مستكشف' };
function ownedTitles() {
  const t = { ...DEFAULT_TITLES };
  for (const a of ACH) if (a.title && D().ach[a.id]) t[a.id] = a.title;
  return t;
}
function checkAchievements() {
  const sessions = D().sessions;
  const realms = new Set(sessions.map(s => REALM_OF(s.game)).filter(Boolean));
  const c = { total: D().stats.sessions, sessions, realmsPlayed: realms.size, dailyDone: Object.values(D().daily).filter(p => p.rewarded).length };
  const fresh = [];
  for (const a of ACH) {
    if (D().ach[a.id]) continue;
    let ok = false;
    try { ok = a.test(c); } catch (e) { ok = false; }
    if (ok) { D().ach[a.id] = Date.now(); fresh.push(a); }
  }
  return fresh;
}

/* ============ التدريب اليومي ============ */
const Daily = {
  recentIds(days = 2) { const cut = Date.now() - days * 864e5; return new Set(D().sessions.filter(s => s.ts > cut).map(s => s.game)); },
  weight(def, ctx) {
    const rid = def.realms[0], sk = Skill.realm(rid);
    let w = 1;
    w *= sk.score == null ? 1.5 : (1.8 - sk.score * 1.3);
    if (D().profile.interests.includes(rid)) w *= 1.5;
    if (ctx.recent.has(def.id)) w *= 0.4;
    w *= (ctx.usedRealm[rid] || 0) === 0 ? 1.6 : 1 / (1 + ctx.usedRealm[rid] * 1.6);
    if (ctx.total + def.minutes > ctx.budget + 4) w *= 0.12;
    return Math.max(w, 0.01);
  },
  plan(key = dayKey()) {
    const store = D().daily;
    if (store[key]) return store[key];
    const rng = RNG(key + '|' + D().created);
    const budget = D().settings.minutes;
    const ctx = { recent: this.recentIds(), usedRealm: {}, total: 0, budget };
    const items = [];
    while (ctx.total < budget - 2 && items.length < 7) {
      const pool = MV.games.filter(g => !items.some(i => i.game === g.id));
      const c = rng.weighted(pool, g => this.weight(g, ctx));
      items.push({ game: c.id, minutes: c.minutes, status: 'pending' });
      ctx.total += c.minutes; ctx.usedRealm[c.realms[0]] = (ctx.usedRealm[c.realms[0]] || 0) + 1;
    }
    store[key] = { items, budget, rewarded: false };
    Store.save();
    return store[key];
  },
  replace(key, idx) {
    const p = this.plan(key), it = p.items[idx]; if (!it) return;
    const ctx = { recent: this.recentIds(), usedRealm: {}, total: 0, budget: it.minutes + 3 };
    p.items.forEach((x, i) => { if (i !== idx) ctx.usedRealm[REALM_OF(x.game)] = (ctx.usedRealm[REALM_OF(x.game)] || 0) + 1; });
    const pool = MV.games.filter(g => !p.items.some(i => i.game === g.id) && Math.abs(g.minutes - it.minutes) <= 4);
    const list = pool.length ? pool : MV.games.filter(g => !p.items.some(i => i.game === g.id));
    const c = RNG().weighted(list, g => this.weight(g, ctx));
    p.items[idx] = { game: c.id, minutes: c.minutes, status: 'pending' };
    Store.save();
  },
  progress(key = dayKey()) {
    const p = this.plan(key);
    const done = p.items.filter(i => i.status === 'done').length, skipped = p.items.filter(i => i.status === 'skipped').length;
    return { done, skipped, total: p.items.length, complete: done + skipped === p.items.length && done > 0 };
  },
  markDone(gameId, key = dayKey()) {
    const p = D().daily[key]; if (!p) return null;
    const it = p.items.find(i => i.game === gameId && i.status !== 'done');
    if (it) it.status = 'done';
    const pr = this.progress(key);
    if (pr.complete && !p.rewarded) { p.rewarded = true; const xp = 40 + 10 * pr.done; D().xp += xp; return { xp }; }
    return null;
  },
};

/* ============ التحديات ============ */
const SPECIALS = [
  { key: 'noHints', title: 'أسبوع بلا تلميحات', desc: 'أنهِ 4 جلسات بلا أي تلميح في مستوى سهل فأعلى', goal: { type: 'count', n: 4, noHints: true, minLevel: 2 }, reward: { xp: 120 } },
  { key: 'memoryMarathon', title: 'ماراثون الذاكرة', desc: '5 جلسات في عالم الذاكرة بدقة 70% فأكثر', goal: { type: 'count', n: 5, realm: 'memory', minAcc: 0.7 }, reward: { xp: 120 } },
  { key: 'accuracy', title: 'الدقة فوق كل شيء', desc: '3 جلسات بدقة 95% فأكثر في أي لعبة', goal: { type: 'count', n: 3, minAcc: 0.95, minLevel: 2 }, reward: { xp: 130 } },
  { key: 'deep', title: 'تفكير عميق', desc: '3 جلسات في المنطق أو الاستراتيجية بمستوى متوسط فأعلى', goal: { type: 'count', n: 3, realmsAny: ['logic', 'strategy'], minLevel: 3 }, reward: { xp: 140 } },
  { key: 'wordsmith', title: 'صانع الكلمات', desc: '4 جلسات في عالم اللغة', goal: { type: 'count', n: 4, realm: 'language' }, reward: { xp: 110 } },
  { key: 'newExplorer', title: 'استكشاف جديد', desc: 'العب 6 ألعاب مختلفة', goal: { type: 'distinctGames', n: 6 }, reward: { xp: 110 } },
];
const Chal = {
  daily(key = dayKey()) {
    const rng = RNG('cd|' + key + '|' + D().created);
    const rs = rng.shuffle(REALMS), r1 = rs[0];
    return [
      { id: `d:${key}:1`, kind: 'daily', title: `تمرين في ${r1.short}`, desc: `أكمل جلستين في ${r1.name} بدقة 70% فأكثر`, goal: { type: 'count', n: 2, realm: r1.id, minAcc: 0.7 }, reward: { xp: 40 } },
      { id: `d:${key}:2`, kind: 'daily', title: 'الدقة قبل السرعة', desc: 'أنهِ جلسة بدقة 90% فأكثر في لعبة تتطلب تفكيراً عميقاً (استنتاج أو تخطيط أو قرار)', goal: { type: 'count', n: 1, minAcc: 0.9, skillsAny: ['deduction', 'planning', 'solving', 'decision'] }, reward: { xp: 40 } },
      { id: `d:${key}:3`, kind: 'daily', title: 'جولة متنوعة', desc: 'العب في ثلاث مناطق مختلفة اليوم', goal: { type: 'distinct', n: 3 }, reward: { xp: 45 } },
    ];
  },
  weekly(key = weekKey()) {
    return [
      { id: `w:${key}:1`, kind: 'weekly', title: 'أسبوع متنقّل', desc: 'جلسات في 5 مناطق مختلفة على الأقل', goal: { type: 'distinct', n: 5 }, reward: { xp: 120 } },
      { id: `w:${key}:2`, kind: 'weekly', title: 'مهارتان متقدمتان', desc: '3 جلسات بمستوى متوسط فأعلى في مهارتين مختلفتين على الأقل', goal: { type: 'distinctSkills', n: 2, sessions: 3, minLevel: 3 }, reward: { xp: 140 } },
      { id: `w:${key}:3`, kind: 'weekly', title: 'اجتهاد منتظم', desc: 'أكمل 10 جلسات خلال الأسبوع', goal: { type: 'count', n: 10 }, reward: { xp: 110 } },
      { id: `w:${key}:4`, kind: 'weekly', title: 'تفكير هادئ', desc: 'جلستان بدقة 90% فأكثر في الاستراتيجية أو المنطق', goal: { type: 'count', n: 2, minAcc: 0.9, realmsAny: ['logic', 'strategy'] }, reward: { xp: 100 } },
    ];
  },
  special(key = weekKey()) {
    const rng = RNG('sp|' + key);
    return rng.sample(SPECIALS, 2).map((sp, i) => ({ id: `s:${key}:${sp.key}`, kind: 'special', title: sp.title, desc: sp.desc, goal: sp.goal, reward: sp.reward }));
  },
  pb() {
    const list = [];
    const played = MV.games.filter(g => D().games[g.id] && D().games[g.id].best > 0).sort((a, b) => D().games[b.id].last - D().games[a.id].last).slice(0, 6);
    for (const g of played) {
      const rec = D().games[g.id], t = D().chal.pbTargets[g.id];
      list.push({ id: `pb:${g.id}`, kind: 'pb', game: g.id, best: rec.best, target: t ? t.target : null, active: !!t });
    }
    return list;
  },
  windowStart(c) { if (c.kind === 'daily') return new Date(c.id.split(':')[1] + 'T00:00:00').getTime(); return new Date(c.id.split(':')[1] + 'T00:00:00').getTime(); },
  progress(c) {
    const g = c.goal, since = this.windowStart(c);
    let list = D().sessions.filter(s => s.ts >= since && MV.byId[s.game]);
    if (c.kind === 'daily') list = list.filter(s => dayKey(new Date(s.ts)) === c.id.split(':')[1]);
    const f = s => {
      const def = MV.byId[s.game];
      if (g.realm && !def.realms.includes(g.realm)) return false;
      if (g.realmsAny && !g.realmsAny.some(r => def.realms.includes(r))) return false;
      if (g.minAcc && s.acc < g.minAcc) return false;
      if (g.minLevel && s.lvl < g.minLevel) return false;
      if (g.noHints && s.hints > 0) return false;
      if (g.skillsAny && !(def.skills || []).some(k => g.skillsAny.includes(k))) return false;
      return true;
    };
    list = list.filter(f);
    let cur = 0, n = g.n;
    if (g.type === 'count') cur = list.length;
    else if (g.type === 'distinct') cur = new Set(list.map(s => REALM_OF(s.game))).size;
    else if (g.type === 'distinctGames') cur = new Set(list.map(s => s.game)).size;
    else if (g.type === 'distinctSkills') {
      const bySkill = {}; list.forEach(s => (MV.byId[s.game].skills || []).forEach(k => { bySkill[k] = (bySkill[k] || 0) + 1; }));
      const per = g.sessions || 1; cur = Object.values(bySkill).filter(v => v >= per).length;
    }
    return { cur: Math.min(cur, n), n, done: cur >= n };
  },
  all() { return [...this.daily(), ...this.weekly(), ...this.special()]; },
  check() {
    const out = [];
    for (const c of this.all()) {
      if (D().chal.claimed[c.id]) continue;
      if (this.progress(c).done) {
        D().chal.claimed[c.id] = Date.now(); D().xp += c.reward.xp; out.push(c);
      }
    }
    for (const gid in D().chal.pbTargets) {
      const t = D().chal.pbTargets[gid], rec = D().games[gid];
      if (rec && rec.best > t.target) {
        delete D().chal.pbTargets[gid]; D().xp += 50;
        out.push({ title: 'رقم شخصي جديد: ' + MV.byId[gid].name, reward: { xp: 50 } });
      }
    }
    return out;
  },
};

/* ============ قوائم التشغيل المختلطة ============ */
const MIXED = [
  { id: 'trio', name: 'ثلاثية العقل', desc: 'ثلاث ألعاب من ثلاث مناطق مختلفة', n: 3 },
  { id: 'five', name: 'سباق متوازن', desc: 'خمس ألعاب من خمس مناطق', n: 5 },
  { id: 'deep', name: 'تفكير عميق', desc: 'ثلاث ألعاب منطق واستراتيجية وتجريد بلا استعجال', realms: ['logic', 'strategy', 'abstract'], n: 3 },
  { id: 'sense', name: 'حواس يقظة', desc: 'تركيز وذاكرة وسرعة ومكان', realms: ['focus', 'memory', 'speed', 'spatial'], n: 4 },
];
function buildMixed(m) {
  const rng = RNG();
  const realms = m.realms ? rng.shuffle(m.realms).slice(0, m.n) : rng.shuffle(REALMS.map(r => r.id)).slice(0, m.n);
  return realms.map(r => {
    const pool = MV.games.filter(g => g.realms[0] === r && !g.longSession);
    const g = rng.pick(pool);
    return { game: g.id, minutes: g.minutes, status: 'pending' };
  });
}
