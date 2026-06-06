import { z } from "zod";

// This schema GUARANTEES the AI always returns this exact shape.
// generateObject will retry internally if the model output doesn't match.
export const reviewSchema = z.object({
  issues: z.array(
    z.object({
      line: z.number().describe("The line number where the issue occurs"),
      severity: z
        .enum(["critical", "warning", "info"])
        .describe("critical = security/crash bugs, warning = bad practice, info = style"),
      description: z.string().describe("Clear explanation of what the issue is and why it matters"),
    })
  ),
  suggestions: z.array(z.string()).describe("General improvement suggestions not tied to a specific line"),
  score: z.number().min(1).max(10).describe("Overall code quality score from 1-10"),
  refactored_code: z.string().describe("The fully rewritten, improved version of the code"),
});

// TypeScript type inferred from the schema — use this everywhere in your app
export type ReviewResult = z.infer<typeof reviewSchema>;

// Schema for a targeted single-issue fix
export const fixSchema = z.object({
  fixed_code: z.string().describe("The corrected code snippet for this specific issue"),
  explanation: z.string().describe("One sentence explaining what was changed and why"),
});

export type FixResult = z.infer<typeof fixSchema>;
