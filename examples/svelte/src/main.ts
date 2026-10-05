import { mount, unmount } from "svelte";
import { PrismDevtools } from "@priemskiyyy/prism-devtools";
import { createFlagBackend } from "examples/shared/courier/backend/createFlagBackend";
import { INITIAL_MEMBERSHIP } from "examples/shared/courier/constants/initialMembership";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
import { courierFlags } from "examples/shared/courier/flags";
import { createHttpHost } from "examples/shared/courier/providers/createHttpHost";
import { createCourierRuntime } from "examples/shared/courier/runtime/createCourierRuntime";
import { reportError } from "examples/shared/courier/utils/reportError";
import Application from "src/Application.svelte";
import "src/style.css";

const target = document.getElementById("root");

if (target === null) {
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

const application = mount(Application, { target, props: { runtime } });

devtools.mount(document.body);
runtime.start().catch(reportError);

const disposeHost = () => {
  window.removeEventListener("pagehide", disposeHost);
  devtools.unmount();
  unmount(application).catch(reportError);
  runtime.dispose().catch(reportError);
};

window.addEventListener("pagehide", disposeHost, { once: true });
import.meta.hot?.dispose(disposeHost);
