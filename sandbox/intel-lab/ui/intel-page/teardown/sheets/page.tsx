'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CompanyDataProduct } from '@/types/data-product';
import { RoleTeardownSynthesis } from '@/types/teardown-strategy';
import { buildResearchWorkbook, SheetTab } from '@/engine/gsheets-exporter';

function SheetsPreviewContent() {
  const searchParams = useSearchParams();
  const company = searchParams.get('company') || 'Linear';
  const role = searchParams.get('role') || 'Lead Product Manager, Workflows';
  const scopedProduct = searchParams.get('scopedProduct') || company;
  const companyId = searchParams.get('companyId') || 'comp-default';

  const [dataProduct, setDataProduct] = useState<CompanyDataProduct | null>(null);
  const [synthesis, setSynthesis] = useState<RoleTeardownSynthesis | null>(null);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/intel/product?companyId=${encodeURIComponent(companyId)}&companyName=${encodeURIComponent(company)}&roleTitle=${encodeURIComponent(role)}&scopedProduct=${encodeURIComponent(scopedProduct)}`
        );
        if (res.ok) {
          const json = await res.json();
          setDataProduct(json.dataProduct);
          setSynthesis(json.synthesis);
        }
      } catch (err) {
        console.error('Failed to load teardown for sheets:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [companyId, company, role, scopedProduct]);

  const workbook = useMemo(() => {
    if (!dataProduct || !synthesis) return null;
    return buildResearchWorkbook({
      companyName: company,
      roleTitle: role,
      scopedProduct,
      dataProduct,
      synthesis,
    });
  }, [company, role, scopedProduct, dataProduct, synthesis]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-300 flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Synthesizing 3-Tab Master Tracker for {company}...</span>
        </div>
      </div>
    );
  }

  if (!workbook) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-300 flex items-center justify-center font-mono text-sm">
        <span>No workbook available. Please ensure intelligence data is synthesized.</span>
      </div>
    );
  }

  const activeTab: SheetTab = workbook.tabs[activeTabIdx];

  const handleDownloadCsv = () => {
    if (!activeTab) return;
    const headerLine = activeTab.columns.map((c) => `"${c.replace(/"/g, '""')}"`).join(',');
    const rowLines = activeTab.rows.map((row) =>
      activeTab.columns
        .map((col) => {
          const val = String(row[col] ?? '');
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = [headerLine, ...rowLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${company.toLowerCase()}-${activeTab.tabName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header Controls */}
      <header className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-[#0F1523]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <a
            href="/radar"
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>←</span> Back to Radar
          </a>
          <span className="text-white/20">|</span>
          <span className="text-xs font-semibold text-white tracking-tight">
            Google Sheets Research Master Tracker (3 Tabs)
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            7-PILLAR ARCHITECTURE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 rounded-lg bg-[#161F33] hover:bg-slate-800 border border-white/10 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>📥 Export Active Tab (CSV)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>🖨 Print / PDF</span>
          </button>
        </div>
      </header>

      {/* Main Table View */}
      <main className="flex-1 p-6 md:p-8 flex flex-col max-w-7xl mx-auto w-full">
        {/* Title Bar */}
        <div className="mb-6">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
            Company Research Master Workbook • {scopedProduct}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {company} — Intelligence &amp; Telemetry Matrix
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Mapped across Corporate Identity, Financial Health, Customer Complaints, Competitor SWOT, and Execution KPIs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 mb-4 pb-2">
          {workbook.tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTabIdx(idx)}
              className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
                idx === activeTabIdx
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'bg-[#0F1523] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span className="opacity-60">Tab {idx + 1}:</span>
              <span>{tab.tabName}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/30">
                {tab.rows.length} rows
              </span>
            </button>
          ))}
        </div>

        {/* Data Grid Table */}
        <div className="flex-1 rounded-xl bg-[#0F1523] border border-white/10 overflow-hidden shadow-xl flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#161F33] text-[11px] uppercase font-mono text-slate-400 border-b border-white/10 sticky top-0">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  {activeTab.columns.map((col, idx) => (
                    <th key={idx} className="py-3 px-4 tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {activeTab.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-white/[0.02] transition-colors odd:bg-transparent even:bg-white/[0.01]"
                  >
                    <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                      {rIdx + 1}
                    </td>
                    {activeTab.columns.map((col, cIdx) => {
                      const cellValue = String(row[col] ?? '');
                      const isVerified =
                        cellValue.includes('VERIFIED') ||
                        cellValue.includes('Tier 1') ||
                        cellValue.includes('ACTIVE');
                      return (
                        <td
                          key={cIdx}
                          className={`py-3 px-4 leading-relaxed ${
                            cIdx === 0
                              ? 'font-semibold text-white'
                              : 'text-slate-300'
                          }`}
                        >
                          {isVerified ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {cellValue}
                            </span>
                          ) : (
                            cellValue
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[#161F33]/60 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Workbook: 3 Active Tabs</span>
            <span>Total Cells: {activeTab.rows.length * activeTab.columns.length}</span>
            <span>Status: Formatted for Google Sheets Export</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SheetsPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B11] text-slate-300 flex items-center justify-center font-mono text-xs">
          Loading Master Tracker...
        </div>
      }
    >
      <SheetsPreviewContent />
    </Suspense>
  );
}

