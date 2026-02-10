# Band Songbook Website — Design

## Purpose

Internal band reference tool (songbook) for rehearsal and performance. Not public-facing. Deployed on GitHub Pages.

## Tech Stack

- **Astro** static site generator
- **GitHub Pages** deployment via GitHub Action
- **Single YAML data file** for all songs

## Data Format

All songs in `src/data/songs.yaml`. ChordPro notation for inline chords (`[Chord]` before the syllable). Each song has:

- `title`, `artist`, `key`, `tempo`
- `sections[]` — each section has:
  - `name` (e.g. "Verse 1"), `type` (verse/chorus/bridge/intro/outro/solo)
  - `lyrics` — ChordPro-formatted lyrics (optional for instrumental sections)
  - `chords` — standalone chord progression (for sections without lyrics)
  - `tabs.lead` / `tabs.rhythm` — tablature strings (optional)
  - `drummer` — drummer notes (optional)

## Pages

- **Home (`/`)** — Setlist view listing all songs with artist names
- **Song pages (`/songs/[slug]/`)** — Individual song view

## Song Page Layout

- Title, artist, key, tempo header
- Sections flow top-to-bottom, labeled by type
- Chords rendered above lyrics in accent color
- Tabs and drummer notes in collapsible blocks (collapsed by default)
- **Multi-column CSS layout** for longer songs to avoid vertical scrolling
- Falls back to single-column on small screens

## Styling

- Dark theme for rehearsal readability
- Monospace font for chords and tabs
- Sans-serif font for lyrics
- Color-coded section borders (verse vs chorus vs bridge)
- Amber/gold accent for chord names
- Print-friendly CSS

## File Structure

```
src/
  data/songs.yaml
  pages/index.astro
  pages/songs/[slug].astro
  components/
    SongSection.astro
    ChordLyricLine.astro
    TabBlock.astro
    DrummerNotes.astro
  layouts/Layout.astro
```

## Deployment

GitHub Action on push to `main` — builds with Astro, deploys to GitHub Pages.

## Song List

1. Say It Ain't So — Weezer
2. Under the Bridge — Red Hot Chili Peppers
3. Don't Look Back in Anger — Oasis
4. Little Wing — Jimi Hendrix
5. Ohio — CSNY
6. Santeria — Sublime
7. Everlong — Foo Fighters
8. Creep — Radiohead
9. Where Is My Mind — Pixies

## Priority

1. Lyrics with inline chords (no-scroll on desktop)
2. Tablature (lead/rhythm when applicable)
3. Drummer notes
4. Music sheets (future/optional)
