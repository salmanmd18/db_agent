# Design Guidelines: Dobbs Tire & Auto Centers AI Chat Widget

## Design Approach
**Utility-Focused Chat Interface**: This is an embeddable service widget requiring clarity, trust, and efficiency. Drawing inspiration from modern chat interfaces like Intercom and Drift while maintaining Dobbs' automotive service brand identity.

## Brand Colors (Specified)
- Primary: Red #C8102E
- Black: #000000  
- White: #FFFFFF
- Add: Gray #F3F4F6 (light backgrounds), #6B7280 (secondary text)

## Core Design Elements

### A. Typography
- **Primary Font**: Inter or similar sans-serif via Google Fonts
- **Chat Messages**: 14px regular weight for readability
- **Widget Header**: 16px semi-bold
- **Input Field**: 14px regular
- **Button Text**: 14px medium weight

### B. Layout System
- **Spacing Units**: Tailwind units of 2, 3, 4, 6, 8 (p-4, m-3, gap-6, etc.)
- **Widget Dimensions**: 380px width × 600px height on desktop, full-screen on mobile
- **Message Padding**: p-3 for chat bubbles
- **Widget Padding**: p-4 for container sections

### C. Component Library

**Chat Widget Container**
- Fixed bottom-right position (16px from bottom/right on desktop)
- Rounded corners (rounded-2xl for modern feel)
- Drop shadow for elevation (shadow-2xl)
- White background with subtle border

**Widget Header**
- Red (#C8102E) background
- White text with Dobbs branding
- Minimize/close controls (white icons)
- Height: h-16

**Message Bubbles**
- User messages: Right-aligned, red background (#C8102E), white text, rounded-2xl (sharp corner bottom-right)
- Bot messages: Left-aligned, light gray background (#F3F4F6), black text, rounded-2xl (sharp corner bottom-left)
- Max width: 80% of chat width
- Vertical spacing: space-y-3

**Input Area**
- White background with border
- Text input with placeholder
- Microphone icon button (right side) - black when inactive, red when active/recording
- Send button with red background, white icon
- Height: h-14, padding p-3

**Voice Indicator**
- Pulsing red dot or waveform animation when recording
- "Listening..." text in gray

**Appointment Form (Modal/Inline)**
- Overlay or slides up within chat
- Form fields: Name, Location dropdown, Service type dropdown, Date/Time pickers
- Submit button: Red background, white text
- Cancel/Back: Text link in gray

**Floating Action Button (Minimized State)**
- Circular red button with white chat icon
- 60px diameter
- Pulsing animation on first load
- Shadow-lg for prominence

**Typing Indicator**
- Three animated dots in gray
- Left-aligned like bot messages

### D. Interaction States
- **Hover**: Subtle opacity change (opacity-90) on buttons
- **Active/Focus**: Red outline (ring-2 ring-red-600) on inputs
- **Disabled**: Opacity-50 with cursor-not-allowed
- **Error**: Red border on form validation failures

## Mobile Responsiveness
- **<768px**: Full-screen takeover (w-full h-full), slide-up animation
- **≥768px**: Fixed widget size, bottom-right positioning
- Touch-friendly tap targets (min 44px height for buttons)

## Accessibility
- ARIA labels for icon buttons
- Focus management for keyboard navigation
- Color contrast ratios meet WCAG AA standards
- Screen reader announcements for bot responses

## Visual Hierarchy
1. Red primary actions stand out against white/gray interface
2. User messages visually separated from bot responses through color/alignment
3. Widget header anchors the interface with strong brand presence
4. Input area clearly defined as action zone

## No Images Required
This is a functional chat widget - no hero images or decorative photography needed. Icon-based UI only (microphone, send, minimize/close icons from Heroicons).