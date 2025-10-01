/**
 * Policy Engine for OTA Update Eligibility
 *
 * Evaluates vehicle context against configured policies to determine
 * if an OTA update can safely proceed.
 *
 * Based on UN R156 Software Update Management System (SUMS) requirements:
 * - Vehicle must be in safe state
 * - Sufficient power for update and rollback
 * - Network connectivity for package download
 * - Operational constraints (not during critical operations)
 *
 * Policies are defined by backend/campaign developers and sent as configuration.
 * This engine provides common evaluation functions that can be referenced by policy IDs.
 */

import type { Vehicle, PolicyConfig, EligibilityResult } from '../types';

/**
 * Common Policy Evaluators
 * These are standard checks based on UN R156 and automotive OTA best practices.
 * Backend can reference these by policyId and configure thresholds.
 */

/**
 * UN R156 Requirement: Updates should not occur during active vehicle operations
 * Evaluates if a vehicle is outside operational schedule
 */
function evaluateCollectionSchedule(_vehicle: Vehicle): boolean {
	// Allow updates outside operational hours (22:00 - 04:00)
	// In production, this would check against vehicle's specific schedule from backend
	const hour = new Date().getHours();
	return hour >= 22 || hour < 4;
}

/**
 * UN R156 Requirement: Sufficient power for update installation and potential rollback
 * Evaluates if a vehicle has sufficient battery level
 */
function evaluateBatteryLevel(vehicle: Vehicle, minBattery: number = 50): boolean {
	return vehicle.battery >= minBattery;
}

/**
 * UN R156 Requirement: Vehicle must be in safe, stationary state
 * Evaluates if a vehicle is in proper state (parked with engine off)
 */
function evaluateVehicleState(vehicle: Vehicle): boolean {
	// Vehicle must be parked or idle at depot
	return vehicle.status === 'parked' || (vehicle.status === 'idle' && vehicle.inDepot === true);
}

/**
 * Best Practice: Updates at controlled location (depot) for support/rollback
 * Evaluates if a vehicle is at depot location
 */
function evaluateDepotLocation(vehicle: Vehicle): boolean {
	return vehicle.inDepot === true || vehicle.location.toLowerCase().includes('depot');
}

/**
 * UN R156 Requirement: Reliable connectivity for package download and verification
 * Evaluates if a vehicle has sufficient network strength
 */
function evaluateNetworkStrength(vehicle: Vehicle, minStrength: number = 70): boolean {
	const strength = typeof vehicle.networkStrength === 'number'
		? vehicle.networkStrength
		: vehicle.networkStrength === 'strong' ? 90
			: vehicle.networkStrength === 'medium' ? 60
				: 30;

	return strength >= minStrength;
}

/**
 * Policy Evaluator Registry
 * Maps policy IDs to their evaluation functions.
 * New policies can be added here as backend defines them.
 */
const POLICY_EVALUATORS: Record<string, (vehicle: Vehicle, config: PolicyConfig) => { passed: boolean; name: string }> = {
	'collectionSchedule': (vehicle, _config) => ({
		passed: evaluateCollectionSchedule(vehicle),
		name: 'Operational Schedule Protection'
	}),
	'batteryLevel': (vehicle, config) => ({
		passed: evaluateBatteryLevel(vehicle, config.minBattery),
		name: `Battery Level (min: ${config.minBattery || 50}%)`
	}),
	'vehicleState': (vehicle, _config) => ({
		passed: evaluateVehicleState(vehicle),
		name: 'Vehicle State (must be parked)'
	}),
	'depotLocation': (vehicle, _config) => ({
		passed: evaluateDepotLocation(vehicle),
		name: 'Depot Location Required'
	}),
	'networkStrength': (vehicle, config) => ({
		passed: evaluateNetworkStrength(vehicle, config.minNetworkStrength),
		name: `Network Strength (min: ${config.minNetworkStrength || 70}%)`
	}),
};

/**
 * Evaluates if a vehicle is eligible for OTA update
 *
 * @param vehicle - Vehicle telemetry data
 * @param policyConfigs - Array of policy configurations from backend/campaign
 * @returns Eligibility result with blocking policy if not eligible
 *
 * Note: Policies are defined per-campaign by backend developers.
 * This allows flexibility for different update types:
 * - Critical security updates: Minimal policies (just safety checks)
 * - Feature updates: Stricter policies (depot location, maintenance window)
 * - Experimental updates: Very strict policies (specific vehicles, conditions)
 */
export function canUpdate(vehicle: Vehicle, policyConfigs: PolicyConfig[]): EligibilityResult {
	// Evaluate each enabled policy
	for (const cfg of policyConfigs) {
		if (!cfg.enabled) continue;

		// Get the evaluator for this policy
		const evaluator = POLICY_EVALUATORS[cfg.policyId];

		if (!evaluator) {
			// Unknown policy - log warning but don't block
			console.warn(`Unknown policy: ${cfg.policyId}. Skipping evaluation.`);
			continue;
		}

		const result = evaluator(vehicle, cfg);

		if (!result.passed) {
			return { eligible: false, blocked: result.name };
		}
	}

	// All policies passed
	return { eligible: true, blocked: null };
}

/**
 * Get list of available policy types
 * Useful for backend/admin UI to show available policies when creating campaigns
 */
export function getAvailablePolicies(): Array<{ id: string; name: string; description: string }> {
	return [
		{
			id: 'batteryLevel',
			name: 'Minimum Battery Level',
			description: 'UN R156: Ensures sufficient power for update installation and rollback'
		},
		{
			id: 'vehicleState',
			name: 'Vehicle State Check',
			description: 'UN R156: Vehicle must be in safe, stationary state (parked, engine off)'
		},
		{
			id: 'depotLocation',
			name: 'Depot Location',
			description: 'Best Practice: Update only at controlled depot location for support'
		},
		{
			id: 'networkStrength',
			name: 'Network Connectivity',
			description: 'UN R156: Reliable network for package download and verification'
		},
		{
			id: 'collectionSchedule',
			name: 'Operational Schedule Protection',
			description: 'Operational: Prevents updates during scheduled fleet operations'
		},
	];
}

/**
 * Validate policy configuration
 * Used by backend to ensure policy configs are valid before saving
 */
export function validatePolicyConfig(config: PolicyConfig): { valid: boolean; error?: string } {
	if (!config.policyId) {
		return { valid: false, error: 'Policy ID is required' };
	}

	if (!POLICY_EVALUATORS[config.policyId]) {
		return { valid: false, error: `Unknown policy ID: ${config.policyId}` };
	}

	// Validate policy-specific parameters
	if (config.policyId === 'batteryLevel' && config.enabled) {
		if (!config.minBattery || config.minBattery < 0 || config.minBattery > 100) {
			return { valid: false, error: 'minBattery must be between 0 and 100' };
		}
	}

	if (config.policyId === 'networkStrength' && config.enabled) {
		if (!config.minNetworkStrength || config.minNetworkStrength < 0 || config.minNetworkStrength > 100) {
			return { valid: false, error: 'minNetworkStrength must be between 0 and 100' };
		}
	}

	return { valid: true };
}

