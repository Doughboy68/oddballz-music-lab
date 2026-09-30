/* c64.js - the song format as the C64 carries it, and the player as it runs.
 *
 * encodeSong(song)  the lab's song object -> bytes for the C64, laid out to run
 *                   at SONG_BASE ($C000), where the game copies the song it is
 *                   playing (pointers inside are absolute)
 * C64Player         plays those bytes a frame at a time with exactly the
 *                   integer arithmetic of the 6502 player, engine/music.s, and
 *                   returns the 25 SID registers each frame. It is the spec for
 *                   that file: change one, change the other. { ntsc: true }:
 *                   NTSC's notes, and call() -- the interrupt, 60 a second --
 *                   lets every sixth go by, so 60 make 50, as music.s does
 *                   when the Kernal's $02A6 is 0.
 *
 * The lab's own play() works in fractional semitones; the C64 cannot, so a few
 * things are approximated here and this file is where that is decided:
 *   vibrato  a triangle in frequency, stepping by freq >> shift each frame
 *   glide    freq +-= freq >> shift each frame: constant semitones per frame
 *   pulse    start/min/max kept in 16ths (the songs' values all are)
 *   cutoff   start/min/max kept in 8ths
 * The lab plays either, so the approximations are heard before they ship.
 *
 * Used by music/index.html in the browser and tools/music-convert.js in Node.
 *
 * ----- the bytes ----------------------------------------------------------
 *
 * header, 22 bytes:
 *   0      speed (frames a row)
 *   1-6    order list pointers, v1 v2 v3 (lo hi)
 *   7-9    where each order list loops to (a byte offset into it)
 *   10-11  wave table   12-13 arp table
 *   14-15  pattern pointers, lo bytes   16-17 hi bytes
 *   18-21  unused
 * 22-      instruments, 20 bytes each, instrument i at 22 + 20 i
 * then the wave table, the arp table (one offset per arp, then each arp as
 * length and values), the pattern pointers, the order lists, the patterns.
 *
 * order list entry, 3 bytes: pattern, transpose (signed), instrument ($FF none);
 *   pattern $FF ends the list
 * pattern: events, $FF at the end
 *   $00-$5F note (C0 = 0), then duration in rows
 *   $80+i   instrument i from here on (prefix)
 *   $A0+a   arp a for this note (prefix)
 *   $C0     glide into this note (prefix)   $C1 legato (prefix)
 *   $F8 dur release    $F9 dur nothing    $FA i dur drum hit on instrument i
 * instrument, 20 bytes:
 *   0 AD  1 SR  2 wave start (byte offset)  3 wave end (offset of last step)
 *   4 pulse start/16  5 pulse speed  6 pulse min/16  7 pulse max/16
 *   8 vib delay ($FF none)  9 vib shift  10 vib half-period  11 glide shift
 *   12 arp speed  13 default arp ($FF none)
 *   14 filter: mode bits $10 LP $20 BP $40 HP, | 1 keep, | 2 bounce; 0 = none
 *   15 resonance << 4  16 cutoff start/8  17 cutoff speed (signed)
 *   18 cutoff min/8  19 cutoff max/8
 * wave step, 2 bytes: control (waveform bits, bit 0 set = absolute pitch),
 *   pitch (signed semitones, or the absolute note)
 */
(function (root) {
'use strict';

const PAL = 985248, NTSC = 1022727;
const SONG_BASE = 0xC000, SONG_MAX = 0x300;   // $C300 on is the fast loader's
const INST_SIZE = 20, HDR = 22;
const WAVE = { T: 0x10, S: 0x20, P: 0x40, N: 0x80, '-': 0x00 };
const MODE = { LP: 0x10, BP: 0x20, HP: 0x40 };
const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const TOP = 94;                       // highest note: A#7. B7 would not fit in 16 bits

const freqs = clock => {
  const t = [];
  for (let n = 0; n <= TOP; n++) t.push(Math.round(440 * Math.pow(2, (n + 12 - 69) / 12) * 16777216 / clock));
  return t;
};
const FREQ = freqs(PAL), FREQ_NTSC = freqs(NTSC);

function noteNum(name) {              // 'C4' -> 48 (C0 = 0)
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error('bad note ' + name);
  return 12 * +m[3] + SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
const clampByte = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ----- encoder ---------------------------------------------------------- */

function encodeSong(song) {
  const base = SONG_BASE;
  const instNames = Object.keys(song.instruments);
  if (instNames.length > 12) throw new Error('more than 12 instruments');
  const instIdx = n => { const i = instNames.indexOf(n); if (i < 0) throw new Error('no instrument ' + n); return i; };
  const arps = [], arpIdx = a => { const k = a.join(','); let i = arps.findIndex(x => x.join(',') === k); if (i < 0) { i = arps.length; arps.push(a); } return i; };

  const wave = [], insts = [];
  for (const name of instNames) {
    const I = song.instruments[name];
    const start = wave.length;
    for (const [wf, p] of I.wave) {
      if (typeof p === 'string') wave.push(WAVE[wf] | 1, noteNum(p.slice(1)));
      else wave.push(WAVE[wf], p & 0xFF);
    }
    const pulse = I.pulse || [0x800, 0, 0x800, 0x800];
    let vd = 0xFF, vs = 0, vh = 0;
    if (I.vib) {
      const [delay, depth, period] = I.vib;
      vh = Math.max(2, Math.round(period / 2));
      // amplitude ~ (vh/2 frames) x 17.31 x 2^-shift semitones
      vs = clampByte(Math.round(Math.log2((vh / 2) * 17.31 / depth)), 1, 15);
      vd = delay;
    }
    const gs = clampByte(Math.round(Math.log2(17.31 / (I.glide || 0.5))), 1, 15);
    const F = I.filter;
    insts.push([
      (I.adsr[0] << 4) | I.adsr[1], (I.adsr[2] << 4) | I.adsr[3],
      start, wave.length - 2,
      pulse[0] >> 4, pulse[1], pulse[2] >> 4, pulse[3] >> 4,
      vd, vs, vh, gs,
      I.arpSpeed || 1, I.arp ? arpIdx(I.arp) : 0xFF,
      F ? (MODE[F.mode] | (F.keep ? 1 : 0) | (F.bounce ? 2 : 0)) : 0,
      F ? F.res << 4 : 0,
      F ? F.cutoff[0] >> 3 : 0, F ? F.cutoff[1] & 0xFF : 0,
      F ? F.cutoff[2] >> 3 : 0, F ? Math.min(255, F.cutoff[3] >> 3) : 0,
    ]);
  }
  if (wave.length > 256) throw new Error('wave table over 256 bytes');

  const patNames = [], patBytes = [];
  const patIdx = n => { let i = patNames.indexOf(n); if (i < 0) { i = patNames.length; patNames.push(n); patBytes.push(encodePattern(n)); } return i; };
  function encodePattern(name) {
    const src = song.patterns[name];
    if (src == null) throw new Error('no pattern ' + name);
    const toks = src.split(/\s+/).filter(t => t && t !== '|');
    const out = [], ev = [];
    toks.forEach((t, i) => { if (t !== '.' || i === 0) ev.push(i); });
    ev.forEach((row, k) => {
      const dur = (k + 1 < ev.length ? ev[k + 1] : toks.length) - row;
      if (dur > 255) throw new Error(name + ': an event longer than 255 rows');
      const t = toks[row];
      if (t === '.') { out.push(0xF9, dur); return; }
      if (t === '^') { out.push(0xF8, dur); return; }
      if (song.drums[t]) { out.push(0xFA, instIdx(song.drums[t]), dur); return; }
      const m = /^([>\/]?)([A-G][#b]?-?\d)((?::\w+|~[0-9a-fA-F]+)*)$/.exec(t);
      if (!m) throw new Error(name + ': bad token ' + t);
      for (const s of m[3].match(/:\w+|~[0-9a-fA-F]+/g) || []) {
        if (s[0] === ':') out.push(0x80 | instIdx(s.slice(1)));
        else out.push(0xA0 | arpIdx([...s.slice(1)].map(c => parseInt(c, 16))));
      }
      if (m[1] === '>') out.push(0xC0);
      if (m[1] === '/') out.push(0xC1);
      const n = noteNum(m[2]);
      if (n < 0 || n > 0x5F) throw new Error(name + ': note out of range ' + t);
      out.push(n, dur);
    });
    out.push(0xFF);
    return out;
  }

  const loopSec = song.order.indexOf(song.loopTo);
  const orders = [[], [], []], loops = [0, 0, 0];
  song.order.forEach((secName, si) => {
    const sec = song.sections[secName];
    ['v1', 'v2', 'v3'].forEach((vk, v) => {
      if (si === loopSec) loops[v] = orders[v].length * 3;
      for (const e of sec[vk]) {
        const m = /^(\w+)([+-]\d+)?(?:@(\w+))?$/.exec(e);
        orders[v].push([patIdx(m[1]), (m[2] ? +m[2] : 0) & 0xFF, m[3] ? instIdx(m[3]) : 0xFF]);
      }
    });
  });
  orders.forEach(o => { if (o.length * 3 + 1 > 255) throw new Error('an order list over 255 bytes'); });

  const bytes = [];
  const at = () => base + bytes.length;
  const w16 = (off, v) => { bytes[off] = v & 0xFF; bytes[off + 1] = v >> 8; };
  for (let i = 0; i < HDR; i++) bytes.push(0);
  bytes[0] = song.speed;
  for (let v = 0; v < 3; v++) bytes[7 + v] = loops[v];
  insts.forEach(r => bytes.push(...r));
  w16(10, at()); bytes.push(...wave);
  w16(12, at());
  const arpOffs = bytes.length; arps.forEach(() => bytes.push(0));
  arps.forEach((a, i) => { bytes[arpOffs + i] = bytes.length - arpOffs; bytes.push(a.length, ...a); });
  if (bytes.length - arpOffs > 256) throw new Error('arp table over 256 bytes');
  const patLo = bytes.length; w16(14, at()); patBytes.forEach(() => bytes.push(0));
  const patHi = bytes.length; w16(16, at()); patBytes.forEach(() => bytes.push(0));
  for (let v = 0; v < 3; v++) {
    w16(1 + 2 * v, at());
    for (const e of orders[v]) bytes.push(...e);
    bytes.push(0xFF);
  }
  patBytes.forEach((p, i) => {
    const a = at(); bytes[patLo + i] = a & 0xFF; bytes[patHi + i] = a >> 8; bytes.push(...p);
  });
  if (bytes.length > SONG_MAX) throw new Error(song.id + ': ' + bytes.length + ' bytes, the buffer holds ' + SONG_MAX);
  return {
    bytes: Uint8Array.from(bytes),
    report: { size: bytes.length, patterns: patBytes.reduce((s, p) => s + p.length, 0), npat: patBytes.length,
              instruments: insts.length, wave: wave.length, arps: arps.length,
              orders: orders.map(o => o.length * 3 + 1) },
  };
}

/* ----- player: the 6502's arithmetic, in JavaScript --------------------- */

class C64Player {
  constructor(mem, opts) {         // mem: 64K Uint8Array with the song at SONG_BASE
    const B = SONG_BASE;
    this.m = mem;
    this.ntsc = !!(opts && opts.ntsc);
    this.FQ = this.ntsc ? FREQ_NTSC : FREQ;
    this.calls = 0;                 // NTSC: calls since the last one let go by
    const r16 = a => mem[a] | (mem[a + 1] << 8);
    this.speed = mem[B];
    this.wave = r16(B + 10); this.arpT = r16(B + 12);
    this.patLo = r16(B + 14); this.patHi = r16(B + 16);
    this.tick = 0;
    this.lent = 0;
    this.F = { owner: 0xFF, inst: 0xFF, cut: 0, dir: 0, res: 0, mode: 0 };
    this.v = [0, 1, 2].map(i => ({
      ord: r16(B + 1 + 2 * i), loop: mem[B + 7 + i], oo: 0, pp: 0, tr: 0, ds: 0, left: 1,
      nx: null, inst: 0xFF, note: 0, arp: 0xFF, ap: 0, ac: 0, frame: 0, wp: 0,
      pw: 0, pdir: 0, vib: 0, vdir: 0, vcnt: 0, gl: 0, gf: 0, gt: 0, lastF: 0,
      gate: 0, hr: 0, ad: 0, sr: 0, wait: 0, wf: 0, freq: 0,
    }));
    this.v.forEach(s => { this.startPattern(s); s.nx = this.decode(s); });
    this.R = new Uint8Array(25);
  }
  I(i, f) { return this.m[SONG_BASE + 22 + i * INST_SIZE + f]; }
  startPattern(s) {
    const m = this.m;
    if (m[s.ord + s.oo] === 0xFF) s.oo = s.loop;
    const p = m[s.ord + s.oo];
    s.pp = m[this.patLo + p] | (m[this.patHi + p] << 8);
    s.tr = m[s.ord + s.oo + 1];
    const io = m[s.ord + s.oo + 2];
    if (io !== 0xFF) s.ds = io;
  }
  decode(s) {                      // the next event, instrument and transpose resolved
    const m = this.m;
    const ev = { type: 0, note: 0, inst: 0, arp: 0xFF, fl: 0, dur: 1 };
    for (;;) {
      const b = m[s.pp];
      if (b === 0xFF) { s.oo += 3; this.startPattern(s); continue; }
      s.pp++;
      if (b < 0x60) {
        ev.type = 1; ev.note = (b + s.tr) & 0xFF; ev.inst = s.ds;
        if (ev.arp === 0xFF) ev.arp = this.I(s.ds, 13);
        ev.dur = m[s.pp++]; return ev;
      }
      if (b < 0xA0) { s.ds = b & 0x1F; continue; }
      if (b < 0xC0) { ev.arp = b & 0x1F; continue; }
      if (b === 0xC0) { ev.fl = 1; continue; }
      if (b === 0xC1) { ev.fl = 2; continue; }
      ev.type = b === 0xF8 ? 2 : b === 0xF9 ? 0 : 3;
      if (ev.type === 3) { ev.inst = m[s.pp++]; ev.note = 48; }
      ev.dur = m[s.pp++]; return ev;
    }
  }
  trigger(v, s, ev) {
    if (ev.type === 1 && ev.fl && s.inst !== 0xFF) {     // glide or legato: no retrigger
      s.arp = ev.arp; s.ap = 0; s.ac = 0; s.note = ev.note;
      if (ev.fl === 2) s.gl = 0;
      else { s.gl = 1; s.gt = this.FQ[Math.min(TOP, ev.note)]; s.gf = s.lastF; }
      return;
    }
    const i = ev.inst;
    s.inst = i; s.note = ev.note; s.arp = ev.type === 3 ? 0xFF : ev.arp; s.ap = 0; s.ac = 0;
    s.frame = 0; s.wp = this.I(i, 2); s.gate = 1; s.hr = 0; s.wait = 0; s.gl = 0;
    s.ad = this.I(i, 0); s.sr = this.I(i, 1);
    s.pw = this.I(i, 4) << 4; s.pdir = 0;
    s.vib = 0; s.vdir = 0; s.vcnt = this.I(i, 10) >> 1;
    const F = this.F, fm = this.I(i, 14);
    if (fm) {
      if (!((fm & 1) && F.inst === i)) { F.cut = this.I(i, 16) << 3; F.dir = 0; }
      F.owner = v; F.inst = i; F.res = this.I(i, 15); F.mode = fm & 0x70;
    } else if (F.owner === v) F.owner = 0xFF;
  }
  voice(s) {
    const m = this.m;
    if (s.inst === 0xFF) return;
    const i = s.inst;
    const ctl = m[this.wave + s.wp], pv = m[this.wave + s.wp + 1];
    if (s.wp < this.I(i, 3)) s.wp += 2;
    s.wf = ctl & 0xF0;
    let f;
    if (s.gl) {
      let d = s.gf; for (let k = this.I(i, 11); k; k--) d >>= 1;
      if (s.gf < s.gt) { s.gf += d; if (s.gf >= s.gt) { s.gf = s.gt; s.gl = 0; } }
      else { s.gf -= d; if (s.gf <= s.gt) { s.gf = s.gt; s.gl = 0; } }
      f = s.gf;
    } else if (ctl & 1) f = this.FQ[Math.min(TOP, pv)];
    else {
      let n = s.note + (pv < 0x80 ? pv : pv - 256);
      if (n < 0) n = 0;
      if (s.arp !== 0xFF) {
        const a = m[this.arpT + s.arp];
        n += m[this.arpT + a + 1 + s.ap];
        if (++s.ac >= this.I(i, 12)) { s.ac = 0; if (++s.ap >= m[this.arpT + a]) s.ap = 0; }
      }
      f = this.FQ[Math.min(TOP, n)];
    }
    s.lastF = f;
    const vd = this.I(i, 8);
    if (vd !== 0xFF && s.frame >= vd) {
      let st = f; for (let k = this.I(i, 9); k; k--) st >>= 1;
      s.vib = (s.vib + (s.vdir ? -st : st)) & 0xFFFF;
      if (--s.vcnt === 0) { s.vcnt = this.I(i, 10); s.vdir ^= 1; }
      f = (f + s.vib) & 0xFFFF;
    }
    s.freq = f;
    const sp = this.I(i, 5);
    if (sp) {
      if (!s.pdir) { s.pw += sp; const hi = this.I(i, 7) << 4; if (s.pw >= hi) { s.pw = hi; s.pdir = 1; } }
      else { s.pw -= sp; const lo = this.I(i, 6) << 4; if (s.pw <= lo) { s.pw = lo; s.pdir = 0; } }
    }
    if (s.frame < 255) s.frame++;
  }
  call(sfxBusy) {                  // the interrupt's call: on NTSC every sixth
    if (this.ntsc && ++this.calls === 6) { this.calls = 0; return this.R; }  // goes by
    return this.frame(sfxBusy);
  }
  frame(sfxBusy) {                 // one 50 Hz tick; returns the SID registers
    if (this.tick === 0) this.v.forEach((s, v) => {
      if (--s.left) return;
      const ev = s.nx; s.left = ev.dur; s.nx = this.decode(s);
      if (ev.type === 2) s.gate = 0;
      else if (ev.type) this.trigger(v, s, ev);
    });
    if (this.tick === this.speed - 2) this.v.forEach(s => {
      const n = s.nx;
      if (s.left === 1 && (n.type === 3 || (n.type === 1 && !n.fl))) { s.gate = 0; s.hr = 1; }
    });
    if (++this.tick >= this.speed) this.tick = 0;

    this.v.forEach(s => this.voice(s));

    const F = this.F;
    if (F.owner !== 0xFF) {
      const i = F.inst, sp = this.I(i, 17), lo = this.I(i, 18) << 3, hi = this.I(i, 19) << 3;
      const d = sp < 0x80 ? sp : sp - 256;
      const c = F.cut + (F.dir ? -d : d);
      if ((this.I(i, 14) & 2) && (c >= hi || c <= lo)) F.dir ^= 1;
      F.cut = Math.max(lo, Math.min(hi, c));
    }

    const R = this.R;               // voice 3 is left alone while an effect has it,
    this.v.forEach((s, v) => {      // and takes its note back as soon as it is done
      if (v === 2 && sfxBusy) { s.wait = 1; this.lent = 1; return; }
      if (v === 2 && this.lent) { this.lent = 0; s.wait = 0; }
      const o = v * 7;
      R[o] = s.freq & 0xFF; R[o + 1] = s.freq >> 8;
      R[o + 2] = s.pw & 0xFF; R[o + 3] = (s.pw >> 8) & 0x0F;
      R[o + 5] = s.hr ? 0 : s.ad; R[o + 6] = s.hr ? 0 : s.sr;
      R[o + 4] = s.wf | (s.gate && !s.wait ? 1 : 0);
    });
    const route = F.owner === 0xFF || (F.owner === 2 && sfxBusy) ? 0 : 1 << F.owner;
    R[0x15] = F.cut & 7; R[0x16] = (F.cut >> 3) & 0xFF;
    R[0x17] = F.res | route; R[0x18] = (route ? F.mode : 0) | 0x0F;
    return R;
  }
}

// SID registers -> the lab's frame format, so its renderer plays the C64 version
function regsToFrame(R, vis) {
  const WF = { 0x10: 'T', 0x20: 'S', 0x40: 'P', 0x80: 'N' };
  const out = { v: [], filt: null, vis };
  for (let v = 0; v < 3; v++) {
    const o = v * 7;
    out.v.push({ freq: R[o] | (R[o + 1] << 8), pw: R[o + 2] | (R[o + 3] << 8), wf: WF[R[o + 4] & 0xF0] || '-',
                 gate: !!(R[o + 4] & 1), adsr: [R[o + 5] >> 4, R[o + 5] & 15, R[o + 6] >> 4, R[o + 6] & 15] });
  }
  const route = R[0x17] & 7;
  if (route) out.filt = { cutoff: R[0x15] | (R[0x16] << 3), res: R[0x17] >> 4,
    mode: R[0x18] & 0x10 ? 'LP' : R[0x18] & 0x20 ? 'BP' : 'HP', voice: route === 1 ? 0 : route === 2 ? 1 : 2 };
  return out;
}

const api = { encodeSong, C64Player, regsToFrame, FREQ, FREQ_NTSC, TOP, INST_SIZE, SONG_BASE, SONG_MAX };
if (typeof module !== 'undefined') module.exports = api; else root.C64 = api;
})(typeof window !== 'undefined' ? window : globalThis);
