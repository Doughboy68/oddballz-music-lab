/* nebula.js - Deep Space Nebula (bg0). Began as the "Starbase" draft.
 *
 * Warm and safe: G major, four-note seventh chords arpeggiated at 25 Hz (softer
 * than the 50 Hz shimmer), a round pulse-into-triangle bass on root and fifth,
 * a relaxed singing lead. 107 BPM. Format: see cyber.js.
 *
 * Arp digits: maj7 047b, m7 037a, dominant 7 047a, major 047.
 */
(window.SONGS = window.SONGS || []).push({
  id: 'nebula',
  title: 'Deep Space Nebula',
  speed: 7,
  rowsPerBeat: 4,
  rowsPerBar: 16,

  instruments: {
    slead:  { adsr: [2, 9, 10, 6], wave: [['P', 0]], pulse: [0x600, 0x0C, 0x500, 0x900],
              vib: [16, 0.2, 9], glide: 0.5 },
    slead2: { adsr: [1, 9, 10, 6], wave: [['P', 12], ['P', 0]], pulse: [0x200, 0x40, 0x200, 0xE00],
              vib: [12, 0.25, 8], glide: 0.5 },
    sbass:  { adsr: [0, 8, 6, 5], wave: [['P', 0], ['T', 0]], pulse: [0x800, 0, 0x800, 0x800] },
    schord: { adsr: [2, 9, 8, 8], wave: [['P', 0]], pulse: [0x500, 0x10, 0x400, 0xA00], arpSpeed: 2,
              filter: { mode: 'LP', res: 8, cutoff: [0x500, -0x06, 0x280, 0x7FF] } },
    kick:   { adsr: [0, 8, 0, 0], pulse: [0x800, 0, 0x800, 0x800],
              wave: [['N', '=A5'], ['P', '=C4'], ['P', '=G3'], ['P', '=D3'], ['T', '=A2'], ['T', '=E2'], ['T', '=C2']] },
    snare:  { adsr: [0, 7, 0, 0], pulse: [0x800, 0, 0x800, 0x800],
              wave: [['N', '=C7'], ['P', '=C5'], ['N', '=G6'], ['N', '=E6'], ['N', '=D6']] },
  },
  drums: { K: 'kick', S: 'snare' },

  patterns: {
    rest2: '. . . . | . . . . | . . . . | . . . .  . . . . | . . . . | . . . . | . . . .',

    // lead A (Gmaj7 Em7 Cmaj7 D | Gmaj7 Em7 Am7 D)
    leadA:
      'B4 . . . | . . . . | D5 . . . | . . G5 . ' +
      'F#5 . . . | . . . . | E5 . . . | . . . . ' +
      'G5 . . . | . . E5 . | . . . . | D5 . . . ' +
      'F#5 . . . | . . . . | A5 . . . | . . . . ' +
      'B5 . . . | . . . . | A5 . . . | G5 . . . ' +
      'F#5 . . . | . . G5 . | . . . . | E5 . . . ' +
      'E5 . . . | . . D5 . | . . C5 . | . . . . ' +
      'D5 . . . | . . . . | . . . . | ^ . . .',
    // lead B (Cmaj7 Bm7 Am7 D | Em7 Cmaj7 Am7 D)
    leadB:
      'E5 . . . | . . . . | G5 . . . | . . . . ' +
      'F#5 . . . | . . . . | D5 . . . | . . . . ' +
      'E5 . . . | . . . . | C5 . . . | . . D5 . ' +
      'A4 . . . | . . . . | . . . . | . . . . ' +
      'G5 . . . | . . . . | F#5 . . . | . . E5 . ' +
      '>G5 . . . | . . . . | E5 . . . | . . . . ' +
      'A5 . . . | . . G5 . | . . E5 . | . . D5 . ' +
      'F#5 . . . | . . . . | . . . . | ^ . . .',

    // bass + drums on G: root and fifth, kick on 1 and 3, snare on 2 and 4
    sbWalk: 'K . G2:sbass . | S . D3 . | K . G2 G3 | S . D3 .',
    sbSoft: 'G2:sbass . . . | . . . . | D3 . . . | . . . .',

    // chords, on G3: struck on 1 and the "and" of 2
    sMaj7: 'G3~047b:schord . . . | . . G3~047b . | . . . . | . . . .',
    sMin7: 'G3~037a:schord . . . | . . G3~037a . | . . . . | . . . .',
    sDom:  'G3~047a:schord . . . | . . G3~047a . | . . . . | . . . .',
    sMaj:  'G3~047:schord . . . | . . G3~047 . | . . . . | . . . .',
  },

  sections: {
    Intro: {
      v1: ['rest2', 'rest2'],
      v2: ['rest2', 'sbSoft-7', 'sbSoft-5'],
      v3: ['sMaj7', 'sMin7-3', 'sMaj7+5', 'sMaj-5'],
    },
    A: {
      v1: ['leadA@slead'],
      v2: ['sbWalk', 'sbWalk-3', 'sbWalk-7', 'sbWalk-5', 'sbWalk', 'sbWalk-3', 'sbWalk+2', 'sbWalk-5'],
      v3: ['sMaj7', 'sMin7-3', 'sMaj7+5', 'sMaj-5', 'sMaj7', 'sMin7-3', 'sMin7+2', 'sDom-5'],
    },
    B: {
      v1: ['leadB@slead'],
      v2: ['sbWalk-7', 'sbWalk+4', 'sbWalk+2', 'sbWalk-5', 'sbWalk-3', 'sbWalk-7', 'sbWalk+2', 'sbWalk-5'],
      v3: ['sMaj7+5', 'sMin7+4', 'sMin7+2', 'sMaj-5', 'sMin7-3', 'sMaj7+5', 'sMin7+2', 'sDom-5'],
    },
    A2: {
      v1: ['leadA@slead2'],
      v2: ['sbWalk', 'sbWalk-3', 'sbWalk-7', 'sbWalk-5', 'sbWalk', 'sbWalk-3', 'sbWalk+2', 'sbWalk-5'],
      v3: ['sMaj7', 'sMin7-3', 'sMaj7+5', 'sMaj-5', 'sMaj7', 'sMin7-3', 'sMin7+2', 'sDom-5'],
    },
  },
  order: ['Intro', 'A', 'B', 'A2'],
  loopTo: 'A',
});
