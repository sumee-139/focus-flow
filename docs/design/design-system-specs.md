# FocusFlow Design System 仕様書

## 設計哲学

### Core Values
1. **Calm Technology**: 背景に徹し、ユーザーの集中を妨げない
2. **Accessibility First**: 全ユーザーにとって使いやすい
3. **Consistent Experience**: 一貫性のある体験提供
4. **Performance Optimized**: 高速で応答性の高いインターフェース

### Design Principles
- **Simplicity**: 不要な装飾を排除し、機能に集中
- **Clarity**: 明確で理解しやすい情報伝達
- **Efficiency**: 最小限の操作で目的を達成
- **Adaptability**: 様々な環境・状況に対応
- **Visual Hierarchy**: 適切なコントラストでボタンの存在を明確にする

---

## 1. Color System

### 1.1 Primary Color Palette
```css
:root {
  /* Primary - 集中を促進する落ち着いた青系 */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;  /* メインカラー */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
  
  /* Secondary - アクセントカラー（紫系） */
  --secondary-50: #faf5ff;
  --secondary-100: #f3e8ff;
  --secondary-200: #e9d5ff;
  --secondary-300: #d8b4fe;
  --secondary-400: #c084fc;
  --secondary-500: #a855f7;
  --secondary-600: #9333ea;
  --secondary-700: #7c3aed;
  --secondary-800: #6b21a8;
  --secondary-900: #581c87;
}
```

### 1.2 Neutral Color Palette
```css
:root {
  /* Neutral - グレースケール */
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db;
  --neutral-400: #9ca3af;
  --neutral-500: #6b7280;
  --neutral-600: #4b5563;
  --neutral-700: #374151;
  --neutral-800: #1f2937;
  --neutral-900: #111827;
  
  /* Pure */
  --white: #ffffff;
  --black: #000000;
}
```

### 1.3 Semantic Color Palette
```css
:root {
  /* Success - 完了・成功 */
  --success-50: #f0fdf4;
  --success-100: #dcfce7;
  --success-200: #bbf7d0;
  --success-300: #86efac;
  --success-400: #4ade80;
  --success-500: #22c55e;
  --success-600: #16a34a;
  --success-700: #15803d;
  --success-800: #166534;
  --success-900: #14532d;
  
  /* Warning - 警告・注意 */
  --warning-50: #fffbeb;
  --warning-100: #fef3c7;
  --warning-200: #fde68a;
  --warning-300: #fcd34d;
  --warning-400: #fbbf24;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  --warning-700: #b45309;
  --warning-800: #92400e;
  --warning-900: #78350f;
  
  /* Error - エラー・削除 */
  --error-50: #fef2f2;
  --error-100: #fee2e2;
  --error-200: #fecaca;
  --error-300: #fca5a5;
  --error-400: #f87171;
  --error-500: #ef4444;
  --error-600: #dc2626;
  --error-700: #b91c1c;
  --error-800: #991b1b;
  --error-900: #7f1d1d;
  
  /* Info - 情報・中性 */
  --info-50: #f0f9ff;
  --info-100: #e0f2fe;
  --info-200: #bae6fd;
  --info-300: #7dd3fc;
  --info-400: #38bdf8;
  --info-500: #0ea5e9;
  --info-600: #0284c7;
  --info-700: #0369a1;
  --info-800: #075985;
  --info-900: #0c4a6e;
}
```

### 1.4 Focus-Specific Colors
```css
:root {
  /* Focus Mode - 集中モード専用カラー */
  --focus-bg: #f8fafc;
  --focus-text: #334155;
  --focus-primary: #2563eb;
  --focus-secondary: #64748b;
  --focus-accent: #a855f7;
  
  /* Task Status Colors */
  --task-pending: var(--neutral-400);
  --task-active: var(--primary-500);
  --task-completed: var(--success-500);
  --task-archived: var(--neutral-300);
}
```

### 1.5 Dark Mode Support
```css
[data-theme="dark"] {
  /* Primary adjustments for dark mode */
  --primary-500: #60a5fa;
  --primary-600: #3b82f6;
  
  /* Neutral adjustments */
  --neutral-50: #0f172a;
  --neutral-100: #1e293b;
  --neutral-200: #334155;
  --neutral-300: #475569;
  --neutral-400: #64748b;
  --neutral-500: #94a3b8;
  --neutral-600: #cbd5e1;
  --neutral-700: #e2e8f0;
  --neutral-800: #f1f5f9;
  --neutral-900: #f8fafc;
  
  /* Background and text */
  --bg-primary: var(--neutral-100);
  --bg-secondary: var(--neutral-50);
  --text-primary: var(--neutral-900);
  --text-secondary: var(--neutral-800);
}
```

---

## 2. Typography System

### 2.1 Font Families
```css
:root {
  /* Primary font stack - 読みやすさを重視 */
  --font-family-primary: 
    'Inter', 
    -apple-system, 
    BlinkMacSystemFont, 
    'Segoe UI', 
    'Roboto', 
    'Helvetica Neue', 
    sans-serif;
  
  /* Secondary font stack - 日本語対応 */
  --font-family-secondary: 
    'Noto Sans JP', 
    'Hiragino Kaku Gothic ProN', 
    'Meiryo', 
    sans-serif;
  
  /* Monospace - コード表示用 */
  --font-family-mono: 
    'JetBrains Mono', 
    'Fira Code', 
    'Monaco', 
    'Consolas', 
    monospace;
}
```

### 2.2 Font Sizes & Scale
```css
:root {
  /* Type Scale (Major Third - 1.25) */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */
  --font-size-6xl: 4rem;      /* 64px */
}
```

### 2.3 Font Weights
```css
:root {
  --font-weight-thin: 100;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  --font-weight-black: 900;
}
```

### 2.4 Line Heights
```css
:root {
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
}
```

### 2.5 Typography Classes
```css
/* Headings */
.text-h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--text-primary);
}

.text-h2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: var(--text-primary);
}

.text-h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
  color: var(--text-primary);
}

.text-h4 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-snug);
  color: var(--text-primary);
}

/* Body text */
.text-body-lg {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
}

.text-body {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
}

.text-body-sm {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--text-secondary);
}

/* Special text */
.text-caption {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--text-secondary);
}

.text-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
}
```

---

## 3. Spacing System

### 3.1 Spacing Scale
```css
:root {
  /* 8px base spacing system */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
  --space-40: 10rem;    /* 160px */
  --space-48: 12rem;    /* 192px */
  --space-56: 14rem;    /* 224px */
  --space-64: 16rem;    /* 256px */
}
```

### 3.2 Component Spacing
```css
:root {
  /* Semantic spacing */
  --space-component-xs: var(--space-1);
  --space-component-sm: var(--space-2);
  --space-component-md: var(--space-4);
  --space-component-lg: var(--space-6);
  --space-component-xl: var(--space-8);
  
  /* Layout spacing */
  --space-section-sm: var(--space-8);
  --space-section-md: var(--space-12);
  --space-section-lg: var(--space-16);
  --space-section-xl: var(--space-24);
  
  /* Container padding */
  --space-container-sm: var(--space-4);
  --space-container-md: var(--space-6);
  --space-container-lg: var(--space-8);
}
```

---

## 4. Layout System

### 4.1 Grid System
```css
.grid-container {
  display: grid;
  gap: var(--space-4);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-container-md);
}

/* Responsive grid columns */
.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-12 { grid-template-columns: repeat(12, 1fr); }

/* Responsive utilities */
@media (min-width: 768px) {
  .md\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .lg\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}
```

### 4.2 Flexbox Utilities
```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.items-stretch { align-items: stretch; }

.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); }
```

---

## 5. Component Library

### 5.1 Button Component
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--border-radius-md);
  border: 1px solid transparent;
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-tight);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;
  
  /* Minimum touch target */
  min-height: 44px;
  min-width: 44px;
}

.btn:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Button variants */
.btn-primary {
  background-color: var(--primary-500);
  color: var(--white);
  border-color: var(--primary-500);
}

.btn-primary:hover {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
}

.btn-secondary {
  background-color: var(--neutral-100);
  color: var(--neutral-900);
  border-color: var(--neutral-300);
}

.btn-secondary:hover {
  background-color: var(--neutral-200);
  border-color: var(--neutral-400);
}

.btn-ghost {
  background-color: rgba(255, 255, 255, 0.8);
  color: var(--primary-600);
  border-color: var(--neutral-200);
  backdrop-filter: blur(4px);
  /* Note: Semi-transparent background ensures visibility against gradient backgrounds.
     Critical for focus mode where ghost buttons need clear recognition. */
}

.btn-ghost:hover {
  background-color: white;
  color: var(--primary-700);
  border-color: var(--primary-200);
}

/* Button sizes */
.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  min-height: 36px;
}

.btn-lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--font-size-lg);
  min-height: 52px;
}

/* Icon buttons */
.btn-icon {
  padding: var(--space-2);
  min-width: 44px;
  min-height: 44px;
}
```

### 5.2 Card Component
```css
.card {
  background-color: var(--white);
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--neutral-200);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.card-subtitle {
  margin: var(--space-1) 0 0 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.card-content {
  margin-bottom: var(--space-4);
}

.card-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--neutral-200);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Card variants */
.card-elevated {
  box-shadow: var(--shadow-lg);
}

.card-outlined {
  border: 2px solid var(--neutral-300);
  box-shadow: none;
}

.card-flat {
  border: none;
  box-shadow: none;
}
```

### 5.3 Form Components
```css
.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--neutral-300);
  border-radius: var(--border-radius-md);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  background-color: var(--white);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: var(--text-secondary);
}

.form-input:disabled {
  background-color: var(--neutral-50);
  color: var(--text-secondary);
  cursor: not-allowed;
}

/* Input states */
.form-input.error {
  border-color: var(--error-500);
}

.form-input.success {
  border-color: var(--success-500);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select {
  background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/></svg>");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

.form-help {
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.form-error {
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--error-600);
}
```

---

## 6. Shadows & Elevation

### 6.1 Shadow System
```css
:root {
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

/* Focus ring for interactive elements */
.focus-ring {
  transition: box-shadow 0.15s ease;
}

.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}
```

### 6.2 Border Radius
```css
:root {
  --border-radius-none: 0;
  --border-radius-sm: 0.125rem;  /* 2px */
  --border-radius-md: 0.375rem;  /* 6px */
  --border-radius-lg: 0.5rem;    /* 8px */
  --border-radius-xl: 0.75rem;   /* 12px */
  --border-radius-2xl: 1rem;     /* 16px */
  --border-radius-full: 9999px;
}
```

---

## 7. Animation System

### 7.1 Timing Functions
```css
:root {
  --ease-linear: cubic-bezier(0, 0, 1, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Custom easing for smooth interactions */
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-back: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### 7.2 Duration Scale
```css
:root {
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}
```

### 7.3 Common Animations
```css
/* Fade animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Slide animations */
@keyframes slideInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale animations */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Utility classes */
.animate-fade-in {
  animation: fadeIn var(--duration-200) var(--ease-out) forwards;
}

.animate-slide-in-up {
  animation: slideInUp var(--duration-300) var(--ease-out) forwards;
}

.animate-scale-in {
  animation: scaleIn var(--duration-200) var(--ease-out) forwards;
}

/* Transition utilities */
.transition-all {
  transition: all var(--duration-200) var(--ease-out);
}

.transition-colors {
  transition: color var(--duration-200) var(--ease-out),
              background-color var(--duration-200) var(--ease-out),
              border-color var(--duration-200) var(--ease-out);
}
```

---

## 8. Dark Mode System

### 8.1 Theme Toggle
```css
/* Theme variables */
:root {
  --bg-primary: var(--white);
  --bg-secondary: var(--neutral-50);
  --text-primary: var(--neutral-900);
  --text-secondary: var(--neutral-600);
  --border-primary: var(--neutral-200);
  --border-secondary: var(--neutral-300);
}

[data-theme="dark"] {
  --bg-primary: var(--neutral-900);
  --bg-secondary: var(--neutral-800);
  --text-primary: var(--neutral-100);
  --text-secondary: var(--neutral-400);
  --border-primary: var(--neutral-700);
  --border-secondary: var(--neutral-600);
}
```

### 8.2 Component Adaptations
```css
/* Dark mode specific adjustments */
[data-theme="dark"] .card {
  background-color: var(--bg-primary);
  border-color: var(--border-primary);
}

[data-theme="dark"] .btn-secondary {
  background-color: var(--neutral-800);
  color: var(--neutral-200);
  border-color: var(--neutral-600);
}

[data-theme="dark"] .form-input {
  background-color: var(--bg-secondary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}
```

---

## 9. Accessibility Features

### 9.1 Focus Management
```css
/* Focus indicators */
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-600);
  color: var(--white);
  padding: 8px;
  text-decoration: none;
  border-radius: var(--border-radius-md);
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### 9.2 High Contrast Mode
```css
@media (prefers-contrast: high) {
  :root {
    --border-primary: var(--black);
    --text-primary: var(--black);
    --bg-primary: var(--white);
  }
  
  .btn-primary {
    background-color: var(--black);
    border-color: var(--black);
  }
}
```

### 9.3 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Performance Considerations

### 10.1 CSS Optimization
```css
/* Use CSS custom properties for theme switching */
.theme-optimized {
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: color 0.2s ease, background-color 0.2s ease;
}

/* Avoid expensive properties in animations */
.performant-animation {
  transform: translateY(0);
  opacity: 1;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

/* Use will-change sparingly */
.will-change-transform {
  will-change: transform;
}

.will-change-auto {
  will-change: auto;
}
```

### 10.2 Loading States
```css
/* Skeleton loading */
.skeleton {
  background: linear-gradient(90deg, 
    var(--neutral-200) 25%, 
    var(--neutral-300) 50%, 
    var(--neutral-200) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Loading spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--neutral-300);
  border-top: 2px solid var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## 11. Usage Guidelines

### 11.1 Component Composition
```css
/* Good: Composable utility classes */
.task-card {
  @apply bg-white rounded-lg shadow-md p-6 border border-neutral-200;
  @apply hover:shadow-lg transition-shadow duration-200;
}

/* Good: Semantic component classes */
.focus-timer {
  @apply text-4xl font-bold text-center;
  @apply text-primary-600 tabular-nums;
}

/* Focus Mode Background */
.focus-mode {
  background: linear-gradient(135deg, var(--neutral-100) 0%, var(--neutral-50) 100%);
  /* Note: Uses neutral gradient instead of primary to ensure proper contrast 
     with ghost buttons and maintain calm focus environment */
}

/* Avoid: Inline styles */
/* <div style="background: blue; padding: 16px;"> */
```

### 11.2 Responsive Design
```css
/* Mobile first approach */
.responsive-component {
  @apply flex flex-col gap-4 p-4;
  @apply md:flex-row md:gap-6 md:p-6;
  @apply lg:gap-8 lg:p-8;
}
```

### 11.3 Theme Consistency
```css
/* Always use design tokens */
.consistent-component {
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-md);
  padding: var(--space-4);
}
```

---

**最終更新**: 2025-07-14  
**Version**: 1.0.0  
**次回更新**: 実装フィードバック後