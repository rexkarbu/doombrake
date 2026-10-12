# DoomBrake Design Direction

## Product Identity & Core Purpose
DoomBrake is a targeted digital wellbeing and anti-doomscrolling intervention app for Android. It detects active scrolling in Instagram Reels and TikTok, presents a floating real-time Doom-Timer overlay, and applies staged friction (soft nudge to full-screen interruption) to break the dopamine loop.

## Dials
- ENERGY: 2 (Balanced: respectful of focus, resolute during intervention)
- RHYTHM: 2 (Structured, scannable dashboard, clear hierarchy)
- MOTION: 2 (Purposeful transitions: timer pulse, modal entrance, tab shifts)

## Color Palette
### Dark Theme (Primary for late-night scrolling context)
- Primary Background: `#0B0F17` (Deep Obsidian)
- Card & Surface: `#161F30` (Midnight Slate)
- Elevated Surface: `#1E293B` (Border & Container)
- Primary Text: `#F1F5F9` (High Contrast White)
- Secondary/Muted Text: `#94A3B8` (Slate Grey)
- Border Color: `#334155` (Subtle boundary)

### Light Theme
- Primary Background: `#F8FAFC` (Clean Porcelain)
- Card & Surface: `#FFFFFF` (Pure White)
- Elevated Surface: `#F1F5F9` (Soft Grey)
- Primary Text: `#0F172A` (Deep Slate)
- Secondary/Muted Text: `#64748B` (Medium Slate)
- Border Color: `#E2E8F0` (Crisp line)

### Intervention Threshold Palette
- Stage 1 (Safe, 0 to 15m): `#10B981` (Emerald)
- Stage 2 (Warning, 15m to 30m): `#F59E0B` (Amber)
- Stage 3 (Critical / Interruption, >30m): `#EF4444` (Crimson)
- Focus Brand Accent: `#6366F1` (Indigo)

## Typography
- Headings: System Sans-Serif (Inter / Roboto font family) with 600/700 weight.
- Numbers & Timers: Monospace / Tabular numbers for live seconds counting to avoid jitter.
- Body: 14px to 16px with line-height 1.5 for readability.

## Component Principles
- Floating Doom-Timer: Compact pill or badge (draggable), minimal visual obstruction, clear elapsed minutes and seconds.
- Interactive Elements: Minimum 44x44px touch target for thumb ergonomics.
- Interruption Modal: Full-screen modal with high visual contrast and distinct action buttons ("Take a Break" vs "Continue with 5m Extension").
