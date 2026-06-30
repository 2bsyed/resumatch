let extractor: any = null;

export async function initScorerModel() {
  if (!extractor) {
    // Dynamically load @xenova/transformers to ensure compatibility in Node env
    const { pipeline } = await import('@xenova/transformers');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const pipelineInstance = await initScorerModel();
  // Truncate text to avoid model context bounds
  const cleanedText = text.slice(0, 1500);
  const output = await pipelineInstance(cleanedText, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
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

export async function calculateSemanticScore(cvText: string, jdText: string): Promise<number> {
  try {
    const [embCv, embJd] = await Promise.all([
      getEmbedding(cvText),
      getEmbedding(jdText)
    ]);
    const sim = cosineSimilarity(embCv, embJd);
    // Cosine similarity for typical normalized text embeddings is > 0.
    // Map similarity directly: sim * 100, clamped between 0 and 100
    const score = Math.max(0, Math.min(100, Math.round(sim * 100)));
    return score;
  } catch (error) {
    console.error('Semantic score calculation error:', error);
    return 60; // Fallback score
  }
}

export function calculateKeywordScore(cvText: string, jdKeywords: string[]): {
  score: number;
  matched: string[];
  missing: string[];
} {
  if (!jdKeywords || jdKeywords.length === 0) {
    return { score: 100, matched: [], missing: [] };
  }

  const cvLower = cvText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jdKeywords) {
    const cleanKw = keyword.trim().toLowerCase();
    if (!cleanKw) continue;

    // Check if word exists (word boundary or regex match helper)
    const escaped = cleanKw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    
    // Alternative check for symbols like c++, .net, next.js
    const simpleRegex = new RegExp(`(?:\\b|\\s|^)${escaped}(?:\\b|\\s|$|[,.;:])`, 'i');

    if (regex.test(cvLower) || simpleRegex.test(cvLower)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const total = matched.length + missing.length;
  const score = total > 0 ? Math.round((matched.length / total) * 100) : 0;

  return { score, matched, missing };
}

export async function calculateAtsScore(
  cvText: string, 
  jdText: string, 
  jdKeywords: string[]
): Promise<{
  composite: number;
  semantic: number;
  keyword: number;
  matched: string[];
  missing: string[];
}> {
  const [semantic, keyResult] = await Promise.all([
    calculateSemanticScore(cvText, jdText),
    Promise.resolve(calculateKeywordScore(cvText, jdKeywords))
  ]);

  const keyword = keyResult.score;
  const composite = Math.round((semantic * 0.5) + (keyword * 0.5));

  return {
    composite,
    semantic,
    keyword,
    matched: keyResult.matched,
    missing: keyResult.missing
  };
}

export async function prewarmScorerModel() {
  console.log('Pre-warming semantic scorer model...');
  try {
    await initScorerModel();
    await getEmbedding('warmup');
    console.log('Semantic scorer model pre-warmed successfully!');
  } catch (err) {
    console.error('Failed to pre-warm semantic scorer:', err);
  }
}
