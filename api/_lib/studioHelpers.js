import { createClient } from '@supabase/supabase-js';

export const BRIEFING_CTA = "Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing";

export const FORBIDDEN_CLAIMS_PATTERNS = [
  /\b12\+\s*years\b/i,
  /\b40\+\s*migrations\b/i,
  /\b8[x×]\s*certifications?\b/i,
  /\b1,?240\b/i,
  /\b4,?500\b/i,
  /\b820\s*VMs?\b/i,
  /\$1\.4\s*M\b/i,
  /\b38%\s*TCO\b/i,
  /\b24%\s*Capex\b/i,
  /\bZaboraa\s+Technologies\b/i,
  /\b100%\s+zero-downtime\b/i,
  /\bPrincipal\s+Cloud\s+Architect\b/i,
  /\bpricing\b/i,
  /\bmasterclass\b/i,
];

export function checkForbiddenClaims(text) {
  if (!text) return null;
  const str = typeof text === 'string' ? text : JSON.stringify(text);
  for (const pattern of FORBIDDEN_CLAIMS_PATTERNS) {
    if (pattern.test(str)) {
      return pattern.toString();
    }
  }
  return null;
}

export function getServiceRoleSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function fetchDraftById(draftId) {
  const supabase = getServiceRoleSupabase();
  if (!supabase) throw new Error('Supabase client unconfigured on server');
  const { data, error } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (error || !data) {
    throw new Error(`Draft with ID ${draftId} not found`);
  }
  return data;
}

export async function saveGeneratedAsset(draftId, assetType, content) {
  const supabase = getServiceRoleSupabase();
  if (!supabase) return;
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  await supabase.from('generated_assets').insert({
    draft_id: draftId,
    asset_type: assetType,
    content: contentStr,
  });
}

export const TOPIC_TOOL_MAP = {
  'AVS Migrations': { name: 'AVS Sizing Estimator', url: 'https://zaboraa.com/tools/sizing' },
  'Broadcom / VMware Licensing': { name: 'Broadcom Exit Cost Calculator', url: 'https://zaboraa.com/tools/broadcom-exit' },
  'Cloud Sizing / FinOps': { name: 'Cloud Sizing Calculator', url: 'https://zaboraa.com/tools/sizing' },
  'Multi-Hyperscaler Strategy': { name: 'Multi-Cloud Estimator', url: 'https://zaboraa.com/tools/sizing' },
  'Modernization Without Rewrite': { name: 'Blueprint Generator', url: 'https://zaboraa.com/tools/blueprint' },
  'Zaboraa Proof / Case Studies': { name: 'RVTools Analyzer', url: 'https://zaboraa.com/tools/rvtools' },
};

export const VALID_PUBLIC_ROUTES = [
  'https://zaboraa.com',
  'https://zaboraa.com/',
  'https://zaboraa.com/about',
  'https://zaboraa.com/briefing',
  'https://zaboraa.com/case-studies',
  'https://zaboraa.com/resources',
  'https://zaboraa.com/resources/kb',
  'https://zaboraa.com/resources/tutorials',
  'https://zaboraa.com/tools',
  'https://zaboraa.com/tools/sizing',
  'https://zaboraa.com/tools/broadcom-exit',
  'https://zaboraa.com/tools/rvtools',
  'https://zaboraa.com/tools/blueprint',
  'https://zaboraa.com/tools/dr-planner',
  'https://zaboraa.com/tools/aria-networks'
];
