# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Collaboration and Access Control

## Current Goal

- Implement `26-design-agent-frontend.md` (Design Agent - Frontend Integration).

## Completed

- `01-design-system.md`: Installed and configured `shadcn/ui`, added base components, set up `lib/utils.ts`, and configured `globals.css` dark theme matching `ui-context.md`.
- `02-editor-navbar.md`: Created Editor Navbar and Project Sidebar, verified Dialog pattern readiness.
- `03-auth.md`: Wiring up Clerk provider, auth pages, redirects, route protection, and user menu.
- `04-project-dialogs.md`: Building the editor home screen and project dialogs/sidebar actions.
- `05-prisma.md`: Adding data models, Prisma client singleton, and first migration.
- `06-project-apis.md`: Setting up internal API endpoints for projects.
- `07-wire-editor-home.md`: Wire the editor home sidebar and dialogs to the real project API.
- `08-editor-worspace-shell.md`: Built the `/editor/[roomId]` workspace shell, server-side project access/auth validation, active project highlighting, and collapsible right-side AI panel. Supported instantaneous local optimistic updates to synchronize the project list immediately in the sidebar and navbar when projects are created, renamed, or deleted. Eradicated raw color hexes from layout components and aligned AI Architect activation button to be outline when inactive and brand-primary when active. Added an elegant animated pulsing brand-colored dot to the active project tab in the sidebar. Refactored project name rendering to Title-Case display names without hyphens (e.g. "My Project Name"). redlined and designed all layout sidebars to float elegantly off viewport edges with a frosted-glass blur (`bg-card/85 backdrop-blur-md`), subtle borders, shadow-2xl, and premium `rounded-2xl` corners. Integrated an intuitive, quick-access "Home" action button in the top navbar to return to the primary `/editor` workspace dashboard at any time.
- `10-liveblocks-setup.md`: Configured Liveblocks node client, cached it in lib, set up `liveblocks.config.ts` for Presence/UserMeta, and created `/api/liveblocks-auth` route handling Clerk ID, verifying project access, and returning session token with user info and avatar/color.
- `11-base-canvas.md`: Implemented the collaborative base canvas using Liveblocks and React Flow, including `types/canvas.ts`, `CanvasWrapper`, and `CanvasFlow`.
- `12-shape-panel.md`: Added bottom shape panel toolbar with draggable shape icons (process, decision, terminator, connector, database, preparation) and implemented a custom CanvasNode to render them upon drop using `screenToFlowPosition`. Renamed shapes from geometric terms (rectangle, diamond, circle, pill, cylinder, hexagon) to standard IT/flowchart diagram terminology.
- **Debug Feedback (1)**: Updated Canvas Node renderer to display actual SVG shapes (`decision`, `terminator`, `connector`, `database`, `preparation`, `process`) rather than basic div rectangles. Added `@xyflow/react` `<NodeResizer>` for shape resizing and `<NodeToolbar>` featuring actions to rotate shapes (90 degrees), change shape colors (from a predefined palette), and delete shapes from the canvas.
- **Debug Feedback (3)**: Refactored the UI to use a unified `PropertiesPanel` adjacent to the `ShapePanel` at the bottom of the screen instead of floating toolbars above elements. Changed default shape color to `slate` (gray). Expanded edge arrow functionality to support bidirectional arrows (`-->`, `<--`, `<-->`, `---`). Fixed panel reactivity by using `useNodes`/`useEdges`. Made connector handles conditionally visible only when the node is selected. Fixed element deletion logic by passing full objects to `deleteElements`, and eliminated the visual gap between edges and nodes by configuring the SVG marker `refX` parameter. Implemented global keyboard shortcuts (Undo `⌘Z`, Redo `⌘⇧Z`) and added a hoverable Keyboard Shortcuts pane to the editor navbar.
- `15-nodes-color-toolbar.md`: Added floating color toolbar above selected nodes using React Flow `NodeToolbar`. Implemented 8 predefined node color pairs (dark fill + vivid text) from `ui-context.md` as `NODE_COLORS` in `types/canvas.ts`. Nodes now visually reflect their active color pair with the fill as the shape background and the paired text color for labels and strokes. Created `NodeColorToolbar` component with swatch hover glow effects and active selection indicators. Updated `PropertiesPanel` and default drop color to use the new palette. Build passes with zero type errors.
- `17-canvas-ergonomics.md`: Added a pill-shaped `CanvasControls` bar at the bottom-left of the canvas featuring Zoom controls (zoom out, fit view, zoom in) using the React Flow instance and history controls (undo, redo) hooked into Liveblocks. Created `useKeyboardShortcuts` hook mapping keyboard inputs (+/= for zoom in, - for zoom out, Cmd/Ctrl+Z for undo, Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y for redo) bypassing editable fields. Removed the minimap.
- `18-starter-template.md`: Added a starter template library with three curated system design templates (Microservices Architecture, CI/CD Pipeline, Event-Driven System). Created `starter-templates.ts` with `CanvasTemplate` type and `CANVAS_TEMPLATES` array, and `starter-templates-modal.tsx` with SVG diagram previews rendered from node/edge data without a React Flow instance. Added a "Templates" button to the editor navbar. Template import clears the existing canvas and loads template nodes/edges through Liveblocks, then fits the view. Used a Zustand store (`useTemplateImport`) to bridge the navbar-to-canvas signal without prop-drilling.
- `19-presense-avatar-cursor.md`: Added presence avatars and live cursors to the editor canvas view. Created `PresenceAvatars` component (top-right overlay with collaborator avatar stack, +N overflow chip, divider, and Clerk UserButton), `LiveCursors` component (colored pointer arrows with name badges rendered via `flowToScreenPosition`). Updated `CanvasFlow` to broadcast cursor position via `useUpdateMyPresence` on pointer move/leave events. Collaborators are excluded from the current user's avatar; the current user is represented by the Clerk `UserButton`. Editor home navbar remains unchanged.
- `20-ai-sidebar-shell.md`: Separated the AI sidebar into its own component (`AiSidebar`). Implemented the AI Architect tab with an empty state and input UI, and the Specs tab with a demo spec card. Maintained existing layout floating behavior.
- **Edge Label Pills**: Added inline text labels to canvas edges. Double-clicking any edge path opens a pill-shaped inline input. Labels can be dragged to reposition them anywhere along the edge path.
- **Canvas Copy-Paste**: Added support for multi-select area rubber-banding and Ctrl/⌘+C / Ctrl/⌘+V to copy and paste nodes/edges. Pasted items get fresh IDs and a 24px position offset.
- `24-ai-presence-state.md`: Added shared AI thinking state. Created `ai-status-feed` schema in `types/tasks.ts`. Sidebar now shows global AI activity status based on `thinking: true` presence from any user, dims input/button, and displays feed messages. LiveCursors also displays a spinner in the cursor name badge when a collaborator is generating.
- `25-sidebar-chat-feed.md`: Added real-time room chat to the AI sidebar using a separate Liveblocks `ai-chat` feed.

## In Progress

- `22-design-agent-api.md`: Setting up the backend flow for design generation using Trigger.dev to handle background jobs, track runs, and issue real-time tokens.
- `23-design-agent-logic.md`: Implementing the full AI design agent using Gemini to parse user prompts into Liveblocks storage patches.
- `21-canvas-autosave.md`: Adding canvas autosave and loading using Vercel Blob and Prisma. Added manual Save button to editor navbar with spinning Loader2 icon during save, wired through `useCanvasAutosaveStore.triggerSave`. Integrated Sonner toast notifications (success/error) on manual saves. Installed `sonner` via shadcn CLI, added `<Toaster position="bottom-right" richColors />` to root layout.
- `09-share-dialog.md`: Setting up Share dialog access control, inviting/removing collaborators by email, loading collaborator names/avatars via Clerk Backend API.
- **Theme Color Polish**: Transitioning background base variables from near-pitch-black variables to a premium slate-charcoal gray palette.

## Next Up

- `27-spec-generation-flow.md`: Setting up backend flow for AI-powered spec generation.

## Open Questions

- None at present.

## Architecture Decisions

- Collaborators are verified and registered in the database by email address.
- Collaborator detail enrichment is queried dynamically from the Clerk Backend API to ensure up-to-date name and avatar resources without local redundancy.

## Session Notes

- Theme alignment completed: successfully replaced all hardcoded hex codes (#6457f9 and #00c8d4) in component layers with global CSS custom property utility tokens (`text-ai-text`, `bg-ai/10`, `border-ai/20`, `bg-brand/5`, `bg-brand/10`, `text-brand`).
- Aligned active states: the AI button now utilizes the theme's brand primary style identical to other primary buttons when active.
- Animated active indicator: added an elegant brand-colored pulsing dot next to the active project row in the sidebar for clean workspace visual status.
- Project display names: implemented the `formatProjectName` helper inside `lib/utils.ts` to convert project names to a clean, Title-Case hyphen-free format (e.g., "My Project Name" instead of "my-project-name") and bound it across all nav, sidebar, layout dialogs, and main room page views.
- Floating Rounded Panels: redesigned both the left Project Sidebar and right AI Architect Sidebar into modern, rounded floating overlays. They sit 16px (`4px` margin) from the edges, use transparent frosted backgrounds (`bg-card/85 backdrop-blur-md`), feature premium `rounded-2xl` corners, and incorporate double-blur shadows. Main content container left padding was increased to `md:pl-[18rem]` to keep symmetrical gutter lines when the sidebar is visible.
- Navbar Navigation Option: added a premium, ghost-style quick-access "Home" icon button (using Lucide's `Home` symbol) on the left side of the navbar next to the project sidebar toggler, linking directly back to `/editor`.
- Floating Frosted Navbar: Transformed the navbar from a flat, full-width bar (`bg-background border-b`) into a floating frosted-glass panel matching the side panels (`bg-card/85 backdrop-blur-md`, `rounded-2xl`, `shadow-2xl`, `border border-border/80`). Added a subtle cyan gradient accent line at the top, upgraded buttons with glass-style hover states (`bg-white/[0.06]`), gradient dividers, tighter letter-spacing, and a glowing brand shadow on the active AI Chat button.
