import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createFlagBackend } from "examples/shared/courier/backend/createFlagBackend";
import { createProviderHosts } from "examples/shared/courier/providers/createProviderHosts";
import { Application } from "src/Application";
import "src/styles.css";

const root = document.getElementById("root");

if (root === null) {
  throw new Error("Missing application root.");
}

const backend = createFlagBackend({ latency: 400 });

createRoot(root).render(
  <StrictMode>
    <Application backend={backend} getHost={createProviderHosts(backend)} />
  </StrictMode>,
);
