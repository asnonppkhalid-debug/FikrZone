'use strict';
/* ============ الصفحات (2): التحديات، الملف، السجل، الشخصية، الإعدادات، الترحيب ============ */

function timeLeft(c) {
  if (c.kind === 'daily') { const e = new Date(); e.setHours(24, 0, 0, 0); const hrs = Math.max(1, Math.round((e - Date.now()) / 36e5)); return `متبقٍ ${hrs} ساعة`; }
  const start = new Date(c.id.split(':')[1] + 'T12:00:00'); const end = start.getTime() + 7 * 864e5; const d = Math.max(0, Math.ceil((end - Date.now()) / 864e5)); return `متبقٍ ${d} أيام`;
}
function chalCard(c) {
  const p = Chal.progress(c), claimed = !!D().chal.claimed[c.id];
  return h('div', { class: 'chal' + (claimed ? ' done' : '') },
    h('div', { class: 'chal-h' }, h('b', null, c.title), h('span', { class: 'chip' }, claimed ? 'مُنجَز ✓' : timeLeft(c))),
    h('p', { class: 'muted' }, c.desc), bar(p.cur / p.n, 'var(--ok)'),
    h('div', { class: 'chal-f' }, h('span', { class: 'small' }, `\u2066${p.cur} / ${p.n}\u2069`), h('span', { class: 'small muted' }, `+${c.reward.xp} XP`)));
}
Router.add('/challenges', (view) => {
  const pbs = Chal.pb();
  mount(view, h('div', { class: 'page' },
    pageHead('التحديات', 'تحديات لا تكافئ السرعة وحدها: الدقة والتفكير العميق والتخطيط لها نصيبها. كلها متاحة بلا شروط فتح.'),
    h('h2', { class: 'sec-t' }, 'يومية'), h('div', { class: 'chal-grid' }, Chal.daily().map(chalCard)),
    h('h2', { class: 'sec-t' }, 'أسبوعية'), h('div', { class: 'chal-grid' }, Chal.weekly().map(chalCard)),
    h('h2', { class: 'sec-t' }, 'خاصة (بقواعد مختلفة)'), h('div', { class: 'chal-grid' }, Chal.special().map(chalCard)),
    h('h2', { class: 'sec-t' }, 'أفضل نتيجة شخصية'),
    pbs.length ? h('div', { class: 'pb-list' }, pbs.map(p => { const def = MV.byId[p.game]; return h('div', { class: 'panel pbrow', style: `--accent:${gameRealmColor(def)}` }, glyph(def.realms[0], 28, gameRealmColor(def), 2.5), h('div', { style: 'flex:1' }, h('b', null, def.name), h('div', { class: 'muted small' }, p.active ? `الهدف: تجاوز ${p.target} نقطة` : `رقمك الحالي: ${p.best}`)), p.active ? h('button', { class: 'btn ghost sm', onClick: () => { delete D().chal.pbTargets[p.game]; Store.save(); Router.render(); } }, 'إلغاء') : null, h('button', { class: 'btn primary sm', onClick: () => { if (!p.active) D().chal.pbTargets[p.game] = { target: p.best, ts: Date.now() }; Store.save(); Play.open(p.game); } }, p.active ? 'العب' : 'تحدَّ رقمك')); })) : h('p', { class: 'muted' }, 'العب بضع ألعاب أولاً لتظهر أرقامك الشخصية هنا.'),
    h('h2', { class: 'sec-t' }, 'تحديات مختلطة'),
    h('div', { class: 'chal-grid' }, MIXED.map(m => h('div', { class: 'chal' }, h('b', null, m.name), h('p', { class: 'muted' }, m.desc), h('div', { class: 'chal-f' }, h('span', { class: 'small muted' }, 'مكافأة إضافية عند الإكمال'), h('button', { class: 'btn primary sm', onClick: () => Play.startPlaylist('mixed', m.name, buildMixed(m)) }, 'ابدأ')))))));
}, 'challenges');

/* ---------- ملف العقل ---------- */
Router.add('/profile', (view) => {
  const sessions = D().sessions.filter(s => !s.as);
  const items = REALMS.map(r => { const k = Skill.realm(r.id); return { label: r.short, color: r.color, score: k.attempts < 3 ? null : k.score, rel: k.rel, k, r }; });
  const byDay = {};
  sessions.forEach(s => { const k = dayKey(new Date(s.ts)); (byDay[k] = byDay[k] || []).push(s); });
  const days = Object.keys(byDay).sort().slice(-14);
  const trendPerf = days.map(k => ({ y: avg(byDay[k].map(s => s.perf)) * 100, label: k.slice(5).replace('-', '/') }));
  const trendAcc = days.map(k => ({ y: avg(byDay[k].map(s => s.acc)) * 100, label: k.slice(5).replace('-', '/') }));
  const now = Date.now(), w1 = sessions.filter(s => s.ts > now - 7 * 864e5), w2 = sessions.filter(s => s.ts <= now - 7 * 864e5 && s.ts > now - 14 * 864e5);
  const cmp = (fn, fmt) => { const a = w1.length ? fn(w1) : null, b = w2.length ? fn(w2) : null; return [a == null ? '—' : fmt(a), b == null ? '—' : fmt(b), a != null && b != null ? (a > b ? '↑' : a < b ? '↓' : '=') : '']; };
  const counts = {}; sessions.forEach(s => counts[s.game] = (counts[s.game] || 0) + 1);
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const weak = items.filter(i => i.k.score == null || i.k.attempts < 3).concat(items.filter(i => i.k.score != null && i.k.attempts >= 3).sort((a, b) => a.score - b.score)).slice(0, 3);
  const totalMin = Math.round(D().stats.totalTime / 60);
  mount(view, h('div', { class: 'page' },
    pageHead('ملف العقل', 'لا رقم واحد اسمه «الذكاء». هنا صورة لمهاراتك الثماني مع بيان مدى موثوقية كل تقدير.'),
    h('div', { class: 'prof-top' },
      h('section', { class: 'panel' }, radarChart(items, 360), h('p', { class: 'muted small', style: 'text-align:center' }, 'النقاط الباهتة = بيانات قليلة. التقدير يعتمد على مستوى الصعوبة والأداء في آخر المحاولات.')),
      h('section', { class: 'panel' }, h('h3', null, 'المناطق'),
        h('div', { class: 'rbars' }, items.map(i => h('a', { class: 'rb', href: '#/world/' + i.r.id, style: `--accent:${i.color}` }, h('span', { class: 'rb-n' }, i.r.name), bar(i.score == null ? 0 : i.score, i.color), h('span', { class: 'rb-v' }, i.score == null ? '—' : Math.round(i.score * 100) + '%'), h('span', { class: 'rb-r small muted' }, `${i.k.label} · ${i.k.attempts} محاولة`)))))),
    h('section', { class: 'sec' }, h('h2', null, 'تحتاج مزيداً من التدريب'),
      h('div', { class: 'chips big' }, weak.map(i => h('a', { class: 'chip lg', href: '#/world/' + i.r.id, style: `--accent:${i.color}` }, glyph(i.r.id, 18, i.color, 2.8), i.r.name, i.k.score == null ? ' · لم تبدأ' : ' · ' + Math.round(i.k.score * 100) + '%')))),
    h('div', { class: 'two' },
      h('section', { class: 'panel' }, h('h3', null, 'تطور الأداء (متوسط يومي)'), lineChart(trendPerf, { max: 100, min: 0, color: 'var(--text)', fmt: v => Math.round(v) + '%' }), h('h3', { style: 'margin-top:14px' }, 'الدقة'), lineChart(trendAcc, { max: 100, min: 0, color: 'var(--ok)', fmt: v => Math.round(v) + '%', h: 130 })),
      h('section', { class: 'panel' }, h('h3', null, 'مقارنة: هذا الأسبوع مقابل السابق'),
        h('table', { class: 'tbl' }, h('thead', null, h('tr', null, h('th'), h('th', null, 'هذا الأسبوع'), h('th', null, 'السابق'), h('th'))),
          h('tbody', null, [['الجلسات', ...cmp(l => l.length, v => v)], ['الدقة', ...cmp(l => avg(l.map(s => s.acc)), v => pct(v))], ['متوسط الصعوبة', ...cmp(l => avg(l.map(s => s.lvl)), v => v.toFixed(1))], ['الوقت (د)', ...cmp(l => sum(l.map(s => s.time)) / 60, v => Math.round(v))]].map(r => h('tr', null, h('td', null, r[0]), h('td', null, String(r[1])), h('td', null, String(r[2])), h('td', null, r[3]))))),
        h('h3', { style: 'margin-top:16px' }, 'الألعاب الأكثر ممارسة'),
        top.length ? h('div', { class: 'tops' }, top.map(([id, n]) => h('div', { class: 'top-r' }, h('span', null, MV.byId[id].name), bar(n / top[0][1], gameRealmColor(MV.byId[id])), h('span', { class: 'small muted' }, n)))) : h('p', { class: 'muted' }, 'لا جلسات بعد.'))),
    h('section', { class: 'sec' }, h('h2', null, 'الألقاب'),
      h('p', { class: 'muted small' }, 'اللقب الذي تختاره يظهر في الرئيسية. تُنال ألقاب جديدة بالإنجازات.'),
      h('div', { class: 'title-list', id: 'title-list' }, Object.entries(ownedTitles()).map(([k, t]) => h('button', { class: 'title-i' + (D().titles.active === k ? ' on' : ''), onClick: e => { D().titles.active = k; Store.save(); $$('.title-i', e.target.parentNode).forEach(b => b.classList.toggle('on', b === e.target)); } }, t)),
        ACH.filter(x => x.title && !D().ach[x.id]).map(x => h('div', { class: 'title-i locked' }, x.title, h('small', null, 'يُنال بإنجاز: ' + x.name))))),
    h('section', { class: 'sec' }, h('h2', null, 'الإنجازات'),
      h('p', { class: 'muted' }, `\u2066${Object.keys(D().ach).length} / ${ACH.length}\u2069 منجَز`),
      h('div', { class: 'ach-grid' }, ACH.map(x => h('div', { class: 'ach' + (D().ach[x.id] ? ' got' : '') }, h('b', null, (D().ach[x.id] ? '★ ' : '☆ ') + x.name), h('small', null, x.desc), D().ach[x.id] ? h('small', { class: 'dim' }, fmtDate(D().ach[x.id])) : null)))),
    h('p', { class: 'muted small', style: 'margin-top:14px' }, `إجمالي الجلسات: ${D().stats.sessions} · وقت التدريب: ${totalMin} دقيقة · أطول سلسلة: ${D().streak.best} يوماً`)));
}, 'profile');

/* ---------- الإعدادات ---------- */
function applySettings() {
  const st = D().settings;
  const theme = st.theme === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : st.theme;
  document.documentElement.dataset.theme = theme;
  document.body.classList.toggle('no-motion', !st.motion);
  Sound.on = !!st.sound; Sound.vol = st.vol;
  const mc = document.querySelector('meta[name=theme-color]'); if (mc) mc.content = theme === 'light' ? '#f3efe4' : '#0d1218';
}
Router.add('/settings', (view) => {
  const st = D().settings;
  const tog = (key, label, hint, after) => h('label', { class: 'set-row' }, h('span', null, h('b', null, label), hint ? h('small', { class: 'muted' }, hint) : null), h('input', { type: 'checkbox', checked: st[key], onChange: e => { st[key] = e.target.checked; Store.save(); applySettings(); after && after(); } }));
  const segSet = (key, opts, after) => h('div', { class: 'seg' }, opts.map(([v, l]) => h('button', { class: 'seg-b' + (st[key] === v ? ' on' : ''), onClick: e => { st[key] = v; Store.save(); applySettings(); after && after(); $$('.seg-b', e.target.parentNode).forEach(b => b.classList.toggle('on', b === e.target)); } }, l)));
  const fileIn = h('input', { type: 'file', accept: 'application/json', style: 'display:none', onChange: async e => {
    const f = e.target.files[0]; if (!f) return;
    try { Store.import(await f.text()); applySettings(); toast('تم استيراد البيانات'); location.hash = '#/home'; location.reload(); } catch (err) { toast('الملف غير صالح', 'bad'); }
  } });
  mount(view, h('div', { class: 'page settings' }, pageHead('الإعدادات'),
    h('section', { class: 'panel' }, h('h3', null, 'الحساب'),
      h('label', { class: 'set-row' }, h('span', null, h('b', null, 'اسمك')), h('input', { class: 'inp', value: D().profile.name, maxlength: 16, onChange: e => { D().profile.name = e.target.value.trim().slice(0, 16); Store.save(); refreshRail(); } })),
      h('div', { class: 'set-row' }, h('span', null, h('b', null, 'التقييم الأولي'), h('small', { class: 'muted' }, 'أعد التقييم لضبط نقطة البداية من جديد')), h('button', { class: 'btn ghost sm', onClick: () => { D().profile.step = 'assess'; Store.save(); Router.go('/onboarding'); } }, 'إعادة التقييم')),
      h('div', { class: 'set-row' }, h('span', null, h('b', null, 'مجالات التركيز'), h('small', { class: 'muted' }, 'تؤثر في اقتراحات التدريب اليومي')), h('button', { class: 'btn ghost sm', onClick: () => { D().profile.step = 'interests'; Store.save(); Router.go('/onboarding'); } }, 'تعديل'))),
    h('section', { class: 'panel' }, h('h3', null, 'اللغة'),
      h('div', { class: 'set-row' }, h('span', null, h('b', null, 'لغة الواجهة'), h('small', { class: 'muted' }, 'محتوى الألعاب اللغوية عربي. الواجهة الإنجليزية غير متوفرة في هذه النسخة.')), h('div', { class: 'seg' }, h('button', { class: 'seg-b on' }, 'العربية'), h('button', { class: 'seg-b', disabled: true, style: 'opacity:.4' }, 'English')))),
    h('section', { class: 'panel' }, h('h3', null, 'الصوت'), tog('sound', 'المؤثرات الصوتية', 'أصوات قصيرة عند الإجابة والنتائج'),
      h('label', { class: 'set-row' }, h('span', null, h('b', null, 'مستوى الصوت')), h('input', { type: 'range', min: 0.1, max: 1, step: 0.1, value: st.vol, onInput: e => { st.vol = +e.target.value; Store.save(); applySettings(); Sound.play('ok'); } }))),
    h('section', { class: 'panel' }, h('h3', null, 'المظهر'),
      h('div', { class: 'set-row' }, h('b', null, 'السمة'), segSet('theme', [['dark', 'داكن'], ['light', 'فاتح'], ['auto', 'تلقائي']])),
      tog('motion', 'الحركة والانتقالات', 'أوقفها إن كانت تزعجك')),
    installPanel(),
    h('section', { class: 'panel' }, h('h3', null, 'الجلسات'),
      h('div', { class: 'set-row' }, h('span', null, h('b', null, 'مدة التدريب اليومي'), h('small', { class: 'muted' }, 'يُطبَّق على البرامج الجديدة')), segSet('minutes', [[15, '15'], [30, '30'], [45, '45'], [60, '60']])),
      tog('timer', 'إظهار الوقت أثناء اللعب'), tog('confirmQuit', 'تأكيد قبل الخروج من لعبة')),
    h('section', { class: 'panel' }, h('h3', null, 'التحديات والتلميحات'),
      tog('hints', 'السماح بالتلميحات', 'عند إيقافها لا تظهر أزرار التلميح في الألعاب'), tog('perfNote', 'إظهار ملاحظات الصعوبة التكيفية بعد كل جلسة')),
    h('section', { class: 'panel' }, h('h3', null, 'الخصوصية'),
      h('p', { class: 'muted' }, 'كل بياناتك محفوظة على هذا الجهاز فقط في متصفحك، ولا يرسل فِكْر زُون أي شيء إلى أي خادم. لا حسابات ولا تتبّع.'),
      h('p', { class: 'small ' + (Store.persistent() ? 'muted' : ''), style: Store.persistent() ? '' : 'color:var(--bad)' }, Store.persistent() ? 'التخزين المحلي يعمل بشكل طبيعي.' : 'تنبيه: التخزين المحلي غير متاح في هذا المتصفح — لن يُحفظ التقدم بعد الإغلاق. صدّر نسخة احتياطية.')),
    h('section', { class: 'panel' }, h('h3', null, 'إدارة البيانات'),
      h('div', { class: 'actions', style: 'margin:0' },
        h('button', { class: 'btn ghost', onClick: () => { const b = new Blob([Store.export()], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(b), download: `fikrzone-backup-${dayKey()}.json` }); document.body.append(a); a.click(); a.remove(); toast('تم تصدير النسخة الاحتياطية'); } }, 'تصدير نسخة احتياطية'),
        h('button', { class: 'btn ghost', onClick: () => fileIn.click() }, 'استيراد نسخة'), fileIn,
        h('button', { class: 'btn danger', onClick: async () => { if (await confirmBox('حذف كل البيانات؟', 'سيُمسح تقدّمك ونتائجك وتصنيفك نهائياً. لا يمكن التراجع.', 'احذف كل شيء', 'إلغاء', true)) { Store.reset(); Store.save(true); location.hash = '#/onboarding'; location.reload(); } } }, 'حذف كل البيانات')))));
}, 'settings');

/* ---------- الترحيب والتقييم الأولي ---------- */
const ASSESS = [['logic', 'pattern'], ['strategy', 'decision'], ['memory', 'seqmem'], ['focus', 'vsearch'], ['speed', 'mentalmath'], ['spatial', 'rotation'], ['language', 'synant'], ['abstract', 'rulefind']];
Router.add('/onboarding', (view) => {
  const P = D().profile;
  let step = P.step || 'welcome'; if (step === 'char') step = 'name';
  if (P.onboarded && !P.step) step = 'welcome';
  const setStep = s2 => { P.step = s2; step = s2; Store.save(); draw(); };
  function frame(kids) { mount(view, h('div', { class: 'page onb' }, h('div', { class: 'onb-steps' }, ['welcome', 'name', 'assess', 'interests', 'plan'].map(k => h('i', { class: k === step ? 'on' : '' }))), kids)); }
  function draw() {
    if (step === 'welcome') {
      let i = 0;
      const slides = [
        ['عالم تتدرّب فيه عقلك', 'فِكْر زُون (FikrZone) عالم رقمي فيه ثماني مناطق وأكثر من أربعين لعبة وتحدٍّ، وأكاديمية شطرنج كاملة. كلها لتمرين التفكير لا لحفظ المعلومات.'],
        ['كل شيء مفتوح من اليوم الأول', 'لا أقفال ولا شروط. اختر أي لعبة في أي وقت، والصعوبة هي التي تتكيّف مع أدائك داخل كل لعبة.'],
        ['تقدّم حقيقي، بلا ضغط', 'تتابع مهاراتك الثماني مع بيان مدى موثوقية كل تقدير. والتدريب ممتع: تخطَّ، بدّل، وخذ يوم راحة متى شئت.'],
      ];
      const box = h('div', { class: 'onb-slide' }), dots = h('div', { class: 'onb-dots' });
      const show = () => { mount(box, h('h1', null, slides[i][0]), h('p', { class: 'lead' }, slides[i][1])); mount(dots, slides.map((_, k) => h('i', { class: k === i ? 'on' : '' }))); nextBtn.textContent = i === slides.length - 1 ? 'لنبدأ' : 'التالي'; };
      const nextBtn = h('button', { class: 'btn primary lg', onClick: () => { if (i < slides.length - 1) { i++; show(); } else setStep('name'); } }, 'التالي');
      frame([h('div', { class: 'onb-hero' }, worldMap({ compact: true, portrait: false, onPick: () => { } })), box, dots, h('div', { class: 'actions' }, nextBtn)]);
      show();
    } else if (step === 'name') {
      const name = h('input', { class: 'inp name-inp', value: P.name, maxlength: 16, placeholder: 'اسمك أو لقبك', id: 'onb-name', onInput: e => { P.name = e.target.value.trim().slice(0, 16); } });
      frame([h('h1', null, 'بماذا نناديك؟'), h('p', { class: 'lead' }, 'اسم يظهر لك في الرئيسية وفي ملفك. يمكنك تغييره لاحقاً من الإعدادات.'),
        h('div', { class: 'onb-char' }, h('div', { class: 'opts' }, name)),
        h('div', { class: 'actions' }, h('button', { class: 'btn primary lg', onClick: () => { if (!P.name) { toast('اكتب اسماً أولاً'); name.focus(); return; } setStep('assess'); } }, 'متابعة'))]);
    } else if (step === 'assess') {
      frame([h('h1', null, 'تقييم أولي قصير'), h('p', { class: 'lead' }, 'ثماني جولات خفيفة، واحدة من كل منطقة (نحو 8 دقائق). ليست حكماً على ذكائك — بل لتبدأ كل منطقة بمستوى يناسبك.'),
        h('div', { class: 'assess-list' }, ASSESS.map(([r, g]) => h('div', { class: 'rl', style: `--accent:${REALM[r].color}` }, glyph(r, 28, REALM[r].color, 2.5), h('div', { class: 'rl-t' }, h('b', null, REALM[r].name), h('small', null, MV.byId[g] ? MV.byId[g].name : g))))),
        h('div', { class: 'actions' },
          h('button', { class: 'btn primary lg', id: 'btn-assess', onClick: () => { P.step = 'interests'; Store.save(); Play.startPlaylist('assess', 'التقييم الأولي', ASSESS.map(([r, g]) => ({ game: g, minutes: 1 })), { quick: true }); } }, 'ابدأ التقييم'),
          h('button', { class: 'btn ghost lg', id: 'btn-skip-assess', onClick: () => setStep('interests') }, 'تخطَّ وابدأ من الأساس'))]);
    } else if (step === 'interests') {
      const sel = new Set(P.interests);
      const grid = h('div', { class: 'int-grid' }, REALMS.map(r => { const b = h('button', { class: 'int' + (sel.has(r.id) ? ' on' : ''), style: `--accent:${r.color}`, onClick: () => { if (sel.has(r.id)) sel.delete(r.id); else sel.add(r.id); b.classList.toggle('on', sel.has(r.id)); } }, glyph(r.id, 34, r.color, 2.4), h('b', null, r.short), h('small', null, r.tagline)); return b; }));
      frame([h('h1', null, 'ما المهارات التي تريد التركيز عليها؟'), h('p', { class: 'lead' }, 'اختر ما شئت (أو لا شيء). هذا يؤثر في اقتراحات التدريب اليومي فقط — كل الألعاب تبقى متاحة دائماً.'), grid,
        h('div', { class: 'actions' }, h('button', { class: 'btn primary lg', id: 'btn-int', onClick: () => { P.interests = [...sel]; setStep('plan'); } }, 'إعداد برنامجي اليومي'))]);
    } else {
      delete D().daily[dayKey()];
      const plan = Daily.plan();
      frame([h('h1', null, 'برنامجك اليومي الأول جاهز'), h('p', { class: 'lead' }, 'مختار من المكتبة كاملة بحسب نتائجك واهتماماتك. تستطيع استبدال أو تخطي أي تمرين دون أي عقوبة.'),
        h('div', { class: 'assess-list' }, plan.items.map(it => { const d = MV.byId[it.game]; return h('div', { class: 'rl', style: `--accent:${gameRealmColor(d)}` }, glyph(d.realms[0], 28, gameRealmColor(d), 2.5), h('div', { class: 'rl-t' }, h('b', null, d.name), h('small', null, REALM[d.realms[0]].short + ' · ' + it.minutes + ' دقائق'))); })),
        h('div', { class: 'actions' }, h('button', { class: 'btn primary lg', id: 'btn-enter', onClick: () => { P.onboarded = true; delete P.step; Store.save(true); buildShell(); applySettings(); Router.go('/home'); } }, 'ادخل فِكْر زُون'))]);
    }
  }
  draw();
});

/* ---------- ملخص قوائم التشغيل ---------- */
Router.add('/summary', (view) => {
  const pl = Play.playlist;
  if (!pl || !pl.results.length) { Router.go('/home'); return; }
  if (pl.kind === 'assess') {
    pl.results.forEach(rec => {
      const rid = REALM_OF(rec.game), lvl = rec.perf >= 0.85 ? 3 : rec.perf >= 0.6 ? 2 : 1;
      MV.games.filter(g => g.realms.includes(rid)).forEach(g => { const gr = Adapt.rec(g.id); if (!gr.hist.some(e => !e.as) || g.id === rec.game) { gr.lvl = lvl; gr.since = 0; } });
    });
    D().profile.assessed = true; D().profile.step = 'interests'; Store.save(true);
    Play.playlist = null; Router.go('/onboarding'); return;
  }
  let bonus = null;
  if (pl.kind === 'mixed' && !pl.bonusGiven) {
    pl.bonusGiven = true; const ap = avg(pl.results.map(r => r.perf));
    bonus = { xp: Math.round(30 + 50 * ap) };
    D().xp += bonus.xp; Store.save(true); refreshRail();
  }
  const tot = { xp: sum(pl.results.map(r => r.xp)) + (bonus ? bonus.xp : 0), time: sum(pl.results.map(r => r.time)) };
  mount(view, h('div', { class: 'page' }, pageHead(pl.title + ' — الملخص', pl.kind === 'daily' ? 'أحسنت! أكملتَ ما اخترت من برنامج اليوم.' : 'نتائج جولتك المختلطة.'),
    h('div', { class: 'kv-grid four' }, [['الألعاب', pl.results.length], ['متوسط الدقة', pct(avg(pl.results.map(r => r.acc)))], ['الوقت', fmtTime(tot.time)], ['XP', tot.xp]].map(([k, v]) => h('div', { class: 'kv' }, h('div', { class: 'v' }, String(v)), h('div', { class: 'k' }, k)))),
    bonus ? h('p', { class: 'note ok' }, `مكافأة إكمال الجولة المختلطة: +${bonus.xp} XP`) : null,
    h('div', { class: 'panel', style: 'margin-top:14px' }, pl.results.map(r => { const d = MV.byId[r.game]; return h('div', { class: 'hrow', style: `--accent:${gameRealmColor(d)}` }, glyph(d.realms[0], 26, gameRealmColor(d), 2.6), h('div', { class: 'hr-main' }, h('b', null, d.name), h('small', null, LEVELS_AR[r.lvl - 1])), h('span', { class: 'hr-c' }, h('b', null, r.score), h('small', null, 'نتيجة')), h('span', { class: 'hr-c' }, h('b', null, pct(r.acc)), h('small', null, 'دقة'))); })),
    h('div', { class: 'actions' }, h('a', { class: 'btn primary lg', href: '#/home', onClick: () => { Play.playlist = null; } }, 'الرئيسية'), h('a', { class: 'btn ghost lg', href: '#/profile', onClick: () => { Play.playlist = null; } }, 'ملف العقل'))));
});

/* ---------- مسارات اللعب ---------- */
Router.add('/game/:id', (view, { id }) => Play.intro(view, id), 'games');
Router.add('/play/:id', (view, { id }) => Play.run(view, id), 'games');
