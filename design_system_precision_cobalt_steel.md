# Three Doors (backdoorv.1): Design System Specification (Precision Cobalt & Steel)

**Document Version:** backdoorv.1  
**Target:** Visual Tokens, Typography Scale, Component Specs & Micro-Interactions  
**Design Principles:** High-Density Information, Zero Chromatic Fatigue, Precision Command Architecture  
**Strict Exclusion:** Completely excludes all indigo, violet, orange, and amber tones.

---

## 1. Visual Philosophy & Aesthetic Principles

Three Doors is engineered as a high-density, low-latency command center for career mobility. Its visual hierarchy is inspired by developer-first observability consoles and modern financial trading interfaces. 

*   **Precision over Decoration:** Zero gratuitous rounded gradients or decorative glassmorphism. Borders are crisp 1px lines (`rgba(255, 255, 255, 0.08)`).
*   **Zero Chromatic Fatigue:** Backgrounds use Deep Obsidian (`#080B11`) to prevent eye fatigue during intensive morning triage sessions.
*   **Deterministic Telemetry:** Color is strictly semantic. Every hue maps to an exact system state.

---

## 2. Complete Color Palette Tokens

### 2.1 Surfaces & Structural Layers

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| **`bg-canvas`** | `#080B11` | Deep Obsidian Void. Base viewport background. |
| **`bg-card`** | `#0F1523` | Technical Charcoal Slate. 1:1 Bento cards, table rows, and panel containers. |
| **`bg-drawer`** | `#161F33` | Elevated Deep Slate. 640px slide-out dossier drawer and modal dialogs. |
| **`border-subtle`** | `rgba(255, 255, 255, 0.08)` | 1px boundary on cards, dividers, and table headers. |
| **`border-elevated`**| `rgba(255, 255, 255, 0.14)` | Hover borders, active drawer edges, and popup menus. |

### 2.2 Brand & Interactive Accents (Zero Indigo / Violet)

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| **`accent-primary`** | `#2563EB` | **Precision Cobalt Blue.** Primary interactive triggers, active tab indicators, and submit buttons. Zero purple or indigo undertones. |
| **`accent-hover`**   | `#1D4ED8` | State hover for primary cobalt triggers. |
| **`accent-active`**  | `#1E40AF` | Pressed active state for buttons and links. |
| **`accent-ring`**    | `#3B82F6` | Keyboard focus ring on table rows and inputs (`ring-2 ring-blue-500`). |

### 2.3 Semantic State & Match Score Tints (Zero Orange / Amber)

| Token | Hex / Value | Badge Background & Border | Semantic State |
| :--- | :--- | :--- | :--- |
| **`status-top`** | `#10B981` *(Crisp Emerald)* | `bg-emerald-500/10 text-emerald-400 border-emerald-500/25` | **Top Fit ($\ge 70$):** High-confidence opportunity ready for immediate outreach. |
| **`status-mid`** | `#0284C7` / `#38BDF8` *(Technical Sky)* | `bg-sky-500/10 text-sky-400 border-sky-500/25` | **Exploratory ($40 - 69$):** Replaces orange/amber with clean blue telemetry. |
| **`status-low`** | `#64748B` *(Cool Slate)* | `bg-slate-800 text-slate-400 border-slate-700` | **Stretch ($< 40$):** Below threshold; kept visible under explicit filters. |
| **`status-action`**| `#0D9488` / `#14B8A6` *(Precision Teal)* | `bg-teal-500/10 text-teal-400 border-teal-500/25` | Ready Gmail drafts, verified emails, and active Google thread signals. |

### 2.4 High-Contrast Text Hierarchy

| Token | Hex / Value | Contrast Ratio | Semantic Role |
| :--- | :--- | :--- | :--- |
| **`text-primary`** | `#F8FAFC` | 17.5:1 (on `#080B11`) | Pure high-contrast white for headings, job titles, and fit scores. |
| **`text-secondary`**| `#94A3B8` | 8.2:1 (on `#080B11`) | Cool slate gray for descriptions, company metadata, and brief text. |
| **`text-muted`**   | `#475569` | 4.8:1 (on `#080B11`) | Graphite for timestamps, inactive source tags, and keyboard shortcut hints. |

---

## 3. Typography Scale & Font Stack

*   **Primary Font:** Inter Variable (`font-sans`), `-apple-system`, `sans-serif`.
*   **Monospace Font:** JetBrains Mono (`font-mono`), `ui-monospace`, `monospace`.

| Level | CSS Classes | Size / Line-Height | Font Weight | Primary Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Headline XL** | `text-2xl tracking-tight` | 24px / 32px | SemiBold (600) | Workspace area title, Drawer company title |
| **Heading LG** | `text-lg tracking-normal` | 18px / 26px | SemiBold (600) | Bento card company name, section headers |
| **Body Base** | `text-sm leading-relaxed` | 14px / 20px | Regular (400) | Job descriptions, email drafts, teardown text |
| **Body Medium** | `text-sm leading-normal` | 14px / 20px | Medium (500) | Interactive buttons, active navigation pills, Door chips |
| **Data Mono** | `text-xs font-mono` | 12px / 16px | Medium (500) | Fit score badges (`94`), timestamps, salary ranges |
| **Micro Caption** | `text-[11px] leading-tight`| 11px / 14px | Regular (400) | Timezone indicators, audit metadata, source badges |

---

## 4. Component Micro-Patterns & Specs

### 4.1 Score Badges (Monospace Pills)
*   **Top Fit ($\ge 70$):**
    ```html
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
      92% FIT
    </span>
    ```
*   **Exploratory ($40 - 69$):**
    ```html
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-sky-500/10 text-sky-400 border border-sky-500/25">
      64% FIT
    </span>
    ```
*   **Stretch ($< 40$):**
    ```html
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
      36% FIT
    </span>
    ```

### 4.2 The Three Doors Segmented Chips
Rendered on every Bento card and table row:
```html
<div class="inline-flex items-center gap-1">
  <span class="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33] text-teal-400 border border-teal-500/20 flex items-center gap-1">
    <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span> D1: Founder
  </span>
  <span class="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33] text-slate-300 border border-white/10">
    D2: Recruiter
  </span>
  <span class="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33] text-slate-400 border border-white/5">
    D3: Peer
  </span>
</div>
```

### 4.3 1:1 Bento Card Dimensions & States
*   **Dimensions:** $320\text{px} \times 320\text{px}$ aspect ratio 1:1 on desktop; flex auto on mobile.
*   **Resting State:** `bg-[#0F1523] border border-white/8 rounded-lg p-5 flex flex-col justify-between`.
*   **Hover State:** `hover:border-white/20 hover:shadow-lg transition-all duration-150`.
*   **Keyboard Active State:** `ring-2 ring-blue-500 border-transparent`.

### 4.4 Slide-Out Dossier Drawer
*   **Width:** $640\text{px}$ sliding from the right screen edge.
*   **Surface:** `bg-[#161F33] border-l border-white/10 shadow-2xl z-50`.
*   **Header Bar:** Displays company title, fit score, stage dropdown, and keyboard navigation cues (`[↑] Prev  [↓] Next  [Esc] Close`).
