import { Prism } from "@priemskiyyy/prism";
import { http } from "@priemskiyyy/prism-http";
import { createCourierRequest } from "examples/shared/courier/api/createCourierRequest";
import { courierFlags } from "examples/shared/courier/flags";
import { FLAGS_URL } from "src/utils/constants/flagsUrl";

export const flags = new Prism({
  flags: courierFlags,
  adapter: http({ request: createCourierRequest(FLAGS_URL, fetch) }),
});
