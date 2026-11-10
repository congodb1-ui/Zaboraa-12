import { describe, it, expect, vi } from 'vitest';
import { INITIAL_SITE_DATA } from '../data/initialData';
import { CASE_STUDIES } from '../data/caseStudies';

describe('About Me Page & Admin Customization Suite', () => {
  it('contains the 4 verified proof strip metrics by default', () => {
    const about = INITIAL_SITE_DATA.aboutPage;
    expect(about).toBeDefined();
    expect(about?.proofTiles).toHaveLength(4);

    const values = about?.proofTiles.map(p => p.value);
    expect(values?.some(v => v.includes('13+'))).toBe(true);
    expect(values).toContain('25+');
    expect(values).toContain('100%');
    expect(values).toContain('6');

    // Labels verification
    const labels = about?.proofTiles.map(p => p.label);
    expect(labels?.some(l => l.includes('Enterprise Infrastructure'))).toBe(true);
    expect(labels).toContain('Hyperscaler Migrations Executed');
    expect(labels).toContain('Runbook-Driven Cutovers');
    expect(labels).toContain('Free Engineering Tools');
  });

  it('ensures selected outcomes link to genuine case study slugs', () => {
    const about = INITIAL_SITE_DATA.aboutPage;
    expect(about?.selectedOutcomes).toBeDefined();
    expect(about!.selectedOutcomes.length).toBeGreaterThanOrEqual(3);

    const validSlugs = new Set(CASE_STUDIES.map(c => c.slug));

    // Every outcome that specifies a caseStudySlug must correspond to a verified case study in the repository
    for (const outcome of about!.selectedOutcomes) {
      if (outcome.caseStudySlug) {
        expect(validSlugs.has(outcome.caseStudySlug)).toBe(true);
      }
    }

    // Failing case test: an arbitrary invalid slug is detected as unverified
    const invalidSlug = 'fake-nonexistent-study-999';
    expect(validSlugs.has(invalidSlug)).toBe(false);
  });

  it('validates selected outcomes use approved case study outcomes and contain no legacy metrics', () => {
    const outcomes = INITIAL_SITE_DATA.aboutPage?.selectedOutcomes || [];
    const textBlobs = outcomes.map(o => o.text.toLowerCase());

    const hasSovereignDr = textBlobs.some(t => t.includes('14+ sovereign entity') && t.includes('rpo 5–15 min'));
    const hasAvsFramework = textBlobs.some(t => t.includes('50–100 vms') || t.includes('standardised avs migration'));
    const hasMicrosegmentation = textBlobs.some(t => t.includes('2,400 security tags'));

    expect(hasSovereignDr).toBe(true);
    expect(hasAvsFramework).toBe(true);
    expect(hasMicrosegmentation).toBe(true);

    // Verify absence of retired legacy metrics (D6 / §19.2b)
    const combinedText = textBlobs.join(' ');
    expect(combinedText).not.toContain('1,240');
    expect(combinedText).not.toContain('4,500');
    expect(combinedText).not.toContain('820');
    expect(combinedText).not.toContain('$1.4m');
  });

  it('ensures tenets and contact details have valid enterprise defaults', () => {
    const about = INITIAL_SITE_DATA.aboutPage;
    expect(about?.tenets).toBeDefined();
    expect(about!.tenets!.length).toBeGreaterThan(0);

    for (const tenet of about!.tenets!) {
      expect(tenet.label.trim().length).toBeGreaterThan(0);
      expect(tenet.text.trim().length).toBeGreaterThan(0);
    }

    expect(about?.contactDetails?.phone).toBe('+91 7497624807');
    expect(about?.contactDetails?.email).toBe('wasim@zaboraa.com');
  });
});
