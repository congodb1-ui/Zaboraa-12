import fs from 'fs';
import path from 'path';
import { CANONICAL_TEMPLATES, applyTemplateToWizardState } from '../../utils/architectureCompatibilityRules';
import { createDefaultWizardState, CHOICE_TO_TEMPLATE_ID_MAP } from '../../types/wizardStateAdapter';

const allChoices = [
  'vmware-to-avs',
  'vmware-to-nc2',
  'nutanix-to-nc2',
  'vmware-to-gcve',
  'vmware-to-vmc',
  'custom-path'
] as const;

let mdContent = `# Template State Matrix Summary

## Table 1: Direct WizardState Output Matrix

| template | sourcePlatform | targetPlatform | targetNodeSku | targetNodeCount | storage provider | decoupledStorageTB | landingZonePattern | firewall | interconnect type | migration tool | DR engine | rpoMinutes | rtoMinutes | drStrategy | activeTemplate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

for (const choice of allChoices) {
  const initial = createDefaultWizardState();
  const { state: res } = applyTemplateToWizardState(initial, choice);
  mdContent += `| ${choice} | ${res.sourcePlatform} | ${res.targetPlatform} | ${res.targetNodeSku} | ${res.targetNodeCount} | ${res.decoupledStorageProvider} | ${res.decoupledStorageTB} | ${res.landingZonePattern} | ${res.firewallProvider} | ${res.interconnectConfig.type} | ${res.otherServicesConfig.migrationAppliance} | ${res.drConfig.engine} | ${res.drConfig.rpoMinutes} | ${res.drConfig.rtoMinutes} | ${res.drConfig.strategy} | ${res.activeTemplate} |\n`;
}

mdContent += `
## Table 2: Target[0] and Source[0] Derived Output Matrix

| template | source[0].platform | target[0].platform | target[0].nodeSku | target[0].nodeCount | target[0].storage provider | target[0].decoupledStorageTB | target[0].interconnectCircuitType | target[0].migrationTool | DR target drEngine | DR target drRpoMinutes | DR target drRtoMinutes | DR target drStrategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

for (const choice of allChoices) {
  const initial = createDefaultWizardState();
  const { state: res } = applyTemplateToWizardState(initial, choice);
  const src0 = res.sources![0];
  const prodTarget = res.targets!.find(t => t.role === 'Production') || res.targets![0];
  const drTarget = res.targets!.find(t => t.role === 'Disaster Recovery');

  mdContent += `| ${choice} | ${src0.platform} | ${prodTarget.platform} | ${prodTarget.nodeSku} | ${prodTarget.nodeCount} | ${prodTarget.decoupledStorageProvider} | ${prodTarget.decoupledStorageTB} | ${prodTarget.interconnectCircuitType} | ${prodTarget.migrationTool} | ${drTarget ? drTarget.drEngine : 'N/A'} | ${drTarget ? drTarget.drRpoMinutes : 'N/A'} | ${drTarget ? drTarget.drRtoMinutes : 'N/A'} | ${drTarget ? drTarget.drStrategy : 'N/A'} |\n`;
}

const outDir = path.join(__dirname, '..', '__output__');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(path.join(outDir, 'template-matrix.md'), mdContent, 'utf-8');
console.log('Successfully written template-matrix.md');
