import { http } from "@priemskiyyy/prism-http";
import { answerFlagRequest } from "examples/shared/courier/api/answerFlagRequest";
import { createCourierRequest } from "examples/shared/courier/api/createCourierRequest";
import { FLAGS_ENDPOINT } from "examples/shared/courier/constants/endpoints";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { ProviderHost } from "examples/shared/courier/types/ProviderHost";
import { readJson } from "examples/shared/courier/utils/readJson";

export const createHttpHost = (backend: FlagBackend): ProviderHost => {
  const fetch: typeof globalThis.fetch = (_input, init) =>
    answerFlagRequest(backend, readJson(init?.body), {
      provider: "HTTP API",
      path: "/flags/evaluate",
      signal: init?.signal,
    });

  const request = createCourierRequest(FLAGS_ENDPOINT, fetch);

  return {
    id: "HTTP",
    ready: Promise.resolve(),
    createAdapter: () => http<CourierContext>({ request }),
    updates: (_context, refresh) => backend.onPush(refresh),
  };
};
