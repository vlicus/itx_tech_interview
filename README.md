# Product Grid Editor

> Production-ready ZARA-style product grid editor with advanced drag-and-drop, template-based layouts, real-time URL synchronization, and persistent state management.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-119%20passing-success?logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Private-red)]()

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Core Functionality

- **🎯 Drag & Drop System**
  - Reorder products within rows with smooth animations
  - Move products between rows with visual feedback
  - Drag entire rows using grip handles
  - Intelligent overflow handling and auto-cleanup

- **🎨 Template System**
  - Three alignment templates: Left, Center, Right
  - Dynamic template assignment based on product count
  - Template validation before saving
  - Visual template selection per row

- **💾 State Persistence**
  - Automatic localStorage persistence
  - Grid history with save/load functionality
  - Real-time URL synchronization
  - Shareable grid configurations via URL

- **✅ Validation System**
  - Row constraints (1-3 products per row)
  - Template requirement validation
  - Real-time error feedback
  - Toast notifications for user actions

- **🔍 URL Integration**
  - Bidirectional URL state sync
  - Deep linking support
  - Browser history integration
  - Shareable grid links

- **📱 User Experience**
  - Responsive design (mobile-optimized)
  - Touch support for mobile devices
  - Zoom controls (50%-200%)
  - Empty state handling
  - Loading states and error handling

---

## 🎥 Demo

### Quick Start Templates

Access pre-configured grid layouts from the home page:
- 6 Products Grid (2 rows × 3 columns)
- 4 Products Grid (custom layout)
- Empty Grid (start from scratch)

### Loading Products

Load products by adding IDs to the URL:

```
http://localhost:3000/products?ids=[product_1,product_2,product_3]
```

**URL Format:** `/products?ids=[id1,id2,id3,...]`

**Examples:**
```bash
# Load 3 products
/products?ids=[product_1,product_2,product_3]

# Load 6 products
/products?ids=[product_1,product_2,product_3,product_4,product_5,product_6]

# Empty grid
/products
```

### Saved Grid History

View and restore previously saved grids from the home page with:
- Timestamp of creation
- Row and product count
- One-click restoration

---

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[React 19](https://react.dev/)** - UI library

### UI & Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS
- **[HeroUI](https://heroui.com/)** - Component library (NextUI v2)
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Iconify React](https://iconify.design/)** - Icon system
- **[Lucide React](https://lucide.dev/)** - Icon library

### State Management
- **[Zustand 5](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[Immer](https://immerjs.github.io/immer/)** - Immutable state updates
- **[TanStack Query](https://tanstack.com/query/latest)** - Server state management

### Drag & Drop
- **[@dnd-kit/core](https://dndkit.com/)** - D&D toolkit
- **[@dnd-kit/sortable](https://dndkit.com/)** - Sortable functionality
- **[@dnd-kit/utilities](https://dndkit.com/)** - D&D utilities

### Testing
- **[Vitest](https://vitest.dev/)** - Fast unit test framework
- **[Happy DOM](https://github.com/capricorn86/happy-dom)** - DOM implementation
- **[@testing-library/jest-dom](https://testing-library.com/)** - Custom matchers

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Turbopack](https://turbo.build/)** - Fast bundler (Next.js 15)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/itx_tech_interview.git
cd itx_tech_interview

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm test             # Run all tests
npm run test:ui      # Open Vitest UI
npm run test:coverage # Generate coverage report
```

---

## 📁 Project Structure

```
itx_tech_interview/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Home page with templates & history
│   │   ├── products/
│   │   │   └── page.tsx          # Grid editor page
│   │   ├── api/
│   │   │   ├── grids/            # Grid CRUD endpoints
│   │   │   ├── products/         # Product endpoints
│   │   │   └── templates/        # Template endpoints
│   │   └── providers.tsx         # TanStack Query & HeroUI providers
│   │
│   ├── components/               # Atomic Design pattern
│   │   ├── atoms/                # Basic building blocks
│   │   │   └── GridStat.tsx
│   │   ├── molecules/            # Composed components
│   │   │   ├── GridStats.tsx
│   │   │   ├── GridToolbar.tsx
│   │   │   └── EmptyGridMessage.tsx
│   │   ├── organisms/            # Complex components
│   │   │   └── GridRowList.tsx
│   │   ├── grid/                 # Grid-specific components
│   │   │   ├── GridEditor.tsx
│   │   │   └── GridRow.tsx
│   │   ├── product/              # Product components
│   │   │   └── ProductCard.tsx
│   │   └── ui/                   # UI utilities
│   │       ├── TemplateSelector.tsx
│   │       ├── ToastContainer.tsx
│   │       └── ZoomControls.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── api/                  # TanStack Query hooks
│   │   │   ├── useProducts.ts
│   │   │   ├── useTemplates.ts
│   │   │   ├── useSaveGrid.ts
│   │   │   └── useSavedGrids.ts
│   │   ├── useGridData.ts        # Data loading & URL sync
│   │   ├── useGridDragAndDrop.ts # Drag & drop logic
│   │   └── useGridOperations.ts  # Save & validation
│   │
│   ├── lib/
│   │   ├── api.ts                # API client (ofetch)
│   │   ├── config/
│   │   │   └── theme.ts          # HeroUI theme configuration
│   │   └── store/                # Zustand stores
│   │       ├── gridStore.ts      # Grid state management
│   │       ├── gridStore.test.ts # Grid store tests (28 tests)
│   │       ├── templateStore.ts  # Template state
│   │       ├── uiStore.ts        # UI state (zoom, toasts)
│   │       └── uiStore.test.ts   # UI store tests (33 tests)
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── grid.ts               # Grid & row types
│   │   ├── product.ts            # Product types
│   │   ├── template.ts           # Template types
│   │   ├── api.ts                # API response types
│   │   └── index.ts              # Type exports
│   │
│   └── utils/                    # Utility functions
│       ├── validation.ts         # Grid validation logic
│       ├── validation.test.ts    # Validation tests (23 tests)
│       ├── gridUrlSerializer.ts  # URL serialization
│       ├── gridUrlSerializer.test.ts # URL tests (28 tests)
│       ├── formatters.ts         # Data formatters
│       └── formatters.test.ts    # Formatter tests (7 tests)
│
├── public/                       # Static assets
├── .env                          # Environment variables
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── vitest.config.ts              # Vitest configuration
└── next.config.ts                # Next.js configuration
```

---

## 🧪 Testing

### Test Coverage

**119 tests, all passing ✅**

```bash
Test Files  5 passed (5)
Tests       119 passed (119)
Duration    ~1.3s
```

### Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `utils/validation.test.ts` | 23 | Grid validation, error handling |
| `utils/gridUrlSerializer.test.ts` | 28 | URL parsing, serialization |
| `utils/formatters.test.ts` | 7 | Data formatting |
| `lib/store/gridStore.test.ts` | 28 | State management, CRUD |
| `lib/store/uiStore.test.ts` | 33 | UI state, toasts, zoom |

### Testing Strategy

**Focus:** Unit testing of business logic and state management

✅ **What we test:**
- Pure functions (validation, serialization, formatters)
- Store mutations and side effects
- Business rules and constraints
- Edge cases and error conditions

❌ **What we skip:**
- UI components (logic extracted to hooks/stores)
- Integration tests (covered by component tests)
- E2E tests (out of scope)

### Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

---

## 🏗️ Architecture

### Design Patterns

**1. Atomic Design**
- Components organized by complexity (atoms → molecules → organisms)
- Promotes reusability and maintainability
- Clear component hierarchy

**2. Smart Hooks, Dumb Components**
- Business logic in custom hooks
- Components focus on presentation
- Better testability and separation of concerns

**3. State Separation**
- Grid state (Zustand + persistence)
- UI state (separate store)
- Server state (TanStack Query)

**4. Co-located Tests**
- Tests placed next to source files
- Modern approach for better discoverability
- Easier refactoring

### State Management

```typescript
// Grid Store (src/lib/store/gridStore.ts)
- Rows and products
- CRUD operations
- Template assignment
- Drag & drop logic
- LocalStorage persistence

// UI Store (src/lib/store/uiStore.ts)
- Zoom level
- Loading states
- Toast notifications
- Error handling
- Validation errors

// Template Store (src/lib/store/templateStore.ts)
- Available templates
- Template loading state
```

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Custom Hook (useGridOperations, useGridDragAndDrop)
    ↓
Zustand Store Action
    ↓
Immer State Update
    ↓
LocalStorage Sync (automatic)
    ↓
URL Update (useGridData)
    ↓
Component Re-render
```

---

## 📡 API Reference

### Endpoints

#### GET `/api/products`
Fetch products by IDs.

**Query Parameters:**
- `ids` (string): Comma-separated product IDs

**Response:**
```json
{
  "products": [
    {
      "id": "product_1",
      "name": "Product Name",
      "thumbnail": "/images/product_1.jpg"
    }
  ]
}
```

#### GET `/api/templates`
Fetch available templates.

**Response:**
```json
{
  "templates": [
    {
      "id": "template_left",
      "name": "Izquierda",
      "alignment": "left",
      "justifyClass": "justify-start"
    }
  ]
}
```

#### POST `/api/grids`
Save a grid configuration.

**Request Body:**
```json
{
  "rows": [
    {
      "id": "row_1",
      "productIds": ["product_1", "product_2"],
      "templateId": "template_left",
      "order": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "gridId": "grid_1234567890"
}
```

#### GET `/api/grids`
Fetch saved grids.

**Response:**
```json
{
  "grids": [
    {
      "id": "grid_1234567890",
      "timestamp": "2025-01-12T10:30:00.000Z",
      "data": {
        "rows": [...]
      }
    }
  ],
  "count": 1
}
```

---

## 🎯 Template System

### Available Templates

| Template ID | Name | Alignment | CSS Class | Use Case |
|------------|------|-----------|-----------|----------|
| `template_left` | Izquierda | Left | `justify-start` | 2 products (default) |
| `template_center` | Centro | Center | `justify-center` | 3 products (default) |
| `template_right` | Derecha | Right | `justify-end` | 1 product (default) |
| `template_none` | Ninguna | None | - | ❌ Invalid state |

### Dynamic Template Assignment

New rows automatically receive templates based on product count:
- **1 product** → Right alignment
- **2 products** → Left alignment
- **3 products** → Center alignment

### Validation Rules

- Every row **must** have a template assigned
- `template_none` is not allowed when saving
- Template can be manually overridden via dropdown

---

## 🚨 Troubleshooting

### Build Errors

```bash
# Clean install
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### TypeScript Errors

```bash
# Check types
npx tsc --noEmit

# If errors persist, clean and reinstall
npm install
```

### Products Not Loading

1. **Check URL format:**
   ```
   ✅ Correct: /products?ids=[product_1,product_2]
   ❌ Wrong:   /products?ids=product_1,product_2
   ```

2. **Verify product IDs exist** in the mock data

3. **Check browser console** for API errors

4. **Clear localStorage:**
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

### State Not Persisting

```javascript
// Clear corrupted localStorage
localStorage.removeItem('product-grid-storage');
location.reload();
```

### Drag & Drop Not Working

1. **Check browser compatibility** (modern browsers required)
2. **Disable browser extensions** that might interfere
3. **Clear cache and reload**

---

## 🔒 Security

- **Environment Variables:** Sensitive data in `.env` (gitignored)
- **XSS Protection:** React automatic escaping + HeroUI sanitization
- **CSRF Protection:** Next.js built-in middleware
- **Type Safety:** Comprehensive TypeScript coverage
- **Input Validation:** Zod schemas for API inputs
- **Dependency Audits:** Regular `npm audit` checks

---

## 🚀 Performance

### Optimizations

- **Code Splitting:** Automatic route-based splitting (Next.js)
- **Image Optimization:** Next.js Image component
- **Lazy Loading:** Dynamic imports for heavy components
- **Memoization:** `React.memo` and `useMemo` where needed
- **Debouncing:** URL updates debounced (300ms)
- **Virtual Scrolling:** Not needed (small datasets)

### Bundle Size

```bash
# Analyze bundle
npm run build
```

Key optimizations:
- Tailwind CSS purging
- Tree-shaking (ES modules)
- Minification (Terser)

---

## 📈 Future Enhancements

- [ ] Image export optimization (WebP format)
- [ ] Grid templates library
- [ ] Collaborative editing (WebSocket)
- [ ] Advanced filtering and search
- [ ] Product categorization
- [ ] Custom template builder
- [ ] Export to multiple formats (PDF, HTML)
- [ ] Analytics dashboard

---

## 📄 License

This project is part of a technical interview assessment for Inditex.

**Status:** Private / Proprietary

---

## 👥 Author

**Technical Assessment** for Inditex ITX

---

## 🙏 Acknowledgments

- **Inditex** - For the technical challenge
- **Vercel** - Next.js framework and deployment platform
- **dnd-kit** - Modern drag-and-drop library
- **Zustand** - Elegant state management
- **Vitest** - Fast and modern testing framework
- **HeroUI Team** - Beautiful component library

---

**Built with ❤️ using Next.js 15 and TypeScript**
