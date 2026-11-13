import { describe, it, expect } from 'vitest';
import { DEFAULT_ADMIN_TEMPLATES } from '../utils/adminParameterControls';
import { CANONICAL_TEMPLATES, getCompatibilityForPlatform } from '../utils/architectureCompatibilityRules';
import { createDefaultWizardState } from '../types/wizardStateAdapter';

describe('Template & Default State Mismatch Audit', () => {
  it('validates ALL values in DEFAULT_ADMIN_TEMPLATES against platform compatibility allowed lists', () => {
    const mismatches: string[] = [];

    for (const tmpl of DEFAULT_ADMIN_TEMPLATES) {
      const compat = getCompatibilityForPlatform(tmpl.targetPlatform);
      if (!compat) {
        mismatches.push(`Template [${tmpl.id}]: Unknown targetPlatform '${tmpl.targetPlatform}'`);
        continue;
      }

      if (tmpl.interconnect && !compat.allowedInterconnects.includes(tmpl.interconnect)) {
        mismatches.push(`Template [${tmpl.id}]: interconnect '${tmpl.interconnect}' not in allowedInterconnects [${compat.allowedInterconnects.join(', ')}]`);
      }

      if (tmpl.firewall && !compat.allowedFirewalls.includes(tmpl.firewall)) {
        mismatches.push(`Template [${tmpl.id}]: firewall '${tmpl.firewall}' not in allowedFirewalls [${compat.allowedFirewalls.join(', ')}]`);
      }

      if (tmpl.storage && !compat.allowedStorageProviders.includes(tmpl.storage)) {
        mismatches.push(`Template [${tmpl.id}]: storage '${tmpl.storage}' not in allowedStorageProviders [${compat.allowedStorageProviders.join(', ')}]`);
      }

      if (tmpl.drEngine && !compat.allowedDrEngines.includes(tmpl.drEngine)) {
        mismatches.push(`Template [${tmpl.id}]: drEngine '${tmpl.drEngine}' not in allowedDrEngines [${compat.allowedDrEngines.join(', ')}]`);
      }
    }

    if (mismatches.length > 0) {
      console.log('\n--- DEFAULT_ADMIN_TEMPLATES MISMATCHES FOUND ---');
      mismatches.forEach(m => console.log(' - ' + m));
    }

    expect(mismatches).toEqual([]);
  });

  it('validates ALL values in CANONICAL_TEMPLATES against platform compatibility allowed lists', () => {
    const mismatches: string[] = [];

    for (const tmpl of CANONICAL_TEMPLATES) {
      const compat = getCompatibilityForPlatform(tmpl.targetPlatform);
      if (!compat) {
        mismatches.push(`Canonical Template [${tmpl.id}]: Unknown targetPlatform '${tmpl.targetPlatform}'`);
        continue;
      }

      if (tmpl.defaultInterconnect && !compat.allowedInterconnects.includes(tmpl.defaultInterconnect)) {
        mismatches.push(`Canonical Template [${tmpl.id}]: defaultInterconnect '${tmpl.defaultInterconnect}' not in allowedInterconnects [${compat.allowedInterconnects.join(', ')}]`);
      }

      if (tmpl.defaultFirewall && !compat.allowedFirewalls.includes(tmpl.defaultFirewall)) {
        mismatches.push(`Canonical Template [${tmpl.id}]: defaultFirewall '${tmpl.defaultFirewall}' not in allowedFirewalls [${compat.allowedFirewalls.join(', ')}]`);
      }

      if (tmpl.defaultStorage && !compat.allowedStorageProviders.includes(tmpl.defaultStorage)) {
        mismatches.push(`Canonical Template [${tmpl.id}]: defaultStorage '${tmpl.defaultStorage}' not in allowedStorageProviders [${compat.allowedStorageProviders.join(', ')}]`);
      }

      if (tmpl.defaultDrEngine && !compat.allowedDrEngines.includes(tmpl.defaultDrEngine)) {
        mismatches.push(`Canonical Template [${tmpl.id}]: defaultDrEngine '${tmpl.defaultDrEngine}' not in allowedDrEngines [${compat.allowedDrEngines.join(', ')}]`);
      }
    }

    if (mismatches.length > 0) {
      console.log('\n--- CANONICAL_TEMPLATES MISMATCHES FOUND ---');
      mismatches.forEach(m => console.log(' - ' + m));
    }

    expect(mismatches).toEqual([]);
  });

  it('validates createDefaultWizardState values against default target platform allowed lists', () => {
    const wizardState = createDefaultWizardState();
    const compat = getCompatibilityForPlatform(wizardState.targetPlatform);
    expect(compat).toBeDefined();

    if (compat) {
      expect(compat.allowedDrEngines).toContain(wizardState.drConfig.engine);
    }
  });
});
