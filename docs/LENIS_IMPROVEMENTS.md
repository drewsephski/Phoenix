# Lenis Smooth Scroll Improvements

This document summarizes the improvements made to the Lenis smooth scroll integration in the Aura project.

## Overview

The Lenis integration has been significantly enhanced to provide a more robust, performant, and developer-friendly smooth scrolling experience throughout the application.

## What Was Improved

### 1. Enhanced LenisProvider (`components/LenisProvider.tsx`)

**Before:**

- Basic configuration with limited options
- Manual animation loop management
- Global window attachment without proper cleanup
- No TypeScript interfaces for configuration

**After:**

- Comprehensive configuration with all Lenis options
- Optimized animation loop with proper cleanup
- Better TypeScript support with proper interfaces
- Custom event dispatching for better component integration
- Improved CSS-in-JS styles for better browser compatibility
- Proper error handling and fallbacks

**Key Improvements:**

- Added `autoResize`, `overscroll`, `anchors` options
- Implemented custom event system (`lenis:scroll`, `lenis:resize`, `lenis:complete`)
- Better prevention logic for nested scrollable elements
- Enhanced cleanup on component unmount

### 2. New useLenisScroll Hook (`hooks/useLenisScroll.ts`)

**New Feature:**

- Comprehensive hook for programmatic Lenis control
- Better TypeScript support with proper interfaces
- Fallback to native scrolling when Lenis isn't ready
- Multiple scroll utility functions

**Features:**

- `scrollTo()`: Scroll to any target (number, string, element)
- `scrollToTop()`: Scroll to top with options
- `scrollToElement()`: Scroll to element by selector
- `scrollToId()`: Scroll to element by ID
- `start()`/`stop()`: Control Lenis state
- `addScrollListener()`: Add scroll event listeners
- `isLenisAvailable()`: Check if Lenis is ready

### 3. LenisAnchor Component (`components/LenisAnchor.tsx`)

**New Feature:**

- Dedicated component for smooth anchor link navigation
- Automatic anchor link handling
- Configurable offset support
- Proper event delegation

**Benefits:**

- Consistent anchor link behavior across the app
- Easy to use with familiar `<a>` tag API
- Built-in fallback to native scrolling
- Offset support for fixed headers

### 4. SmoothNavigation Component (`components/SmoothNavigation.tsx`)

**New Feature:**

- Navigation component with active section detection
- Intersection Observer integration
- Smooth scrolling navigation items
- Active state management

**Features:**

- Automatic active section detection
- Configurable offset and styling
- Smooth scroll navigation items
- Accessibility support with proper ARIA labels

### 5. Comprehensive Documentation (`docs/LENIS_GUIDE.md`)

**New Feature:**

- Complete guide for using Lenis in the project
- Best practices and troubleshooting
- Migration examples from native scrolling
- Performance optimization tips

## Usage Examples

### Basic Programmatic Scrolling

```tsx
import { useLenisScroll } from '@/hooks/useLenisScroll';

function MyComponent() {
    const { scrollTo, scrollToTop } = useLenisScroll();
    
    return (
        <div>
            <button onClick={() => scrollTo('#section', { duration: 1.5 })}>
                Scroll to Section
            </button>
            <button onClick={() => scrollToTop()}>
                Back to Top
            </button>
        </div>
    );
}
```

### Anchor Links

```tsx
import { LenisAnchor } from '@/components/LenisAnchor';

function Navigation() {
    return (
        <nav>
            <LenisAnchor href="#home" offset={20}>
                Home
            </LenisAnchor>
            <LenisAnchor href="#about" offset={20}>
                About
            </LenisAnchor>
        </nav>
    );
}
```

### Smooth Navigation with Active States

```tsx
import SmoothNavigation from '@/components/SmoothNavigation';

function App() {
    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'contact', label: 'Contact' }
    ];
    
    return (
        <div>
            <SmoothNavigation items={navItems} offset={80} />
            <section id="home">...</section>
            <section id="about">...</section>
            <section id="contact">...</section>
        </div>
    );
}
```

## Configuration Options

The LenisProvider now supports comprehensive configuration:

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

## Performance Improvements

1. **Better Animation Loop**: Optimized requestAnimationFrame management
2. **Auto Resize**: Automatic handling of content changes
3. **Prevention Logic**: Smart prevention of smooth scrolling on nested elements
4. **Cleanup**: Proper cleanup on component unmount to prevent memory leaks
5. **Fallbacks**: Graceful fallback to native scrolling when needed

## Browser Compatibility

- Enhanced browser support detection
- Better fallback mechanisms
- Improved mobile performance with configurable touch settings
- Support for older browsers with native scroll fallback

## Migration Guide

### From Window.__lenis

**Before:**

```tsx
// @ts-expect-error
if (window.__lenis) {
    // @ts-expect-error
    window.__lenis.scrollTo(0, { duration: 1.2 });
}
```

**After:**

```tsx
const { scrollToTop, isLenisAvailable } = useLenisScroll();

if (isLenisAvailable()) {
    scrollToTop({ duration: 1.2 });
}
```

### From Native Anchor Links

**Before:**

```html
<a href="#section">Go to Section</a>
```

**After:**

```tsx
<LenisAnchor href="#section">Go to Section</LenisAnchor>
```

## Benefits

1. **Better Developer Experience**: Comprehensive hooks and components
2. **Improved Performance**: Optimized configuration and cleanup
3. **Enhanced UX**: Smoother scrolling with better fallbacks
4. **Better Maintainability**: Well-documented and typed code
5. **Accessibility**: Proper ARIA support and semantic HTML
6. **Flexibility**: Highly configurable with sensible defaults

## Next Steps

1. Review the [Lenis Guide](./LENIS_GUIDE.md) for detailed usage instructions
2. Implement the new components in your pages
3. Configure LenisProvider options based on your needs
4. Test the smooth scrolling experience across different devices
5. Consider adding custom scroll animations using the scroll events

## Troubleshooting

Refer to the [Lenis Guide](./LENIS_GUIDE.md) for common issues and solutions, including:

- Scroll not working
- Jumpy behavior
- Performance issues
- Mobile-specific problems
- Debug mode activation
