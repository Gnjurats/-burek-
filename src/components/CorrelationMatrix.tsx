'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { CATEGORY_COLORS } from '../lib/categoryColors';

interface CorrelationData {
  assets: string[];
  categories: Record<string, string>;
  matrix: number[][];
}

const CATEGORY_LABELS: Record<string, string> = {
  crypto: 'Crypto',
  stocks: 'Stocks',
  commodities: 'Commodities',
};

export default function CorrelationMatrix() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<CorrelationData | null>(null);
  const [filters, setFilters] = useState({ crypto: true, stocks: true, commodities: true });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    fetch('/data/correlation_matrix.json')
      .then(r => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: width });
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
    const indices = data.assets
      .map((a, i) => ({ name: a, index: i, cat: data.categories[a] }))
      .filter(a => activeCategories.includes(a.cat));

    if (indices.length === 0) return;

    const n = indices.length;
    const margin = { top: 90, right: 20, bottom: 20, left: 90 };
    const size = Math.min(dimensions.width, 600);
    const innerSize = size - margin.left - margin.right;
    const cellSize = innerSize / n;

    svg.attr('width', size).attr('height', size);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(['#3b82f6', '#1e293b', '#ef4444']);

    const tooltip = d3.select(tooltipRef.current);

    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        const val = data.matrix[indices[row].index][indices[col].index];
        g.append('rect')
          .attr('x', col * cellSize)
          .attr('y', row * cellSize)
          .attr('width', cellSize - 1)
          .attr('height', cellSize - 1)
          .attr('rx', 2)
          .attr('fill', colorScale(val))
          .attr('stroke', 'transparent')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseenter', function (event) {
            d3.select(this).attr('stroke', '#ffffff').attr('stroke-width', 2);

            g.selectAll('.axis-label-x').attr('fill', (_, i) =>
              i === col ? '#ffffff' : 'rgba(148,163,184,0.7)'
            );
            g.selectAll('.axis-label-y').attr('fill', (_, i) =>
              i === row ? '#ffffff' : 'rgba(148,163,184,0.7)'
            );

            tooltip
              .style('opacity', '1')
              .style('left', `${event.offsetX + 12}px`)
              .style('top', `${event.offsetY - 40}px`)
              .html(`
                <div style="font-weight:600;margin-bottom:2px">${indices[row].name} &harr; ${indices[col].name}</div>
                <div style="font-size:18px;font-weight:700;color:${colorScale(val)}">${val.toFixed(4)}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">${
                  val > 0.7 ? 'Strong positive' :
                  val > 0.3 ? 'Moderate positive' :
                  val > -0.3 ? 'Weak / No correlation' :
                  val > -0.7 ? 'Moderate negative' : 'Strong negative'
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
            g.selectAll('.axis-label-x').attr('fill', 'rgba(148,163,184,0.7)');
            g.selectAll('.axis-label-y').attr('fill', 'rgba(148,163,184,0.7)');
            tooltip.style('opacity', '0');
          });

        if (cellSize > 28) {
          g.append('text')
            .attr('x', col * cellSize + cellSize / 2)
            .attr('y', row * cellSize + cellSize / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', Math.min(cellSize * 0.28, 12))
            .attr('fill', Math.abs(val) > 0.5 ? '#ffffff' : 'rgba(255,255,255,0.5)')
            .attr('pointer-events', 'none')
            .text(val.toFixed(2));
        }
      }
    }

    indices.forEach((asset, i) => {
      g.append('text')
        .attr('class', 'axis-label-x')
        .attr('x', i * cellSize + cellSize / 2)
        .attr('y', -8)
        .attr('text-anchor', 'start')
        .attr('transform', `rotate(-45, ${i * cellSize + cellSize / 2}, -8)`)
        .attr('font-size', Math.min(cellSize * 0.35, 12))
        .attr('fill', 'rgba(148,163,184,0.7)')
        .text(asset.name);

      g.append('text')
        .attr('class', 'axis-label-y')
        .attr('x', -8)
        .attr('y', i * cellSize + cellSize / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'central')
        .attr('font-size', Math.min(cellSize * 0.35, 12))
        .attr('fill', 'rgba(148,163,184,0.7)')
        .text(asset.name);
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

      <div ref={containerRef} className="relative w-full max-w-[600px] mx-auto">
        <svg ref={svgRef} />
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none opacity-0 transition-opacity duration-150 bg-slate-800 border border-white/20 rounded-lg px-3 py-2 text-white text-xs shadow-xl z-10"
          style={{ whiteSpace: 'nowrap' }}
        />
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-gray-500">-1</span>
        <div className="w-48 h-3 rounded-full" style={{
          background: 'linear-gradient(to right, #3b82f6, #1e293b 50%, #ef4444)'
        }} />
        <span className="text-xs text-gray-500">+1</span>
      </div>
      <div className="flex items-center justify-center gap-6 mt-1">
        <span className="text-[10px] text-gray-500">Strong Negative</span>
        <span className="text-[10px] text-gray-500">No Correlation</span>
        <span className="text-[10px] text-gray-500">Strong Positive</span>
      </div>
    </div>
  );
}
