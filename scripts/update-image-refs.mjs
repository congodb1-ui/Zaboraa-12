import fs from 'node:fs';
import path from 'node:path';

const FILES_TO_UPDATE = [
  'src/data/initialData.ts',
  'src/data/mediaAssets.ts',
  'src/pages/AboutPage.tsx',
  'src/pages/tools/DesignGeneratorPage.tsx',
  'src/components/AriaNetworkDeepDiveSection.tsx',
  'src/components/CreateDesignModal.tsx',
  'src/components/CustomizerDrawer.tsx',
  'src/components/FeaturedVideoSection.tsx',
  'src/components/MigrationStrategyRoadmap.tsx',
  'src/components/NutanixArchitectureDeepDiveSection.tsx',
  'src/components/PhotoEditorModal.tsx',
  'src/components/PlatformEditorModal.tsx',
  'src/components/admin/views/AdminMediaView.tsx',
  'src/components/admin/views/AdminProfileView.tsx',
  'src/components/admin/views/AdminSettingsView.tsx',
  'src/services/adminService.ts'
];

for (const relPath of FILES_TO_UPDATE) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;

  let content = fs.readFileSync(fullPath, 'utf-8');

  // Replace all /assets/images/(name).jpg or /assets/images/(name).png (except zaboraa-logo) with .webp
  content = content.replace(/\/assets\/images\/(?!zaboraa-logo)([^"'\s]+)\.(jpg|png)/gi, (match, baseName) => {
    return `/assets/images/${baseName}.webp`;
  });

  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`[Updated image refs] ${relPath}`);
}
