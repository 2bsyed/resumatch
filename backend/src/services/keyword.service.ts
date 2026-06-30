const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cant', 'cannot', 'could', 'couldnt',
  'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during',
  'each',
  'few', 'for', 'from', 'further',
  'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows',
  'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself',
  'lets',
  'me', 'more', 'most', 'mustnt', 'my', 'myself',
  'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such',
  'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these',
  'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where',
  'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt',
  'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves'
]);

const TECH_KEYWORDS_LIST = [
  'python', 'javascript', 'typescript', 'react', 'vue', 'angular', 'next.js', 'nuxt', 'node.js', 'node', 'express',
  'nest.js', 'fastapi', 'django', 'flask', 'spring boot', 'java', 'kotlin', 'swift', 'objective-c', 'c++', 'c#', 'c',
  'golang', 'go', 'rust', 'ruby', 'rails', 'php', 'laravel', 'sql', 'postgresql', 'mysql', 'sqlite', 'mongodb',
  'redis', 'cassandra', 'dynamodb', 'firebase', 'supabase', 'firestore', 'oracle', 'mssql', 'elasticsearch', 'graphql',
  'rest api', 'rest', 'soap', 'grpc', 'web sockets', 'html', 'css', 'tailwind', 'bootstrap', 'sass', 'webpack', 'vite',
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'github actions',
  'gitlab ci', 'ci/cd', 'git', 'bitbucket', 'agile', 'scrum', 'kanban', 'jira', 'confluence', 'linux', 'unix', 'macos',
  'windows', 'bash', 'shell', 'powershell', 'nginx', 'apache', 'cloudflare', 'datadog', 'prometheus', 'grafana',
  'sentry', 'new relic', 'unit testing', 'jest', 'mocha', 'cypress', 'selenium', 'playwright', 'machine learning',
  'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'nlp', 'computer vision', 'data science',
  'big data', 'hadoop', 'spark', 'kafka', 'rabbitmq', 'microservices', 'serverless', 'lambda', 'graphql api',
  'micro frontends', 'redux', 'context api', 'zustand', 'mobx', 'html5', 'css3', 'responsive design', 'seo', 'accessibility',
  'web accessibility', 'wcag', 'oauth', 'jwt', 'saml', 'iam', 'ssl/tls', 'web security', 'penetration testing',
  'owasp', 'blockchain', 'solidity', 'smart contracts', 'web3', 'cryptography', 'system design', 'oop', 'fp',
  'design patterns', 'solid principles', 'mvc', 'ddd', 'restful', 'apis', 'saas', 'server rendering', 'jamstack'
];

export function extractKeywords(text: string): string[] {
  if (!text) return [];

  // Normalize, remove non-alphanumeric (keep spaces), split into tokens
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/);

  const freqMap: { [key: string]: number } = {};

  for (const word of words) {
    const cleanWord = word.trim();
    if (!cleanWord || cleanWord.length < 2 || STOP_WORDS.has(cleanWord)) {
      continue;
    }
    freqMap[cleanWord] = (freqMap[cleanWord] || 0) + 1;
  }

  // Sort by frequency descending and return top 30
  return Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(entry => entry[0]);
}

export function extractTechKeywords(text: string): string[] {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const matched = new Set<string>();

  for (const tech of TECH_KEYWORDS_LIST) {
    // Exact word boundary matching for tech skills
    // We escape special characters like .js, c++, c#
    const escaped = tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    
    // For things that might not have word boundaries at the end (like next.js or c++)
    // we use a custom check or relaxed boundary check
    const simpleRegex = new RegExp(`(?:\\b|\\s|^)${escaped}(?:\\b|\\s|$|[,.;:])`, 'i');
    
    if (regex.test(lowerText) || simpleRegex.test(lowerText)) {
      matched.add(tech.toUpperCase());
    }
  }

  return Array.from(matched);
}
