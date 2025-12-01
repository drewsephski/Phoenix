# Lenis Smooth Scroll Integration Guide

This document provides comprehensive guidance on using Lenis smooth scroll in the Aura project.

## Overview

Lenis is a lightweight, performant smooth scroll library that provides buttery-smooth scrolling experiences. Our implementation includes:

- **LenisProvider**: Main provider component with optimized configuration
- **useLenisScroll**: Custom hook for programmatic scroll control
- **LenisAnchor**: Component for smooth anchor link navigation
- **useLenisPrevent**: Hook to prevent smooth scrolling on specific elements

## Quick Start

### 1. Basic Setup

Lenis is already configured in your app via `LenisProvider` in `app/layout.tsx`:

```tsx
<LenisProvider>
  {children}
</LenisProvider>
```

### 2. Programmatic Scrolling

Use the `useLenisScroll` hook for smooth scrolling:

```tsx
import { useLenisScroll } from '@/hooks/useLenisScroll';

function MyComponent() {
    const { scrollTo, scrollToTop, scrollToElement } = useLenisScroll();
    
    return (
        <button onClick={() => scrollTo('#section', { duration: 1.5 })}>
            Scroll to Section
        </button>
    );
}
```

### 3. Anchor Links

Use the `LenisAnchor` component for smooth anchor navigation:

```tsx
import LenisAnchor from '@/components/LenisAnchor';

<LenisAnchor href="#about" offset={20}>
    About Us
</LenisAnchor>
```

## Configuration

### LenisProvider Options

You can customize Lenis behavior by passing options to `LenisProvider`:

```tsx
<LenisProvider options={{
    duration: 1.5,
    easing: (t) => t, // Linear easing
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1,
    touchMultiplier: 1,
    autoResize: true,
    overscroll: false,
    anchors: true
}}>
    {children}
</LenisProvider>
```

### Available Options

- **duration**: Scroll animation duration (default: 1.2)
- **easing**: Easing function for scroll animations (default: smooth exponential)
- **orientation**: Scroll direction ('vertical' | 'horizontal')
- **gestureOrientation**: Gesture direction ('vertical' | 'horizontal')
- **smoothWheel**: Enable smooth wheel scrolling (default: true)
- **smoothTouch**: Enable smooth touch scrolling (default: false)
- **wheelMultiplier**: Mouse wheel sensitivity multiplier (default: 1)
- **touchMultiplier**: Touch gesture sensitivity multiplier (default: 1)
- **autoResize**: Automatically resize on content changes (default: true)
- **overscroll**: Enable overscroll effects (default: false)
- **anchors**: Enable anchor link scrolling (default: true)

## Hooks

### useLenisScroll

Main hook for controlling Lenis programmatically:

```tsx
const {
    lenis,           // Raw Lenis instance
    isReady,         // Boolean indicating if Lenis is ready
    scrollTo,        // Scroll to any target
    scrollToTop,     // Scroll to top
    scrollToElement, // Scroll to element by selector
    scrollToId,      // Scroll to element by ID
    start,           // Start Lenis
    stop,            // Stop Lenis
    addScrollListener, // Add scroll event listener
    isLenisAvailable // Check if Lenis is available
} = useLenisScroll();
```

### useLenisPrevent

Prevent smooth scrolling on specific elements:

```tsx
import { useLenisPrevent } from '@/hooks/useLenisScroll';

function MyComponent() {
    useLenisPrevent('#my-scrollable-element', 'all'); // Prevent all smooth scrolling
    useLenisPrevent('#my-scrollable-element', 'wheel'); // Prevent only wheel
    useLenisPrevent('#my-scrollable-element', 'touch'); // Prevent only touch
    
    return <div id="my-scrollable-element">...</div>;
}
```

## Preventing Smooth Scrolling

### Method 1: Data Attributes

Add data attributes to elements where you want to prevent smooth scrolling:

```html
<!-- Prevent all smooth scrolling -->
<div data-lenis-prevent>...</div>

<!-- Prevent only wheel events -->
<div data-lenis-prevent-wheel>...</div>

<!-- Prevent only touch events -->
<div data-lenis-prevent-touch>...</div>
```

### Method 2: CSS Classes

Elements with `overflow: auto` or `overflow: scroll` are automatically detected and prevented.

### Method 3: Programmatic

Use the `prevent` option in Lenis configuration:

```tsx
<LenisProvider options={{
    prevent: (node) => {
        // Custom logic to prevent smooth scrolling
        return node.classList.contains('no-smooth-scroll');
    }
}}>
    {children}
</LenisProvider>
```

## Best Practices

### 1. Performance Optimization

- Use `autoResize: true` to automatically handle content changes
- Set `smoothTouch: false` on mobile for better performance
- Use `overscroll: false` unless you need overscroll effects

### 2. Accessibility

- Always provide fallback native scrolling when Lenis isn't ready
- Use semantic HTML for anchor links
- Consider users who prefer reduced motion

### 3. Scroll Events

Listen to scroll events using the custom events dispatched by our implementation:

```tsx
useEffect(() => {
    const handleScroll = (e: CustomEvent) => {
        console.log('Scroll position:', e.detail);
    };
    
    window.addEventListener('lenis:scroll', handleScroll as EventListener);
    
    return () => {
        window.removeEventListener('lenis:scroll', handleScroll as EventListener);
    };
}, []);
```

### 4. Anchor Links

- Use `LenisAnchor` component for consistent behavior
- Set appropriate `offset` values for fixed headers
- Always include `href` attributes for accessibility

## Troubleshooting

### Common Issues

1. **Scroll not working**: Check if Lenis is ready using `isReady` flag
2. **Jumpy behavior**: Ensure proper CSS reset and viewport settings
3. **Performance issues**: Disable smooth scrolling on heavy elements
4. **Mobile issues**: Set `smoothTouch: false` for better mobile performance

### Debug Mode

Enable debug logging:

```tsx
<LenisProvider options={{
    // Add debug options
    onScroll: (e) => console.log('Scroll:', e),
    onResize: () => console.log('Resize')
}}>
    {children}
</LenisProvider>
```

## Examples

### Smooth Navigation

```tsx
function Navigation() {
    const { scrollToElement } = useLenisScroll();
    
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
                    onClick={() => scrollToElement(`#${item.id}`, 0, { duration: 1.2 })}
                >
                    {item.label}
                </button>
            ))}
        </nav>
    );
}
```

### Scroll Progress Indicator

```tsx
function ScrollProgress() {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
        const handleScroll = (e: CustomEvent) => {
            const { scroll, limit } = e.detail;
            setProgress((scroll / limit) * 100);
        };
        
        window.addEventListener('lenis:scroll', handleScroll as EventListener);
        
        return () => {
            window.removeEventListener('lenis:scroll', handleScroll as EventListener);
        };
    }, []);
    
    return (
        <div className="progress-bar">
            <div style={{ width: `${progress}%` }} />
        </div>
    );
}
```

## Migration from Native Scrolling

If you have existing anchor links, replace them with `LenisAnchor`:

```tsx
// Before
<a href="#section">Go to Section</a>

// After
<LenisAnchor href="#section">Go to Section</LenisAnchor>
```

For programmatic scrolling:

```tsx
// Before
window.scrollTo({ top: 500, behavior: 'smooth' });

// After
const { scrollTo } = useLenisScroll();
scrollTo(500, { duration: 1.2 });
```

## Browser Support

Lenis supports all modern browsers including:

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

For older browsers, Lenis automatically falls back to native scrolling.
