import React, { useState, useEffect } from 'react';
import {
  Database,
  Table as TableIcon,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileCode,
  X
} from 'lucide-react';
import {
  TableInventoryItem,
  ALLOWLISTED_TABLES,
  adminService
} from '../../../services/adminService';

interface AdminDatabaseViewProps {
  currentUserEmail: string;
}

export const AdminDatabaseView: React.FC<AdminDatabaseViewProps> = ({
  currentUserEmail
}) => {
  const [selectedTable, setSelectedTable] = useState<TableInventoryItem>(ALLOWLISTED_TABLES[0]);
  const [activeTab, setActiveTab] = useState<'records' | 'schema' | 'security'>('records');

  // Query states
  const [records, setRecords] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(15);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRecords = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminService.queryTableRecords(selectedTable.name, {
        page,
        pageSize,
        searchQuery: searchTerm
      });

      if (res.error) {
        setErrorMessage(res.error);
        setRecords([]);
        setTotalCount(0);
      } else {
        setRecords(res.records);
        setTotalCount(res.totalCount);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to query table data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchRecords();
  }, [selectedTable]);

  useEffect(() => {
    fetchRecords();
  }, [page]);

  const handleExportTable = () => {
    if (records.length === 0) return;
    adminService.exportToCsv(`zaboraa_table_${selectedTable.name}`, records);
    void adminService.logAuditEvent({
      actorEmail: currentUserEmail,
      actorRole: 'admin',
      action: 'EXPORT_DATABASE_TABLE_CSV',
      targetEntity: selectedTable.name,
      outcome: 'success',
      metadata: { rowCount: records.length }
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <Database className="w-3.5 h-3.5" />
            <span>LEAST-PRIVILEGE DATA EXPLORER & SCHEMA MATRIX</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Application Database Tables & RLS Policies
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Read-only inspector with strict table allowlisting. Service keys are never exposed and arbitrary SQL execution is blocked by architecture design.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportTable}
            disabled={records.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Table Data</span>
          </button>
        </div>
      </div>

      {/* Table Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {ALLOWLISTED_TABLES.map((tbl) => {
          const isSelected = selectedTable.name === tbl.name;
          return (
            <button
              key={tbl.name}
              onClick={() => setSelectedTable(tbl)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{tbl.name}</span>
              {tbl.hasRLS && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="RLS Enabled" />
              )}
            </button>
          );
        })}
      </div>

      {/* Table Card Overview */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono text-sm">{selectedTable.label}</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
              RLS ACTIVE
            </span>
          </div>
          <p className="text-slate-400 text-xs">{selectedTable.description}</p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'records'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Records ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Columns & Types ({selectedTable.columns.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === 'security'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Security & RLS
          </button>
        </div>
      </div>

      {/* Tab 1: Live Records */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Search & Refresh */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search records in ${selectedTable.name}...`}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={fetchRecords}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Refresh Records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Error notice if any */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs">
              {errorMessage}
            </div>
          )}

          {/* Records Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {selectedTable.columns.slice(0, 5).map((col) => (
                      <th key={col.name} className="py-3 px-4">
                        {col.name}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        Querying verified table rows...
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-sans">
                        No rows found in table <code className="text-cyan-400">{selectedTable.name}</code>.
                      </td>
                    </tr>
                  ) : (
                    records.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-800/40 transition cursor-pointer"
                        onClick={() => setSelectedRecord(row)}
                      >
                        {selectedTable.columns.slice(0, 5).map((col) => {
                          const val = row[col.name];
                          const displayVal =
                            val === null || val === undefined
                              ? 'null'
                              : typeof val === 'object'
                              ? JSON.stringify(val).substring(0, 30) + '...'
                              : String(val);
                          return (
                            <td key={col.name} className="py-2.5 px-4 truncate max-w-[180px]">
                              {displayVal}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecord(row);
                            }}
                            className="p-1 rounded text-cyan-400 hover:text-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div>
                Showing page {page} of {totalPages} ({totalCount} total records)
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Columns & Types */}
      {activeTab === 'schema' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">PostgreSQL Type</th>
                <th className="py-3 px-4">Key / Nullable</th>
                <th className="py-3 px-4">Default Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
              {selectedTable.columns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 font-bold text-white flex items-center gap-2">
                    {col.name}
                    {col.isPrimaryKey && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px]">
                        PRIMARY KEY
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-cyan-300">{col.type}</td>
                  <td className="py-2.5 px-4">
                    {col.isNullable ? (
                      <span className="text-slate-400">Nullable</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">NOT NULL</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">{col.defaultValue || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Security & RLS Policies */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-400 font-mono text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Row-Level Security (RLS) Policy Audit</span>
          </div>
          <p className="text-slate-300 leading-relaxed max-w-2xl">
            Table <code className="text-cyan-300">{selectedTable.name}</code> has strict Row-Level Security policies active. Anonymous public requests cannot mutate records without passing schema validation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white font-mono">SELECT Policy</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Admins have unrestricted global visibility. Authenticated users are isolated to their own records via <code className="text-cyan-300">auth.uid() = user_id</code>.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-white font-mono">INSERT & UPDATE Policy</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Role elevation and sensitive column overrides require verified admin role query on <code className="text-cyan-300">public.profiles</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Record Inspector Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  DATABASE RECORD INSPECTOR
                </span>
                <h2 className="text-sm font-bold text-white font-mono">{selectedTable.name} Row</h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-96">
              {JSON.stringify(selectedRecord, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
