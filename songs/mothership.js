/* mothership.js - Alien Mothership Core (bg3).
 *
 * Dark and menacing, and steady rather than quirky: C minor (i VI iv V), a
 * machine throb of a bass with a fast pulse-width sweep, half-time drums (kick
 * on 1, snare on 3), minor pads through a resonant filter that breathes slowly
 * open and shut across the chords (keep + bounce), a slow saw lead that sits
 * low. 107 BPM. Replaces the whole-tone "Alien" draft, which grated.
 * Format: see cyber.js.
 */
(window.SONGS = window.SONGS || []).push({
  id: 'mothership',
  title: 'Alien Mothership Core',
  speed: 7,
  rowsPerBeat: 4,
  rowsPerBar: 16,

  instruments: {
    mlead:  { adsr: [4, 10, 11, 9], wave: [['S', 0]], vib: [20, 0.2, 12], glide: 0.3 },
    mlead2: { adsr: [3, 10, 11, 9], wave: [['P', 0]], pulse: [0x180, 0x10, 0x180, 0x600],
              vib: [16, 0.25, 10], glide: 0.3 },
    mbass:  { adsr: [0, 7, 5, 3], wave: [['P', 12], ['P', 0]], pulse: [0x100, 0x60, 0x100, 0x700] },
    mbpad:  { adsr: [5, 11, 11, 10], wave: [['P', 0]], pulse: [0x300, 0x10, 0x300, 0x900] },
    mpad:   { adsr: [8, 11, 9, 10], wave: [['P', 0]], pulse: [0x400, 0x10, 0x300, 0xB00], arpSpeed: 2,
              filter: { mode: 'LP', res: 12, cutoff: [0x100, 0x03, 0x100, 0x480], bounce: true, keep: true } },
    kick:   { adsr: [0, 9, 0, 0], pulse: [0x800, 0, 0x800, 0x800],
              wave: [['N', '=A5'], ['P', '=C4'], ['P', '=F3'], ['P', '=C3'], ['T', '=G2'], ['T', '=D2'], ['T', '=A1']] },
    snare:  { adsr: [0, 9, 0, 0], pulse: [0x800, 0, 0x800, 0x800],
              wave: [['N', '=C7'], ['P', '=A4'], ['N', '=G6'], ['N', '=E6'], ['N', '=C6']] },
  },
  drums: { K: 'kick', S: 'snare' },

  patterns: {
    rest2: '. . . . | . . . . | . . . . | . . . .  . . . . | . . . . | . . . . | . . . .',

    // lead A (Cm Cm Ab Ab | Fm Fm G G)
    leadA:
      'C5 . . . | . . . . | . . Eb5 . | D5 . . . ' +
      'C5 . . . | . . . . | G4 . . . | . . . . ' +
      'Ab4 . . . | . . . . | . . C5 . | Eb5 . . . ' +
      'D5 . . . | . . . . | C5 . . . | . . . . ' +
      'F5 . . . | . . . . | . . Ab5 . | G5 . . . ' +
      'F5 . . . | . . . . | Eb5 . . . | C5 . . . ' +
      'D5 . . . | . . . . | . . B4 . | . . . . ' +
      '>G5 . . . | . . . . | . . . . | ^ . . .',
    // lead B (Ab Bb Cm Cm | Fm Ab G G)
    leadB:
      'Eb5 . . . | . . . . | C5 . . . | Ab4 . . . ' +
      'D5 . . . | . . . . | F5 . . . | . . . . ' +
      'G5 . . . | . . . . | . . . . | Eb5 . . . ' +
      'C5 . . . | . . . . | . . . . | ^ . . . ' +
      'Ab5 . . . | . . . . | G5 . . . | F5 . . . ' +
      'Eb5 . . . | . . . . | C5 . . . | Eb5 . . . ' +
      'D5 . . . | . . . . | . . . . | B4 . . . ' +
      'D5 . . . | . . F5 . | . . . . | ^ . . .',
    // break (Cm Ab Fm G): out for two bars, then up to the leading note
    leadBreak:
      '^ . . . | . . . . | . . . . | . . . . ' +
      '. . . . | . . . . | . . . . | . . . . ' +
      'G4 . . . | . . . . | Ab4 . . . | . . . . ' +
      '>B4 . . . | . . . . | . . . . | ^ . . .',

    // bass: the throb, drums in half time
    mThrob: 'K . C2:mbass C2 | . . C3 . | S . C2 C2 | . . G2 .',
    mHum:   '. . C2:mbass C2 | . . C3 . | . . C2 C2 | . . G2 .',
    mFill:  'K . C2:mbass C2 | . . C3 . | S . S . | S S S S',
    mPad:   'C2:mbpad . . . | . . . . | . . . . | . . . .',

    // pads on C4: one or two bars a chord
    mMin1: 'C4~037:mpad . . . | . . . . | . . . . | . . . .',
    mMaj1: 'C4~047:mpad . . . | . . . . | . . . . | . . . .',
    mMin2: 'C4~037:mpad . . . | . . . . | . . . . | . . . .  . . . . | . . . . | . . . . | . . . .',
    mMaj2: 'C4~047:mpad . . . | . . . . | . . . . | . . . .  . . . . | . . . . | . . . . | . . . .',
  },

  sections: {
    Intro: {
      v1: ['rest2', 'rest2'],
      v2: ['mHum', 'mHum', 'mThrob', 'mFill'],
      v3: ['mMin2', 'mMin2'],
    },
    A: {
      v1: ['leadA@mlead'],
      v2: ['mThrob', 'mThrob', 'mThrob-4', 'mThrob-4', 'mThrob+5', 'mThrob+5', 'mThrob+7', 'mThrob+7'],
      v3: ['mMin2', 'mMaj2-4', 'mMin2+5', 'mMaj2-5'],
    },
    B: {
      v1: ['leadB@mlead'],
      v2: ['mThrob-4', 'mThrob-2', 'mThrob', 'mThrob', 'mThrob+5', 'mThrob-4', 'mThrob+7', 'mFill+7'],
      v3: ['mMaj1-4', 'mMaj1-2', 'mMin2', 'mMin1+5', 'mMaj1-4', 'mMaj2-5'],
    },
    A2: {
      v1: ['leadA@mlead2'],
      v2: ['mThrob', 'mThrob', 'mThrob-4', 'mThrob-4', 'mThrob+5', 'mThrob+5', 'mThrob+7', 'mThrob+7'],
      v3: ['mMin2', 'mMaj2-4', 'mMin2+5', 'mMaj2-5'],
    },
    Break: {
      v1: ['leadBreak@mlead'],
      v2: ['mPad', 'mPad-4', 'mPad+5', 'mFill+7'],
      v3: ['mMin1', 'mMaj1-4', 'mMin1+5', 'mMaj1-5'],
    },
  },
  order: ['Intro', 'A', 'B', 'A2', 'Break'],
  loopTo: 'A',
});
