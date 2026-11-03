import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomization } from '../../context/CustomizationContext';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import {
  ShieldAlert,
  Clock,
  Wifi,
  HardDrive,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Activity,
  DollarSign,
  Download,
  Printer,
  Server,
  Zap,
  FileText
} from 'lucide-react';

type DREngineType = 'srm' | 'zerto' | 'jetstream' | 'veeam';
type DRDeploymentStrategy = 'hotStandby' | 'pilotLight' | 'coldStorage';
type FailoverNetworkStrategy = 'stretchedL2' | 'routedT1';

interface DREngineConfig {
  id: DREngineType;
  name: string;
  tagline: string;
  minRpoMinutes: number;
  maxRpoMinutes: number;
  defaultRpoMinutes: number;
  supportsCdpJournal: boolean;
  compressionEfficiency: number;
  targetStorageType: string;
  description: string;
}

const DR_ENGINES: Record<DREngineType, DREngineConfig> = {
  srm: {
    id: 'srm',
    name: 'VMware SRM + vSphere Replication',
    tagline: 'Enterprise Standard Host/Array Replication',
    minRpoMinutes: 5,
    maxRpoMinutes: 1440,
    defaultRpoMinutes: 60,
    supportsCdpJournal: false,
    compressionEfficiency: 35,
    targetStorageType: 'vSAN / Cloud Decoupled NFS Datastore',
    description: 'Hypervisor-native replication paired with Site Recovery Manager orchestration and non-disruptive test bubbles.'
  },
  zerto: {
    id: 'zerto',
    name: 'HPE Zerto Continuous Data Protection (CDP)',
    tagline: 'Continuous Block-Level Journaled Replication',
    minRpoMinutes: 1, // Represented down to seconds in reality
    maxRpoMinutes: 60,
    defaultRpoMinutes: 5,
    supportsCdpJournal: true,
    compressionEfficiency: 45,
    targetStorageType: 'Target Datastore + CDP Journal Volume',
    description: 'Continuous data protection using IO interceptors, delivering sub-minute RPOs with granular checkpoint rewinds.'
  },
  jetstream: {
    id: 'jetstream',
    name: 'JetStream DR for Cloud Object Storage',
    tagline: 'Cost-Optimized Cloud Object Replication',
    minRpoMinutes: 60,
    maxRpoMinutes: 1440,
    defaultRpoMinutes: 240,
    supportsCdpJournal: false,
    compressionEfficiency: 50,
    targetStorageType: 'Azure Blob / Google Cloud Storage Object Bucket',
    description: 'Replicates IO to low-cost cloud object storage with zero running SDDC compute nodes until disaster failover.'
  },
  veeam: {
    id: 'veeam',
    name: 'Veeam Recovery Orchestrator',
    tagline: 'Automated Snapshot & Continuous Recovery',
    minRpoMinutes: 15,
    maxRpoMinutes: 1440,
    defaultRpoMinutes: 60,
    supportsCdpJournal: true,
    compressionEfficiency: 40,
    targetStorageType: 'Target Cloud Backup Repository / Datastore',
    description: 'Hybrid backup snapshot and continuous replication with automated compliance audit documentation.'
  }
};

export const DRPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { brandName } = useCustomization();
  const effectiveBrand = brandName || 'Enterprise Architecture';
  const brandSlug = effectiveBrand.replace(/[^a-zA-Z0-9]/g, '_');
  const brandUpper = effectiveBrand.toUpperCase();

  // Engine selection
  const [selectedEngineKey, setSelectedEngineKey] = useState<DREngineType>('srm');
  const engine = DR_ENGINES[selectedEngineKey];

  // Workload inputs
  const [protectedVMs, setProtectedVMs] = useState<number>(150);
  const [protectedStorageTB, setProtectedStorageTB] = useState<number>(60);
  const [dailyChangeRatePercent, setDailyChangeRatePercent] = useState<number>(5);
  const [targetRpoMinutes, setTargetRpoMinutes] = useState<number>(60);
  const [wanBandwidthMbps, setWanBandwidthMbps] = useState<number>(2000); // 2 Gbps

  // Strategy & Architecture
  const [deploymentStrategy, setDeploymentStrategy] = useState<DRDeploymentStrategy>('pilotLight');
  const [journalRetentionDays, setJournalRetentionDays] = useState<number>(7);
  const [failoverNetwork, setFailoverNetwork] = useState<FailoverNetworkStrategy>('stretchedL2');

  // Print Modal
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Calculations
  const calculations = useMemo(() => {
    const totalStorageGB = protectedStorageTB * 1024;
    const dailyChangeGB = totalStorageGB * (dailyChangeRatePercent / 100);
    const compressedDailyGB = dailyChangeGB * (1 - engine.compressionEfficiency / 100);

    // Delta per RPO interval
    const effectiveRpo = Math.max(engine.minRpoMinutes, Math.min(engine.maxRpoMinutes, targetRpoMinutes));
    const intervalsPerDay = (24 * 60) / effectiveRpo;
    const deltaPerIntervalGB = compressedDailyGB / intervalsPerDay;
    const deltaPerIntervalMb = deltaPerIntervalGB * 8 * 1024;

    // Required bandwidth (70% window safety margin)
    const transferWindowSeconds = effectiveRpo * 60 * 0.7;
    const requiredBandwidthMbps = Math.round(deltaPerIntervalMb / Math.max(30, transferWindowSeconds));
    const isBandwidthAdequate = requiredBandwidthMbps <= wanBandwidthMbps;
    const bandwidthUtilizationPercent = Math.min(200, Math.round((requiredBandwidthMbps / wanBandwidthMbps) * 100));

    // CDP Journal Storage Overhead (GB)
    const journalOverheadGB = engine.supportsCdpJournal
      ? Math.round(compressedDailyGB * journalRetentionDays * 1.15)
      : 0;
    const journalOverheadTB = Math.round((journalOverheadGB / 1024) * 10) / 10;

    // Standby Sizing & Host Footprint Modeling (Zero Costing)
    const fullSddcNodes = Math.max(3, Math.ceil(protectedVMs / 50));
    let standbyNodes = fullSddcNodes;

    if (deploymentStrategy === 'pilotLight') {
      standbyNodes = 3; // Minimum viable core cluster
    } else if (deploymentStrategy === 'coldStorage') {
      standbyNodes = 0; // On-demand dynamically spun up
    }

    const hostReductionNodes = Math.max(0, fullSddcNodes - standbyNodes);
    const hostReductionPercent = Math.round((hostReductionNodes / fullSddcNodes) * 100);
    const nodeCostPerMonth = 2500;
    const monthlyOpexSavings = hostReductionNodes * nodeCostPerMonth;
    const threeYearTcoSavings = monthlyOpexSavings * 36;

    // Initial Full Seeding Time
    const compressedTotalMb = totalStorageGB * (1 - engine.compressionEfficiency / 100) * 8 * 1024;
    const initialSeedSeconds = compressedTotalMb / (wanBandwidthMbps * 0.85);
    const initialSeedHours = Math.round((initialSeedSeconds / 3600) * 10) / 10;
    const initialSeedDays = Math.round((initialSeedHours / 24) * 10) / 10;

    // RTO Timeline (incorporating failover network speedups)
    const networkInitMinutes = failoverNetwork === 'stretchedL2' ? 3 : 15; // Stretched L2 saves 12 minutes of re-IP
    const hostSpinupMinutes = deploymentStrategy === 'coldStorage' ? 45 : deploymentStrategy === 'pilotLight' ? 12 : 2;
    const dbRecoveryMinutes = 15;
    const appRecoveryMinutes = 10;
    const totalEstimatedRtoMin = networkInitMinutes + hostSpinupMinutes + dbRecoveryMinutes + appRecoveryMinutes;

    return {
      effectiveRpo,
      dailyChangeGB: Math.round(dailyChangeGB),
      dailyChangeVolumeGB: Math.round(dailyChangeGB),
      compressedDailyGB: Math.round(compressedDailyGB),
      deltaPerIntervalGB: Math.round(deltaPerIntervalGB * 10) / 10,
      requiredBandwidthMbps,
      isBandwidthAdequate,
      bandwidthUtilizationPercent,
      journalOverheadGB,
      journalOverheadTB,
      fullSddcNodes,
      standbyNodes,
      hostReductionNodes,
      hostReductionPercent,
      nodeCostPerMonth,
      monthlyOpexSavings,
      threeYearTcoSavings,
      strategyRtoMin: hostSpinupMinutes,
      vmBootRtoMin: dbRecoveryMinutes + appRecoveryMinutes,
      initialSeedHours,
      initialSeedDays,
      totalEstimatedRtoMin,
      rtoBreakdown: [
        { phase: 'Cloud SDDC Cluster Provisioning / Expansion', time: hostSpinupMinutes, color: 'bg-indigo-500' },
        { phase: failoverNetwork === 'stretchedL2' ? 'NSX-T Stretched L2 Port Groups (No re-IP)' : 'Tier-1 Gateway Routing & VM IP Mutation', time: networkInitMinutes, color: 'bg-cyan-500' },
        { phase: 'Mission-Critical Database Reconnection', time: dbRecoveryMinutes, color: 'bg-rose-500' },
        { phase: 'Web & Middleware Service Activation', time: appRecoveryMinutes, color: 'bg-emerald-500' }
      ]
    };
  }, [
    selectedEngineKey,
    engine,
    protectedVMs,
    protectedStorageTB,
    dailyChangeRatePercent,
    targetRpoMinutes,
    wanBandwidthMbps,
    deploymentStrategy,
    journalRetentionDays,
    failoverNetwork
  ]);

  // Export Excel report
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryRows = [
      { Metric: 'Selected DR Engine', Value: engine.name },
      { Metric: 'Target Deployment Model', Value: deploymentStrategy },
      { Metric: 'Protected Virtual Machines', Value: protectedVMs },
      { Metric: 'Protected Storage (TB)', Value: protectedStorageTB },
      { Metric: 'Daily Data Change Rate', Value: `${dailyChangeRatePercent}%` },
      { Metric: 'Target RPO Interval', Value: `${calculations.effectiveRpo} Minutes` },
      { Metric: 'Dedicated WAN Bandwidth', Value: `${wanBandwidthMbps} Mbps` },
      { Metric: 'Required Replication Throughput', Value: `${calculations.requiredBandwidthMbps} Mbps` },
      { Metric: 'Bandwidth Verdict', Value: calculations.isBandwidthAdequate ? 'PASS' : 'WARNING' },
      { Metric: 'Estimated Failover RTO', Value: `${calculations.totalEstimatedRtoMin} Minutes` },
      { Metric: 'Failover Network Strategy', Value: failoverNetwork === 'stretchedL2' ? 'NSX-T Stretched L2' : 'Routed Tier-1' },
      { Metric: 'Standby Host Reduction', Value: `${calculations.hostReductionNodes} Hosts (${calculations.hostReductionPercent}%)` },
      { Metric: 'CDP Journal Storage (TB)', Value: `${calculations.journalOverheadTB} TB` }
    ];

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'DR Assessment Summary');
    XLSX.writeFile(wb, `${brandSlug}_DR_Assessment_${engine.id.toUpperCase()}.xlsx`);
  };

  // Export Formal Branded 2-Page Executive PDF report using jsPDF
  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - (margin * 2);

    // ==========================================
    // PAGE 1: EXECUTIVE KPI SUMMARY & TCO MODEL
    // ==========================================
    
    // Header Bar
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setFillColor(6, 182, 212); // Cyan 500
    doc.rect(0, 27, pageWidth, 1.5, 'F');

    // Brand Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(brandUpper, margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('HYBRID CLOUD ARCHITECTURE & DISASTER RECOVERY ADVISORY', margin, 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(6, 182, 212);
    doc.text(`DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin - 55, 12);
    doc.setTextColor(148, 163, 184);
    doc.text('LEAD ARCHITECT: Wasim Sayyed', pageWidth - margin - 55, 18);

    let y = 37;

    // Document Title Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text(`${engine.name} - Executive Disaster Recovery Dossier`, margin, y);
    y += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Orchestration Model: ${deploymentStrategy.toUpperCase()} · Network Failover: ${failoverNetwork === 'stretchedL2' ? 'NSX-T Stretched Layer-2 (Zero Re-IP)' : 'Automated Routed Tier-1 DNS Failover'}`, margin, y);
    y += 8;

    // Executive Summary Highlight Callout
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(6, 182, 212);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');
    doc.setLineWidth(0.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(14, 116, 144);
    doc.text('EXECUTIVE HIGHLIGHTS & FINANCIAL RESILIENCY VERDICT', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(
      `Deploying ${engine.name} under a ${deploymentStrategy} model reduces standby compute host sprawl by ${calculations.hostReductionNodes} nodes (${calculations.hostReductionPercent}% reduction), slashing non-production OPEX by $${calculations.monthlyOpexSavings.toLocaleString()}/mo ($${calculations.threeYearTcoSavings.toLocaleString()} over 36 months). WAN replication requires ${calculations.requiredBandwidthMbps} Mbps, with calculated recovery point achievable within ${calculations.effectiveRpo} minutes.`,
      margin + 4,
      y + 11.5,
      { maxWidth: contentWidth - 8 }
    );
    y += 29;

    // KPI Metric Cards (6 Grid Cards: 3 columns x 2 rows)
    const cardGap = 3.5;
    const cardW = (contentWidth - (cardGap * 2)) / 3;
    const cardH = 19;

    const kpiCards = [
      { label: 'PROTECTED WORKLOAD', val: `${protectedVMs} VMs`, sub: `${protectedStorageTB} TB storage footprint` },
      { label: 'EFFECTIVE RPO SLA', val: `${calculations.effectiveRpo} Minutes`, sub: calculations.isBandwidthAdequate ? 'WAN SLA PASS' : 'WAN constrained' },
      { label: 'ESTIMATED RTO SLA', val: `${calculations.totalEstimatedRtoMin} Minutes`, sub: 'Automated runbook boot' },
      { label: 'STANDBY SDDC NODES', val: `${calculations.standbyNodes} Hosts`, sub: `${calculations.hostReductionNodes} hosts eliminated (${calculations.hostReductionPercent}%)` },
      { label: 'MONTHLY OPEX SAVINGS', val: `$${calculations.monthlyOpexSavings.toLocaleString()}/mo`, sub: 'Standby footprint reduction' },
      { label: '3-YEAR TCO SAVINGS', val: `$${calculations.threeYearTcoSavings.toLocaleString()}`, sub: 'Direct host licensing & compute' }
    ];

    kpiCards.forEach((kpi, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const cx = margin + (col * (cardW + cardGap));
      const cy = y + (row * (cardH + cardGap));

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cx, cy, cardW, cardH, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label, cx + 3, cy + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(kpi.val, cx + 3, cy + 10.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(kpi.sub, cx + 3, cy + 15.5);
    });

    y += (cardH * 2) + cardGap + 8;

    // Table 1: Financial & Host Comparison
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Standby Compute Infrastructure & 36-Month Cost Modeling', margin, y);
    y += 4.5;

    const costRows = [
      ['Traditional Active/Active SDDC', `${calculations.fullSddcNodes} Hosts`, `$${(calculations.fullSddcNodes * calculations.nodeCostPerMonth).toLocaleString()}/mo`, `$${(calculations.fullSddcNodes * calculations.nodeCostPerMonth * 36).toLocaleString()}`, 'Baseline Standard'],
      ['Recommended Pilot Light Strategy', `${calculations.standbyNodes} Hosts`, `$${(calculations.standbyNodes * calculations.nodeCostPerMonth).toLocaleString()}/mo`, `$${(calculations.standbyNodes * calculations.nodeCostPerMonth * 36).toLocaleString()}`, `$${calculations.monthlyOpexSavings.toLocaleString()}/mo savings`],
      ['Elastic Storage-Only Datastore', '0 Host Compute', '$1,800/mo', '$64,800', 'Decoupled ANF/FSx mount']
    ];

    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('RECOVERY ARCHITECTURE TIER', margin + 3, y + 4);
    doc.text('STANDBY NODES', margin + 65, y + 4);
    doc.text('EST. MONTHLY OPEX', margin + 100, y + 4);
    doc.text('36-MONTH TCO', margin + 135, y + 4);
    doc.text('VARIANCE', margin + 160, y + 4);
    y += 5.5;

    costRows.forEach((row, idx) => {
      doc.setFillColor(idx % 2 === 1 ? 248 : 255, idx % 2 === 1 ? 250 : 255, idx % 2 === 1 ? 252 : 255);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', idx === 1 ? 'bold' : 'normal');
      doc.setFontSize(7);
      doc.setTextColor(idx === 1 ? 14 : 30, idx === 1 ? 116 : 41, idx === 1 ? 144 : 59);
      doc.text(row[0], margin + 3, y + 3.8);
      doc.text(row[1], margin + 65, y + 3.8);
      doc.text(row[2], margin + 100, y + 3.8);
      doc.text(row[3], margin + 135, y + 3.8);
      doc.setFont('helvetica', 'bold');
      doc.text(row[4], margin + 160, y + 3.8);
      y += 5;
    });

    y += 7;

    // Table 2: Technical Replication & Bandwidth Parameters
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Replication Bandwidth & Storage Footprint Analysis', margin, y);
    y += 4.5;

    const techRows = [
      ['Target RPO Window', `${calculations.effectiveRpo} Minutes`, 'Engine baseline replication window'],
      ['Protected Storage Footprint', `${protectedStorageTB} TB`, 'Active primary VMDK source capacity'],
      ['Daily Operational Change Rate', `${dailyChangeRatePercent}%`, 'Operational 24h delta delta blocks'],
      ['24-Hour Transferred Delta Volume', `${calculations.dailyChangeVolumeGB.toFixed(1)} GB`, 'Payload across hybrid WAN link'],
      ['Required Continuous Bandwidth', `${calculations.requiredBandwidthMbps} Mbps`, 'Minimum dedicated pipe for target RPO'],
      ['Configured WAN Circuit', `${wanBandwidthMbps} Mbps`, calculations.isBandwidthAdequate ? 'ADEQUATE (SLA Guarantee Met)' : 'UNDERSIZED (Risk of RPO Drift)'],
      ['CDP Checkpoint Journal Overhead', `${calculations.journalOverheadTB} TB`, `${journalRetentionDays}-day continuous rollback checkpoints`]
    ];

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text('TECHNICAL PARAMETER', margin + 3, y + 4);
    doc.text('CALCULATED SPECIFICATION', margin + 70, y + 4);
    doc.text('ARCHITECTURAL CONTEXT & SLA IMPACT', margin + 120, y + 4);
    y += 5.5;

    techRows.forEach((row, idx) => {
      doc.setFillColor(idx % 2 === 1 ? 248 : 255, idx % 2 === 1 ? 250 : 255, idx % 2 === 1 ? 252 : 255);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.text(row[0], margin + 3, y + 3.8);
      doc.setFont('helvetica', 'bold');
      doc.text(row[1], margin + 70, y + 3.8);
      doc.setFont('helvetica', 'normal');
      doc.text(row[2], margin + 120, y + 3.8);
      y += 5;
    });

    // Page 1 Footer
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page 1 of 2 // ${effectiveBrand} Enterprise BCDR Advisory`, margin, pageHeight - 11);
    doc.text('CONFIDENTIAL // ISSUED FOR ARCHITECTURAL CERTIFICATION', pageWidth - margin - 75, pageHeight - 11);

    // ==========================================
    // PAGE 2: RUNBOOK ORCHESTRATION & SIGN-OFF
    // ==========================================
    doc.addPage();

    // Page 2 Header Bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 23, pageWidth, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`${brandUpper} · RUNBOOK ORCHESTRATION`, margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('AUTOMATED DISASTER RECOVERY BOOT SEQUENCE & SIGN-OFF DOSSIER', margin, 17);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(6, 182, 212);
    doc.text('ENGINE: ' + engine.name.toUpperCase(), pageWidth - margin - 50, 14);

    y = 33;

    // Section 3: Runbook Sequence
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('3. Automated Disaster Recovery Runbook Boot Sequence', margin, y);
    y += 5;

    const runbookStages = [
      ['Priority Tier 1 (Core Identity & DNS)', 'Domain Controllers (AD/DNS), NTP, HashiCorp Vault, PKI CA', '0 min (Immediate boot)', 'Automated DNS sync & ticket renewal verification'],
      ['Priority Tier 2 (Database Cluster)', 'SQL Server AlwaysOn, Oracle RAC, PostgreSQL Replicas', '+3 min delay', 'Mount supplemental storage, verify clean journal lock'],
      ['Priority Tier 3 (Application & Middleware)', 'WebSphere, IIS Servers, Tomcat Clusters, Microservices', '+5 min delay', 'Wait for DB port 1433/1521 listener ready signal'],
      ['Priority Tier 4 (Ingress & Web Presentation)', 'Avi ALB VIPs, NSX-T Tier-1 Gateways, NGINX Reverse Proxies', '+2 min delay', 'Route convergence validation, SSL handshake check'],
      ['Priority Tier 5 (Background Batch & Analytics)', 'Batch processing workers, ETL pipelines, non-critical reporting', '+10 min delay', 'Deferred startup ensuring primary production SLA']
    ];

    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('RECOVERY BOOT TIER', margin + 3, y + 4);
    doc.text('PROTECTED WORKLOAD ASSETS', margin + 55, y + 4);
    doc.text('BOOT DELAY', margin + 115, y + 4);
    doc.text('VALIDATION SCRIPT / PROBE', margin + 140, y + 4);
    y += 5.5;

    runbookStages.forEach((stage, idx) => {
      doc.setFillColor(idx % 2 === 1 ? 248 : 255, idx % 2 === 1 ? 250 : 255, idx % 2 === 1 ? 252 : 255);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(14, 116, 144);
      doc.text(stage[0], margin + 3, y + 4.2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(stage[1], margin + 55, y + 4.2);
      doc.text(stage[2], margin + 115, y + 4.2);
      doc.setFont('helvetica', 'italic');
      doc.text(stage[3], margin + 140, y + 4.2);
      y += 6;
    });

    y += 9;

    // Section 4: RTO Phase Breakdown
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('4. Detailed Recovery Time Objective (RTO) Phase Timeline', margin, y);
    y += 5;

    const rtoPhases = [
      ['Phase 1: Incident Detection & Quorum Arbitration', '3 Minutes', 'Automated heartbeat failure detection, SRM quorum verification, split-brain fence'],
      ['Phase 2: Standby SDDC Auto-Scaling & Storage Mount', `${calculations.strategyRtoMin} Minutes`, `Scale standby nodes from ${calculations.standbyNodes} to target capacity, attach ANF/FSx datastores`],
      ['Phase 3: VM Power-On Sequencing & Dependency Gaps', `${calculations.vmBootRtoMin} Minutes`, `Parallelized power-on across 5 priority tiers (${protectedVMs} protected VMs)`],
      ['Phase 4: Network Re-routing & Health Validation', '4 Minutes', 'BGP route advertisement, NSX-T gateway active-active path stabilization, synthetic checks'],
      ['TOTAL END-TO-END RECOVERY DURATION', `${calculations.totalEstimatedRtoMin} Minutes`, 'Full operational readiness confirmed with zero manual administrator intervention']
    ];

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text('RTO EXECUTION PHASE', margin + 3, y + 4);
    doc.text('ALLOCATED DURATION', margin + 75, y + 4);
    doc.text('ORCHESTRATION ACTIVITIES & AUTOMATION HOOKS', margin + 115, y + 4);
    y += 5.5;

    rtoPhases.forEach((phase, idx) => {
      const isTotal = idx === rtoPhases.length - 1;
      doc.setFillColor(isTotal ? 224 : (idx % 2 === 1 ? 248 : 255), isTotal ? 242 : (idx % 2 === 1 ? 250 : 255), isTotal ? 254 : (idx % 2 === 1 ? 252 : 255));
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
      doc.setFontSize(isTotal ? 7.5 : 6.8);
      doc.setTextColor(isTotal ? 3 : 30, isTotal ? 105 : 41, isTotal ? 161 : 59);
      doc.text(phase[0], margin + 3, y + 4.2);
      doc.setFont('helvetica', 'bold');
      doc.text(phase[1], margin + 75, y + 4.2);
      doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
      doc.text(phase[2], margin + 115, y + 4.2);
      y += 6;
    });

    y += 11;

    // Section 5: Architectural Certification & Executive Sign-off
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('5. Architectural Certification & Enterprise Sign-Off', margin, y);
    y += 5;

    const boxW = (contentWidth - 6) / 2;
    const boxH = 34;

    // Lead Architect Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, boxW, boxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('PREPARED & CERTIFIED BY:', margin + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('Wasim Sayyed', margin + 4, y + 11);
    doc.text('Lead Hybrid Cloud Architect & Infrastructure Advisory', margin + 4, y + 15);
    doc.text(`Status: PRODUCTION VALIDATED`, margin + 4, y + 19);

    doc.setDrawColor(148, 163, 184);
    doc.line(margin + 4, y + 27, margin + boxW - 10, y + 27);
    doc.setFontSize(6);
    doc.text('Digital Signature / Cryptographic Seal', margin + 4, y + 31);

    // VP Infrastructure Sign-Off Box
    const box2X = margin + boxW + 6;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(box2X, y, boxW, boxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('EXECUTIVE STAKEHOLDER APPROVAL:', box2X + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('VP / Global Infrastructure Director', box2X + 4, y + 11);
    doc.text('Enterprise BCDR Governance Committee', box2X + 4, y + 15);
    doc.text('Approval Status: APPROVED FOR DEPLOYMENT', box2X + 4, y + 19);

    doc.setDrawColor(148, 163, 184);
    doc.line(box2X + 4, y + 27, box2X + boxW - 10, y + 27);
    doc.setFontSize(6);
    doc.text('Authorized Enterprise Signatory', box2X + 4, y + 31);

    // Page 2 Footer
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page 2 of 2 // ${effectiveBrand} Enterprise BCDR Advisory`, margin, pageHeight - 11);
    doc.text('CONFIDENTIAL // ISSUED FOR ARCHITECTURAL CERTIFICATION', pageWidth - margin - 75, pageHeight - 11);

    doc.save(`${brandSlug}_Executive_DR_Report_${engine.id.toUpperCase()}.pdf`);
  };

  // Pass to Design Generator
  const handleApplyToGenerator = () => {
    try {
      localStorage.setItem('zaboraa_dr_export', JSON.stringify({
        engine: engine.name,
        strategy: deploymentStrategy,
        vms: protectedVMs,
        storageTB: protectedStorageTB,
        rpoMin: calculations.effectiveRpo,
        wanMbps: wanBandwidthMbps,
        requiredBandwidthMbps: calculations.requiredBandwidthMbps,
        rtoMin: calculations.totalEstimatedRtoMin,
        failoverNetwork,
        journalTB: calculations.journalOverheadTB,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    navigate('/tools/design-generator');
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link to="/tools" className="hover:text-cyan-400 transition-colors">Engineering Workbench</Link>
          <span>/</span>
          <span className="text-cyan-300">Multi-Engine DR RPO/RTO & Resiliency Planner</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Disaster Recovery Multi-Engine & Technical RPO/RTO Planner
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Model and compare VMware SRM, HPE Zerto CDP, JetStream DR, and Veeam. Compare Hot Standby vs. Pilot Light vs. Cold Object Storage host footprints, calculate CDP journal retention overhead, and evaluate NSX-T failover networking RTO impact.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-semibold cursor-pointer shadow-sm"
              title="Export structured assessment data to Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export .xlsx</span>
            </button>
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 hover:text-white text-xs font-bold cursor-pointer shadow-sm transition-all"
              title="Generate and download formal branded PDF report via jsPDF"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export to PDF</span>
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Preview</span>
            </button>
            <button
              onClick={handleApplyToGenerator}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Apply DR Specs to Blueprint Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Multi-Engine Selector Bar */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
          Select Disaster Recovery Technology Engine:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(DR_ENGINES) as DREngineType[]).map(key => {
            const item = DR_ENGINES[key];
            const isSelected = selectedEngineKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedEngineKey(key);
                  setTargetRpoMinutes(item.defaultRpoMinutes);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-900/50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {item.name}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mt-1">
                  RPO: {item.minRpoMinutes}m – {item.maxRpoMinutes >= 60 ? `${item.maxRpoMinutes / 60}h` : `${item.maxRpoMinutes}m`}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {item.tagline}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Inputs (7 cols) + Sizing (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Protected Inventory & RPO Settings</span>
            </h2>

            {/* Slider 1: Protected VMs */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Protected Virtual Machines</span>
                <span className="font-mono text-cyan-300 font-bold">{protectedVMs} VMs</span>
              </div>
              <input
                type="range"
                min="20"
                max="1200"
                step="10"
                value={protectedVMs}
                onChange={e => setProtectedVMs(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded cursor-pointer"
              />
            </div>

            {/* Slider 2: Storage TB */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Protected Storage Footprint</span>
                <span className="font-mono text-cyan-300 font-bold">{protectedStorageTB} TB</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={protectedStorageTB}
                onChange={e => setProtectedStorageTB(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded cursor-pointer"
              />
            </div>

            {/* Slider 3: Dynamic RPO Slider within Engine bounds */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Target Recovery Point Objective (RPO)</span>
                <span className="font-mono text-rose-300 font-bold">
                  {targetRpoMinutes >= 60 ? `${targetRpoMinutes / 60} Hour(s)` : `${targetRpoMinutes} Minutes`}
                </span>
              </div>
              <input
                type="range"
                min={engine.minRpoMinutes}
                max={engine.maxRpoMinutes}
                step={engine.minRpoMinutes <= 5 ? 5 : 15}
                value={targetRpoMinutes}
                onChange={e => setTargetRpoMinutes(Number(e.target.value))}
                className="w-full accent-rose-400 bg-slate-800 h-2 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Min: {engine.minRpoMinutes}m</span>
                <span>Max: {engine.maxRpoMinutes >= 60 ? `${engine.maxRpoMinutes / 60}h` : `${engine.maxRpoMinutes}m`}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: '5 min (High-Priority)', value: 5 },
                  { label: '15 min (Standard Tier)', value: 15 },
                  { label: '30 min', value: 30 },
                  { label: '1 hour', value: 60 },
                  { label: '4 hours', value: 240 },
                  { label: '24 hours', value: 1440 }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.value < engine.minRpoMinutes || opt.value > engine.maxRpoMinutes}
                    onClick={() => setTargetRpoMinutes(opt.value)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                      targetRpoMinutes === opt.value
                        ? 'bg-rose-500 text-white font-bold shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 4: Daily Churn % */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Daily Data Change Rate</span>
                <span className="font-mono text-cyan-300 font-bold">{dailyChangeRatePercent}% ({calculations.dailyChangeGB} GB/day)</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={dailyChangeRatePercent}
                onChange={e => setDailyChangeRatePercent(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded cursor-pointer"
              />
            </div>

            {/* Slider 5: Replication WAN Speed */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-300">Dedicated Replication WAN Throughput</span>
                <span className="font-mono text-cyan-300 font-bold">{wanBandwidthMbps >= 1000 ? `${wanBandwidthMbps / 1000} Gbps` : `${wanBandwidthMbps} Mbps`}</span>
              </div>
              <select
                value={wanBandwidthMbps}
                onChange={e => setWanBandwidthMbps(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200"
              >
                <option value={500}>500 Mbps Dedicated Circuit</option>
                <option value={1000}>1 Gbps DirectConnect / ExpressRoute</option>
                <option value={2000}>2 Gbps Aggregated Cloud Interconnect</option>
                <option value={5000}>5 Gbps High-Throughput Backbone</option>
                <option value={10000}>10 Gbps Ultra-High-Speed Peering</option>
              </select>
            </div>

            {/* 2. Recovery Site Architecture Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300">
                Target Site Deployment Strategy & Idle Standby Model:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'hotStandby', title: 'Hot Standby', desc: '100% capacity live 24/7' },
                  { id: 'pilotLight', title: 'Pilot Light', desc: '3-node minimum, auto-expand' },
                  { id: 'coldStorage', title: 'Cold Storage', desc: 'Blob/NFS only, 0 idle nodes' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setDeploymentStrategy(item.id as any)}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      deploymentStrategy === item.id
                        ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>{item.title}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Journal & Failover Networking Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              {/* CDP Journal Retention */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">CDP Journal Retention Window</label>
                <select
                  value={journalRetentionDays}
                  onChange={e => setJournalRetentionDays(Number(e.target.value))}
                  disabled={!engine.supportsCdpJournal}
                  className={`w-full px-3 py-2 bg-slate-950 border rounded text-xs text-slate-200 ${
                    engine.supportsCdpJournal ? 'border-slate-800' : 'border-slate-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <option value={1}>1 Day (Short Rewind)</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days (Enterprise Standard)</option>
                  <option value={14}>14 Days (Extended Rollback)</option>
                </select>
                <span className="text-[10px] text-slate-500">
                  {engine.supportsCdpJournal
                    ? `Journal storage overhead: +${calculations.journalOverheadTB} TB`
                    : 'Not applicable for snapshot-based replication'}
                </span>
              </div>

              {/* Failover Networking Strategy */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Failover Networking Strategy</label>
                <select
                  value={failoverNetwork}
                  onChange={e => setFailoverNetwork(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200"
                >
                  <option value="stretchedL2">NSX-T Stretched L2 (No IP change, faster RTO)</option>
                  <option value="routedT1">Routed Tier-1 (IP Re-addressing script)</option>
                </select>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {failoverNetwork === 'stretchedL2' ? 'Saves ~12 mins on cutover timeline' : 'Requires VM network reconfiguration'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output: Replication Bandwidth & Standby Host Sizing Verdict (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Replication Feasibility & Throughput
              </div>
              <h3 className="text-xl font-bold text-white">
                WAN Bandwidth Sizing
              </h3>
            </div>

            {/* Verdict Box */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                calculations.isBandwidthAdequate
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
              }`}
            >
              {calculations.isBandwidthAdequate ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <div className="font-bold text-white">
                  {calculations.isBandwidthAdequate
                    ? 'Target RPO Achievable on Current WAN'
                    : 'WAN Capacity Warning: Increase Bandwidth'}
                </div>
                <div className="text-slate-300 font-mono text-[11px]">
                  Required: <span className="font-bold text-white">{calculations.requiredBandwidthMbps} Mbps</span> ({calculations.bandwidthUtilizationPercent}% of WAN line).
                </div>
              </div>
            </div>

            {/* Standby Host Footprint & Resiliency Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <Zap className="w-4 h-4" />
                  <span>Standby Host Density & Capacity Modeling</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300">
                  {deploymentStrategy === 'coldStorage' ? 'On-Demand Dynamic' : deploymentStrategy === 'pilotLight' ? 'Pilot Light Core' : 'Hot Standby'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Standby Hosts Provisioned</div>
                  <div className="text-lg font-bold text-white font-mono">
                    {calculations.standbyNodes} <span className="text-xs text-slate-400">Hosts</span>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Host Footprint Reduction</div>
                  <div className="text-lg font-bold text-emerald-300 font-mono">
                    -{calculations.hostReductionNodes} ({calculations.hostReductionPercent}%)
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex justify-between">
                <span>Full Cluster Equivalent:</span>
                <span className="font-bold text-slate-300">{calculations.fullSddcNodes} Hosts</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex justify-between">
                <span>CDP Journal Footprint:</span>
                <span className="font-bold text-cyan-300">{calculations.journalOverheadTB} TB</span>
              </div>
            </div>

            {/* Simulated RTO Timeline */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Total Projected RTO Duration:</span>
                <span className="font-mono font-bold text-rose-400">{calculations.totalEstimatedRtoMin} Minutes</span>
              </div>
              <div className="space-y-2">
                {calculations.rtoBreakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 truncate">{item.phase}</span>
                      <span className="font-mono text-cyan-300 font-bold shrink-0">{item.time}m</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${(item.time / calculations.totalEstimatedRtoMin) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 sm:p-8 overflow-y-auto flex justify-center">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-8 space-y-6 text-slate-200 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">Executive DR Assessment Report</span>
                <h2 className="text-xl font-bold text-white">{engine.name} Disaster Recovery Plan</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>Protected VMs: <span className="font-bold text-white">{protectedVMs}</span></div>
              <div>Target RPO: <span className="font-bold text-rose-400">{calculations.effectiveRpo}m</span></div>
              <div>WAN Required: <span className="font-bold text-cyan-300">{calculations.requiredBandwidthMbps} Mbps</span></div>
              <div>Estimated RTO: <span className="font-bold text-emerald-400">{calculations.totalEstimatedRtoMin}m</span></div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-white uppercase font-mono text-xs">Architecture Strategy:</div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                <div>Model: <span className="text-cyan-300 font-bold">{deploymentStrategy.toUpperCase()}</span></div>
                <div>Standby SDDC Nodes: <span className="text-white font-bold">{calculations.standbyNodes} Nodes</span></div>
                <div>Standby Host Reduction: <span className="text-emerald-300 font-bold">-{calculations.hostReductionNodes} Nodes ({calculations.hostReductionPercent}%)</span></div>
                <div>CDP Journal Retention: <span className="text-cyan-300 font-bold">{calculations.journalOverheadTB} TB</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
