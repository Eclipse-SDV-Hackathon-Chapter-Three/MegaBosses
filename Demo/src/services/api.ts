import { mockFleetData, mockCampaigns } from '../data/index';
import type { Vehicle, Campaign } from '../types';

/**
 * Fleet API Service
 *
 * Provides interface to fleet management backend.
 * Currently uses mock data for hackathon demo.
 *
 * PRODUCTION INTEGRATION:
 * 1. Backend defines all campaigns with their policies
 * 2. Frontend fetches data via REST/GraphQL API
 * 3. Frontend evaluates policies locally for instant feedback
 * 4. Frontend sends trigger commands back to backend
 * 5. Backend executes actual OTA update via vehicle gateway
 */

// Environment configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK !== 'false'; // Default to mock for demo

class FleetAPI {
	/**
	 * Fetch all vehicles in the fleet with current telemetry
	 *
	 * BACKEND ENDPOINT: GET /api/fleet
	 * Response format:
	 * {
	 *   "vehicles": [
	 *     {
	 *       "id": "FL-PT-4701",
	 *       "type": "Heavy Duty",
	 *       "model": "Scania P 320",
	 *       "location": "Baguim Depot - Porto",
	 *       "status": "parked",
	 *       "battery": 87,
	 *       "networkStrength": 72,
	 *       "software": [
	 *         {
	 *           "component": "ABS",
	 *           "currentVersion": "v2.4.1",
	 *           "lastUpdate": "2025-08-15"
	 *         }
	 *       ]
	 *     }
	 *   ]
	 * }
	 */
	static async getFleet(): Promise<Vehicle[]> {
		if (USE_MOCK_DATA) {
			// Mock data for demo/development
			return new Promise((resolve) => {
				setTimeout(() => resolve(mockFleetData), 500);
			});
		}

		// Production: Fetch from backend
		try {
			const response = await fetch(`${API_BASE}/fleet`);
			if (!response.ok) throw new Error('Failed to fetch fleet');
			const data = await response.json();
			return data.vehicles;
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	}

	/**
	 * Fetch all update campaigns with their policy configurations
	 *
	 * BACKEND ENDPOINT: GET /api/campaigns
	 * Response format:
	 * {
	 *   "campaigns": [
	 *     {
	 *       "id": "CAMP-2025-ABS-001",
	 *       "name": "ABS Security Patch v2.4.1",
	 *       "softwareComponent": "ABS",
	 *       "version": "v2.4.1",
	 *       "priority": "Critical",
	 *       "status": "Scheduled",
	 *       "targetVehicles": 3,
	 *       "completedVehicles": 0,
	 *       "packageSize": "45 MB",
	 *       "deadline": "2025-10-05",
	 *       "compliance": "UN R155 - Cybersecurity",
	 *       "description": "Critical security patch...",
	 *       "policyConfigs": [
	 *         {
	 *           "policyId": "batteryLevel",
	 *           "enabled": true,
	 *           "minBattery": 70
	 *         },
	 *         {
	 *           "policyId": "vehicleState",
	 *           "enabled": true
	 *         }
	 *       ]
	 *     }
	 *   ]
	 * }
	 *
	 * NOTE: Backend defines policies per campaign based on:
	 * - Update criticality (security vs feature)
	 * - Package size (larger = stricter network requirements)
	 * - ECU component (safety-critical = stricter policies)
	 * - Rollback complexity
	 */
	static async getCampaigns(): Promise<Campaign[]> {
		if (USE_MOCK_DATA) {
			// Mock data for demo/development
			return new Promise((resolve) => {
				setTimeout(() => resolve(mockCampaigns), 500);
			});
		}

		// Production: Fetch from backend
		try {
			const response = await fetch(`${API_BASE}/campaigns`);
			if (!response.ok) throw new Error('Failed to fetch campaigns');
			const data = await response.json();
			return data.campaigns;
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	}

	/**
	 * Trigger update campaign for specific vehicles
	 *
	 * BACKEND ENDPOINT: POST /api/campaigns/{campaignId}/trigger
	 * Request body:
	 * {
	 *   "vehicleIds": ["FL-PT-4701", "FL-PT-4702"]
	 * }
	 *
	 * Response:
	 * {
	 *   "success": true,
	 *   "campaignId": "CAMP-2025-ABS-001",
	 *   "triggeredVehicles": 2,
	 *   "jobId": "job-123456",
	 *   "estimatedCompletion": "2025-10-01T23:30:00Z"
	 * }
	 *
	 * Backend then:
	 * 1. Validates vehicles are still eligible (re-checks policies)
	 * 2. Queues update jobs in OTA orchestrator
	 * 3. Sends update package to vehicle gateways
	 * 4. Monitors update progress
	 * 5. Handles rollback if needed
	 */
	static async triggerCampaign(
		campaignId: string,
		vehicleIds: string[]
	): Promise<{ success: boolean; jobId?: string }> {
		if (USE_MOCK_DATA) {
			// Mock response for demo/development
			console.log('Triggering campaign:', campaignId, 'for vehicles:', vehicleIds);
			return new Promise((resolve) => {
				setTimeout(() => resolve({
					success: true,
					jobId: `job-${Date.now()}`
				}), 1000);
			});
		}

		// Production: Send to backend
		try {
			const response = await fetch(`${API_BASE}/campaigns/${campaignId}/trigger`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ vehicleIds })
			});
			if (!response.ok) throw new Error('Failed to trigger campaign');
			return response.json();
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	}

	/**
	 * Update individual vehicle component
	 *
	 * BACKEND ENDPOINT: POST /api/vehicles/{vehicleId}/update
	 * Request body:
	 * {
	 *   "component": "ABS",
	 *   "targetVersion": "v2.4.1"
	 * }
	 *
	 * Used for individual updates triggered from vehicle modal
	 */
	static async triggerVehicleUpdate(
		vehicleId: string,
		component: string,
		targetVersion: string
	): Promise<{ success: boolean; jobId?: string }> {
		if (USE_MOCK_DATA) {
			// Mock response for demo/development
			console.log(`Triggering update: ${vehicleId} -> ${component} ${targetVersion}`);
			return new Promise((resolve) => {
				setTimeout(() => resolve({
					success: true,
					jobId: `job-${Date.now()}`
				}), 800);
			});
		}

		// Production: Send to backend
		try {
			const response = await fetch(`${API_BASE}/vehicles/${vehicleId}/update`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ component, targetVersion })
			});
			if (!response.ok) throw new Error('Failed to trigger vehicle update');
			return response.json();
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	}

	/**
	 * Get available policy types (for admin/campaign creation UI)
	 *
	 * BACKEND ENDPOINT: GET /api/policies/available
	 * Returns list of policies that can be configured
	 */
	static async getAvailablePolicies(): Promise<Array<{
		id: string;
		name: string;
		description: string;
		parameters: Array<{ name: string; type: string; default?: any }>;
	}>> {
		if (USE_MOCK_DATA) {
			// Return hardcoded list for demo
			return Promise.resolve([
				{
					id: 'batteryLevel',
					name: 'Minimum Battery Level',
					description: 'UN R156: Ensures sufficient power for update and rollback',
					parameters: [
						{ name: 'minBattery', type: 'number', default: 50 }
					]
				},
				{
					id: 'vehicleState',
					name: 'Vehicle State Check',
					description: 'UN R156: Vehicle must be parked, engine off',
					parameters: []
				},
				{
					id: 'networkStrength',
					name: 'Network Connectivity',
					description: 'UN R156: Reliable network for package download',
					parameters: [
						{ name: 'minNetworkStrength', type: 'number', default: 70 }
					]
				},
				{
					id: 'depotLocation',
					name: 'Depot Location',
					description: 'Best Practice: Update only at controlled location',
					parameters: []
				},
				{
					id: 'collectionSchedule',
					name: 'Operational Schedule Protection',
					description: 'Operational: Prevents updates during fleet operations',
					parameters: []
				}
			]);
		}		// Production: Fetch from backend
		try {
			const response = await fetch(`${API_BASE}/policies/available`);
			if (!response.ok) throw new Error('Failed to fetch available policies');
			return response.json();
		} catch (error) {
			console.error('API Error:', error);
			throw error;
		}
	}
}

export default FleetAPI;
