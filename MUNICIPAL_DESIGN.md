---
version: 1.0.0
name: CivicPulse Command Center (Municipal Operations)
description: "Municipal operational information architecture and command center structure styled strictly with the unified CivicPulse DESIGN.md visual identity."
colors:
  background: "#F9FAFB"
  surface: "#FFFFFF"
  surface-soft: "#F3F4F6"
  surface-elevated: "#FFFFFF"
  on-surface: "#1F2937"
  on-surface-muted: "#6B7280"
  outline: "#E5E7EB"
  outline-strong: "#D1D5DB"
  primary: "#2563EB"
  primary-strong: "#1D4ED8"
  primary-light: "#DBEAFE"
  on-primary: "#FFFFFF"
  shell-base: "#000000"
  on-shell: "#FFFFFF"
  shell-border: "#FFFFFF"
  success: "#16A34A"
  warning: "#D97706"
  danger: "#DC2626"
  info: "#2563EB"
  status-open-bg: "#DBEAFE"
  status-open-fg: "#1E40AF"
  status-acknowledged-bg: "#F3E8FF"
  status-acknowledged-fg: "#6B21A8"
  status-in-progress-bg: "#FEF3C7"
  status-in-progress-fg: "#92400E"
  status-resolved-bg: "#DCFCE7"
  status-resolved-fg: "#166534"
  status-rejected-bg: "#FEE2E2"
  status-rejected-fg: "#991B1B"
typography:
  font-family: "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  display-hero:
    fontFamily: "'Inter', sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: "2.5rem"
  headline-xl:
    fontFamily: "'Inter', sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: "2.25rem"
  headline-lg:
    fontFamily: "'Inter', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "2.25rem"
  title-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  body-lg:
    fontFamily: "'Inter', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  body-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  body-sm:
    fontFamily: "'Inter', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
layout:
  container-max: "1400px"
  shell-header-height: "64px"
  shell-sidebar-expanded: "256px"
  shell-sidebar-collapsed: "64px"
components:
  shell-sidebar:
    backgroundColor: "rgba(0, 0, 0, 0.85)"
    textColor: "#FFFFFF"
    width: "{layout.shell-sidebar-expanded}"
  shell-header:
    backgroundColor: "#FFFFFF"
    textColor: "#1F2937"
    height: "{layout.shell-header-height}"
  nav-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
---

# Municipal Command Center Architecture (CivicPulse)

## 1. Overview & Architectural Philosophy

The **Municipal Operations Portal** uses a **Command Center Information Architecture** designed for high data density, rapid scanning, and operational decision-making. 

> [!IMPORTANT]
> **Unified Design System Rule**:
> - `MUNICIPAL_DESIGN.md` defines **STRUCTURE, INFORMATION ARCHITECTURE, and LAYOUT COMPOSITION**.
> - `DESIGN.md` defines **ALL VISUAL STYLING** (color palette, primary blue `#2563EB` accents, typography, card elevation, border radii, status badges, and buttons).
> - The Municipal Portal must visually belong to the exact same **CivicPulse** product suite as the Citizen Portal.

---

## 2. Preserved Command Center Layout & Information Architecture

### A. Shell Structure
- **Sidebar (`MunicipalSidebar`)**:
  - Width: `256px` expanded (`64px` collapsed).
  - Background: Dark glass (`rgba(0,0,0,0.85)` + `backdrop-blur-md`).
  - Active item: Primary Blue fill (`#2563EB`) with crisp white text.
  - Links: Dashboard, Complaints, Map View, Departments, Analytics, Citizens, Settings.
- **Header (`MunicipalHeader`)**:
  - Height: `64px`.
  - Content: Global search input (`id="municipal-global-search"`), quick notifications button, municipal officer profile avatar, portal title.

### B. Dashboard Composition (`/municipal/dashboard`)
- **KPI Metrics Strip**: 4 top cards displaying total complaints, resolved count, pending items, and urgent escalations.
- **Analytics Row**:
  - 2/3 width: **Weekly Activity Bar Chart** powered by Recharts (Reported vs. Resolved).
  - 1/3 width: **Department Load Progress** (departmental resolution percentage progress bars).
- **Recent Complaints Table**: Full-width tabular view displaying recent reports with real-time category, status, and priority badges.

### C. Complaint Management Architecture (`/municipal/complaints`)
- **Filters Strip**: Search input, status filter chips (`All`, `Open`, `Acknowledged`, `In Progress`, `Resolved`, `Rejected`), and category chips.
- **Data Table**: Tabular view featuring Title, Category Badge, Status Badge, Priority Badge, Ward Location, Upvotes, and Timestamp.
- **Complaint Detail View (`/municipal/complaints/:id`)**:
  - Left Panel (2/3): Title, category/status badges, full description, location details, map placeholder, attachments.
  - Right Sidebar (1/3): Reporter details, assigned department card, metadata timestamps, and "Update Status" action button launching an update modal.

### D. Geospatial Map Architecture (`/municipal/map`)
- **Map Canvas**: Interactive city grid map with status-coded complaint location pins and interactive click popups.
- **Hotspot Sidebar**: Ward-level high-density issue counts and active pin shortcut list.

### E. Department Operations Architecture (`/municipal/departments`)
- **Grid Layout**: 3-column grid of cards for each municipal department (Roads, Water, Electricity, Sanitation, Parks, Street Lighting).
- **Metrics**: Resolution rate progress bars, response times, assigned officer counts, and performance percentages.

### F. Analytics Composition (`/municipal/analytics`)
- **KPI Summary Strip**: Avg. resolution time, overall resolution rate, reopened issue count, citizen satisfaction score.
- **Charts Row**: Monthly reported vs. resolved bar chart + category distribution donut chart.
- **Trend Chart**: 6-month resolution rate percentage line chart.

### G. Citizens Directory (`/municipal/citizens`)
- **Search & Stats**: High-level registered user counters, search bar by name/email/pincode, citizen data table with individual resolution progress bars.

### H. Portal Settings (`/municipal/settings`)
- **Tabbed Layout**: General, Notifications, Access & Workflow, Display Preferences, and Data Management tabs with toggle switches and CSV data export.

---

## 3. Visual Styling — Enforced strictly from `DESIGN.md`

All visual tokens MUST strictly match `DESIGN.md`:

| Visual Token | Specification (from `DESIGN.md`) |
| :--- | :--- |
| **Primary Accent** | Primary Blue (`#2563EB` / `primary-600`) |
| **Primary Hover** | Deep Blue (`#1D4ED8` / `primary-700`) |
| **Background Tint** | Soft Neutral (`#F9FAFB` / `bg-background`) |
| **Surface Cards** | Stark White (`#FFFFFF`) with border `#E5E7EB` |
| **Typography** | `Inter` / System Sans-Serif (`font-sans`) |
| **Status Badges** | `Open` (Blue), `Acknowledged` (Purple), `In Progress` (Yellow), `Resolved` (Green), `Rejected` (Red) |
| **Buttons** | Rounded-md (`8px`), Primary Blue fill, white text, subtle hover lift |
| **Cards & Containers**| Rounded-lg (`12px`), border `secondary-200`, subtle card shadow (`shadow-card`) |

---

## 4. Do's and Don'ts

- **DO** preserve the high information density, tabular layout, and operational sidebar/header structure of the Command Center.
- **DO** use the unified CivicPulse Primary Blue (`#2563EB`) as the primary interactive and brand accent.
- **DO** ensure the Municipal Portal visually feels like part of the exact same product as the Citizen Portal.
- **DON'T** introduce competing orange (`#fe6e00`), warm brown (`#423d38`), or off-white paper (`#fcfaf7`) color palettes.
- **DON'T** alter the application code logic or remove municipal functionality.
