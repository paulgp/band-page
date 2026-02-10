# Band Songbook Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an Astro-based band songbook website with inline chords, tabs, and drummer notes, deployed to GitHub Pages.

**Architecture:** Astro static site reading from a single `songs.yaml` data file. ChordPro notation (`[Chord]text`) parsed at render time into chord-above-lyrics display. Multi-column CSS layout to minimize scrolling.

**Tech Stack:** Astro 5.x, YAML via `@rollup/plugin-yaml`, Vitest for unit tests, GitHub Actions for deployment.

---

## Task 1: Scaffold Astro Project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `src/pages/index.astro` (all via CLI)
- Modify: `astro.config.mjs` (add YAML + GitHub Pages config)

**Step 1: Initialize Astro project**

Run in the repo root `/Users/psg24/repos/band-page`:

```bash
npm create astro@latest . -- --template minimal --no-git
```

Select defaults when prompted. This creates the minimal Astro scaffold.

**Step 2: Install YAML plugin**

```bash
npm install @rollup/plugin-yaml --save-dev
```

**Step 3: Configure Astro for YAML and GitHub Pages**

Replace `astro.config.mjs` with:

```javascript
import { defineConfig } from 'astro/config';
import yaml from '@rollup/plugin-yaml';

export default defineConfig({
  site: 'https://USERNAME.github.io',
  base: '/band-page',
  vite: {
    plugins: [yaml()]
  }
});
```

> **Note:** Replace `USERNAME` with the actual GitHub username before deploying.

**Step 4: Verify it builds**

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with YAML support"
```

---

## Task 2: ChordPro Parser Utility + Tests

This is the core logic — a pure JS function that parses ChordPro notation into structured data for rendering.

**Files:**
- Create: `src/utils/chordpro.js`
- Create: `src/utils/chordpro.test.js`

**Step 1: Install Vitest**

```bash
npm install vitest --save-dev
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 2: Write the failing test**

Create `src/utils/chordpro.test.js`:

```javascript
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
```

**Step 3: Run test to verify it fails**

```bash
npx vitest run
```

Expected: FAIL — module not found.

**Step 4: Implement the parser**

Create `src/utils/chordpro.js`:

```javascript
/**
 * Parses a ChordPro-formatted line into segments of { chord, text }.
 * Example: "[Am]Hello [G]world" → [{ chord: 'Am', text: 'Hello ' }, { chord: 'G', text: 'world' }]
 */
export function parseChordProLine(line) {
  if (!line) return [];

  const segments = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    // Text before this chord (if any, and no prior chord covers it)
    if (match.index > lastIndex) {
      segments.push({ chord: null, text: line.slice(lastIndex, match.index) });
    }

    const chord = match[1];
    const textStart = match.index + match[0].length;
    const nextMatch = regex.exec(line);

    if (nextMatch) {
      segments.push({ chord, text: line.slice(textStart, nextMatch.index) });
      // Back up so the while loop picks up nextMatch
      regex.lastIndex = nextMatch.index;
    } else {
      segments.push({ chord, text: line.slice(textStart) });
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text after last chord (or entire line if no chords)
  if (lastIndex === 0 && line.length > 0) {
    segments.push({ chord: null, text: line });
  }

  return segments;
}
```

**Step 5: Run tests to verify they pass**

```bash
npx vitest run
```

Expected: All 6 tests PASS.

**Step 6: Commit**

```bash
git add src/utils/chordpro.js src/utils/chordpro.test.js package.json package-lock.json
git commit -m "feat: add ChordPro line parser with tests"
```

---

## Task 3: Base Layout + Global Dark Theme Styles

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `src/styles/global.css`

**Step 1: Create the base layout**

Create `src/layouts/Layout.astro`:

```astro
---
const { title } = Astro.props;
const baseUrl = import.meta.env.BASE_URL;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} | Band Songbook</title>
    <link rel="stylesheet" href={`${baseUrl}styles/global.css`} />
  </head>
  <body>
    <nav class="top-nav">
      <a href={baseUrl}>Songbook</a>
    </nav>
    <main>
      <slot />
    </main>
  </body>
</html>
```

**Step 2: Create global styles**

Create `src/styles/global.css`:

```css
:root {
  --bg: #1a1a2e;
  --bg-surface: #16213e;
  --bg-section: #0f3460;
  --text: #e0e0e0;
  --text-muted: #a0a0a0;
  --chord: #e2b714;
  --accent-verse: #2d6a4f;
  --accent-chorus: #e76f51;
  --accent-bridge: #6a4c93;
  --accent-intro: #457b9d;
  --accent-solo: #d4a373;
  --accent-outro: #457b9d;
  --font-lyrics: 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'Courier New', Courier, monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-lyrics);
  line-height: 1.5;
}

.top-nav {
  padding: 0.75rem 1.5rem;
  background: var(--bg-surface);
  border-bottom: 1px solid #ffffff10;
}

.top-nav a {
  color: var(--chord);
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
}

main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

a {
  color: var(--chord);
}

@media print {
  body {
    background: white;
    color: black;
  }
  .top-nav {
    display: none;
  }
}
```

**Step 3: Verify build**

```bash
npm run build
```

Expected: Builds successfully.

**Step 4: Commit**

```bash
git add src/layouts/Layout.astro src/styles/global.css
git commit -m "feat: add base layout with dark theme styles"
```

---

## Task 4: Song Components

Build the four components that render song content.

**Files:**
- Create: `src/components/ChordLyricLine.astro`
- Create: `src/components/TabBlock.astro`
- Create: `src/components/DrummerNotes.astro`
- Create: `src/components/SongSection.astro`

**Step 1: Create ChordLyricLine component**

This takes a single ChordPro-formatted line and renders chord + lyric pairs.

Create `src/components/ChordLyricLine.astro`:

```astro
---
import { parseChordProLine } from '../utils/chordpro.js';

const { line } = Astro.props;
const segments = parseChordProLine(line);
---
<div class="chord-lyric-line">
  {segments.map(seg => (
    <span class="segment">
      <span class="chord">{seg.chord || '\u00A0'}</span>
      <span class="text">{seg.text || '\u00A0'}</span>
    </span>
  ))}
</div>

<style>
  .chord-lyric-line {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0.15rem;
  }
  .segment {
    display: inline-flex;
    flex-direction: column;
    white-space: pre;
  }
  .chord {
    color: var(--chord);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    font-weight: bold;
    min-height: 1.2em;
  }
  .text {
    font-family: var(--font-lyrics);
    font-size: 1rem;
  }
</style>
```

**Step 2: Create TabBlock component**

Collapsible block for tablature.

Create `src/components/TabBlock.astro`:

```astro
---
const { tabs } = Astro.props;
// tabs is an object like { lead: "...", rhythm: "..." }
const parts = Object.entries(tabs || {});
---
{parts.length > 0 && (
  <details class="tab-block">
    <summary>Tablature</summary>
    {parts.map(([part, content]) => (
      <div class="tab-part">
        <span class="tab-label">{part}</span>
        <pre class="tab-content">{content}</pre>
      </div>
    ))}
  </details>
)}

<style>
  .tab-block {
    margin-top: 0.5rem;
    border-left: 2px solid var(--text-muted);
    padding-left: 0.75rem;
  }
  summary {
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .tab-label {
    display: block;
    color: var(--text-muted);
    font-size: 0.75rem;
    text-transform: capitalize;
    margin-top: 0.25rem;
  }
  .tab-content {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--text);
    overflow-x: auto;
    line-height: 1.3;
  }
</style>
```

**Step 3: Create DrummerNotes component**

Create `src/components/DrummerNotes.astro`:

```astro
---
const { notes } = Astro.props;
---
{notes && (
  <details class="drummer-notes">
    <summary>Drummer</summary>
    <p>{notes}</p>
  </details>
)}

<style>
  .drummer-notes {
    margin-top: 0.5rem;
    border-left: 2px solid var(--text-muted);
    padding-left: 0.75rem;
  }
  summary {
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  p {
    color: var(--text);
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
</style>
```

**Step 4: Create SongSection component**

Composes the above into a full section (verse, chorus, etc.).

Create `src/components/SongSection.astro`:

```astro
---
import ChordLyricLine from './ChordLyricLine.astro';
import TabBlock from './TabBlock.astro';
import DrummerNotes from './DrummerNotes.astro';

const { section } = Astro.props;
const lines = section.lyrics ? section.lyrics.trim().split('\n') : [];
const accentVar = `var(--accent-${section.type || 'verse'})`;
---
<div class="song-section" style={`border-left-color: ${accentVar}`}>
  <h3 class="section-name" style={`color: ${accentVar}`}>{section.name}</h3>

  {section.chords && !section.lyrics && (
    <p class="standalone-chords">{section.chords}</p>
  )}

  {lines.map(line => (
    <ChordLyricLine line={line} />
  ))}

  {section.tabs && <TabBlock tabs={section.tabs} />}
  {section.drummer && <DrummerNotes notes={section.drummer} />}
</div>

<style>
  .song-section {
    border-left: 3px solid;
    padding-left: 1rem;
    margin-bottom: 1.25rem;
    break-inside: avoid;
  }
  .section-name {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.35rem;
  }
  .standalone-chords {
    font-family: var(--font-mono);
    color: var(--chord);
    font-size: 0.9rem;
  }
</style>
```

**Step 5: Verify build**

```bash
npm run build
```

Expected: Builds with no errors (components aren't used yet but should compile).

**Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: add song section components (ChordLyricLine, TabBlock, DrummerNotes, SongSection)"
```

---

## Task 5: Song Data File — First Song

Create the YAML data file with one song to prove the pipeline works end-to-end. Remaining songs added in Task 8.

**Files:**
- Create: `src/data/songs.yaml`

**Step 1: Create songs.yaml with "Say It Ain't So"**

Create `src/data/songs.yaml` with the first song. Use ChordPro notation for lyrics with inline chords. Include sections: intro, verses, pre-chorus, chorus, bridge. Add tab sketches and drummer notes where useful.

> **Important:** Look up accurate lyrics, chord progressions, and song structure. The chord progression for the main sections is Cm - G - Ab - Eb. Verify accuracy before writing.

Structure the YAML as:

```yaml
songs:
  - title: "Say It Ain't So"
    artist: "Weezer"
    slug: "say-it-aint-so"
    key: "C minor"
    tempo: 76
    sections:
      - name: "Intro"
        type: intro
        chords: "Cm  G  Ab  Eb (x4)"
        drummer: "Count in, soft ride cymbal"
      - name: "Verse 1"
        type: verse
        lyrics: |
          [Cm]Somebody's Heine is [G]crowding my icebox
          [Ab]Somebody's cold one is [Eb]giving me chills
          [Cm]Guess I'll just close my [G]eyes
          [Ab]  [Eb]
        drummer: "Hi-hat with soft kick on 1 and 3"
      # ... continue with full song structure
```

Fill in complete lyrics, all sections, and accurate chords for the full song.

**Step 2: Commit**

```bash
git add src/data/songs.yaml
git commit -m "feat: add songs.yaml with Say It Ain't So"
```

---

## Task 6: Song Page (Dynamic Route)

**Files:**
- Create: `src/pages/songs/[slug].astro`

**Step 1: Create the dynamic song page**

Create `src/pages/songs/[slug].astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
import SongSection from '../../components/SongSection.astro';
import songs from '../../data/songs.yaml';

export function getStaticPaths() {
  return songs.songs.map(song => ({
    params: { slug: song.slug },
    props: { song },
  }));
}

const { song } = Astro.props;
---
<Layout title={song.title}>
  <div class="song-header">
    <h1>{song.title}</h1>
    <p class="artist">{song.artist}</p>
    <div class="meta">
      {song.key && <span class="meta-tag">Key: {song.key}</span>}
      {song.tempo && <span class="meta-tag">{song.tempo} BPM</span>}
    </div>
  </div>

  <div class="song-body">
    {song.sections.map(section => (
      <SongSection section={section} />
    ))}
  </div>
</Layout>

<style>
  .song-header {
    margin-bottom: 1.5rem;
  }
  h1 {
    font-size: 1.8rem;
    margin-bottom: 0.15rem;
  }
  .artist {
    color: var(--text-muted);
    font-size: 1rem;
  }
  .meta {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  .meta-tag {
    background: var(--bg-surface);
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .song-body {
    columns: 2;
    column-gap: 2.5rem;
  }
  @media (max-width: 900px) {
    .song-body {
      columns: 1;
    }
  }
  @media print {
    .song-body {
      columns: 2;
    }
    h1 { font-size: 1.3rem; }
  }
</style>
```

**Step 2: Dev server smoke test**

```bash
npm run dev
```

Visit `http://localhost:4321/band-page/songs/say-it-aint-so/` and verify:
- Song title, artist, key, tempo display correctly
- Chords appear above lyrics in gold/amber
- Sections have colored left borders
- Two-column layout on desktop
- Tab and drummer blocks are collapsible

**Step 3: Commit**

```bash
git add src/pages/songs/
git commit -m "feat: add dynamic song page with multi-column layout"
```

---

## Task 7: Home Page (Song List)

**Files:**
- Modify: `src/pages/index.astro` (replace scaffold content)

**Step 1: Build the song list page**

Replace `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import songs from '../data/songs.yaml';

const baseUrl = import.meta.env.BASE_URL;
---
<Layout title="Songs">
  <h1>Songbook</h1>
  <div class="song-list">
    {songs.songs.map((song, i) => (
      <a href={`${baseUrl}songs/${song.slug}/`} class="song-card">
        <span class="song-number">{i + 1}</span>
        <div>
          <span class="song-title">{song.title}</span>
          <span class="song-artist">{song.artist}</span>
        </div>
        <div class="song-meta">
          {song.key && <span>{song.key}</span>}
          {song.tempo && <span>{song.tempo} BPM</span>}
        </div>
      </a>
    ))}
  </div>
</Layout>

<style>
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
  .song-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .song-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem 1.25rem;
    background: var(--bg-surface);
    border-radius: 8px;
    text-decoration: none;
    color: var(--text);
    transition: background 0.15s;
  }
  .song-card:hover {
    background: var(--bg-section);
  }
  .song-number {
    color: var(--text-muted);
    font-size: 0.85rem;
    min-width: 1.5rem;
  }
  .song-title {
    display: block;
    font-weight: 600;
    font-size: 1.05rem;
  }
  .song-artist {
    display: block;
    color: var(--text-muted);
    font-size: 0.85rem;
  }
  .song-meta {
    margin-left: auto;
    display: flex;
    gap: 0.75rem;
    color: var(--text-muted);
    font-size: 0.8rem;
  }
</style>
```

**Step 2: Dev server smoke test**

```bash
npm run dev
```

Visit `http://localhost:4321/band-page/` and verify:
- All songs listed with numbers, titles, artists
- Clicking a song navigates to its song page
- Hover effect works

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add home page with song list"
```

---

## Task 8: Populate All 9 Songs

Add the remaining 8 songs to `src/data/songs.yaml`.

**Files:**
- Modify: `src/data/songs.yaml`

**Step 1: Research and add each song**

For each song, look up accurate:
- Chord progressions for each section
- Full lyrics with chords in ChordPro notation
- Song structure (intro, verses, choruses, bridge, solo, outro)
- Key and tempo
- Drummer notes (basic groove description per section)
- Tab sketches for notable riffs/parts (lead and rhythm where distinct)

Songs to add:
1. Under the Bridge — Red Hot Chili Peppers
2. Don't Look Back in Anger — Oasis
3. Little Wing — Jimi Hendrix
4. Ohio — CSNY
5. Santeria — Sublime
6. Everlong — Foo Fighters
7. Creep — Radiohead
8. Where Is My Mind — Pixies

Each song should follow the same YAML structure as "Say It Ain't So" from Task 5.

> **Note:** This is the largest task. For each song, take care to get chord positions aligned with the correct syllable in the lyrics. Verify song structures are accurate (correct number of verses, choruses, etc.).

**Step 2: Dev server verification**

```bash
npm run dev
```

Verify each song page renders correctly with proper chords above lyrics, collapsible tabs, and no layout issues.

**Step 3: Commit**

```bash
git add src/data/songs.yaml
git commit -m "feat: add all 9 songs with lyrics, chords, tabs, and drummer notes"
```

---

## Task 9: GitHub Actions Deploy Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: Create the workflow file**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
      - name: Build with Astro
        uses: withastro/action@v5

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 2: Update astro.config.mjs with correct username**

Ensure `astro.config.mjs` has the correct `site` URL. Ask the user for their GitHub username if not already known.

**Step 3: Final full build check**

```bash
npm run build
```

Expected: Clean build, all 9 song pages generated.

**Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deployment workflow"
```

---

## Task Summary

| Task | Description | Depends On |
|------|-------------|------------|
| 1 | Scaffold Astro + config | — |
| 2 | ChordPro parser + tests | 1 |
| 3 | Layout + dark theme CSS | 1 |
| 4 | Song components | 2, 3 |
| 5 | First song YAML data | 1 |
| 6 | Song page (dynamic route) | 4, 5 |
| 7 | Home page (song list) | 5, 3 |
| 8 | Remaining 8 songs | 5 |
| 9 | GitHub Actions deploy | All |
