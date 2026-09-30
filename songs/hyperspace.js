/* hyperspace.js - Hyperspace Starfield (bg2).
 *
 * Dark and pulsing: a sixteenth-note bass through a resonant filter that
 * sweeps slowly up and down across the notes (keep + bounce), hollow open-fifth
 * pads, an eerie triangle lead that glides. E phrygian -- the F natural over E
 * is the unease. 107 BPM. Format: see cyber.js.
 */
(window.SONGS = window.SONGS || []).push({
  id: 'hyperspace',
  title: 'Hyperspace Starfield',
  speed: 7,
  rowsPerBeat: 4,
  rowsPerBar: 16,

  instruments: {
    hlead:  { adsr: [3, 10, 11, 8], wave: [['T', 0]], vib: [18, 0.3, 10], glide: 0.25 },
    hbass:  { adsr: [0, 6, 3, 2], wave: [['P', 0]], pulse: [0x200, 0x08, 0x200, 0x800],
              filter: { mode: 'LP', res: 12, cutoff: [0x180, 0x04, 0x180, 0x700], bounce: true, keep: true } },
    hbpad:  { adsr: [4, 11, 10, 9], wave: [['P', 0]], pulse: [0x400, 0x10, 0x300, 0xA00] },
    hpad:   { adsr: [7, 11, 8, 10], wave: [['P', 0]], pulse: [0x300, 0x14, 0x300, 0xC00], arpSpeed: 3 },
    kick:   { adsr: [0, 8, 0, 0], pulse: [0x800, 0, 0x800, 0x800],
              wave: [['N', '=A5'], ['P', '=C4'], ['P', '=G3'], ['P', '=D3'], ['T', '=A2'], ['T', '=E2'], ['T', '=C2']] },
    snare:  { adsr: [0, 8, 0, 0], pulse: [0x800, 0, 0x800, 0x800],
              wave: [['N', '=C7'], ['P', '=C5'], ['N', '=G6'], ['N', '=E6'], ['N', '=D6']] },
  },
  drums: { K: 'kick', S: 'snare' },

  patterns: {
    rest2: '. . . . | . . . . | . . . . | . . . .  . . . . | . . . . | . . . . | . . . .',

    // lead A (Em Em F Em | Em Em Dm F)
    leadA:
      'B4:hlead . . . | . . . . | >C5 . . . | . . . . ' +
      'B4 . . . | . . . . | G4 . . . | A4 . . . ' +
      'C5 . . . | . . . . | . . . . | A4 . . . ' +
      'B4 . . . | . . . . | . . . . | ^ . . . ' +
      'E5 . . . | . . . . | D5 . . . | B4 . . . ' +
      'G5 . . . | . . . . | >F5 . . . | E5 . . . ' +
      'F5 . . . | . . . . | E5 . . . | D5 . . . ' +
      'C5 . . . | . . . . | . . . . | . . ^ .',
    // lead A2, higher
    leadA2:
      'E5 . . . | . . . . | >F5 . . . | . . . . ' +
      'E5 . . . | . . . . | B4 . . . | D5 . . . ' +
      'F5 . . . | . . . . | A5 . . . | G5 . . . ' +
      'E5 . . . | . . . . | . . . . | . . . . ' +
      'B5 . . . | . . . . | A5 . . . | G5 . . . ' +
      '>F5 . . . | . . . . | E5 . . . | . . . . ' +
      'D5 . . . | . . F5 . | . . . . | A5 . . . ' +
      'G5 . . . | . . . . | >F5 . . . | . . ^ .',
    // lead B (C C Dm Dm | Am Am B B)
    leadB:
      'G4 . . . | . . C5 . | . . . . | E5 . . . ' +
      'D5 . . . | . . . . | C5 . . . | . . . . ' +
      'A4 . . . | . . D5 . | . . . . | F5 . . . ' +
      'E5 . . . | . . . . | D5 . . . | . . . . ' +
      'C5 . . . | . . E5 . | . . . . | A5 . . . ' +
      'G5 . . . | . . . . | E5 . . . | . . . . ' +
      'F#5 . . . | . . . . | D#5 . . . | . . . . ' +
      'B4 . . . | . . . . | . . . . | ^ . . .',
    // break (Em F Em B): out for two bars, then a lead-in
    leadBreak:
      '^ . . . | . . . . | . . . . | . . . . ' +
      '. . . . | . . . . | . . . . | . . . . ' +
      'E5 . . . | . . . . | . . . . | . . . . ' +
      '>D#5 . . . | . . . . | . . . . | ^ . . .',

    // bass: sixteenths on E, the filter sweeping across them
    hPulse: 'E2:hbass E2 E3 E2 | E2 E2 E3 E2 | E2 E2 E3 E2 | E2 E2 E3 E2',
    hDrive: 'K E2:hbass E3 E2 | E2 E2 E3 E2 | K E2 E3 E2 | S E2 E3 E2',
    hFill:  'K E2:hbass E3 E2 | K E2 E3 E2 | K E2 E3 E2 | S S S S',
    hBreak: 'E2:hbpad . . . | . . . . | . . . . | . . . .',

    // pads: open fifths (no third -- hollow), triads in B
    hpad5:  'E4~07c:hpad . . . | . . . . | . . . . | . . . .',
    hpad2:  'E4~07c:hpad . . . | . . . . | . . . . | . . . .  . . . . | . . . . | . . . . | . . . .',
    hMaj1:  'E4~047:hpad . . . | . . . . | . . . . | . . . .',
    hMaj2:  'E4~047:hpad . . . | . . . . | . . . . | . . . .  . . . . | . . . . | . . . . | . . . .',
    hMin2:  'E4~037:hpad . . . | . . . . | . . . . | . . . .  . . . . | . . . . | . . . . | . . . .',
  },

  sections: {
    Intro: {
      v1: ['rest2', 'rest2'],
      v2: ['hPulse', 'hPulse', 'hPulse', 'hPulse'],
      v3: ['rest2', 'hpad2'],
    },
    A: {
      v1: ['leadA'],
      v2: ['hDrive', 'hDrive', 'hDrive+1', 'hDrive', 'hDrive', 'hDrive', 'hDrive-2', 'hDrive+1'],
      v3: ['hpad2', 'hpad5+1', 'hpad5', 'hpad2', 'hpad5-2', 'hpad5+1'],
    },
    A2: {
      v1: ['leadA2@hlead'],
      v2: ['hDrive', 'hDrive', 'hDrive+1', 'hDrive', 'hDrive', 'hDrive', 'hDrive-2', 'hDrive+1'],
      v3: ['hpad2', 'hpad5+1', 'hpad5', 'hpad2', 'hpad5-2', 'hpad5+1'],
    },
    B: {
      v1: ['leadB@hlead'],
      v2: ['hDrive-4', 'hDrive-4', 'hDrive-2', 'hDrive-2', 'hDrive-7', 'hDrive-7', 'hDrive-5', 'hDrive-5'],
      v3: ['hMaj2-4', 'hMin2-2', 'hMin2-7', 'hMaj2-5'],
    },
    Break: {
      v1: ['leadBreak@hlead'],
      v2: ['hBreak', 'hBreak+1', 'hBreak', 'hFill-5'],
      v3: ['hpad5', 'hpad5+1', 'hpad5', 'hMaj1-5'],
    },
  },
  order: ['Intro', 'A', 'A2', 'B', 'Break'],
  loopTo: 'A',
});
