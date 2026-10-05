import type { z } from "zod";
import type { Channel } from "examples/shared/courier/flags";

export type ChannelId = z.infer<typeof Channel>;
