import { RagKnowledgeChunk, RagSearchResult, MenuItem } from '../types.js';
import { RAG_KNOWLEDGE_BASE } from './mockData.js';

// Term extraction and normalization
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

// Build vocabulary and term vectors
function buildVocabulary(chunks: RagKnowledgeChunk[]): string[] {
  const vocabSet = new Set<string>();
  for (const chunk of chunks) {
    const tokens = tokenize(`${chunk.title} ${chunk.content} ${chunk.tags.join(' ')}`);
    for (const t of tokens) {
      vocabSet.add(t);
    }
  }
  return Array.from(vocabSet).sort();
}

const VOCABULARY = buildVocabulary(RAG_KNOWLEDGE_BASE);

// Compute term frequency vector
export function computeTfVector(text: string, vocabulary: string[] = VOCABULARY): number[] {
  const tokens = tokenize(text);
  const freqMap = new Map<string, number>();

  for (const t of tokens) {
    freqMap.set(t, (freqMap.get(t) || 0) + 1);
  }

  const vector: number[] = new Array(vocabulary.length).fill(0);
  for (let i = 0; i < vocabulary.length; i++) {
    const term = vocabulary[i];
    vector[i] = freqMap.get(term) || 0;
  }

  return vector;
}

// Compute Cosine Similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Pre-compute vectors for all chunks
const INDEXED_CHUNKS: { chunk: RagKnowledgeChunk; vector: number[] }[] = RAG_KNOWLEDGE_BASE.map(
  (chunk) => ({
    chunk,
    vector: computeTfVector(`${chunk.title} ${chunk.content} ${chunk.tags.join(' ')}`),
  })
);

/**
 * Perform Cosine Similarity RAG search
 */
export function searchKnowledgeBase(
  query: string,
  topK: number = 3,
  minThreshold: number = 0.05
): RagSearchResult[] {
  if (!query || typeof query !== 'string') return [];

  const queryVector = computeTfVector(query);
  const queryTokens = tokenize(query);

  const results: RagSearchResult[] = [];

  for (const item of INDEXED_CHUNKS) {
    const score = cosineSimilarity(queryVector, item.vector);
    if (score >= minThreshold) {
      const chunkTokens = new Set(tokenize(`${item.chunk.title} ${item.chunk.content}`));
      const matched = queryTokens.filter((t) => chunkTokens.has(t));

      results.push({
        chunk: item.chunk,
        similarityScore: Number(score.toFixed(4)),
        matchedTerms: matched,
      });
    }
  }

  // Sort descending by cosine similarity score
  results.sort((a, b) => b.similarityScore - a.similarityScore);

  return results.slice(0, topK);
}

/**
 * Filter menu items excluding specific allergens requested by the user
 */
export function filterExcludingAllergens(
  menu: MenuItem[],
  excludedAllergens: ('dairy' | 'nuts' | 'gluten' | 'soy' | 'egg')[]
): MenuItem[] {
  if (!excludedAllergens || excludedAllergens.length === 0) return menu;

  const excludedSet = new Set(excludedAllergens);
  return menu.filter((item) => {
    // If any allergen in the item is in excludedSet, reject
    return !item.allergens.some((allergen) => excludedSet.has(allergen));
  });
}

/**
 * Decaf Verification Helper: A beverage is strictly decaf if caffeineMg <= 5mg
 */
export function verifyDecafThreshold(item: MenuItem): { isStrictDecaf: boolean; caffeineMg: number } {
  const isStrictDecaf = item.caffeineMg <= 5;
  return {
    isStrictDecaf,
    caffeineMg: item.caffeineMg,
  };
}
