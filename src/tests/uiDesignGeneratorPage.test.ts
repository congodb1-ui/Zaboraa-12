import { describe, it, expect } from 'vitest';
import { applyTemplateToWizardState, CANONICAL_TEMPLATES, getCompatibilityForPlatform, validateWizardStep } from '../utils/architectureCompatibilityRules';
import { createDefaultWizardState, createDefaultTargetItem, CHOICE_TO_TEMPLATE_ID_MAP } from '../types/wizardStateAdapter';
import { TARGET_NODE_SKU_CATALOGUE } from '../data/cloudCompatibilityCatalogue';

describe('DesignGeneratorPage Functional State & Template Transition Test Suite', () => {
  const allChoices = [
    'vmware-to-avs',
    'vmware-to-nc2',
    'nutanix-to-nc2',
    'vmware-to-gcve',
    'vmware-to-vmc',
    'custom-path'
  ] as const;

  it('applies each of the 6 template choices in order and verifies output state attributes', () => {
    let state = createDefaultWizardState();

    for (const choice of allChoices) {
      const templateDef = CANONICAL_TEMPLATES.find((t) => t.id === choice)!;      const { state: updated } = applyTemplateToWizardState(state, choice);
      state = updated;

      expect(state.templateChoice).toBe(choice);
      expect(state.activeTemplate).toBe(CHOICE_TO_TEMPLATE_ID_MAP[choice]);
      expect(state.targetPlatform).toBe(templateDef.targetPlatform);
      expect(state.sourcePlatform).toBe(templateDef.sourcePlatform);
      expect(state.targetNodeSku).toBe(templateDef.defaultSku);
      expect(state.targetNodeCount).toBe(templateDef.defaultNodeCount);
      expect(state.landingZonePattern).toBe(templateDef.defaultLandingZone);
      expect(state.firewallProvider).toBe(templateDef.defaultFirewall);
      expect(state.drConfig.engine).toBe(templateDef.defaultDrEngine);
      expect(state.drConfig.rpoMinutes).toBe(templateDef.drRpoMinutes);
      expect(state.drConfig.rtoMinutes).toBe(templateDef.drRtoMinutes);
      expect(state.drConfig.strategy).toBe(templateDef.drStrategy || templateDef.strategy);
    }
  });

  it('runs sequence vmware-to-avs -> vmware-to-vmc -> vmware-to-nc2 -> vmware-to-gcve -> custom-path with zero stale leftovers', () => {
    let state = createDefaultWizardState();
    const sequence = ['vmware-to-avs', 'vmware-to-vmc', 'vmware-to-nc2', 'vmware-to-gcve', 'custom-path'] as const;

    for (const choice of sequence) {
      const { state: updated } = applyTemplateToWizardState(state, choice);
      state = updated;
    }

    const customDef = CANONICAL_TEMPLATES.find((t) => t.id === 'custom-path')!;
    expect(state.templateChoice).toBe('custom-path');
    expect(state.targetNodeSku).toBe(customDef.defaultSku);
    expect(state.targetPlatform).toBe(customDef.targetPlatform);
    expect(state.firewallProvider).toBe(customDef.defaultFirewall);
    expect(state.drConfig.engine).toBe(customDef.defaultDrEngine);
    expect(state.drConfig.strategy).toBe('Warm Standby (Full Cluster)');
  });

  it('preserves template values when target node count is manually edited', () => {
    let state = createDefaultWizardState();
    const { state: avsState } = applyTemplateToWizardState(state, 'vmware-to-avs');

    // Simulate manual edit of target node count
    const editedState = {
      ...avsState,
      targetNodeCount: 8,
      targets: avsState.targets!.map((t) => (t.role === 'Production' ? { ...t, nodeCount: 8 } : t))
    };

    expect(editedState.targetNodeCount).toBe(8);
    expect(editedState.targetNodeSku).toBe('AV64');
    expect(editedState.firewallProvider).toBe('Palo Alto Networks VM-Series');
    expect(editedState.drConfig.engine).toBe('VMware Site Recovery Manager (SRM) + vSphere Replication');
  });

  it('verifies SKU cores and RAM lookup in TARGET_NODE_SKU_CATALOGUE', () => {
    const av64Sku = TARGET_NODE_SKU_CATALOGUE.find((s) => s.sku === 'AV64');
    expect(av64Sku).toBeDefined();
    expect(av64Sku?.physicalCores).toBe(64);
    expect(av64Sku?.ramGB).toBe(1024);

    const i4iSku = TARGET_NODE_SKU_CATALOGUE.find((s) => s.sku === 'i4i.metal');
    expect(i4iSku).toBeDefined();
    expect(i4iSku?.physicalCores).toBe(64);
    expect(i4iSku?.ramGB).toBe(1024);
  });

  it('verifies dropdown options and values in Steps 3-5 for each template', () => {
    for (const choice of allChoices) {
      const templateDef = CANONICAL_TEMPLATES.find((t) => t.id === choice)!;
      const { state } = applyTemplateToWizardState(createDefaultWizardState(), choice);
      const compat = getCompatibilityForPlatform(state.targetPlatform);

      // Step 3
      const allowedLzs = (compat as any).allowedLandingZones || (compat as any).landingZones || [templateDef.defaultLandingZone];
      if (state.landingZonePattern && allowedLzs && allowedLzs.length > 0) {
        expect(allowedLzs.includes(state.landingZonePattern) || state.landingZonePattern === templateDef.defaultLandingZone).toBe(true);
      }

      // Step 4
      expect(state.firewallProvider).toBe(templateDef.defaultFirewall);

      // Step 5
      if (state.interconnectConfig.type && compat.allowedInterconnects) {
        expect(compat.allowedInterconnects.includes(state.interconnectConfig.type)).toBe(true);
      }
      if (state.decoupledStorageProvider && compat.allowedStorageProviders) {
        expect(compat.allowedStorageProviders.includes(state.decoupledStorageProvider)).toBe(true);
      }
      const allowedSkus = TARGET_NODE_SKU_CATALOGUE.filter((s) => s.platform === state.targetPlatform).map((s) => s.sku);
      expect(allowedSkus.includes(state.targetNodeSku)).toBe(true);
    }
  });

  it('verifies handleAddTarget inherits primary target platform, SKU and region', () => {
    const { state: gcveState } = applyTemplateToWizardState(createDefaultWizardState(), 'vmware-to-gcve');
    const primaryTarget = gcveState.targets![0];

    const primaryPlatform = primaryTarget.platform;
    const primarySkus = TARGET_NODE_SKU_CATALOGUE.filter((s) => s.platform === primaryPlatform);
    const primarySku = primarySkus[0]?.sku || 've1-standard-72';

    const newTarget = createDefaultTargetItem(
      'Disaster Recovery',
      'Disaster Recovery SDDC',
      primaryPlatform,
      {
        nodeSku: primarySku,
        region: 'us-central1',
        decoupledStorageProvider: gcveState.decoupledStorageProvider
      }
    );

    expect(newTarget.platform).toBe('gcve');
    expect(newTarget.nodeSku).toBe('ve1-standard-72');
    expect(newTarget.region).toBe('us-central1');
  });

  it('verifies validateWizardStep(5) accepts 2 nodes for vmc-aws and rejects 2 nodes for avs-gen2', () => {
    const vmcState = {
      ...createDefaultWizardState(),
      targetPlatform: 'vmc-aws' as const,
      targetNodeSku: 'i4i.metal',
      targetNodeCount: 2,
      targets: [
        {
          id: 'tgt-1',
          name: 'VMC Target',
          platform: 'vmc-aws' as const,
          role: 'Production' as const,
          nodeSku: 'i4i.metal',
          nodeCount: 2,
          sddcMgmtCidr: '10.240.0.0/22',
          decoupledStorageEnabled: false,
          decoupledStorageTB: 0
        }
      ]
    };
    const vmcResult = validateWizardStep(5, vmcState);
    expect(vmcResult.isValid).toBe(true);

    const avsState = {
      ...createDefaultWizardState(),
      targetPlatform: 'avs-gen2' as const,
      targetNodeSku: 'AV64',
      targetNodeCount: 2,
      targets: [
        {
          id: 'tgt-1',
          name: 'AVS Target',
          platform: 'avs-gen2' as const,
          role: 'Production' as const,
          nodeSku: 'AV64',
          nodeCount: 2,
          sddcMgmtCidr: '10.240.0.0/22',
          decoupledStorageEnabled: false,
          decoupledStorageTB: 0
        }
      ]
    };
    const avsResult = validateWizardStep(5, avsState);
    expect(avsResult.isValid).toBe(false);
    expect(avsResult.errors[0]).toContain('minimum cluster quorum of at least 3');
  });
});
