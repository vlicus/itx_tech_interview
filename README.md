# Product Grid Editor

Production-ready ZARA-style product grid editor with advanced drag-and-drop, template-based layouts, URL synchronization, and state management.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x+ ([Download](https://nodejs.org/))
- **npm** 9.x+ (included with Node.js)

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/itx_tech_interview.git
cd itx_tech_interview

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Loading Products via URL

Load products by adding IDs to the URL query parameter:

```
http://localhost:3000/products?ids=[product_1,product_2,product_3]
```

**Format:** `/products?ids=[id1,id2,id3,...]`

**Examples:**
- 3 products: `/products?ids=[product_1,product_2,product_3]`
- 6 products: `/products?ids=[product_1,product_2,product_3,product_4,product_5,product_6]`

The app will automatically organize products into rows (max 3 per row) and assign default templates.

---

## 📚 Core Features

### 1. Drag & Drop

**Product Operations:**
- Reorder products within rows
- Move products between rows
- **Overflow handling:** Excess products automatically cascade to next row or create new row

**Row Operations:**
- Drag rows using grip handle (☰) to reorder
- Visual feedback: blur effect, green highlights on drop zones

### 2. Template System

Control product alignment per row:

| Template | Alignment | CSS Class |
|----------|-----------|-----------|
| **Izquierda** (Left) | Left-aligned | `justify-start` |
| **Centro** (Center) | Center-aligned | `justify-center` |
| **Derecha** (Right) | Right-aligned | `justify-end` |
| **Ninguna** (None) | No template | ❌ Invalid for saving |

- New rows default to "Derecha" (Right)
- Select template from dropdown in row header
- **All rows must have a template to save**

### 3. Save Validation

**Validation Rules (both required):**
1. ✅ Every row must contain 1-3 products
2. ✅ Every row must have a template assigned (not "Ninguna")

**Validation Flow:**
- Click Save → Validation check
- ❌ **If invalid:** Error toast appears
- ✅ **If valid:** Grid exports as PNG (2x quality)

### 4. URL Synchronization

Grid state syncs bidirectionally with URL:

**Format:** `/products?ids=[product_1,product_2,...]`

**Auto-updates when:**
- Products added/removed
- Grid reset
- Products loaded from `/products` page

**Usage:**
- Share URL to replicate exact grid state
- Browser back/forward navigation works
- Debounced (300ms) to avoid excessive updates

### 5. Additional Features

- **Undo/Redo:** Ctrl/Cmd + Z/Y (50 action history)
- **Zoom:** 50%-200% with controls or keyboard shortcuts
- **Persistence:** Grid state saved to localStorage
- **Auto-cleanup:** Empty rows automatically removed
- **Responsive:** Mobile-optimized with touch support

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** HeroUI (NextUI v2)
- **State:** Zustand 5 + Immer
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Testing:** Vitest + happy-dom
- **Icons:** Lucide React + Iconify

---

## 📁 Project Structure

```
itx_tech_interview/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── products/page.tsx        # Grid editor page
│   ├── api/                     # API routes
│   └── providers.tsx            # HeroUI provider
│
├── src/
│   ├── components/              # Atomic Design pattern
│   │   ├── atoms/               # GridStat, UndoButton, RedoButton
│   │   ├── molecules/           # GridToolbar, GridStats, EmptyGridMessage
│   │   ├── organisms/           # GridRowList
│   │   ├── grid/                # GridEditor, GridRow
│   │   ├── product/             # ProductCard
│   │   └── ui/                  # TemplateSelector, ToastContainer, ZoomControls
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useGridData.ts       # Data loading & URL sync
│   │   ├── useGridDragAndDrop.ts # D&D logic
│   │   └── useGridOperations.ts # Save, undo, redo
│   │
│   ├── lib/store/               # Zustand stores
│   │   ├── gridStore.ts         # Grid state + overflow logic
│   │   ├── templateStore.ts     # Templates
│   │   ├── uiStore.ts           # UI state (toasts, zoom, loading)
│   │   └── proxy/undo-redo.ts   # Custom undo/redo middleware
│   │
│   ├── services/api.ts          # API service layer
│   ├── types/                   # TypeScript definitions
│   └── utils/                   # Validation, helpers
│
├── __tests__/unit/              # Unit tests
│   ├── validation.test.ts       # Grid validation logic (10 tests)
│   └── gridStore.overflow.test.ts # Overflow cascade logic (18 tests)
│
├── package.json                 # Dependencies & scripts
├── tsconfig.json               # TypeScript config
└── vitest.config.ts            # Test config
```

---

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint

# Testing
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

---

## 🧪 Testing

### Strategy

**Pragmatic unit testing** focused on business logic:

✅ **What we test:**
- Pure functions (validation, helpers)
- Store logic (state mutations, overflow cascade)
- Business rules (grid constraints, product limits)

❌ **What we don't test:**
- UI components (logic extracted to hooks/stores)
- Integration tests (store tests cover interactions)

### Coverage

- `validation.test.ts` - Grid validation rules (10 tests)
- `gridStore.overflow.test.ts` - D&D overflow scenarios (18 tests)
- **Total: 28 tests, all passing ✅**

### Run Tests

```bash
npm test              # Run all tests
npm run test:ui       # Open Vitest UI
npm run test:coverage # Generate coverage report
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + +` | Zoom in |
| `Ctrl/Cmd + -` | Zoom out |
| `Ctrl/Cmd + 0` | Reset zoom |

---

## 🚨 Troubleshooting

### Build Errors

```bash
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors

```bash
npm install
npx tsc --noEmit  # Check types
```

### Products Not Loading

1. Check URL format: `/products?ids=[product_1,product_2]` (brackets required)
2. Verify product IDs exist in `src/data/products.json`
3. Check browser console for errors

---

## 🎨 Architecture Patterns

- **Atomic Design:** Components organized by complexity (atoms → molecules → organisms)
- **Smart Hooks, Dumb Components:** Business logic in hooks, components for presentation
- **State Separation:** Grid state (Zustand) + UI state (separate store)
- **Type Safety:** Comprehensive TypeScript types with minimal `any` usage

---

## 🔒 Security

- Environment variables in `.env` (ignored by Git)
- No hardcoded secrets
- XSS protection (React escaping + HeroUI sanitization)
- CSRF protection (Next.js built-in)
- Regular dependency audits (`npm audit`)

---

## 📄 License

This project is part of a technical interview assessment for Inditex.

---

## 🙏 Acknowledgments

- **Inditex** - For the opportunity and requirements
- **Vercel** - For Next.js framework
- **dnd-kit** - For drag-and-drop library
- **Zustand** - For state management
