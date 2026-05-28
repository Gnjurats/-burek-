'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

interface TimelineEntry {
  year: number;
  return: number;
  volatility: number;
}

interface AssetData {
  name: string;
  category: string;
  timeline: TimelineEntry[];
}

const CATEGORY_COLORS: Record<string, string> = {
  crypto: '#f59e0b',
  stocks: '#3b82f6',
  commodities: '#10b981',
};

const CATEGORY_LABELS: Record<string, string> = {
  crypto: 'Crypto',
  stocks: 'Stocks',
  commodities: 'Commodities',
};

const YEARS = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

export default function VolatilityHeatmap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<AssetData[] | null>(null);
  const [filters, setFilters] = useState({ crypto: true, stocks: true, commodities: true });
  const [dimensions, setDimensions] = useState({ width: 0 });

  useEffect(() => {
    fetch('/data/annual_evolution.json')
      .then(r => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDimensions({ width });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const draw = useCallback(() => {
    if (!data || !svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const activeCategories = Object.entries(filters)
      .filter(([, v]) => v)
      .map(([k]) => k);
    const filtered = data.filter(a => activeCategories.includes(a.category));

    if (filtered.length === 0) return;

    const n = filtered.length;
    const nYears = YEARS.length;
    const margin = { top: 40, right: 20, bottom: 20, left: 100 };
    const width = Math.max(dimensions.width, 400);
    const innerWidth = width - margin.left - margin.right;
    const cellWidth = innerWidth / nYears;
    const cellHeight = Math.min(Math.max(cellWidth * 0.6, 22), 32);
    const innerHeight = n * cellHeight;
    const height = innerHeight + margin.top + margin.bottom;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Build lookup: asset name -> year -> volatility
    const volMap = new Map<string, Map<number, number>>();
    filtered.forEach(asset => {
      const yearMap = new Map<number, number>();
      asset.timeline.forEach(t => {
        yearMap.set(t.year, t.volatility * 100); // convert to percentage
      });
      volMap.set(asset.name, yearMap);
    });

    // Find global max volatility for color scale
    let maxVol = 0;
    volMap.forEach(yearMap => {
      yearMap.forEach(v => { if (v > maxVol) maxVol = v; });
    });

    // Sequential color scale: green → yellow → orange → red
    const colorScale = d3.scaleLinear<string>()
      .domain([0, maxVol * 0.25, maxVol * 0.5, maxVol])
      .range(['#10b981', '#eab308', '#f97316', '#ef4444'])
      .clamp(true);

    const tooltip = d3.select(tooltipRef.current);

    // Draw cells
    filtered.forEach((asset, row) => {
      const yearMap = volMap.get(asset.name)!;

      YEARS.forEach((year, col) => {
        const vol = yearMap.get(year);
        const hasData = vol !== undefined;

        const rect = g.append('rect')
          .attr('x', col * cellWidth)
          .attr('y', row * cellHeight)
          .attr('width', cellWidth - 1)
          .attr('height', cellHeight - 1)
          .attr('rx', 2)
          .attr('fill', hasData ? colorScale(vol!) : 'rgba(255,255,255,0.03)')
          .attr('stroke', 'transparent')
          .attr('stroke-width', 2)
          .style('cursor', hasData ? 'pointer' : 'default');

        if (hasData) {
          rect
            .on('mouseenter', function (event) {
              d3.select(this).attr('stroke', '#ffffff').attr('stroke-width', 2);
              tooltip
                .style('opacity', '1')
                .style('left', `${event.offsetX + 12}px`)
                .style('top', `${event.offsetY - 40}px`)
                .html(`
                  <div style="font-weight:600;margin-bottom:2px">${asset.name}</div>
                  <div style="font-size:11px;color:#94a3b8;margin-bottom:4px">${year}</div>
                  <div style="font-size:18px;font-weight:700;color:${colorScale(vol!)}">${vol!.toFixed(1)}%</div>
                  <div style="font-size:11px;color:#94a3b8;margin-top:2px">${
                    vol! < 20 ? 'Low volatility' :
                    vol! < 50 ? 'Moderate volatility' :
                    vol! < 80 ? 'High volatility' : 'Extreme volatility'
                  }</div>
                `);
            })
            .on('mousemove', function (event) {
              tooltip
                .style('left', `${event.offsetX + 12}px`)
                .style('top', `${event.offsetY - 40}px`);
            })
            .on('mouseleave', function () {
              d3.select(this).attr('stroke', 'transparent');
              tooltip.style('opacity', '0');
            });
        }

        // Cell text
        if (cellWidth > 30) {
          g.append('text')
            .attr('x', col * cellWidth + cellWidth / 2)
            .attr('y', row * cellHeight + cellHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', Math.min(cellWidth * 0.25, 11))
            .attr('fill', hasData ? (vol! > maxVol * 0.4 ? '#ffffff' : 'rgba(255,255,255,0.7)') : 'rgba(255,255,255,0.15)')
            .attr('pointer-events', 'none')
            .text(hasData ? `${vol!.toFixed(0)}%` : '—');
        }
      });
    });

    // Y-axis labels (asset names)
    filtered.forEach((asset, i) => {
      g.append('text')
        .attr('x', -8)
        .attr('y', i * cellHeight + cellHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .attr('font-size', Math.min(cellHeight * 0.5, 12))
        .attr('fill', 'rgba(148,163,184,0.7)')
        .text(asset.name);
    });

    // X-axis labels (years)
    YEARS.forEach((year, i) => {
      g.append('text')
        .attr('x', i * cellWidth + cellWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', Math.min(cellWidth * 0.3, 12))
        .attr('fill', 'rgba(148,163,184,0.7)')
        .text(year);
    });

  }, [data, filters, dimensions]);

  useEffect(() => { draw(); }, [draw]);

  const toggleFilter = (cat: string) => {
    setFilters(prev => ({ ...prev, [cat]: !prev[cat as keyof typeof prev] }));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
              filters[key as keyof typeof filters]
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-white/5 bg-white/[0.02] text-gray-500'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: filters[key as keyof typeof filters] ? CATEGORY_COLORS[key] : '#475569' }}
            />
            {label}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="relative w-full overflow-x-auto">
        <svg ref={svgRef} />
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none opacity-0 transition-opacity duration-150 bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white text-xs shadow-xl z-10"
          style={{ whiteSpace: 'nowrap' }}
        />
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-gray-500">Low</span>
        <div className="w-48 h-3 rounded-full" style={{
          background: 'linear-gradient(to right, #10b981, #eab308 33%, #f97316 66%, #ef4444)'
        }} />
        <span className="text-xs text-gray-500">High</span>
      </div>
      <div className="flex items-center justify-center gap-8 mt-1">
        <span className="text-[10px] text-gray-500">Stable</span>
        <span className="text-[10px] text-gray-500">Volatile</span>
      </div>
    </div>
  );
}
