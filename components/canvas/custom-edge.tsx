import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { canvasEdge } from '@/types/canvas';
import { Trash2, ArrowRight, Minus, MoreHorizontal } from 'lucide-react';
import { useCallback } from 'react';

const COLORS = [
  { name: 'default', value: 'hsl(var(--brand))' },
  { name: 'slate', value: '#64748b' },
  { name: 'red', value: '#ef4444' },
  { name: 'orange', value: '#f97316' },
  { name: 'amber', value: '#f59e0b' },
  { name: 'green', value: '#22c55e' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'purple', value: '#a855f7' },
  { name: 'pink', value: '#ec4899' },
]

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
  selected,
  data,
}: EdgeProps<canvasEdge>) {
  const { deleteElements, updateEdgeData } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onDelete = useCallback(() => {
    deleteElements({ edges: [{ id }] });
  }, [id, deleteElements]);

  const onColorChange = useCallback((colorName: string) => {
    updateEdgeData(id, { color: colorName });
  }, [id, updateEdgeData]);

  const onThicknessChange = useCallback((thickness: number) => {
    updateEdgeData(id, { thickness });
  }, [id, updateEdgeData]);

  const onStyleChange = useCallback((edgeStyle: 'solid' | 'dashed' | 'dotted') => {
    updateEdgeData(id, { style: edgeStyle });
  }, [id, updateEdgeData]);

  const onArrowToggle = useCallback(() => {
    updateEdgeData(id, { arrow: !(data?.arrow) });
  }, [id, data?.arrow, updateEdgeData]);

  const activeColorValue = COLORS.find(c => c.name === data?.color)?.value || COLORS[0].value;
  const thickness = data?.thickness || 2;
  const edgeStyle = data?.style || 'solid';
  const hasArrow = data?.arrow ?? false;

  let strokeDasharray = 'none';
  if (edgeStyle === 'dashed') strokeDasharray = '10 10';
  if (edgeStyle === 'dotted') strokeDasharray = '2 6';

  return (
    <>
      <defs>
        <marker
          id={`arrow-${id}`}
          viewBox="0 0 10 10"
          refX="6"
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
        markerEnd={hasArrow ? `url(#arrow-${id})` : markerEnd} 
        style={{
          ...style,
          stroke: activeColorValue,
          strokeWidth: thickness,
          strokeDasharray,
        }} 
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan bg-card/95 backdrop-blur-md p-1.5 rounded-lg border shadow-xl flex items-center gap-2"
          >
            {/* Color Palette */}
            <div className="flex items-center gap-1.5 pr-2 border-r mr-1">
              {COLORS.map(c => (
                <button
                  key={c.name}
                  className={`w-4 h-4 rounded-full border border-border flex-shrink-0 transition-transform hover:scale-110 ${data?.color === c.name || (!data?.color && c.name === 'default') ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => onColorChange(c.name)}
                  title={c.name}
                />
              ))}
            </div>

            {/* Thickness */}
            <div className="flex items-center gap-1 pr-2 border-r mr-1">
              <button onClick={() => onThicknessChange(2)} className={`p-1.5 rounded hover:bg-muted ${thickness === 2 ? 'bg-muted' : ''}`}><div className="w-3 h-0.5 bg-foreground" /></button>
              <button onClick={() => onThicknessChange(4)} className={`p-1.5 rounded hover:bg-muted ${thickness === 4 ? 'bg-muted' : ''}`}><div className="w-3 h-1 bg-foreground" /></button>
              <button onClick={() => onThicknessChange(6)} className={`p-1.5 rounded hover:bg-muted ${thickness === 6 ? 'bg-muted' : ''}`}><div className="w-3 h-1.5 bg-foreground" /></button>
            </div>

            {/* Line Style */}
            <div className="flex items-center gap-1 pr-2 border-r mr-1 text-foreground">
              <button onClick={() => onStyleChange('solid')} className={`p-1 rounded hover:bg-muted ${edgeStyle === 'solid' ? 'bg-muted' : ''}`} title="Solid"><Minus className="w-4 h-4" /></button>
              <button onClick={() => onStyleChange('dashed')} className={`p-1 rounded hover:bg-muted ${edgeStyle === 'dashed' ? 'bg-muted' : ''}`} title="Dashed"><div className="w-4 border-b-2 border-dashed border-current h-2 mb-2" /></button>
              <button onClick={() => onStyleChange('dotted')} className={`p-1 rounded hover:bg-muted ${edgeStyle === 'dotted' ? 'bg-muted' : ''}`} title="Dotted"><MoreHorizontal className="w-4 h-4" /></button>
            </div>

            {/* Arrow Toggle */}
            <button 
              onClick={onArrowToggle}
              className={`p-1.5 rounded-md transition-colors ${hasArrow ? 'bg-brand/20 text-brand' : 'hover:bg-muted text-muted-foreground'}`}
              title="Toggle Arrow"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button 
              onClick={onDelete} 
              className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors ml-1"
              title="Delete Edge"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
