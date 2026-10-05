import type { JsonObject } from "src/types/JsonObject";
import type { JsonPrimitive } from "src/types/JsonPrimitive";

export type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;
