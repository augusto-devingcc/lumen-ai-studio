import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { chatTools } from "@/lib/agents/tools";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You are Lumen's creative copilot, embedded in an AI media studio with three surfaces: Studio (generation), Flows (node graphs), and Chat (you).

You can create media by calling tools:
- generate_image — still images
- generate_video — short clips
- generate_audio — text-to-speech
- create_flow — build a node pipeline on the Flows canvas (a prompt feeding ordered steps)

When the user asks for media, call the matching tool with a vivid, improved prompt (add style, lighting, mood — don't just echo the user). Results are saved to the user's Studio gallery and shown inline in the chat, so after a tool runs, briefly say what you made in one sentence. You may chain generate_* tools. When the user asks to build/set up a "flow", "pipeline", or "workflow", use create_flow with the steps they describe. For anything not about media, answer helpfully and concisely.`;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          "ANTHROPIC_API_KEY is not set. Add it to .env.local to enable Chat. (Studio still works in mock mode.)",
      },
      { status: 503 },
    );
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    tools: chatTools,
  });

  return result.toUIMessageStreamResponse();
}
