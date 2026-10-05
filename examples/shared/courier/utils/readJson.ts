export const readJson = (body: BodyInit | null | undefined): unknown => {
  if (typeof body !== "string") {
    return null;
  }

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
};
