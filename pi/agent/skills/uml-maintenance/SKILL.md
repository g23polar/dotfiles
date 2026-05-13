---
name: uml-maintenance
description: Canonical specification for the project's UML.md file. Every project pi works on keeps a single UML.md at the repo root that captures the current architecture as Mermaid diagrams plus a Last Activity log. Load this skill when creating or updating UML.md.
---

# UML.md Maintenance

`UML.md` is the persistent architectural memory for a project. It lives at the
repo root and is the first thing pi reads when re-entering an existing project.
Keep it small, accurate, and current.

Alongside `UML.md`, always maintain a companion `UML.html` — a self-contained
file that loads **Mermaid JS** from CDN and renders every diagram in the browser.
The `.md` is for agent reading; the `.html` is for humans to view.

---

## UML.md — file structure

A valid `UML.md` has exactly these sections in this order:

```markdown
# UML — <project name>

_Last updated: <ISO-8601 timestamp> — <one-line summary of last change>_

## Overview
1–3 sentences. What this project is, what problem it solves, the dominant
architectural style (e.g. "TypeScript CLI, plugin-based, single-process").

## Module map
A short bullet list of top-level modules / packages and their responsibility.
- `src/foo/` — does X
- `src/bar/` — does Y

## Class / component diagram
A Mermaid `classDiagram` (for OO code) or `flowchart`/`graph` (for service or
data-flow oriented code). Prefer one diagram. Split into a second diagram only
if the first becomes unreadable (> ~25 nodes).

```mermaid
classDiagram
  class Foo {
    +bar(): Baz
  }
  Foo --> Baz
` ``

## Key data flows
Optional. 2–5 bullets describing the most important runtime flows
("user prompt → router → tool dispatch → result render").

## Last activity
A reverse-chronological log, newest first, of meaningful work performed in this
project across pi sessions. Cap at the most recent 10 entries; drop older ones.
Each entry:

- `YYYY-MM-DD HH:MM` — one-line summary. Files touched: `a.ts`, `b.ts`.
```

---

## UML.html — Mermaid JS viewer

Every time you write or update `UML.md`, also write `UML.html` with the
following structure. It must be fully self-contained (no local deps beyond CDN).

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>UML — <project name></title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  </script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; color: #222; }
    h1 { border-bottom: 2px solid #ddd; padding-bottom: .4rem; }
    h2 { margin-top: 2rem; color: #444; }
    .meta { color: #888; font-size: .9rem; margin-top: -.5rem; margin-bottom: 1.5rem; }
    .mermaid { background: #f8f8f8; border-radius: 8px; padding: 1rem; }
    ul { line-height: 1.8; }
    code { background: #f0f0f0; padding: .1em .3em; border-radius: 3px; font-size: .9em; }
  </style>
</head>
<body>

<h1>UML — <project name></h1>
<p class="meta">Last updated: <ISO-8601 timestamp> — <one-line summary></p>

<h2>Overview</h2>
<p><!-- paste overview text --></p>

<h2>Module map</h2>
<ul>
  <!-- <li><code>src/foo/</code> — does X</li> -->
</ul>

<h2>Class / Component Diagram</h2>
<div class="mermaid">
<!-- paste raw Mermaid diagram source here, no code fences -->
classDiagram
  class Foo {
    +bar(): Baz
  }
  Foo --> Baz
</div>

<!-- Add more <div class="mermaid"> blocks for additional diagrams -->

<h2>Key Data Flows</h2>
<ul>
  <!-- <li>user prompt → router → tool dispatch → result render</li> -->
</ul>

<h2>Last Activity</h2>
<ul>
  <!-- newest first -->
</ul>

</body>
</html>
```

### Rules for UML.html

- Copy the **raw Mermaid source** (no backtick fences) into each `<div class="mermaid">` block.
- Keep the HTML in sync with `UML.md` — same diagrams, same last-activity log.
- Do not inline large blobs of JSON or minified JS; keep the file readable.
- The file must open correctly with `open UML.html` (i.e. no build step required).

---

## Update rules

1. **Read before write.** Always read the current `UML.md` (if any) before
   editing so you preserve hand-edited notes.
2. **Update the timestamp + one-line summary** on every change to both files.
3. **Update the diagram** only when classes / modules / relationships actually
   changed. Cosmetic code changes do not require diagram edits.
4. **Always append to "Last activity"** when finishing a unit of work. Keep
   the entry to one line. Trim the list to 10 entries.
5. **Keep it short.** `UML.md` is a map, not the territory. Aim for < 200 lines.
6. **Mermaid only.** Do not use PlantUML or ASCII art.

## When to create it

If `UML.md` does not exist in a project that already contains source code:
generate a first version by surveying the repo (entry points, top-level
directories, exported types) and producing the sections above. Mark the "Last
activity" log with a single entry: "initial UML generated by pi".
Generate `UML.html` at the same time.
