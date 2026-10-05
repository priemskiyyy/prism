import type { ProviderEvaluation } from "examples/shared/courier/types/ProviderEvaluation";

export const pickEvaluations = (
  evaluations: Map<string, ProviderEvaluation>,
  keys: string[],
) => {
  const picked = new Map<string, ProviderEvaluation>();

  for (const key of keys) {
    const evaluation = evaluations.get(key);

    if (evaluation === undefined) {
      continue;
    }

    picked.set(key, evaluation);
  }

  return Object.fromEntries(picked);
};
