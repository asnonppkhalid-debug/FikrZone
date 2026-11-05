'use strict';
/* ============ أدوات مشتركة للألعاب ============ */
const kit = MV.kit;
kit.PAL = ['#e9c14f', '#d9594c', '#3db5a5', '#8cc152', '#4c9be0', '#e2699a', '#9b7fe0', '#f0883e'];
kit.COLOR_NAMES = ['أصفر', 'أحمر', 'فيروزي', 'أخضر', 'أزرق', 'وردي', 'بنفسجي', 'برتقالي'];
kit.SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon', 'cross', 'pentagon'];
kit.SHAPE_NAMES = { circle: 'دائرة', square: 'مربع', triangle: 'مثلث', diamond: 'معيّن', star: 'نجمة', hexagon: 'سداسي', cross: 'علامة زائد', pentagon: 'خماسي' };

function polyPts(n, r, rot = -90) { return range(n, i => { const a = (rot + i * 360 / n) * Math.PI / 180; return [r * Math.cos(a), r * Math.sin(a)]; }); }
function ptsToD(p) { return 'M' + p.map(q => q[0].toFixed(2) + ' ' + q[1].toFixed(2)).join('L') + 'Z'; }
function shapeD(type, r) {
  switch (type) {
    case 'square': return ptsToD([[-r * .85, -r * .85], [r * .85, -r * .85], [r * .85, r * .85], [-r * .85, r * .85]]);
    case 'triangle': return ptsToD([[0, -r], [r * .96, r * .72], [-r * .96, r * .72]]);
    case 'diamond': return ptsToD([[0, -r], [r * .8, 0], [0, r], [-r * .8, 0]]);
    case 'star': return ptsToD(range(10, i => { const a = (-90 + i * 36) * Math.PI / 180, rr = i % 2 ? r * .45 : r; return [rr * Math.cos(a), rr * Math.sin(a)]; }));
    case 'hexagon': return ptsToD(polyPts(6, r, 0));
    case 'pentagon': return ptsToD(polyPts(5, r));
    case 'cross': { const a = r * .3, b = r; return ptsToD([[-a, -b], [a, -b], [a, -a], [b, -a], [b, a], [a, a], [a, b], [-a, b], [-a, a], [-b, a], [-b, -a], [-a, -a]]); }
    default: return null;
  }
}
kit.shape = (type, o = {}) => {
  const { x = 0, y = 0, r = 16, fill = 'currentColor', stroke = 'none', sw = 2, rot = 0, opacity = 1, cls = '' } = o;
  if (type === 'circle') return s('circle', { cx: x, cy: y, r: r * .92, fill, stroke, 'stroke-width': sw, opacity, class: cls });
  return s('path', { d: shapeD(type, r), fill, stroke, 'stroke-width': sw, opacity, transform: `translate(${x} ${y}) rotate(${rot})`, 'stroke-linejoin': 'round', class: cls });
};
kit.shapeSvg = (type, fill, size = 44, rot = 0, extra = {}) => svgRoot(40, 40, { width: size, height: size, class: 'shp' }, kit.shape(type, Object.assign({ x: 20, y: 20, r: 17, fill, rot }, extra)));

/* ---------- اختيار من متعدد ---------- */
kit.mc = (parent, o) => {
  const wrap = h('div', { class: 'mc' + (o.cols ? ' cols-' + o.cols : '') + (o.cls ? ' ' + o.cls : '') });
  let locked = false; const btns = [];
  o.options.forEach((op, i) => {
    const b = h('button', { class: 'mc-opt' + (op.cls ? ' ' + op.cls : ''), 'data-ok': (MV.testMode && op.correct) ? '1' : null, onClick: () => pick(i) }, op.node || op.label);
    btns.push(b); wrap.append(b);
  });
  function pick(i) {
    if (locked) return; locked = true;
    const ok = !!o.options[i].correct;
    btns[i].classList.add(ok ? 'ok' : 'bad');
    if (!ok) { const ci = o.options.findIndex(x => x.correct); if (ci >= 0) btns[ci].classList.add('ok', 'reveal'); }
    btns.forEach(b => b.disabled = true);
    Sound.play(ok ? 'ok' : 'bad');
    if (o.onAnswer) o.onAnswer(ok, i);
  }
  parent.append(wrap);
  return { el: wrap, pick, lock() { locked = true; btns.forEach(b => b.disabled = true); }, btns };
};

/* ---------- مؤقّت عكسي ---------- */
kit.countdown = (ctx, el, sec, onEnd) => {
  let left = sec, stopped = false;
  const show = () => { if (el) el.textContent = fmtTime(Math.ceil(left)); };
  show();
  const iv = ctx.interval(() => { if (stopped) return; left -= 0.1; show(); if (left <= 0) { stopped = true; clearInterval(iv); onEnd && onEnd(); } }, 100);
  return { stop() { stopped = true; clearInterval(iv); }, left: () => left, add(n) { left += n; } };
};

/* ---------- لوحة أرقام ---------- */
kit.numpad = (ctx, parent, o = {}) => {
  let val = '';
  const disp = h('div', { class: 'np-disp' }, ' ');
  const upd = () => { disp.textContent = val || ' '; o.onChange && o.onChange(val); };
  const key = k => {
    if (k === 'del') val = val.slice(0, -1);
    else if (k === 'ok') { if (val !== '') o.onSubmit && o.onSubmit(val); return; }
    else if (k === '-') { val = val.startsWith('-') ? val.slice(1) : (o.neg ? '-' + val : val); }
    else if (val.length < (o.max || 8)) val += k;
    upd(); Sound.play('click');
  };
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', o.neg ? '-' : '', '0', 'del'];
  const pad = h('div', { class: 'np-grid' }, keys.map(k => k === '' ? h('span') : h('button', { class: 'np-key' + (k === 'del' ? ' alt' : ''), onClick: () => key(k) }, k === 'del' ? '⌫' : k)));
  const ok = h('button', { class: 'btn primary np-ok', onClick: () => key('ok') }, o.okLabel || 'تأكيد');
  const el = h('div', { class: 'numpad' }, disp, pad, ok);
  parent.append(el);
  const kd = e => {
    if (!el.isConnected) return;
    if (/^[0-9]$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('del'); else if (e.key === 'Enter') key('ok'); else if (e.key === '-' && o.neg) key('-');
  };
  ctx.listen(document, 'keydown', kd);
  return { get: () => val, clear() { val = ''; upd(); }, el, set(v) { val = String(v); upd(); } };
};

kit.hintBtn = (ctx, parent, fn, label = 'تلميح') => {
  if (!ctx.hintsAllowed) return null;
  const b = h('button', { class: 'btn ghost sm', onClick: () => { ctx.hint(); fn(b); } }, label);
  parent.append(b); return b;
};

/* ---------- محرّك الأسئلة المتتابعة ---------- */
kit.itemGame = (ctx, o) => {
  const total = ctx.quick ? Math.min(o.rounds, o.quickRounds || 4) : o.rounds;
  const base = (ctx.level - 1) * 2, lo = base, hi = Math.min(10, base + 2);
  let diff = clamp(base + (ctx.kind === 'intro' ? 0 : 1), lo, hi);
  const root = ctx.root;
  const count = h('span', { class: 'ig-count' }), dots = h('span', { class: 'ig-dots' });
  const tbar = h('div', { class: 'tbar' }, h('i'));
  const box = h('div', { class: 'ig-box' }), foot = h('div', { class: 'ig-foot' });
  const dotEls = range(total, () => h('i')); dotEls.forEach(d => dots.append(d));
  mount(root, h('div', { class: 'ig' }, h('div', { class: 'ig-head' }, count, dots), tbar, box, foot));
  let i = 0, sumScore = 0, okRun = 0, badRun = 0, parSum = 0, diffSum = 0, cd = null, curApi = null;
  const stopT = () => { clearInterval(cd); tbar.classList.remove('on'); tbar.firstChild.style.width = '100%'; };
  function nextItem() {
    if (i >= total) return end();
    const idx = i;
    count.textContent = `${idx + 1} / ${total}`;
    clear(box); clear(foot); stopT();
    const item = o.make(diff, idx, ctx.rng);
    let answered = false;
    const api = {
      diff, i: idx, item, box, ctx,
      done(score, extra = {}) {
        if (answered) return; answered = true; stopT();
        const sc = score === true ? 1 : score === false ? 0 : +score, ok = sc >= 0.5;
        if (ok) ctx.correct(); else ctx.mistake();
        sumScore += sc; parSum += (item.par || o.par || 12) + 1.2; diffSum += diff; dotEls[idx].className = ok ? 'ok' : 'bad';
        if (ok) { okRun++; badRun = 0; if (okRun >= 2) { diff = Math.min(hi, diff + 1); okRun = 0; } } else { badRun++; okRun = 0; if (badRun >= 2) { diff = Math.max(lo, diff - 1); badRun = 0; } }
        i++;
        const ex = o.explain ? o.explain(item, ok, extra) : null;
        foot.append(h('div', { class: 'fb ' + (ok ? 'ok' : 'bad') }, extra.timeout ? 'انتهى الوقت' : ok ? (sc < 1 ? 'إجابة جيدة' : 'صحيح') : 'غير صحيح'));
        if (ex && (!ok || o.explainAlways)) {
          foot.append(h('div', { class: 'expl' }, ex), h('button', { class: 'btn primary', id: 'btn-ig-next', onClick: nextItem }, i >= total ? 'إنهاء' : 'التالي'));
        } else ctx.timeout(nextItem, extra.fast ? 250 : ok ? 650 : 1100);
      },
    };
    curApi = api;
    o.render(box, item, api, idx);
    const tl = o.timeLimit && o.timeLimit(item, diff);
    if (tl) {
      const t0 = performance.now(); tbar.classList.add('on');
      cd = ctx.interval(() => { const f = 1 - (performance.now() - t0) / (tl * 1000); tbar.firstChild.style.width = Math.max(0, f * 100) + '%'; if (f <= 0) api.done(false, { timeout: true }); }, 80);
    }
  }
  function end() {
    ctx.finish({ acc: sumScore / total, items: total, parTime: parSum, complexity: diffSum / total });
  }
  ctx.debug.forceCorrect = () => curApi && curApi.done(true);
  ctx.debug.forceWrong = () => curApi && curApi.done(false);
  nextItem();
  return { next: nextItem };
};

/* ---------- حاويات مساعدة ---------- */
kit.title = (text, sub) => h('div', { class: 'q-title' }, h('div', { class: 'q' }, text), sub ? h('div', { class: 'q-sub' }, sub) : null);
kit.wordBox = txt => h('span', { class: 'word' }, txt);
kit.normAr = str => String(str).trim().replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ');
kit.mmss = fmtTime;
kit.range = range;
/* أرقام عشوائية بلا تكرار متتابع */
kit.nodup = (arr, last) => { let x; let n = 0; do { x = rnd.pick(arr); n++; } while (x === last && n < 10); return x; };
