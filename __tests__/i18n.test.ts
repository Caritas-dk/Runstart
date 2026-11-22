import { STRINGS } from '../src/i18n/strings';

describe('translations', () => {
  const langs = Object.keys(STRINGS) as (keyof typeof STRINGS)[];
  it('has five languages', () => expect(langs.sort()).toEqual(['da', 'de', 'en', 'es', 'fr']));
  it('every language keeps the placeholders the code fills in', () => {
    const da = STRINGS.da as Record<string, unknown>;
    for (const l of langs) {
      const cur = STRINGS[l] as Record<string, unknown>;
      for (const k of Object.keys(da)) {
        const ref = da[k];
        if (typeof ref !== 'string') continue;
        const ph = (ref.match(/\{[a-z]+\}/g) || []).sort();
        expect([l, k, ((cur[k] as string).match(/\{[a-z]+\}/g) || []).sort()]).toEqual([l, k, ph]);
      }
    }
  });
  it('Danish uses "løbepas" instead of a bare "pas"', () => {
    for (const v of Object.values(STRINGS.da)) {
      if (typeof v !== 'string') continue;
      expect(v).not.toMatch(/(^|[^a-zæøåA-ZÆØÅ])pas(set|sene|ser)?([^a-zæøå]|$)/i);
    }
  });
});
