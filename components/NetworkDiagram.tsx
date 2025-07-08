/**
 * Network Diagram Component - Advanced Data Visualization
 * 
 * Interactive network diagram for visualizing relationships between components,
 * requirements, and dependencies using D3.js and Framer Motion.
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { 
  Network, 
  Maximize2, 
  Download, 
  RefreshCw, 
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

export interface NetworkNode {
  id: string;
  label: string;
  type: 'requirement' | 'test' | 'ci' | 'risk' | 'document';
  value?: number;
  status?: 'active' | 'inactive' | 'warning' | 'error';
  metadata?: {
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
    description?: string;
  };
}

export interface NetworkLink {
  source: string;
  target: string;
  type: 'implements' | 'tests' | 'depends' | 'relates';
  strength?: number;
  metadata?: {
    description?: string;
    bidirectional?: boolean;
  };
}

interface NetworkDiagramProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  width?: number;
  height?: number;
  onNodeClick?: (node: NetworkNode) => void;
  onLinkClick?: (link: NetworkLink) => void;
  className?: string;
}

const NetworkDiagram: React.FC<NetworkDiagramProps> = ({
  nodes,
  links,
  width = 800,
  height = 600,
  onNodeClick,
  onLinkClick,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Color schemes for different node types
  const nodeColors = {
    requirement: '#f59e0b', // brand-primary
    test: '#10b981', // emerald-500
    ci: '#3b82f6', // blue-500
    risk: '#ef4444', // red-500
    document: '#8b5cf6' // violet-500
  };

  const linkColors = {
    implements: '#10b981',
    tests: '#f59e0b',
    depends: '#3b82f6',
    relates: '#6b7280'
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group for zoom/pan
    const g = svg.append('g');

    // Set up zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.1))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', (d: any) => linkColors[d.type] || '#6b7280')
      .attr('stroke-width', (d: any) => Math.sqrt(d.strength || 1) * 2)
      .attr('stroke-opacity', 0.6)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onLinkClick?.(d as NetworkLink);
      });

    // Create nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', (d: any) => Math.sqrt((d.value || 10)) + 8)
      .attr('fill', (d: any) => nodeColors[d.type] || '#6b7280')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }))
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d as NetworkNode);
        onNodeClick?.(d as NetworkNode);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d: any) => Math.sqrt((d.value || 10)) + 12)
          .attr('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d: any) => Math.sqrt((d.value || 10)) + 8)
          .attr('stroke-width', 2);
      });

    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text((d: any) => d.label)
      .attr('font-size', 12)
      .attr('font-family', 'system-ui, sans-serif')
      .attr('fill', '#ffffff')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height, onNodeClick, onLinkClick]);

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.5
    );
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1 / 1.5
    );
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
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
          <Network size={20} className="text-brand-primary" />
          <h3 className="text-lg font-semibold text-white">Network Diagram</h3>
          <span className="text-sm text-gray-400">
            ({nodes.length} nodes, {links.length} links)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={14} className="text-gray-400" />
            </button>
            <span className="text-xs text-gray-400 px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={14} className="text-gray-400" />
            </button>
          </div>
          
          <button
            onClick={handleReset}
            className="p-2 rounded hover:bg-gray-800 transition-colors"
            title="Reset View"
          >
            <RotateCcw size={16} className="text-gray-400" />
          </button>
          
          <button
            onClick={handleRefresh}
            className="p-2 rounded hover:bg-gray-800 transition-colors"
            disabled={isLoading}
          >
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw size={16} className="text-gray-400" />
            </motion.div>
          </button>
          
          <button className="p-2 rounded hover:bg-gray-800 transition-colors">
            <Download size={16} className="text-gray-400" />
          </button>
          
          <button className="p-2 rounded hover:bg-gray-800 transition-colors">
            <Maximize2 size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        {Object.entries(nodeColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-300 capitalize">{type}</span>
          </div>
        ))}
      </div>

      {/* Network Visualization */}
      <div className="relative bg-gray-950 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-full"
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw size={24} className="text-brand-primary" />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <motion.div
          className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">{selectedNode.label}</h4>
              <p className="text-sm text-gray-400 capitalize">{selectedNode.type}</p>
              {selectedNode.metadata?.description && (
                <p className="text-sm text-gray-300 mt-1">{selectedNode.metadata.description}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
            >
              <span className="text-gray-400">×</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NetworkDiagram;
