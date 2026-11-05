'use strict';
/* ============ فِكْر زُون (FikrZone) — أدوات أساسية ============ */
const MV = window.MV = { version: '1.1', games: [], byId: {}, testMode: !!window.__MV_TEST, kit: {}, pages: {} };

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const SVGNS = 'http://www.w3.org/2000/svg';

function applyAttrs(el, a, isSvg) {
  if (!a) return;
  for (const k in a) {
    const v = a[k];
    if (v == null || v === false) continue;
    if (k === 'class') { if (isSvg) el.setAttribute('class', v); else el.className = v; }
    else if (k === 'style') { if (typeof v === 'string') el.style.cssText = v; else Object.assign(el.style, v); }
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k.length > 2 && k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
}
function addKids(el, kids) {
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
}
function h(tag, attrs, ...kids) { const el = document.createElement(tag); applyAttrs(el, attrs, false); addKids(el, kids); return el; }
function s(tag, attrs, ...kids) { const el = document.createElementNS(SVGNS, tag); applyAttrs(el, attrs, true); addKids(el, kids); return el; }
function svgRoot(w, hh, attrs, ...kids) { return s('svg', Object.assign({ viewBox: `0 0 ${w} ${hh}`, xmlns: SVGNS }, attrs), ...kids); }
function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
function mount(el, ...kids) { clear(el); addKids(el, kids); return el; }

/* ---------- أعداد عشوائية قابلة للبذر ---------- */
function hashStr(str) { let x = 2166136261; for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function RNG(seed) {
  const f = seed == null ? Math.random : mulberry32(typeof seed === 'string' ? hashStr(seed) : seed);
  const r = {
    f, next: f,
    int: (a, b) => a + Math.floor(f() * (b - a + 1)),
    pick: arr => arr[Math.floor(f() * arr.length)],
    shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    chance: p => f() < p,
    sample(arr, n) { return r.shuffle(arr).slice(0, n); },
    weighted(items, wf) { const ws = items.map(wf); let t = ws.reduce((a, b) => a + b, 0); let x = f() * t; for (let i = 0; i < items.length; i++) { x -= ws[i]; if (x <= 0) return items[i]; } return items[items.length - 1]; },
  };
  return r;
}
const rnd = RNG();

/* ---------- رياضيات مساعدة ---------- */
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sum = a => a.reduce((x, y) => x + y, 0);
const avg = a => a.length ? sum(a) / a.length : 0;
const std = a => { if (a.length < 2) return 0; const m = avg(a); return Math.sqrt(avg(a.map(x => (x - m) ** 2))); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const range = (n, f) => Array.from({ length: n }, (_, i) => f ? f(i) : i);
const fmtTime = sec => { sec = Math.max(0, Math.round(sec)); return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); };
const pad2 = n => String(n).padStart(2, '0');
function dayKey(d = new Date()) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function dayDiff(a, b) { return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5); }
function weekKey(d = new Date()) { const t = new Date(d); t.setHours(12, 0, 0, 0); const dow = (t.getDay() + 1) % 7; /* السبت = 0 */ t.setDate(t.getDate() - dow); return dayKey(t); }
const arDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const arMonths = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
function fmtDate(ts) { const d = new Date(ts); return `${d.getDate()} ${arMonths[d.getMonth()]}`; }
function fmtDateFull(ts) { const d = new Date(ts); return `${arDays[d.getDay()]} ${d.getDate()} ${arMonths[d.getMonth()]}`; }
function ago(ts) {
  const m = (Date.now() - ts) / 6e4;
  if (m < 1) return 'الآن'; if (m < 60) return `قبل ${Math.round(m)} د`;
  const hr = m / 60; if (hr < 24) return `قبل ${Math.round(hr)} ساعة`;
  const d = Math.round(hr / 24); return d === 1 ? 'أمس' : `قبل ${d} أيام`;
}
const toAr = n => String(n);
const pct = x => Math.round(x * 100) + '%';

/* ---------- CSS للألعاب ---------- */
MV.css = str => { const st = document.getElementById('mv-games-css'); st.textContent += '\n' + str; };

/* ---------- الصوت (WebAudio مولّد، اختياري) ---------- */
const Sound = {
  ctx: null, on: false, vol: 0.5,
  tone(freq, dur, type = 'sine', gain = 0.12, when = 0) {
    if (!this.on) return;
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + when;
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain * this.vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* الصوت غير متاح */ }
  },
  play(n) {
    if (!this.on) return;
    if (n === 'ok') { this.tone(660, 0.12, 'triangle'); this.tone(880, 0.18, 'triangle', 0.12, 0.08); }
    else if (n === 'bad') { this.tone(180, 0.22, 'sawtooth', 0.08); }
    else if (n === 'click') { this.tone(520, 0.04, 'square', 0.04); }
    else if (n === 'tick') { this.tone(900, 0.03, 'sine', 0.05); }
    else if (n === 'win') { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.12, i * 0.1)); }
    else if (n === 'lose') { [330, 262].forEach((f, i) => this.tone(f, 0.25, 'sine', 0.1, i * 0.14)); }
  },
};

/* ---------- التخزين ---------- */
const Store = (() => {
  const KEY = 'fikrzone.v1', OLD_KEY = 'mindverse.v1';
  let mem = null, timer = null, ok = true;
  const defaults = () => ({
    v: 1, created: Date.now(),
    profile: { name: '', interests: [], onboarded: false, assessed: false },
    xp: 0, streak: { cur: 0, best: 0, last: null, days: [] },
    games: {}, sessions: [], ach: {}, titles: { active: 'explorer' }, chess: { elo: null, games: 0, peak: 0, hist: [], course: {} },
    tutorials: {}, daily: {}, chal: { claimed: {}, pbTargets: {}, started: {} }, inprog: {}, fav: {},
    settings: { sound: false, vol: 0.5, theme: 'dark', motion: true, timer: true, minutes: 30, hints: true, confirmQuit: true, perfNote: true },
    stats: { totalTime: 0, sessions: 0 },
  });
  function merge(base, obj) {
    for (const k in obj) {
      if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) merge(base[k], obj[k]);
      else base[k] = obj[k];
    }
    return base;
  }
  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); if (!raw) { raw = localStorage.getItem(OLD_KEY); } } catch (e) { ok = false; }
    mem = defaults();
    if (raw) { try { merge(mem, JSON.parse(raw)); } catch (e) { /* بيانات تالفة */ } }
    return mem;
  }
  function flush() {
    if (!ok) return;
    try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { ok = false; }
  }
  function save(now) { clearTimeout(timer); if (now) flush(); else timer = setTimeout(flush, 250); }
  return {
    get d() { return mem || load(); },
    load, save, flush,
    reset() { mem = defaults(); try { localStorage.removeItem(KEY); } catch (e) { } return mem; },
    export() { return JSON.stringify(mem, null, 1); },
    import(json) { const o = JSON.parse(json); if (!o || typeof o !== 'object' || !o.profile) throw new Error('ملف غير صالح'); mem = merge(defaults(), o); flush(); return mem; },
    persistent() { return ok; },
  };
})();
const D = () => Store.d;

/* ---------- نوافذ وتنبيهات ---------- */
function layer() { return document.getElementById('layer'); }
function toast(msg, kind = '') {
  const t = h('div', { class: 'toast ' + kind }, msg);
  layer().append(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 2600);
}
function modal({ title, body, actions = [], wide = false, onClose }) {
  const close = () => { back.remove(); onClose && onClose(); };
  const box = h('div', { class: 'modal' + (wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true' },
    title ? h('h3', null, title) : null,
    h('div', { class: 'modal-body' }, body),
    actions.length ? h('div', { class: 'modal-actions' }, actions.map(a => h('button', { class: 'btn ' + (a.primary ? 'primary' : a.danger ? 'danger' : 'ghost'), onClick: () => { if (a.onClick) a.onClick(); if (a.close !== false) close(); } }, a.label))) : null);
  const back = h('div', { class: 'modal-back', onClick: e => { if (e.target === back) close(); } }, box);
  layer().append(back);
  const f = $('button', box); if (f) f.focus();
  return close;
}
function confirmBox(title, text, yes = 'نعم', no = 'إلغاء', danger = false) {
  return new Promise(res => modal({ title, body: h('p', null, text), actions: [{ label: no, onClick: () => res(false) }, { label: yes, primary: !danger, danger, onClick: () => res(true) }], onClose: () => res(false) }));
}
