/**
 * All static/mock Civic Insights prototype datasets have been removed.
 * Data is now retrieved dynamically from PostgreSQL via backend analytics endpoints:
 *   GET /api/insights/overview
 *   GET /api/insights/record
 *   GET /api/insights/services
 */

export const IS_PROTOTYPE_DATA = false;
export const PROTOTYPE_DATA_LABEL = "Authoritative Database Records";
