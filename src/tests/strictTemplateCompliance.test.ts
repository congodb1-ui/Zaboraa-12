import { describe, it, expect } from 'vitest';
import { CANONICAL_TEMPLATES, applyTemplateToWizardState } from '../utils/architectureCompatibilityRules';
import { DEFAULT_ADMIN_TEMPLATES } from '../utils/adminParameterControls';
import { createDefaultWizardState, CHOICE_TO_TEMPLATE_ID_MAP } from '../types/wizardStateAdapter';

describe('Strict Template Application Compliance Test', () => {
  const allChoices = [
    'vmware-to-avs',
    'vmware-to-nc2',
    'nutanix-to-nc2',
    'vmware-to-gcve',
    'vmware-to-vmc',
    'custom-path'
  ] as const;

  for (const choice of allChoices) {
    it(`applies template ${choice} cleanly from default state and from every other template state`, () => {
      const templateDef = CANONICAL_TEMPLATES.find((t) => t.id === choice)!;
      const adminDef = DEFAULT_ADMIN_TEMPLATES.find((t) => t.id === choice)!;
      const expectedActiveTemplate = CHOICE_TO_TEMPLATE_ID_MAP[choice];

      // Test start states: default state, plus state after applying each choice
      const startStates = [
        createDefaultWizardState(),
        ...allChoices.map((otherChoice) => applyTemplateToWizardState(createDefaultWizardState(), otherChoice).state)
      ];

      for (const startState of startStates) {
        const { state: res } = applyTemplateToWizardState(startState, choice);

        // 1. Assert CANONICAL_TEMPLATES vs DEFAULT_ADMIN_TEMPLATES match
        expect(adminDef.targetPlatform, `[${choice}] admin targetPlatform`).toBe(templateDef.targetPlatform);
        expect(adminDef.sourcePlatform, `[${choice}] admin sourcePlatform`).toBe(templateDef.sourcePlatform);
        expect(adminDef.nodeSku || adminDef.defaultSku, `[${choice}] admin nodeSku`).toBe(templateDef.defaultSku);
        expect(adminDef.recommendedNodes || adminDef.defaultNodeCount, `[${choice}] admin recommendedNodes`).toBe(templateDef.defaultNodeCount);
        expect(adminDef.landingZone || adminDef.defaultLandingZone, `[${choice}] admin landingZone`).toBe(templateDef.defaultLandingZone);
        expect(adminDef.firewall || adminDef.defaultFirewall, `[${choice}] admin firewall`).toBe(templateDef.defaultFirewall);
        expect(adminDef.interconnect || adminDef.defaultInterconnect, `[${choice}] admin interconnect`).toBe(templateDef.defaultInterconnect);
        expect(adminDef.storage || adminDef.defaultStorage, `[${choice}] admin storage`).toBe(templateDef.defaultStorage);
        expect(adminDef.storageTB || adminDef.defaultStorageTB, `[${choice}] admin storageTB`).toBe(templateDef.defaultStorageTB);
        expect(adminDef.drEngine || adminDef.defaultDrEngine, `[${choice}] admin drEngine`).toBe(templateDef.defaultDrEngine);
        expect(adminDef.drRpoMinutes, `[${choice}] admin drRpoMinutes`).toBe(templateDef.drRpoMinutes);
        expect(adminDef.drRtoMinutes, `[${choice}] admin drRtoMinutes`).toBe(templateDef.drRtoMinutes);
        expect(adminDef.drStrategy || adminDef.strategy, `[${choice}] admin drStrategy`).toBe(templateDef.drStrategy || templateDef.strategy);
        expect(adminDef.recommendedMigrationTool, `[${choice}] admin recommendedMigrationTool`).toBe(templateDef.recommendedMigrationTool);

        // 2. Assert wizard state fields exactly match CANONICAL_TEMPLATES
        expect(res.templateChoice, `[${choice}] templateChoice`).toBe(choice);
        expect(res.activeTemplate, `[${choice}] activeTemplate`).toBe(expectedActiveTemplate);
        expect(res.targetPlatform, `[${choice}] targetPlatform`).toBe(templateDef.targetPlatform);
        expect(res.sourcePlatform, `[${choice}] sourcePlatform`).toBe(templateDef.sourcePlatform);
        expect(res.targetNodeSku, `[${choice}] targetNodeSku`).toBe(templateDef.defaultSku);
        expect(res.targetNodeCount, `[${choice}] targetNodeCount`).toBe(templateDef.defaultNodeCount);
        expect(res.landingZonePattern, `[${choice}] landingZonePattern`).toBe(templateDef.defaultLandingZone);
        expect(res.firewallProvider, `[${choice}] firewallProvider`).toBe(templateDef.defaultFirewall);
        expect(res.securityNvaConfig.firewall, `[${choice}] securityNvaConfig.firewall`).toBe(templateDef.defaultFirewall);
        expect(res.interconnectConfig.type, `[${choice}] interconnectConfig.type`).toBe(templateDef.defaultInterconnect);
        expect(res.decoupledStorageProvider, `[${choice}] decoupledStorageProvider`).toBe(templateDef.defaultStorage);
        expect(res.decoupledStorageTB, `[${choice}] decoupledStorageTB`).toBe(templateDef.defaultStorageTB);
        expect(res.drConfig.engine, `[${choice}] drConfig.engine`).toBe(templateDef.defaultDrEngine);
        expect(res.drConfig.rpoMinutes, `[${choice}] drConfig.rpoMinutes`).toBe(templateDef.drRpoMinutes);
        expect(res.drConfig.rtoMinutes, `[${choice}] drConfig.rtoMinutes`).toBe(templateDef.drRtoMinutes);
        expect(res.drConfig.strategy, `[${choice}] drConfig.strategy`).toBe(templateDef.drStrategy || templateDef.strategy);
        expect(res.otherServicesConfig.migrationAppliance, `[${choice}] otherServicesConfig.migrationAppliance`).toBe(templateDef.recommendedMigrationTool);

        // 3. Assert targets[0] and sources[0]
        expect(res.sources).toBeDefined();
        expect(res.sources!.length).toBeGreaterThan(0);
        const expectedSourcePlatform = templateDef.sourcePlatform === 'nutanix' ? 'nutanix-onprem' : 'vmware-onprem';
        expect(res.sources![0].platform, `[${choice}] sources[0].platform`).toBe(expectedSourcePlatform);

        expect(res.targets).toBeDefined();
        expect(res.targets!.length).toBeGreaterThan(0);
        const prodTarget = res.targets!.find((t) => t.role === 'Production') || res.targets![0];

        expect(prodTarget.platform, `[${choice}] prodTarget.platform`).toBe(templateDef.targetPlatform);
        expect(prodTarget.nodeSku, `[${choice}] prodTarget.nodeSku`).toBe(templateDef.defaultSku);
        expect(prodTarget.nodeCount, `[${choice}] prodTarget.nodeCount`).toBe(templateDef.defaultNodeCount);
        expect(prodTarget.interconnectCircuitType, `[${choice}] prodTarget.interconnectCircuitType`).toBe(templateDef.defaultInterconnect);
        expect(prodTarget.decoupledStorageProvider, `[${choice}] prodTarget.decoupledStorageProvider`).toBe(templateDef.defaultStorage);
        expect(prodTarget.decoupledStorageTB, `[${choice}] prodTarget.decoupledStorageTB`).toBe(templateDef.defaultStorageTB);
        expect(prodTarget.migrationTool, `[${choice}] prodTarget.migrationTool`).toBe(templateDef.recommendedMigrationTool);

        const drTarget = res.targets!.find((t) => t.role === 'Disaster Recovery');
        if (drTarget) {
          expect(drTarget.drEngine, `[${choice}] drTarget.drEngine`).toBe(templateDef.defaultDrEngine);
          expect(drTarget.drRpoMinutes, `[${choice}] drTarget.drRpoMinutes`).toBe(templateDef.drRpoMinutes);
          expect(drTarget.drRtoMinutes, `[${choice}] drTarget.drRtoMinutes`).toBe(templateDef.drRtoMinutes);
          expect(drTarget.drStrategy, `[${choice}] drTarget.drStrategy`).toBe(templateDef.drStrategy || templateDef.strategy);
        }
      }
    });
  }
});
