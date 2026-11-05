'use strict';
/* ============ محرّك الشطرنج (قواعد كاملة + بحث) — بلا واجهة ============ */
const CH = (() => {
  const FILES = 'abcdefgh';
  const name = i => FILES[i & 7] + ((i >> 3) + 1);
  const unname = s => (s.charCodeAt(1) - 49) * 8 + (s.charCodeAt(0) - 97);
  const isW = p => p === p.toUpperCase();
  const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  function fromFEN(fen) {
    const [pl, tu, ca, ep, hm, fm] = fen.split(' '); const b = Array(64).fill('');
    pl.split('/').forEach((row, i) => { let f = 0; for (const ch of row) { if (/\d/.test(ch)) f += +ch; else { b[(7 - i) * 8 + f] = ch; f++; } } });
    return { b, turn: tu || 'w', c: { K: (ca || '').includes('K'), Q: (ca || '').includes('Q'), k: (ca || '').includes('k'), q: (ca || '').includes('q') }, ep: ep && ep !== '-' ? unname(ep) : -1, hm: +hm || 0, fm: +fm || 1 };
  }
  function toFEN(s) {
    let o = '';
    for (let r = 7; r >= 0; r--) { let e = 0; for (let f = 0; f < 8; f++) { const p = s.b[r * 8 + f]; if (!p) e++; else { if (e) { o += e; e = 0; } o += p; } } if (e) o += e; if (r) o += '/'; }
    const ca = (s.c.K ? 'K' : '') + (s.c.Q ? 'Q' : '') + (s.c.k ? 'k' : '') + (s.c.q ? 'q' : '');
    return `${o} ${s.turn} ${ca || '-'} ${s.ep >= 0 ? name(s.ep) : '-'} ${s.hm} ${s.fm}`;
  }
  const posKey = s => toFEN(s).split(' ').slice(0, 4).join(' ');
  const KN = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
  const KG = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const BD = [[1, 1], [1, -1], [-1, 1], [-1, -1]], RD = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const inb = (f, r) => f >= 0 && f < 8 && r >= 0 && r < 8;

  function attacked(s, i, byW) {
    const b = s.b, f = i & 7, r = i >> 3;
    const pr = byW ? r - 1 : r + 1, pc = byW ? 'P' : 'p';
    if (pr >= 0 && pr < 8) { if (f > 0 && b[pr * 8 + f - 1] === pc) return true; if (f < 7 && b[pr * 8 + f + 1] === pc) return true; }
    const N = byW ? 'N' : 'n', K = byW ? 'K' : 'k', B = byW ? 'B' : 'b', R = byW ? 'R' : 'r', Q = byW ? 'Q' : 'q';
    for (const [df, dr] of KN) if (inb(f + df, r + dr) && b[(r + dr) * 8 + f + df] === N) return true;
    for (const [df, dr] of KG) if (inb(f + df, r + dr) && b[(r + dr) * 8 + f + df] === K) return true;
    for (const [df, dr] of BD) { let ff = f + df, rr = r + dr; while (inb(ff, rr)) { const p = b[rr * 8 + ff]; if (p) { if (p === B || p === Q) return true; break; } ff += df; rr += dr; } }
    for (const [df, dr] of RD) { let ff = f + df, rr = r + dr; while (inb(ff, rr)) { const p = b[rr * 8 + ff]; if (p) { if (p === R || p === Q) return true; break; } ff += df; rr += dr; } }
    return false;
  }
  const kingSq = (s, w) => s.b.indexOf(w ? 'K' : 'k');
  const inCheck = (s, w = s.turn === 'w') => { const k = kingSq(s, w); return k >= 0 && attacked(s, k, !w); };

  function pseudo(s) {
    const out = [], b = s.b, w = s.turn === 'w';
    for (let i = 0; i < 64; i++) {
      const p = b[i]; if (!p || isW(p) !== w) continue;
      const t = p.toUpperCase(), f = i & 7, r = i >> 3;
      if (t === 'P') {
        const dir = w ? 1 : -1, start = w ? 1 : 6, last = w ? 7 : 0, r1 = r + dir; if (r1 < 0 || r1 > 7) continue;
        const add = (to, ex) => { if ((to >> 3) === last) for (const pr of 'QRBN') out.push(Object.assign({ f: i, t: to, p: w ? pr : pr.toLowerCase() }, ex)); else out.push(Object.assign({ f: i, t: to }, ex)); };
        if (!b[r1 * 8 + f]) { add(r1 * 8 + f, {}); if (r === start && !b[(r + 2 * dir) * 8 + f]) out.push({ f: i, t: (r + 2 * dir) * 8 + f, dbl: 1 }); }
        for (const df of [-1, 1]) { const ff = f + df; if (ff < 0 || ff > 7) continue; const to = r1 * 8 + ff, tp = b[to]; if (tp && isW(tp) !== w) add(to, { cap: 1 }); else if (!tp && to === s.ep) out.push({ f: i, t: to, cap: 1, ep: 1 }); }
      } else if (t === 'N' || t === 'K') {
        for (const [df, dr] of (t === 'N' ? KN : KG)) { const ff = f + df, rr = r + dr; if (!inb(ff, rr)) continue; const to = rr * 8 + ff, tp = b[to]; if (!tp) out.push({ f: i, t: to }); else if (isW(tp) !== w) out.push({ f: i, t: to, cap: 1 }); }
        if (t === 'K') {
          const home = w ? 4 : 60, R = w ? 'R' : 'r';
          if (i === home && !attacked(s, home, !w)) {
            if (s.c[w ? 'K' : 'k'] && b[home + 3] === R && !b[home + 1] && !b[home + 2] && !attacked(s, home + 1, !w) && !attacked(s, home + 2, !w)) out.push({ f: i, t: home + 2, castle: 'K' });
            if (s.c[w ? 'Q' : 'q'] && b[home - 4] === R && !b[home - 1] && !b[home - 2] && !b[home - 3] && !attacked(s, home - 1, !w) && !attacked(s, home - 2, !w)) out.push({ f: i, t: home - 2, castle: 'Q' });
          }
        }
      } else {
        const D = t === 'B' ? BD : t === 'R' ? RD : BD.concat(RD);
        for (const [df, dr] of D) { let ff = f + df, rr = r + dr; while (inb(ff, rr)) { const to = rr * 8 + ff, tp = b[to]; if (!tp) out.push({ f: i, t: to }); else { if (isW(tp) !== w) out.push({ f: i, t: to, cap: 1 }); break; } ff += df; rr += dr; } }
      }
    }
    return out;
  }
  function make(s, m) {
    const b = s.b.slice(), piece = b[m.f], w = isW(piece), c = Object.assign({}, s.c);
    b[m.t] = m.p || piece; b[m.f] = '';
    if (m.ep) b[m.t + (w ? -8 : 8)] = '';
    if (m.castle) { if (m.castle === 'K') { b[m.t - 1] = b[m.t + 1]; b[m.t + 1] = ''; } else { b[m.t + 1] = b[m.t - 2]; b[m.t - 2] = ''; } }
    if (piece === 'K') { c.K = c.Q = false; } else if (piece === 'k') { c.k = c.q = false; }
    for (const sq of [m.f, m.t]) { if (sq === 0) c.Q = false; else if (sq === 7) c.K = false; else if (sq === 56) c.q = false; else if (sq === 63) c.k = false; }
    return { b, turn: w ? 'b' : 'w', c, ep: m.dbl ? (m.f + m.t) / 2 : -1, hm: (piece.toUpperCase() === 'P' || m.cap) ? 0 : s.hm + 1, fm: s.fm + (w ? 0 : 1) };
  }
  function legal(s) {
    const w = s.turn === 'w', out = [];
    for (const m of pseudo(s)) { const ns = make(s, m); const k = kingSq(ns, w); if (k < 0 || !attacked(ns, k, !w)) out.push(m); }
    return out;
  }
  function san(s, m) { // تدوين مبسّط
    const p = s.b[m.f].toUpperCase(); if (m.castle) return m.castle === 'K' ? 'O-O' : 'O-O-O';
    return (p === 'P' ? (m.cap ? FILES[m.f & 7] : '') : p) + (m.cap ? 'x' : '') + name(m.t) + (m.p ? '=' + m.p.toUpperCase() : '');
  }
  const uci = m => name(m.f) + name(m.t) + (m.p ? m.p.toLowerCase() : '');
  const sameMove = (a, b) => a.f === b.f && a.t === b.t && (a.p || '') === (b.p || '');

  function material(s) { const o = { w: [], b: [] }; s.b.forEach(p => { if (p && p.toLowerCase() !== 'k') o[isW(p) ? 'w' : 'b'].push(p.toLowerCase()); }); return o; }
  function insufficient(s) {
    const m = material(s); if (m.w.some(x => 'prq'.includes(x)) || m.b.some(x => 'prq'.includes(x))) return false;
    return m.w.length <= 1 && m.b.length <= 1;
  }
  /* نتيجة اللعبة: null أو {r:'w'|'b'|'draw', why} */
  function outcome(s, seen) {
    if (!legal(s).length) return inCheck(s) ? { r: s.turn === 'w' ? 'b' : 'w', why: 'كش مات' } : { r: 'draw', why: 'تعادل بالجمود (لا نقلات قانونية)' };
    if (insufficient(s)) return { r: 'draw', why: 'مواد غير كافية للمات' };
    if (s.hm >= 100) return { r: 'draw', why: 'قاعدة الخمسين نقلة' };
    if (seen && (seen[posKey(s)] || 0) >= 3) return { r: 'draw', why: 'تكرار الوضع ثلاث مرات' };
    return null;
  }

  /* ---------- تقييم وبحث ---------- */
  const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }, MATE = 100000;
  function evaluate(s) {
    let sc = 0, np = 0; for (const p of s.b) if (p) { const t = p.toLowerCase(); if (t !== 'p' && t !== 'k') np += VAL[t]; }
    const end = np < 1500;
    for (let i = 0; i < 64; i++) {
      const p = s.b[i]; if (!p) continue; const t = p.toLowerCase(), w = isW(p), f = i & 7, r = i >> 3; let v = VAL[t];
      const cd = Math.abs(f - 3.5) + Math.abs(r - 3.5);
      if (t === 'p') { const adv = w ? r - 1 : 6 - r; v += adv * (end ? 10 : 5) + (3.5 - Math.abs(f - 3.5)) * 2; }
      else if (t === 'n') v += (7 - cd) * 5; else if (t === 'b') v += (7 - cd) * 2; else if (t === 'q') v += (7 - cd);
      else if (t === 'r') v += (w ? r === 6 : r === 1) ? 12 : 0;
      else if (t === 'k') v += end ? (7 - cd) * 5 : ((w ? r === 0 : r === 7) ? 14 : -10) + (f === 6 || f === 2 || f === 1 ? 8 : 0);
      sc += w ? v : -v;
    }
    return s.turn === 'w' ? sc : -sc;
  }
  function orderMoves(s, ms) {
    const sc = m => { let v = 0; if (m.cap) { const vic = m.ep ? 'p' : s.b[m.t].toLowerCase(); v += 10 * VAL[vic] - VAL[s.b[m.f].toLowerCase()] / 10 + 1000; } if (m.p) v += VAL[m.p.toLowerCase()] + 900; if (m.castle) v += 20; return v; };
    return ms.map(m => [sc(m), m]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  }
  function quiesce(s, alpha, beta, ply, ctl, qd) {
    ctl.nodes++;
    const stand = evaluate(s); if (stand >= beta) return beta; if (stand > alpha) alpha = stand; if (qd <= 0) return alpha;
    const caps = orderMoves(s, legal(s).filter(m => m.cap || m.p));
    for (const m of caps) { const sc = -quiesce(make(s, m), -beta, -alpha, ply + 1, ctl, qd - 1); if (sc >= beta) return beta; if (sc > alpha) alpha = sc; }
    return alpha;
  }
  function search(s, depth, alpha, beta, ply, ctl) {
    if ((ctl.nodes++ & 1023) === 0 && Date.now() > ctl.deadline) ctl.stop = true;
    if (ctl.stop) return 0;
    const ms = legal(s); if (!ms.length) return inCheck(s) ? -MATE + ply : 0;
    if (s.hm >= 100 || insufficient(s)) return 0;
    if (depth <= 0) return quiesce(s, alpha, beta, ply, ctl, 4);
    for (const m of orderMoves(s, ms)) {
      const sc = -search(make(s, m), depth - 1, -beta, -alpha, ply + 1, ctl);
      if (ctl.stop) return 0; if (sc > alpha) { alpha = sc; if (alpha >= beta) break; }
    }
    return alpha;
  }
  /* أفضل نقلة: opts {depth, time(ms), noise(cp), rng} */
  function best(s, opts = {}) {
    const ms = orderMoves(s, legal(s)); if (!ms.length) return null; if (ms.length === 1) return { move: ms[0], score: 0 };
    const rnd = opts.rng ? opts.rng.f : Math.random, maxD = opts.depth || 2, ctl = { nodes: 0, stop: false, deadline: Date.now() + (opts.time || 1500) };
    let bestRes = { move: ms[0], score: -Infinity };
    if (opts.noise > 0) {
      const sc = ms.map(m => { const v = -search(make(s, m), Math.max(0, maxD - 1), -MATE * 2, MATE * 2, 1, ctl); return { move: m, score: v, adj: v + (Math.abs(v) > MATE / 2 ? 0 : (rnd() - 0.5) * 2 * opts.noise) }; });
      sc.sort((a, b) => b.adj - a.adj); return { move: sc[0].move, score: sc[0].score };
    }
    let order = ms;
    for (let d = 1; d <= maxD; d++) {
      let alpha = -MATE * 2, bm = null, bs = -Infinity; const iterCtl = ctl;
      for (const m of order) {
        const sc = -search(make(s, m), d - 1, -MATE * 2, -alpha, 1, iterCtl);
        if (iterCtl.stop) break; if (sc > bs) { bs = sc; bm = m; alpha = Math.max(alpha, sc); }
      }
      if (iterCtl.stop) break;
      bestRes = { move: bm, score: bs, depth: d }; order = [bm].concat(order.filter(x => x !== bm));
      if (Math.abs(bs) > MATE / 2) break;
    }
    return bestRes;
  }
  /* تقييم كل النقلات القانونية بعمق ثابت (من وجهة نظر اللاعب الذي عليه الدور) */
  function scoreMoves(s, depth = 3, time = 1500) {
    const ctl = { nodes: 0, stop: false, deadline: Date.now() + time }, out = [];
    for (const m of orderMoves(s, legal(s))) { const v = -search(make(s, m), Math.max(0, depth - 1), -MATE * 2, MATE * 2, 1, ctl); if (ctl.stop) break; out.push({ move: m, score: v }); }
    return out.sort((a, b) => b.score - a.score);
  }
  /* النقلات التي تفرض كش مات خلال n نقلات (للّاعب الذي عليه الدور) */
  function matesIn(s, n) {
    const out = [];
    for (const m of legal(s)) {
      const ns = make(s, m), rep = legal(ns);
      if (!rep.length) { if (inCheck(ns)) out.push(m); continue; }
      if (n > 1 && rep.every(r => matesIn(make(ns, r), n - 1).length > 0)) out.push(m);
    }
    return out;
  }
  function perft(s, d) { if (d === 0) return 1; let n = 0; for (const m of legal(s)) n += perft(make(s, m), d - 1); return n; }
  return { START, fromFEN, toFEN, posKey, name, unname, isW, legal, make, inCheck, attacked, outcome, best, scoreMoves, matesIn, evaluate, san, uci, sameMove, perft, material };
})();
