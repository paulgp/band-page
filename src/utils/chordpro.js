/**
 * Parses a ChordPro-formatted line into segments of { chord, text }.
 * Example: "[Am]Hello [G]world" -> [{ chord: 'Am', text: 'Hello ' }, { chord: 'G', text: 'world' }]
 */
export function parseChordProLine(line) {
  if (!line) return [];

  const matches = [...line.matchAll(/\[([^\]]+)\]/g)];

  if (matches.length === 0) {
    return [{ chord: null, text: line }];
  }

  const segments = [];
  let lastIndex = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];

    // Text before this chord (no chord attached)
    if (match.index > lastIndex) {
      segments.push({ chord: null, text: line.slice(lastIndex, match.index) });
    }

    const chord = match[1];
    const textStart = match.index + match[0].length;
    const textEnd = i + 1 < matches.length ? matches[i + 1].index : line.length;

    segments.push({ chord, text: line.slice(textStart, textEnd) });
    lastIndex = textEnd;
  }

  return segments;
}
