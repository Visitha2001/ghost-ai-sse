# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Collaboration and Access Control

## Current Goal

- Implement `09-share-dialog.md` specifications and refine the background color system.

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
- `12-shape-panel.md`: Added bottom shape panel toolbar with draggable shape icons (rectangle, diamond, circle, pill, cylinder, hexagon) and implemented a custom CanvasNode to render them upon drop using `screenToFlowPosition`.
- **Debug Feedback (1)**: Updated Canvas Node renderer to display actual SVG shapes (`diamond`, `circle`, `pill`, `cylinder`, `hexagon`, `rectangle`) rather than basic div rectangles. Added `@xyflow/react` `<NodeResizer>` for shape resizing and `<NodeToolbar>` featuring actions to rotate shapes (90 degrees), change shape colors (from a predefined palette), and delete shapes from the canvas.
- **Debug Feedback (3)**: Refactored the UI to use a unified `PropertiesPanel` adjacent to the `ShapePanel` at the bottom of the screen instead of floating toolbars above elements. Changed default shape color to `slate` (gray). Expanded edge arrow functionality to support bidirectional arrows (`-->`, `<--`, `<-->`, `---`). Fixed panel reactivity by using `useNodes`/`useEdges`. Made connector handles conditionally visible only when the node is selected. Fixed element deletion logic by passing full objects to `deleteElements`, and eliminated the visual gap between edges and nodes by configuring the SVG marker `refX` parameter. Implemented global keyboard shortcuts (Undo `⌘Z`, Redo `⌘⇧Z`) and added a hoverable Keyboard Shortcuts pane to the editor navbar.

## In Progress

- `09-share-dialog.md`: Setting up Share dialog access control, inviting/removing collaborators by email, loading collaborator names/avatars via Clerk Backend API.
- **Theme Color Polish**: Transitioning background base variables from near-pitch-black variables to a premium slate-charcoal gray palette.

## Next Up

- AI system design code specs generation and integration.

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
