import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { fixSchema } from "@/lib/schema";

export async function POST(req: Request) {
  const { code, language, issue } = await req.json() as {
    code: string;
    language: string;
    issue: { line: number; severity: string; description: string };
  };

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: fixSchema,
    system: "You are a precise code fixer. Fix only the specific issue described. Keep all other code identical.",
    prompt: `Fix ONLY this issue in the code:

Issue (line ${issue.line}, ${issue.severity}): ${issue.description}

Original ${language} code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Return the corrected code and a one-sentence explanation.`,
  });

  return Response.json(object);
}
