'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CompanyDataProduct } from '@/types/data-product';
import { RoleTeardownSynthesis } from '@/types/teardown-strategy';
import { buildExecutiveSlidesDeck, SlideContent } from '@/engine/gslides-exporter';

function SlidesPreviewContent() {
  const searchParams = useSearchParams();
  const company = searchParams.get('company') || 'Linear';
  const role = searchParams.get('role') || 'Lead Product Manager, Workflows';
  const scopedProduct = searchParams.get('scopedProduct') || company;
  const companyId = searchParams.get('companyId') || 'comp-default';

  const [dataProduct, setDataProduct] = useState<CompanyDataProduct | null>(null);
  const [synthesis, setSynthesis] = useState<RoleTeardownSynthesis | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
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
        console.error('Failed to load teardown for slides:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [companyId, company, role, scopedProduct]);

  const deck = useMemo(() => {
    if (!dataProduct || !synthesis) return null;
    return buildExecutiveSlidesDeck({
      companyName: company,
      roleTitle: role,
      scopedProduct,
      dataProduct,
      synthesis,
    });
  }, [company, role, scopedProduct, dataProduct, synthesis]);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!deck) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-300 flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Synthesizing 6-Slide Executive Deck for {company}...</span>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-300 flex items-center justify-center font-mono text-sm">
        <span>No deck available. Please ensure intelligence data is synthesized.</span>
      </div>
    );
  }

  const currentSlide: SlideContent = deck.slides[currentSlideIndex];

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
            Google Slides Executive Deck (6 Slides)
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
            16:9 WIDESCREEN
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#161F33] border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white disabled:opacity-30 transition-colors font-mono"
            >
              ◀ Prev
            </button>
            <span className="px-2 text-xs font-mono text-slate-400">
              Slide {currentSlideIndex + 1} / {deck.slides.length}
            </span>
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === deck.slides.length - 1}
              className="px-2.5 py-1 text-xs text-slate-300 hover:text-white disabled:opacity-30 transition-colors font-mono"
            >
              Next ▶
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>🖨 Print / Export Deck</span>
          </button>
        </div>
      </header>

      {/* Main Slide Presentation View */}
      <main className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center">
        {/* 16:9 Slide Canvas */}
        <div className="w-full max-w-5xl aspect-[16/9] bg-[#0F1523] rounded-2xl border border-white/10 shadow-2xl p-8 md:p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-300">
          {/* Subtle Canvas Watermark & Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold block mb-1">
                {scopedProduct} • Executive Value Teardown
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {currentSlide.slideTitle}
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">{currentSlide.subtitle}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-white/30">
                0{currentSlide.slideNumber}
              </span>
            </div>
          </div>

          {/* Slide Body Content */}
          <div className="flex-1 my-6 flex flex-col justify-center space-y-4">
            <div className="space-y-3">
              {currentSlide.bulletPoints.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                  <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans">{bullet}</p>
                </div>
              ))}
            </div>

            {/* Optional Callout Box */}
            {currentSlide.calloutBox && (
              <div className="p-4 rounded-xl bg-[#161F33]/80 border border-sky-500/20 mt-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block mb-1">
                  {currentSlide.calloutBox.label}
                </span>
                <p className="text-xs md:text-sm text-slate-300 italic">
                  &ldquo;{currentSlide.calloutBox.content}&rdquo;
                </p>
              </div>
            )}

            {/* Optional Metrics Highlight Ribbon */}
            {currentSlide.metricsHighlight && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                {currentSlide.metricsHighlight.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#161F33] border border-white/5">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                      {m.label}
                    </span>
                    <span className="text-lg font-bold text-white">{m.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slide Footer */}
          <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Prepared for: {role}</span>
            <span>Backdoor Executive Intelligence Engine (M5)</span>
            <span>Page {currentSlideIndex + 1} of {deck.slides.length}</span>
          </div>
        </div>

        {/* Slide Thumbnail Navigation Strip */}
        <div className="w-full max-w-5xl mt-6 flex items-center justify-center gap-2 overflow-x-auto py-2">
          {deck.slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                idx === currentSlideIndex
                  ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400'
                  : 'bg-[#0F1523] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <span>0{s.slideNumber}</span>
              <span className="hidden sm:inline truncate max-w-[100px]">{s.slideTitle.split(':')[0]}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function SlidesPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B11] text-slate-300 flex items-center justify-center font-mono text-xs">
          Loading Slides Deck...
        </div>
      }
    >
      <SlidesPreviewContent />
    </Suspense>
  );
}
