import { PrismError } from "@priemskiyyy/prism";
import type { Evaluations } from "@priemskiyyy/prism";
import type { HttpRequest } from "@priemskiyyy/prism-http";
import { z } from "zod";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";

const EvaluationsResponse = z.record(
  z.string(),
  z.object({ value: z.json(), variant: z.string().optional() }),
);

export const createCourierRequest =
  (endpoint: string, fetch: typeof globalThis.fetch) =>
  async ({
    context,
    keys,
    signal,
  }: HttpRequest<CourierContext>): Promise<Evaluations> => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ context, keys }),
      signal,
    });

    if (!response.ok) {
      throw new PrismError({
        code: response.status >= 500 ? "NETWORK" : "PROTOCOL",
        message: `The flag API answered ${response.status}.`,
      });
    }

    return EvaluationsResponse.parse(await response.json());
  };
