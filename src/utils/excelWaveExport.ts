/**
 * Enterprise Formatted & Color-Coded Migration Wave Excel Exporter
 * Generates an executive, color-coded multi-tab XML/HTML workbook with:
 *  - Tab 1: Executive Summary & Governance Dashboard (Customer Branded)
 *  - Tab 2: Wave Migration Schedule & Execution Sequence (Color-Coded Risk Tiers)
 *  - Tab 3: Detailed Workload Inventory & Compatibility Matrix
 *  - Tab 4: NSX Distributed Firewall (DFW) Microsegmentation Rules
 * ZERO FINANCIALS: Exclusively technical compute, memory, storage, risk, and security.
 */

import * as XLSX from 'xlsx';
import { IngestedVM } from '../services/workloadAnalyzer';
import { MigrationWaveSummary } from './migrationCalculator';

export interface ExcelExportOptions {
  customerName: string;
  architectName?: string;
  targetCloud: string;
  nodeSku: string;
  storagePolicy: string;
  totalNodes: number;
  vCpuOvercommit: number;
  ramBufferPercent: number;
  waves: MigrationWaveSummary[];
  allWorkloads: IngestedVM[];
  dfwRules?: Array<{
    id: string;
    source: string;
    destination: string;
    port: string;
    action: string;
    status: string;
  }>;
}

/**
 * Generates and triggers download of a beautifully formatted, color-coded Excel spreadsheet.
 */
export function exportColorCodedWavePlanExcel(options: ExcelExportOptions): void {
  const {
    customerName,
    architectName = 'Wasim Sayyed, Principal VMware Architect',
    targetCloud,
    nodeSku,
    storagePolicy,
    totalNodes,
    vCpuOvercommit,
    ramBufferPercent,
    waves,
    allWorkloads,
    dfwRules = []
  } = options;

  const inScope = allWorkloads.filter(w => w.scope === 'In Scope');
  const totalVCPUs = inScope.reduce((a, b) => a + b.cpus, 0);
  const totalEffectiveCores = Math.ceil(totalVCPUs / vCpuOvercommit);
  const totalRAM = Math.round(inScope.reduce((a, b) => a + b.memoryGiB, 0));
  const totalBufferedRAM = Math.round(totalRAM * (1 + ramBufferPercent / 100));
  const totalStorage = Math.round(inScope.reduce((a, b) => a + b.storageTiB, 0) * 10) / 10;
  const criticalBlockersCount = inScope.filter(w => w.blockers.some(b => b.severity === 'CRITICAL')).length;
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Construct styled XML Spreadsheet 2003 workbook
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${customerName} - Cloud Migration Wave Plan</Title>
  <Author>${architectName}</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>Enterprise Architecture</Company>
 </DocumentProperties>
 <Styles>
  <!-- Base Default Style -->
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1E293B"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>

  <!-- Executive Header Brand -->
  <Style ss:ID="ExecutiveHeader">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="18" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#06B6D4"/>
   </Borders>
  </Style>

  <!-- Subheader Metadata -->
  <Style ss:ID="SubHeader">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#94A3B8"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>

  <!-- Section Title Banner -->
  <Style ss:ID="SectionBanner">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="13" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="3" ss:Color="#0891B2"/>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>

  <!-- Table Header - Cyan Theme -->
  <Style ss:ID="TableHeaderCyan">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0891B2" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0E7490"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0E7490"/>
   </Borders>
  </Style>

  <!-- Table Header - Emerald Theme -->
  <Style ss:ID="TableHeaderEmerald">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#059669" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#047857"/>
   </Borders>
  </Style>

  <!-- Table Header - Slate Theme -->
  <Style ss:ID="TableHeaderSlate">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#334155" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#1E293B"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1E293B"/>
   </Borders>
  </Style>

  <!-- KPI Metric Label -->
  <Style ss:ID="KpiLabel">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#64748B" ss:Bold="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- KPI Metric Value -->
  <Style ss:ID="KpiValue">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Highlight Blue Metric Value -->
  <Style ss:ID="KpiValueBlue">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0284C7" ss:Bold="1"/>
   <Interior ss:Color="#F0F9FF" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BAE6FD"/>
   </Borders>
  </Style>

  <!-- Data Row Normal -->
  <Style ss:ID="DataRow">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Data Row Zebra Shaded -->
  <Style ss:ID="DataRowZebra">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Data Row Center -->
  <Style ss:ID="DataRowCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Data Row Number -->
  <Style ss:ID="DataRowNumber">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0F172A" ss:Bold="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Risk Badge: Low (Emerald Green) -->
  <Style ss:ID="RiskLow">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
  </Style>

  <!-- Risk Badge: Medium (Cyan Blue) -->
  <Style ss:ID="RiskMedium">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0369A1"/>
   <Interior ss:Color="#E0F2FE" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#BAE6FD"/>
   </Borders>
  </Style>

  <!-- Risk Badge: High (Amber Orange) -->
  <Style ss:ID="RiskHigh">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#B45309"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FDE68A"/>
   </Borders>
  </Style>

  <!-- Risk Badge: Critical Blocker (Rose Red) -->
  <Style ss:ID="RiskCritical">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#B91C1C"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FECACA"/>
   </Borders>
  </Style>

  <!-- Method Badge: RAV Live vMotion (Green) -->
  <Style ss:ID="MethodRav">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D1FAE5"/>
   </Borders>
  </Style>

  <!-- Method Badge: Bulk Migration (Cyan) -->
  <Style ss:ID="MethodBulk">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#0369A1"/>
   <Interior ss:Color="#F0F9FF" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E0F2FE"/>
   </Borders>
  </Style>

  <!-- Method Badge: Cold / Re-architect (Red) -->
  <Style ss:ID="MethodCold">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#991B1B"/>
   <Interior ss:Color="#FEF2F2" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FEE2E2"/>
   </Borders>
  </Style>

  <!-- Firewall ALLOW Badge -->
  <Style ss:ID="DfwAllow">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
  </Style>

  <!-- Firewall DROP Badge -->
  <Style ss:ID="DfwDrop">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#B91C1C"/>
   <Interior ss:Color="#FEE2E2" ss:Pattern="Solid"/>
  </Style>
 </Styles>

 <!-- ========================================== -->
 <!-- TAB 1: EXECUTIVE GOVERNANCE & SUMMARY      -->
 <!-- ========================================== -->
 <Worksheet ss:Name="Executive Summary">
  <Table ss:DefaultColumnWidth="120" ss:DefaultRowHeight="20">
   <Column ss:Width="260"/>
   <Column ss:Width="220"/>
   <Column ss:Width="160"/>
   <Column ss:Width="180"/>

   <!-- Brand Header Row -->
   <Row ss:Height="36">
    <Cell ss:MergeAcross="3" ss:StyleID="ExecutiveHeader">
     <Data ss:Type="String">  ${customerName} — Cloud Migration Wave Plan</Data>
    </Cell>
   </Row>

   <!-- Metadata Subheader -->
   <Row ss:Height="22">
    <Cell ss:MergeAcross="3" ss:StyleID="SubHeader">
     <Data ss:Type="String">  Prepared by: ${architectName}  |  Date: ${exportDate}  |  Target Ecosystem: ${targetCloud}</Data>
    </Cell>
   </Row>

   <!-- Empty Spacing -->
   <Row ss:Height="12"><Cell><Data ss:Type="String"></Data></Cell></Row>

   <!-- Section 1: Architecture Specifications Banner -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="3" ss:StyleID="SectionBanner">
     <Data ss:Type="String">  1. ENTERPRISE CLUSTER SPECIFICATIONS &amp; RATIOS</Data>
    </Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Client Organization</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${customerName}</Data></Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">vCPU Overcommit Ratio</Data></Cell>
    <Cell ss:StyleID="KpiValueBlue"><Data ss:Type="String">${vCpuOvercommit}:1 Overcommit</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Target Cloud Ecosystem</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${targetCloud}</Data></Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">RAM Overhead Buffer</Data></Cell>
    <Cell ss:StyleID="KpiValueBlue"><Data ss:Type="String">+${ramBufferPercent}% ESXi / NSX Buffer</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Bare-Metal Node Model</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${nodeSku}</Data></Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Calculated Physical Cores</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="Number">${totalEffectiveCores}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Required Bare-Metal Hosts</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${totalNodes} Hosts (N+1 HA)</Data></Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Buffered Memory Required</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${totalBufferedRAM} GiB</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Applied Storage Policy</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${storagePolicy}</Data></Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Total In-Scope Storage</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${totalStorage} TiB</Data></Cell>
   </Row>

   <!-- Empty Spacing -->
   <Row ss:Height="14"><Cell><Data ss:Type="String"></Data></Cell></Row>

   <!-- Section 2: Wave Summary Matrix Banner -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="3" ss:StyleID="SectionBanner">
     <Data ss:Type="String">  2. MIGRATION WAVE ROLLOUT SCHEDULE SUMMARY</Data>
    </Cell>
   </Row>

   <!-- Summary Table Headers -->
   <Row ss:Height="24">
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Wave Code &amp; Title</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Risk Tier &amp; Scope</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Workloads &amp; Cores</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Cutover Window</Data></Cell>
   </Row>

   ${waves.map((w, idx) => `
   <Row ss:Height="22">
    <Cell ss:StyleID="${idx % 2 === 0 ? 'DataRow' : 'DataRowZebra'}"><Data ss:Type="String">${w.waveCode}: ${w.title.replace(/.*:\s*/, '')}</Data></Cell>
    <Cell ss:StyleID="${
      w.targetRiskTier === 'Low'
        ? 'RiskLow'
        : w.targetRiskTier === 'Medium'
        ? 'RiskMedium'
        : w.targetRiskTier === 'High'
        ? 'RiskHigh'
        : 'RiskCritical'
    }"><Data ss:Type="String">${w.targetRiskTier.toUpperCase()}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${w.workloadCount} VMs | ${w.effectiveCoresRequired}c | ${w.bufferedRAMGiB}G</Data></Cell>
    <Cell ss:StyleID="${idx % 2 === 0 ? 'DataRow' : 'DataRowZebra'}"><Data ss:Type="String">${w.cutoverWindow}</Data></Cell>
   </Row>
   `).join('')}

   <!-- Empty Spacing -->
   <Row ss:Height="14"><Cell><Data ss:Type="String"></Data></Cell></Row>

   <!-- Section 3: Readiness & Blockers Risk Notice -->
   <Row ss:Height="26">
    <Cell ss:MergeAcross="3" ss:StyleID="SectionBanner">
     <Data ss:Type="String">  3. PRE-MIGRATION READINESS &amp; BLOCKERS STATUS</Data>
    </Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Total Workloads Assessed</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="Number">${allWorkloads.length}</Data></Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">In-Scope Active Workloads</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="Number">${inScope.length}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Critical Migration Blockers Flagged</Data></Cell>
    <Cell ss:StyleID="${criticalBlockersCount > 0 ? 'RiskCritical' : 'RiskLow'}">
     <Data ss:Type="String">${criticalBlockersCount > 0 ? `${criticalBlockersCount} CRITICAL (RDM-P / Multi-Writer / Obsolete HW)` : '0 Blockers (100% Ready)'}</Data>
    </Cell>
    <Cell ss:StyleID="KpiLabel"><Data ss:Type="String">Pre-Flight Remediation Requirement</Data></Cell>
    <Cell ss:StyleID="KpiValue"><Data ss:Type="String">${criticalBlockersCount > 0 ? 'Remediation Wave Staging Required' : 'Approved for Execution'}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- ========================================== -->
 <!-- TAB 2: WAVE MIGRATION SCHEDULE DETAILED    -->
 <!-- ========================================== -->
 <Worksheet ss:Name="Wave Execution Sequence">
  <Table ss:DefaultColumnWidth="110" ss:DefaultRowHeight="20">
   <Column ss:Width="100"/>
   <Column ss:Width="240"/>
   <Column ss:Width="120"/>
   <Column ss:Width="80"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>
   <Column ss:Width="200"/>

   <!-- Title Row -->
   <Row ss:Height="30">
    <Cell ss:MergeAcross="10" ss:StyleID="ExecutiveHeader">
     <Data ss:Type="String">  Migration Wave Rollout Schedule — Sequencing &amp; Transit Analysis</Data>
    </Cell>
   </Row>

   <!-- Header Row -->
   <Row ss:Height="26">
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Wave Code</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Wave Title</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Risk Tier</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">VM Count</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">vCPUs</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Buffered RAM</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Storage (TiB)</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Live RAV (vMotion)</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">HCX Bulk Sync</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Initial Sync (Hrs)</Data></Cell>
    <Cell ss:StyleID="TableHeaderCyan"><Data ss:Type="String">Cutover Window Window</Data></Cell>
   </Row>

   ${waves.map((w, idx) => `
   <Row ss:Height="22">
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${w.waveCode}</Data></Cell>
    <Cell ss:StyleID="${idx % 2 === 0 ? 'DataRow' : 'DataRowZebra'}"><Data ss:Type="String">${w.title}</Data></Cell>
    <Cell ss:StyleID="${
      w.targetRiskTier === 'Low'
        ? 'RiskLow'
        : w.targetRiskTier === 'Medium'
        ? 'RiskMedium'
        : w.targetRiskTier === 'High'
        ? 'RiskHigh'
        : 'RiskCritical'
    }"><Data ss:Type="String">${w.targetRiskTier}</Data></Cell>
    <Cell ss:StyleID="DataRowNumber"><Data ss:Type="Number">${w.workloadCount}</Data></Cell>
    <Cell ss:StyleID="DataRowNumber"><Data ss:Type="Number">${w.rawVCPUs}</Data></Cell>
    <Cell ss:StyleID="DataRowNumber"><Data ss:Type="String">${w.bufferedRAMGiB} GiB</Data></Cell>
    <Cell ss:StyleID="DataRowNumber"><Data ss:Type="Number">${w.totalStorageTiB}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="Number">${w.ravCount}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="Number">${w.bulkCount}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">~${w.initialSyncHours} hrs</Data></Cell>
    <Cell ss:StyleID="${idx % 2 === 0 ? 'DataRow' : 'DataRowZebra'}"><Data ss:Type="String">${w.cutoverWindow}</Data></Cell>
   </Row>
   `).join('')}
  </Table>
 </Worksheet>

 <!-- ========================================== -->
 <!-- TAB 3: WORKLOAD INVENTORY & READINESS      -->
 <!-- ========================================== -->
 <Worksheet ss:Name="Workload Inventory">
  <Table ss:DefaultColumnWidth="110" ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="110"/>
   <Column ss:Width="70"/>
   <Column ss:Width="80"/>
   <Column ss:Width="90"/>
   <Column ss:Width="100"/>
   <Column ss:Width="90"/>
   <Column ss:Width="90"/>
   <Column ss:Width="130"/>
   <Column ss:Width="140"/>
   <Column ss:Width="220"/>

   <!-- Title Row -->
   <Row ss:Height="30">
    <Cell ss:MergeAcross="12" ss:StyleID="ExecutiveHeader">
     <Data ss:Type="String">  Workload Discovery &amp; Hypervisor Compatibility Assessment</Data>
    </Cell>
   </Row>

   <!-- Header Row -->
   <Row ss:Height="26">
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">Virtual Machine Name</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">Scope</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">Assigned Wave</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">Target Tier</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">vCPUs</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">RAM (GiB)</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">Used (GiB)</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">vHardware</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">vNIC Type</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">SCSI Controller</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">VMware Tools</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">HCX Method</Data></Cell>
    <Cell ss:StyleID="TableHeaderEmerald"><Data ss:Type="String">Readiness &amp; Blockers</Data></Cell>
   </Row>

   ${allWorkloads.map((vm, idx) => {
     const hasCritical = vm.blockers.some(b => b.severity === 'CRITICAL');
     const blockerText = vm.blockers.length > 0 ? vm.blockers.map(b => b.title).join('; ') : 'Optimal (Ready)';
     return `
   <Row ss:Height="21">
    <Cell ss:StyleID="${idx % 2 === 0 ? 'DataRow' : 'DataRowZebra'}"><Data ss:Type="String">${vm.vmName}</Data></Cell>
    <Cell ss:StyleID="${vm.scope === 'In Scope' ? 'RiskLow' : 'RiskHigh'}"><Data ss:Type="String">${vm.scope}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">Wave ${vm.assignedWave}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${vm.targetStorageTier}</Data></Cell>
    <Cell ss:StyleID="DataRowNumber"><Data ss:Type="Number">${vm.cpus}</Data></Cell>
    <Cell ss:StyleID="DataRowNumber"><Data ss:Type="Number">${vm.memoryGiB}</Data></Cell>
    <Cell ss:StyleID="DataRowNumber"><Data ss:Type="Number">${vm.inUseDiskGiB}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">vHW ${vm.hardwareVersionNumber}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${vm.nics[0]?.adapterType || 'VMXNET3'}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${vm.primaryController}</Data></Cell>
    <Cell ss:StyleID="${idx % 2 === 0 ? 'DataRow' : 'DataRowZebra'}"><Data ss:Type="String">${vm.toolsStatus}</Data></Cell>
    <Cell ss:StyleID="${
      vm.recommendedMethod.includes('RAV')
        ? 'MethodRav'
        : vm.recommendedMethod.includes('Bulk')
        ? 'MethodBulk'
        : 'MethodCold'
    }"><Data ss:Type="String">${vm.recommendedMethod}</Data></Cell>
    <Cell ss:StyleID="${hasCritical ? 'RiskCritical' : idx % 2 === 0 ? 'DataRow' : 'DataRowZebra'}"><Data ss:Type="String">${blockerText}</Data></Cell>
   </Row>
     `;
   }).join('')}
  </Table>
 </Worksheet>

 <!-- ========================================== -->
 <!-- TAB 4: NSX DISTRIBUTED FIREWALL (DFW)      -->
 <!-- ========================================== -->
 <Worksheet ss:Name="NSX Microsegmentation">
  <Table ss:DefaultColumnWidth="120" ss:DefaultRowHeight="20">
   <Column ss:Width="100"/>
   <Column ss:Width="180"/>
   <Column ss:Width="180"/>
   <Column ss:Width="120"/>
   <Column ss:Width="90"/>
   <Column ss:Width="120"/>

   <!-- Title Row -->
   <Row ss:Height="30">
    <Cell ss:MergeAcross="5" ss:StyleID="ExecutiveHeader">
     <Data ss:Type="String">  Aria Networks Discovered Distributed Firewall (DFW) Rules</Data>
    </Cell>
   </Row>

   <!-- Header Row -->
   <Row ss:Height="26">
    <Cell ss:StyleID="TableHeaderSlate"><Data ss:Type="String">Rule ID</Data></Cell>
    <Cell ss:StyleID="TableHeaderSlate"><Data ss:Type="String">Source Security Group</Data></Cell>
    <Cell ss:StyleID="TableHeaderSlate"><Data ss:Type="String">Destination Security Group</Data></Cell>
    <Cell ss:StyleID="TableHeaderSlate"><Data ss:Type="String">Port / Protocol</Data></Cell>
    <Cell ss:StyleID="TableHeaderSlate"><Data ss:Type="String">Action</Data></Cell>
    <Cell ss:StyleID="TableHeaderSlate"><Data ss:Type="String">Policy Status</Data></Cell>
   </Row>

   ${(dfwRules.length > 0
     ? dfwRules
     : [
         { id: 'DFW-01', source: 'Web-Tier-SG', destination: 'App-Tier-SG', port: '443 / TCP', action: 'ALLOW', status: 'Recommended' },
         { id: 'DFW-02', source: 'App-Tier-SG', destination: 'DB-Tier-SG', port: '1433 / TCP', action: 'ALLOW', status: 'Recommended' },
         { id: 'DFW-03', source: 'Any', destination: 'Web-Tier-SG', port: '80 / TCP', action: 'ALLOW', status: 'Active' },
         { id: 'DFW-04', source: 'Web-Tier-SG', destination: 'DB-Tier-SG', port: 'ANY', action: 'DROP', status: 'Enforced' }
       ]
   ).map((rule, idx) => `
   <Row ss:Height="22">
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${rule.id}</Data></Cell>
    <Cell ss:StyleID="${idx % 2 === 0 ? 'DataRow' : 'DataRowZebra'}"><Data ss:Type="String">${rule.source}</Data></Cell>
    <Cell ss:StyleID="${idx % 2 === 0 ? 'DataRow' : 'DataRowZebra'}"><Data ss:Type="String">${rule.destination}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${rule.port}</Data></Cell>
    <Cell ss:StyleID="${rule.action === 'ALLOW' ? 'DfwAllow' : 'DfwDrop'}"><Data ss:Type="String">${rule.action}</Data></Cell>
    <Cell ss:StyleID="DataRowCenter"><Data ss:Type="String">${rule.status}</Data></Cell>
   </Row>
   `).join('')}
  </Table>
 </Worksheet>
</Workbook>`;

  // Trigger download using Blob with Excel XML Spreadsheet MIME type (.xls)
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeCustomer = customerName.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `${safeCustomer}_Wave_Migration_Architecture_Plan.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
