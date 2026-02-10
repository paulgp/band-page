import { describe, it, expect } from 'vitest';
import { parseChordProLine } from './chordpro.js';

describe('parseChordProLine', () => {
  it('parses a line with chords into segments', () => {
    const result = parseChordProLine("[Am]Hello [G]world");
    expect(result).toEqual([
      { chord: 'Am', text: 'Hello ' },
      { chord: 'G', text: 'world' },
    ]);
  });

  it('handles text before first chord', () => {
    const result = parseChordProLine("Oh [Am]baby");
    expect(result).toEqual([
      { chord: null, text: 'Oh ' },
      { chord: 'Am', text: 'baby' },
    ]);
  });

  it('handles line with no chords', () => {
    const result = parseChordProLine("Just some lyrics");
    expect(result).toEqual([
      { chord: null, text: 'Just some lyrics' },
    ]);
  });

  it('handles empty string', () => {
    const result = parseChordProLine("");
    expect(result).toEqual([]);
  });

  it('handles chord with no following text', () => {
    const result = parseChordProLine("[Am]");
    expect(result).toEqual([
      { chord: 'Am', text: '' },
    ]);
  });

  it('handles complex chord names', () => {
    const result = parseChordProLine("[F#m7]Fade [Bb/D]away");
    expect(result).toEqual([
      { chord: 'F#m7', text: 'Fade ' },
      { chord: 'Bb/D', text: 'away' },
    ]);
  });
});
