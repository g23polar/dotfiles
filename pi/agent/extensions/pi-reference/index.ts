import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

/**
 * pi-reference
 *
 * Keeps ~/.pi/agent/AGENTS.md current by regenerating the auto-populated
 * sections (prompts / skills / chains / extensions) between the markers
 *   <!-- pi-ref:auto-start --> ... <!-- pi-ref:auto-end -->
 * on every session start.
 *
 * Also registers `/pi-ref` for the user to print the file inline.
 */

const HOME = os.homedir();
const GLOBAL_DIR = path.join(HOME, ".pi", "agent");
const AGENTS_PATH = path.join(GLOBAL_DIR, "AGENTS.md");
const START_MARK = "<!-- pi-ref:auto-start -->";
const END_MARK = "<!-- pi-ref:auto-end -->";

type Entry = {
  name: string;
  description: string;
  scope: "global" | "project";
  source: string; // path relative to home for display
};

function rel(p: string): string {
  return p.startsWith(HOME) ? "~" + p.slice(HOME.length) : p;
}

function readFrontmatter(file: string): Record<string, string> {
  let text: string;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return {};
  }
  if (!text.startsWith("---")) return {};
  const end = text.indexOf("\n---", 3);
  if (end < 0) return {};
  const block = text.slice(3, end).trim();
  const out: Record<string, string> = {};
  for (const raw of block.split("\n")) {
    const m = raw.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

function firstHeading(file: string): string {
  try {
    const text = fs.readFileSync(file, "utf8");
    const m = text.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : "";
  } catch {
    return "";
  }
}

function listDirSafe(dir: string): fs.Dirent[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

// --- collectors ---

function collectPrompts(dir: string, scope: "global" | "project"): Entry[] {
  const out: Entry[] = [];
  for (const e of listDirSafe(dir)) {
    if (!e.isFile() || !e.name.endsWith(".md")) continue;
    const full = path.join(dir, e.name);
    const fm = readFrontmatter(full);
    const name = e.name.replace(/\.md$/, "");
    out.push({
      name,
      description: fm.description || firstHeading(full) || "(no description)",
      scope,
      source: rel(full),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function collectSkills(dir: string, scope: "global" | "project"): Entry[] {
  const out: Entry[] = [];
  for (const e of listDirSafe(dir)) {
    if (!e.isDirectory()) continue;
    const skillFile = path.join(dir, e.name, "SKILL.md");
    if (!fs.existsSync(skillFile)) continue;
    const fm = readFrontmatter(skillFile);
    out.push({
      name: fm.name || e.name,
      description: fm.description || "(no description)",
      scope,
      source: rel(skillFile),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function collectChains(dir: string, scope: "global" | "project"): Entry[] {
  const out: Entry[] = [];
  for (const e of listDirSafe(dir)) {
    if (!e.isFile() || !e.name.endsWith(".chain.md")) continue;
    const full = path.join(dir, e.name);
    const fm = readFrontmatter(full);
    const name = fm.name || e.name.replace(/\.chain\.md$/, "");
    out.push({
      name,
      description: fm.description || firstHeading(full) || "(no description)",
      scope,
      source: rel(full),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function collectExtensions(dir: string, scope: "global" | "project"): Entry[] {
  const out: Entry[] = [];
  for (const e of listDirSafe(dir)) {
    let full: string;
    let displayName = e.name;
    if (e.isFile() && e.name.endsWith(".ts")) {
      full = path.join(dir, e.name);
      displayName = e.name.replace(/\.ts$/, "");
    } else if (e.isDirectory()) {
      const idx = path.join(dir, e.name, "index.ts");
      if (!fs.existsSync(idx)) continue;
      full = idx;
    } else {
      continue;
    }
    // Try to grab a top-of-file JSDoc-style description.
    let desc = "";
    try {
      const text = fs.readFileSync(full, "utf8").slice(0, 800);
      const m = text.match(/\/\*\*([\s\S]*?)\*\//);
      if (m) {
        const lines = m[1]
          .split("\n")
          .map((l) => l.replace(/^\s*\*\s?/, "").trim())
          .filter(Boolean);
        // Prefer the first non-name line as description.
        if (lines.length >= 2) desc = lines.slice(1).join(" ");
        else desc = lines[0] || "";
        // Trim to a single sentence-ish chunk.
        if (desc.length > 220) desc = desc.slice(0, 217) + "...";
      }
    } catch {}
    out.push({
      name: displayName,
      description: desc || "(see source)",
      scope,
      source: rel(full),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

// --- rendering ---

function renderTable(
  heading: string,
  invokeHint: string,
  entries: Entry[],
  emptyHint: string,
): string {
  if (entries.length === 0) {
    return `## ${heading}\n\n_${emptyHint}_\n`;
  }
  const lines: string[] = [];
  lines.push(`## ${heading}`);
  lines.push("");
  lines.push(`_${invokeHint}_`);
  lines.push("");
  lines.push("| Name | Scope | What it does | Source |");
  lines.push("|---|---|---|---|");
  for (const e of entries) {
    const desc = e.description.replace(/\|/g, "\\|").replace(/\n+/g, " ");
    lines.push(`| \`${e.name}\` | ${e.scope} | ${desc} | \`${e.source}\` |`);
  }
  lines.push("");
  return lines.join("\n");
}

function buildAutoSection(cwd: string): string {
  const projectDir = path.join(cwd, ".pi");

  const prompts = [
    ...collectPrompts(path.join(GLOBAL_DIR, "prompts"), "global"),
    ...collectPrompts(path.join(projectDir, "prompts"), "project"),
  ];
  const skills = [
    ...collectSkills(path.join(GLOBAL_DIR, "skills"), "global"),
    ...collectSkills(path.join(projectDir, "skills"), "project"),
  ];
  const chains = [
    ...collectChains(path.join(GLOBAL_DIR, "chains"), "global"),
    ...collectChains(path.join(projectDir, "chains"), "project"),
  ];
  const extensions = [
    ...collectExtensions(path.join(GLOBAL_DIR, "extensions"), "global"),
    ...collectExtensions(path.join(projectDir, "extensions"), "project"),
  ];

  const parts: string[] = [];
  parts.push(START_MARK);
  parts.push(
    "<!-- This section is regenerated by the pi-reference extension on session_start. Do not hand-edit. -->",
  );
  parts.push("");
  parts.push(
    renderTable(
      "Your prompt templates",
      "Invoke with `/<name>`. Files live in `~/.pi/agent/prompts/` or `<project>/.pi/prompts/`.",
      prompts,
      "No prompt templates installed. Drop a `name.md` with frontmatter `description:` into `~/.pi/agent/prompts/`.",
    ),
  );
  parts.push(
    renderTable(
      "Your skills",
      "Invoke with `/skill:<name>`, or let the model load them automatically.",
      skills,
      "No skills installed.",
    ),
  );
  parts.push(
    renderTable(
      "Your chains",
      "Multi-step prompt chains. Invoke like a prompt template.",
      chains,
      "No chains installed.",
    ),
  );
  parts.push(
    renderTable(
      "Your extensions",
      "TypeScript extensions auto-loaded by pi. Each may register tools, commands, and hooks of its own.",
      extensions,
      "No extensions installed.",
    ),
  );
  parts.push(END_MARK);
  return parts.join("\n");
}

function regenerate(cwd: string): { changed: boolean; reason?: string } {
  let current: string;
  try {
    current = fs.readFileSync(AGENTS_PATH, "utf8");
  } catch {
    return { changed: false, reason: "AGENTS.md missing" };
  }
  const startIdx = current.indexOf(START_MARK);
  const endIdx = current.indexOf(END_MARK);
  if (startIdx < 0 || endIdx < 0 || endIdx < startIdx) {
    return { changed: false, reason: "markers missing" };
  }
  const before = current.slice(0, startIdx);
  const after = current.slice(endIdx + END_MARK.length);
  const next = before + buildAutoSection(cwd) + after;
  if (next === current) return { changed: false };
  fs.writeFileSync(AGENTS_PATH, next, "utf8");
  return { changed: true };
}

// --- extension entry ---

export default function (pi: ExtensionAPI) {
  const refresh = (cwd: string, ui?: { notify: (m: string, l?: string) => void }) => {
    try {
      const r = regenerate(cwd);
      if (r.reason && ui) ui.notify(`pi-reference: ${r.reason}`, "warning");
    } catch (err) {
      if (ui) ui.notify(`pi-reference: ${(err as Error).message}`, "error");
    }
  };

  pi.on("session_start", async (_event, ctx) => {
    refresh(ctx.cwd, ctx.ui);
  });

  pi.on("resources_discover", async (event, _ctx) => {
    // Reload path runs through here too, so we catch /reload.
    refresh(event.cwd);
    return {};
  });

  pi.registerCommand("pi-ref", {
    description: "Print or refresh the pi quick-reference (~/.pi/agent/AGENTS.md).",
    handler: async (args, ctx) => {
      const sub = (args || "").trim();
      if (sub === "refresh") {
        const r = regenerate(ctx.cwd);
        ctx.ui.notify(
          r.changed
            ? "pi-reference: AGENTS.md regenerated"
            : `pi-reference: no change${r.reason ? ` (${r.reason})` : ""}`,
          "info",
        );
        return;
      }
      if (sub === "path") {
        ctx.ui.notify(AGENTS_PATH, "info");
        return;
      }
      // Default: ask the model to surface the reference to the user.
      pi.sendUserMessage(
        `Show me the contents of ${AGENTS_PATH} (the pi quick-reference). Render the "I want to..." table and the lists of installed prompts, skills, chains, and extensions. Keep it concise — do not paste the entire file verbatim unless I ask.`,
        { deliverAs: "followUp" },
      );
    },
    getArgumentCompletions: (prefix: string) => {
      const items = [
        { value: "refresh", label: "refresh — regenerate the auto sections now" },
        { value: "path", label: "path — print the AGENTS.md path" },
      ];
      const filtered = items.filter((i) => i.value.startsWith(prefix));
      return filtered.length > 0 ? filtered : null;
    },
  });
}
