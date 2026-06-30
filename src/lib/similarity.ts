import api from "@/lib/api";

/**
 * Cosine-similarity score (0..1) at or above which we treat a new item as a
 * likely duplicate and warn the user before creating/updating.
 */
export const SIMILARITY_THRESHOLD = 0.80;

export interface SimilarChecklist {
  id: string;
  description: string;
  severity: string;
  category: string;
  similarityScore: number;
}

export interface SimilarGuideline {
  id: string;
  content: string;
  severity: string;
  similarityScore: number;
}

/** Returns existing checklists most similar to `description`, highest first. */
export async function findSimilarChecklists(
  description: string,
  excludeId?: string
): Promise<SimilarChecklist[]> {
  const res = await api.post("/review-checklists/semantic-search", {
    query: description,
    limit: 5,
    excludeId,
  });
  const results: SimilarChecklist[] = res.data.results ?? [];
  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}

/** Returns existing guidelines most similar to `content`, highest first. */
export async function findSimilarGuidelines(
  content: string,
  excludeId?: string
): Promise<SimilarGuideline[]> {
  const res = await api.post("/guidelines/semantic-search", {
    query: content,
    limit: 5,
    excludeId,
  });
  const results: SimilarGuideline[] = res.data.results ?? [];
  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}

/** Keep only matches at or above the duplicate-warning threshold. */
export function aboveThreshold<T extends { similarityScore: number }>(items: T[]): T[] {
  return items.filter((i) => i.similarityScore >= SIMILARITY_THRESHOLD);
}
