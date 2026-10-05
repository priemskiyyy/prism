import { registerRootComponent } from "expo";
import { AppState } from "react-native";
import { PrismProvider } from "@priemskiyyy/prism-react";
import { INITIAL_MEMBERSHIP } from "examples/shared/courier/constants/initialMembership";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
import { reportError } from "examples/shared/courier/utils/reportError";
import { Application } from "src/Application";
import { flags } from "src/flags/flags";

flags
  .start({ context: getCourierContext(INITIAL_MEMBERSHIP) })
  .catch(reportError);

const lifecycle = AppState.addEventListener("change", (state) => {
  if (state !== "active") {
    return;
  }

  flags.refresh().catch(reportError);
});

const Root = () => (
  <PrismProvider flags={flags}>
    <Application />
  </PrismProvider>
);

registerRootComponent(Root);

export const disposeHost = async () => {
  lifecycle.remove();
  await flags.dispose();
};
