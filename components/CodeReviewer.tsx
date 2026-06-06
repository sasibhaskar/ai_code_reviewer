"use client";

import { useState } from "react";
import { ReviewResult, FixResult } from "@/lib/schema";
import { ReviewStyle } from "@/lib/prompts";

const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "C++", "Ruby"];

const SEVERITY_STYLES = {
  critical: { badge: "#dc2626", label: "CRITICAL" },
  warning:  { badge: "#d97706", label: "WARNING"  },
  info:     { badge: "#3b82f6", label: "INFO"      },
} as const;

function scoreColor(score: number) {
  if (score >= 8) return "#16a34a";
  if (score >= 5) return "#d97706";
  return "#dc2626";
}

export default function CodeReviewer() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [style, setStyle] = useState<ReviewStyle>("friendly");
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fixes, setFixes] = useState<Record<number, FixResult>>({});
  const [fixLoading, setFixLoading] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<"issues" | "suggestions" | "refactored">("issues");

  // ─── Call your API route (not Anthropic directly) ───────────────────────────
  async function runReview() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setReview(null);
    setFixes({});

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The API route handles schema enforcement — you just send plain data
        body: JSON.stringify({ code, language, style }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      // Response is already validated by Zod on the server — safe to cast
      const data: ReviewResult = await res.json();
      setReview(data);
      setActiveTab("issues");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function fixIssue(issue: ReviewResult["issues"][0], idx: number) {
    setFixLoading((f) => ({ ...f, [idx]: true }));
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, issue }),
      });
      const data: FixResult = await res.json();
      setFixes((f) => ({ ...f, [idx]: data }));
    } catch (e) {
      console.error("Fix error:", e);
    } finally {
      setFixLoading((f) => ({ ...f, [idx]: false }));
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3] font-mono text-sm">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 h-13 bg-[#161b22] border-b border-[#30363d]">
        <span className="text-[#8b949e]">code-reviewer</span>
        <span className="text-[#58a6ff]">review.ai</span>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-[#8b949e] uppercase tracking-wider">Style</span>
          <div className="flex border border-[#30363d] rounded overflow-hidden">
            {(["friendly", "strict"] as ReviewStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-3 py-1 text-xs transition-colors ${
                  style === s
                    ? s === "friendly" ? "bg-blue-700 text-white" : "bg-red-700 text-white"
                    : "text-[#8b949e] hover:text-[#e6edf3]"
                }`}
              >
                {s === "friendly" ? "🤝 Mentor" : "⚡ Strict"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel: code input ── */}
        <div className="w-1/2 flex flex-col border-r border-[#30363d]">
          <div className="flex items-center gap-3 px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-xs px-2 py-1 rounded"
            >
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
            <span className="text-xs text-[#8b949e] ml-auto">{code.split("\n").length} lines</span>
            <button
              onClick={runReview}
              disabled={loading || !code.trim()}
              className="bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] disabled:text-[#8b949e]
                         text-white px-4 py-1 rounded text-xs transition-colors"
            >
              {loading ? "Analyzing..." : "▶ Run Review"}
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={"// Paste your code here..."}
            className="flex-1 bg-[#0d1117] text-[#e6edf3] p-4 resize-none outline-none font-mono text-xs leading-6"
            spellCheck={false}
          />
        </div>

        {/* ── Right panel: review results ── */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          {!review && !loading && (
            <div className="flex-1 flex items-center justify-center text-[#484f58]">
              Paste code and click ▶ Run Review
            </div>
          )}

          {loading && (
            <div className="flex-1 flex items-center justify-center text-[#8b949e]">
              {style === "friendly" ? "🤝 Mentor is reviewing..." : "⚡ Senior dev is judging..."}
            </div>
          )}

          {error && (
            <div className="m-4 bg-red-950 border border-red-800 rounded p-3 text-red-400 text-xs">{error}</div>
          )}

          {review && (
            <>
              {/* Score bar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
                <span className="text-3xl font-bold" style={{ color: scoreColor(review.score) }}>
                  {review.score}
                </span>
                <span className="text-[#8b949e] text-xs">/10</span>
                <span className="text-xs text-[#8b949e]">·</span>
                <span className="text-xs text-[#8b949e]">{review.issues.length} issues</span>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#161b22] border-b border-[#30363d]">
                {(["issues", "suggestions", "refactored"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs border-b-2 transition-colors capitalize ${
                      activeTab === tab
                        ? "border-blue-400 text-[#e6edf3]"
                        : "border-transparent text-[#8b949e] hover:text-[#e6edf3]"
                    }`}
                  >
                    {tab}
                    {tab === "issues" && (
                      <span className="ml-1 text-[10px] bg-[#21262d] px-1.5 py-0.5 rounded-full">
                        {review.issues.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeTab === "issues" && review.issues.map((issue, i) => {
                  const cfg = SEVERITY_STYLES[issue.severity];
                  return (
                    <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                      <div className="flex gap-2 items-start p-3">
                        <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded"
                          style={{ background: cfg.badge }}>
                          {cfg.label}
                        </span>
                        <span className="text-[10px] bg-[#21262d] text-[#8b949e] px-1.5 py-0.5 rounded">
                          L{issue.line}
                        </span>
                        <span className="text-xs text-[#e6edf3] leading-relaxed">{issue.description}</span>
                      </div>

                      {fixes[i] ? (
                        <div className="border-t border-[#30363d] p-3 space-y-2">
                          <p className="text-xs text-green-400">✓ {fixes[i].explanation}</p>
                          <pre className="text-xs bg-[#0d1117] border border-[#30363d] rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">
                            {fixes[i].fixed_code}
                          </pre>
                        </div>
                      ) : (
                        <div className="border-t border-[#21262d] px-3 py-2">
                          <button
                            onClick={() => fixIssue(issue, i)}
                            disabled={fixLoading[i]}
                            className="text-blue-400 hover:text-blue-300 disabled:text-[#484f58] text-xs transition-colors"
                          >
                            {fixLoading[i] ? "Generating fix..." : "⚡ Fix This Issue"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {activeTab === "suggestions" && review.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3 bg-[#161b22] border border-[#30363d] rounded-lg p-3">
                    <span className="text-blue-400 text-xs mt-0.5">#{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-xs text-[#e6edf3] leading-relaxed">{s}</span>
                  </div>
                ))}

                {activeTab === "refactored" && (
                  <pre className="text-xs bg-[#161b22] border border-[#30363d] rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all leading-6">
                    {review.refactored_code}
                  </pre>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
