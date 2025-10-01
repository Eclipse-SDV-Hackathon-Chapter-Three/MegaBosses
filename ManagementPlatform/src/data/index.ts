/**
 * Data Module - Centralized Export
 *
 * This file maintains backward compatibility by re-exporting data from
 * the new modular structure. In production, these imports would be replaced
 * with API calls to the backend.
 *
 * Modular Structure:
 * - fleetData.ts → Vehicle inventory (GET /api/fleet)
 * - campaignsData.ts → Update campaigns (GET /api/campaigns)
 * - softwareCatalog.ts → Available software releases (GET /api/software/catalog)
 */

// Re-export fleet data
export { fleetData as mockFleetData } from './fleetData';

// Re-export campaigns data
export { campaignsData as mockCampaigns } from './campaignsData';

// Re-export software catalog
export * from './softwareCatalog';
