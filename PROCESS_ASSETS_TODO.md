# Process Asset Framework: Implementation TODO

This document outlines the phased implementation plan for building the Process Asset Framework, evolving it from a manual data entry tool into an intelligent, self-improving organizational knowledge base.

---

## Phase 1: Foundational Scaffolding (Complete)

This phase establishes the core data structures and UI for manually managing process assets.

- **[x] Data Model:**
  - `ProcessAsset` type created in `types.ts`.
  - `processAssets: ProcessAsset[]` added to `ProjectData`.
- **[x] UI Page:**
  - `ProcessAssetsPage.tsx` created for CRUD operations.
  - Modal implemented for creating and editing assets.
- **[x] State Management:**
  - `App.tsx` updated with handlers (`handleAddProcessAsset`, `handleUpdateProcessAsset`, `handleDeleteProcessAsset`).
  - Audit log entries created for all asset modifications.
- **[x] Navigation:**
  - "Process Assets" added to the sidebar and application navigation.

---

## Phase 2: AI-Powered Asset Generation & Manual Linking (Complete)

This phase focuses on populating the knowledge base and allowing users to manually connect assets to project artifacts.

- **[x] Enhance Asset Modal:**

  - ✅ Add multi-select UI components to the `ProcessAssetModal` to allow manual linking of a Process Asset to:
    - Requirements
    - Risks
    - Configuration Items
  - ✅ Implemented new link structures in `ProjectData`: `assetLinks: { [assetId: string]: { requirements: string[], risks: string[], cis: string[] } }`.

- **[x] AI-Powered Asset Import (One-Time Action):**

  - ✅ Created "AI Scan for Assets" button on the `ProcessAssetsPage`.
  - ✅ **Backend (Gemini):** Implemented `scanForProcessAssets()` function that analyzes the entire `projectData` JSON to identify recurring patterns and generate reusable process assets.
  - ✅ **Frontend:** Implemented `ProcessAssetReviewModal` where users can review and selectively import suggested assets.

- **[x] "Generate from Asset" Feature:**
  - ✅ Added "Create from Asset" buttons on `RequirementsPage`, `RisksPage`, and other relevant pages.
  - ✅ Implemented `AssetSelectionModal` showing relevant process assets filtered by type.
  - ✅ Pre-filling functionality when creating new items from asset templates.
  - ✅ Asset usage tracking implemented in `ProjectData.assetUsage`.

---

## Phase 3: Contextual Intelligence & Real-Time Assistance (Complete)

This phase makes the system proactive, suggesting assets and guidance as the user works.

- **[x] Real-Time Suggestions:**

  - ✅ Implemented debounced AI suggestions (1.5 second delay) in requirement, risk, test case, and CI modals.
  - ✅ **Backend (Gemini):** Created `suggestRelevantAsset()` function that analyzes user input against available process assets with 60% similarity threshold.
  - ✅ **Frontend:** Enhanced `AiSuggestionCard` component with beautiful gradient UI, asset previews, usage analytics, and apply/dismiss functionality.
  - ✅ Context-aware suggestions for different asset types (Requirements, Risks, Tests, CIs).

- **[x] Hybrid Wiki/Structured Data Implementation:**

  - ✅ **Goal:** Store assets in machine-readable format and generate human-readable documentation.
  - ✅ **Implementation:**
    1.  ✅ Implemented `.ignition/assets/` directory structure via `assetFileService.ts`.
    2.  ✅ Process assets saved as structured JSON files with metadata, content, usage tracking, and links.
    3.  ✅ Auto-generation of `PROCESS_ASSETS.md` documentation via `assetDocumentationService.ts`.
    4.  ✅ GitHub integration for saving structured files and updating documentation.
    5.  ✅ Hybrid wiki system with `hybridWikiService.ts` orchestrating the entire workflow.

- **[x] Enhanced Suggestion UI Components:**

  - ✅ Created reusable `AiSuggestionCard` component with context-aware styling.
  - ✅ Gradient backgrounds, sparkle animations, and professional loading states.
  - ✅ Asset preview with content snippets and usage statistics.
  - ✅ Integrated across Requirements, Risks, Test Cases, and Configuration pages.

- **[x] Asset Performance Analytics:**
  - ✅ Implemented `AssetAnalyticsCard` component with comprehensive metrics.
  - ✅ Usage tracking, success rates, popularity rankings, and trend analysis.
  - ✅ Analytics dashboard toggle in Process Assets page.
  - ✅ Visual effectiveness scoring with color-coded indicators.

---

## Phase 4: Organizational Intelligence & Automated Evolution

This is the ultimate goal, where the system learns and improves across projects. This requires a backend service and is a significant architectural expansion.

- **[ ] Cross-Project Analysis Engine:**

  - Develop a service that can be pointed at a GitHub organization.
  - This service will periodically fetch and analyze all `ignition-project.json` files and `.ignition/assets/` directories across all repositories.
  - It will aggregate all process assets into a central organizational knowledge base.

- **[ ] Asset Performance Tracking:**

  - In `ProjectData`, log when a process asset is used (e.g., a requirement is created from an archetype).
  - Track metrics associated with that usage (e.g., time to implement the requirement, number of associated bugs).

- **[ ] Feedback and A/B Testing:**

  - Add a simple "Was this helpful?" (thumbs up/down) UI to every AI suggestion that stems from an asset.
  - Use this feedback to score the effectiveness of each asset.
  - Allow for A/B testing where two different solution blueprints could be suggested for the same type of problem to see which performs better over time.

- **[ ] Automated Asset Refinement:**
  - Create a scheduled AI task.
  - **Backend (Gemini):** Feed an underperforming or outdated process asset to Gemini, along with project data where it was used successfully and unsuccessfully, and user feedback.
  - **Prompt:** > "Given this process asset, its performance data, and user feedback, suggest an improved version. Update its content to reflect best practices learned from the successful projects. Return the updated `ProcessAsset` JSON object."
  - The suggested change can be presented to a project lead or administrator for approval before being committed to the organizational knowledge base.
