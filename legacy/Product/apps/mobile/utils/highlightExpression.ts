type Segment = {
  text: string;
  isMatch: boolean;
};

const IRREGULAR_FORMS: Record<string, string[]> = {
  be: ['am', 'is', 'are', 'was', 'were', 'been', 'being'],
  do: ['does', 'did', 'done', 'doing'],
  go: ['goes', 'went', 'gone', 'going'],
  take: ['takes', 'took', 'taken', 'taking'],
  make: ['makes', 'made', 'making'],
  come: ['comes', 'came', 'coming'],
  see: ['sees', 'saw', 'seen', 'seeing'],
  get: ['gets', 'got', 'gotten', 'getting'],
  give: ['gives', 'gave', 'given', 'giving'],
  find: ['finds', 'found', 'finding'],
  keep: ['keeps', 'kept', 'keeping'],
  leave: ['leaves', 'left', 'leaving'],
  feel: ['feels', 'felt', 'feeling'],
  tell: ['tells', 'told', 'telling'],
  think: ['thinks', 'thought', 'thinking'],
  buy: ['buys', 'bought', 'buying'],
  bring: ['brings', 'brought', 'bringing'],
  begin: ['begins', 'began', 'begun', 'beginning'],
  run: ['runs', 'ran', 'running'],
  write: ['writes', 'wrote', 'written', 'writing'],
  speak: ['speaks', 'spoke', 'spoken', 'speaking'],
  eat: ['eats', 'ate', 'eaten', 'eating'],
  drink: ['drinks', 'drank', 'drunk', 'drinking'],
};

const FORM_TO_LEMMA = Object.entries(IRREGULAR_FORMS).reduce(
  (acc, [lemma, forms]) => {
    acc[lemma] = lemma;
    for (const form of forms) {
      acc[form] = lemma;
    }
    return acc;
  },
  {} as Record<string, string>
);

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSpace(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

function isVowel(char: string): boolean {
  return /[aeiou]/.test(char);
}

function countVowelGroups(word: string): number {
  const matches = word.match(/[aeiou]+/g);
  return matches ? matches.length : 0;
}

function shouldDoubleFinalConsonant(word: string): boolean {
  if (word.length < 3) return false;

  const last = word[word.length - 1];
  const middle = word[word.length - 2];
  const first = word[word.length - 3];

  const isCvc =
    /[a-z]/.test(first) &&
    /[a-z]/.test(middle) &&
    /[a-z]/.test(last) &&
    !isVowel(first) &&
    isVowel(middle) &&
    !isVowel(last);

  if (!isCvc) return false;
  if (/[wxy]/.test(last)) return false;

  // Default for short one-syllable CVC words: stop -> stopped/stopping.
  if (word.length <= 4 && countVowelGroups(word) === 1) return true;

  // Heuristic for common multi-syllable stress-on-last patterns:
  // occur, prefer, admit, begin, etc.
  const stressedTailPattern = /(cur|fer|mit|gin|fit|get|pel|mit)$/;
  return stressedTailPattern.test(word);
}

function addRegularInflections(word: string, set: Set<string>) {
  if (!word) return;
  set.add(word);

  const doubleFinal = shouldDoubleFinalConsonant(word);
  const doubledStem = doubleFinal ? `${word}${word[word.length - 1]}` : word;

  if (word.endsWith('y') && !/[aeiou]y$/.test(word)) {
    set.add(`${word.slice(0, -1)}ies`);
    set.add(`${word.slice(0, -1)}ied`);
  } else {
    set.add(`${word}s`);
    set.add(`${doubledStem}ed`);
  }

  if (/(s|x|z|ch|sh)$/.test(word)) {
    set.add(`${word}es`);
  }

  if (word.endsWith('e')) {
    set.add(`${word.slice(0, -1)}ing`);
    set.add(`${word}d`);
  } else if (word.endsWith('ie')) {
    set.add(`${word.slice(0, -2)}ying`);
  } else {
    set.add(`${doubledStem}ing`);
  }

  // Preserve non-doubling forms as additional variants for tolerant matching.
  if (doubleFinal) {
    set.add(`${word}ed`);
    set.add(`${word}ing`);
  }
}

function buildSingleWordVariants(word: string): string[] {
  const normalized = normalizeSpace(word);
  const lemma = FORM_TO_LEMMA[normalized] ?? normalized;
  const variants = new Set<string>();

  addRegularInflections(lemma, variants);
  variants.add(normalized);

  const irregular = IRREGULAR_FORMS[lemma];
  if (irregular) {
    for (const form of irregular) variants.add(form);
  }

  return [...variants];
}

function toPhrasePattern(phrase: string): string {
  return normalizeSpace(phrase)
    .split(' ')
    .map((token) => escapeRegex(token))
    .join('\\s+');
}

function buildExpressionPatterns(expression: string): string[] {
  const normalized = normalizeSpace(expression);
  if (!normalized) return [];

  const tokens = normalized.split(' ');
  if (tokens.length === 1) {
    return buildSingleWordVariants(tokens[0]).map((variant) =>
      toPhrasePattern(variant)
    );
  }

  const [head, ...tail] = tokens;
  const tailText = tail.join(' ');
  const headVariants = buildSingleWordVariants(head);
  const patterns = new Set<string>([toPhrasePattern(normalized)]);

  for (const variant of headVariants) {
    patterns.add(toPhrasePattern(`${variant} ${tailText}`));
  }

  // Separable phrasal verb support: e.g., "take it in", "took something in".
  if (tokens.length === 2) {
    const headPattern = headVariants.map((variant) => escapeRegex(variant)).join('|');
    const particlePattern = escapeRegex(tokens[1]);
    const objectTokenPattern = [
      'it',
      'them',
      'him',
      'her',
      'me',
      'us',
      'this',
      'that',
      'these',
      'those',
      'something',
      'someone',
      'somebody',
      'anything',
      'anyone',
      'anybody',
      'nothing',
      'everything',
      "[-a-zA-Z']+",
    ].join('|');

    patterns.add(
      `(?:${headPattern})(?:\\s+(?:${objectTokenPattern})){1,4}\\s+${particlePattern}`
    );
  }

  return [...patterns];
}

export function splitByExpressionMatch(
  text: string,
  expression: string
): Segment[] {
  if (!text) return [{ text: '', isMatch: false }];

  const patterns = buildExpressionPatterns(expression).filter(Boolean);
  if (patterns.length === 0) return [{ text, isMatch: false }];

  // Prefer longer matches first.
  const pattern = patterns
    .sort((a, b) => b.length - a.length)
    .join('|');

  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match = regex.exec(text);

  while (match) {
    const index = match.index;
    if (index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, index),
        isMatch: false,
      });
    }

    segments.push({
      text: match[0],
      isMatch: true,
    });

    lastIndex = index + match[0].length;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isMatch: false,
    });
  }

  return segments.length > 0 ? segments : [{ text, isMatch: false }];
}
