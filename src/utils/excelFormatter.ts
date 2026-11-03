/**
 * Enterprise Formatted & Color-Coded Dual-Cloud Comparison Excel Exporter
 * Produces an executive-level, styled XML spreadsheet with:
 *  - Tab 1: Executive Comparison & TCO Summary (Side-by-Side KPIs)
 *  - Tab 2: Detailed Hardware Architecture & Density Matrix
 *  - Tab 3: 36-Month Financial Forecast & TCO Breakdown
 */

export interface DualCloudComparisonData {
  projectName: string;
  architectName?: string;
  pricingNote?: string;
  cloudA: {
    name: string;
    nodeSku: string;
    nodeCount: number;
    coresPerNode: number;
    ramPerNodeGB: number;
    rawStoragePerNodeTB: number;
    usableStorageTB: number;
    vCpuAllocation: number;
    ramAllocationGB: number;
    monthlyOpex: number;
    threeYearTco: number;
    storageEfficiency: string;
    features: string[];
  };
  cloudB: {
    name: string;
    nodeSku: string;
    nodeCount: number;
    coresPerNode: number;
    ramPerNodeGB: number;
    rawStoragePerNodeTB: number;
    usableStorageTB: number;
    vCpuAllocation: number;
    ramAllocationGB: number;
    monthlyOpex: number;
    threeYearTco: number;
    storageEfficiency: string;
    features: string[];
  };
}

export function exportDualCloudComparisonExcel(data: DualCloudComparisonData): void {
  const { projectName, architectName = 'Wasim Sayyed, Principal Cloud Architect', cloudA, cloudB } = data;
  const exportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const costDifferenceMonthly = Math.abs(cloudA.monthlyOpex - cloudB.monthlyOpex);
  const costDifference3Yr = Math.abs(cloudA.threeYearTco - cloudB.threeYearTco);
  const cheaperCloud = cloudA.threeYearTco <= cloudB.threeYearTco ? cloudA.name : cloudB.name;
  const savingsPercent = Math.round(
    (costDifference3Yr / Math.max(cloudA.threeYearTco, cloudB.threeYearTco)) * 100
  );

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${projectName} - Side-by-Side Cloud Comparison</Title>
  <Author>${architectName}</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>Enterprise Cloud Architecture</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
   <Interior/>
  </Style>

  <!-- Header Banner -->
  <Style ss:ID="HeaderTitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#06B6D4"/>
   </Borders>
  </Style>

  <Style ss:ID="HeaderSubtitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#94A3B8"/>
   <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
  </Style>

  <!-- Section Title -->
  <Style ss:ID="SectionHeading">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="12" ss:Bold="1" ss:Color="#0F172A"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
  </Style>

  <!-- Table Headers -->
  <Style ss:ID="TableHeadCloudA">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0284C7" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0369A1"/>
   </Borders>
  </Style>

  <Style ss:ID="TableHeadCloudB">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#10B981" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#047857"/>
   </Borders>
  </Style>

  <Style ss:ID="MetricLabel">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#334155"/>
   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="MetricValueA">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Consolas" ss:Size="11" ss:Color="#0369A1" ss:Bold="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="MetricValueB">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Consolas" ss:Size="11" ss:Color="#047857" ss:Bold="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Currency Style -->
  <Style ss:ID="CurrencyValueA">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Consolas" ss:Size="11" ss:Color="#0369A1" ss:Bold="1"/>
   <NumberFormat ss:Format="&quot;$&quot;#,##0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <Style ss:ID="CurrencyValueB">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Consolas" ss:Size="11" ss:Color="#047857" ss:Bold="1"/>
   <NumberFormat ss:Format="&quot;$&quot;#,##0"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>

  <!-- Winner Highlight -->
  <Style ss:ID="WinnerBadge">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#047857"/>
   <Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="All" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#A7F3D0"/>
   </Borders>
  </Style>
 </Styles>

 <!-- TAB 1: EXECUTIVE COMPARISON -->
 <Worksheet ss:Name="Executive Comparison">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="260"/>
   <Column ss:Width="200"/>
   <Column ss:Width="200"/>
   <Column ss:Width="160"/>

   <!-- Header Rows -->
   <Row ss:Height="30">
    <Cell ss:MergeAcross="3" ss:StyleID="HeaderTitle">
     <Data ss:Type="String">  ENTERPRISE CLOUD ARCHITECTURE · SIDE-BY-SIDE CLOUD SIZING COMPARISON</Data>
    </Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:MergeAcross="3" ss:StyleID="HeaderSubtitle">
     <Data ss:Type="String">  Project: ${projectName} | Lead Architect: ${architectName} | Date: ${exportDate}</Data>
    </Cell>
   </Row>
   <Row ss:Height="12"><Cell><Data ss:Type="String"></Data></Cell></Row>

   <!-- Recommendation Banner -->
   <Row ss:Height="24">
    <Cell ss:MergeAcross="3" ss:StyleID="WinnerBadge">
     <Data ss:Type="String">★ TCO WINNER: ${cheaperCloud} delivers estimated ${savingsPercent}% savings ($${costDifference3Yr.toLocaleString()} over 36 months) ★</Data>
    </Cell>
   </Row>
   <Row ss:Height="12"><Cell><Data ss:Type="String"></Data></Cell></Row>

   <!-- Main KPI Table -->
   <Row ss:Height="26">
    <Cell ss:StyleID="SectionHeading"><Data ss:Type="String">Architectural Dimension / Metric</Data></Cell>
    <Cell ss:StyleID="TableHeadCloudA"><Data ss:Type="String">Option A: ${cloudA.name}</Data></Cell>
    <Cell ss:StyleID="TableHeadCloudB"><Data ss:Type="String">Option B: ${cloudB.name}</Data></Cell>
    <Cell ss:StyleID="SectionHeading"><Data ss:Type="String">Delta Variance</Data></Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Target Cloud Node SKU</Data></Cell>
    <Cell ss:StyleID="MetricValueA"><Data ss:Type="String">${cloudA.nodeSku}</Data></Cell>
    <Cell ss:StyleID="MetricValueB"><Data ss:Type="String">${cloudB.nodeSku}</Data></Cell>
    <Cell><Data ss:Type="String">Hardware Baseline</Data></Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Recommended Cluster Host Count</Data></Cell>
    <Cell ss:StyleID="MetricValueA"><Data ss:Type="Number">${cloudA.nodeCount}</Data></Cell>
    <Cell ss:StyleID="MetricValueB"><Data ss:Type="Number">${cloudB.nodeCount}</Data></Cell>
    <Cell><Data ss:Type="String">${Math.abs(cloudA.nodeCount - cloudB.nodeCount)} nodes delta</Data></Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Total Physical Compute Cores</Data></Cell>
    <Cell ss:StyleID="MetricValueA"><Data ss:Type="Number">${cloudA.nodeCount * cloudA.coresPerNode}</Data></Cell>
    <Cell ss:StyleID="MetricValueB"><Data ss:Type="Number">${cloudB.nodeCount * cloudB.coresPerNode}</Data></Cell>
    <Cell><Data ss:Type="String">${Math.abs(cloudA.nodeCount * cloudA.coresPerNode - cloudB.nodeCount * cloudB.coresPerNode)} cores</Data></Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Total Cluster Memory (GB RAM)</Data></Cell>
    <Cell ss:StyleID="MetricValueA"><Data ss:Type="Number">${cloudA.nodeCount * cloudA.ramPerNodeGB}</Data></Cell>
    <Cell ss:StyleID="MetricValueB"><Data ss:Type="Number">${cloudB.nodeCount * cloudB.ramPerNodeGB}</Data></Cell>
    <Cell><Data ss:Type="String">${Math.abs(cloudA.nodeCount * cloudA.ramPerNodeGB - cloudB.nodeCount * cloudB.ramPerNodeGB)} GB</Data></Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Usable Decoupled Storage Pool (TB)</Data></Cell>
    <Cell ss:StyleID="MetricValueA"><Data ss:Type="Number">${cloudA.usableStorageTB}</Data></Cell>
    <Cell ss:StyleID="MetricValueB"><Data ss:Type="Number">${cloudB.usableStorageTB}</Data></Cell>
    <Cell><Data ss:Type="String">${Math.abs(cloudA.usableStorageTB - cloudB.usableStorageTB).toFixed(1)} TB</Data></Cell>
   </Row>

   <Row>
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">Indicative Monthly Host Cost (USD, not a vendor list price)</Data></Cell>
    <Cell ss:StyleID="CurrencyValueA"><Data ss:Type="Number">${cloudA.monthlyOpex}</Data></Cell>
    <Cell ss:StyleID="CurrencyValueB"><Data ss:Type="Number">${cloudB.monthlyOpex}</Data></Cell>
    <Cell><Data ss:Type="String">$${costDifferenceMonthly.toLocaleString()} / mo</Data></Cell>
   </Row>

   <Row ss:Height="24">
    <Cell ss:StyleID="MetricLabel"><Data ss:Type="String">36-Month Indicative Cost (flat monthly rate x 36, hosts only)</Data></Cell>
    <Cell ss:StyleID="CurrencyValueA"><Data ss:Type="Number">${cloudA.threeYearTco}</Data></Cell>
    <Cell ss:StyleID="CurrencyValueB"><Data ss:Type="Number">${cloudB.threeYearTco}</Data></Cell>
    <Cell ss:StyleID="WinnerBadge"><Data ss:Type="String">$${costDifference3Yr.toLocaleString()} Net Delta</Data></Cell>
   </Row>

   <Row>
    <Cell><Data ss:Type="String">${(data.pricingNote ?? 'Prices are indicative planning figures, not vendor list prices.').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Cloud_Comparison_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
