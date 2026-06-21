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
import { Spline, Minus, CornerDownRight, GripHorizontal } from 'lucide-react';
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
  let defaultLabelX = 0;
  let defaultLabelY = 0;

  if (pathType === 'straight') {
    [edgePath, defaultLabelX, defaultLabelY] = getStraightPath(pathParams);
  } else if (pathType === 'step') {
    [edgePath, defaultLabelX, defaultLabelY] = getSmoothStepPath(pathParams);
  } else {
    [edgePath, defaultLabelX, defaultLabelY] = getBezierPath(pathParams);
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

  useEffect(() => {
    if (editing) setDraft(data?.label || '');
  }, [editing, data?.label]);

  useEffect(() => {
    if (editing && inputRef.current) {
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
    if (e.key === 'Escape') cancelEdit();
    e.stopPropagation();
  }, [commitLabel, cancelEdit]);

  /* ── Draggable Label Logic ────────────── */
  const pathRef = useRef<SVGPathElement>(null);
  const savedOffset = data?.labelOffset ?? 0.5;
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  
  const currentOffset = dragOffset !== null ? dragOffset : savedOffset;
  
  // Compute true label position from offset along path
  let labelX = defaultLabelX;
  let labelY = defaultLabelY;
  
  // We need to use a layout effect or state to get the point, but we can do it during render if the ref exists.
  // Since ref won't trigger re-render on initial mount, we default to the React Flow center, 
  // but we force an update once on mount to get accurate position.
  const [, forceRender] = useState(0);
  useEffect(() => forceRender(1), []);

  if (pathRef.current) {
    try {
      const length = pathRef.current.getTotalLength();
      if (length > 0) {
        const point = pathRef.current.getPointAtLength(length * currentOffset);
        labelX = point.x;
        labelY = point.y;
      }
    } catch (e) {
      // SVG not ready
    }
  }

  const onLabelPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    if (!pathRef.current) return;
    
    const svgEl = pathRef.current.closest('svg');
    if (!svgEl) return;

    const pathEl = pathRef.current;
    const length = pathEl.getTotalLength();

    const onPointerMove = (moveEvent: PointerEvent) => {
      // Map mouse to SVG coords
      const pt = svgEl.createSVGPoint();
      pt.x = moveEvent.clientX;
      pt.y = moveEvent.clientY;
      const svgP = pt.matrixTransform(svgEl.getScreenCTM()?.inverse());
      if (!svgP) return;

      // Sample path to find closest fraction
      let closestOffset = 0.5;
      let minDistance = Infinity;
      const samples = 100;
      
      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const p = pathEl.getPointAtLength(t * length);
        const dist = Math.hypot(p.x - svgP.x, p.y - svgP.y);
        if (dist < minDistance) {
          minDistance = dist;
          closestOffset = t;
        }
      }
      setDragOffset(closestOffset);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      
      setDragOffset((finalOffset) => {
        if (finalOffset !== null) {
          updateEdgeData(id, { labelOffset: finalOffset });
        }
        return null;
      });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [id, updateEdgeData]);

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

      {/* Hidden path used for geometry calculations */}
      <path ref={pathRef} d={edgePath} fill="none" stroke="none" />

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
        {/* ── Path-style toolbar — floats ABOVE the midpoint ── */}
        {selected && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -100%) translate(${defaultLabelX}px, ${defaultLabelY - 18}px)`,
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

        {/* ── Label pill / inline editor — sits ON the interpolated point ── */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex items-center gap-1"
        >
          {selected && currentLabel && !editing && (
            <button
              onPointerDown={onLabelPointerDown}
              className="p-1 -ml-6 bg-[#111114] border border-[#2a2a30] rounded-full text-muted-foreground hover:text-foreground shadow cursor-grab active:cursor-grabbing transition-colors"
              title="Drag to reposition label"
            >
              <GripHorizontal className="w-3 h-3" />
            </button>
          )}

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
