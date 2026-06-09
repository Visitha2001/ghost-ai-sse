import { BaseEdge, EdgeProps, getBezierPath, getStraightPath, getSmoothStepPath, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import { canvasEdge } from '@/types/canvas';
import { Spline, Minus, CornerDownRight } from 'lucide-react';

const COLORS = [
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
  markerStart,
  data,
  selected,
}: EdgeProps<canvasEdge>) {
  const pathType = data?.path || 'bezier';
  const pathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (pathType === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath(pathParams);
  } else if (pathType === 'step') {
    [edgePath, labelX, labelY] = getSmoothStepPath(pathParams);
  } else {
    [edgePath, labelX, labelY] = getBezierPath(pathParams);
  }

  const { updateEdgeData } = useReactFlow();

  const activeColorValue = COLORS.find(c => c.name === data?.color)?.value || COLORS[0].value;
  const thickness = data?.thickness || 2;
  const edgeStyle = data?.style || 'solid';
  const arrowConfig = data?.arrow || 'none';

  let strokeDasharray = 'none';
  if (edgeStyle === 'dashed') strokeDasharray = '10 10';
  if (edgeStyle === 'dotted') strokeDasharray = '2 6';

  const showStart = arrowConfig === 'backward' || arrowConfig === 'both';
  const showEnd = arrowConfig === 'forward' || arrowConfig === 'both';

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
        markerEnd={showEnd ? `url(#arrow-${id})` : markerEnd} 
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
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan flex items-center gap-1 px-1.5 py-1 bg-background/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-50 text-foreground"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); updateEdgeData(id, { path: 'straight' }) }} 
              className={`p-1 rounded-full hover:bg-muted transition-colors ${pathType === 'straight' ? 'bg-muted' : ''}`} 
              title="Straight"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); updateEdgeData(id, { path: 'bezier' }) }} 
              className={`p-1 rounded-full hover:bg-muted transition-colors ${pathType === 'bezier' ? 'bg-muted' : ''}`} 
              title="Flex"
            >
              <Spline className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); updateEdgeData(id, { path: 'step' }) }} 
              className={`p-1 rounded-full hover:bg-muted transition-colors ${pathType === 'step' ? 'bg-muted' : ''}`} 
              title="Bend"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
