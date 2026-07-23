# rx4u Website

The official website for rx4u - a functional reactive programming library for JavaScript and TypeScript.

## 🚀 Features

- **Modern Design**: Professional, RxJS-inspired interface
- **Interactive Playground**: Browser code editor, runnable examples, and output panel
- **Comprehensive Documentation**: Getting started guides, core concepts, and API reference
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **Global Search**: Fast search across all documentation (⌘K)
- **Operator Examples**: Detailed examples with code and expected output
- **TypeScript First**: Full type safety throughout

## 🛠 Tech Stack

- **Frontend**: Solid.js + TypeScript
- **Styling**: Custom CSS with design tokens and component styles
- **Build**: Vite with Hot Module Replacement
- **Code Editor**: CodeMirror with JavaScript/TypeScript support
- **Package Manager**: pnpm (consistent with main rx4u project)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Navigation.tsx   # Main navigation with search
│   ├── Footer.tsx       # Website footer
│   ├── ThemeProvider.tsx # Dark/light theme management
│   └── GlobalSearch.tsx # Global search functionality
├── layouts/             # Page layout components
│   ├── AppLayout.tsx    # Main app layout
│   └── DocsLayout.tsx   # Documentation layout with sidebar
├── pages/               # Page components
│   ├── HomePage.tsx     # Landing page with hero section
│   ├── APIReference.tsx # Interactive API documentation
│   ├── PlaygroundPage.tsx # Code playground with examples
│   ├── ExamplesPage.tsx # Comprehensive operator examples
│   └── docs/            # Documentation pages
├── content/             # Markdown content
│   └── docs/            # Documentation markdown files
├── data/                # Static data and configuration
│   └── navigation.ts    # Navigation structure
└── styles/              # Global styles and themes
    └── globals.css      # Global design tokens and component styles
```

## 🏃‍♂️ Development

### Prerequisites

- Node.js (v20.19+ recommended)
- pnpm (v10.6.2+)

### Getting Started

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start development server from the repository root**:

   ```bash
   pnpm --filter @rx4u/website dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

### Available Scripts

- `pnpm --filter @rx4u/website dev` - Start the development server with HMR
- `pnpm --filter @rx4u/website build` - Build for production
- `pnpm --filter @rx4u/website preview` - Preview the production build locally
- `pnpm --filter @rx4u/website test` - Run website tests
- `pnpm --filter @rx4u/website typecheck` - Run TypeScript checks

## 🎨 Design System

### Colors

- **Primary**: `#6366F1` (rx4u Purple)
- **Secondary**: `#10B981` (Success Green)
- **Accent**: `#F59E0B` (Warning Amber)
- **Neutral**: Slate scale

### Typography

- **Headings**: Inter, system-ui, sans-serif
- **Body**: system-ui, -apple-system, sans-serif
- **Code**: 'JetBrains Mono', 'Fira Code', monospace

### Components

The website uses a consistent component library with:

- `.btn-primary` / `.btn-secondary` - Button styles
- `.code-block` - Code syntax highlighting
- `.nav-link` / `.nav-link-active` - Navigation styles
- Responsive grid systems with custom CSS

## 📖 Content Management

### Adding Documentation

1. Create markdown files in `src/content/docs/`
2. Update navigation structure in `src/data/navigation.ts`
3. Add route in `src/App.tsx`
4. Create page component if needed

### Adding API Documentation

1. Update operator data in `src/pages/APIReference.tsx`
2. Include:
   - Function signature
   - Description
   - Parameters
   - Code example
   - Category classification

### Adding Examples

1. Update examples array in `src/pages/ExamplesPage.tsx`
2. Include:
   - Title and description
   - Category
   - Complete code example
   - Expected output
   - Key concepts

## 🔍 Search Functionality

- **Global Search**: Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)
- **API Filter**: Filter operators by category in API reference
- **Example Filter**: Filter examples by category
- **Keyboard Navigation**: Use arrow keys and Enter in search

## 🎮 Interactive Features

### Playground

- **CodeMirror Editor**: JavaScript syntax highlighting
- **Example Templates**: Pre-built examples for common use cases
- **Simulated Execution**: Shows expected output
- **Responsive Layout**: Side-by-side code and output on desktop

### Theme System

- **Auto Detection**: Respects system preference
- **Manual Toggle**: Click theme button in navigation
- **Persistent**: Saves preference in localStorage
- **Smooth Transitions**: Animated theme switching

## 📱 Mobile Optimization

- **Responsive Navigation**: Hamburger menu on mobile
- **Touch-Friendly**: Optimized button sizes and spacing
- **Readable Typography**: Appropriate font sizes for mobile
- **Collapsible Sections**: Sidebar navigation collapses on mobile

## 🧪 Testing

The repository CI runs TypeScript checks, the configured Vitest suites, and production builds. Cross-browser and accessibility audits are not currently automated.

## 🚢 Deployment

### Production Build

```bash
pnpm build
```

Builds the app for production in the `dist/` folder.

### Static Hosting

The production build pre-renders each public route to static HTML for search engines while preserving client-side navigation and interactivity. Deploy the generated `dist` directory to:

- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Environment Variables

No environment variables required for basic functionality.

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Test your changes across different browsers and devices
3. Update documentation for new features
4. Consider keyboard and screen-reader behavior for interface changes
5. Add examples for new rx4u operators

## 📄 License

MIT - See the LICENSE file in the root directory.

## 🔗 Links

- [rx4u Library](../rx4u/README.md)
- [Examples Package](../examples/)
- [Live Website](http://localhost:3000) (during development)

---
