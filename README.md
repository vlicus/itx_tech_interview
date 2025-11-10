# Product Grid Editor

A production-ready ZARA-style product grid editor built with Next.js 15, featuring advanced drag-and-drop functionality, template-based layouts, URL synchronization, and comprehensive state management.

---

## 🚀 Quick Start Guide

### Prerequisites

Before starting, ensure you have the following installed:

-   **Node.js** 18.x or higher ([Download](https://nodejs.org/))
-   **npm** 9.x or higher (comes with Node.js)
-   **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/itx_tech_interview.git
cd itx_tech_interview
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the development server:**

```bash
npm run dev
```

4. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

### Loading Products via URL

You can pre-load specific products by passing their IDs through the URL query parameter:

```
http://localhost:3000/?ids=product_1,product_2,product_3,product_4
```

**Examples:**

-   Load 3 products: `http://localhost:3000/?ids=product_1,product_2,product_3`
-   Load 6 products: `http://localhost:3000/?ids=product_1,product_2,product_3,product_4,product_5,product_6`

The application will:

1. Parse the `ids` parameter from the URL
2. Fetch the products from the API (or mocked data)
3. Automatically organize them into rows (max 3 products per row)
4. Assign default templates to each row

---

## 📚 Application Features

### Core Purpose

The **Product Grid Editor** is a visual tool for creating and managing product grids with customizable layouts. It allows users to:

-   Organize products into rows with drag-and-drop
-   Apply alignment templates to control product positioning
-   Validate grid configuration before saving
-   Persist state across browser sessions

### 1. Drag & Drop (D&D)

The application features a sophisticated drag-and-drop system powered by `@dnd-kit`:

#### **Product Dragging**

-   **Within Rows**: Reorder products by dragging them to new positions
-   **Between Rows**: Move products from one row to another
-   **Overflow Handling**: When a row exceeds 3 products, excess products automatically cascade to the next row or create a new row

#### **Row Dragging**

-   **Reorder Rows**: Use the grip handle (☰) on the left side of each row header to drag entire rows up or down
-   **Visual Feedback**: Active drag shows blur effect on background, green highlight on valid drop zones

#### **Visual Effects**

-   **Blur Background**: When dragging, the background blurs (2px) with reduced brightness (95%)
-   **Original Element**: The source element becomes 30% transparent and scales to 95%
-   **Drag Preview**: A crisp, prominent overlay follows the cursor at 110% scale with primary ring
-   **Drop Zones**: Valid drop zones highlight with:
    -   Green ring (4px, success-500)
    -   Green background gradient on header
    -   Dashed green border on card body
    -   Smooth transitions (200ms)

### 2. Templates

Templates control the horizontal alignment of products within a row:

#### **Available Templates**

-   **Left (Izquierda)**: Products align to the left (`justify-start`)
-   **Center (Centro)**: Products align to the center (`justify-center`)
-   **Right (Derecha)**: Products align to the right (`justify-end`) - **Default**
-   **None (Ninguna)**: No template assigned (invalid for saving)

#### **Template Management**

-   **Assignment**: Click the dropdown in each row header to select a template
-   **Unassignment**: Select "Ninguna" to remove the template
-   **Visual Indication**: Template name appears in the dropdown button
-   **Default Behavior**: New rows automatically receive the "Right" template

#### **Validation**

-   All rows **must have a template assigned** before saving
-   Rows without templates show validation errors

### 3. Save Validation

The application enforces strict validation rules before allowing save operations:

#### **Validation Rules**

1. **Products Required**: Every row must contain at least 1 product
2. **Product Limit**: Every row can contain a maximum of 3 products
3. **Template Required**: Every row must have a template assigned (cannot be "Ninguna")

#### **Validation Feedback**

-   **Pre-Save Check**: Click the Save button to trigger validation
-   **Error Toast**: If validation fails, a toast notification appears: _"Cannot save: make sure all files have assigned grids"_
-   **Visual Indicators**: Invalid rows display red borders and error messages
-   **Save Button State**: The button remains enabled to allow users to see validation errors

#### **Success Flow**

When validation passes:

1. Grid is captured as a PNG image (2x pixel ratio for quality)
2. Image downloads automatically with timestamp: `product-grid-{timestamp}.png`
3. Success toast appears: _"Grid image downloaded successfully!"_

### 4. URL Synchronization

The application maintains URL synchronization with the current grid state:

#### **How It Works**

-   **Automatic Updates**: The URL updates automatically when products are added or removed
-   **URL Format**: `http://localhost:3000/?ids=product_1,product_2,product_3`
-   **Bi-directional**:
    -   Loading the URL populates the grid
    -   Modifying the grid updates the URL

#### **Synchronization Events**

The URL updates when:

-   Products are added to the grid
-   Products are removed from rows
-   The grid is reset
-   Products are loaded via the products page (`/products`)

#### **Implementation Details**

-   Uses Next.js `useSearchParams` and `useRouter` hooks
-   Debounced updates (300ms) to avoid excessive URL changes during rapid operations
-   Preserves browser history for back/forward navigation
-   Query parameter format: comma-separated product IDs

#### **Example Flow**

1. User visits: `http://localhost:3000/?ids=product_1,product_2`
2. Grid loads with 1 row containing 2 products
3. User adds `product_3` via drag-and-drop
4. URL automatically updates to: `http://localhost:3000/?ids=product_1,product_2,product_3`
5. User can share this URL, and the recipient sees the exact same grid

### 5. Additional Features

-   **Undo/Redo**: Full history tracking with keyboard shortcuts (Ctrl/Cmd + Z/Y)
-   **Zoom Controls**: Zoom between 50%-200% using controls or keyboard shortcuts
-   **Row Statistics**: Real-time display of row count and product count
-   **Responsive Design**: Mobile-optimized with touch-friendly controls
-   **Persistence**: Grid state saves to localStorage automatically
-   **Empty Row Cleanup**: Rows with no products are automatically removed
-   **Keyboard Navigation**: Full keyboard support for accessibility

---

## 🛠️ Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript 5
-   **Styling**: Tailwind CSS 4
-   **UI Components**: HeroUI (NextUI v2)
-   **State Management**: Zustand 5 with Immer
-   **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
-   **Testing**: Vitest
-   **Icons**: Lucide React + Iconify

---

## 📁 Project Structure

```
itx_tech_interview/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (redirects to /products)
│   ├── products/
│   │   └── page.tsx             # Products page with grid editor
│   ├── providers.tsx            # Client providers (HeroUI)
│   └── globals.css              # Global styles
│
├── src/
│   ├── components/              # React components (Atomic Design)
│   │   ├── atoms/               # Basic UI elements
│   │   │   ├── GridStat.tsx
│   │   │   ├── RedoButton.tsx
│   │   │   └── UndoButton.tsx
│   │   ├── molecules/           # Composite components
│   │   │   ├── GridStats.tsx
│   │   │   ├── GridToolbar.tsx
│   │   │   ├── UndoRedoControls.tsx
│   │   │   └── EmptyGridMessage.tsx
│   │   ├── organisms/           # Complex components
│   │   │   └── GridRowList.tsx
│   │   ├── grid/                # Grid-specific components
│   │   │   ├── GridEditor.tsx   # Main editor container
│   │   │   └── GridRow.tsx      # Individual row with D&D
│   │   ├── product/
│   │   │   └── ProductCard.tsx  # Draggable product card
│   │   ├── ui/                  # Shared UI components
│   │   │   ├── MockProvider.tsx
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── ToastContainer.tsx
│   │   │   └── ZoomControls.tsx
│   │   └── home.tsx             # Legacy home component
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useGridData.ts       # Grid data loading & URL sync
│   │   ├── useGridDragAndDrop.ts # D&D logic
│   │   ├── useGridOperations.ts # Save, undo, redo
│   │   ├── useHydration.ts      # SSR hydration guard
│   │   ├── useResponsive.ts     # Device detection
│   │   └── index.ts
│   │
│   ├── lib/
│   │   └── store/               # Zustand stores
│   │       ├── proxy/
│   │       │   └── undo-redo.ts # Custom undo/redo middleware
│   │       ├── gridStore.ts     # Grid state
│   │       ├── templateStore.ts # Templates
│   │       ├── uiStore.ts       # UI state
│   │       └── index.ts
│   │
│   ├── services/
│   │   └── api.ts               # API service layer
│   │
│   ├── types/                   # TypeScript definitions
│   │   ├── product.ts
│   │   ├── template.ts
│   │   ├── grid.ts
│   │   ├── api.ts
│   │   ├── drag.ts
│   │   ├── ui.ts
│   │   └── index.ts
│   │
│   └── utils/                   # Utility functions
│       ├── validation.ts        # Grid validation
│       ├── cn.ts                # Class name merger
│       └── index.ts
│
├── __tests__/                   # Test files
│   └── unit/
│       ├── validation.test.ts
│       └── gridStore.overflow.test.ts
│
├── public/                      # Static assets
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── vitest.config.ts            # Vitest config
└── README.md                   # This file
```

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Building
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# Testing
npm test             # Run tests with Vitest
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

---

## 🎮 Usage Guide

### Basic Workflow

1. **Load Products**

    - Visit `/products` or use URL parameters: `/?ids=product_1,product_2`
    - Products automatically organize into rows (3 per row)

2. **Customize Layout**

    - Drag products to reorder within or between rows
    - Drag row handles (☰) to reorder entire rows
    - Select templates from dropdown to change alignment

3. **Validate & Save**
    - Click the Save button
    - Fix any validation errors shown in toast or row indicators
    - Once valid, the grid downloads as a PNG image

### Keyboard Shortcuts

| Shortcut       | Action                  |
| -------------- | ----------------------- |
| `Ctrl/Cmd + Z` | Undo last action        |
| `Ctrl/Cmd + Y` | Redo last undone action |
| `Ctrl/Cmd + +` | Zoom in                 |
| `Ctrl/Cmd + -` | Zoom out                |
| `Ctrl/Cmd + 0` | Reset zoom to 100%      |

### Validation Rules

Before saving, ensure:

-   ✅ All rows have 1-3 products
-   ✅ All rows have a template assigned (not "Ninguna")
-   ✅ No empty rows exist

---

## 🧪 Testing

### Run Tests

```bash
npm test              # Run all tests
npm run test:ui       # Open Vitest UI
npm run test:coverage # Generate coverage report
```

### Testing Strategy

This project follows a **pragmatic unit testing approach** focused on high-value, low-maintenance tests:

#### **What We Test**

-   ✅ **Pure Functions**: Validation utilities, formatters, helpers
-   ✅ **Store Logic**: State mutations, complex algorithms (e.g., overflow cascade)
-   ✅ **Business Rules**: Grid validation, row constraints, product limits

#### **What We Don't Test**

-   ❌ **UI Components**: Logic is extracted to hooks/stores (tested separately)
-   ❌ **Integration Tests**: Store tests already validate component interactions
-   ❌ **E2E Tests**: Out of scope for this assessment

#### **Current Test Coverage**

-   `validation.test.ts` - Grid and row validation logic
-   `gridStore.overflow.test.ts` - Complex D&D overflow scenarios with cascading displacement

#### **Why This Approach?**

1. **Architecture Enables It**: "Smart Hooks, Dumb Components" pattern means most logic is in testable hooks/stores
2. **High ROI**: Tests focus on complex logic (overflow cascade, validation) rather than UI rendering
3. **Low Maintenance**: No brittle component tests that break with UI changes
4. **Fast Execution**: Unit tests run in milliseconds, no DOM rendering overhead

---

## 🎨 Code Quality Standards

### Naming Conventions

-   **Variables**: `camelCase` (e.g., `productGridRows`)
-   **Components**: `PascalCase` (e.g., `ProductCard`)
-   **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_PRODUCTS_PER_ROW`)
-   **Types/Interfaces**: `PascalCase` with prefix (e.g., `IProduct`, `TGridTemplate`)
-   **Files**: Match component/module name

### Architectural Patterns

-   **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)
-   **Custom Hooks**: Business logic extracted into reusable hooks
-   **State Management**: Zustand stores with clear separation of concerns
-   **Type Safety**: Comprehensive TypeScript types throughout

### Best Practices

-   **KISS**: Simple, readable solutions over clever ones
-   **DRY**: Reusable components, hooks, and utilities
-   **YAGNI**: Only implemented required features
-   **Single Responsibility**: Each module has one clear purpose

---

## 🌐 API Documentation

### Endpoints

#### `GET /api/products?ids=[id1,id2,...]`

Fetch products by IDs.

**Query Parameters:**

-   `ids` (string, comma-separated): Product IDs to fetch

**Response:**

```typescript
{
    products: Array<{
        id: string
        name: string
        imageUrl: string
        price: string
    }>
}
```

#### `GET /api/templates`

Fetch all available templates.

**Response:**

```typescript
{
    templates: Array<{
        id: string
        name: string
        alignment: 'LEFT' | 'CENTER' | 'RIGHT'
    }>
}
```

#### `POST /api/grids`

Save grid configuration.

**Request Body:**

```typescript
{
    rows: Array<{
        id: string
        productIds: string[]
        templateId: string | null
        order: number
    }>
}
```

**Response:**

```typescript
{
  success: boolean
  gridId?: string
  message?: string
}
```

---

## 🚨 Troubleshooting

### Issue: Build Errors

**Solution:**

```bash
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Issue: TypeScript Errors

**Solution:**

1. Ensure all dependencies are installed: `npm install`
2. Check `tsconfig.json` paths are correct
3. Run type check: `npm run type-check`

### Issue: Products Not Loading

**Solution:**

1. Check URL format: `/?ids=product_1,product_2`
2. Ensure product IDs exist in mock data (`src/lib/mocks/data.ts`)
3. Check browser console for API errors

---

## 🔒 Security

This application follows security best practices:

-   **Environment Variables**: Sensitive data stored in `.env` files (ignored by Git)
-   **No Hardcoded Secrets**: All API keys and tokens use environment variables
-   **XSS Protection**: React's built-in escaping + HeroUI sanitization
-   **CSRF Protection**: Next.js built-in CSRF protection
-   **Dependency Audits**: Regular `npm audit` checks

---

## 📱 Browser Support

-   ✅ Chrome/Edge (latest 2 versions)
-   ✅ Firefox (latest 2 versions)
-   ✅ Safari (latest 2 versions)
-   ✅ Mobile browsers (iOS Safari 14+, Chrome Android)

---

## ♿ Accessibility

-   ✅ Keyboard navigation support
-   ✅ ARIA labels on interactive elements
-   ✅ Focus management during drag operations
-   ✅ Screen reader friendly
-   ✅ WCAG 2.1 AA contrast ratios

---

## 🚀 Performance Optimizations

-   **Lazy Loading**: Product images load on-demand
-   **Memoization**: `React.memo` on components to prevent unnecessary re-renders
-   **Optimized D&D**: Custom collision detection for better performance
-   **Debounced Operations**: URL updates and save operations debounced
-   **Bundle Splitting**: Next.js automatic code splitting

---

## 📄 License

This project is part of a technical interview assessment for Inditex.

---

## 👤 Contact

For questions or support, please contact the development team.

---

## 🙏 Acknowledgments

-   **Inditex**: For the opportunity and requirements
-   **Vercel**: For Next.js framework
-   **dnd-kit**: For the excellent drag-and-drop library
-   **Zustand**: For lightweight state management
