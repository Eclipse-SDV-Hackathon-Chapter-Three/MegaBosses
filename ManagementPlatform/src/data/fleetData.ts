/**
 * Fleet Base Data - Vehicle Inventory
 *
 * Simplified vehicle data focusing on identification and basic telemetry
 * In production: GET /api/fleet
 */

import type { Vehicle, SoftwareVersion } from '../types';
import { getLatestVersion } from './softwareCatalog';

/**
 * Helper to create software versions with auto-detection of available updates
 */
function createSoftwareVersions(versions: Array<{ component: any; current: string; lastUpdate: string }>): SoftwareVersion[] {
	return versions.map(v => {
		const latest = getLatestVersion(v.component);
		const needsUpdate = latest && latest !== v.current;

		return {
			component: v.component,
			currentVersion: v.current,
			availableVersion: needsUpdate ? latest : undefined,
			lastUpdate: v.lastUpdate
		};
	});
}

/**
 * Base fleet data - In production this comes from backend
 */
export const fleetData: Vehicle[] = [
	{
		id: 'FL-PT-4701',
		type: 'Heavy Duty',
		model: 'Scania P 320 DB4x2',
		location: 'Baguim Depot - Porto',
		status: 'parked',
		battery: 87,
		engineOn: false,
		networkStrength: 72,
		software: createSoftwareVersions([
			{ component: 'ABS', current: 'v2.4.1', lastUpdate: '2025-09-28' },
			{ component: 'Instrument Cluster', current: 'v3.1.2', lastUpdate: '2025-09-28' },
			{ component: 'Emergency Braking', current: 'v1.8.4', lastUpdate: '2025-09-28' },
			{ component: 'Hydraulic Control', current: 'v4.2.2-euro6', lastUpdate: '2025-09-28' },
			{ component: 'Engine Management', current: 'v5.0.3', lastUpdate: '2025-09-28' },
		])
	},
	{
		id: 'FL-PT-4702',
		type: 'Medium Duty',
		model: 'Volvo FE 280',
		location: 'Baguim Depot - Porto',
		status: 'parked',
		battery: 62,
		engineOn: false,
		networkStrength: 78,
		software: createSoftwareVersions([
			{ component: 'ABS', current: 'v2.3.8', lastUpdate: '2025-06-10' },
			{ component: 'Instrument Cluster', current: 'v3.0.5', lastUpdate: '2025-07-15' },
			{ component: 'Emergency Braking', current: 'v1.7.9', lastUpdate: '2025-05-25' },
			{ component: 'Hydraulic Control', current: 'v4.1.8-euro6', lastUpdate: '2025-08-28' },
			{ component: 'Engine Management', current: 'v5.0.2', lastUpdate: '2025-08-15' },
		])
	},
	{
		id: 'FL-PT-4703',
		type: 'Heavy Duty',
		model: 'Scania P 320 DB4x2',
		location: 'Baguim Depot - Porto',
		status: 'parked',
		battery: 45,
		engineOn: false,
		networkStrength: 68,
		software: createSoftwareVersions([
			{ component: 'ABS', current: 'v2.4.1', lastUpdate: '2025-08-20' },
			{ component: 'Instrument Cluster', current: 'v3.1.0', lastUpdate: '2025-09-05' },
			{ component: 'Emergency Braking', current: 'v1.8.3', lastUpdate: '2025-07-25' },
			{ component: 'Hydraulic Control', current: 'v4.2.1-euro6', lastUpdate: '2025-09-20' },
			{ component: 'Engine Management', current: 'v4.9.8', lastUpdate: '2025-07-10' },
		])
	},
	{
		id: 'FL-PT-4704',
		type: 'Light Duty',
		model: 'Mercedes Econic 2630',
		location: 'Baguim Depot - Porto',
		status: 'idle',
		battery: 91,
		engineOn: true,
		networkStrength: 65,
		software: createSoftwareVersions([
			{ component: 'ABS', current: 'v2.4.1', lastUpdate: '2025-08-25' },
			{ component: 'Instrument Cluster', current: 'v3.1.0', lastUpdate: '2025-09-10' },
			{ component: 'Emergency Braking', current: 'v1.8.4', lastUpdate: '2025-09-25' },
			{ component: 'Hydraulic Control', current: 'v4.2.1-euro6', lastUpdate: '2025-09-18' },
			{ component: 'Engine Management', current: 'v5.0.2', lastUpdate: '2025-08-20' },
		])
	},
	{
		id: 'FL-PT-4705',
		type: 'Specialized',
		model: 'Volvo FL 280',
		location: 'Ermesinde Depot - Valongo',
		status: 'parked',
		battery: 78,
		engineOn: false,
		networkStrength: 81,
		software: createSoftwareVersions([
			{ component: 'ABS', current: 'v2.3.5', lastUpdate: '2025-05-15' },
			{ component: 'Instrument Cluster', current: 'v3.0.2', lastUpdate: '2025-06-20' },
			{ component: 'Emergency Braking', current: 'v1.7.5', lastUpdate: '2025-04-10' },
			{ component: 'Hydraulic Control', current: 'v4.1.5-euro6', lastUpdate: '2025-08-15' },
			{ component: 'Engine Management', current: 'v4.9.5', lastUpdate: '2025-06-05' },
		])
	},
	{
		id: 'FL-PT-4706',
		type: 'Heavy Duty',
		model: 'Scania P 320 DB4x2',
		location: 'Ermesinde Depot - Valongo',
		status: 'parked',
		battery: 95,
		engineOn: false,
		networkStrength: 75,
		software: createSoftwareVersions([
			{ component: 'ABS', current: 'v2.4.0', lastUpdate: '2025-08-05' },
			{ component: 'Instrument Cluster', current: 'v3.0.8', lastUpdate: '2025-08-18' },
			{ component: 'Emergency Braking', current: 'v1.8.1', lastUpdate: '2025-07-12' },
			{ component: 'Hydraulic Control', current: 'v4.2.0-euro6', lastUpdate: '2025-09-10' },
			{ component: 'Engine Management', current: 'v5.0.1', lastUpdate: '2025-08-22' },
		])
	}
];
