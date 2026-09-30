/* cyber.js - Cyber Conduit Spaceframe (bg1). Began as the in-game draft.
 *
 * Aim: Star Control 2 -- minor-key tracker music, 50 Hz arpeggio chords, a
 * driving bass with the drums threaded between its notes, a singing pulse lead
 * with vibrato and the odd glide. D minor, 125 BPM.
 *
 * Voices, as on the C64:
 *   v1  lead
 *   v2  bass + drums (K kick, S snare, H hat, played between the bass notes)
 *   v3  arpeggio chords, the only voice through the filter -- the voice the
 *       game's sound effects use, so the tune must still stand without it
 *
 * FORMAT (read by index.html; the C64 converter will read the same thing)
 *
 *   speed        frames a row at 50 Hz. 6 = 8.33 rows a second; with 4 rows a
 *                beat and 16 a bar that is 125 BPM, 1.92 s a bar.
 *   instruments  name -> {
 *     adsr   [A, D, S, R], SID values 0-15
 *     wave   one step a frame, the last held (or `loop` back to an index):
 *            [waveform, pitch] -- waveform 'T' triangle, 'S' saw, 'P' pulse,
 *            'N' noise, '-' silent; pitch a semitone offset from the note, or
 *            '=C5' an absolute note (drums)
 *     pulse  [start, speed, min, max], 12-bit width, sweeps back and forth
 *     vib    [delay frames, depth semitones, period frames]
 *     arp    default arpeggio offsets, cycled every `arpSpeed` frames
 *     glide  semitones a frame for '>' notes
 *     filter {mode 'LP'|'BP'|'HP', res 0-15, cutoff [start, per frame, min, max]}
 *            11-bit cutoff; the SID has one filter, the voice that last played
 *            a filtered instrument owns it. `keep: true` carries the cutoff
 *            on across notes of the same instrument instead of restarting it;
 *            `bounce: true` sweeps back and forth between min and max
 *   }
 *   patterns     name -> rows, whitespace separated, '|' ignored:
 *     .      nothing new
 *     ^      release (gate off)
 *     C4     a note (C4 = middle C; sharps C#4, flats Bb3), with suffixes
 *            :inst  switch instrument (sticks for the voice)
 *            ~037   arpeggio offsets in hex digits, 50 Hz chord
 *            prefix >  glide from the previous pitch, / change pitch legato
 *     K S H  drum hit (does not change the voice's instrument)
 *   sections     name -> { v1: [...], v2: [...], v3: [...] } lists of patterns
 *                as 'name', 'name+5' / 'name-4' (transpose) or 'name@inst'
 *                (instrument at the pattern's start). Voices in a section
 *                must add up to the same number of rows.
 *   order, loopTo  sections played in turn, then from loopTo forever
 *
 * A new note is preceded by a two-frame hard restart (gate off, fast release),
 * as a real C64 player does, so what is heard here is what the port plays.
 */
(window.SONGS = window.SONGS || []).push({
  id: 'cyber',
  title: 'Cyber Conduit Spaceframe',
  speed: 6,
  rowsPerBeat: 4,
  rowsPerBar: 16,

  instruments: {
    lead:   { adsr: [1, 9, 10, 5], wave: [['P', 0]], pulse: [0x800, 0x20, 0x400, 0xC00],
              vib: [14, 0.22, 8], glide: 0.6 },
    lead2:  { adsr: [1, 9, 10, 5], wave: [['S', 12], ['S', 0]], vib: [12, 0.28, 7], glide: 0.6 },
    bass:   { adsr: [0, 8, 5, 4], wave: [['P', 12], ['P', 0]], pulse: [0x300, 0x40, 0x200, 0x900] },
    bassPad:{ adsr: [2, 11, 11, 9], wave: [['P', 0]], pulse: [0x500, 0x10, 0x300, 0xB00] },
    chord:  { adsr: [0, 9, 4, 6], wave: [['P', 0]], pulse: [0x400, 0x30, 0x300, 0xC00], arpSpeed: 1,
              filter: { mode: 'LP', res: 10, cutoff: [0x480, -0x14, 0x100, 0x7FF] } },
    swell:  { adsr: [9, 11, 12, 10], wave: [['P', 0]], pulse: [0x600, 0x18, 0x300, 0xD00], arpSpeed: 1,
              filter: { mode: 'LP', res: 12, cutoff: [0x080, 0x05, 0x080, 0x500] } },
    kick:   { adsr: [0, 8, 0, 0], pulse: [0x800, 0, 0x800, 0x800],
              wave: [['N', '=A5'], ['P', '=C4'], ['P', '=G3'], ['P', '=D3'], ['T', '=A2'], ['T', '=E2'], ['T', '=C2']] },
    snare:  { adsr: [0, 8, 0, 0], pulse: [0x800, 0, 0x800, 0x800],
              wave: [['N', '=C7'], ['P', '=C5'], ['N', '=G6'], ['N', '=E6'], ['N', '=D6']] },
    hat:    { adsr: [0, 4, 0, 0], wave: [['N', '=C8']] },
  },
  drums: { K: 'kick', S: 'snare', H: 'hat' },

  patterns: {
    rest1: '. . . . | . . . . | . . . . | . . . .',
    rest2: '. . . . | . . . . | . . . . | . . . .  . . . . | . . . . | . . . . | . . . .',
    rel1:  '^ . . . | . . . . | . . . . | . . . .',

    // lead, section A (Dm Dm Bb C | Dm Dm Gm A)
    leadA:
      'A4 . . . | . . D5 . | E5 . . . | F5 . E5 . ' +
      'D5 . . . | . . . . | . . . . | C5 . A4 . ' +
      'F5 . . . | . . D5 . | Bb4 . . . | C5 . D5 . ' +
      'E5 . . . | . . . . | . . . . | D5 . C5 . ' +
      'A4 . . . | . . D5 . | E5 . . . | F5 . G5 . ' +
      '>A5 . . . | . . . . | G5 . F5 . | E5 . F5 . ' +
      'D5 . . . | . . Bb4 . | G5 . . . | . . F5 . ' +
      'E5 . . . | . . . . | C#5 . . . | A4 . . .',

    // lead, section B (Bb C Am Dm | Bb C Gm A)
    leadB:
      'F5 . . . | . . . . | . . . . | G5 . F5 . ' +
      'E5 . . . | . . . . | G5 . . . | C5 . . . ' +
      'E5 . . . | . . . . | . . . . | D5 . C5 . ' +
      'D5 . . . | . . . . | . . . . | . . ^ . ' +
      'F5 . . . | . . G5 . | >A5 . . . | . . . . ' +
      'G5 . . . | . . . . | E5 . . . | G5 . . . ' +
      'Bb5 . . . | . . . . | A5 . . . | G5 . . . ' +
      'A5 . . . | . . . . | G5 . F5 . | E5 . C#5 .',

    // lead, the break (Dm Bb Gm A): two bars out, then a lead-in back to A
    leadBreak:
      '^ . . . | . . . . | . . . . | . . . . ' +
      '. . . . | . . . . | . . . . | . . . . ' +
      'D5 . . . | . . . . | G5 . . . | . . . . ' +
      'E5 . . . | . . . . | C#5 . . . | E5 . . .',

    // bass + drums, one bar on D: kick, bass, snare, octave, kick, bass bass, snare, octave
    bassDrive: 'K . D2:bass . | S . D3 . | K . D2 D2 | S . D3 .',
    bassIntro: 'K . D2:bass . | K . D2 . | K . D2 . | K . D2 .',
    bassFill:  'K . D2:bass . | K . D2 . | K . D2 . | S S S S',
    bassBreak: 'D2:bassPad . . . | . . . . | . . . . | . . . .',

    // chords: stabs on 3+3+2 through the bar, the filter plucking each one
    arpMin:  'D4~037:chord . . D4~037 | . . D4~037 . | D4~037 . . D4~037 | . . D4~037 .',
    arpMaj:  'D4~047:chord . . D4~047 | . . D4~047 . | D4~047 . . D4~047 | . . D4~047 .',
    arpSwell:'D4~037:swell . . . | . . . . | . . . . | . . . .  . . . . | . . . . | . . . . | . . . .',
    holdMin: 'D4~037:swell . . . | . . . . | . . . . | . . . .',
    holdMaj: 'D4~047:swell . . . | . . . . | . . . . | . . . .',
  },

  sections: {
    Intro: {
      v1: ['rest2', 'rest2'],
      v2: ['rest2', 'bassIntro-4', 'bassFill-2'],
      v3: ['arpSwell', 'arpMaj-4', 'arpMaj-2'],
    },
    A: {
      v1: ['leadA@lead'],
      v2: ['bassDrive', 'bassDrive', 'bassDrive-4', 'bassDrive-2', 'bassDrive', 'bassDrive', 'bassDrive-7', 'bassDrive-5'],
      v3: ['arpMin', 'arpMin', 'arpMaj-4', 'arpMaj-2', 'arpMin', 'arpMin', 'arpMin-7', 'arpMaj-5'],
    },
    B: {
      v1: ['leadB@lead'],
      v2: ['bassDrive-4', 'bassDrive-2', 'bassDrive-5', 'bassDrive', 'bassDrive-4', 'bassDrive-2', 'bassDrive-7', 'bassDrive-5'],
      v3: ['arpMaj-4', 'arpMaj-2', 'arpMin-5', 'arpMin', 'arpMaj-4', 'arpMaj-2', 'arpMin-7', 'arpMaj-5'],
    },
    A2: {
      v1: ['leadA@lead2'],
      v2: ['bassDrive', 'bassDrive', 'bassDrive-4', 'bassDrive-2', 'bassDrive', 'bassDrive', 'bassDrive-7', 'bassDrive-5'],
      v3: ['arpMin', 'arpMin', 'arpMaj-4', 'arpMaj-2', 'arpMin', 'arpMin', 'arpMin-7', 'arpMaj-5'],
    },
    Break: {
      v1: ['leadBreak@lead'],
      v2: ['bassBreak', 'bassBreak-4', 'bassBreak-7', 'bassFill-5'],
      v3: ['holdMin', 'holdMaj-4', 'holdMin-7', 'holdMaj-5'],
    },
  },
  order: ['Intro', 'A', 'B', 'A2', 'Break'],
  loopTo: 'A',
});
