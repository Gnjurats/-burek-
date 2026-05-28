'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { CATEGORY_COLORS } from '../lib/categoryColors';

interface AssetData {
  avgReturn: number;
  volatility: number;
  sharpeRatio: number;
}

interface Point {
  name: string;
  avgReturn: number;
  volatility: number;
  sharpeRatio: number;
  category: 'crypto' | 'stocks' | 'commodities';
}

const CATEGORIES: Record<string, 'crypto' | 'stocks' | 'commodities'> = {
  Bitcoin: 'crypto', Ethereum: 'crypto', Solana: 'crypto', Cardano: 'crypto',
  Polygon: 'crypto', Chainlink: 'crypto', Avalanche: 'crypto',
  'S&P500': 'stocks', QQQ: 'stocks', VTI: 'stocks', Russell2000: 'stocks',
  FTSE100: 'stocks', Nikkei225: 'stocks', DAX: 'stocks', US_Real_Estate: 'stocks',
  Gold: 'commodities', Silver: 'commodities', WTI_Crude: 'commodities',
  Copper: 'commodities', Natural_Gas: 'commodities',
};

const CAT_LABELS: Record<string, string> = {
  crypto: 'Crypto',
  stocks: 'Stocks',
  commodities: 'Commodities',
};

export default function RiskReturnScatter() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [rawData, setRawData] = useState<Record<string, AssetData> | null>(null);
  const [filters, setFilters] = useState({ crypto: true, stocks: true, commodities: true });
  const [containerWidth, setContainerWidth] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetch('/data/risk_return.json')
      .then(r => r.json())
      .then(setRawData);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => setContainerWidth(entries[0].contentRect.width));
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const draw = useCallback(() => {
    if (!rawData || !svgRef.current || containerWidth === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // All points (for scale computation)
    const allPoints: Point[] = Object.entries(rawData)
      .filter(([name]) => CATEGORIES[name])
      .map(([name, d]) => ({
        name,
        avgReturn: d.avgReturn * 100,
        volatility: d.volatility * 100,
        sharpeRatio: d.sharpeRatio,
        category: CATEGORIES[name],
      }));

    if (allPoints.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 55, left: 60 };
    const chartWidth = Math.min(containerWidth, 720);
    const height = Math.min(chartWidth * 0.65, 440);
    const innerW = chartWidth - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr('width', chartWidth).attr('height', height);

    const xMax = d3.max(allPoints, d => d.volatility)! * 1.1;
    const yMin = d3.min(allPoints, d => d.avgReturn)!;
    const yMax = d3.max(allPoints, d => d.avgReturn)!;
    const yPad = (yMax - yMin) * 0.15;

    const xScale = d3.scaleLinear().domain([0, xMax]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([innerH, 0]);

    const radiusScale = d3.scaleLinear()
      .domain([d3.min(allPoints, d => d.sharpeRatio)!, d3.max(allPoints, d => d.sharpeRatio)!])
      .range([4, 13])
      .clamp(true);

    // Clip path for zoom
    svg.append('defs').append('clipPath')
      .attr('id', 'scatter-clip')
      .append('rect')
      .attr('width', innerW)
      .attr('height', innerH);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Axes groups (for zoom update)
    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => `${d}%`))
      .call(g => g.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'))
      .call(g => g.selectAll('line').attr('stroke', '#334155'))
      .call(g => g.select('.domain').attr('stroke', '#334155'));

    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(6).tickFormat(d => `${d}%`))
      .call(g => g.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'))
      .call(g => g.selectAll('line').attr('stroke', '#334155'))
      .call(g => g.select('.domain').attr('stroke', '#334155'));

    // Content group (clipped for zoom)
    const content = g.append('g').attr('clip-path', 'url(#scatter-clip)');

    // Grid
    content.append('g').attr('class', 'grid-x')
      .selectAll('line')
      .data(xScale.ticks(6))
      .join('line')
      .attr('x1', d => xScale(d)).attr('x2', d => xScale(d))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#1e293b').attr('stroke-dasharray', '2,3');

    content.append('g').attr('class', 'grid-y')
      .selectAll('line')
      .data(yScale.ticks(6))
      .join('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', '#1e293b').attr('stroke-dasharray', '2,3');

    // Zero line
    if (yScale.domain()[0] < 0 && yScale.domain()[1] > 0) {
      content.append('line')
        .attr('class', 'zero-line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', yScale(0)).attr('y2', yScale(0))
        .attr('stroke', '#475569').attr('stroke-width', 1).attr('stroke-dasharray', '4,4');
    }

    // Median lines (quadrants)
    const medianVol = d3.median(allPoints, d => d.volatility)!;
    const medianRet = d3.median(allPoints, d => d.avgReturn)!;

    content.append('line').attr('class', 'median-v')
      .attr('x1', xScale(medianVol)).attr('x2', xScale(medianVol))
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#475569').attr('stroke-width', 1).attr('stroke-dasharray', '6,4').attr('opacity', 0.6);

    content.append('line').attr('class', 'median-h')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', yScale(medianRet)).attr('y2', yScale(medianRet))
      .attr('stroke', '#475569').attr('stroke-width', 1).attr('stroke-dasharray', '6,4').attr('opacity', 0.6);

    // Convex hulls per category
    const hullsGroup = content.append('g').attr('class', 'hulls-group');
    const categories: Array<'crypto' | 'stocks' | 'commodities'> = ['crypto', 'stocks', 'commodities'];

    categories.forEach(cat => {
      const catPoints = allPoints.filter(d => d.category === cat);
      if (catPoints.length < 3) return;

      const hullCoords = catPoints.map(d => [xScale(d.volatility), yScale(d.avgReturn)] as [number, number]);
      const hull = d3.polygonHull(hullCoords);
      if (!hull) return;

      // Expand hull slightly for padding
      const centroid = d3.polygonCentroid(hull);
      const expanded = hull.map(([px, py]) => {
        const dx = px - centroid[0];
        const dy = py - centroid[1];
        const scale = 1.15;
        return [centroid[0] + dx * scale, centroid[1] + dy * scale] as [number, number];
      });

      hullsGroup.append('path')
        .attr('class', `hull hull-${cat}`)
        .attr('d', `M${expanded.map(p => p.join(',')).join('L')}Z`)
        .attr('fill', CATEGORY_COLORS[cat])
        .attr('fill-opacity', filters[cat] ? 0.06 : 0.01)
        .attr('stroke', CATEGORY_COLORS[cat])
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '6,4')
        .attr('stroke-opacity', filters[cat] ? 0.3 : 0.05)
        .style('pointer-events', 'none');

      // Category label at centroid
      hullsGroup.append('text')
        .attr('class', `hull-label hull-label-${cat}`)
        .attr('x', centroid[0]).attr('y', centroid[1])
        .attr('text-anchor', 'middle')
        .attr('fill', CATEGORY_COLORS[cat])
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('opacity', filters[cat] ? 0.35 : 0.05)
        .style('pointer-events', 'none')
        .text(CAT_LABELS[cat]);
    });

    // Points group
    const pointsGroup = content.append('g').attr('class', 'points-group');

    // Voronoi for better interaction targets
    const voronoiPoints = allPoints.map(d => [xScale(d.volatility), yScale(d.avgReturn)] as [number, number]);
    const delaunay = d3.Delaunay.from(voronoiPoints);
    const voronoi = delaunay.voronoi([0, 0, innerW, innerH]);

    const tooltip = d3.select(tooltipRef.current);

    function getQuadrantLabel(d: Point): string {
      const highRisk = d.volatility > medianVol;
      const highReturn = d.avgReturn > medianRet;
      if (highReturn && !highRisk) return 'Low Risk, High Return';
      if (highReturn && highRisk) return 'High Risk, High Return';
      if (!highReturn && !highRisk) return 'Low Risk, Low Return';
      return 'High Risk, Low Return';
    }

    function showTooltip(event: MouseEvent, d: Point) {
      const color = CATEGORY_COLORS[d.category];
      tooltip
        .style('opacity', '1')
        .html(`
          <div style="border-bottom:2px solid ${color};padding-bottom:6px;margin-bottom:6px;">
            <div style="font-weight:700;font-size:13px;color:${color}">${d.name.replace(/_/g, ' ')}</div>
            <div style="color:${color};font-size:10px;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">${CAT_LABELS[d.category]}</div>
          </div>
          <div style="display:grid;grid-template-columns:auto auto;gap:3px 12px;font-size:12px;">
            <span style="color:#94a3b8">Return</span><span style="font-weight:600;color:${d.avgReturn >= 0 ? '#4ade80' : '#f87171'}">${d.avgReturn >= 0 ? '+' : ''}${d.avgReturn.toFixed(2)}%</span>
            <span style="color:#94a3b8">Volatility</span><span style="font-weight:600">${d.volatility.toFixed(2)}%</span>
            <span style="color:#94a3b8">Sharpe</span><span style="font-weight:600;color:${d.sharpeRatio >= 0.5 ? '#4ade80' : d.sharpeRatio >= 0 ? '#fbbf24' : '#f87171'}">${d.sharpeRatio.toFixed(3)}</span>
            <span style="color:#94a3b8">Quadrant</span><span style="font-size:11px">${getQuadrantLabel(d)}</span>
          </div>
        `);

      const containerRect = containerRef.current?.getBoundingClientRect();
      const tooltipEl = tooltipRef.current;
      if (!containerRect || !tooltipEl) return;
      let left = event.offsetX + 16;
      let top = event.offsetY - 16;
      if (left + tooltipEl.offsetWidth > containerRect.width - 10) left = event.offsetX - tooltipEl.offsetWidth - 16;
      if (top < 0) top = event.offsetY + 16;
      tooltip.style('left', `${left}px`).style('top', `${top}px`);
    }

    // Draw actual point circles
    const circles = pointsGroup.selectAll<SVGCircleElement, Point>('.point')
      .data(allPoints, d => d.name)
      .join('circle')
      .attr('class', 'point')
      .attr('cx', d => xScale(d.volatility))
      .attr('cy', d => yScale(d.avgReturn))
      .attr('r', d => filters[d.category] ? radiusScale(d.sharpeRatio) : 3)
      .attr('fill', d => CATEGORY_COLORS[d.category])
      .attr('fill-opacity', d => filters[d.category] ? 0.8 : 0.1)
      .attr('stroke', d => CATEGORY_COLORS[d.category])
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', d => filters[d.category] ? 0.5 : 0.1)
      .style('cursor', 'pointer')
      .style('transition', 'none');

    // Voronoi overlay for easier interaction
    content.append('g').attr('class', 'voronoi-group')
      .selectAll('path')
      .data(allPoints)
      .join('path')
      .attr('d', (_, i) => voronoi.renderCell(i))
      .attr('fill', 'transparent')
      .attr('pointer-events', 'all')
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        if (!filters[d.category]) return;
        circles.filter(p => p.name === d.name)
          .transition().duration(150)
          .attr('fill-opacity', 1)
          .attr('stroke-opacity', 1)
          .attr('stroke-width', 2.5)
          .attr('r', radiusScale(d.sharpeRatio) + 3);
        showTooltip(event as MouseEvent, d);
      })
      .on('mousemove', function (event, d) {
        if (!filters[d.category]) return;
        showTooltip(event as MouseEvent, d);
      })
      .on('mouseleave', function (_, d) {
        circles.filter(p => p.name === d.name)
          .transition().duration(250)
          .attr('fill-opacity', filters[d.category] ? 0.8 : 0.1)
          .attr('stroke-opacity', filters[d.category] ? 0.5 : 0.1)
          .attr('stroke-width', 1.5)
          .attr('r', filters[d.category] ? radiusScale(d.sharpeRatio) : 3);
        tooltip.style('opacity', '0');
      });

    // Labels for notable points
    const labelsGroup = content.append('g').attr('class', 'labels-group');
    labelsGroup.selectAll('.point-label')
      .data(allPoints.filter(d => filters[d.category] && (d.volatility > xMax * 0.15 || Math.abs(d.avgReturn) > (yMax - yMin) * 0.25)))
      .join('text')
      .attr('class', 'point-label')
      .attr('x', d => xScale(d.volatility) + radiusScale(d.sharpeRatio) + 4)
      .attr('y', d => yScale(d.avgReturn) + 3)
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('pointer-events', 'none')
      .text(d => d.name.replace(/_/g, ' '));

    // Axis labels
    svg.append('text')
      .attr('x', margin.left + innerW / 2)
      .attr('y', height - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text('Risk (Volatility %)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + innerH / 2))
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .text('Avg Monthly Return (%)');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 6])
      .extent([[0, 0], [innerW, innerH]])
      .translateExtent([[-50, -50], [innerW + 50, innerH + 50]])
      .on('zoom', (event) => {
        const t = event.transform;
        const newX = t.rescaleX(xScale);
        const newY = t.rescaleY(yScale);

        setIsZoomed(t.k !== 1 || t.x !== 0 || t.y !== 0);

        // Update axes
        xAxisGroup.call(d3.axisBottom(newX).ticks(6).tickFormat(d => `${d}%`))
          .call(g => g.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'))
          .call(g => g.selectAll('line').attr('stroke', '#334155'))
          .call(g => g.select('.domain').attr('stroke', '#334155'));

        yAxisGroup.call(d3.axisLeft(newY).ticks(6).tickFormat(d => `${d}%`))
          .call(g => g.selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px'))
          .call(g => g.selectAll('line').attr('stroke', '#334155'))
          .call(g => g.select('.domain').attr('stroke', '#334155'));

        // Update grid
        content.select('.grid-x').selectAll('line')
          .data(newX.ticks(6))
          .join('line')
          .attr('x1', d => newX(d)).attr('x2', d => newX(d))
          .attr('y1', 0).attr('y2', innerH)
          .attr('stroke', '#1e293b').attr('stroke-dasharray', '2,3');

        content.select('.grid-y').selectAll('line')
          .data(newY.ticks(6))
          .join('line')
          .attr('x1', 0).attr('x2', innerW)
          .attr('y1', d => newY(d)).attr('y2', d => newY(d))
          .attr('stroke', '#1e293b').attr('stroke-dasharray', '2,3');

        // Update medians
        content.select('.median-v')
          .attr('x1', newX(medianVol)).attr('x2', newX(medianVol));
        content.select('.median-h')
          .attr('y1', newY(medianRet)).attr('y2', newY(medianRet));

        // Zero line
        content.select('.zero-line')
          .attr('y1', newY(0)).attr('y2', newY(0));

        // Update points
        circles
          .attr('cx', d => newX(d.volatility))
          .attr('cy', d => newY(d.avgReturn));

        // Update labels
        labelsGroup.selectAll('.point-label')
          .attr('x', (d: any) => newX(d.volatility) + radiusScale(d.sharpeRatio) + 4)
          .attr('y', (d: any) => newY(d.avgReturn) + 3);

        // Update Voronoi (recreate for new positions)
        const newVoronoiPoints = allPoints.map(d => [newX(d.volatility), newY(d.avgReturn)] as [number, number]);
        const newDelaunay = d3.Delaunay.from(newVoronoiPoints);
        const newVoronoi = newDelaunay.voronoi([0, 0, innerW, innerH]);
        content.select('.voronoi-group').selectAll('path')
          .attr('d', (_, i) => newVoronoi.renderCell(i));

        // Update hulls
        categories.forEach(cat => {
          const catPoints = allPoints.filter(d => d.category === cat);
          if (catPoints.length < 3) return;
          const hullCoords = catPoints.map(d => [newX(d.volatility), newY(d.avgReturn)] as [number, number]);
          const hull = d3.polygonHull(hullCoords);
          if (!hull) return;
          const centroid = d3.polygonCentroid(hull);
          const expanded = hull.map(([px, py]) => {
            const dx = px - centroid[0];
            const dy = py - centroid[1];
            return [centroid[0] + dx * 1.15, centroid[1] + dy * 1.15] as [number, number];
          });
          content.select(`.hull-${cat}`)
            .attr('d', `M${expanded.map(p => p.join(',')).join('L')}Z`);
          content.select(`.hull-label-${cat}`)
            .attr('x', centroid[0]).attr('y', centroid[1]);
        });
      });

    svg.call(zoom);

    // Double-click to reset zoom
    svg.on('dblclick.zoom', () => {
      svg.transition().duration(600).ease(d3.easeCubicInOut).call(zoom.transform, d3.zoomIdentity);
      setIsZoomed(false);
    });

  }, [rawData, filters, containerWidth]);

  useEffect(() => { draw(); }, [draw]);

  const toggleFilter = (cat: string) => {
    setFilters(prev => ({ ...prev, [cat]: !prev[cat as keyof typeof prev] }));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {Object.entries(CAT_LABELS).map(([key, label]) => (
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
        {isZoomed && (
          <span className="text-[10px] text-gray-500 ml-2">Double-click to reset zoom</span>
        )}
        <span className="text-[11px] text-gray-500 ml-auto">Point size = Sharpe Ratio</span>
      </div>

      <div ref={containerRef} className="relative w-full max-w-[720px] mx-auto">
        <svg ref={svgRef} className="touch-none" />
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none opacity-0 transition-opacity duration-150 bg-slate-900/95 backdrop-blur-sm border border-white/15 rounded-lg px-3.5 py-2.5 text-white text-xs shadow-xl z-10"
          style={{ whiteSpace: 'nowrap' }}
        />
      </div>

      <p className="text-[11px] text-gray-600 text-center mt-2">
        Scroll to zoom · Drag to pan · Hover for details · Double-click to reset
      </p>
    </div>
  );
}
