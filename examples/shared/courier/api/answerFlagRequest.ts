import { z } from "zod";
import { findCourierContext } from "examples/shared/courier/directory/findCourierContext";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { NetworkExchange } from "examples/shared/courier/types/NetworkExchange";
import { pickEvaluations } from "examples/shared/courier/utils/pickEvaluations";

const EvaluationRequest = z.object({
  context: z.object({ userId: z.string(), workspaceId: z.string() }),
  keys: z.array(z.string()),
});

type FlagRequestOrigin = Pick<NetworkExchange, "provider" | "path" | "signal">;

export const answerFlagRequest = (
  backend: FlagBackend,
  body: unknown,
  { provider, path, signal }: FlagRequestOrigin,
) => {
  const request = EvaluationRequest.safeParse(body);

  const context = request.success
    ? findCourierContext(
        request.data.context.userId,
        request.data.context.workspaceId,
      )
    : undefined;

  return backend.exchange(
    { provider, method: "POST", path, context, signal },
    () => {
      if (!request.success || context === undefined) {
        return new Response(null, { status: 400 });
      }

      return Response.json(
        pickEvaluations(backend.evaluate(context), request.data.keys),
      );
    },
  );
};
