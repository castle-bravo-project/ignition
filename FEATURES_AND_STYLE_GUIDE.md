
# Ignition AI: Features & Style Guide

This document provides a comprehensive overview of the Ignition AI application's current features and the style guide used to create its aesthetic.

## 1. Core Features

The application is a comprehensive bootstrapping tool designed to accelerate software development project initiation and management.

### 1.1 Project & Artifact Management
- **Dashboard:** A central hub displaying key project metrics like overall health, document completeness, test coverage, CI coverage, and open risks.
- **Requirements Management:** Create, update, delete, and track requirements with status, priority, and unique IDs.
- **Test Case Management:** Define test cases with status and BDD-style Gherkin scripts.
- **Configuration Management:** Catalog all versioned Configuration Items (CIs), including software components, documents, and architectural products.
- **Risk Management:** Identify, track, and manage project risks with defined probability, impact, and status.
- **Audit Log:** A chronological, filterable log of every significant action taken within the project by users, the AI, or the system.

### 1.2 GitHub Integration
- **Secure Connection:** Connects to any GitHub repository using a user-provided Personal Access Token (PAT), which is stored securely in the browser's local storage.
- **Project Persistence:** Load and save the entire project state to a specified JSON file in the connected repository, creating a version history via Git commits.
- **Error Handling:** Provides clear, user-friendly error messages for common API issues (e.g., 403 Forbidden for incorrect PAT scope, 404 Not Found for wrong path).

### 1.3 AI-Powered Features (Gemini API)
- **AI Assistant Chat:** An interactive chat interface for general Q&A on CMMI and software development best practices.
- **Guided Content Generation:** AI drafts content for specific, predefined sections within project documents (e.g., "Scope" in the SDP).
- **Content Improvement:** One-click enhancement of existing text in document sections for clarity and professionalism.
- **Requirement & Test Case Suggestion:** AI analyzes project context to suggest new, relevant requirements and corresponding test cases, complete with Gherkin scripts.
- **Repository-Aware CI Scanner:** Scans the repository's file tree, identifies potential Configuration Items, and presents them for review and import.
- **Pull Request Analyzer:**
    - Fetches and analyzes open PRs from the connected repository.
    - Identifies which requirements, CIs, and risks are impacted by the PR's file changes.
    - Generates a summary and a conventional commit message.
    - Allows posting the analysis directly as a comment to the PR on GitHub.
- **CMMI Recommendations:** Provides actionable, context-aware advice on how to improve scores for specific CMMI Process Areas.

### 1.4 Traceability & Visualization
- **Live RTM:** A Requirements Traceability Matrix on the dashboard showing links between requirements, tests, CIs, and GitHub issues.
- **Interactive Risk Heat Map:** A 3x3 grid visualizing risks by probability and impact. Cells are interactive, allowing users to drill down and view specific risks in a category.
- **Full Traceability Loop:**
    - A dedicated "Issues" page lists open GitHub issues.
    - Issues can be linked to multiple requirements, CIs, and risks.
    - These links are visible on the `Configuration` and `Risks` pages, creating a complete, bi-directional traceability web from work items to project artifacts.
- **System Architecture Diagram:** Automatically generates and displays a Mermaid.js flow diagram based on the dependencies defined between Configuration Items.
- **CMMI Assessment Dashboard:** A live analysis of the project's alignment with CMMI, providing an overall maturity level and individual scores for each process area.
- **Project Badges:** A page for generating dynamic `shields.io`-style badges for project health, test coverage, CMMI level, etc., with snippets for easy embedding in README files.

---

## 2. Ignition UI Style Guide

This guide outlines the aesthetic and design system for the application.

### 2.1 Color Palette

The palette is designed for a modern, dark-mode developer tool aesthetic.

| Role              | Hex Code  | Tailwind Class        | Description                               |
| ----------------- | --------- | --------------------- | ----------------------------------------- |
| **Primary Brand** | `#f59e0b` | `brand-primary`       | Main actions, highlights, active states.  |
| **Secondary Brand**| `#fbbf24` | `brand-secondary`     | Hover states for primary, secondary info. |
| **Main BG**       | `#0d1117` | `bg-gray-950`         | Outermost background color.               |
| **Card BG**       | `#161b22` | `bg-gray-900`         | Primary background for content cards.     |
| **Border / BG-2** | `#21262d` | `bg-gray-800`         | Borders, table headers, input BG.         |
| **Interactive**   | `#30363d` | `border-gray-700`     | Default borders, interactive elements.    |
| **Text Muted**    | `#4b5563` | `text-gray-600`       | Secondary or disabled text.               |
| **Text Default**  | `#e5e7eb` | `text-white`/`gray-200`| Default text color.                       |

**Status Colors:**
- **Success (Green):** `bg-green-900/50`, `text-green-300`, `border-green-700`
- **Information (Blue):** `bg-blue-900/50`, `text-blue-300`, `border-blue-700`
- **Warning (Yellow):** `bg-yellow-900/50`, `text-yellow-300`, `border-yellow-700`
- **Danger (Red):** `bg-red-900/50`, `text-red-300`, `border-red-700`
- **Special (Purple):** `bg-purple-900/50`, `text-purple-300`, `border-purple-700`
- **Code/Mono (Cyan):** `text-cyan-300`

### 2.2 Typography

- **Primary Font:** System default sans-serif (`font-sans`).
- **Monospace Font:** System default monospace (`font-mono`). Used for IDs, code snippets, and Gherkin scripts.
- **Headings:**
    - `<h1>`: `text-3xl font-bold text-white`
    - `<h2>`: `text-xl font-semibold text-white`
    - `<h3>`: `text-lg font-bold/semibold text-white`
- **Body & Paragraphs:** `text-sm text-gray-400`
- **Labels:** `text-sm font-medium text-gray-300`

### 2.3 Iconography

- **Library:** [Lucide React](https://lucide.dev/)
- **Style:** Minimalist, clean, line-art style.
- **Standard Size:** `16px` or `20px`.
- **Key Icons:** `Zap`, `Save`, `Edit`, `Trash2`, `Plus`, `Github`, `Bot`, `Sparkles`, `RefreshCw`, `LayoutDashboard`, `FileText`, `CheckSquare`, etc.

### 2.4 Component Design Language

- **Layout:** Spacious, using an 8-point grid system for padding and margins (e.g., `p-6`, `space-y-8`).
- **Cards:** `bg-gray-900`, `border border-gray-800`, `rounded-lg`. Use a `hover:border-brand-primary` transition for interactivity.
- **Buttons:**
    - **Primary:** `bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary`.
    - **Secondary/Destructive:** `bg-red-600 text-white`.
    - **Tertiary:** `bg-gray-700 text-white hover:bg-gray-600`.
    - **AI/Special:** A ghost-style button with `bg-brand-primary/10`, `border-brand-primary/30`, and `text-brand-primary`.
    - **Disabled State:** `disabled:bg-gray-600` or `disabled:opacity-50`, with `disabled:cursor-not-allowed`.
- **Inputs & Selects:** `bg-gray-800`, `border border-gray-700`, `rounded-lg`. Use a `focus:ring-2 focus:ring-brand-primary` for accessible focus states.
- **Modals:**
    - Full-screen overlay with `bg-gray-950/80` and `backdrop-blur-sm`.
    - Main panel follows card styling (`bg-gray-900`, `border-gray-700`, `rounded-xl`).
    - Structured with a distinct `header`, `main` (scrollable), and `footer` section, separated by borders.
- **Tables:**
    - Header: `bg-gray-800`, `text-xs uppercase text-gray-300`.
    - Rows: `border-b border-gray-800`, with a `hover:bg-gray-800/50` state.
- **Tags/Pills:** Small, `rounded-full` or `rounded-md` elements with a background and border corresponding to their status color. Used for displaying status, priority, or type.

### 2.5 Transitions & Animations
- **General:** A subtle `transition-colors` with `duration-200` is applied to most interactive elements (buttons, links, card borders).
- **Loaders:** The `Loader` icon from Lucide uses a standard `animate-spin` utility.
- **Progress Bars:** SVG-based progress bars have a `transition-all duration-500` on their stroke property for a smooth fill effect.
