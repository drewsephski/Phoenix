# Native Smooth Scroll Implementation Guide

This guide explains the native smooth scroll implementation for the Aura project, which provides reliable and performant smooth scrolling without external dependencies.

## Overview

The smooth scrolling has been implemented using native browser APIs and CSS, ensuring:

- **Reliability**: No external dependencies that can break
- **Performance**: Native browser optimization
- **Compatibility**: Works across all modern browsers
- **Simplicity**: Easy to understand and maintain

## Implementation Details

### 1. CSS Smooth Scrolling (`app/globals.css`)

Smooth scrolling is enabled globally via CSS:

```css
html {
  scroll-behavior: smooth;
}
```

This ensures all programmatic scrolling (via `window.scrollTo()`) is automatically smooth.

### 2. Smooth Scroll Hook (`hooks/useSmoothScroll.ts`)

A custom hook providing programmatic smooth scrolling:

```tsx
const { scrollTo, scrollToTop, scrollToElement, isSmoothScrollSupported } = useSmoothScroll();

// Scroll to element
scrollTo('#section', { duration: 1000, offset: 20 });

// Scroll to top
scrollToTop();

// Scroll to element with offset
scrollToElement('#about', 80);
```

**Features:**

- Scroll to absolute position or element
- Configurable offset for fixed headers
- Browser support detection
- TypeScript support

### 3. Smooth Anchor Component (`components/SmoothAnchor.tsx`)

A component for smooth anchor link navigation:

```tsx
import SmoothAnchor from '@/components/SmoothAnchor';

<SmoothAnchor href="#section" offset={80}>
    Go to Section
</SmoothAnchor>
```

**Features:**

- Automatic anchor link handling
- Configurable offset support
- Fallback to native behavior
- Touch-friendly

## Usage Examples

### Basic Programmatic Scrolling

```tsx
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

function MyComponent() {
    const { scrollTo, scrollToTop } = useSmoothScroll();
    
    return (
        <div>
            <button onClick={() => scrollTo('#about')}>
                Go to About
            </button>
            <button onClick={() => scrollToTop()}>
                Back to Top
            </button>
        </div>
    );
}
```

### Navigation with Smooth Scrolling

```tsx
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

function Navigation() {
    const { scrollToElement } = useSmoothScroll();
    
    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'contact', label: 'Contact' }
    ];
    
    return (
        <nav>
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => scrollToElement(`#${item.id}`, 80)}
                >
                    {item.label}
                </button>
            ))}
        </nav>
    );
}
```

### Anchor Links

```tsx
import SmoothAnchor from '@/components/SmoothAnchor';

function App() {
    return (
        <div>
            <nav>
                <SmoothAnchor href="#home" offset={80}>Home</SmoothAnchor>
                <SmoothAnchor href="#about" offset={80}>About</SmoothAnchor>
                <SmoothAnchor href="#contact" offset={80}>Contact</SmoothAnchor>
            </nav>
            
            <section id="home">...</section>
            <section id="about">...</section>
            <section id="contact">...</section>
        </div>
    );
}
```

## Browser Support

Native smooth scrolling is supported in:

- Chrome 61+
- Firefox 36+
- Safari 10+
- Edge 79+
- iOS Safari 10+
- Android Browser 61+

**Fallback:** For unsupported browsers, scrolling falls back to instant scrolling.

## Configuration Options

### useSmoothScroll Hook

```tsx
scrollTo(target, options)
```

**Parameters:**

- `target`: String selector or number position
- `options.duration`: Animation duration in milliseconds (default: 1000)
- `options.offset`: Offset in pixels (default: 0)

```tsx
scrollToTop(options)
```

**Parameters:**

- `options.duration`: Animation duration in milliseconds (default: 1000)

```tsx
scrollToElement(selector, offset, options)
```

**Parameters:**

- `selector`: CSS selector string
- `offset`: Offset in pixels (default: 0)
- `options.duration`: Animation duration in milliseconds (default: 1000)

### SmoothAnchor Component

**Props:**

- `href`: Anchor link (must start with #)
- `offset`: Offset in pixels (default: 0)
- `className`: CSS classes
- `onClick`: Custom click handler

## Performance Benefits

1. **No JavaScript Animation Loops**: Uses native browser smooth scrolling
2. **Lower Memory Usage**: No external library overhead
3. **Better Battery Life**: Native implementation is more efficient
4. **Faster Load Times**: No additional JavaScript to download

## Migration from Lenis

### Before (Lenis)

```tsx
import { useLenisScroll } from '@/hooks/useLenisScroll';

const { scrollTo, isLenisAvailable } = useLenisScroll();
if (isLenisAvailable()) {
    scrollTo('#section', { duration: 1.5 });
}
```

### After (Native)

```tsx
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

const { scrollTo } = useSmoothScroll();
scrollTo('#section', { duration: 1000 });
```

## Troubleshooting

### Smooth scrolling not working

1. Check if `scroll-behavior: smooth` is in your CSS
2. Verify the target element exists
3. Check browser console for errors

### Incorrect scroll position

- Use the `offset` parameter to adjust for fixed headers
- Calculate offset based on header height

### Performance issues

- Native smooth scrolling is already optimized
- Check for other performance bottlenecks in your app

## Best Practices

1. **Use consistent offsets** for fixed headers across your app
2. **Test on mobile devices** to ensure smooth performance
3. **Provide fallbacks** for unsupported browsers
4. **Keep animations short** (800ms-1500ms) for better UX
5. **Use semantic HTML** for anchor links

## Comparison with Lenis

| Feature | Native | Lenis |
|---------|--------|-------|
| Bundle Size | 0 KB | ~15 KB |
| Performance | Native | JavaScript |
| Browser Support | Modern browsers | Modern browsers |
| Configuration | Limited | Extensive |
| Reliability | High | Medium |
| Dependencies | None | External |

The native implementation prioritizes reliability and performance over extensive customization options.
