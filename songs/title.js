/* title.js - Title screen.
 *
 * The first thing heard, so catchy and bright, but in the same sci-fi voice as
 * the picture songs. The idea is the name: a ball bouncing. The intro is one
 * bouncing to rest (each hit quicker and lower, drums building under it), and
 * every phrase of the hook ends in the same accelerating repeated note.
 * C major with the flat seven (C Bb F C -- the "space adventure" lift), an
 * A minor middle, 125 BPM. The intro plays once; the loop is A B A2.
 * Format: see cyber.js.
 */
(window.SONGS = window.SONGS || []).push({
  id: 'title',
  title: 'Title Screen',
  speed: 6,
  rowsPerBeat: 4,
  rowsPerBar: 16,

  instruments: {
    tblip:  { adsr: [0, 6, 0, 0], wave: [['T', 12], ['T', 9], ['T', 6], ['T', 3], ['T', 0]] },
    tlead:  { adsr: [0, 9, 9, 5], wave: [['P', 12], ['P', 0]], pulse: [0x400, 0x30, 0x300, 0xA00],
              vib: [10, 0.2, 7], glide: 0.6 },
    tlead2: { adsr: [0, 9, 9, 5], wave: [['S', 12], ['S', 0]], vib: [10, 0.25, 7], glide: 0.6 },
    tbass:  { adsr: [0, 7, 5, 3], wave: [['P', 12], ['P', 0]], pulse: [0x300, 0x40, 0x200, 0x900] },
    tchord: { adsr: [0, 9, 4, 6], wave: [['P', 0]], pulse: [0x400, 0x30, 0x300, 0xC00], arpSpeed: 1,
              filter: { mode: 'LP', res: 10, cutoff: [0x500, -0x18, 0x180, 0x7FF] } },
    tswell: { adsr: [6, 11, 11, 8], wave: [['P', 0]], pulse: [0x600, 0x18, 0x300, 0xD00], arpSpeed: 1,
              filter: { mode: 'LP', res: 11, cutoff: [0x100, 0x0C, 0x100, 0x700] } },
    kick:   { adsr: [0, 8, 0, 0], pulse: [0x800, 0, 0x800, 0x800],
              wave: [['N', '=A5'], ['P', '=C4'], ['P', '=G3'], ['P', '=D3'], ['T', '=A2'], ['T', '=E2'], ['T', '=C2']] },
    snare:  { adsr: [0, 8, 0, 0], pulse: [0x800, 0, 0x800, 0x800],
              wave: [['N', '=C7'], ['P', '=C5'], ['N', '=G6'], ['N', '=E6'], ['N', '=D6']] },
  },
  drums: { K: 'kick', S: 'snare' },

  patterns: {
    rest1: '. . . . | . . . . | . . . . | . . . .',

    // a ball dropped: gaps of 10, 7, 5, 4, 3, 2 rows, each hit a little lower
    tBounce:
      'C6:tblip . . . | . . . . | . . A5 . | . . . . ' +
      '. G5 . . | . . E5 . | . . D5 . | . C5 . C5',

    // hook (C Bb F C | C Bb F-G C); every fourth bar ends in the bounce
    leadA:
      'C5 . . . | . . G5 . | . . . E5 | . . G5 . ' +
      'F5 . . . | . . D5 . | . . . F5 | . . Bb5 . ' +
      'A5 . . . | . . . . | G5 . F5 . | . . C5 . ' +
      'E5 . . . | . . . . | G5 . . . | G5 . G5 G5 ' +
      'C5 . . . | . . G5 . | . . . E5 | . . G5 . ' +
      'F5 . . . | . . D5 . | . . . F5 | . . Bb5 . ' +
      'A5 . . . | . . C6 . | B5 . . . | . . D6 . ' +
      'C6 . . . | . . . . | C5 . . . | C5 . C5 C5',
    // middle (Am F Dm G | Am F Dm G): longer notes, then bounce back into the hook
    leadB:
      'E5 . . . | . . . . | A5 . . . | . . G5 . ' +
      'F5 . . . | . . . . | C5 . . . | . . . . ' +
      'D5 . . . | . . F5 . | . . A5 . | . . . . ' +
      'G5 . . . | . . . . | . . . . | ^ . . . ' +
      'E5 . . . | . . . . | A5 . . . | . . B5 . ' +
      'C6 . . . | . . . . | A5 . . . | . . F5 . ' +
      'A5 . . . | . . G5 . | . . F5 . | . . D5 . ' +
      'B4 . . . | . . D5 . | G5 . . . | G5 . G5 G5',

    // bass: bouncing octaves, drums between
    tbBounce: 'K . C2:tbass C3 | S . C2 C3 | K C2 . C3 | S . C3 .',
    tbFG:     'K . F2:tbass F3 | S . F2 F3 | K G2 . G3 | S . G3 .',
    tbBuild:  'K . . . | K . . . | K . K . | S S S S',

    // chords on C4, plucked 3+3+2
    tMaj:  'C4~047:tchord . . C4~047 | . . C4~047 . | C4~047 . . C4~047 | . . C4~047 .',
    tMin:  'C4~037:tchord . . C4~037 | . . C4~037 . | C4~037 . . C4~037 | . . C4~037 .',
    tFG:   'F3~047:tchord . . F3~047 | . . F3~047 . | G3~047 . . G3~047 | . . G3~047 .',
    tSwell:'C4~047:tswell . . . | . . . . | . . . . | . . . .',
  },

  sections: {
    Intro: {
      v1: ['tBounce'],
      v2: ['rest1', 'tbBuild'],
      v3: ['rest1', 'tSwell'],
    },
    A: {
      v1: ['leadA@tlead'],
      v2: ['tbBounce', 'tbBounce-2', 'tbBounce+5', 'tbBounce', 'tbBounce', 'tbBounce-2', 'tbFG', 'tbBounce'],
      v3: ['tMaj', 'tMaj-2', 'tMaj-7', 'tMaj', 'tMaj', 'tMaj-2', 'tFG', 'tMaj'],
    },
    B: {
      v1: ['leadB@tlead'],
      v2: ['tbBounce-3', 'tbBounce+5', 'tbBounce+2', 'tbBounce+7', 'tbBounce-3', 'tbBounce+5', 'tbBounce+2', 'tbBounce+7'],
      v3: ['tMin-3', 'tMaj-7', 'tMin+2', 'tMaj-5', 'tMin-3', 'tMaj-7', 'tMin+2', 'tMaj-5'],
    },
    A2: {
      v1: ['leadA@tlead2'],
      v2: ['tbBounce', 'tbBounce-2', 'tbBounce+5', 'tbBounce', 'tbBounce', 'tbBounce-2', 'tbFG', 'tbBounce'],
      v3: ['tMaj', 'tMaj-2', 'tMaj-7', 'tMaj', 'tMaj', 'tMaj-2', 'tFG', 'tMaj'],
    },
  },
  order: ['Intro', 'A', 'B', 'A2'],
  loopTo: 'A',
});
