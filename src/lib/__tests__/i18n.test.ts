import { describe, it, expect } from 'vitest';
import en from '../locales/en.json';
import es from '../locales/es.json';

describe('i18n translation completeness', () => {
  const enKeys = Object.keys(en).sort();
  const esKeys = Object.keys(es).sort();

  it('en.json and es.json should have the same keys', () => {
    const missingInEs = enKeys.filter(k => !esKeys.includes(k));
    const missingInEn = esKeys.filter(k => !enKeys.includes(k));

    if (missingInEs.length) {
      console.warn('Keys in en.json but missing in es.json:', missingInEs);
    }
    if (missingInEn.length) {
      console.warn('Keys in es.json but missing in en.json:', missingInEn);
    }

    expect(enKeys).toEqual(esKeys);
  });

  it('no translation value should be empty', () => {
    const emptyEN = enKeys.filter(k => !(en as Record<string, string>)[k]?.trim());
    const emptyES = esKeys.filter(k => !(es as Record<string, string>)[k]?.trim());

    expect(emptyEN).toEqual([]);
    expect(emptyES).toEqual([]);
  });
});
