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
    data: { arrow, path: 'step' as const },
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
    node('ms-user',     'User Service',   'process',     'blue',    230, 330),
    node('ms-order',    'Order Service',  'process',     'blue',    460, 360),
    node('ms-notify',   'Notification',   'process',     'orange',  690, 390),
    node('ms-db-auth',  'Auth DB',        'database',    'purple',  0,   460, 140, 90),
    node('ms-db-user',  'User DB',        'database',    'teal',    230, 490, 140, 90),
    node('ms-db-order', 'Order DB',       'database',    'teal',    460, 520, 140, 90),
    node('ms-queue',    'Message Queue',  'preparation', 'green',   690, 550, 160, 80),
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
    node('ci-artifact', 'Artifact Store', 'database',    'blue',    680, 120, 160, 90),
    node('ci-staging',  'Staging',        'process',     'green',   400, 340),
    node('ci-prod',     'Production',     'process',     'teal',    660, 370),
    node('ci-monitor',  'Monitoring',     'terminator',  'orange',  660, 520, 160, 80),
    node('ci-alert',    'Alerts',         'connector',   'red',     400, 520, 120, 80),
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
    node('ev-mobile',    'Mobile App',    'process',     'blue',    30,  140),
    node('ev-iot',       'IoT Devices',   'process',     'orange',  60,  280),
    node('ev-bus',       'Event Bus',     'preparation', 'purple',  280, 120, 180, 100),
    node('ev-processor', 'Event Processor', 'process',   'pink',    540, 0),
    node('ev-analytics', 'Analytics',     'process',     'pink',    570, 140),
    node('ev-notifier',  'Notifier',      'process',     'pink',    600, 280),
    node('ev-db',        'Event Store',   'database',    'teal',    800, 0,   160, 90),
    node('ev-warehouse', 'Data Warehouse','database',    'teal',    830, 140, 160, 90),
    node('ev-cache',     'Cache Layer',   'connector',   'green',   860, 280, 140, 80),
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

const serverless: CanvasTemplate = {
  id: 'serverless',
  name: 'Serverless Web App',
  description:
    'Fully managed serverless architecture using API Gateway, compute functions, and NoSQL storage.',
  nodes: [
    node('sls-client',    'Web Client',      'process',     'neutral', 0,   140),
    node('sls-cdn',       'CDN / Edge',      'preparation', 'purple',  200, 120, 160, 100),
    node('sls-gateway',   'API Gateway',     'process',     'blue',    440, 140),
    node('sls-auth',      'Auth Function',   'process',     'orange',  680, 0),
    node('sls-api',       'API Function',    'process',     'orange',  710, 140),
    node('sls-worker',    'Worker Function', 'process',     'orange',  740, 280),
    node('sls-db',        'NoSQL DB',        'database',    'teal',    920, 140, 140, 90),
    node('sls-storage',   'Object Storage',  'database',    'blue',    480, 300, 140, 90),
  ],
  edges: [
    edge('sls-client',  'sls-cdn'),
    edge('sls-cdn',     'sls-gateway'),
    edge('sls-cdn',     'sls-storage'),
    edge('sls-gateway', 'sls-auth'),
    edge('sls-gateway', 'sls-api'),
    edge('sls-api',     'sls-db'),
    edge('sls-api',     'sls-worker'),
    edge('sls-worker',  'sls-db'),
  ],
}

const threeTier: CanvasTemplate = {
  id: 'three-tier',
  name: '3-Tier Web Application',
  description:
    'Classic layered architecture separating presentation, application logic, and data storage.',
  nodes: [
    node('tier-lb',       'Load Balancer',   'preparation', 'blue',    0,   140, 160, 80),
    node('tier-web1',     'Web Server 1',    'process',     'neutral', 240, 60),
    node('tier-web2',     'Web Server 2',    'process',     'neutral', 260, 220),
    node('tier-app1',     'App Server 1',    'process',     'purple',  500, 60),
    node('tier-app2',     'App Server 2',    'process',     'purple',  540, 220),
    node('tier-cache',    'Redis Cache',     'connector',   'red',     760, -20, 140, 80),
    node('tier-db-main',  'Primary DB',      'database',    'teal',    790, 140, 160, 90),
    node('tier-db-repl',  'Read Replica',    'database',    'teal',    820, 320, 160, 90),
  ],
  edges: [
    edge('tier-lb',       'tier-web1'),
    edge('tier-lb',       'tier-web2'),
    edge('tier-web1',     'tier-app1'),
    edge('tier-web1',     'tier-app2'),
    edge('tier-web2',     'tier-app1'),
    edge('tier-web2',     'tier-app2'),
    edge('tier-app1',     'tier-cache'),
    edge('tier-app2',     'tier-cache'),
    edge('tier-app1',     'tier-db-main'),
    edge('tier-app2',     'tier-db-main'),
    edge('tier-db-main',  'tier-db-repl'),
  ],
}

const mobileApp: CanvasTemplate = {
  id: 'mobile-app',
  name: 'Mobile App Backend',
  description:
    'Backend architecture optimized for mobile clients with push notifications and a BFF layer.',
  nodes: [
    node('mob-client',    'Mobile Client',   'process',     'blue',    0,   140),
    node('mob-auth',      'Auth Provider',   'connector',   'purple',  240, 0, 140, 80),
    node('mob-bff',       'API Gateway / BFF','process',    'neutral', 260, 140),
    node('mob-push',      'Push Service',    'process',     'orange',  280, 280),
    node('mob-api',       'Core API',        'process',     'blue',    540, 140),
    node('mob-media',     'Media Service',   'process',     'pink',    570, 280),
    node('mob-db',        'Main Database',   'database',    'teal',    820, 140, 160, 90),
    node('mob-storage',   'Cloud Storage',   'database',    'blue',    850, 280, 160, 90),
  ],
  edges: [
    edge('mob-client',  'mob-auth'),
    edge('mob-client',  'mob-bff'),
    edge('mob-push',    'mob-client'),
    edge('mob-bff',     'mob-api'),
    edge('mob-bff',     'mob-media'),
    edge('mob-api',     'mob-db'),
    edge('mob-media',   'mob-storage'),
    edge('mob-api',     'mob-push'),
  ],
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  microservices,
  cicd,
  eventDriven,
  serverless,
  threeTier,
  mobileApp,
]
