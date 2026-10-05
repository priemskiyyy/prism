import { createServer } from "node:http";
import type { ServerResponse } from "node:http";
import { answerFlagRequest } from "examples/shared/courier/api/answerFlagRequest";
import { createFlagBackend } from "examples/shared/courier/backend/createFlagBackend";
import { applyBackendChange } from "#src/applyBackendChange";
import { backendChange, readRequestBody } from "#src/requests";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

const send = async (response: ServerResponse, answer: Response) => {
  const body = await answer.text();

  response.writeHead(answer.status, {
    ...CORS_HEADERS,
    "content-type": "application/json",
  });
  response.end(body);
};

export const createDemoServer = () => {
  const backend = createFlagBackend({ latency: 0 });

  const server = createServer(async (request, response) => {
    try {
      const { pathname } = new URL(request.url ?? "/", "http://localhost");

      if (request.method === "OPTIONS") {
        response.writeHead(204, CORS_HEADERS);
        response.end();

        return;
      }

      if (request.method !== "POST") {
        await send(response, Response.json(null, { status: 404 }));

        return;
      }

      if (pathname === "/api/flags") {
        await send(
          response,
          await answerFlagRequest(backend, await readRequestBody(request), {
            provider: "Fixture server",
            path: pathname,
            signal: undefined,
          }),
        );

        return;
      }

      if (pathname === "/api/control") {
        applyBackendChange(
          backend,
          backendChange.parse(await readRequestBody(request)),
        );
        await send(response, Response.json(backend.getSnapshot()));

        return;
      }

      await send(response, Response.json(null, { status: 404 }));
    } catch {
      await send(response, Response.json(null, { status: 400 }));
    }
  });

  const dispose = () =>
    new Promise<void>((resolve, reject) => {
      if (!server.listening) {
        resolve();

        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
      server.closeAllConnections();
    });

  return { server, dispose };
};
