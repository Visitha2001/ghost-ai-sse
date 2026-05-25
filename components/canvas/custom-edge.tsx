import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { canvasEdge } from '@/types/canvas';

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
}: EdgeProps<canvasEdge>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

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
    </>
  );
}
