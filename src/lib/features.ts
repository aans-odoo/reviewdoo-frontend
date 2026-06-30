/**
 * Feature flags for the frontend.
 *
 * PIPELINE_ENABLED toggles the automated review-checklist ingestion pipeline
 * (GitHub ingestion, authors, ingestion logs, rejected comments, AI/GitHub
 * config, and the pipeline explainer page).
 *
 * It is temporarily disabled so review checklists can only be added manually
 * through the UI. Flip this back to `true` to restore the pipeline features.
 */
export const PIPELINE_ENABLED = false;
