# AI Code Reviewer

An AI-powered code review tool. Paste your code, get a score, issues with line numbers, fix suggestions, and a refactored version — all powered by GPT-4o-mini.

## Features

- Supports JavaScript, TypeScript, Python, Java, Go, Rust, C++, Ruby
- Two review modes: **Mentor** (friendly) and **Strict** (no-mercy)
- Issues tagged as `CRITICAL`, `WARNING`, or `INFO` with exact line numbers
- One-click AI fix for individual issues
- Suggestions tab and full refactored code tab
- Score out of 10

## Stack

- [Next.js](https://nextjs.org) · [Tailwind CSS](https://tailwindcss.com) · [Vercel AI SDK](https://sdk.vercel.ai) · [OpenAI GPT-4o-mini](https://platform.openai.com)

## Getting Started

```bash
git clone <repo-url>
cd ai_code_reviewer
npm install
```

Create `.env.local`:

```
OPENAI_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Troubleshooting

If you get a Turbopack error on startup, delete `.next` and `package-lock.json`, then re-run `npm run dev`.
