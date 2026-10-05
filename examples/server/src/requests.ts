import type { IncomingMessage } from "node:http";
import { z } from "zod";
import { NETWORK_LATENCIES } from "examples/shared/courier/constants/networkLatencies";
import {
  ASSISTANT_ROLLOUTS,
  COMPOSER_ROLLOUTS,
} from "examples/shared/courier/constants/rollouts";

export const backendChange = z
  .object({
    composerRollout: z.enum(COMPOSER_ROLLOUTS).optional(),
    assistantRollout: z.enum(ASSISTANT_ROLLOUTS).optional(),
    maintenance: z.boolean().optional(),
    corruptChannels: z.boolean().optional(),
    offline: z.boolean().optional(),
    failNext: z.literal(true).optional(),
    latency: z.literal(NETWORK_LATENCIES).optional(),
  })
  .strict();

export const readRequestBody = async (
  request: IncomingMessage,
): Promise<unknown> => {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const input: unknown = chunk;
    const bytes = typeof input === "string" ? Buffer.from(input) : input;

    if (!Buffer.isBuffer(bytes)) {
      throw new Error("Expected a byte stream.");
    }

    size += bytes.length;

    if (size > 16_384) {
      throw new Error("Request is too large.");
    }

    chunks.push(bytes);
  }

  const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));

  return body;
};
