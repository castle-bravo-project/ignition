/**
 * Drill-Down Donut Chart - Advanced Data Visualization
 * 
 * Interactive donut chart with drill-down capabilities, animated transitions,
 * and detailed segment analysis using D3.js and Framer Motion.
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { 
  PieChart, 
  ArrowLeft, 
  Info, 
  TrendingUp,
  Download,
  Maximize2
} from 'lucide-react';

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color?: string;
  children?: DonutSegment[];
  metadata?: {
    description?: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
    status?: 'success' | 'warning' | 'error' | 'info';
  };
}

interface DrillDownDonutChartProps {
  data: DonutSegment[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  onSegmentClick?: (segment: DonutSegment, level: number) => void;
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
  className?: string;
}

const DrillDownDonutChart: React.FC<DrillDownDonutChartProps> = ({
  data,
  width = 400,
  height = 400,
  innerRadius = 60,
  outerRadius = 150,
  onSegmentClick,
  showLabels = true,
  showValues = true,
  animated = true,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentData, setCurrentData] = useState<DonutSegment[]>(data);
  const [breadcrumb, setBreadcrumb] = useState<DonutSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<DonutSegment | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<DonutSegment | null>(null);

  // Brand colors
  const defaultColors = [
    '#f59e0b', '#fbbf24', '#10b981', '#3b82f6', '#8b5cf6', 
    '#f97316', '#ef4444', '#06b6d4', '#84cc16', '#f472b6'
  ];

  useEffect(() => {
    if (!svgRef.current || currentData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const centerX = width / 2;
    const centerY = height / 2;

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);

    // Create pie generator
    const pie = d3.pie<DonutSegment>()
      .value(d => d.value)
      .sort(null);

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<DonutSegment>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const hoverArc = d3.arc<d3.PieArcDatum<DonutSegment>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius + 10);

    // Generate pie data
    const pieData = pie(currentData);

    // Create segments
    const segments = g.selectAll('.segment')
      .data(pieData)
      .enter().append('g')
      .attr('class', 'segment');

    // Add paths
    const paths = segments.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => d.data.color || defaultColors[i % defaultColors.length])
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        setHoveredSegment(d.data);
        if (animated) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('d', hoverArc);
        }
      })
      .on('mouseleave', function(event, d) {
        setHoveredSegment(null);
        if (animated) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('d', arc);
        }
      })
      .on('click', (event, d) => {
        handleSegmentClick(d.data);
      });

    // Animate paths if enabled
    if (animated) {
      paths
        .attr('d', d3.arc<d3.PieArcDatum<DonutSegment>>()
          .innerRadius(innerRadius)
          .outerRadius(innerRadius))
        .transition()
        .duration(750)
        .attrTween('d', function(d) {
          const interpolate = d3.interpolate(
            { startAngle: 0, endAngle: 0 },
            { startAngle: d.startAngle, endAngle: d.endAngle }
          );
          return (t) => arc({ ...d, ...interpolate(t) }) || '';
        });
    }

    // Add labels if enabled
    if (showLabels) {
      const labelArc = d3.arc<d3.PieArcDatum<DonutSegment>>()
        .innerRadius(outerRadius + 20)
        .outerRadius(outerRadius + 20);

      segments.append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-family', 'system-ui, sans-serif')
        .attr('fill', '#d1d5db')
        .style('pointer-events', 'none')
        .text(d => d.data.label)
        .style('opacity', animated ? 0 : 1);

      if (animated) {
        segments.selectAll('text')
          .transition()
          .delay(750)
          .duration(300)
          .style('opacity', 1);
      }
    }

    // Add value labels if enabled
    if (showValues) {
      segments.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .attr('font-family', 'system-ui, sans-serif')
        .attr('fill', '#ffffff')
        .style('pointer-events', 'none')
        .text(d => d.data.value)
        .style('opacity', animated ? 0 : 1);

      if (animated) {
        segments.selectAll('text:last-child')
          .transition()
          .delay(750)
          .duration(300)
          .style('opacity', 1);
      }
    }

  }, [currentData, width, height, innerRadius, outerRadius, showLabels, showValues, animated]);

  const handleSegmentClick = (segment: DonutSegment) => {
    setSelectedSegment(segment);
    onSegmentClick?.(segment, breadcrumb.length);

    if (segment.children && segment.children.length > 0) {
      setBreadcrumb(prev => [...prev, ...currentData.filter(d => d.id === segment.id)]);
      setCurrentData(segment.children);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Go back to root
      setCurrentData(data);
      setBreadcrumb([]);
    } else {
      // Go back to specific level
      const newBreadcrumb = breadcrumb.slice(0, index + 1);
      setBreadcrumb(newBreadcrumb);
      
      if (newBreadcrumb.length === 0) {
        setCurrentData(data);
      } else {
        const targetSegment = newBreadcrumb[newBreadcrumb.length - 1];
        setCurrentData(targetSegment.children || []);
      }
    }
  };

  const getTotalValue = () => {
    return currentData.reduce((sum, segment) => sum + segment.value, 0);
  };

  const getPercentage = (value: number) => {
    const total = getTotalValue();
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <motion.div
      className={`bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 transition-all duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <PieChart size={20} className="text-brand-primary" />
          <h3 className="text-lg font-semibold text-white">Distribution Analysis</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-gray-800 transition-colors">
            <Download size={16} className="text-gray-400" />
          </button>
          <button className="p-2 rounded hover:bg-gray-800 transition-colors">
            <Maximize2 size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="flex items-center gap-1 text-brand-primary hover:text-brand-secondary transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Root</span>
          </button>
          {breadcrumb.map((segment, index) => (
            <React.Fragment key={segment.id}>
              <span className="text-gray-500">/</span>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="text-brand-primary hover:text-brand-secondary transition-colors"
              >
                {segment.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg
              ref={svgRef}
              width={width}
              height={height}
              className="overflow-visible"
            />
            
            {/* Center Info */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{getTotalValue()}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend and Details */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Segments</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentData.map((segment, index) => (
              <motion.div
                key={segment.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSegment?.id === segment.id
                    ? 'border-brand-primary bg-brand-primary/10'
                    : hoveredSegment?.id === segment.id
                    ? 'border-gray-600 bg-gray-800/50'
                    : 'border-gray-700 bg-gray-800/30'
                }`}
                onClick={() => handleSegmentClick(segment)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color || defaultColors[index % defaultColors.length] }}
                    />
                    <span className="text-sm font-medium text-white">{segment.label}</span>
                    {segment.children && segment.children.length > 0 && (
                      <span className="text-xs text-gray-400">({segment.children.length})</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{segment.value}</div>
                    <div className="text-xs text-gray-400">{getPercentage(segment.value)}%</div>
                  </div>
                </div>
                
                {segment.metadata?.description && (
                  <p className="text-xs text-gray-400 mt-1">{segment.metadata.description}</p>
                )}
                
                {segment.metadata?.trend && (
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <TrendingUp 
                      size={12} 
                      className={
                        segment.metadata.trend === 'up' ? 'text-green-400' :
                        segment.metadata.trend === 'down' ? 'text-red-400 rotate-180' :
                        'text-gray-400'
                      }
                    />
                    <span className={
                      segment.metadata.trend === 'up' ? 'text-green-400' :
                      segment.metadata.trend === 'down' ? 'text-red-400' :
                      'text-gray-400'
                    }>
                      {segment.metadata.trendValue}%
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Info */}
      <AnimatePresence>
        {hoveredSegment && (
          <motion.div
            className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-center gap-2">
              <Info size={16} className="text-brand-primary" />
              <span className="font-medium text-white">{hoveredSegment.label}</span>
            </div>
            <div className="mt-1 text-sm text-gray-300">
              Value: {hoveredSegment.value} ({getPercentage(hoveredSegment.value)}%)
            </div>
            {hoveredSegment.metadata?.description && (
              <div className="mt-1 text-sm text-gray-400">
                {hoveredSegment.metadata.description}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DrillDownDonutChart;
