# Design System Inspired by Nguyễn Trãi Specialized Senior High School

## 1. Visual Theme & Atmosphere

This design system embodies the institutional authority and academic excellence of a Vietnamese specialized high school. It combines deep, authoritative blues and crimsons with clean, professional typography to create a trustworthy, organized digital presence. The aesthetic is formal yet accessible, emphasizing clarity and hierarchical structure. Navigation and announcements use bold, energetic accent colors to draw attention to school events and achievements. The overall mood is professional, patriotic, and student-centered, reflecting Vietnam's educational values and institutional pride.

**Key Characteristics**
- **Institutional Authority**: Deep primary blues convey trust and professionalism
- **Energetic Accents**: Crimson and alert reds energize announcements and call-to-actions
- **Clean Typography**: Arial sans-serif ensures digital legibility across devices
- **Hierarchical Clarity**: Strong contrast between neutral text and primary elements
- **Patriotic Palette**: Blues and reds echo Vietnamese national identity
- **Accessibility-First**: Adequate contrast ratios and predictable component patterns
- **Grid-Driven Layout**: Structured spacing supports academic organization

## 2. Color Palette & Roles

### Primary
- **Deep Academic Blue** (`#00549B`): Primary navigation bars, header elements, main CTA buttons, and institutional branding
- **Bright Interactive Blue** (`#007AFF`): Hover states and secondary interactive elements

### Accent Colors
- **Crimson Alert** (`#C41330`): Announcements ("THÔNG BÁO"), error states, and attention-grabbing content cards
- **Dark Crimson** (`#E73A35`): Enhanced error emphasis and alert overlays
- **Secondary Blue** (`#37538D`): Sidebar sections and secondary navigation

### Interactive
- **Link Blue** (`#00549B`): Text links, breadcrumbs, and navigational anchors
- **Cyan Info** (`#17A2B8`): Information tooltips and supplementary data callouts

### Neutral Scale
- **Text Primary** (`#212529`): Body text, paragraphs, and primary content (most used)
- **Text Secondary** (`#495057`): Secondary labels and metadata
- **Text Tertiary** (`#6C757D`): Muted descriptions and helper text
- **Icon Gray** (`#999999`): Icon fills and disabled states
- **Dark Gray** (`#222222`): Emphasized headings and high-contrast labels
- **Off-Black** (`#000000`): Terminal contrast elements

### Surface & Borders
- **Pure White** (`#FFFFFF`): Card backgrounds, content areas, and primary surface
- **Light Gray Background** (`#F8F9FA`): Subtle section backgrounds and alternate rows
- **Light Border** (`#DEE2E6`): Input borders, dividers, and form field outlines
- **Very Light Gray** (`#EDEDED`): Subtle background separation and disabled field states

### Semantic / Status
- **Success Green** (`#28A745`): Positive confirmations and completed actions
- **Warning Amber** (`#FFC107`): Cautionary states and pending actions

## 3. Typography Rules

### Font Family
**Primary Font**: Arial, Helvetica, sans-serif
**Secondary Font**: Arial, Helvetica, sans-serif
No serif or script fonts; Arial provides maximum digital legibility and institutional consistency.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|-----------------|-------|
| **Display (Page Title)** | Arial | 28px | 700 | 36px | 0px | School name and primary heading |
| **H2 (Section Heading)** | Arial | 14px | 700 | 21px | 0px | Subsection titles, card headers |
| **H3 (Card Title)** | Arial | 20px | 700 | 30px | 0px | Feature card and announcement titles |
| **H5 (Subheading)** | Arial | 17.5px | 500 | 26.25px | 0px | Lightweight emphasis, secondary headings |
| **Body (Default)** | Arial | 14px | 400 | 21px | 0px | Article text, descriptions, metadata |
| **Caption (Small)** | Arial | 12px | 400 | 18px | 0px | Input labels, timestamps, form hints |
| **Button Text** | Arial | 14px | 400 | 21px | 0px | Button labels and CTAs |
| **Button Small** | Arial | 12px | 700 | 12px | 0px | Compact action buttons and badges |
| **Code / Monospace** | Arial | 12px | 400 | 18px | 0px | Fallback; consider monospace family for future |

### Principles
- **Neutral baseline**: All weights use Arial for consistency and web performance
- **Weight economy**: Only 400 (regular) and 700 (bold) deployed; no intermediate weights
- **Line height ratio**: Minimum 1.5× font size for readability; tighter (1.2×) only for display
- **Size scale**: 12, 14, 17.5, 20, 28px; all divisible by 2 or 0.5 for precise rendering
- **No decorative variants**: Italics and small-caps avoided; use color and weight for emphasis

## 4. Component Stylings

### Buttons

#### Primary Button
- **Background**: `#00549B`
- **Text Color**: `#FFFFFF`
- **Font Size**: `14px`
- **Font Weight**: `400`
- **Padding**: `6px 12px`
- **Border**: `1px solid #00549B`
- **Border Radius**: `2px`
- **Height**: `auto` (min `30px`)
- **Line Height**: `21px`
- **Hover**: Background `#003D73`, border `1px solid #003D73`
- **Active**: Background `#002A4F`, border `1px solid #002A4F`
- **Disabled**: Background `#CCCCCC`, border `1px solid #CCCCCC`, Text `#666666`

#### Secondary Button (White/Outline)
- **Background**: `#FFFFFF`
- **Text Color**: `#495057`
- **Font Size**: `14px`
- **Font Weight**: `400`
- **Padding**: `0px 12px`
- **Border**: `1px solid #DEE2E6`
- **Border Radius**: `0px 2px 2px 0px`
- **Height**: `24px`
- **Line Height**: `21px`
- **Hover**: Background `#F8F9FA`, border `1px solid #BDC3CF`
- **Active**: Background `#EDEDED`, border `1px solid #99A3AD`
- **Disabled**: Background `#F8F9FA`, border `1px solid #DEE2E6`, Text `#999999`

#### Ghost Button (Transparent)
- **Background**: `transparent`
- **Text Color**: `#000000`
- **Font Size**: `12px`
- **Font Weight**: `700`
- **Padding**: `0px 2px`
- **Border**: `0px none`
- **Border Radius**: `0px`
- **Height**: `auto`
- **Line Height**: `12px`
- **Hover**: Text `#00549B`, background `rgba(0, 84, 155, 0.04)`
- **Active**: Text `#003D73`, background `rgba(0, 84, 155, 0.08)`
- **Disabled**: Text `#999999`, background `transparent`

#### Icon Button (Large/Close)
- **Background**: `transparent`
- **Text Color**: `#000000`
- **Font Size**: `21px`
- **Font Weight**: `700`
- **Padding**: `16px 16px`
- **Border**: `0px none`
- **Border Radius**: `0px`
- **Height**: `auto`
- **Line Height**: `21px`
- **Hover**: Text `#00549B`, background `rgba(0, 84, 155, 0.08)`
- **Active**: Text `#003D73`, background `rgba(0, 84, 155, 0.12)`

### Cards & Containers

#### Standard Card
- **Background**: `#FFFFFF`
- **Border**: `1px solid #DEE2E6`
- **Border Radius**: `2px`
- **Padding**: `16px 20px`
- **Shadow**: `0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)`
- **Hover**: Shadow `0px 2px 6px rgba(0, 0, 0, 0.15), 0px 2px 4px rgba(0, 0, 0, 0.30)`

#### Announcement Card (Crimson Accent)
- **Background**: `#C41330`
- **Border**: `0px none`
- **Border Radius**: `2px`
- **Padding**: `20px 24px`
- **Text Color**: `#FFFFFF`
- **Shadow**: `0px 1px 3px rgba(0, 0, 0, 0.15), 0px 1px 2px rgba(0, 0, 0, 0.30)`
- **Heading**: Font size `20px`, weight `700`, color `#FFFFFF`

#### Section Container
- **Background**: `#F8F9FA`
- **Border**: `0px none`
- **Border Radius**: `0px`
- **Padding**: `28px 32px`
- **Margin**: `24px 0px`

### Inputs & Forms

#### Text Input
- **Background**: `#FFFFFF`
- **Text Color**: `#495057`
- **Font Size**: `12px`
- **Font Weight**: `400`
- **Padding**: `0px 14px`
- **Border**: `1px solid #DEE2E6`
- **Border Radius**: `2px 0px 0px 2px`
- **Height**: `24px`
- **Line Height**: `18px`
- **Focus**: Border `1px solid #00549B`, background `#FFFFFF`, outline `none`, box-shadow `0px 0px 0px 2px rgba(0, 84, 155, 0.1)`
- **Disabled**: Background `#EDEDED`, border `1px solid #DEE2E6`, Text `#999999`
- **Error**: Border `1px solid #C41330`, background `#FFFFFF`

#### Search Input
- **Background**: `#FFFFFF`
- **Text Color**: `#495057`
- **Font Size**: `12px`
- **Placeholder Color**: `#999999`
- **Padding**: `8px 14px`
- **Border**: `1px solid #DEE2E6`
- **Border Radius**: `2px`
- **Height**: `32px`
- **Focus**: Border `1px solid #00549B`, box-shadow `0px 0px 0px 2px rgba(0, 84, 155, 0.1)`

#### Form Group
- **Margin Bottom**: `16px`
- **Label Font Size**: `12px`
- **Label Font Weight**: `700`
- **Label Color**: `#212529`
- **Label Margin Bottom**: `4px`
- **Helper Text Font Size**: `11px`
- **Helper Text Color**: `#6C757D`
- **Helper Text Margin Top**: `4px`

### Navigation

#### Top Navigation Bar
- **Background**: `#00549B`
- **Height**: `48px`
- **Padding**: `0px`
- **Border**: `0px none`
- **Box Shadow**: `0px 2px 4px rgba(0, 0, 0, 0.1)`

#### Navigation Item (Default)
- **Background**: `transparent`
- **Text Color**: `#FFFFFF`
- **Font Size**: `14px`
- **Font Weight**: `400`
- **Padding**: `12px 16px`
- **Line Height**: `21px`
- **Height**: `auto`
- **Hover**: Background `rgba(0, 0, 0, 0.1)`, Text `#FFFFFF`
- **Active**: Background `rgba(0, 0, 0, 0.15)`, Text `#FFFFFF`, border-bottom `3px solid #FFFFFF`

#### Breadcrumb
- **Separator**: `/`
- **Item Text Color**: `#00549B`
- **Item Font Size**: `14px`
- **Item Padding**: `0px 8px`
- **Hover**: Text `#003D73`, text-decoration `underline`

#### Sidebar Navigation
- **Background**: `#FFFFFF`
- **Item Text Color**: `#212529`
- **Item Font Size**: `14px`
- **Item Padding**: `12px 16px`
- **Item Border Left**: `4px solid transparent`
- **Active Item Border Left**: `4px solid #00549B`
- **Active Item Background**: `rgba(0, 84, 155, 0.08)`
- **Hover**: Background `#F8F9FA`

### Links

#### Text Link
- **Color**: `#00549B`
- **Font Size**: `14px`
- **Font Weight**: `400`
- **Text Decoration**: `none`
- **Padding**: `0px`
- **Hover**: Color `#003D73`, text-decoration `underline`
- **Active**: Color `#002A4F`, text-decoration `underline`
- **Visited**: Color `#663399`

#### Link Small (Caption)
- **Color**: `#00549B`
- **Font Size**: `12px`
- **Font Weight**: `400`
- **Hover**: Color `#003D73`, text-decoration `underline`

### Badges & Tags

#### Badge (Default)
- **Background**: `#E8F0F7`
- **Text Color**: `#00549B`
- **Font Size**: `11px`
- **Font Weight**: `600`
- **Padding**: `4px 8px`
- **Border Radius**: `2px`
- **Border**: `0px none`

#### Badge (Danger)
- **Background**: `#F8E0E3`
- **Text Color**: `#C41330`
- **Font Size**: `11px`
- **Font Weight**: `600`
- **Padding**: `4px 8px`
- **Border Radius**: `2px`

#### Badge (Success)
- **Background**: `#E8F5E9`
- **Text Color**: `#28A745`
- **Font Size**: `11px`
- **Font Weight**: `600`
- **Padding**: `4px 8px`
- **Border Radius**: `2px`

### Modals & Overlays

#### Modal Dialog
- **Background**: `#FFFFFF`
- **Border**: `0px none`
- **Border Radius**: `3.8px`
- **Box Shadow**: `0px 4px 12px rgba(0, 0, 0, 0.15)`
- **Max Width**: `600px`

#### Modal Header
- **Background**: `#F8F9FA`
- **Border Bottom**: `1px solid #DEE2E6`
- **Padding**: `16px 20px`
- **Border Radius**: `3.8px 3.8px 0px 0px`

#### Modal Body
- **Padding**: `20px 24px`
- **Background**: `#FFFFFF`

#### Modal Footer
- **Background**: `#FFFFFF`
- **Border Top**: `1px solid #DEE2E6`
- **Padding**: `16px 20px`
- **Border Radius**: `0px 0px 3.8px 3.8px`
- **Text Align**: `right`

### Alerts & Messages

#### Alert (Info)
- **Background**: `#D1ECF1`
- **Border**: `1px solid #BEE5EB`
- **Border Radius**: `2px`
- **Padding**: `12px 16px`
- **Text Color**: `#0C5460`
- **Icon Color**: `#17A2B8`

#### Alert (Error)
- **Background**: `#F8D7DA`
- **Border**: `1px solid #F5C6CB`
- **Border Radius**: `2px`
- **Padding**: `12px 16px`
- **Text Color**: `#721C24`
- **Icon Color**: `#C41330`

#### Alert (Success)
- **Background**: `#D4EDDA`
- **Border**: `1px solid #C3E6CB`
- **Border Radius**: `2px`
- **Padding**: `12px 16px`
- **Text Color**: `#155724`
- **Icon Color**: `#28A745`

#### Alert (Warning)
- **Background**: `#FFF3CD`
- **Border**: `1px solid #FFEAA7`
- **Border Radius**: `2px`
- **Padding**: `12px 16px`
- **Text Color**: `#856404`
- **Icon Color**: `#FFC107`

## 5. Layout Principles

### Spacing System

**Base Unit**: `4px`

**Scale**:
- `4px`: Fine adjustments, component internals
- `8px`: Tight spacing, form field gaps
- `12px`: Standard component padding, small margins
- `16px`: Standard padding, medium spacing
- `20px`: Large padding, content margins
- `24px`: Section spacing, card gaps
- `28px`: Major section margin
- `32px`: Container padding
- `36px`: Major section margin
- `100px`: Hero section spacing, page-level gaps

**Usage Context**:
- **Button & Input**: `6px–12px` padding
- **Card & Container**: `16px–32px` padding
- **Section Separator**: `24px–36px` margin
- **Form Field Gap**: `12px–16px` margin between inputs
- **Navigation Item**: `12px–16px` horizontal padding

### Grid & Container

**Max Width**: `1200px` (typical full-width container)
**Gutter**: `24px` (space between columns)
**Columns**: 12-column grid system (implied by responsive behavior)
**Container Padding**: `16px` on mobile, `32px` on desktop

**Section Patterns**:
- **Full-width header**: No max-width constraint, edge-to-edge
- **Centered content**: Max-width container, center-aligned, padded gutters
- **Sidebar layout**: Primary content 70–75%, sidebar 25–30%, 24px gutter

### Whitespace Philosophy

Generous whitespace emphasizes institutional authority and clarity. Every element has breathing room:
- Between sections: minimum `24px`
- Between cards: minimum `16px`
- Within cards: minimum `16px` padding
- Text to container edge: minimum `12px` (inputs), `16px` (body text)

This combats cognitive overload and reinforces the school's organized, professional identity.

### Border Radius Scale

- **Sharp** (`0px`): Full-width headers, modal backgrounds, large display elements
- **Subtle** (`2px`): Buttons, input fields, standard cards, badge elements
- **Medium** (`3.8px`): Modal dialogs, secondary containers
- **Rounded** (`4.8px`): Modal borders with slight softness
- **Full** (`50%`): Avatar circles, icon backgrounds (not extensively used)

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| **Flat (No Shadow)** | Box shadow `none` | Backgrounds, disabled states, text links |
| **Level 1 (Subtle)** | `0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)` | Standard cards, form inputs (focus state) |
| **Level 2 (Elevated)** | `0px 2px 6px rgba(0, 0, 0, 0.15), 0px 2px 4px rgba(0, 0, 0, 0.30)` | Card hover, dropdown menus, modals |
| **Level 3 (Modal)** | `0px 4px 12px rgba(0, 0, 0, 0.15)` | Modal dialogs, overlays, popovers |

**Shadow Philosophy**:
Shadows are understated and use dual-layer opacity (light + dark components) to create nuanced depth. This mimics natural light and avoids harsh contrast. Elevation increases in steps, with Level 1 being nearly imperceptible and Level 3 reserved for highest-priority modals and overlays. Shadows reinforce hierarchy without overwhelming the clean, institutional aesthetic.

## 7. Do's and Don'ts

### Do

- **Use Primary Blue** (`#00549B`) for all primary CTAs, main navigation, and institutional branding
- **Apply Crimson** (`#C41330`) exclusively for announcements and alert-class content to draw urgent attention
- **Maintain 1.5× line height** (or 21px per 14px font) for body text to ensure readability and accessibility
- **Stack spacing in multiples of 4px** — use `12px`, `16px`, `24px`, `32px` margins and padding for grid alignment
- **Pair Arial with weights 400 and 700 only** — no intermediate weights or decorative variants
- **Nest components within 2px border radius** for buttons and inputs; use `3.8px` only for modal corners
- **Test all links against #00549B** background to ensure adequate contrast (minimum 4.5:1 WCAG AA)
- **Left-align all body text and form labels** for clarity and accessibility in left-to-right layouts
- **Use the modal drop shadow** (`0px 4px 12px rgba(0, 0, 0, 0.15)`) consistently for all overlay elements
- **Reserve Success Green** and **Warning Amber** for status-specific states; do not use for general emphasis
- **Add `aria-label` and `role` attributes** to all icon buttons for screen reader compatibility

### Don't

- **Do not mix Primary Blue with Crimson** in the same navigation or section header — each has distinct semantic meaning
- **Avoid font sizes outside the scale** (12, 14, 17.5, 20, 28px); custom sizes fracture consistency
- **Never remove focus outlines** on keyboard-navigable elements; replace with `box-shadow` if needed
- **Do not apply shadows to text or flat backgrounds** — shadows are reserved for elevated surfaces (cards, modals)
- **Avoid using `#495057` (secondary gray)** or `#6C757D` (tertiary gray) for primary body text; reserve for captions and metadata only
- **Never use color alone** to communicate status or meaning — pair with text labels, icons, or additional visual cues
- **Do not exceed 2 levels of nesting** for border-radius values (`2px` for standard, `3.8px` for special cases)
- **Avoid stretching buttons wider than necessary** — keep them compact with `auto` width and proportional padding
- **Do not apply multiple hover effects simultaneously** (e.g., shadow + color shift + scale); choose one primary effect per component
- **Never set line-height below 1.2× font size**; minimum `18px` height for inputs and buttons
- **Avoid decorative underlines on links** — use color differentiation or italic weight instead unless hovering
- **Do not hard-code spacing values in components** — always reference the spacing scale (4, 8, 12, 16, 20, 24, 28, 32, 36, 100px)

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width | Key Changes |
|-----------------|-------|-------------|
| **Mobile (xs)** | `< 576px` | Single column, full-width containers, `16px` padding, stacked navigation, hide sidebar |
| **Tablet (sm)** | `576px–768px` | Two-column grid, reduced padding `20px`, hamburger menu, sidebar as drawer |
| **Desktop (md)** | `768px–992px` | Three-column grid, `24px` padding, full navigation bar, sidebar visible |
| **Large Desktop (lg)** | `≥ 992px` | Full 12-column grid, `32px` padding, max-width `1200px` centered container, all navigation visible |

**Key Responsive Changes**:
- **Typography**: Heading sizes reduce by 2–4px on mobile (e.g., H3 from `20px` to `18px`)
- **Spacing**: Margins reduce by 50% on mobile (e.g., `24px` → `12px`)
- **Components**: Buttons increase touch target to `48px` height on mobile; inputs scale to `36px`
- **Navigation**: Top bar remains fixed; sidebar collapses into drawer on sm/xs; breadcrumbs collapse to icon on xs

### Touch Targets

- **Minimum Height**: `48px` for all touch-interactive elements (buttons, links, input fields)
- **Minimum Width**: `48px` for icon buttons
- **Padding Adjustment**: On mobile, increase button padding from `6px 12px` to `12px 16px` to meet `48px` target
- **Link Spacing**: Minimum `8px` gap between adjacent links to prevent mis-taps
- **Form Field Height**: Mobile inputs scale from `24px` to `36px` to accommodate touch precision

### Collapsing Strategy

**Mobile (xs)**:
- Single column; full-width cards
- Navigation collapses to hamburger menu in top bar
- Sidebar (if present) transforms into off-canvas drawer
- Hero announcements stack vertically
- Image-heavy cards load optimized, smaller crops

**Tablet (sm)**:
- Two-column layout for dual-card sections
- Top navigation wraps or shows abbreviated labels
- Sidebar remains collapsed; accessible via button
- Forms spread across two columns where appropriate

**Desktop (md+)**:
- Three or more columns available
- Full navigation bar visible with all items inline
- Sidebar visible on right or left
- Hero sections can expand to multi-column layouts
- Modals maintain fixed max-width; do not stretch full-screen

**Specific Component Behavior**:
- **Cards**: Reduce from 3 columns (lg) → 2 columns (md) → 1 column (xs); adjust padding from `20px` (lg) → `16px` (xs)
- **Buttons**: Increase padding on xs/sm; reduce font size by 1–2px if width-constrained
- **Inputs**: Stack vertically on xs; display inline with label on md+
- **Navigation Items**: Hide labels, show icons only on xs; full labels on md+; wrapping is acceptable on sm

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA & Navigation**: Deep Academic Blue (`#00549B`)
- **Announcements & Alerts**: Crimson Alert (`#C41330`)
- **Body Text**: Text Primary (`#212529`)
- **Disabled/Muted**: Icon Gray (`#999999`)
- **Background/Container**: Pure White (`#FFFFFF`) or Light Gray Background (`#F8F9FA`)
- **Form Border**: Light Border (`#DEE2E6`)
- **Link Text**: Link Blue (`#00549B`)
- **Success State**: Success Green (`#28A745`)
- **Error State**: Dark Crimson (`#E73A35`)
- **Hover/Focus Overlay**: Blue at `0.08–0.15` opacity over base

### Iteration Guide

1. **Always start with Primary Blue** (`#00549B`) for navigation bars, header backgrounds, and main CTAs. This is the institutional identity color.

2. **Use Crimson** (`#C41330`) exclusively for `THÔNG BÁO` (announcements) and error/alert states. Do not apply to general UI elements.

3. **Set all body text to Text Primary** (`#212529`) at `14px` weight `400` line-height `21px`. For captions, reduce to `12px` and use Text Secondary or Text Tertiary.

4. **Follow the spacing scale strictly**: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `28px`, `32px`. All margins and padding must align to this scale to maintain grid rhythm.

5. **Apply Arial without fallback** (or with Helvetica, sans-serif backup). Use weight `400` for body and `700` for headings; never use 300, 500, 600, or 800.

6. **Style all buttons with `border-radius: 2px`** (exception: modal corners use `3.8px`). Buttons must have minimum `30px` height on desktop, `48px` on mobile.

7. **Add a focus box-shadow** of `0px 0px 0px 2px rgba(0, 84, 155, 0.1)` to all form inputs and buttons for keyboard accessibility. Never remove the focus outline.

8. **Use card shadow** `0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)` for standard elevation; increase to `0px 2px 6px rgba(0, 0, 0, 0.15), 0px 2px 4px rgba(0, 0, 0, 0.30)` on hover or for modals.

9. **Ensure all color contrast is ≥ 4.5:1** (WCAG AA) for body text against backgrounds. Test Primary Blue (`#00549B`) text on white and Light Gray Background (`#F8F9FA`).

10. **Responsive rule**: On mobile (`< 576px`), reduce padding from `20px` to `16px`, button height from `30px` to `48px` with adjusted padding `12px 16px`, and stack navigation items vertically. Use `max-width: 100%` and `padding: 0 16px` for full-width containers.

11. **Link styling**: All text links default to `#00549B`, weight `400`. On hover, darken to `#003D73` and add `text-decoration: underline`. On visited, apply `#663399`. Do not use color alone for interactivity.

12. **Modal structure**: Wrap in fixed positioning, `z-index: 1000`, with semi-transparent backdrop `rgba(0, 0, 0, 0.5)`. Inner dialog: `background: #FFFFFF`, `border-radius: 3.8px`, `box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15)`. Header: `background: #F8F9FA`, `border-bottom: 1px solid #DEE2E6`, `padding: 16px 20px`.