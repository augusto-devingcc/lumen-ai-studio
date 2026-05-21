import { createGateway, convertToModelMessages, streamText, type UIMessage } from "ai";
import { chatTools } from "@/lib/agents/tools";
import { chatModelById } from "@/lib/providers/models";

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
  const { messages, model: modelId } = (await req.json()) as {
    messages: UIMessage[];
    model?: string;
  };

  // BYOK: the user's Vercel AI Gateway key arrives per-request. No env keys.
  const apiKey = req.headers.get("x-ai-gateway-key")?.trim();
  if (!apiKey) {
    return Response.json(
      { error: "No AI Gateway key configured. Add your key in Settings to enable Chat." },
      { status: 503 },
    );
  }

  const gateway = createGateway({ apiKey });
  const slug = chatModelById(modelId).slug;

  const result = streamText({
    model: gateway(slug),
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    tools: chatTools,
  });

  return result.toUIMessageStreamResponse();
}
