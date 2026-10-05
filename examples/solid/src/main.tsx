import { render } from "solid-js/web";
import { PrismDevtools } from "@priemskiyyy/prism-devtools";
import { createFlagBackend } from "examples/shared/courier/backend/createFlagBackend";
import { INITIAL_MEMBERSHIP } from "examples/shared/courier/constants/initialMembership";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
import { courierFlags } from "examples/shared/courier/flags";
import { createHttpHost } from "examples/shared/courier/providers/createHttpHost";
import { createCourierRuntime } from "examples/shared/courier/runtime/createCourierRuntime";
import { reportError } from "examples/shared/courier/utils/reportError";
import { Application } from "src/Application";
import "src/style.css";

const root = document.getElementById("root");

if (root === null) {
  throw new Error("Missing application root.");
}

const runtime = createCourierRuntime(
  createHttpHost(createFlagBackend({ latency: 400 })),
  getCourierContext(INITIAL_MEMBERSHIP),
);

const devtools = new PrismDevtools({
  flags: runtime.flags,
  definitions: courierFlags,
});

const unmount = render(() => <Application runtime={runtime} />, root);

devtools.mount(document.body);
runtime.start().catch(reportError);

const disposeHost = () => {
  window.removeEventListener("pagehide", disposeHost);
  devtools.unmount();
  unmount();
  runtime.dispose().catch(reportError);
};

window.addEventListener("pagehide", disposeHost, { once: true });
import.meta.hot?.dispose(disposeHost);
