/**
 * Campaign Definitions - Update Campaigns with Policy Configurations
 *
 * Campaign data defined by backend with policy rules
 * In production: GET /api/campaigns
 */

import type { Campaign } from '../types';

/**
 * Campaign data - In production this comes from backend
 * Backend defines all campaigns including policy configurations
 *
 * Note: Numbers based on actual fleet of 6 vehicles
 * Target = vehicles that need this update (have older version)
 * Completed = vehicles already updated to this version
 */
export const campaignsData: Campaign[] = [
	{
		id: 'CAMP-2025-ABS-001',
		name: 'ABS Security Patch',
		description: 'Critical security update for Anti-lock Braking System',
		softwareComponent: 'ABS',
		version: 'v2.4.1',
		status: 'Active',
		priority: 'High',
		targetVehicles: 3,  // 4702, 4705, 4706 need update
		completedVehicles: 3,  // 4701, 4703, 4704 already have v2.4.1
		packageSize: '45 MB',
		deadline: '2025-10-15',
		compliance: 'UN R155 - Cybersecurity',
		policyConfigs: [
			{ policyId: 'batteryLevel', enabled: true, minBattery: 70 },
			{ policyId: 'vehicleState', enabled: true },
			{ policyId: 'depotLocation', enabled: true },
		]
	},
	{
		id: 'CAMP-2025-IC-001',
		name: 'Dashboard UI Enhancement',
		softwareComponent: 'Instrument Cluster',
		version: 'v3.1.2',
		status: 'Active',
		priority: 'Medium',
		targetVehicles: 5,  // 4702, 4703, 4704, 4705, 4706 need upgrade
		completedVehicles: 1,  // 4701 completed (has v3.1.2)
		packageSize: '95 MB',
		deadline: '2025-11-15',
		compliance: 'ISO 26262',
		description: 'Updated driver interface with improved metrics',
		policyConfigs: [
			{ policyId: 'batteryLevel', enabled: true, minBattery: 60 },
			{ policyId: 'vehicleState', enabled: true },
			{ policyId: 'depotLocation', enabled: true },
			{ policyId: 'networkStrength', enabled: true, minNetworkStrength: 50 },
		]
	},
	{
		id: 'CAMP-2025-EB-001',
		name: 'Emergency Braking',
		softwareComponent: 'Emergency Braking',
		version: 'v1.8.4',
		status: 'Active',
		priority: 'High',
		targetVehicles: 4,  // 4702, 4703, 4705, 4706 need update
		completedVehicles: 0,  // 4701 and 4704 completed
		packageSize: '32 MB',
		deadline: '2025-10-30',
		compliance: 'UN R157 - ALKS',
		description: 'Improved pedestrian detection system',
		policyConfigs: [
			{ policyId: 'batteryLevel', enabled: true, minBattery: 75 },
			{ policyId: 'vehicleState', enabled: true },
			{ policyId: 'depotLocation', enabled: true },
			{ policyId: 'collectionSchedule', enabled: true },
		]
	},
	{
		id: 'CAMP-2025-HC-001',
		name: 'Hydraulic Efficiency Update',
		softwareComponent: 'Hydraulic Control',
		version: 'v4.2.2-euro6',
		status: 'Active',
		priority: 'Medium',
		targetVehicles: 5,  // 4702, 4703, 4704, 4705, 4706 need update
		completedVehicles: 1,  // 4701 completed (has v4.2.2)
		packageSize: '41 MB',
		deadline: '2025-10-20',
		compliance: 'Euro 6',
		description: 'Euro 6 compliance optimization',
		policyConfigs: [
			{ policyId: 'batteryLevel', enabled: true, minBattery: 65 },
			{ policyId: 'vehicleState', enabled: true },
			{ policyId: 'depotLocation', enabled: true },
		]
	},
	{
		id: 'CAMP-2025-EM-001',
		name: 'Engine Management Performance',
		softwareComponent: 'Engine Management',
		version: 'v5.0.3',
		status: 'Scheduled',
		priority: 'Medium',
		targetVehicles: 5,  // 4702, 4703, 4704, 4705, 4706 need update
		completedVehicles: 1,  // 4701 completed (has v5.0.3)
		packageSize: '52 MB',
		deadline: '2025-11-30',
		compliance: 'Euro 6',
		description: 'Fuel efficiency improvements',
		policyConfigs: [
			{ policyId: 'batteryLevel', enabled: true, minBattery: 70 },
			{ policyId: 'vehicleState', enabled: true },
			{ policyId: 'depotLocation', enabled: true },
			{ policyId: 'networkStrength', enabled: true, minNetworkStrength: 60 },
		]
	}
];
