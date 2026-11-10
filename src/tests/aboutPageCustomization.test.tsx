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

  it('validates selected outcomes include requested tier-1 bank, hospital network, and global freight metrics', () => {
    const outcomes = INITIAL_SITE_DATA.aboutPage?.selectedOutcomes || [];
    const textBlobs = outcomes.map(o => o.text.toLowerCase());

    const hasTier1Bank = textBlobs.some(t => t.includes('1,240 vms') && t.includes('tier-1 bank'));
    const hasHospitalNetwork = textBlobs.some(t => t.includes('4,500 workloads') && t.includes('18-hospital network'));
    const hasGlobalFreight = textBlobs.some(t => t.includes('820 vms') && t.includes('global freight'));

    expect(hasTier1Bank).toBe(true);
    expect(hasHospitalNetwork).toBe(true);
    expect(hasGlobalFreight).toBe(true);
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
