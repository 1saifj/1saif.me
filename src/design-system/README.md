# Design System

This folder contains all reusable design system components, styles, hooks, and tokens for the portfolio.

## Structure

```
design-system/
├── components/      # Reusable UI components
├── styles/          # Global CSS and animations
├── hooks/           # Custom React hooks
├── tokens/          # Design tokens (future: colors, spacing, typography)
└── index.ts         # Barrel export file
```

## Components

### UI Components
- **EmptyState** - Empty state placeholder with icon, title, description, and optional action
- **FilterButton** - Filter button component
- **LoadingSpinner** - Loading spinner with size variants (sm, md, lg)
- **Pagination** - Pagination component with page navigation
- **SearchBar** - Search input component
- **ViewModeToggle** - Toggle between grid and list view modes

### Theme Components
- **ThemeProvider** - Theme context provider
- **ThemeToggle** - Dark/light mode toggle button

## Hooks

- **useTheme** - Theme management hook (light/dark mode)

## Styles

- **animations.css** - All animation keyframes and utility classes
- **code-highlighting.css** - Code block syntax highlighting themes
- **giscus.css** - Giscus comments styling

## Usage

### Importing Components

```tsx
import { LoadingSpinner, ThemeToggle, useTheme } from '@/design-system'
```

### Importing Styles

Styles are automatically imported via `src/index.css`:

```css
@import './design-system/styles/animations.css';
@import './design-system/styles/code-highlighting.css';
```

## Design Tokens

Design tokens (colors, spacing, typography) are currently defined in:
- `tailwind.config.js` - Color palette, spacing, breakpoints, animations
- `src/index.css` - Component utility classes (buttons, cards, badges, inputs)

Future improvement: Extract these into dedicated token files for better maintainability.

## Best Practices

1. **Component Reusability**: All components should be framework-agnostic and reusable
2. **Type Safety**: Use TypeScript for all components and hooks
3. **Accessibility**: Ensure all components follow WCAG 2.1 guidelines
4. **Documentation**: Document component props and usage examples
5. **Testing**: Add unit tests for all components (future improvement)

## Migration Notes

This design system was refactored from:
- `src/components/ui/` → `src/design-system/components/`
- `src/styles/` → `src/design-system/styles/`
- `src/hooks/useTheme.ts` → `src/design-system/hooks/useTheme.ts`

All import paths have been updated accordingly.
