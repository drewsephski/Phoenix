# Lenis Smooth Scroll with Momentum - Implementation Guide

This guide explains the simplified and optimized Lenis smooth scroll implementation with momentum effects for the Aura project.

## Overview

The Lenis integration has been simplified and optimized to provide smooth, momentum-based scrolling with proper fallbacks. The implementation focuses on performance and ease of use.

## Key Features

- **Momentum-based scrolling**: Smooth, natural scrolling with inertia
- **Simplified configuration**: Easy to understand and modify
- **Proper fallbacks**: Graceful degradation to native scrolling
- **TypeScript support**: Full type safety with proper declarations
- **Performance optimized**: Efficient animation loops and cleanup

## Core Implementation

### 1. LenisProvider (`components/LenisProvider.tsx`)

The main provider component with momentum-optimized settings:

```tsx
const lenis = new Lenis({
    // Core momentum settings for smooth scrolling
    lerp: 0.075,           // Lower = smoother, more momentum
    duration: 1.2,         // Scroll duration
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
    
    // Touch settings for momentum feel
    syncTouchLerp: 0.075,  // Touch lerp for momentum
    touchMultiplier: 1.2,  // Slightly more responsive
    
    // Wheel settings
    wheelMultiplier: 0.8,  // Less sensitive wheel
    
    // Basic settings
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    infinite: false,
    autoResize: true
});
```

**Key Momentum Settings:**

- `lerp: 0.075`: Creates smooth interpolation between scroll positions
- `syncTouchLerp: 0.075`: Controls touch inertia smoothness
- `touchMultiplier: 1.2`: Makes touch scrolling more responsive
- `wheelMultiplier: 0.8`: Reduces mouse wheel sensitivity for smoother control

### 2. useLenisScroll Hook (`hooks/useLenisScroll.ts`)

Simplified hook for programmatic scroll control:

```tsx
const { scrollTo, scrollToTop, isLenisAvailable } = useLenisScroll();

// Scroll to element
scrollTo('#section', { duration: 1.5 });

// Scroll to top
scrollToTop({ duration: 1.2 });

// Check if Lenis is ready
if (isLenisAvailable()) {
    // Use Lenis features
}
```

### 3. Type Definitions (`types/lenis.d.ts`)

Centralized type declarations for proper TypeScript support:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        __lenis?: any;
    }
}

export {};
```

## Usage Examples

### Basic Programmatic Scrolling

```tsx
import { useLenisScroll } from '@/hooks/useLenisScroll';

function MyComponent() {
    const { scrollTo, scrollToTop } = useLenisScroll();
    
    return (
        <div>
            <button onClick={() => scrollTo('#about', { duration: 1.5 })}>
                Go to About
            </button>
            <button onClick={() => scrollToTop({ duration: 1.2 })}>
                Back to Top
            </button>
        </div>
    );
}
```

### Navigation with Smooth Scrolling

```tsx
import { useLenisScroll } from '@/hooks/useLenisScroll';

function Navigation() {
    const { scrollTo } = useLenisScroll();
    
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
                    onClick={() => scrollTo(`#${item.id}`, { duration: 1.5 })}
                >
                    {item.label}
                </button>
            ))}
        </nav>
    );
}
```

### SmoothScrollExample Component

A complete example component demonstrating Lenis features:

```tsx
import SmoothScrollExample from '@/components/SmoothScrollExample';

function App() {
    const sections = [
        { id: 'home', title: 'Home' },
        { id: 'about', title: 'About' },
        { id: 'contact', title: 'Contact' }
    ];
    
    return <SmoothScrollExample sections={sections} />;
}
```

## Configuration Options

### Momentum Settings

- **lerp**: Controls smoothness (lower = smoother, 0.075 recommended)
- **syncTouchLerp**: Touch inertia smoothness (0.075 recommended)
- **touchMultiplier**: Touch responsiveness (1.2 for more responsive)
- **wheelMultiplier**: Wheel sensitivity (0.8 for smoother control)

### Animation Settings

- **duration**: Scroll animation duration (1.2 seconds recommended)
- **easing**: Easing function for natural movement
- **orientation**: Scroll direction ('vertical' or 'horizontal')

### Behavior Settings

- **infinite**: Enable infinite scrolling (false by default)
- **autoResize**: Auto-adjust on content changes (true by default)

## Performance Tips

1. **Use appropriate lerp values**: Too low can cause lag, too high reduces smoothness
2. **Optimize touch multipliers**: Balance responsiveness with smoothness
3. **Enable autoResize**: Automatically handles content changes
4. **Proper cleanup**: The provider handles cleanup automatically

## Troubleshooting

### Scrolling is too slow or laggy

- Increase `lerp` value (try 0.1-0.15)
- Reduce `touchMultiplier` (try 1.0-1.1)
- Check for performance bottlenecks in your components

### Scrolling is too fast or jumpy

- Decrease `lerp` value (try 0.05-0.075)
- Increase `duration` (try 1.5-2.0)
- Reduce `wheelMultiplier` (try 0.6-0.8)

### Lenis not working

- Check if `isLenisAvailable()` returns true
- Verify LenisProvider is wrapping your components
- Check browser console for errors

## Migration from Previous Implementation

### From complex hook to simplified hook

**Before:**

```tsx
const { lenis, isReady, scrollTo, scrollToTop, scrollToElement } = useLenisScroll();
```

**After:**

```tsx
const { scrollTo, scrollToTop, isLenisAvailable } = useLenisScroll();
```

### From complex configuration to simple configuration

**Before:**

```tsx
<LenisProvider options={{
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    lerp: 0.1,
    // ... many other options
}}>
```

**After:**

```tsx
<LenisProvider>
    {children}
</LenisProvider>
```

The simplified implementation focuses on the essential momentum settings while maintaining full functionality and performance.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Lenis automatically falls back to native scrolling for unsupported browsers or when JavaScript is disabled.
