import { describe, it, expect } from 'vitest';
import {
  CANONICAL_TEMPLATES,
  getCompatibilityForPlatform,
  sanitizeWizardStateForTemplate,
  applyTemplateToWizardState,
  validateWizardStep
} from '../utils/architectureCompatibilityRules';
import {
  createDefaultWizardState,
  WizardState,
  reconcileTargetsForObjective
} from '../types/wizardStateAdapter';
import { getAdminControlState } from '../utils/adminParameterControls';

describe('Wizard & Architecture Compatibility Engine', () => {
  it('provides all 5 core hyperscaler templates plus hybrid paths', () => {
    const templateIds = CANONICAL_TEMPLATES.map((t) => t.id);
    expect(templateIds).toContain('vmware-to-avs');
    expect(templateIds).toContain('vmware-to-nc2');
    expect(templateIds).toContain('nutanix-to-nc2');
    expect(templateIds).toContain('vmware-to-gcve');
    expect(templateIds).toContain('vmware-to-vmc');
    expect(templateIds).toContain('custom-path');
  });

  it('filters incompatible migration tools strictly based on target platform', () => {
    const avsCompat = getCompatibilityForPlatform('avs-gen2');
    expect(avsCompat.allowedMigrationTools).toContain('VMware HCX Enterprise');
    expect(avsCompat.allowedMigrationTools).not.toContain('Nutanix Move');

    const nc2Compat = getCompatibilityForPlatform('nc2-azure');
    expect(nc2Compat.allowedMigrationTools).toContain('Nutanix Move');
    expect(nc2Compat.allowedMigrationTools).not.toContain('VMware HCX Enterprise');
  });

  it('clears stale migration tools and storage when switching from AVS to Nutanix NC2', () => {
    const initial = createDefaultWizardState();
    expect(initial.otherServicesConfig.migrationAppliance).toBe('VMware HCX Enterprise');
    expect(initial.otherServicesConfig.decoupledStorageProvider).toBe('Azure NetApp Files (ANF NFS Datastore)');

    const { state: updated, clearedNotices } = sanitizeWizardStateForTemplate(initial, 'nutanix-to-nc2');
    expect(updated.targetPlatform).toBe('nc2-azure');
    expect(updated.sourcePlatform).toBe('nutanix');
    expect(updated.otherServicesConfig.migrationAppliance).toBe('Nutanix Move');
    expect(updated.otherServicesConfig.decoupledStorageProvider).toBe('Native Nutanix Distributed Storage Fabric (DSF)');
    expect(clearedNotices.length).toBeGreaterThan(0);
  });

  it('validates Step 1 required objective and deployment scope', () => {
    const state = createDefaultWizardState();
    const validCheck = validateWizardStep(1, state);
    expect(validCheck.isValid).toBe(true);

    const invalidState: WizardState = {
      ...state,
      objective: '' as any
    };
    const invalidCheck = validateWizardStep(1, invalidState);
    expect(invalidCheck.isValid).toBe(false);
    expect(invalidCheck.errors[0]).toContain('objective');
  });

  it('enforces Step 1 rules: Migration Only permits exactly 1 target (Production)', () => {
    const state = createDefaultWizardState();
    state.objective = 'migration-only';
    state.targets = [
      {
        id: 'tgt-1',
        name: 'Target 1',
        platform: 'avs-gen2',
        role: 'Production',
        nodeSku: 'AV64',
        nodeCount: 4,
        sddcMgmtCidr: '10.240.0.0/22',
        decoupledStorageEnabled: false,
        decoupledStorageTB: 0
      },
      {
        id: 'tgt-2',
        name: 'Target 2',
        platform: 'avs-gen2',
        role: 'Production',
        nodeSku: 'AV64',
        nodeCount: 4,
        sddcMgmtCidr: '10.244.0.0/22',
        decoupledStorageEnabled: false,
        decoupledStorageTB: 0
      }
    ];

    // Fails because multiple targets are present
    const checkMultiple = validateWizardStep(1, state);
    expect(checkMultiple.isValid).toBe(false);
    expect(checkMultiple.errors[0]).toContain('allows exactly one target');

    // Fails if single target has Disaster Recovery role
    state.targets = [
      {
        id: 'tgt-1',
        name: 'Target 1',
        platform: 'avs-gen2',
        role: 'Disaster Recovery',
        nodeSku: 'AV64',
        nodeCount: 4,
        sddcMgmtCidr: '10.240.0.0/22',
        decoupledStorageEnabled: false,
        decoupledStorageTB: 0
      }
    ];
    const checkDr = validateWizardStep(1, state);
    expect(checkDr.isValid).toBe(false);
    expect(checkDr.errors[0]).toContain('cannot include a Disaster Recovery target');

    // Passes when exactly 1 Production target
    state.targets[0].role = 'Production';
    const checkValid = validateWizardStep(1, state);
    expect(checkValid.isValid).toBe(true);
  });

  it('enforces Step 1 rules: Setup DR permits exactly 1 target with role Disaster Recovery', () => {
    const state = createDefaultWizardState();
    state.objective = 'setup-dr';
    state.targets = [
      {
        id: 'tgt-1',
        name: 'Target 1',
        platform: 'avs-gen2',
        role: 'Production',
        nodeSku: 'AV64',
        nodeCount: 3,
        sddcMgmtCidr: '10.240.0.0/22',
        decoupledStorageEnabled: false,
        decoupledStorageTB: 0
      }
    ];

    // Fails because role is Production instead of Disaster Recovery
    const checkRole = validateWizardStep(1, state);
    expect(checkRole.isValid).toBe(false);
    expect(checkRole.errors[0]).toContain('Disaster Recovery role');

    // Passes when role is Disaster Recovery
    state.targets[0].role = 'Disaster Recovery';
    const checkValid = validateWizardStep(1, state);
    expect(checkValid.isValid).toBe(true);
  });

  it('enforces Step 1 rules: Migrate and Setup DR allows multiple targets', () => {
    const state = createDefaultWizardState();
    state.objective = 'migrate-and-dr';
    state.targets = [
      {
        id: 'tgt-1',
        name: 'Production SDDC',
        platform: 'avs-gen2',
        role: 'Production',
        nodeSku: 'AV64',
        nodeCount: 4,
        sddcMgmtCidr: '10.240.0.0/22',
        decoupledStorageEnabled: false,
        decoupledStorageTB: 0
      },
      {
        id: 'tgt-2',
        name: 'DR SDDC',
        platform: 'avs-gen2',
        role: 'Disaster Recovery',
        nodeSku: 'AV64',
        nodeCount: 3,
        sddcMgmtCidr: '10.244.0.0/22',
        decoupledStorageEnabled: false,
        decoupledStorageTB: 0
      }
    ];

    const check = validateWizardStep(1, state);
    expect(check.isValid).toBe(true);
  });

  it('reconciles targets non-destructively when switching architectural objective', () => {
    const multiTargets = [
      {
        id: 'tgt-1',
        name: 'Primary Prod',
        platform: 'avs-gen2' as const,
        role: 'Production' as const,
        nodeSku: 'AV64',
        nodeCount: 4,
        sddcMgmtCidr: '10.240.0.0/22',
        decoupledStorageEnabled: true,
        decoupledStorageTB: 120
      },
      {
        id: 'tgt-2',
        name: 'Secondary DR',
        platform: 'avs-gen2' as const,
        role: 'Disaster Recovery' as const,
        nodeSku: 'AV64',
        nodeCount: 3,
        sddcMgmtCidr: '10.244.0.0/22',
        decoupledStorageEnabled: false,
        decoupledStorageTB: 0
      }
    ];

    // Switching to migration-only: clamps to 1 target, sets role to Production, preserves config
    const resMigrate = reconcileTargetsForObjective('migration-only', multiTargets);
    expect(resMigrate.reconciledTargets.length).toBe(1);
    expect(resMigrate.reconciledTargets[0].role).toBe('Production');
    expect(resMigrate.reconciledTargets[0].nodeSku).toBe('AV64');
    expect(resMigrate.drEnabled).toBe(false);
    expect(resMigrate.reconciliationNotice).toContain('Migration Only');

    // Switching to setup-dr: clamps to 1 target, sets role to Disaster Recovery
    const resDr = reconcileTargetsForObjective('setup-dr', multiTargets);
    expect(resDr.reconciledTargets.length).toBe(1);
    expect(resDr.reconciledTargets[0].role).toBe('Disaster Recovery');
    expect(resDr.drEnabled).toBe(true);
  });

  it('validates Step 2 required customer name and valid CIDR', () => {
    const state = createDefaultWizardState();
    const validCheck = validateWizardStep(2, state);
    expect(validCheck.isValid).toBe(true);

    const invalidCidrState: WizardState = {
      ...state,
      sourceMgmtCidr: 'invalid-ip-format'
    };
    const invalidCheck = validateWizardStep(2, invalidCidrState);
    expect(invalidCheck.isValid).toBe(false);
    expect(invalidCheck.errors[0]).toContain('CIDR');
  });

  it('validates Step 2 with multiple source infrastructures correctly', () => {
    const state = createDefaultWizardState();
    state.sources = [
      {
        id: 'src-1',
        name: 'VMware DC 1',
        platform: 'vmware-onprem',
        mgmtCidr: '10.10.0.0/16',
        workloadVmsCount: 300,
        clusters: [
          {
            id: 'c-1',
            name: 'Compute Cluster 1',
            hostCount: 8,
            sockets: 2,
            coresPerSocket: 32,
            hyperthreading: true,
            ramGB: 768,
            storageTB: 20
          }
        ]
      },
      {
        id: 'src-2',
        name: 'Nutanix Branch',
        platform: 'nutanix-onprem',
        mgmtCidr: '10.20.0.0/16',
        workloadVmsCount: 150,
        clusters: [
          {
            id: 'c-2',
            name: 'AHV Cluster 1',
            hostCount: 4,
            sockets: 2,
            coresPerSocket: 32,
            hyperthreading: true,
            ramGB: 512,
            storageTB: 15
          }
        ]
      }
    ];

    const validCheck = validateWizardStep(2, state);
    expect(validCheck.isValid).toBe(true);

    // Fail if one source has invalid CIDR
    state.sources[1].mgmtCidr = 'invalid-cidr';
    const invalidCidrCheck = validateWizardStep(2, state);
    expect(invalidCidrCheck.isValid).toBe(false);
    expect(invalidCidrCheck.errors[0]).toContain('CIDR');

    // Fail if one source has 0 hosts
    state.sources[1].mgmtCidr = '10.20.0.0/16';
    state.sources[1].clusters[0].hostCount = 0;
    const invalidHostCheck = validateWizardStep(2, state);
    expect(invalidHostCheck.isValid).toBe(false);
    expect(invalidHostCheck.errors[0]).toContain('At least 1 compute host');
  });

  it('validates Step 5 with multiple targets and quorum rules', () => {
    const state = createDefaultWizardState();
    state.objective = 'migrate-and-dr';
    state.targets = [
      {
        id: 'tgt-1',
        name: 'Primary AVS SDDC',
        platform: 'avs-gen2',
        role: 'Production',
        nodeSku: 'AV64',
        nodeCount: 4,
        sddcMgmtCidr: '10.240.0.0/22',
        decoupledStorageEnabled: true,
        decoupledStorageTB: 100
      },
      {
        id: 'tgt-2',
        name: 'Secondary DR SDDC',
        platform: 'avs-gen2',
        role: 'Disaster Recovery',
        nodeSku: 'AV64',
        nodeCount: 3,
        sddcMgmtCidr: '10.244.0.0/22',
        decoupledStorageEnabled: false,
        decoupledStorageTB: 0
      }
    ];

    const check = validateWizardStep(5, state);
    expect(check.isValid).toBe(true);

    // Fails if target has under quorum nodes (e.g. 2 nodes on AVS)
    state.targets[1].nodeCount = 2;
    const underQuorumCheck = validateWizardStep(5, state);
    expect(underQuorumCheck.isValid).toBe(false);
    expect(underQuorumCheck.errors[0]).toContain('minimum cluster quorum of at least 3');
  });

  it('ADDENDUM test: custom-path differs from vmware-to-avs in objective, DR strategy and L2 extension', () => {
    const avsTpl = CANONICAL_TEMPLATES.find(t => t.id === 'vmware-to-avs')!;
    const customTpl = CANONICAL_TEMPLATES.find(t => t.id === 'custom-path')!;

    expect(customTpl.targetPlatform).toBe('avs-gen2');
    expect(customTpl.drStrategy).toBe('Warm Standby (Full Cluster)');
    expect(customTpl.drStrategy).not.toEqual(avsTpl.drStrategy);

    const initial = createDefaultWizardState();
    const { state: appliedAvs } = applyTemplateToWizardState(initial, 'vmware-to-avs');
    const { state: appliedCustom } = applyTemplateToWizardState(initial, 'custom-path');

    expect(appliedCustom.objective).toBe('extend-dc');
    expect(appliedCustom.objective).not.toEqual(appliedAvs.objective);
    expect(appliedCustom.interconnectConfig.layer2Extension).toBe(true);
    expect(appliedCustom.drConfig.strategy).toBe('Warm Standby (Full Cluster)');
    expect(appliedCustom.drConfig.strategy).not.toEqual(appliedAvs.drConfig.strategy);
  });

  it('ADDENDUM test: getAdminControlState corrects invalid localStorage template values', () => {
    const mockInvalidTemplates = [
      {
        id: 'vmware-to-avs',
        targetPlatform: 'hybrid-mesh', // invalid platform
        firewall: 'AWS Network Firewall & Fortinet FortiGate', // invalid firewall string
        landingZone: 'Non-Existent LZ String', // invalid LZ string
        drEngine: 'VMware SRM' // invalid DR string
      }
    ];

    const store: Record<string, string> = {};
    const originalGetItem = globalThis.localStorage?.getItem;
    const originalSetItem = globalThis.localStorage?.setItem;

    // Simulate localStorage environment
    const fakeLocalStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; }
    };

    Object.defineProperty(globalThis, 'window', { value: { localStorage: fakeLocalStorage, dispatchEvent: () => {} }, writable: true });
    Object.defineProperty(globalThis, 'localStorage', { value: fakeLocalStorage, writable: true });

    localStorage.setItem('zaboraa_admin_param_controls', JSON.stringify({ templates: mockInvalidTemplates }));

    const adminState = getAdminControlState();
    const avs = adminState.templates.find(t => t.id === 'vmware-to-avs')!;

    expect(avs.targetPlatform).toBe('avs-gen2');
    expect(avs.firewall).toBe('Palo Alto Networks VM-Series');
    expect(avs.landingZone).toBe('Azure Virtual WAN Hub-and-Spoke');
    expect(avs.drEngine).toBe('VMware Site Recovery Manager (SRM) + vSphere Replication');
  });

  it('ADDENDUM test: applying all 6 templates updates all template-owned fields and targets[]', () => {
    const initial = createDefaultWizardState();
    const templateChoices = [
      'vmware-to-avs',
      'vmware-to-nc2',
      'nutanix-to-nc2',
      'vmware-to-gcve',
      'vmware-to-vmc',
      'custom-path'
    ] as const;

    for (const choice of templateChoices) {
      const { state: res } = applyTemplateToWizardState(initial, choice);
      expect(res.templateChoice).toBe(choice);
      expect(res.targets).toBeDefined();
      expect(res.targets!.length).toBeGreaterThan(0);
      const prodTarget = res.targets!.find(t => t.role === 'Production') || res.targets![0];
      expect(prodTarget.platform).toBe(res.targetPlatform);
      expect(prodTarget.nodeSku).toBe(res.targetNodeSku);
      expect(prodTarget.interconnectCircuitType).toBe(res.interconnectConfig.type);
    }
  });
});
