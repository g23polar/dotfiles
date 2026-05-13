import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * uml-tracker
 *
 * - On session_start: classifies the cwd as one of:
 *     - "new"                — empty or near-empty directory
 *     - "existing-untracked" — has code but no UML.md
 *     - "existing-tracked"   — UML.md present
 * - On the first before_agent_start of the session: injects a system-prompt
 *   addendum that points the model at the appropriate skill and enforces
 *   UML.md upkeep. Injection is one-shot so it does not bloat later turns.
 * - Registers `/uml` to manually request a UML.md refresh.
 *
 * The extension itself never calls the LLM. All architectural reasoning,
 * questioning, and UML generation is done by the model, guided by the
 * skills in ~/.pi/agent/skills/.
 */

type ProjectState = "new" | "existing-untracked" | "existing-tracked";

const SOURCE_EXTS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".rb", ".go", ".rs", ".java", ".kt", ".swift",
  ".c", ".h", ".cc", ".cpp", ".hpp", ".cs",
  ".php", ".scala", ".clj", ".ex", ".exs", ".elm",
  ".lua", ".dart", ".zig", ".nim",
]);

const IGNORED_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "out", "target",
  ".next", ".turbo", ".cache", ".venv", "venv", "__pycache__",
  ".pi", ".idea", ".vscode",
]);

function countSourceFiles(dir: string, cap = 5): number {
  let n = 0;
  const walk = (d: string, depth: number) => {
    if (n >= cap || depth > 3) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (n >= cap) return;
      if (e.name.startsWith(".") && e.name !== ".") {
        if (IGNORED_DIRS.has(e.name)) continue;
      }
      if (IGNORED_DIRS.has(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        walk(p, depth + 1);
      } else if (e.isFile()) {
        if (SOURCE_EXTS.has(path.extname(e.name).toLowerCase())) n++;
      }
    }
  };
  walk(dir, 0);
  return n;
}

function hasGitHistory(dir: string): boolean {
  const head = path.join(dir, ".git", "HEAD");
  return fs.existsSync(head);
}

function classify(cwd: string): ProjectState {
  const umlPath = path.join(cwd, "UML.md");
  if (fs.existsSync(umlPath)) return "existing-tracked";

  const srcCount = countSourceFiles(cwd, 5);
  const hasGit = hasGitHistory(cwd);

  if (srcCount === 0 && !hasGit) return "new";
  if (srcCount <= 2 && !hasGit) return "new";
  return "existing-untracked";
}

function buildAddendum(state: ProjectState, cwd: string): string {
  const umlPath = path.join(cwd, "UML.md");
  const common =
    "\n\n## Project tracking (uml-tracker)\n" +
    "This project is tracked by the uml-tracker extension. `UML.md` at the repo " +
    "root is the persistent architectural memory for this project. Follow the " +
    "`uml-maintenance` skill for its format. Before declaring any unit of work " +
    "done, update `UML.md`: refresh the diagram if structure changed, bump the " +
    "`Last updated` line, and prepend a one-line entry to `Last activity` with " +
    "today's date and files touched (trim the list to 10 entries).\n";

  switch (state) {
    case "new":
      return (
        common +
        "\n**Project state: NEW.** This directory looks empty or near-empty. " +
        "Do NOT start writing code yet. Load the `new-project-bootstrap` skill " +
        "and follow its four phases in order: architectural deep-dive Q&A → " +
        "plan → implement (walking skeleton) → review + write the initial " +
        "`UML.md`. Begin Phase 1 in your next message unless the user has " +
        "already given you concrete instructions.\n"
      );
    case "existing-untracked":
      return (
        common +
        "\n**Project state: EXISTING, no UML.md yet.** Code exists here but " +
        "the architectural log is missing. Before responding to the user's " +
        "actual request, do a fast pass: identify entry points, top-level " +
        "modules, and key types, then generate an initial `UML.md` at " +
        `\`${umlPath}\` per the \`uml-maintenance\` skill. Then proceed with ` +
        "the user's task and follow the `existing-project-resume` skill for " +
        "the resume brief.\n"
      );
    case "existing-tracked":
      return (
        common +
        "\n**Project state: EXISTING with UML.md.** Load the " +
        "`existing-project-resume` skill. Read `UML.md` end-to-end FIRST, " +
        "produce the 5-bullet resume brief (including the most recent Last " +
        "activity entry), and confirm with the user before touching code.\n"
      );
  }
}

export default function (pi: ExtensionAPI) {
  let stateForSession: ProjectState | null = null;
  let injected = false;

  pi.on("session_start", async (_event, ctx) => {
    stateForSession = classify(ctx.cwd);
    injected = false;
    const label =
      stateForSession === "new"
        ? "new project — bootstrap flow armed"
        : stateForSession === "existing-untracked"
          ? "existing project, no UML.md — will generate"
          : "existing project — UML.md found";
    ctx.ui.notify(`uml-tracker: ${label}`, "info");
    ctx.ui.setStatus("uml-tracker", `uml: ${stateForSession}`);
  });

  pi.on("before_agent_start", async (event, ctx) => {
    if (injected || !stateForSession) return;
    injected = true;
    const addendum = buildAddendum(stateForSession, ctx.cwd);
    return { systemPrompt: event.systemPrompt + addendum };
  });

  pi.registerCommand("uml", {
    description:
      "Regenerate or refresh UML.md for the current project (delegated to the model).",
    handler: async (args, ctx) => {
      const sub = (args || "").trim();
      const umlPath = path.join(ctx.cwd, "UML.md");
      const exists = fs.existsSync(umlPath);
      if (sub === "status") {
        ctx.ui.notify(
          `uml-tracker: state=${stateForSession ?? "?"}, UML.md=${exists ? "present" : "missing"}`,
          "info",
        );
        return;
      }
      const instruction = exists
        ? "Refresh UML.md to match the current state of the codebase. Follow the `uml-maintenance` skill. Update the diagram if structure changed, bump the timestamp + one-line summary, and prepend a new `Last activity` entry."
        : "Generate an initial UML.md for this project at the repo root, following the `uml-maintenance` skill. Survey entry points and top-level modules first.";
      pi.sendUserMessage(instruction, { deliverAs: "followUp" });
    },
    getArgumentCompletions: (prefix: string) => {
      const items = [{ value: "status", label: "status — show tracker state" }];
      const filtered = items.filter((i) => i.value.startsWith(prefix));
      return filtered.length > 0 ? filtered : null;
    },
  });
}
