import { tool } from "ai";
import { z } from "zod";

// Tool definitions for the Chat assistant. These are CLIENT-SIDE tools:
// they have no `execute`, so the client's `onToolCall` runs them by calling the
// shared Studio store. That keeps generated assets in one place (Studio history)
// and lets the chat show them inline.

const aspectRatio = z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]);

export const chatTools = {
  generate_image: tool({
    description:
      "Generate an image from a text prompt and add it to the Studio gallery. Use whenever the user wants a picture, art, illustration, or any still visual.",
    inputSchema: z.object({
      prompt: z.string().describe("A vivid, detailed description of the image to generate."),
      model: z
        .enum(["flux-schnell", "flux-dev", "sdxl"])
        .optional()
        .describe("Image model. Defaults to flux-schnell (fastest)."),
      aspectRatio: aspectRatio.optional().describe("Aspect ratio. Defaults to 1:1."),
    }),
  }),
  generate_video: tool({
    description:
      "Generate a short video from a text prompt and add it to the Studio gallery. Use when the user wants motion, a clip, or animation.",
    inputSchema: z.object({
      prompt: z.string().describe("Description of the video content and motion."),
      model: z.enum(["ltx-video", "kling-video"]).optional().describe("Video model."),
      aspectRatio: aspectRatio.optional().describe("Aspect ratio. Defaults to 16:9."),
    }),
  }),
  generate_audio: tool({
    description:
      "Generate spoken audio (text-to-speech) and add it to the Studio gallery. Use when the user wants narration, a voiceover, or speech.",
    inputSchema: z.object({
      text: z.string().describe("The exact text to speak aloud."),
    }),
  }),
  create_flow: tool({
    description:
      "Build a node graph on the Flows canvas: a prompt feeding an ordered chain of generation steps. Use when the user asks to set up, build, or design a flow / pipeline / workflow (e.g. 'a flow that makes an image then a video').",
    inputSchema: z.object({
      prompt: z.string().describe("The creative prompt that seeds the flow."),
      steps: z
        .array(z.enum(["image", "video", "audio"]))
        .min(1)
        .describe("Ordered generation steps after the prompt, e.g. ['image','video']."),
    }),
  }),
};

export type ChatToolName = keyof typeof chatTools;
