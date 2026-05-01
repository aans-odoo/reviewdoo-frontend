# Reviewdoo — Frontend

React/Vite single-page application with Tailwind CSS and shadcn/ui.

## Setup

```bash
# Install dependencies (from repo root)
npm install

# Start development server
npm run dev
```

The frontend runs on http://localhost:5173 and proxies API requests to the backend at http://localhost:3000.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests (vitest) |

## Component Structure

```
src/
├── App.tsx                          # Router configuration
├── main.tsx                         # Entry point
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx       # Redirects unauthenticated users to login
│   │   └── AdminRoute.tsx           # Redirects non-admin users
│   ├── layout/
│   │   ├── DashboardLayout.tsx      # Sidebar + content area wrapper
│   │   ├── Sidebar.tsx              # Navigation links to all pages
│   │   └── Header.tsx               # User info and logout
│   ├── shared/
│   │   ├── DataTable.tsx            # Sortable, paginated data table
│   │   ├── StatusBadge.tsx          # Color-coded status indicators
│   │   ├── ConfirmDialog.tsx        # Confirmation modal
│   │   └── Pagination.tsx           # Page navigation controls
│   └── ui/                          # shadcn/ui primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── toast.tsx
├── hooks/
│   ├── useAuth.ts                   # Auth context (login, logout, role checks)
│   └── useApi.ts                    # Data fetching hook
├── lib/
│   ├── api.ts                       # HTTP client with JWT attachment
│   └── utils.ts                     # Shared utility functions (cn, etc.)
├── pages/
│   ├── LoginPage.tsx                # Email/password login
│   ├── AccountSetupPage.tsx         # Invite token password setup
│   ├── ChecklistItemsPage.tsx       # List with filters, search, pagination
│   ├── ChecklistItemDetailPage.tsx  # Full item view with references
│   ├── GuidelinesPage.tsx           # Guideline set and guideline CRUD
│   ├── AuthorsPage.tsx              # Add/remove tracked authors
│   ├── IngestionLogsPage.tsx        # Ingestion job monitoring
│   ├── AIModelConfigPage.tsx        # AI provider configuration
│   ├── PromptGeneratorPage.tsx      # Generate prompts for AI IDEs
│   ├── UserManagementPage.tsx       # User CRUD (admin only)
│   └── SmtpConfigPage.tsx           # SMTP settings (admin only)
└── styles/
    └── globals.css                  # Tailwind directives and CSS variables
```

## Theming

The frontend uses **Tailwind CSS** with **shadcn/ui** components and **CSS custom properties** for theming.

### How it works

1. **CSS variables** define the color palette in `src/styles/globals.css` using HSL values. Light and dark mode variants are defined under `:root` and `.dark` respectively.

2. **Tailwind config** (`tailwind.config.ts`) maps semantic color names (`primary`, `secondary`, `destructive`, `muted`, `accent`, etc.) to these CSS variables via `hsl(var(--name))`.

3. **shadcn/ui components** use these semantic color names, so all components automatically respect the theme.

### Key design tokens

| Token | Usage |
|-------|-------|
| `primary` | Main actions, active states |
| `secondary` | Secondary actions, subtle backgrounds |
| `destructive` | Delete actions, error states |
| `muted` | Disabled states, subtle text |
| `accent` | Hover states, highlights |
| `card` | Card backgrounds |
| `border` | Borders and dividers |
| `input` | Form input borders |

### Customizing

To change the color scheme, edit the CSS variables in `src/styles/globals.css`. The HSL values flow through Tailwind into all shadcn/ui components automatically.

## Routing

| Path | Component | Access |
|------|-----------|--------|
| `/login` | LoginPage | Public |
| `/setup` | AccountSetupPage | Public (invite token) |
| `/checklist-items` | ChecklistItemsPage | Authenticated |
| `/checklist-items/:id` | ChecklistItemDetailPage | Authenticated |
| `/guidelines` | GuidelinesPage | Authenticated |
| `/authors` | AuthorsPage | Authenticated |
| `/ingestion-logs` | IngestionLogsPage | Authenticated |
| `/ai-config` | AIModelConfigPage | Authenticated |
| `/prompt-generator` | PromptGeneratorPage | Authenticated |
| `/users` | UserManagementPage | Admin only |
| `/smtp-config` | SmtpConfigPage | Admin only |
