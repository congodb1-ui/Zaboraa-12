import { GoogleGenAI } from '@google/genai';

// Rate limiting state in serverless execution memory (per container)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(clientIp) {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientIp) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetAt) {
    clientData.count = 1;
    clientData.resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(clientIp, clientData);
    return true;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  clientData.count += 1;
  rateLimitMap.set(clientIp, clientData);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please wait 60 seconds before generating new architecture proposals.',
    });
  }

  const {
    targetCloud = 'Azure AVS',
    vmCount = 500,
    avgVcpu = 4,
    avgRamGB = 16,
    avgStorageGB = 100,
    vcpuOvercommit = 2.5,
    rpoMinutes = 15,
    rtoHours = 2,
    storageOffloadPercent = 35
  } = req.body || {};

  // Strict input validation
  const numVms = Math.max(10, Math.min(25000, Number(vmCount) || 500));
  const numVcpu = Math.max(1, Math.min(64, Number(avgVcpu) || 4));
  const numRam = Math.max(2, Math.min(512, Number(avgRamGB) || 16));
  const numStorage = Math.max(20, Math.min(10000, Number(avgStorageGB) || 100));
  const overcommit = Math.max(1.0, Math.min(5.0, Number(vcpuOvercommit) || 2.5));

  // Proprietary deterministic architectural sizing calculations (Kept strictly server-side)
  const totalEffectiveVcpus = (numVms * numVcpu) / overcommit;
  const totalRamGB = numVms * numRam * 1.2; // 20% buffer
  const rawStorageTB = (numVms * numStorage) / 1024;
  const storageOffloadTB = rawStorageTB * (Number(storageOffloadPercent) / 100);
  const vSANStorageTB = rawStorageTB - storageOffloadTB;

  // Compute node recommendations per hyperscaler host class
  let recommendedNodeCount = 3;
  let recommendedHostType = 'AV36P';
  let decoupledStorageEngine = 'Azure NetApp Files (Premium)';
  let estimatedMonthlySavingsUsd = 12400;

  if (targetCloud.includes('Azure') || targetCloud.includes('AVS')) {
    recommendedHostType = 'AV36P (36 cores, 768 GB RAM, 15.36 TB vSAN)';
    const nodesByCompute = Math.ceil(totalEffectiveVcpus / 36);
    const nodesByRam = Math.ceil(totalRamGB / 768);
    recommendedNodeCount = Math.max(3, Math.max(nodesByCompute, nodesByRam));
    decoupledStorageEngine = 'Azure NetApp Files (Premium NFS Datastore)';
    estimatedMonthlySavingsUsd = Math.round(recommendedNodeCount * 1450);
  } else if (targetCloud.includes('AWS') || targetCloud.includes('VMC')) {
    recommendedHostType = 'i4i.metal (64 cores, 1024 GB RAM, 30 TB NVMe)';
    const nodesByCompute = Math.ceil(totalEffectiveVcpus / 64);
    const nodesByRam = Math.ceil(totalRamGB / 1024);
    recommendedNodeCount = Math.max(3, Math.max(nodesByCompute, nodesByRam));
    decoupledStorageEngine = 'Amazon FSx for NetApp ONTAP (Multi-AZ)';
    estimatedMonthlySavingsUsd = Math.round(recommendedNodeCount * 1800);
  } else if (targetCloud.includes('Google') || targetCloud.includes('GCVE')) {
    recommendedHostType = 've1-standard-72 (72 vCPU, 768 GB RAM, 19.2 TB vSAN)';
    const nodesByCompute = Math.ceil(totalEffectiveVcpus / 72);
    const nodesByRam = Math.ceil(totalRamGB / 768);
    recommendedNodeCount = Math.max(3, Math.max(nodesByCompute, nodesByRam));
    decoupledStorageEngine = 'Google Cloud NetApp Volumes (Extreme Tier)';
    estimatedMonthlySavingsUsd = Math.round(recommendedNodeCount * 1550);
  } else {
    // Nutanix NC2
    recommendedHostType = 'AN36 / i3en.metal (AHV / Nutanix DSF)';
    const nodesByCompute = Math.ceil(totalEffectiveVcpus / 36);
    const nodesByRam = Math.ceil(totalRamGB / 768);
    recommendedNodeCount = Math.max(3, Math.max(nodesByCompute, nodesByRam));
    decoupledStorageEngine = 'Nutanix Distributed Storage Fabric (RF2 Dedup/Compression)';
    estimatedMonthlySavingsUsd = Math.round(recommendedNodeCount * 1350);
  }

  const proposal = {
    summary: `${targetCloud} Architecture Recommendation for ${numVms.toLocaleString()} Enterprise Workloads`,
    targetCloud,
    sizing: {
      vmCount: numVms,
      recommendedHostType,
      recommendedNodeCount,
      totalRamProvisionedGB: Math.round(totalRamGB),
      vSANStorageTB: Number(vSANStorageTB.toFixed(1)),
      decoupledStorageTB: Number(storageOffloadTB.toFixed(1)),
      decoupledStorageEngine,
      estimatedMonthlyTcoSavingsUsd: estimatedMonthlySavingsUsd,
      ratioSavingsPercent: Math.round((storageOffloadTB / (rawStorageTB || 1)) * 32)
    },
    resilienceSla: {
      targetRpoMinutes: rpoMinutes,
      targetRtoHours: rtoHours,
      clusterAvailabilityTarget: '99.99%',
      highAvailabilityPolicy: 'N+1 Host Redundancy + Automated Failover'
    },
    securityHardening: [
      'Microsegmentation: Distributed Firewall (DFW) zero-trust East-West inspection',
      'Data-at-Rest Encryption: Cloud Provider Native KMS Customer-Managed Keys (CMK)',
      'Network Isolation: Dedicated ExpressRoute/DirectConnect cross-connect via Transit Gateway/vWAN',
      'Identity: SAML 2.0 / OIDC Federation with strict role-based access control (RBAC)'
    ],
    governanceNotice: 'Architectural proposal generated via server-side validation. Human architect review and approval is required before applying changes to live cloud blueprints.',
    generatedAt: new Date().toISOString()
  };

  return res.status(200).json({
    success: true,
    proposal
  });
}
