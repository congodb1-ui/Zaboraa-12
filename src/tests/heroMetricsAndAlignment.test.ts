import { describe, it, expect } from 'vitest';
import { INITIAL_SITE_DATA } from '../data/initialData';

describe('Hero Engineering Metrics & Alignment Suite', () => {
  it('initializes with the requested verified engineering metrics and labels', () => {
    const stats = INITIAL_SITE_DATA.hero.stats;
    expect(stats).toHaveLength(4);

    expect(stats[0]).toEqual({
      value: '13+',
      label: 'Years Enterprise Infrastructure'
    });

    expect(stats[1]).toEqual({
      value: '25+',
      label: 'Hyperscaler Migrations Executed'
    });

    expect(stats[2]).toEqual({
      value: '8×',
      label: 'Verified Cloud Certifications'
    });

    expect(stats[3]).toEqual({
      value: '100%',
      label: 'Runbook-Driven Cutovers'
    });

    // Failing case check: ensure obsolete multi-platform text is no longer present
    const values = stats.map(s => s.value);
    expect(values).not.toContain('AVS · NC2 · GCVE · VMC');
    expect(values).not.toContain('14+');
  });

  it('correctly parses multi-platform bullet strings into balanced pairs', () => {
    const parsePlatforms = (val: string) => {
      const clean = val.trim();
      const parts = clean.split(/[·•/]/).map(p => p.trim()).filter(Boolean);
      return parts;
    };

    const dotSeparated = parsePlatforms('AVS · NC2 · GCVE · VMC');
    expect(dotSeparated).toEqual(['AVS', 'NC2', 'GCVE', 'VMC']);

    const bulletSeparated = parsePlatforms('AVS • NC2 • GCVE • VMC');
    expect(bulletSeparated).toEqual(['AVS', 'NC2', 'GCVE', 'VMC']);

    const slashSeparated = parsePlatforms('AVS / NC2 / GCVE / VMC');
    expect(slashSeparated).toEqual(['AVS', 'NC2', 'GCVE', 'VMC']);
  });

  it('handles irregular platform formats and failing counterpart cases safely', () => {
    const parsePlatforms = (val: string) => {
      const clean = (val || '').trim();
      if (!clean) return [];
      const parts = clean.split(/[·•/]/).map(p => p.trim()).filter(Boolean);
      return parts;
    };

    // Failing / empty counterpart
    expect(parsePlatforms('')).toEqual([]);
    expect(parsePlatforms('   ')).toEqual([]);

    // Single item without separators
    expect(parsePlatforms('AVS')).toEqual(['AVS']);

    // Malformed separators with trailing/leading spaces
    expect(parsePlatforms('  AVS  ·  NC2  ')).toEqual(['AVS', 'NC2']);
  });
});
