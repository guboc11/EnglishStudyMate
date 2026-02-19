function extractGeneratedText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  const text = parts
    .map((part) => part?.text || '')
    .join('\n')
    .trim();

  return text.length > 0 ? text : null;
}

function extractJsonText(raw) {
  const trimmed = String(raw || '').trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('Model output does not contain valid JSON object');
  }

  return trimmed.slice(first, last + 1);
}

function normalizeDomain(domain) {
  const value = String(domain || '').trim().toLowerCase();
  if (value === 'tech') return 'tech';
  if (value === 'art') return 'art';
  if (value === 'business') return 'business';
  if (value === 'science') return 'science';
  if (value === 'daily') return 'daily';
  return 'general';
}

function sanitizeCandidates(raw) {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => ({
      id: String(item.id || `sense_${index + 1}`),
      phrase: String(item.phrase || '').trim(),
      senseLabelKo: String(item.senseLabelKo || '').trim(),
      shortHintKo: String(item.shortHintKo || '').trim(),
      domains: Array.isArray(item.domains)
        ? item.domains.map((domain) => normalizeDomain(domain))
        : ['general'],
    }))
    .filter((item) => item.phrase && item.senseLabelKo)
    .slice(0, 6);
}

module.exports = {
  extractGeneratedText,
  extractJsonText,
  normalizeDomain,
  sanitizeCandidates,
};
