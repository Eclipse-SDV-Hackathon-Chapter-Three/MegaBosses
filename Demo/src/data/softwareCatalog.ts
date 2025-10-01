/**
 * Software Catalog - Available ECU Components and Versions
 *
 * This would come from backend's software repository
 * Backend endpoint: GET /api/software/catalog
 */

import type { SoftwareComponent } from '../types';

export interface SoftwareRelease {
	component: SoftwareComponent;
	version: string;
}

/**
 * Available software releases for fleet updates
 * In production, this comes from backend's software repository
 */
export const softwareCatalog: SoftwareRelease[] = [
	{ component: 'ABS', version: 'v2.4.1' },
	{ component: 'Instrument Cluster', version: 'v3.1.2' },
	{ component: 'Emergency Braking', version: 'v1.8.4' },
	{ component: 'Hydraulic Control', version: 'v4.2.2-euro6' },
	{ component: 'Engine Management', version: 'v5.0.3' }
];

/**
 * Get latest version for a component
 */
export function getLatestVersion(component: SoftwareComponent): string | undefined {
	return softwareCatalog.find(sw => sw.component === component)?.version;
}

/**
 * Get software release info
 */
export function getSoftwareRelease(component: SoftwareComponent, version: string): SoftwareRelease | undefined {
	return softwareCatalog.find(sw => sw.component === component && sw.version === version);
}
