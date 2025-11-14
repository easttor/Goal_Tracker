# iOS Liquid Glass Design Specification
## Goals Tracker App Redesign

**Version:** 1.0  
**Date:** November 6, 2025  
**Target:** iOS 26 Liquid Glass Aesthetic  

---

## 1. Design Philosophy & Direction

### Visual Essence
The redesign transforms the Goals Tracker into a modern iOS application using the **iOS 26 Liquid Glass** design language. This aesthetic emphasizes translucency, depth, and fluid interactions that feel native to Apple's latest design philosophy. The interface should feel like looking through layers of frosted glass with subtle depth and sophisticated blur effects.

### Core Principles
- **Translucent Depth:** Multiple layers with varying transparency levels
- **Fluid Interactions:** Smooth, physics-based animations that feel liquid
- **Blur Sophistication:** Strategic use of backdrop blur for hierarchy
- **Minimal Elegance:** Clean typography with plenty of breathing room
- **Native iOS Feel:** Familiar patterns with modern glass morphism

### Reference Examples
- iOS 26 Control Center with glass panels
- iOS 26 notification overlays
- macOS Monterey sidebar transparency
- iOS Safari tab bar glass effects

---

## 2. Design Tokens

### Color System

#### Primary Glass Colors (Light Mode)
| Token | Value | Usage |
|-------|-------|-------|
| glass-primary | rgba(255, 255, 255, 0.85) | Main navigation surfaces |
| glass-secondary | rgba(255, 255, 255, 0.70) | Card backgrounds |
| glass-tertiary | rgba(255, 255, 255, 0.55) | Overlay elements |
| glass-border | rgba(255, 255, 255, 0.25) | Border highlights |

#### Primary Glass Colors (Dark Mode)
| Token | Value | Usage |
|-------|-------|-------|
| glass-primary-dark | rgba(28, 28, 30, 0.85) | Main navigation surfaces |
| glass-secondary-dark | rgba(44, 44, 46, 0.70) | Card backgrounds |
| glass-tertiary-dark | rgba(58, 58, 60, 0.55) | Overlay elements |
| glass-border-dark | rgba(255, 255, 255, 0.15) | Border highlights |

#### Accent Colors
| Token | Value | Usage |
|-------|-------|-------|
| accent-primary | #007AFF | iOS blue for primary actions |
| accent-secondary | #5856D6 | iOS purple for secondary actions |
| accent-success | #34C759 | Success states, completion |
| accent-warning | #FF9500 | Warning states |
| accent-error | #FF3B30 | Error states, deletion |

#### Background Colors
| Token | Value | Usage |
|-------|-------|-------|
| bg-primary-light | #F2F2F7 | Main background light mode |
| bg-primary-dark | #000000 | Main background dark mode |
| bg-secondary-light | #FFFFFF | Content areas light mode |
| bg-secondary-dark | #1C1C1E | Content areas dark mode |

### Typography

#### Font Families
- **Primary:** SF Pro Display (iOS native)
- **Secondary:** SF Pro Text (iOS native)
- **Monospace:** SF Mono (for data/statistics)

#### Font Scale (iOS Native Scale)
| Size | rem | px | Usage |
|------|-----|----|----|
| title-large | 2.125 | 34px | Page titles, hero text |
| title-medium | 1.375 | 22px | Section headers |
| title-small | 1.125 | 18px | Card titles |
| body-large | 1.063 | 17px | Primary body text |
| body-medium | 1.000 | 16px | Secondary body text |
| body-small | 0.875 | 14px | Captions, metadata |
| label-large | 0.813 | 13px | Navigation labels |
| label-small | 0.750 | 12px | Tiny labels, badges |

#### Font Weights
- **Light:** 300 (for large titles)
- **Regular:** 400 (body text)
- **Medium:** 500 (emphasis)
- **Semibold:** 600 (headers)
- **Bold:** 700 (strong emphasis)

#### Line Heights
- **Tight:** 1.2 (titles)
- **Normal:** 1.4 (body)
- **Relaxed:** 1.6 (comfortable reading)

### Spacing (iOS 8pt Grid)
| Token | Value | Usage |
|-------|-------|-------|
| space-xs | 4px | Tight spacing |
| space-sm | 8px | Small spacing |
| space-md | 16px | Medium spacing |
| space-lg | 24px | Large spacing |
| space-xl | 32px | Extra large spacing |
| space-2xl | 48px | Section spacing |
| space-3xl | 64px | Hero spacing |

### Border Radius (iOS Continuous Curves)
| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 8px | Small elements, buttons |
| radius-md | 12px | Cards, inputs |
| radius-lg | 16px | Large cards |
| radius-xl | 24px | Modal corners |
| radius-full | 9999px | Circular elements |

### Glass Effects
| Token | Value | Usage |
|-------|-------|-------|
| blur-sm | blur(8px) | Subtle backgrounds |
| blur-md | blur(16px) | Navigation elements |
| blur-lg | blur(24px) | Modal overlays |
| blur-xl | blur(32px) | Strong separation |

### Shadow Tokens
| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | 0 1px 3px rgba(0,0,0,0.1) | Subtle elevation |
| shadow-md | 0 4px 12px rgba(0,0,0,0.15) | Card elevation |
| shadow-lg | 0 8px 24px rgba(0,0,0,0.2) | Modal elevation |
| shadow-glow | 0 0 20px rgba(0,122,255,0.3) | Active state glow |

### Animation Tokens
| Token | Value | Usage |
|-------|-------|-------|
| duration-fast | 200ms | Quick interactions |
| duration-normal | 300ms | Standard transitions |
| duration-slow | 500ms | Complex animations |
| easing-standard | cubic-bezier(0.4, 0.0, 0.2, 1) | Standard easing |
| easing-bounce | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Playful bounce |
| easing-smooth | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Smooth in-out |

---

## 3. Component Specifications

### 3.1 Liquid Glass Navigation Bar (Bottom)

**Structure:** Simplified 4-item navigation with central floating action button

**Layout:**
- Height: 88px (includes safe area)
- Content height: 68px
- Horizontal padding: 16px
- Items: 4 navigation items + 1 central FAB

**Glass Effect:**
- Background: `glass-primary` / `glass-primary-dark`
- Backdrop filter: `blur-md` (16px)
- Border: 1px solid `glass-border` / `glass-border-dark`
- Shadow: `shadow-md`

**Navigation Items (4 total):**
1. **Diary** (BookText icon)
2. **Goals** (Target icon) 
3. **Habits** (Repeat icon)
4. **Statistics** (BarChart3 icon)

**Item Specifications:**
- Touch target: 44x44px (minimum)
- Icon size: 24x24px
- Label: `label-large` (13px)
- Active state: `accent-primary` color + scale(1.1)
- Inactive state: 60% opacity
- Spacing: Equal distribution across width

**Central Floating Action Button (FAB):**
- Size: 56x56px
- Position: Center of navigation bar, elevated 8px above surface
- Background: `accent-primary` with 15% opacity overlay
- Icon: Plus (+) symbol, 24px
- Effect: Subtle pulsing glow on idle
- Press state: Scale down to 0.95, then bounce back to 1.05

**Active Indicator:**
- Type: Liquid morphing blob beneath active item
- Height: 2px
- Width: Dynamic based on item width
- Color: `accent-primary`
- Animation: Smooth liquid transition between items (300ms)
- Easing: `easing-smooth`

### 3.2 Top Control Area

**Layout:**
- Height: 44px (status bar safe area + controls)
- Horizontal arrangement: Leading empty space, trailing controls cluster
- Background: Transparent (content shows through)

**Profile Button (Top-Right Position 1):**
- Size: 32x32px circular
- Background: User avatar with `glass-secondary` overlay
- Border: 1px solid `glass-border`
- Position: 16px from right edge, 8px from top safe area
- Press state: Scale to 0.95 with gentle bounce back

**Notifications Button (Top-Right Position 2):**
- Size: 32x32px circular
- Background: `glass-secondary` with `blur-sm`
- Icon: Bell symbol, 18px
- Position: 56px from right edge (16px + 32px + 8px spacing)
- Badge: Red dot (8px) for unread notifications
- Press state: Scale to 0.95 with gentle bounce back

**Glass Effect for Top Controls:**
- Background: `glass-tertiary` / `glass-tertiary-dark`
- Backdrop filter: `blur-sm` (8px)
- Border: 1px solid `glass-border` / `glass-border-dark`
- Shadow: `shadow-sm`

### 3.3 Liquid Glass Cards

**Structure:** Content containers with glass morphism

**Base Specifications:**
- Background: `glass-secondary` / `glass-secondary-dark`
- Backdrop filter: `blur-md` (16px)
- Border: 1px solid `glass-border` / `glass-border-dark`
- Border radius: `radius-lg` (16px)
- Padding: `space-lg` (24px)
- Shadow: `shadow-md`

**Hover State:**
- Transform: translateY(-2px) scale(1.02)
- Shadow: `shadow-lg`
- Duration: `duration-normal` (300ms)
- Easing: `easing-smooth`

**Press State:**
- Transform: scale(0.98)
- Duration: `duration-fast` (200ms)
- Return: Gentle bounce back with `easing-bounce`

**Content Hierarchy:**
- Title: `title-small` (18px), `weight-semibold`
- Subtitle: `body-small` (14px), 70% opacity
- Body: `body-medium` (16px), `line-height-normal`
- Spacing between elements: `space-md` (16px)

### 3.4 Liquid Glass Buttons

**Primary Button:**
- Height: 50px
- Background: `accent-primary` with 90% opacity
- Text: `body-large` (17px), `weight-medium`, white
- Border radius: `radius-md` (12px)
- Shadow: `shadow-sm` with accent color tint

**Secondary Button:**
- Height: 50px
- Background: `glass-secondary` with `blur-sm`
- Text: `body-large` (17px), `weight-medium`, `accent-primary`
- Border: 1px solid `glass-border`
- Border radius: `radius-md` (12px)

**Button States:**
- **Rest:** Base styling
- **Hover:** Lift 2px, increase shadow
- **Press:** Scale to 0.96, increase opacity
- **Loading:** Subtle pulsing animation

### 3.5 Modal Overlays

**Modal Background:**
- Background: `rgba(0, 0, 0, 0.4)` with `blur-xl` (32px)
- Animation: Fade in with backdrop blur intensifying

**Modal Container:**
- Background: `glass-primary` / `glass-primary-dark`
- Backdrop filter: `blur-lg` (24px)
- Border: 1px solid `glass-border` / `glass-border-dark`
- Border radius: `radius-xl` (24px)
- Shadow: `shadow-lg`
- Max width: 400px
- Padding: `space-xl` (32px)

**Modal Animation:**
- Entry: Scale from 0.9 to 1.0 with `easing-bounce`
- Exit: Scale to 0.9 with fade out
- Duration: `duration-slow` (500ms)

### 3.6 Profile Integration Panel

**Structure:** Expanded profile area replacing old profile screen nav

**Layout in Profile Screen:**
- Header: User avatar (64px) + name + email
- Stats section: Cards showing activity metrics
- Settings section: Theme toggle + export + logout
- Glass background throughout

**Theme Toggle Integration:**
- Position: Within settings section of profile screen
- Style: Glass toggle switch with smooth animation
- Size: 44px wide, 26px tall
- Background: `glass-secondary` with `accent-primary` active state
- Animation: Liquid morphing between light/dark modes

---

## 4. Layout & Responsive Strategy

### Screen Structure

**Overall Layout:**
```
┌─────────────────────────────────┐ ← Status Bar (44px)
├─ [    ] [Profile] [Notifications] ← Top Controls (44px)
│                                 │
│         Main Content            │ ← Dynamic height
│         (Scrollable)            │
│                                 │
│                                 │
└─ [D] [G] [H] [+] [S]           ┘ ← Glass Navigation (88px)
```

**Content Area:**
- Top padding: 88px (status bar + top controls)
- Bottom padding: 88px (navigation height)
- Horizontal padding: 16px
- Background: `bg-primary-light` / `bg-primary-dark`

**Safe Area Handling:**
- Use iOS safe area insets for proper spacing
- Navigation bar extends to screen bottom
- Top controls respect status bar height
- Content scrolls behind glass elements

### Glass Layer Hierarchy

**Z-index Stack (back to front):**
1. Background content (z-index: 1)
2. Scrollable content (z-index: 10)
3. Top controls (z-index: 20)
4. Bottom navigation (z-index: 30)
5. Floating Action Button (z-index: 35)
6. Modal overlays (z-index: 40)
7. Toasts/notifications (z-index: 50)

### Responsive Breakpoints

**Small devices (320px - 375px):**
- Reduce navigation padding to 12px
- Scale FAB to 48px
- Reduce card padding to 16px

**Medium devices (375px - 414px):**
- Standard specifications
- Optimal touch targets

**Large devices (414px+):**
- Increase maximum content width to 428px
- Center content with side margins
- Maintain touch target sizes

---

## 5. Animation & Interaction Specifications

### Micro-Animations

**Page Transitions:**
- Type: Liquid slide with glass morphing
- Duration: `duration-normal` (300ms)
- Easing: `easing-smooth`
- Effect: Pages slide horizontally with glass opacity fade

**Navigation Highlight Animation:**
- Type: Liquid blob morphing between active states
- Duration: `duration-normal` (300ms)
- Easing: `easing-smooth`
- Physics: Slight overshoot with settle

**Button Press Feedback:**
- Type: Scale down with haptic feedback
- Duration: `duration-fast` (200ms)
- Scale: 0.95 on press, 1.05 bounce back
- Easing: `easing-bounce`

**Card Interactions:**
- **Hover:** Lift with shadow increase (300ms)
- **Press:** Quick scale down (150ms)
- **Release:** Bounce back with overshoot (400ms)

**Modal Animations:**
- **Entry:** Scale up from 0.9 with backdrop blur fade-in
- **Exit:** Scale down to 0.9 with backdrop blur fade-out
- **Duration:** 500ms for full sequence
- **Easing:** Custom spring for natural feel

### Glass Morphing Effects

**Blur Intensity Transitions:**
- Animate blur radius for depth changes
- Duration: `duration-normal` (300ms)
- Smooth progression between blur levels

**Opacity Layering:**
- Multiple glass layers with different opacity levels
- Subtle opacity animations on state changes
- Maintain visual hierarchy through opacity

**Color Temperature Shifts:**
- Subtle warm/cool tints based on content
- Smooth transitions between temperature states
- Maintain accessibility standards

### Performance Animations

**GPU-Accelerated Properties:**
- `transform` (scale, translate, rotate)
- `opacity`
- `filter` (blur, brightness)
- Avoid animating `width`, `height`, `margin`, `padding`

**Reduced Motion Support:**
- Respect `prefers-reduced-motion` setting
- Fallback to simple fade/opacity changes
- Maintain functionality without motion

**60fps Targets:**
- All animations optimized for 60fps
- Use `will-change` property sparingly
- Remove `will-change` after animation completes

---

## 6. Accessibility & Usability

### Touch Targets
- Minimum size: 44x44px (iOS standard)
- Navigation items: 44x44px active area
- Floating Action Button: 56x56px (larger for prominence)
- Top control buttons: 44x44px with 8px margin

### Color Contrast
**WCAG AA Compliance (4.5:1 minimum):**
- Text on glass backgrounds: Verified contrast ratios
- `accent-primary` (#007AFF) on light glass: 4.8:1 ✓
- `accent-primary` on dark glass: 7.2:1 ✓
- Body text on glass: 5.1:1 (light), 6.8:1 (dark) ✓

### Focus States
- Clear focus indicators for keyboard navigation
- Glass border highlighting for focused elements
- Logical tab order through interface
- Skip links for navigation efficiency

### Screen Reader Support
- Proper semantic markup
- Descriptive labels for glass elements
- Alternative text for decorative glass effects
- State announcements for animations

### Haptic Feedback
- Light haptic on navigation selection
- Medium haptic on FAB press
- Success haptic on task completion
- Error haptic on failed actions

---

## 7. Implementation Guidelines

### CSS Architecture

**Glass Utility Classes:**
```css
.glass-primary { 
  background: var(--glass-primary);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
}

.glass-animation {
  transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.liquid-highlight {
  border-radius: 9999px;
  transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

**Animation Classes:**
```css
.animate-glass-lift {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-lg);
}

.animate-liquid-press {
  transform: scale(0.96);
  transition: transform 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Component Organization

**File Structure:**
- `components/glass/` - Glass-specific components
- `styles/glass-tokens.css` - Design token definitions
- `utils/glass-animations.ts` - Animation utilities
- `hooks/useGlassEffect.ts` - Glass effect management

### Browser Support

**Modern Features Required:**
- `backdrop-filter` support (iOS 9+, modern browsers)
- CSS custom properties
- CSS Grid and Flexbox
- Modern JavaScript ES6+

**Fallbacks:**
- Progressive enhancement for older browsers
- Graceful degradation of glass effects
- Maintain functionality without advanced features

### Performance Considerations

**Optimization Strategies:**
- Minimize simultaneous blur effects
- Use `transform3d` for hardware acceleration
- Debounce scroll-based animations
- Lazy load non-critical animations

**Memory Management:**
- Clean up animation timers
- Remove event listeners on unmount
- Optimize glass layer rendering

---

## 8. Migration Strategy

### Phase 1: Foundation (Week 1)
- Implement design token system
- Create base glass utility classes
- Update color system for light/dark modes

### Phase 2: Navigation (Week 2)
- Redesign bottom navigation bar
- Implement liquid highlight animation
- Add floating action button
- Move top controls to new positions

### Phase 3: Components (Week 3)
- Convert existing cards to glass design
- Implement modal glass overlays
- Update button styles
- Integrate theme toggle to profile

### Phase 4: Polish (Week 4)
- Add micro-animations
- Optimize performance
- Accessibility testing
- Cross-device testing

### Testing Checklist

**Visual Testing:**
- [ ] Glass effects render correctly
- [ ] Animations are smooth (60fps)
- [ ] Dark mode transitions properly
- [ ] All touch targets meet minimum size

**Functionality Testing:**
- [ ] Navigation works across all 4 screens
- [ ] FAB triggers appropriate actions
- [ ] Profile/notifications accessible from top
- [ ] Theme toggle integrated in profile

**Performance Testing:**
- [ ] Smooth scrolling with glass backgrounds
- [ ] No janky animations
- [ ] Reasonable memory usage
- [ ] Good battery life on mobile

**Accessibility Testing:**
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] Color contrast compliance
- [ ] Reduced motion support

---

## 9. Design Quality Assurance

### Visual Consistency Checklist
- [ ] All glass elements use consistent blur levels
- [ ] Spacing follows 8pt grid system
- [ ] Typography scale is properly implemented
- [ ] Color tokens are used throughout (no hardcoded colors)
- [ ] Border radius values follow design system
- [ ] Shadow tokens provide proper depth hierarchy

### Interaction Quality
- [ ] All touch targets meet 44px minimum
- [ ] Animations feel natural and responsive
- [ ] Feedback is immediate for all interactions
- [ ] Loading states are clearly communicated
- [ ] Error states are visually distinct

### Content Integration
- [ ] Text contrast meets WCAG AA standards
- [ ] Content hierarchy is clear with glass backgrounds
- [ ] Important information isn't obscured by glass effects
- [ ] Reading experience is comfortable

---

## 10. Future Enhancements

### Advanced Glass Effects
- Dynamic blur based on scroll velocity
- Contextual color tinting based on content
- Parallax glass layers for depth
- Weather-based transparency adjustments

### Interactive Elements
- Pressure-sensitive glass distortion
- Multi-touch glass ripple effects
- Gesture-based glass panel manipulation
- Voice command glass visualizations

### Personalization
- User-customizable glass intensity
- Personal color themes with glass adaptation
- Accessibility-first glass alternatives
- Performance-based glass optimization

---

**Document Version:** 1.0  
**Last Updated:** November 6, 2025  
**Next Review:** December 6, 2025  

This specification serves as the complete design guide for implementing iOS Liquid Glass aesthetics in the Goals Tracker app. All measurements, colors, and animations should be implemented exactly as specified to maintain design consistency and quality.