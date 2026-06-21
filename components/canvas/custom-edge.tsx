"use client";

import { useCallback, useRef, useState, useEffect } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  EdgeLabelRenderer,
  useReactFlow,
} from '@xyflow/react';
import { canvasEdge } from '@/types/canvas';
import { Spline, Minus, CornerDownRight } from 'lucide-react';
import { useEdgeLabelEdit } from '@/hooks/use-edge-label-edit';

const COLORS = [
  { name: 'slate',  value: '#64748b' },
  { name: 'red',    value: '#ef4444' },
  { name: 'orange', value: '#f97316' },
  { name: 'amber',  value: '#f59e0b' },
  { name: 'green',  value: '#22c55e' },
  { name: 'blue',   value: '#3b82f6' },
  { name: 'purple', value: '#a855f7' },
  { name: 'pink',   value: '#ec4899' },
];

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  data,
  selected,
}: EdgeProps<canvasEdge>) {
  const pathType   = data?.path || 'bezier';
  const pathParams = { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition };

  let edgePath = '';
  let labelX   = 0;
  let labelY   = 0;

  if (pathType === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath(pathParams);
  } else if (pathType === 'step') {
    [edgePath, labelX, labelY] = getSmoothStepPath(pathParams);
  } else {
    [edgePath, labelX, labelY] = getBezierPath(pathParams);
  }

  const { updateEdgeData } = useReactFlow();

  const activeColorValue = COLORS.find(c => c.name === data?.color)?.value || COLORS[0].value;
  const thickness        = data?.thickness || 2;
  const edgeStyle        = data?.style     || 'solid';
  const arrowConfig      = data?.arrow     || 'none';
  const currentLabel     = data?.label     || '';

  let strokeDasharray = 'none';
  if (edgeStyle === 'dashed') strokeDasharray = '10 10';
  if (edgeStyle === 'dotted') strokeDasharray = '2 6';

  const showStart = arrowConfig === 'backward' || arrowConfig === 'both';
  const showEnd   = arrowConfig === 'forward'  || arrowConfig === 'both';

  /* ── Label editing — driven by global Zustand store ────────────── */
  const editingEdgeId   = useEdgeLabelEdit((s) => s.editingEdgeId);
  const setEditingEdgeId = useEdgeLabelEdit((s) => s.setEditingEdgeId);
  const editing = editingEdgeId === id;

  const [draft, setDraft] = useState(currentLabel);
  const inputRef          = useRef<HTMLInputElement>(null);

  // Sync draft when edit mode opens for this edge
  useEffect(() => {
    if (editing) {
      setDraft(data?.label || '');
    }
  }, [editing, data?.label]);

  // Auto-focus the input when edit mode opens
  useEffect(() => {
    if (editing && inputRef.current) {
      // Small timeout so React has painted the input
      const t = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 30);
      return () => clearTimeout(t);
    }
  }, [editing]);

  const commitLabel = useCallback(() => {
    updateEdgeData(id, { label: draft.trim() });
    setEditingEdgeId(null);
  }, [draft, id, updateEdgeData, setEditingEdgeId]);

  const cancelEdit = useCallback(() => {
    setEditingEdgeId(null);
  }, [setEditingEdgeId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitLabel();
    }
    if (e.key === 'Escape') {
      cancelEdit();
    }
    // Prevent delete key from removing the edge while typing
    e.stopPropagation();
  }, [commitLabel, cancelEdit]);

  return (
    <>
      <defs>
        <marker
          id={`arrow-${id}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={activeColorValue} />
        </marker>
      </defs>

      <BaseEdge
        path={edgePath}
        markerStart={showStart ? `url(#arrow-${id})` : markerStart}
        markerEnd={showEnd   ? `url(#arrow-${id})` : markerEnd}
        style={{
          ...style,
          stroke: activeColorValue,
          strokeWidth: thickness,
          strokeDasharray,
        }}
      />

      <EdgeLabelRenderer>
        {/* ── Path-style toolbar — floats ABOVE the line midpoint ── */}
        {selected && (
          <div
            style={{
              position: 'absolute',
              // Float 40px above the midpoint of the line
              transform: `translate(-50%, -100%) translate(${labelX}px, ${labelY - 18}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan flex items-center gap-1 px-1.5 py-1 bg-[#111114]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50 text-foreground"
          >
            <button
              onClick={e => { e.stopPropagation(); updateEdgeData(id, { path: 'straight' }); }}
              className={`p-1 rounded-full hover:bg-white/10 transition-colors ${pathType === 'straight' ? 'bg-white/15' : ''}`}
              title="Straight"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); updateEdgeData(id, { path: 'bezier' }); }}
              className={`p-1 rounded-full hover:bg-white/10 transition-colors ${pathType === 'bezier' ? 'bg-white/15' : ''}`}
              title="Flex"
            >
              <Spline className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); updateEdgeData(id, { path: 'step' }); }}
              className={`p-1 rounded-full hover:bg-white/10 transition-colors ${pathType === 'step' ? 'bg-white/15' : ''}`}
              title="Bend"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Label pill / inline editor — sits ON the midpoint ── */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitLabel}
              onClick={e => e.stopPropagation()}
              onDoubleClick={e => e.stopPropagation()}
              placeholder="Add label…"
              style={{
                minWidth: 80,
                maxWidth: 220,
                width: `${Math.max((draft.length || 8) * 8 + 32, 100)}px`,
              }}
              className={[
                'block px-3 py-1 text-xs font-medium rounded-full outline-none',
                'bg-[#111114] border border-[#00c8d4]/70 text-[#f0f0f4]',
                'shadow-[0_0_0_3px_rgba(0,200,212,0.18)]',
                'placeholder:text-[#505060]',
                'transition-all duration-150',
              ].join(' ')}
            />
          ) : currentLabel ? (
            /* Static label pill — double-click to edit */
            <span
              className={[
                'inline-block px-3 py-0.5 text-xs font-medium rounded-full select-none',
                'bg-[#111114] border border-[#2a2a30] text-[#c0c0cc]',
                'shadow-md cursor-text',
                'hover:border-[#00c8d4]/50 hover:text-[#f0f0f4]',
                'transition-colors duration-150',
              ].join(' ')}
            >
              {currentLabel}
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
