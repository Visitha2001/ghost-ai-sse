import type { canvasNode, canvasEdge } from '@/types/canvas'

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: canvasNode[]
  edges: canvasEdge[]
}

/* ── helpers ─────────────────────────────────────────────────────── */

let _counter = 0

function node(
  id: string,
  label: string,
  shape: string,
  color: string,
  x: number,
  y: number,
  w = 160,
  h = 80
): canvasNode {
  return {
    id,
    type: 'custom',
    position: { x, y },
    data: { label, shape, color },
    style: { width: w, height: h },
  }
}

function edge(
  source: string,
  target: string,
  arrow: 'forward' | 'backward' | 'both' | 'none' = 'forward'
): canvasEdge {
  _counter++
  return {
    id: `e-${source}-${target}-${_counter}`,
    source,
    target,
    type: 'custom',
    data: { arrow },
  }
}

/* ── templates ───────────────────────────────────────────────────── */

const microservices: CanvasTemplate = {
  id: 'microservices',
  name: 'Microservices Architecture',
  description:
    'API Gateway routing traffic to independent services, each backed by its own data store.',
  nodes: [
    node('ms-client',   'Client',         'process',     'neutral', 340, 0),
    node('ms-gateway',  'API Gateway',    'process',     'blue',    340, 140),
    node('ms-auth',     'Auth Service',   'process',     'purple',  0,   300),
    node('ms-user',     'User Service',   'process',     'blue',    230, 300),
    node('ms-order',    'Order Service',  'process',     'blue',    460, 300),
    node('ms-notify',   'Notification',   'process',     'orange',  690, 300),
    node('ms-db-auth',  'Auth DB',        'database',    'purple',  0,   460, 140, 90),
    node('ms-db-user',  'User DB',        'database',    'teal',    230, 460, 140, 90),
    node('ms-db-order', 'Order DB',       'database',    'teal',    460, 460, 140, 90),
    node('ms-queue',    'Message Queue',  'preparation', 'green',   690, 460, 160, 80),
  ],
  edges: [
    edge('ms-client',  'ms-gateway'),
    edge('ms-gateway', 'ms-auth'),
    edge('ms-gateway', 'ms-user'),
    edge('ms-gateway', 'ms-order'),
    edge('ms-gateway', 'ms-notify'),
    edge('ms-auth',    'ms-db-auth'),
    edge('ms-user',    'ms-db-user'),
    edge('ms-order',   'ms-db-order'),
    edge('ms-notify',  'ms-queue'),
  ],
}

const cicd: CanvasTemplate = {
  id: 'cicd-pipeline',
  name: 'CI / CD Pipeline',
  description:
    'Automated pipeline from source control through build, test, deploy, and monitoring stages.',
  nodes: [
    node('ci-repo',     'Git Repository', 'database',    'neutral', 0,   160, 160, 90),
    node('ci-build',    'Build',          'process',     'orange',  240, 160),
    node('ci-test',     'Test Suite',     'decision',    'purple',  480, 140, 120, 120),
    node('ci-artifact', 'Artifact Store', 'database',    'blue',    680, 160, 160, 90),
    node('ci-staging',  'Staging',        'process',     'green',   400, 340),
    node('ci-prod',     'Production',     'process',     'teal',    640, 340),
    node('ci-monitor',  'Monitoring',     'terminator',  'orange',  640, 480, 160, 80),
    node('ci-alert',    'Alerts',         'connector',   'red',     400, 480, 120, 80),
  ],
  edges: [
    edge('ci-repo',     'ci-build'),
    edge('ci-build',    'ci-test'),
    edge('ci-test',     'ci-artifact'),
    edge('ci-test',     'ci-staging'),
    edge('ci-staging',  'ci-prod'),
    edge('ci-artifact', 'ci-prod'),
    edge('ci-prod',     'ci-monitor'),
    edge('ci-monitor',  'ci-alert'),
  ],
}

const eventDriven: CanvasTemplate = {
  id: 'event-driven',
  name: 'Event-Driven System',
  description:
    'Producers emit events to a central bus; consumers process them independently with dedicated storage.',
  nodes: [
    node('ev-web',       'Web App',       'process',     'blue',    0,   0),
    node('ev-mobile',    'Mobile App',    'process',     'blue',    0,   140),
    node('ev-iot',       'IoT Devices',   'process',     'orange',  0,   280),
    node('ev-bus',       'Event Bus',     'preparation', 'purple',  260, 120, 180, 100),
    node('ev-processor', 'Event Processor', 'process',   'pink',    540, 0),
    node('ev-analytics', 'Analytics',     'process',     'pink',    540, 140),
    node('ev-notifier',  'Notifier',      'process',     'pink',    540, 280),
    node('ev-db',        'Event Store',   'database',    'teal',    800, 0,   160, 90),
    node('ev-warehouse', 'Data Warehouse','database',    'teal',    800, 140, 160, 90),
    node('ev-cache',     'Cache Layer',   'connector',   'green',   800, 280, 140, 80),
  ],
  edges: [
    edge('ev-web',       'ev-bus'),
    edge('ev-mobile',    'ev-bus'),
    edge('ev-iot',       'ev-bus'),
    edge('ev-bus',       'ev-processor'),
    edge('ev-bus',       'ev-analytics'),
    edge('ev-bus',       'ev-notifier'),
    edge('ev-processor', 'ev-db'),
    edge('ev-analytics', 'ev-warehouse'),
    edge('ev-notifier',  'ev-cache'),
  ],
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  microservices,
  cicd,
  eventDriven,
]
