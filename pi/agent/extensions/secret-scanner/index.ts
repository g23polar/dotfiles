import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// Paths whose contents are intentionally secret stores managed by tooling.
// Skipped during recursive scans so we don't yell about credentials sitting
// in their correct, locked-down home.
const HOME = os.homedir();
const PATH_ALLOWLIST = new Set([
  path.join(HOME, ".pi", "agent", "auth.json"),
  path.join(HOME, ".aws", "credentials"),
  path.join(HOME, ".aws", "config"),
  path.join(HOME, ".config", "gh", "hosts.yml"),
  path.join(HOME, ".docker", "config.json"),
  path.join(HOME, ".npmrc"),
  path.join(HOME, ".pypirc"),
  path.join(HOME, ".netrc"),
]);
const DIR_ALLOWLIST_PREFIXES = [
  path.join(HOME, ".pi", "agent", "sessions"), // session JSONLs can quote tokens user pasted
  path.join(HOME, ".ssh"),
  path.join(HOME, ".gnupg"),
  path.join(HOME, ".password-store"),
];
function isAllowlistedPath(p: string): boolean {
  if (PATH_ALLOWLIST.has(p)) return true;
  return DIR_ALLOWLIST_PREFIXES.some((d) => p === d || p.startsWith(d + path.sep));
}

/**
 * secret-scanner
 *
 * Blocks the agent from writing API keys / credentials to disk or pasting them
 * into bash commands. Works across file types — detection is content-based.
 *
 * Hooks:
 *  - tool_call(write)  : scans `content` before file is created/overwritten
 *  - tool_call(edit)   : scans each `edits[].newText` before applying
 *  - tool_call(bash)   : scans the command string for inline secrets
 *
 * In interactive mode the user is prompted to allow or block.
 * In non-interactive modes the call is blocked outright.
 *
 * Adds:
 *  - /scan-secrets [path]  — recursive scan of the project (or given path)
 *  - tool `scan_secrets`   — same, callable by the model
 *
 * Detection is pattern-based, with a small allowlist for obvious test/dummy
 * values to keep noise down. Tune patterns at the top of the file.
 */

type Rule = {
  id: string;
  label: string;
  re: RegExp;
  // Optional secondary check: return false to discard a match.
  validate?: (match: string) => boolean;
};

const RULES: Rule[] = [
  { id: "aws-access-key",    label: "AWS access key ID",     re: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: "aws-secret",        label: "AWS secret access key", re: /aws(.{0,20})?(secret|access)[_-]?key[\"'\s:=]+([A-Za-z0-9/+=]{40})\b/gi },
  { id: "github-pat",        label: "GitHub token",          re: /\bgh[pousr]_[A-Za-z0-9]{36,255}\b/g },
  { id: "github-fine",       label: "GitHub fine-grained PAT", re: /\bgithub_pat_[A-Za-z0-9_]{82}\b/g },
  { id: "openai",            label: "OpenAI API key",        re: /\bsk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,}\b/g },
  { id: "anthropic",         label: "Anthropic API key",     re: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/g },
  { id: "google-api",        label: "Google API key",        re: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: "gcp-oauth",         label: "GCP OAuth client secret", re: /\bGOCSPX-[A-Za-z0-9_-]{28,}\b/g },
  { id: "slack-token",       label: "Slack token",           re: /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/g },
  { id: "slack-webhook",     label: "Slack webhook",         re: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/g },
  { id: "stripe-live",       label: "Stripe live key",       re: /\b(?:sk|rk)_live_[A-Za-z0-9]{20,}\b/g },
  { id: "stripe-test",       label: "Stripe test key",       re: /\b(?:sk|rk)_test_[A-Za-z0-9]{20,}\b/g },
  { id: "twilio",            label: "Twilio account SID",    re: /\bAC[a-f0-9]{32}\b/g },
  { id: "sendgrid",          label: "SendGrid API key",      re: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/g },
  { id: "mailgun",           label: "Mailgun key",           re: /\bkey-[a-f0-9]{32}\b/g },
  { id: "heroku",            label: "Heroku API key (UUID-like)", re: /heroku.{0,20}[\"'\s:=]+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\b/gi },
  { id: "npm-token",         label: "npm token",             re: /\bnpm_[A-Za-z0-9]{36}\b/g },
  { id: "pypi-token",        label: "PyPI token",            re: /\bpypi-AgEIcHlwaS5vcmc[A-Za-z0-9_-]+/g },
  { id: "vercel",            label: "Vercel token (likely)", re: /\bvercel_[A-Za-z0-9]{24}\b/g },
  { id: "supabase-jwt",      label: "Supabase service role JWT", re: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    validate: (m) => m.length > 100 },
  { id: "private-key",       label: "PEM private key",
    re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g },
  // Generic high-signal: assignment-looking secrets. Lower priority — last.
  { id: "generic-secret",    label: "Generic *_KEY/SECRET/TOKEN/PASSWORD assignment",
    re: /\b(?:api[_-]?key|secret|token|password|passwd|pwd|access[_-]?key|auth[_-]?token|client[_-]?secret)\s*[:=]\s*[\"']([^\"'\s]{16,})[\"']/gi,
    validate: (m) => {
      const v = m.toLowerCase();
      // Reject very obvious placeholders
      const placeholders = ["xxxx", "your_", "example", "changeme", "placeholder", "todo", "fixme", "dummy", "fake", "sample", "<", "{{", "${"];
      return !placeholders.some((p) => v.includes(p));
    },
  },
];

const ALLOWED_LITERAL_HINTS = [
  // common stub values shown in docs and tests
  "AKIAIOSFODNN7EXAMPLE",
  "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "sk-test-",
  "sk-proj-EXAMPLE",
  "GOCSPX-EXAMPLE",
];

type Finding = {
  ruleId: string;
  label: string;
  snippet: string; // redacted preview
  line?: number;
  file?: string;
};

function redact(s: string): string {
  if (s.length <= 10) return "*".repeat(s.length);
  return s.slice(0, 4) + "…" + s.slice(-4) + ` (len=${s.length})`;
}

function scanText(text: string, file?: string): Finding[] {
  const out: Finding[] = [];
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.re.exec(text)) !== null) {
      const raw = m[0];
      if (rule.validate && !rule.validate(raw)) continue;
      if (ALLOWED_LITERAL_HINTS.some((h) => raw.includes(h))) continue;
      const lineNo = text.slice(0, m.index).split("\n").length;
      out.push({
        ruleId: rule.id,
        label: rule.label,
        snippet: redact(raw),
        line: lineNo,
        file,
      });
      // Cap per-rule to avoid runaway on huge files
      if (out.filter((f) => f.ruleId === rule.id).length >= 20) break;
    }
  }
  return out;
}

function summarizeFindings(findings: Finding[]): string {
  if (findings.length === 0) return "No secrets detected.";
  const byRule = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!byRule.has(f.ruleId)) byRule.set(f.ruleId, []);
    byRule.get(f.ruleId)!.push(f);
  }
  const lines: string[] = [];
  for (const [ruleId, fs_] of byRule) {
    lines.push(`  • ${fs_[0].label} (${ruleId}) — ${fs_.length} match${fs_.length > 1 ? "es" : ""}`);
    for (const f of fs_.slice(0, 5)) {
      const loc = f.file ? `${f.file}:${f.line ?? "?"}` : `line ${f.line ?? "?"}`;
      lines.push(`      ${loc}  ${f.snippet}`);
    }
    if (fs_.length > 5) lines.push(`      … and ${fs_.length - 5} more`);
  }
  return lines.join("\n");
}

// --- recursive file scan ---

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "out", "target",
  ".next", ".turbo", ".cache", ".venv", "venv", "__pycache__",
  ".pi", ".idea", ".vscode", "coverage", ".nyc_output",
]);
const SKIP_EXTS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".pdf",
  ".zip", ".tar", ".gz", ".tgz", ".bz2", ".xz", ".7z",
  ".mp3", ".mp4", ".mov", ".avi", ".wav", ".flac",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".so", ".dylib", ".dll", ".a", ".o", ".class", ".jar",
  ".wasm", ".bin", ".lock",
]);
const MAX_FILE_BYTES = 1_000_000; // 1 MB

function scanPath(target: string): Finding[] {
  const out: Finding[] = [];
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    out.push(...scanOneFile(target));
    return out;
  }
  const walk = (dir: string) => {
    if (DIR_ALLOWLIST_PREFIXES.some((d) => dir === d || dir.startsWith(d + path.sep))) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (SKIP_DIRS.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) out.push(...scanOneFile(p));
    }
  };
  walk(target);
  return out;
}

function scanOneFile(p: string): Finding[] {
  if (isAllowlistedPath(p)) return [];
  const ext = path.extname(p).toLowerCase();
  if (SKIP_EXTS.has(ext)) return [];
  let stat: fs.Stats;
  try {
    stat = fs.statSync(p);
  } catch {
    return [];
  }
  if (stat.size > MAX_FILE_BYTES) return [];
  let text: string;
  try {
    text = fs.readFileSync(p, "utf8");
  } catch {
    return [];
  }
  // Cheap binary sniff
  if (text.includes("\u0000")) return [];
  return scanText(text, p);
}

// --- extension entry ---

export default function (pi: ExtensionAPI) {
  const confirmOrBlock = async (
    ctx: any,
    where: string,
    findings: Finding[],
  ): Promise<{ block: true; reason: string } | undefined> => {
    const summary = summarizeFindings(findings);
    if (!ctx.hasUI) {
      return { block: true, reason: `secret-scanner: blocked ${where}\n${summary}` };
    }
    ctx.ui.notify(`secret-scanner: ${findings.length} potential secret(s) in ${where}`, "warning");
    const ok = await ctx.ui.confirm(
      "Possible secret detected",
      `secret-scanner found likely credentials in ${where}:\n\n${summary}\n\nAllow anyway?`,
    );
    if (!ok) return { block: true, reason: `secret-scanner: blocked by user (${where})\n${summary}` };
    return undefined;
  };

  pi.on("tool_call", async (event, ctx) => {
    if (isToolCallEventType("write", event)) {
      const content = (event.input as any).content ?? "";
      const target = (event.input as any).path ?? "<write>";
      const findings = scanText(String(content), target);
      if (findings.length > 0) return confirmOrBlock(ctx, `write ${target}`, findings);
      return;
    }

    if (isToolCallEventType("edit", event)) {
      const target = (event.input as any).path ?? "<edit>";
      const edits = (event.input as any).edits ?? [];
      const all: Finding[] = [];
      for (const ed of edits) {
        all.push(...scanText(String(ed?.newText ?? ""), target));
      }
      if (all.length > 0) return confirmOrBlock(ctx, `edit ${target}`, all);
      return;
    }

    if (isToolCallEventType("bash", event)) {
      const cmd = String((event.input as any).command ?? "");
      const findings = scanText(cmd, "<bash command>");
      if (findings.length > 0) return confirmOrBlock(ctx, "bash command", findings);
      return;
    }
  });

  // Manual command for ad-hoc scans.
  pi.registerCommand("scan-secrets", {
    description: "Scan the project (or a given path) for likely API keys / credentials.",
    handler: async (args, ctx) => {
      const target = (args || "").trim() || ctx.cwd;
      const abs = path.isAbsolute(target) ? target : path.join(ctx.cwd, target);
      if (!fs.existsSync(abs)) {
        ctx.ui.notify(`secret-scanner: no such path ${abs}`, "error");
        return;
      }
      ctx.ui.notify(`secret-scanner: scanning ${abs}…`, "info");
      const findings = scanPath(abs);
      if (findings.length === 0) {
        ctx.ui.notify("secret-scanner: clean — no secrets detected.", "info");
        return;
      }
      const summary = summarizeFindings(findings);
      ctx.ui.notify(`secret-scanner: ${findings.length} potential secret(s)`, "warning");
      // Surface details to the model so it can help the user remediate.
      pi.sendUserMessage(
        `secret-scanner found potential credentials. Review and help remediate (move to env vars, add to .gitignore, rotate if leaked).\n\n${summary}`,
        { deliverAs: "followUp" },
      );
    },
  });

  // Tool the model can call.
  pi.registerTool({
    name: "scan_secrets",
    label: "Scan for secrets",
    description:
      "Recursively scan a path for likely API keys, tokens, and credentials. Returns a redacted summary of findings.",
    promptSnippet:
      "Scan for leaked API keys / credentials in files. Use before commits or when auditing a repo.",
    parameters: Type.Object({
      path: Type.Optional(
        Type.String({ description: "Path to scan. Defaults to current working directory." }),
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const target = params.path?.trim() || ctx.cwd;
      const abs = path.isAbsolute(target) ? target : path.join(ctx.cwd, target);
      if (!fs.existsSync(abs)) {
        return {
          content: [{ type: "text", text: `No such path: ${abs}` }],
          isError: true,
          details: {},
        };
      }
      const findings = scanPath(abs);
      const text =
        findings.length === 0
          ? `No secrets detected in ${abs}.`
          : `Found ${findings.length} potential secret(s) in ${abs}:\n${summarizeFindings(findings)}`;
      return {
        content: [{ type: "text", text }],
        details: { count: findings.length, target: abs },
      };
    },
  });
}
