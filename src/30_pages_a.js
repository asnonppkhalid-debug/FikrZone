'use strict';
/* ============ الراوتر والهيكل والصفحات (1) ============ */
const ICONS = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  world: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  games: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  daily: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4',
  challenges: 'M6 21V4M6 5h12l-2 4 2 4H6',
  profile: 'M12 3l8 5v8l-8 5-8-5V8zM12 8v8M8 10l4 2 4-2',
  chess: 'M8 21h8M9 21c0-3 1-4 1-6-2-1-3-3-3-5a5 5 0 0 1 10 0c0 2-1 4-3 5 0 2 1 3 1 6M12 5V3M10.5 4h3',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
};
function icon(n, size = 22) { return svgRoot(24, 24, { width: size, height: size, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s('path', { d: ICONS[n] })); }
const NAV = [
  ['home', 'الرئيسية', '/home'], ['world', 'عالم العقل', '/world'], ['games', 'مكتبة الألعاب', '/games'], ['chess', 'أكاديمية الشطرنج', '/chess'],
  ['challenges', 'التحديات', '/challenges'], ['profile', 'ملف العقل', '/profile'], ['settings', 'الإعدادات', '/settings'],
];

/* ---------- الراوتر ---------- */
const Router = {
  routes: [], viewEl: null, railEl: null, tabEl: null,
  add(pattern, fn, nav) { const keys = []; const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$'); this.routes.push({ re, keys, fn, nav }); },
  go(path) { if (location.hash === '#' + path) this.render(); else location.hash = '#' + path; },
  back(fallback) { if (history.length > 1) history.back(); else this.go(fallback || '/home'); },
  path() { return (location.hash.replace(/^#/, '') || '/home'); },
  render() {
    let path = this.path();
    if (!D().profile.onboarded && !path.startsWith('/onboarding') && !path.startsWith('/play') && !path.startsWith('/game') && path !== '/summary') path = '/onboarding';
    const isPlay = path.startsWith('/play/');
    if (!isPlay && Play.cur) { Play.cleanup(); if (!path.startsWith('/game/') || true) Play.cur = null; }
    document.body.classList.toggle('focus-mode', isPlay || path.startsWith('/onboarding'));
    for (const r of this.routes) {
      const m = path.match(r.re);
      if (m) {
        const params = {}; r.keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]));
        mount(this.viewEl); window.scrollTo(0, 0);
        this.setNav(r.nav || '');
        try { r.fn(this.viewEl, params); } catch (e) { console.error(e); mount(this.viewEl, h('div', { class: 'panel' }, 'تعذّر عرض الصفحة: ' + e.message)); }
        return;
      }
    }
    this.go('/home');
  },
  setNav(key) {
    $$('.nav-i,.tab-i', document).forEach(a => a.classList.toggle('on', a.dataset.nav === key));
    const more = $('.tab-i[data-nav=more]'); if (more) more.classList.toggle('on', ['challenges', 'profile', 'settings'].includes(key));
  },
};

function buildShell() {
  const app = $('#app'); clear(app);
  const d = D();
  const lv = levelInfo();
  const rail = h('nav', { class: 'rail', 'aria-label': 'التنقل' },
    h('a', { class: 'brand', href: '#/home' }, svgRoot(36, 36, { width: 36, height: 36 }, s('circle', { cx: 18, cy: 18, r: 16, fill: 'none', stroke: 'var(--text)', 'stroke-width': 1.5 }), s('path', { d: 'M18 4 L32 18 L18 32 L4 18Z', fill: 'none', stroke: 'var(--text)', 'stroke-width': 1.5 }), s('circle', { cx: 18, cy: 18, r: 3.2, fill: 'var(--text)' })), h('div', null, h('b', null, 'فِكْر زُون'), h('small', null, 'FikrZone'))),
    NAV.map(([k, label, path]) => h('a', { class: 'nav-i', href: '#' + path, 'data-nav': k }, icon(k), label)),
    h('a', { class: 'rail-foot', href: '#/profile', id: 'rail-foot' }));
  const main = h('main', { class: 'main' }, h('div', { class: 'view', id: 'view' }));
  const tab = h('nav', { class: 'tabbar', 'aria-label': 'التنقل السريع' },
    ['home', 'world', 'games', 'chess'].map(k => { const n = NAV.find(x => x[0] === k); return h('a', { class: 'tab-i', href: '#' + n[2], 'data-nav': k }, icon(k), n[1].replace('مكتبة الألعاب', 'الألعاب').replace('أكاديمية الشطرنج', 'الشطرنج').replace('عالم العقل', 'العالم')); }),
    h('button', { class: 'tab-i', 'data-nav': 'more', onClick: () => {
      let close; close = modal({ title: 'المزيد', body: h('div', { class: 'more-list' }, ['challenges', 'profile', 'settings'].map(k => { const n = NAV.find(x => x[0] === k); return h('a', { class: 'nav-i', href: '#' + n[2], onClick: () => close() }, icon(k), n[1]); })) });
    } }, icon('more'), 'المزيد'));
  app.append(rail, main, tab);
  Router.viewEl = $('#view'); Router.railEl = rail; Router.tabEl = tab;
  refreshRail();
}
function refreshRail() {
  const f = $('#rail-foot'); if (!f) return;
  const d = D(), lv = levelInfo();
  mount(f, h('div', { class: 'rf-lv' }, String(lv.level)), h('div', { style: 'flex:1;min-width:0' }, h('div', { class: 'nm' }, d.profile.name || 'مستكشف'), h('div', { class: 'lv' }, `المستوى ${lv.level} · ${lv.into} XP`), h('div', { class: 'xpbar' }, h('i', { style: `width:${Math.round(lv.frac * 100)}%` }))));
}

/* ---------- مكوّنات الصفحات ---------- */
function gameRow(def, o = {}) {
  const g = D().games[def.id], color = gameRealmColor(def);
  const star = h('button', { class: 'star' + (D().fav[def.id] ? ' on' : ''), 'aria-label': 'المفضلة', onClick: e => { e.preventDefault(); e.stopPropagation(); D().fav[def.id] = !D().fav[def.id]; if (!D().fav[def.id]) delete D().fav[def.id]; Store.save(); star.classList.toggle('on', !!D().fav[def.id]); star.textContent = D().fav[def.id] ? '★' : '☆'; } }, D().fav[def.id] ? '★' : '☆');
  return h('a', { class: 'grow', href: '#/game/' + def.id, style: `--accent:${color}` },
    h('span', { class: 'grow-ic' }, glyph(def.realms[0], 28, color, 2.6)),
    h('span', { class: 'grow-main' }, h('b', null, def.name), h('small', null, def.en + ' · ' + (def.skills || []).slice(0, 2).map(k => SKILLS[k]).join('، '))),
    h('span', { class: 'grow-meta' },
      def.realms.slice(1).map(r => h('span', { class: 'dotr', style: `background:${REALM[r].color}`, title: REALM[r].short })),
      h('span', { class: 'chip lvl' }, g ? LEVELS_AR[g.lvl - 1] : 'جديد'),
      h('span', { class: 'gbest' }, g && g.best ? 'أفضل ' + g.best : (g && g.last ? '' : 'لم تُلعب')),
      h('span', { class: 'glast' }, g && g.last ? ago(g.last) : '')),
    star);
}
function pageHead(title, sub, right) { return h('div', { class: 'ph' }, h('div', null, h('h1', null, title), sub ? h('p', { class: 'lead' }, sub) : null), right || null); }
function bar(frac, color) { return h('div', { class: 'pbar' }, h('i', { style: `width:${Math.round(clamp(frac, 0, 1) * 100)}%;${color ? 'background:' + color : ''}` })); }

/* ---------- لوحة تدريب اليوم (في الرئيسية) ---------- */
function dailyPanel() {
  const key = dayKey();
  const box = h('section', { class: 'panel trail-panel', id: 'daily-panel' });
  function draw() {
    const plan = Daily.plan(key), pr = Daily.progress(key);
    const pending = plan.items.filter(i => i.status === 'pending');
    const total = plan.items.reduce((a, b) => a + b.minutes, 0);
    const minSel = h('div', { class: 'seg sm' }, [15, 30, 45, 60].map(m => h('button', { class: 'seg-b' + (D().settings.minutes === m ? ' on' : ''), title: 'مدة تدريب اليوم', onClick: () => {
      if (plan.items.some(i => i.status === 'done')) { toast('بدأتَ برنامج اليوم — المدة الجديدة تُطبَّق من الغد'); D().settings.minutes = m; Store.save(); draw(); return; }
      D().settings.minutes = m; delete D().daily[key]; Store.save(); draw();
    } }, m + ' د')));
    mount(box,
      h('div', { class: 'ph-row' }, h('h3', null, 'تدريب اليوم'), h('span', { class: 'muted small' }, `${pr.done} من ${pr.total} · ${total} دقيقة تقريباً`)),
      plan.rewarded ? h('p', { class: 'note ok' }, 'أكملتَ برنامج اليوم — أحسنت! التدريب الحر متاح متى شئت.') : null,
      h('div', { class: 'plan' }, plan.items.map((it, i) => {
        const def = MV.byId[it.game], col = gameRealmColor(def), pl = Adapt.plan(it.game), saved = !!D().inprog[it.game];
        return h('div', { class: 'plan-i ' + it.status, style: `--accent:${col}` },
          h('span', { class: 'pi-n' }, it.status === 'done' ? '✓' : it.status === 'skipped' ? '–' : String(i + 1)),
          h('a', { class: 'pi-main', href: '#/game/' + def.id }, glyph(def.realms[0], 30, col, 2.5), h('span', null, h('b', null, def.name), h('small', null, REALM[def.realms[0]].short + ' · ' + it.minutes + ' دقائق · ' + LEVELS_AR[pl.level - 1] + (saved && it.status === 'pending' ? ' · لعبة محفوظة' : '')))),
          it.status === 'pending' ? h('div', { class: 'pi-act' },
              h('button', { class: 'btn ghost sm', title: 'استبدال بلعبة أخرى', onClick: () => { Daily.replace(key, i); draw(); } }, 'استبدال'),
              h('button', { class: 'btn ghost sm', onClick: () => { it.status = 'skipped'; Store.save(); draw(); } }, 'تخطي'))
            : h('span', { class: 'muted small' }, it.status === 'done' ? 'تم' : 'تُخطّي ', it.status === 'skipped' ? h('button', { class: 'btn ghost sm', onClick: () => { it.status = 'pending'; Store.save(); draw(); } }, 'تراجع') : null));
      })),
      h('div', { class: 'actions' },
        h('button', { class: 'btn primary', id: 'btn-daily', onClick: () => startDaily() }, pending.length === plan.items.length ? 'ابدأ تدريب اليوم' : pending.length ? `مواصلة التدريب اليومي (${pending.length} متبقٍّ)` : 'تدريب إضافي حر'),
        minSel));
  }
  draw();
  return box;
}

/* ---------- الرئيسية ---------- */
Router.add('/home', (view) => {
  const d = D(), lv = levelInfo(), plan = Daily.plan(), pr = Daily.progress();
  const hr = new Date().getHours();
  const greet = hr < 5 ? 'أهلاً بك' : hr < 12 ? 'صباح الخير' : hr < 18 ? 'مرحباً' : 'مساء الخير';
  const act = ownedTitles()[d.titles.active] || levelTitle(lv.level);
  const last = D().sessions.slice(-1)[0];
  const lastDef = last && MV.byId[last.game];
  const ch = Chal.daily().map(c => ({ c, p: Chal.progress(c), claimed: !!d.chal.claimed[c.id] })).sort((a, b) => (a.claimed - b.claimed) || (b.p.cur / b.p.n - a.p.cur / a.p.n))[0];
  const favs = MV.games.filter(g => d.fav[g.id]).slice(0, 8);
  const pending = plan.items.filter(i => i.status === 'pending');
  mount(view, h('div', { class: 'page home' },
    h('section', { class: 'hero' },
      h('div', { class: 'hero-t' },
        h('div', { class: 'muted small' }, fmtDateFull(Date.now())),
        h('h1', null, `${greet}${d.profile.name ? '، ' + d.profile.name : ''}`),
        h('div', { class: 'chips' }, h('span', { class: 'chip' }, act), h('span', { class: 'chip' }, `المستوى ${lv.level}`), h('span', { class: 'chip' }, `${Streak.current()} يوم متتالٍ`)),
        h('div', { class: 'xp-line' }, bar(lv.frac), h('span', { class: 'small muted' }, `\u2066${lv.into} / ${lv.need}\u2069 XP`)))),
    h('div', { class: 'home-grid' },
      dailyPanel(),
      h('div', { class: 'stack' },
        lastDef ? h('section', { class: 'panel' }, h('h3', null, 'متابعة'), h('p', { class: 'muted' }, `آخر جلسة: ${lastDef.name} · ${ago(last.ts)}`), h('div', { class: 'actions', style: 'margin-top:8px' }, h('button', { class: 'btn ghost sm', onClick: () => Play.open(lastDef.id) }, 'العب مجدداً'), h('a', { class: 'btn ghost sm', href: '#/games' }, 'لعبة أخرى'))) : h('section', { class: 'panel' }, h('h3', null, 'ابدأ من أي مكان'), h('p', { class: 'muted' }, 'كل الألعاب مفتوحة. اختر ما يجذبك من الخريطة أو المكتبة.'), h('a', { class: 'btn ghost sm', href: '#/games' }, 'فتح المكتبة')),
        ch ? h('section', { class: 'panel' }, h('h3', null, 'التحدي الحالي'), h('b', null, ch.c.title), h('p', { class: 'muted small' }, ch.c.desc), bar(ch.p.cur / ch.p.n, 'var(--ok)'), h('div', { class: 'small muted' }, ch.claimed ? 'مُنجَز ✓' : `\u2066${ch.p.cur} / ${ch.p.n}\u2069`)) : null)),
    h('section', { class: 'sec' }, h('div', { class: 'ph-row' }, h('h2', null, 'عالمك'), h('a', { class: 'muted', href: '#/world' }, 'فتح الخريطة ←')), mapHolder(true)),
    h('section', { class: 'sec' },
      h('div', { class: 'ph-row' }, h('h2', null, 'تطور المهارات'), h('a', { class: 'muted', href: '#/profile' }, 'ملف العقل ←')),
      h('div', { class: 'skillbars' }, REALMS.map(r => { const k = Skill.realm(r.id); return h('a', { class: 'sk', href: '#/world/' + r.id, style: `--accent:${r.color}` }, h('span', { class: 'sk-n' }, r.short), bar(k.score == null ? 0 : k.score, r.color), h('span', { class: 'sk-v small muted' }, k.attempts < 3 ? 'بيانات غير كافية' : Math.round(k.score * 100) + '%')); }))),
    h('section', { class: 'sec' }, h('h2', null, 'اختصارات'),
      favs.length ? h('div', { class: 'chips big' }, favs.map(g => h('a', { class: 'chip lg', href: '#/game/' + g.id, style: `--accent:${gameRealmColor(g)}` }, glyph(g.realms[0], 18, gameRealmColor(g), 2.8), g.name))) : h('p', { class: 'muted' }, 'أضف ألعابك المفضلة بالنجمة ☆ لتظهر هنا.'))));
});
function mapHolder(compact) {
  const box = h('div', { class: 'map-holder' });
  let port = window.innerWidth < 760;
  const draw = () => mount(box, worldMap({ compact, portrait: port }));
  draw();
  const onR = () => { const p = window.innerWidth < 760; if (p !== port) { port = p; draw(); } };
  window.addEventListener('resize', onR);
  const mo = new MutationObserver(() => { if (!box.isConnected) { window.removeEventListener('resize', onR); mo.disconnect(); } });
  mo.observe(document.body, { childList: true, subtree: true });
  return box;
}
function startDaily() {
  const plan = Daily.plan(), pending = plan.items.filter(i => i.status === 'pending');
  if (!pending.length) {
    // تدريب إضافي: ثلاث ألعاب عشوائية متنوعة
    const items = buildMixed(MIXED[0]); Play.startPlaylist('mixed', 'تدريب إضافي', items); return;
  }
  Play.startPlaylist('daily', 'التدريب اليومي', pending.map(i => ({ game: i.game, minutes: i.minutes })), { key: dayKey() });
}

/* ---------- العالم ---------- */
Router.add('/world', (view) => {
  mount(view, h('div', { class: 'page' },
    pageHead('عالم العقل', 'ثماني مناطق مفتوحة أمامك منذ اليوم الأول. اختر أي منطقة لتستكشف ألعابها — الخريطة وسيلة تنظيم لا بوابة.'),
    mapHolder(false),
    h('div', { class: 'realm-list' }, REALMS.map(r => { const n = MV.games.filter(g => g.realms.includes(r.id)).length, k = Skill.realm(r.id); return h('a', { class: 'rl', href: '#/world/' + r.id, style: `--accent:${r.color}` }, glyph(r.id, 30, r.color, 2.5), h('div', { class: 'rl-t' }, h('b', null, r.name), h('small', null, r.en)), h('span', { class: 'muted small' }, `${n} ألعاب · ${k.score == null ? 'لم تبدأ' : Math.round(k.score * 100) + '%'}`)); }))));
}, 'world');

Router.add('/world/:id', (view, { id }) => {
  const r = REALM[id]; if (!r) return Router.go('/world');
  const games = MV.games.filter(g => g.realms.includes(id)).sort((a, b) => (b.realms[0] === id) - (a.realms[0] === id));
  const k = Skill.realm(id), sessions = D().sessions.filter(s => { const dd = MV.byId[s.game]; return dd && dd.realms.includes(id); });
  const chs = Chal.all().filter(c => c.goal.realm === id || (c.goal.realmsAny && c.goal.realmsAny.includes(id)));
  const bestG = games.map(g => ({ g, rec: D().games[g.id] })).filter(x => x.rec && x.rec.best).sort((a, b) => b.rec.best - a.rec.best)[0];
  const contour = svgRoot(600, 160, { class: 'banner-art', preserveAspectRatio: 'xMidYMid slice' }, ...range(9, i => s('path', { d: blobPath(420, 90, 20 + i * 24, hashStr(id) + i, 14, 0.3), fill: 'none', stroke: r.color, 'stroke-width': 1.2, opacity: 0.16 + (i % 3) * 0.06 })));
  mount(view, h('div', { class: 'page realm-page', style: `--accent:${r.color}` },
    h('a', { class: 'back-link', href: '#/world' }, '→ الخريطة'),
    h('section', { class: 'banner' }, contour, h('div', { class: 'banner-in' }, glyph(id, 58, r.color, 2.2), h('div', null, h('h1', null, r.name), h('div', { class: 'en' }, r.en), h('p', { class: 'lead' }, r.desc)))),
    h('div', { class: 'kv-grid four rstats' }, [['التقدير', k.score == null ? '—' : Math.round(k.score * 100) + '%'], ['الموثوقية', k.label], ['الجلسات', sessions.length], ['أعلى نتيجة', bestG ? bestG.rec.best : '—']].map(([a, b]) => h('div', { class: 'kv' }, h('div', { class: 'v', style: String(b).length > 10 ? 'font-size:.95rem' : '' }, String(b)), h('div', { class: 'k' }, a)))),
    h('div', { class: 'actions', style: 'margin:14px 0 4px' }, h('button', { class: 'btn primary', onClick: () => { const pool = games.filter(g => !g.longSession); Play.open(rnd.pick(pool).id); } }, 'تدريب عشوائي في ' + r.short), h('a', { class: 'btn ghost', href: '#/games' }, 'المكتبة كاملة')),
    h('h2', { class: 'sec-t' }, `الألعاب (${games.length})`),
    h('div', { class: 'glist' }, games.map(g => gameRow(g))),
    chs.length ? h('div', null, h('h2', { class: 'sec-t' }, 'تحديات مرتبطة'), chs.map(c => { const p = Chal.progress(c); return h('div', { class: 'panel mini-ch' }, h('b', null, c.title), h('span', { class: 'muted small' }, ' · ' + c.desc), bar(p.cur / p.n, 'var(--ok)')); })) : null));
}, 'world');

/* ---------- مكتبة الألعاب ---------- */
Router.add('/games', (view) => {
  const st = Games_state;
  const list = h('div', { class: 'glist' }), count = h('span', { class: 'muted' });
  const q = h('input', { type: 'search', class: 'inp', placeholder: 'ابحث عن لعبة بالاسم…', value: st.q, onInput: e => { st.q = e.target.value; draw(); } });
  const chipRow = h('div', { class: 'chips filt' });
  const skillSel = h('select', { class: 'inp', onChange: e => { st.skill = e.target.value; draw(); } }, h('option', { value: '' }, 'كل المهارات'), Object.entries(SKILLS).map(([k, v]) => h('option', { value: k }, v)));
  const typeSel = h('select', { class: 'inp', onChange: e => { st.type = e.target.value; draw(); } }, h('option', { value: '' }, 'كل الأنواع'), Object.entries(GTYPES).map(([k, v]) => h('option', { value: k }, v)));
  const sortSel = h('select', { class: 'inp', onChange: e => { st.sort = e.target.value; draw(); } }, [['realm', 'حسب المنطقة'], ['name', 'الأبجدية'], ['recent', 'الأحدث لعباً'], ['level', 'الأعلى مستوى']].map(([k, v]) => h('option', { value: k }, v)));
  const favChk = h('label', { class: 'check', style: 'margin:0' }, h('input', { type: 'checkbox', onChange: e => { st.fav = e.target.checked; draw(); } }), ' المفضلة فقط');
  skillSel.value = st.skill; typeSel.value = st.type; sortSel.value = st.sort; favChk.firstChild.checked = st.fav;
  function chips() {
    mount(chipRow, [['', 'الكل', 'var(--text)']].concat(REALMS.map(r => [r.id, r.short, r.color])).map(([id, label, col]) => h('button', { class: 'chip lg fchip' + (id ? '' : ' all') + (st.realm === id ? ' on' : ''), style: `--accent:${col}`, onClick: () => { st.realm = id; chips(); draw(); } }, id ? glyph(id, 16, col, 3) : null, label)));
  }
  function draw() {
    const nq = kit.normAr(st.q).toLowerCase();
    let arr = MV.games.filter(g => {
      if (st.realm && !g.realms.includes(st.realm)) return false;
      if (st.skill && !(g.skills || []).includes(st.skill)) return false;
      if (st.type && g.type !== st.type) return false;
      if (st.fav && !D().fav[g.id]) return false;
      if (nq && !(kit.normAr(g.name).toLowerCase().includes(nq) || g.en.toLowerCase().includes(nq) || (g.skills || []).some(k => kit.normAr(SKILLS[k]).includes(nq)))) return false;
      return true;
    });
    const gl = id => D().games[id];
    if (st.sort === 'name') arr.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    else if (st.sort === 'recent') arr.sort((a, b) => ((gl(b.id) || {}).last || 0) - ((gl(a.id) || {}).last || 0));
    else if (st.sort === 'level') arr.sort((a, b) => ((gl(b.id) || { lvl: 0 }).lvl) - ((gl(a.id) || { lvl: 0 }).lvl));
    else arr.sort((a, b) => REALMS.findIndex(r => r.id === a.realms[0]) - REALMS.findIndex(r => r.id === b.realms[0]));
    count.textContent = arr.length + ' لعبة';
    mount(list);
    if (!arr.length) { list.append(h('div', { class: 'empty' }, 'لا توجد ألعاب مطابقة. جرّب تغيير البحث أو المرشحات.')); return; }
    let lastRealm = null;
    arr.forEach(g => {
      if (st.sort === 'realm' && g.realms[0] !== lastRealm) { lastRealm = g.realms[0]; list.append(h('h3', { class: 'group-h', style: `--accent:${REALM[lastRealm].color}` }, glyph(lastRealm, 20, REALM[lastRealm].color, 2.8), REALM[lastRealm].name)); }
      list.append(gameRow(g));
    });
  }
  mount(view, h('div', { class: 'page' }, pageHead('مكتبة الألعاب', 'كل الألعاب متاحة دائماً. ابحث، صفِّ، وابدأ مباشرة.', count),
    h('div', { class: 'filters' }, q, skillSel, typeSel, sortSel, favChk), chipRow,
    h('div', { class: 'actions', style: 'margin:6px 0 12px' }, h('button', { class: 'btn ghost sm', onClick: () => Play.open(rnd.pick(MV.games.filter(g => !g.longSession)).id) }, 'لعبة عشوائية')), list));
  chips(); draw();
}, 'games');
const Games_state = { q: '', realm: '', skill: '', type: '', sort: 'realm', fav: false };
