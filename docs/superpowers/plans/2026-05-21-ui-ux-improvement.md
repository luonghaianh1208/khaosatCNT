# UI/UX Improvement Plan - Hệ thống Khảo sát THPT Chuyên Nguyễn Trãi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cải thiện giao diện và trải nghiệm người dùng của hệ thống khảo sát giáo viên - làm cho UI hiện đại hơn, nhất quán hơn, và dễ sử dụng hơn cho cả admin và học sinh.

**Architecture:** Đây là Next.js 14 app với Tailwind CSS, Supabase backend. UI improvements tập trung vào: (1) design system consistency, (2) responsive layout, (3) micro-interactions, (4) accessibility improvements. Component architecture giữ nguyên - chỉ cải thiện visual design và UX.

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui patterns, Lucide icons

---

## File Structure

```
components/
├── ui/
│   ├── Button.tsx         → nâng cấp với icon support, loading state tốt hơn
│   ├── Input.tsx          → thêm icon prefix/suffix, error animation
│   ├── Card.tsx           → hover effects, refined shadows
│   ├── Modal.tsx          → animation, better UX
│   ├── Badge.tsx          → thêm size variants
│   ├── ProgressBar.tsx     → cải thiện animation
│   ├── Navbar.tsx         → tạo mới - responsive navigation
│   ├── Avatar.tsx         → tạo mới - user avatars
│   ├── Table.tsx          → tạo mới - consistent table styling
│   ├── EmptyState.tsx     → tạo mới - empty states
│   └── Skeleton.tsx       → tạo mới - loading skeletons
├── admin/
│   └── Sidebar.tsx        → cải thiện active states, hover effects

app/
├── admin/
│   ├── layout.tsx         → thêm responsive sidebar
│   └── page.tsx           → Dashboard - card improvements
├── (student)/
│   └── survey/
│       ├── page.tsx       → cải thiện layout, progress indicator
│       └── questions/
│           └── page.tsx   → cải thiện form UX

globals.css                 → thêm animations, transitions
tailwind.config.ts          → thêm custom utilities
```

---

## Task 1: Design System Foundation

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: Update Tailwind config với custom utilities cho animations và transitions**

```typescript
// tailwind.config.ts - thêm vào extend
theme: {
  extend: {
    // ... existing colors, fonts...

    // Animations
    animation: {
      'fade-in': 'fadeIn 0.3s ease-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'scale-in': 'scaleIn 0.2s ease-out',
      'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      scaleIn: {
        '0%': { opacity: '0', transform: 'scale(0.95)' },
        '100%': { opacity: '1', transform: 'scale(1)' },
      },
      pulseSubtle: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.7' },
      },
    },

    // Transition durations
    transitionDuration: {
      '250': '250ms',
      '350': '350ms',
    },
  },
}
```

- [ ] **Step 2: Update globals.css với base animations và utility classes**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* ... existing variables ... */
  --color-primary: #00549B;
  --color-primary-hover: #003D73;
}

/* Base transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Animation classes */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Table row hover */
.table-row-hover {
  @apply transition-colors duration-150;
}

.table-row-hover:hover {
  @apply bg-bg-light;
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat(ui): add animation utilities and design system foundation"
```

---

## Task 2: Button Component Enhancement

**Files:**
- Modify: `components/ui/Button.tsx`
- Create: `components/ui/Button.stories.tsx` (optional test)

- [ ] **Step 1: Enhance Button với icon support, loading state, và size variants**

```tsx
import React from 'react';
import { Loader2 } from 'lucide-react'; // Add lucide-react if not present

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium rounded-button transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:scale-[0.98] focus:ring-primary',
    secondary: 'bg-secondary-nav text-white hover:bg-secondary-nav/90 active:scale-[0.98] focus:ring-secondary-nav',
    danger: 'bg-crimson text-white hover:bg-crimson-dark active:scale-[0.98] focus:ring-crimson',
    ghost: 'bg-transparent text-text-primary hover:bg-bg-light focus:ring-primary',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5 focus:ring-primary',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  const iconSizeStyles = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className={`${iconSizeStyles[size]} animate-spin`} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={iconSizeStyles[size]}>{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className={iconSizeStyles[size]}>{icon}</span>
          )}
        </>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Update Badge component với size variants**

```tsx
// components/ui/Badge.tsx
import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'secondary' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'secondary',
  size = 'md',
  children,
  className = '',
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium rounded';

  const variantStyles = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    secondary: 'bg-secondary-nav/10 text-secondary-nav',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-crimson/10 text-crimson',
    info: 'bg-info/10 text-info',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/Button.tsx components/ui/Badge.tsx
git commit -m "feat(ui): enhance Button with icon support, loading state, and size variants"
```

---

## Task 3: Card Component Enhancement

**Files:**
- Modify: `components/ui/Card.tsx`

- [ ] **Step 1: Update Card với hover effects và refined shadows**

```tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  className = '',
  children,
  hoverable = false,
  padding = 'md',
  ...props
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hoverable
    ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div
      className={`bg-white border border-border rounded-modal shadow-md ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create EmptyState component**

```tsx
// components/ui/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 mb-4 rounded-full bg-bg-light flex items-center justify-center text-text-secondary">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm mb-4">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/Card.tsx components/ui/EmptyState.tsx
git commit -m "feat(ui): enhance Card with hover effects and add EmptyState component"
```

---

## Task 4: Modal Component Enhancement

**Files:**
- Modify: `components/ui/Modal.tsx`

- [ ] **Step 1: Update Modal với animations và improved UX**

```tsx
import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-modal shadow-xl w-full ${sizeStyles[size]} max-h-[90vh] overflow-hidden animate-scale-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-bg-light rounded text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/Modal.tsx
git commit -m "feat(ui): enhance Modal with animations and improved UX"
```

---

## Task 5: Input Component Enhancement

**Files:**
- Modify: `components/ui/Input.tsx`

- [ ] **Step 1: Update Input với icon support, error animation, và improved styling**

```tsx
import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function Input({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5 font-sans">
          {label}
          {props.required && <span className="text-crimson ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}

        <input
          className={`
            w-full px-3 py-2.5 text-sm font-sans border rounded-button bg-white text-text-primary
            placeholder:text-text-tertiary
            focus:outline-none focus:ring-2 focus:ring-offset-0
            transition-all duration-200
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error
              ? 'border-crimson focus:ring-crimson/20 focus:border-crimson'
              : isFocused
                ? 'border-primary focus:ring-primary/20 focus:border-primary'
                : 'border-border hover:border-text-tertiary focus:border-primary'
            }
            ${className}
          `}
          onFocus={(e) => {
            setIsFocused(true);
            if (typeof props.onFocus === 'function') props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (typeof props.onBlur === 'function') props.onBlur(e);
          }}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-crimson font-sans flex items-center gap-1 animate-slide-up">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="mt-1.5 text-xs text-text-muted font-sans">{hint}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/Input.tsx
git commit -m "feat(ui): enhance Input with icon support, focus states, and improved validation"
```

---

## Task 6: Admin Sidebar Enhancement

**Files:**
- Modify: `components/admin/Sidebar.tsx`

- [ ] **Step 1: Update Sidebar với better hover effects, icons, và active state styling**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  GraduationCap,
  BarChart3,
} from 'lucide-react'; // Add lucide-react to package.json if needed

const navItems = [
  { href: '/admin', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { href: '/admin/sessions', label: 'Quản lý đợt khảo sát', icon: ClipboardList },
  { href: '/admin/students', label: 'Quản lý học sinh', icon: Users },
  { href: '/admin/teachers', label: 'Quản lý giáo viên', icon: GraduationCap },
  { href: '/admin/reports', label: 'Báo cáo & Thống kê', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-primary w-64 min-h-screen text-white flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">Trang Quản Trị</h1>
            <p className="text-xs text-white/60 mt-0.5">THPT Chuyên Nguyễn Trãi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 mx-3 px-4 py-3 rounded-lg text-sm font-medium
                transition-all duration-200 mb-1
                ${isActive
                  ? 'bg-white/15 text-white shadow-md'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/40 text-center">
          Hệ thống Khảo sát GV
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Update admin layout để support mobile responsive**

```tsx
// app/admin/layout.tsx
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-light">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Header (for smaller screens) */}
      <div className="fixed top-0 left-0 right-0 lg:hidden bg-primary text-white p-4 z-40 flex items-center justify-between">
        <span className="font-semibold">Quản trị</span>
        {/* Add menu toggle button here if needed */}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/admin/Sidebar.tsx app/admin/layout.tsx
git commit -m "feat(ui): enhance Sidebar with icons, improved active states, and responsive layout"
```

---

## Task 7: Dashboard Page Enhancement

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Update Dashboard với better card layout, stats visualization, và improved typography**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import {
  Users,
  GraduationCap,
  Target,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface Stats {
  totalStudents: number;
  submittedStudents: number;
  totalTeachers: number;
  avgScore: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    submittedStudents: 0,
    totalTeachers: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: session } = await supabaseAdmin
        .from('survey_sessions')
        .select('id')
        .eq('is_active', true)
        .single();

      const { count: totalStudents } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: submittedStudents } = session?.id
        ? await supabaseAdmin
            .from('survey_completion')
            .select('*', { count: 'exact', head: true })
            .eq('survey_session_id', session.id)
            .eq('is_submitted', true)
        : { count: 0 };

      const { count: totalTeachers } = await supabaseAdmin
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      let avgScore = 0;
      if (session?.id) {
        const { data: responses } = await supabaseAdmin
          .from('survey_responses')
          .select('total_score')
          .eq('survey_session_id', session.id);

        if (responses && responses.length > 0) {
          const total = responses.reduce((sum, r) => sum + (r.total_score || 0), 0);
          avgScore = Math.round((total / responses.length) * 100) / 100;
        }
      }

      setStats({
        totalStudents: totalStudents || 0,
        submittedStudents: submittedStudents || 0,
        totalTeachers: totalTeachers || 0,
        avgScore,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-bg-light rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-bg-light rounded-modal"></div>
          ))}
        </div>
      </div>
    );
  }

  const { totalStudents, submittedStudents, totalTeachers, avgScore } = stats;
  const completionPercentage = totalStudents > 0
    ? Math.round((submittedStudents / totalStudents) * 100)
    : 0;

  const statCards = [
    {
      label: 'Tổng số học sinh',
      value: totalStudents,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Tổng số giáo viên',
      value: totalTeachers,
      icon: GraduationCap,
      color: 'text-secondary-nav',
      bgColor: 'bg-secondary-nav/10',
    },
    {
      label: 'Điểm TB toàn trường',
      value: avgScore.toFixed(1),
      icon: Target,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Hoàn thành khảo sát',
      value: `${completionPercentage}%`,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      highlight: submittedStudents === totalStudents && totalStudents > 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-textPrimary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Tổng quan về đợt khảo sát hiện tại</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              hoverable
              className={`relative overflow-hidden ${stat.highlight ? 'ring-2 ring-success/30' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                  <p className={`text-2xl lg:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              {stat.highlight && (
                <div className="absolute top-2 right-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Progress Section */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Tiến độ khảo sát</h2>
            <p className="text-sm text-text-secondary mt-1">
              {submittedStudents} trên {totalStudents} học sinh đã hoàn thành
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
          </div>
        </div>

        <ProgressBar
          value={completionPercentage}
          showLabel={false}
          size="lg"
        />

        {completionPercentage === 100 && totalStudents > 0 && (
          <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm text-success flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Tất cả học sinh đã hoàn thành khảo sát!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Update ProgressBar component**

```tsx
// components/ui/ProgressBar.tsx
interface ProgressBarProps {
  value: number;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success';
  className?: string;
}

export default function ProgressBar({
  value,
  label,
  showLabel = true,
  size = 'md',
  variant = 'primary',
  className = '',
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantStyles = {
    primary: 'bg-primary',
    success: 'bg-success',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-text-secondary">{label}</span>
          <span className="text-sm font-medium text-text-primary">{clampedValue}%</span>
        </div>
      )}
      <div className={`w-full bg-bg-disabled rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full ${variantStyles[variant]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx components/ui/ProgressBar.tsx
git commit -m "feat(ui): enhance Dashboard with improved stats cards, visualizations, and progress tracking"
```

---

## Task 8: Student Survey Page Enhancement

**Files:**
- Modify: `app/(student)/survey/page.tsx`
- Modify: `app/(student)/survey/questions/page.tsx`

- [ ] **Step 1: Update student survey landing page với better layout và illustrations**

```tsx
// app/(student)/survey/page.tsx - trích xuất phần return
// ... existing code logic giữ nguyên, chỉ update JSX return

// Thay toàn bộ phần return bằng:

return (
  <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
    {/* Header Card */}
    <Card padding="lg" className="text-center border-t-4 border-primary">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
        <span className="text-4xl">📋</span>
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">
        Chào mừng bạn đến với khảo sát
      </h2>
      <p className="text-text-secondary max-w-md mx-auto">
        Khảo sát được thực hiện hoàn toàn ẩn danh. Thông tin của bạn sẽ không bị tiết lộ.
      </p>
    </Card>

    {/* User Info Card */}
    {user && (
      <Card padding="md" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
          Thông tin của bạn
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-light rounded-lg p-4">
            <p className="text-xs text-text-muted mb-1">Họ và tên</p>
            <p className="text-base font-semibold text-text-primary">{user.full_name}</p>
          </div>
          <div className="bg-bg-light rounded-lg p-4">
            <p className="text-xs text-text-muted mb-1">Lớp</p>
            <p className="text-base font-semibold text-text-primary">{user.class_name}</p>
          </div>
        </div>
      </Card>
    )}

    {/* Session Info Card */}
    {activeSession && (
      <Card padding="md" className="animate-slide-up border-l-4 border-warning" style={{ animationDelay: '200ms' }}>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
          Thông tin khảo sát
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-text-secondary">Đợt khảo sát</span>
            <span className="font-medium text-text-primary">{activeSession.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-text-secondary">Năm học</span>
            <span className="font-medium text-text-primary">{activeSession.school_year}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-text-secondary">Hạn nộp</span>
            <span className="font-semibold text-crimson">{deadlineDate}</span>
          </div>
        </div>
      </Card>
    )}

    {/* CTA */}
    {!completion?.is_submitted && (
      <div className="flex justify-center pt-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <Button size="lg" onClick={() => router.push('/survey/questions')} className="px-8">
          Bắt đầu khảo sát
        </Button>
      </div>
    )}

    {/* Already Submitted */}
    {completion?.is_submitted && (
      <Card padding="lg" className="text-center border-t-4 border-success animate-slide-up">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Bạn đã hoàn thành khảo sát
        </h2>
        <p className="text-text-secondary mb-6">
          Cảm ơn bạn đã tham gia. Kết quả của bạn đã được ghi nhận.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push('/login')}>
            Đăng xuất
          </Button>
        </div>
      </Card>
    )}
  </div>
);
```

- [ ] **Step 2: Update questions page với improved form UX**

```tsx
// app/(student)/survey/questions/page.tsx - trích xa phần JSX return
// ... existing logic giữ nguyên

// Thay phần return bằng:

return (
  <div className="max-w-4xl mx-auto space-y-6">
    {/* Header with Progress */}
    <Card padding="md" className="sticky top-4 z-10 shadow-lg animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-primary">
          {currentPart === 'subject' ? 'Phần I: Đánh giá giáo viên bộ môn' : 'Phần II: Đánh giá GVCN'}
        </span>
        <span className={`text-sm font-bold ${progress === 100 ? 'text-success' : 'text-primary'}`}>
          {progress}%
        </span>
      </div>
      <ProgressBar value={progress} size="md" showLabel={false} />
      {progress < 100 && (
        <p className="text-xs text-text-muted mt-2 text-center">
          Vui lòng hoàn thành tất cả câu hỏi trước khi nộp
        </p>
      )}
    </Card>

    {/* Error message */}
    {error && (
      <div className="bg-crimson/10 border border-crimson text-crimson px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-slide-up">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    )}

    {/* Part I: Subject Teachers */}
    {currentPart === 'subject' && (
      <Card padding="lg" className="animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-3xl">👨‍🏫</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            Đánh giá giáo viên bộ môn giảng dạy
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Chọn điểm từ 1 đến 5 cho mỗi tiêu chí
          </p>
        </div>

        {subjectTeachers.length === 0 ? (
          <EmptyState
            icon={<span>📭</span>}
            title="Không có giáo viên bộ môn"
            description="Lớp của bạn chưa được gán giáo viên bộ môn nào."
          />
        ) : (
          <SurveyGrid
            teachers={subjectTeachers}
            scores={subjectScores}
            onScoreChange={handleSubjectScoreChange}
            disabledTeachers={[]}
            userClassName={user?.class_name}
          />
        )}

        <div className="flex justify-center mt-8">
          <Button size="lg" onClick={() => setCurrentPart('homeroom')}>
            Tiếp tục Phần II
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </Card>
    )}

    {/* Part II: Homeroom Teacher */}
    {currentPart === 'homeroom' && homeroomTeacher && (
      <Card padding="lg" className="animate-scale-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/10 flex items-center justify-center">
            <span className="text-3xl">👩‍🏫</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            Đánh giá giáo viên chủ nhiệm
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Đánh giá GVCN và gửi phản hồi ẩn danh
          </p>
        </div>

        <HomeroomForm
          teacher={homeroomTeacher}
          scores={homeroomScores}
          openFeedback={openFeedback}
          onScoreChange={handleHomeroomScoreChange}
          onFeedbackChange={setOpenFeedback}
        />

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          <Button variant="outline" onClick={() => setCurrentPart('subject')}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </Button>
          <Button size="lg" onClick={handleSubmit} disabled={submitting} loading={submitting}>
            {submitting ? 'Đang nộp...' : 'Nộp khảo sát'}
          </Button>
        </div>
      </Card>
    )}

    {/* Part II: No homeroom teacher */}
    {currentPart === 'homeroom' && !homeroomTeacher && (
      <Card padding="lg" className="text-center animate-scale-in">
        <EmptyState
          icon={<span>📭</span>}
          title="Không có GVCN"
          description="Lớp của bạn chưa được gán giáo viên chủ nhiệm."
          action={
            <Button onClick={handleSubmit} disabled={submitting} loading={submitting}>
              {submitting ? 'Đang nộp...' : 'Nộp khảo sát'}
            </Button>
          }
        />
      </Card>
    )}
  </div>
);
```

- [ ] **Step 3: Commit**

```bash
git add app/\(student\)/survey/page.tsx app/\(student\)/survey/questions/page.tsx
git commit -m "feat(ui): enhance student survey pages with improved layout, animations, and form UX"
```

---

## Task 9: Table Component - Admin Pages Enhancement

**Files:**
- Modify: `app/admin/sessions/page.tsx`
- Modify: `app/admin/students/page.tsx`
- Modify: `app/admin/teachers/page.tsx`
- Modify: `app/admin/reports/page.tsx`

- [ ] **Step 1: Update Sessions page với improved table styling**

```tsx
// Trong app/admin/sessions/page.tsx - thay phần table render

// Thay phần return table section bằng:

<div className="overflow-x-auto rounded-lg border border-border">
  <table className="w-full">
    <thead>
      <tr className="bg-bg-light">
        <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Tên đợt khảo sát</th>
        <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Năm học</th>
        <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Thời hạn</th>
        <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Trạng thái</th>
        <th className="text-left py-4 px-4 text-sm font-semibold text-text-secondary">Thao tác</th>
      </tr>
    </thead>
    <tbody>
      {sessions.map((session, index) => (
        <tr
          key={session.id}
          className="border-t border-border hover:bg-bg-light/50 transition-colors animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <td className="py-4 px-4">
            <div className="font-medium text-text-primary">{session.name}</div>
            {session.description && (
              <div className="text-xs text-text-muted mt-0.5">{session.description}</div>
            )}
          </td>
          <td className="py-4 px-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {session.school_year}
            </span>
          </td>
          <td className="py-4 px-4 text-sm text-text-secondary">
            {formatDate(session.start_date)} - {formatDate(session.end_date)}
          </td>
          <td className="py-4 px-4">
            <Badge variant={session.is_active ? 'success' : 'secondary'} size="sm">
              {session.is_active ? 'Đang hoạt động' : 'Tắt'}
            </Badge>
          </td>
          <td className="py-4 px-4">
            <div className="flex gap-2">
              <Button
                variant={session.is_active ? 'ghost' : 'outline'}
                size="sm"
                onClick={() => toggleActive(session.id, session.is_active)}
              >
                {session.is_active ? 'Tắt' : 'Bật'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenModal(session)}
              >
                Sửa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-crimson hover:bg-crimson/10"
                onClick={() => handleDelete(session.id)}
              >
                Xóa
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

- [ ] **Step 2: Apply similar improvements to teachers, students, và reports pages**

Apply same pattern:
1. Add row animations with staggered delays
2. Replace danger variant buttons with ghost + text color
3. Add hover effects on table rows
4. Improve empty states
5. Consistent spacing and typography

- [ ] **Step 3: Commit**

```bash
git add app/admin/sessions/page.tsx app/admin/students/page.tsx app/admin/teachers/page.tsx app/admin/reports/page.tsx
git commit -m "feat(ui): enhance admin table pages with improved styling, animations, and hover states"
```

---

## Task 10: Final Polish - Loading States & Empty States

**Files:**
- Create: `components/ui/Skeleton.tsx`
- Create: `components/ui/TableSkeleton.tsx`
- Modify: `app/admin/students/loading.tsx`
- Modify: `app/admin/teachers/loading.tsx`

- [ ] **Step 1: Create Skeleton loading components**

```tsx
// components/ui/Skeleton.tsx
export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-bg-disabled rounded ${className}`} />
  );
}
```

```tsx
// components/ui/TableSkeleton.tsx
import Skeleton from './Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full">
        <thead>
          <tr className="bg-bg-light">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="text-left py-4 px-4">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-border">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="py-4 px-4">
                  <Skeleton className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Update loading pages với better skeletons**

```tsx
// app/admin/students/loading.tsx
import TableSkeleton from '@/components/ui/TableSkeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-40" />
      </div>

      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/Skeleton.tsx components/ui/TableSkeleton.tsx
git add app/admin/students/loading.tsx app/admin/teachers/loading.tsx app/admin/sessions/loading.tsx app/admin/reports/loading.tsx
git commit -m "feat(ui): add skeleton loading components for better perceived performance"
```

---

## Verification Checklist

Sau khi implement tất cả tasks, verify:

- [ ] Button component có icon support, loading state, size variants
- [ ] Card component có hoverable prop và refined shadows
- [ ] Modal có backdrop blur, escape key close, body scroll lock
- [ ] Input có icon support, improved focus states
- [ ] Sidebar có icons, hover effects, improved active states
- [ ] Dashboard có stat cards với icons, better progress visualization
- [ ] Student survey pages có animations, better layout
- [ ] Admin table pages có row hover effects, staggered animations
- [ ] Loading states cho tất cả admin pages
- [ ] Consistent typography và spacing across all pages
- [ ] Responsive behavior trên mobile (sidebar collapse)