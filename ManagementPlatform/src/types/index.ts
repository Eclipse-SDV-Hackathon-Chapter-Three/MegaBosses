/**
 * Type Definitions for FleetSync
 *
 * Core types used across the application
 */

// Vehicle Types
export type VehicleStatus = 'active' | 'idle' | 'maintenance' | 'parked';
export type VehicleType = 'Heavy Duty' | 'Medium Duty' | 'Light Duty' | 'Specialized';
export type NetworkStrength = 'strong' | 'medium' | 'weak';

// Software/ECU Types
export type SoftwareComponent = 'ABS' | 'Instrument Cluster' | 'Emergency Braking' | 'Hydraulic Control' | 'Engine Management' | 'Telematics';

export interface SoftwareVersion {
	component: SoftwareComponent;
	currentVersion: string;
	availableVersion?: string;
	lastUpdate: string;
}

export interface Vehicle {
	id: string;
	type: VehicleType;
	model: string;
	location: string;
	status: VehicleStatus;
	battery: number;
	networkStrength: NetworkStrength | number;
	route?: string;
	currentRoute?: string;
	hoursInOperation?: number;
	operatingHours?: number;
	loadCapacity?: number;
	collectionToday?: string;
	inDepot?: boolean;
	collectionSchedule?: string;
	engineOn?: boolean;
	nextMaintenance?: string;
	crew?: string;
	// Multiple software components per vehicle
	software: SoftwareVersion[];
}

export interface VehicleWithEligibility extends Vehicle {
	canUpdate: boolean;
	blockingPolicies?: string[];
}

// Campaign Types
export type CampaignPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type CampaignStatus = 'Active' | 'Scheduled' | 'Completed';

export interface Campaign {
	id: string;
	name: string;
	softwareComponent: SoftwareComponent; // Which ECU/software is being updated
	version: string;
	priority: CampaignPriority;
	status: CampaignStatus;
	targetVehicles: number;
	completedVehicles: number;
	packageSize: string;
	deadline: string;
	compliance: string;
	description: string;
	// Each campaign has its own policy configurations
	policyConfigs: PolicyConfig[];
}

// Policy Types
export interface PolicyConfig {
	policyId: string;
	enabled: boolean;
	minBattery?: number;
	minNetworkStrength?: number;
}

export interface PolicyDefinition {
	id: string;
	name: string;
	description: string;
	evaluate: (vehicle: Vehicle, config: PolicyConfig) => boolean;
}

export interface EligibilityResult {
	eligible: boolean;
	blocked: string | null;
}

// Statistics
export interface FleetStats {
	total: number;
	eligible: number;
	blocked: number;
	outdated: number;
}

// Filter Types
export type FleetFilter = 'all' | 'eligible' | 'blocked';

// Component Props
export interface NavigationProps {
	activeTab: 'fleet' | 'campaigns' | 'policies';
	setActiveTab: (tab: 'fleet' | 'campaigns' | 'policies') => void;
}

export interface StatCardProps {
	icon: React.ComponentType<any>;
	label: string;
	value: string | number;
	color: 'blue' | 'green' | 'red' | 'orange';
}

export interface VehicleCardProps {
	vehicle: VehicleWithEligibility;
	onViewDetails: () => void;
}

export interface FleetViewProps {
	fleet: VehicleWithEligibility[];
	stats: FleetStats;
	filter: FleetFilter;
	setFilter: (filter: FleetFilter) => void;
	softwareFilter: SoftwareComponent | 'all';
	setSoftwareFilter: (filter: SoftwareComponent | 'all') => void;
	locationFilter: string | 'all';
	setLocationFilter: (filter: string | 'all') => void;
	locations: string[];
	onTriggerUpdate?: (vehicleId: string, component: SoftwareComponent) => void;
}

export interface CampaignsViewProps {
	campaigns: Campaign[];
	triggerCampaign?: (campaignId: string) => void;
}

export interface PoliciesViewProps {
	campaign: Campaign;
	campaigns: Campaign[];
	selectedCampaignId: string | null;
	setSelectedCampaignId: (id: string) => void;
	stats: FleetStats;
}
