import { describe, it, expect } from 'vitest';
import { applyTemplateToWizardState, CANONICAL_TEMPLATES } from '../utils/architectureCompatibilityRules';
import { createDefaultWizardState, ArchitectureTemplateChoice, CHOICE_TO_TEMPLATE_ID_MAP } from '../types/wizardStateAdapter';

describe('e2eTemplateFlow Test Suite', () => {
  const templates: ArchitectureTemplateChoice[] = [
    'vmware-to-avs',
    'vmware-to-nc2',
    'nutanix-to-nc2',
    'vmware-to-gcve',
    'vmware-to-vmc',
    'custom-path'
  ];

  it('SEQUENCE 1 — Full cycle: apply each template in order and assert template-owned fields', () => {
    let state = createDefaultWizardState();
    for (const choice of templates) {
      const templateDef = CANONICAL_TEMPLATES.find((t) => t.id === choice)!;
      const { state: nextState } = applyTemplateToWizardState(state, choice);
      state = nextState;

      // Assert active template mapping
      expect(state.activeTemplate).toBe(CHOICE_TO_TEMPLATE_ID_MAP[choice]);

      // Assert template-owned fields
      expect(state.targetPlatform).toBe(templateDef.targetPlatform);
      expect(state.sourcePlatform).toBe(templateDef.sourcePlatform);
      expect(state.targetNodeSku).toBe(templateDef.defaultSku);
      expect(state.targetNodeCount).toBe(templateDef.defaultNodeCount);
      expect(state.landingZonePattern).toBe(templateDef.defaultLandingZone);
      expect(state.firewallProvider).toBe(templateDef.defaultFirewall);
      expect(state.drConfig.engine).toBe(templateDef.defaultDrEngine);
      expect(state.drConfig.rpoMinutes).toBe(templateDef.drRpoMinutes);
      expect(state.drConfig.rtoMinutes).toBe(templateDef.drRtoMinutes);

      // Assert targets[0] sync
      if (state.targets && state.targets.length > 0) {
        expect(state.targets[0].nodeSku).toBe(templateDef.defaultSku);
        expect(state.targets[0].nodeCount).toBe(templateDef.defaultNodeCount);
      }
    }
  });

  it('SEQUENCE 2 — Edit then switch: user edits reset appropriately on template switch', () => {
    // 1. Apply vmware-to-avs
    const avsDef = CANONICAL_TEMPLATES.find((t) => t.id === 'vmware-to-avs')!;
    let { state } = applyTemplateToWizardState(createDefaultWizardState(), 'vmware-to-avs');
    expect(state.targetNodeCount).toBe(avsDef.defaultNodeCount); // 4

    // 2. User edits Step 5 node count to 7
    state = {
      ...state,
      targetNodeCount: 7,
      targets: state.targets.map((t, idx) => (idx === 0 ? { ...t, nodeCount: 7 } : t))
    };
    expect(state.targetNodeCount).toBe(7);

    // 3. Apply vmware-to-vmc
    const vmcDef = CANONICAL_TEMPLATES.find((t) => t.id === 'vmware-to-vmc')!;
    const { state: newState } = applyTemplateToWizardState(state, 'vmware-to-vmc');

    // 4. Assert node count resets to template default 3 (not 7), SKU = i4i.metal, landingZone = AWS Transit Gateway (TGW) Hub
    expect(newState.targetNodeCount).toBe(vmcDef.defaultNodeCount); // 3
    expect(newState.targetNodeSku).toBe('i4i.metal');
    expect(newState.landingZonePattern).toBe('AWS Transit Gateway (TGW) Hub');
    expect(newState.targets[0].nodeCount).toBe(vmcDef.defaultNodeCount);
  });

  it('SEQUENCE 3 — StrictMode double-invoke check: applying template twice produces identical normalized state', () => {
    const initialState = createDefaultWizardState();
    const { state: state1 } = applyTemplateToWizardState(initialState, 'vmware-to-gcve');
    const { state: state2 } = applyTemplateToWizardState(state1, 'vmware-to-gcve');

    // Strip generated random target/source IDs before strict equality comparison
    const sanitizeIds = (s: typeof state1) => ({
      ...s,
      targets: s.targets.map(({ id, ...rest }) => rest),
      sources: s.sources.map(({ id, ...rest }) => rest)
    });

    expect(sanitizeIds(state1)).toEqual(sanitizeIds(state2));
  });

  it('SEQUENCE 4 — Customization detection logic', () => {
    const { state: defaultState } = applyTemplateToWizardState(createDefaultWizardState(), 'vmware-to-avs');
    
    // Unedited state has no user customizations relative to template definition
    const hasCustomizationBefore = defaultState.targetNodeCount !== CANONICAL_TEMPLATES.find(t => t.id === 'vmware-to-avs')?.defaultNodeCount;
    expect(hasCustomizationBefore).toBe(false);

    // User edits a field
    const editedState = { ...defaultState, targetNodeCount: 12 };
    const hasCustomizationAfter = editedState.targetNodeCount !== CANONICAL_TEMPLATES.find(t => t.id === 'vmware-to-avs')?.defaultNodeCount;
    expect(hasCustomizationAfter).toBe(true);
  });
});
