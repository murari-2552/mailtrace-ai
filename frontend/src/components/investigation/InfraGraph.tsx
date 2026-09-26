import React, { useState } from 'react';
import { Share2, Info, Maximize2, ShieldAlert } from 'lucide-react';
import { InfrastructureGraph, GraphNode } from '../../types';

interface InfraGraphProps {
  graph: InfrastructureGraph;
}

export const InfraGraph: React.FC<InfraGraphProps> = ({ graph }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Position nodes in a radial forensic layout
  const width = 800;
  const height = 440;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodePositions: Record<string, { x: number; y: number }> = {};

  // Center node: email
  const emailNode = graph.nodes.find(n => n.type === 'email');
  if (emailNode) {
    nodePositions[emailNode.id] = { x: centerX, y: centerY };
  }

  // Other nodes arranged radially by category
  const outerNodes = graph.nodes.filter(n => n.type !== 'email');
  const count = outerNodes.length;
  const radius = 175;

  outerNodes.forEach((node, idx) => {
    const angle = (idx / (count || 1)) * 2 * Math.PI - Math.PI / 2;
    nodePositions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });

  const getNodeColor = (type: string, risk: string) => {
    if (type === 'email') return '#06B6D4'; // cyan
    if (type === 'campaign') return '#8B5CF6'; // purple
    if (risk === 'critical') return '#EF4444'; // red
    if (risk === 'high') return '#F97316'; // orange
    if (risk === 'safe') return '#10B981'; // green
    if (type === 'ip') return '#EAB308'; // yellow
    if (type === 'url') return '#3B82F6'; // blue
    return '#64748B'; // slate
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            INFRASTRUCTURE CORRELATION GRAPH ({graph.nodes.length} NODES • {graph.edges.length} EDGES)
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">Interactive Node-Link Map</span>
      </div>

      <div className="relative border border-slate-800 rounded-xl bg-slate-950 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-[400px] select-none"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
            </marker>
          </defs>

          {/* Edges */}
          {graph.edges.map((edge) => {
            const src = nodePositions[edge.source];
            const tgt = nodePositions[edge.target];
            if (!src || !tgt) return null;

            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;

            return (
              <g key={edge.id}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  markerEnd="url(#arrow)"
                />
                <text
                  x={midX}
                  y={midY - 4}
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {graph.nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const color = getNodeColor(node.type, node.risk);
            const isSelected = selectedNode?.id === node.id;
            const isCenter = node.type === 'email';

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
                transform={`translate(${pos.x}, ${pos.y})`}
              >
                {/* Outer Glow Circle */}
                <circle
                  r={isCenter ? 26 : 18}
                  fill={color}
                  fillOpacity={isSelected ? 0.4 : 0.15}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="transition-all duration-300 group-hover:scale-125"
                />

                {/* Inner Core */}
                <circle
                  r={isCenter ? 12 : 8}
                  fill={color}
                  stroke="#0F172A"
                  strokeWidth="2"
                />

                {/* Node Label */}
                <text
                  y={isCenter ? 36 : 28}
                  fill="#E2E8F0"
                  fontSize={isCenter ? "11" : "9"}
                  fontWeight={isCenter ? "bold" : "normal"}
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-md"
                >
                  {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Inspector Drawer */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-cyan-500/50 rounded-lg p-3 text-xs font-mono shadow-2xl max-w-xs space-y-1 z-10">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-cyan-400 uppercase">{selectedNode.type} Node</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="text-slate-200 font-semibold truncate">{selectedNode.label}</div>
            <div className="text-slate-400 text-[11px]">
              Assigned Risk Level: <span className="uppercase text-cyan-300 font-bold">{selectedNode.risk}</span>
            </div>
            {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
              <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-800 space-y-0.5">
                {Object.entries(selectedNode.metadata).map(([k, v]) => (
                  <div key={k} className="truncate">
                    {k}: <span className="text-slate-300">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Graph Legend */}
        <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 rounded p-2 text-[10px] font-mono space-y-1 text-slate-400">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Email Artifact</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"></span> Critical Malicious</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> IP Address</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> URL / Link</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400"></span> Threat Campaign</div>
        </div>
      </div>
    </div>
  );
};
