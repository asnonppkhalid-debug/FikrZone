'use strict';
/* ============ عالم اللغة: 6 ألعاب (بيانات عربية مكتوبة يدوياً ومتحقَّق من بنيتها) ============ */
MV.css(`
.wordbig{font-family:var(--f-body);font-weight:600;font-size:2.4rem;text-align:center;margin:12px 0;color:var(--accent-t)}
.tiles{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0;direction:rtl}
.tile{min-width:48px;height:52px;border-radius:10px;border:1px solid var(--line2);background:var(--surface);font-size:1.5rem;color:var(--text);cursor:pointer;font-family:var(--f-body)}
.tile:disabled{opacity:.25;cursor:default}
.slots{display:flex;gap:6px;justify-content:center;margin:14px 0;min-height:58px;direction:rtl}
.slot{min-width:46px;height:54px;border-bottom:3px solid var(--line2);display:grid;place-items:center;font-size:1.7rem;cursor:pointer}
.slot.f{border-color:var(--accent)}
.sentence{font-size:1.25rem;line-height:2;text-align:center;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:16px;margin:10px auto;max-width:520px}
.sentence b{display:inline-block;min-width:70px;border-bottom:3px dashed var(--accent);color:transparent}
.mc.wide .mc-opt{font-size:1.15rem}
`);

/* ---------- البيانات ---------- */
const LANG = {
  syn: [['شجاع', 'جريء'], ['حزين', 'كئيب'], ['سعيد', 'مسرور'], ['غضب', 'سخط'], ['طريق', 'سبيل'], ['بيت', 'منزل'], ['قوي', 'شديد'], ['ذكي', 'فطن'], ['كلام', 'حديث'], ['بعيد', 'نائي'], ['قديم', 'عتيق'], ['عجيب', 'غريب'], ['فقير', 'معدم'], ['غني', 'ثري'], ['خوف', 'وجل'], ['هادئ', 'ساكن'], ['كريم', 'سخي'], ['بخيل', 'شحيح'], ['لامع', 'ساطع'], ['قبيح', 'بشع'], ['سار', 'مشى'], ['عاد', 'رجع'], ['بدأ', 'شرع'], ['أنهى', 'أتمّ'], ['ضخم', 'هائل'], ['صديق', 'رفيق'], ['جميل', 'بديع'], ['كثير', 'وفير'], ['حذر', 'يقظ'], ['ماهر', 'بارع']],
  ant: [['كبير', 'صغير'], ['قوي', 'ضعيف'], ['سريع', 'بطيء'], ['حارّ', 'بارد'], ['طويل', 'قصير'], ['غني', 'فقير'], ['سعيد', 'حزين'], ['نور', 'ظلام'], ['صدق', 'كذب'], ['حرب', 'سلام'], ['جديد', 'قديم'], ['قريب', 'بعيد'], ['ثقيل', 'خفيف'], ['واسع', 'ضيّق'], ['ممتلئ', 'فارغ'], ['نهار', 'ليل'], ['شجاع', 'جبان'], ['كريم', 'بخيل'], ['سهل', 'صعب'], ['أول', 'آخر'], ['دخل', 'خرج'], ['فتح', 'أغلق'], ['صعد', 'نزل'], ['ربح', 'خسر'], ['ضحك', 'بكى'], ['يقظ', 'نائم'], ['رخيص', 'غالٍ'], ['نظيف', 'متّسخ'], ['حلو', 'مرّ'], ['عميق', 'ضحل']],
  ana: [['قلم : كتابة', 'سكّين : قطع'], ['طبيب : مستشفى', 'معلّم : مدرسة'], ['عين : رؤية', 'أذن : سمع'], ['يد : قفّاز', 'قدم : حذاء'], ['ماء : عطش', 'طعام : جوع'], ['ليل : نهار', 'شتاء : صيف'], ['طائر : عشّ', 'نحلة : خلية'], ['سمكة : بحر', 'جمل : صحراء'], ['أسد : زئير', 'كلب : نباح'], ['بقرة : حليب', 'دجاجة : بيض'], ['سيارة : سائق', 'طائرة : طيّار'], ['جندي : جيش', 'لاعب : فريق'], ['ساعة : وقت', 'ميزان : وزن'], ['ورقة : شجرة', 'ريشة : طائر'], ['مدينة : دولة', 'غرفة : بيت'], ['مدرّس : طالب', 'طبيب : مريض'], ['كتاب : مكتبة', 'لوحة : متحف'], ['بيضة : فرخ', 'بذرة : نبتة'], ['صباح : فطور', 'مساء : عشاء'], ['تلفاز : مشاهدة', 'مذياع : استماع'], ['إصبع : يد', 'ورقة : شجرة'], ['شرطي : أمن', 'إطفائي : نار'], ['مطر : مظلّة', 'شمس : نظّارة'], ['خبّاز : خبز', 'نجّار : خشب']],
  odd: { 'حيوانات': MV.WORDS.animals, 'طعام': MV.WORDS.food, 'أثاث': MV.WORDS.home, 'طبيعة': MV.WORDS.nature, 'جسم': MV.WORDS.body, 'ملابس': MV.WORDS.clothes, 'مركبات': MV.WORDS.vehicles, 'أدوات': MV.WORDS.tools, 'ألوان': ['أحمر', 'أزرق', 'أخضر', 'أصفر', 'أبيض', 'أسود'], 'مهن': ['طبيب', 'مهندس', 'معلّم', 'نجّار', 'خيّاط', 'طيّار'], 'أفعال': ['كتب', 'ركض', 'أكل', 'نام', 'قرأ', 'شرب'], 'دول': ['العراق', 'مصر', 'الأردن', 'المغرب', 'عُمان', 'سوريا'], 'مدن': ['بغداد', 'القاهرة', 'عمّان', 'الرباط', 'دمشق', 'مسقط'], 'أقارب': ['أب', 'أم', 'أخ', 'أخت', 'جدّ', 'عمّ'], 'أوقات': ['صباح', 'ظهر', 'مساء', 'ليل', 'فجر', 'عصر'] },
  near: [['حيوانات', 'طبيعة'], ['طعام', 'أثاث'], ['جسم', 'ملابس'], ['مركبات', 'أدوات'], ['ألوان', 'ملابس'], ['دول', 'مدن'], ['مهن', 'أقارب'], ['أفعال', 'أوقات']],
  words: ['قلم', 'بحر', 'جمل', 'ورد', 'سمك', 'تين', 'ليل', 'نهر', 'ملح', 'ذهب', 'نجم', 'سيف', 'عنب', 'رمل', 'تمر', 'خبز', 'شمس', 'مطر', 'قمر', 'بيت', 'باب', 'طير', 'نحل', 'فيل', 'ثلج', 'كتاب', 'سماء', 'شجرة', 'طائر', 'جبل', 'وردة', 'نافذة', 'مدرسة', 'حديقة', 'طائرة', 'سيارة', 'مكتبة', 'عصفور', 'حاسوب', 'مستشفى', 'مطبخ', 'مدينة', 'صحراء', 'حيوان', 'مفتاح', 'مسجد', 'ساعة', 'هاتف', 'كرسي', 'طاولة', 'شباك', 'دفتر', 'ممحاة', 'مسطرة', 'حقيبة', 'مظلّة', 'جسر', 'نخلة', 'زيتون', 'سفينة'],
  cloze: [
    ['الشمس ____ من الشرق.', 'تشرق', ['تغرب', 'تنام', 'تسبح']], ['نستخدم ____ لنكتب على الورقة.', 'القلم', ['الحذاء', 'الوسادة', 'الملعقة']], ['يطير الطائر بـ ____.', 'جناحيه', ['ذيله', 'منقاره', 'عينيه']],
    ['عندما يشتدّ البرد نرتدي ____.', 'معطفاً ثقيلاً', ['ملابس السباحة', 'نظّارة شمسية', 'ثوباً خفيفاً']], ['ذهبت إلى الطبيب لأنني كنتُ ____.', 'مريضاً', ['غنياً', 'طويلاً', 'مسافراً']],
    ['يظهر القمر في ____.', 'الليل', ['الظهيرة', 'الصباح الباكر', 'الضحى']], ['نشرب الماء عندما نشعر بـ ____.', 'العطش', ['الجوع', 'النعاس', 'الفرح']], ['يُستخدم المقصّ في ____.', 'القصّ', ['الكتابة', 'الغسيل', 'الطبخ']],
    ['أنبتت البذرة وصارت ____.', 'نبتة', ['حجراً', 'سحابة', 'قطعة نقد']], ['أُضيء المصباح فصار المكان ____.', 'مضيئاً', ['مظلماً', 'بارداً', 'صامتاً']], ['يعيش السمك في ____.', 'الماء', ['الرمال الجافة', 'الأشجار', 'الجبال']],
    ['فتحت ____ لأدخل الغرفة.', 'الباب', ['المرآة', 'الكتاب', 'السقف']], ['أخذ المعلّم ____ وكتب على السبّورة.', 'الطبشورة', ['الوسادة', 'الجزمة', 'السلّة']],
    ['الوقت كالسيف إن لم تقطعه ____.', 'قطعك', ['ملّك', 'تركك', 'رافقك']], ['من جدّ ____.', 'وجد', ['رقد', 'سكت', 'ضحك']], ['العلم في الصغر كالنقش على ____.', 'الحجر', ['الماء', 'الهواء', 'الرمل المتحرك']],
    ['الصديق وقت ____.', 'الضيق', ['الفراغ', 'النوم', 'الأكل']], ['درهم وقاية خير من قنطار ____.', 'علاج', ['ذهب', 'أحلام', 'كلام']], ['الطيور على أشكالها ____.', 'تقع', ['تنام', 'تسبح', 'تضحك']],
    ['لا تؤجّل عمل اليوم إلى ____.', 'الغد', ['الأمس', 'الماضي', 'الصباح الذي مضى']], ['الجار قبل ____.', 'الدار', ['النهر', 'السوق', 'الطريق']], ['الصبر مفتاح ____.', 'الفرج', ['الغضب', 'الندم', 'الكسل']],
    ['خير الكلام ما قلّ و____.', 'دلّ', ['كثر', 'طال', 'ضاع']], ['في التأنّي السلامة وفي العجلة ____.', 'الندامة', ['الراحة', 'السعادة', 'الغنيمة']],
  ],
  spell: [['ضابط', ['ظابط', 'ضابِت']], ['ظلم', ['ضلم', 'ظلن']], ['إنشاء', ['أنشاء', 'إنشائ']], ['اجتماع', ['إجتماع', 'أجتماع']], ['الذي', ['اللذي', 'اللذى']], ['هذا', ['هاذا', 'هاذى']], ['لكن', ['لاكن', 'لاكنّ']], ['ذلك', ['ذالك', 'ذلاك']], ['أولئك', ['أولائك', 'أولءك']], ['ظهر', ['ضهر', 'ظحر']], ['انتظار', ['إنتظار', 'أنتظار']], ['استماع', ['إستماع', 'أستماع']], ['ضفدع', ['ظفدع', 'ضفدغ']], ['ظرف', ['ضرف', 'ظرق']], ['حاضر', ['حاظر', 'حاضز']], ['شيء', ['شئ', 'شيئ']], ['ضوء', ['ضؤ', 'ضوأ']], ['سماء', ['سمآء', 'سمأ']], ['ضحك', ['ظحك', 'ضهك']], ['ظلام', ['ضلام', 'ظلآم']], ['ضمير', ['ظمير', 'ضميير']], ['عظيم', ['عضيم', 'عذيم']]],

};

const synDict = (() => { const m = new Map(); const add = (a, b) => { if (!m.has(a)) m.set(a, new Set()); m.get(a).add(b); }; LANG.syn.forEach(([a, b]) => { add(a, b); add(b, a); }); LANG.ant.forEach(([a, b]) => { add(a, b); add(b, a); }); return m; })();

/* ============ المترادفات والأضداد ============ */
MV.define({
  id: 'synant', name: 'المترادفات والأضداد', en: 'Synonyms & Antonyms', realms: ['language'], skills: ['verbal'], type: 'quiz', minutes: 4,
  blurb: 'اختر الكلمة المرادفة أو المضادة لكلمة معيّنة. ثروة لغوية تُبنى بالتكرار الذكي.',
  rules: ['اقرأ الكلمة ونوع المطلوب: مرادف أم ضد؟', 'اختر الإجابة الأقرب معنى.', 'الخيارات الخاطئة لا علاقة لها بالكلمة.'],
  levelNote: l => ['كلمات شائعة', 'كلمات متنوعة', 'مرادفات وأضداد مختلطة', 'مفردات أقل شيوعاً', 'وقت أقصر'][l - 1],
  selfTest() { const dup = []; LANG.syn.concat(LANG.ant).forEach(([a, b]) => { if (a === b) dup.push(a); }); const r = RNG(1), o = []; for (let d = 0; d <= 10; d++) { const q = synMake(d, r); o.push(q.opts.filter(x => x.ok).length === 1 && !q.opts.filter(x => !x.ok).some(x => (synDict.get(q.w) || new Set()).has(x.t))); } return { ok: o.every(Boolean) && !dup.length, out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 10, quickRounds: 5, par: 5, timeLimit: (it, d) => MV.testMode ? 30 : 12 - d * 0.5,
      make: (d, i, r) => synMake(d, r),
      render(box, it, api) { box.append(kit.title(it.kind === 'syn' ? 'ما مرادف هذه الكلمة؟' : 'ما ضدّ هذه الكلمة؟'), h('div', { class: 'wordbig' }, it.w)); kit.mc(box, { cols: 2, cls: 'wide', options: it.opts.map(o => ({ label: o.t, correct: o.ok })), onAnswer: ok => api.done(ok) }); },
      explain: it => `${it.w} ← ${it.opts.find(o => o.ok).t}`,
    });
  },
});
function synMake(d, r) {
  const kind = d < 2 ? 'syn' : r.pick(['syn', 'ant']), L = kind === 'syn' ? LANG.syn : LANG.ant, [a, b] = r.pick(L), flip = r.chance(0.5), w = flip ? b : a, ans = flip ? a : b;
  const bad = new Set(synDict.get(w) || []); bad.add(w);
  const pool = L.flat().concat(LANG.ant.flat()).filter(x => !bad.has(x) && x !== ans), opts = [{ t: ans, ok: true }].concat(r.sample([...new Set(pool)], 3).map(t => ({ t, ok: false })));
  return { kind, w, opts: r.shuffle(opts) };
}

/* ============ التناظر اللفظي ============ */
MV.define({
  id: 'analogy', name: 'التناظر اللفظي', en: 'Verbal Analogies', realms: ['language', 'logic'], skills: ['verbal', 'patterns'], type: 'quiz', minutes: 5,
  blurb: 'أ : ب مثل ج : ؟ — اكتشف العلاقة بين الكلمتين الأوليين وطبّقها على الثالثة.',
  rules: ['حدّد نوع العلاقة (مكان، وظيفة، ضد، جزء من كل…).', 'طبّق العلاقة نفسها على الكلمة الثالثة.', 'اختر الكلمة الناقصة.'],
  levelNote: l => ['علاقات واضحة', 'علاقات متنوعة', 'خيارات متقاربة', 'علاقات أصعب', 'أسرع'][l - 1],
  selfTest() { const r = RNG(8), o = []; for (let d = 0; d <= 10; d++) { const q = anaMake(d, r); o.push(q.opts.filter(x => x.ok).length === 1 && new Set(q.opts.map(x => x.t)).size === 4); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 10, timeLimit: ctx.level >= 5 ? () => (MV.testMode ? 30 : 14) : null,
      make: (d, i, r) => anaMake(d, r),
      render(box, it, api) { box.append(kit.title('أكمل التناظر'), h('div', { class: 'wordbig', style: 'font-size:1.9rem' }, it.a, h('div', { style: 'font-size:1rem;color:var(--muted)' }, 'مثل'), it.c + ' : ؟')); kit.mc(box, { cols: 2, cls: 'wide', options: it.opts.map(o => ({ label: o.t, correct: o.ok })), onAnswer: ok => api.done(ok) }); },
      explain: it => `العلاقة: ${it.a}  ←  ${it.c} : ${it.opts.find(o => o.ok).t}`,
    });
  },
});
function anaMake(d, r) {
  const [p1, p2] = r.pick(LANG.ana), [a] = [p1], [c, ans] = p2.split(' : '), pool = LANG.ana.map(x => x[1].split(' : ')[1]).filter(x => x !== ans && x !== c);
  const opts = [{ t: ans, ok: true }].concat(r.sample([...new Set(pool)], 3).map(t => ({ t, ok: false })));
  return { a, c, opts: r.shuffle(opts) };
}

/* ============ ترتيب الحروف ============ */
MV.define({
  id: 'anagram', name: 'ترتيب الحروف', en: 'Anagrams', realms: ['language'], skills: ['verbal', 'solving'], type: 'quiz', minutes: 5,
  blurb: 'حروف مبعثرة تكوّن كلمة عربية: رتّبها بالنقر على الحروف بالترتيب الصحيح.',
  rules: ['انقر الحروف بالترتيب لتكوين الكلمة (من اليمين إلى اليسار).', 'انقر الخانة لإرجاع حرف، أو استخدم «مسح».', 'التلميح يكشف الحرف الأول.'],
  levelNote: l => ['كلمات من 3 حروف', '3–4 حروف', '4–5 حروف', '5 حروف', '5–6 حروف'][l - 1],
  selfTest() { const m = new Map(); const bad = []; LANG.words.forEach(w => { const k = w.split('').sort().join(''); if (m.has(k)) bad.push([m.get(k), w]); else m.set(k, w); }); return { ok: bad.length === 0, out: bad }; },
  run(ctx) {
    const used = new Set();
    kit.itemGame(ctx, {
      rounds: 6, quickRounds: 3, par: 15, timeLimit: (it, d) => MV.testMode ? 60 : 30 + it.w.length * 4,
      make(d, i, r) {
        const lo = d < 2 ? 3 : d < 4 ? 3 : d < 6 ? 4 : d < 8 ? 5 : 5, hi = d < 2 ? 3 : d < 4 ? 4 : d < 6 ? 5 : d < 8 ? 5 : 6;
        let pool = LANG.words.filter(w => w.length >= lo && w.length <= hi && !used.has(w)); if (!pool.length) pool = LANG.words.filter(w => !used.has(w)); if (!pool.length) { used.clear(); pool = LANG.words; }
        const w = r.pick(pool); used.add(w); let sc; let g = 0; do { sc = r.shuffle(w.split('')); } while (sc.join('') === w && g++ < 20);
        return { w, sc };
      },
      render(box, it, api) {
        box.append(kit.title('رتّب الحروف لتكوين كلمة', `${it.w.length} حروف`));
        let cur = []; const slots = h('div', { class: 'slots' }), tiles = h('div', { class: 'tiles' }), tb = [];
        const drawSlots = () => { slots.textContent = ''; it.w.split('').forEach((_, k) => slots.append(h('div', { class: 'slot' + (cur[k] != null ? ' f' : ''), onClick: () => { if (cur[k] != null && k === cur.length - 1) { tb[cur[k]].disabled = false; cur.pop(); drawSlots(); } } }, cur[k] != null ? it.sc[cur[k]] : ''))); };
        it.sc.forEach((ch, k) => { const b = h('button', { class: 'tile', 'data-letter': ch, onClick: () => { if (cur.length >= it.w.length) return; cur.push(k); b.disabled = true; drawSlots(); if (cur.length === it.w.length) check(); } }, ch); tb.push(b); tiles.append(b); });
        const check = () => { const w = cur.map(k => it.sc[k]).join(''), ok = kit.normAr(w) === kit.normAr(it.w) || (LANG.words.includes(w) && w.split('').sort().join('') === it.w.split('').sort().join('')); tb.forEach(b => b.disabled = true); slots.style.color = ok ? 'var(--ok)' : 'var(--bad)'; api.done(ok); };
        box.append(slots, tiles);
        const clr = h('button', { class: 'btn ghost sm', onClick: () => { cur = []; tb.forEach(b => b.disabled = false); drawSlots(); } }, 'مسح');
        const tools = h('div', { class: 'chtools' }, clr); box.append(tools); kit.hintBtn(ctx, tools, () => { const first = it.w[0]; const k = it.sc.findIndex((c, j) => c === first && !cur.includes(j)); if (k >= 0 && cur.length === 0) tb[k].click(); });
        drawSlots();
        ctx.debug.solve = () => { clr.click(); it.w.split('').forEach(ch => { const k = it.sc.findIndex((c, j) => c === ch && !cur.includes(j)); if (k >= 0) tb[k].click(); }); };
      },
      explain: it => `الكلمة: ${it.w}`,
    });
  },
});

/* ============ إكمال الجمل والأمثال ============ */
MV.define({
  id: 'cloze', name: 'إكمال الجمل والأمثال', en: 'Sentence Completion', realms: ['language'], skills: ['verbal'], type: 'quiz', minutes: 4,
  blurb: 'جمل ناقصة وأمثال عربية معروفة: اختر الكلمة التي تكمل المعنى وتحافظ على سلامة العبارة.',
  rules: ['اقرأ الجملة كاملة قبل الاختيار.', 'اختر الكلمة الأنسب معنىً وتركيباً.', 'في الأمثال تذكّر النص المعروف للمثل.'],
  levelNote: l => ['جمل بسيطة', 'جمل وأمثال شائعة', 'أمثال متنوعة', 'خيارات متقاربة', 'وقت أقصر'][l - 1],
  selfTest() { return { ok: LANG.cloze.every(c => c[0].includes('____') && c[2].length === 3 && !c[2].includes(c[1])), out: [LANG.cloze.length] }; },
  run(ctx) {
    const used = new Set();
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 6, timeLimit: ctx.level >= 5 ? () => (MV.testMode ? 30 : 9) : null,
      make(d, i, r) { let pool = LANG.cloze.map((c, k) => k).filter(k => !used.has(k) && (d < 2 ? k < 13 : true)); if (!pool.length) { used.clear(); pool = LANG.cloze.map((c, k) => k); } const k = r.pick(pool); used.add(k); const [t, a, bad] = LANG.cloze[k]; return { t, a, opts: r.shuffle([{ t: a, ok: true }].concat(bad.map(x => ({ t: x, ok: false })))) }; },
      render(box, it, api) { box.append(kit.title('أكمل العبارة'), h('div', { class: 'sentence' }, ...it.t.split('____').flatMap((p, k, arr) => k < arr.length - 1 ? [p, h('b', null, '____')] : [p]))); kit.mc(box, { cols: 2, cls: 'wide', options: it.opts.map(o => ({ label: o.t, correct: o.ok })), onAnswer: ok => api.done(ok) }); },
      explain: it => `الصحيح: ${it.t.replace('____', it.a)}`,
    });
  },
});

/* ============ الكلمة الشاذة ============ */
MV.define({
  id: 'oddword', name: 'الكلمة الشاذة', en: 'Odd One Out', realms: ['language', 'logic'], skills: ['verbal', 'patterns'], type: 'quiz', minutes: 4,
  blurb: 'أربع كلمات تنتمي إلى مجموعة واحدة وكلمة تشذّ عنها. اكتشف العلاقة المشتركة.',
  rules: ['ابحث عمّا يجمع أربع كلمات من الخمس.', 'اختر الكلمة التي لا تنتمي.', 'في المستويات العليا تكون المجموعات متقاربة المعنى.'],
  levelNote: l => ['مجموعات متباعدة', 'مجموعات متنوعة', 'بعض التقارب', 'مجموعات متقاربة', 'متقاربة جداً مع وقت قصير'][l - 1],
  selfTest() { const r = RNG(2), o = []; for (let d = 0; d <= 10; d++) { const q = oddMake(d, r); o.push(q.items.length === 5 && new Set(q.items).size === 5); } return { ok: o.every(Boolean), out: o }; },
  run(ctx) {
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 5, timeLimit: ctx.level >= 4 ? () => (MV.testMode ? 30 : 9) : null,
      make: (d, i, r) => oddMake(d, r),
      render(box, it, api) { box.append(kit.title('أي كلمة لا تنتمي إلى البقية؟')); kit.mc(box, { cols: 3, options: it.items.map(w => ({ label: w, correct: w === it.odd })), onAnswer: ok => api.done(ok) }); },
      explain: it => `أربع كلمات من «${it.cat}» و«${it.odd}» من «${it.cat2}».`,
    });
  },
});
function oddMake(d, r) {
  const cats = Object.keys(LANG.odd); let c1, c2;
  if (d >= 4 && r.chance(0.7)) { const pr = r.pick(LANG.near); [c1, c2] = r.chance(0.5) ? pr : pr.slice().reverse(); } else { c1 = r.pick(cats); c2 = r.pick(cats.filter(c => c !== c1 && !LANG.near.some(p => p.includes(c1) && p.includes(c))) ); }
  const four = r.sample(LANG.odd[c1], 4), odd = r.pick(LANG.odd[c2].filter(x => !four.includes(x)));
  return { items: r.shuffle(four.concat([odd])), odd, cat: c1, cat2: c2 };
}

/* ============ الإملاء ============ */
MV.define({
  id: 'spelling', name: 'الإملاء الصحيح', en: 'Spelling', realms: ['language'], skills: ['verbal', 'attention'], type: 'quiz', minutes: 4,
  blurb: 'أي كتابة صحيحة للكلمة؟ الضاد والظاء، والهمزات، والكلمات التي تُكتب بغير ما تُنطق.',
  rules: ['ستُعرض ثلاث صور لكتابة الكلمة نفسها.', 'اختر الصورة الصحيحة إملائياً.', 'ركّز على الحروف المتشابهة والهمزات.'],
  levelNote: l => ['كلمات شائعة', 'ضاد وظاء', 'همزات وألفات', 'كلمات متنوعة', 'وقت أقصر'][l - 1],
  selfTest() { return { ok: LANG.spell.every(([c, bs]) => bs.length === 2 && !bs.includes(c)), out: [LANG.spell.length] }; },
  run(ctx) {
    const used = new Set();
    kit.itemGame(ctx, {
      rounds: 8, quickRounds: 4, par: 5, timeLimit: ctx.level >= 5 ? () => (MV.testMode ? 30 : 8) : null,
      make(d, i, r) { let pool = LANG.spell.map((c, k) => k).filter(k => !used.has(k)); if (!pool.length) { used.clear(); pool = LANG.spell.map((c, k) => k); } const k = r.pick(pool); used.add(k); const [c, bs] = LANG.spell[k]; return { c, opts: r.shuffle([{ t: c, ok: true }].concat(bs.map(t => ({ t, ok: false })))) }; },
      render(box, it, api) { box.append(kit.title('أي كتابة هي الصحيحة؟')); kit.mc(box, { cols: 3, cls: 'wide', options: it.opts.map(o => ({ label: o.t, correct: o.ok })), onAnswer: ok => api.done(ok) }); },
      explain: it => `الكتابة الصحيحة: ${it.c}`,
    });
  },
});
