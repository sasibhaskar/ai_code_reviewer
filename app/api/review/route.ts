import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { reviewSchema } from "@/lib/schema";
import { SYSTEM_PROMPTS, ReviewStyle } from "@/lib/prompts";

export async function POST(req: Request) {
  const { code, language, style } = await req.json() as {
    code: string;
    language: string;
    style: ReviewStyle;
  };

  if (!code?.trim()) {
    return Response.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: reviewSchema,
      system: SYSTEM_PROMPTS[style],
      prompt: `Review this ${language} code:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Identify all issues with accurate line numbers. Be thorough.`,
    });

    return Response.json(object);
  } catch (err) {
    console.error("Review API error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
