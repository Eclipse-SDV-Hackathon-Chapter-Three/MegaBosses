import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

// Components
import {
	Header,
	Navigation,
	FleetView,
	CampaignsView,
	PoliciesView
} from './components';

// Services
import FleetAPI from './services/api';
import { canUpdate } from './services/policyEngine';

// Types
import type { Vehicle, VehicleWithEligibility, Campaign, FleetStats, SoftwareComponent } from './types';

/**
 * Main Application Component
 *
 * FleetSync - Policy-Driven OTA Updates for Municipal Fleets
 * Built for Eclipse SDV Hackathon Chapter Three
 */
function App() {
	const [activeTab, setActiveTab] = useState<'fleet' | 'campaigns' | 'policies'>('fleet');
	const [fleet, setFleet] = useState<Vehicle[]>([]);
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'eligible' | 'blocked'>('all');
	const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
	const [softwareFilter, setSoftwareFilter] = useState<SoftwareComponent | 'all'>('all');
	const [locationFilter, setLocationFilter] = useState<string | 'all'>('all');

	// Load initial data
	useEffect(() => {
		loadData();
	}, []);

	async function loadData() {
		setLoading(true);
		try {
			const [fleetData, campaignData] = await Promise.all([
				FleetAPI.getFleet(),
				FleetAPI.getCampaigns()
			]);
			setFleet(fleetData);
			setCampaigns(campaignData);
			// Select first campaign by default
			if (campaignData.length > 0) {
				setSelectedCampaignId(campaignData[0].id);
			}
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			setLoading(false);
		}
	}

	// Get the currently selected campaign
	const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

	// Calculate vehicle eligibility based on selected campaign's policies
	const eligibilityResults: VehicleWithEligibility[] = fleet.map(vehicle => {
		if (!selectedCampaign) {
			return { ...vehicle, canUpdate: false, blockingPolicies: ['No campaign selected'] };
		}

		// Check if vehicle has the software component targeted by this campaign
		const relevantSoftware = vehicle.software.find(
			sw => sw.component === selectedCampaign.softwareComponent
		);

		// If vehicle doesn't have this software component, it's not eligible
		if (!relevantSoftware) {
			return {
				...vehicle,
				canUpdate: false,
				blockingPolicies: [`Vehicle does not have ${selectedCampaign.softwareComponent}`]
			};
		}

		// Check if software needs update
		const needsUpdate = relevantSoftware.currentVersion !== selectedCampaign.version;
		if (!needsUpdate) {
			return {
				...vehicle,
				canUpdate: false,
				blockingPolicies: ['Already up to date']
			};
		}

		// Check policy eligibility
		const result = canUpdate(vehicle, selectedCampaign.policyConfigs);
		return {
			...vehicle,
			canUpdate: result.eligible,
			blockingPolicies: result.blocked ? [result.blocked] : undefined
		};
	});

	// Calculate fleet statistics - count vehicles with outdated software components
	const outdatedCount = fleet.filter(vehicle =>
		vehicle.software.some(sw => {
			// Check if there's a campaign for this component with a newer version
			const relevantCampaign = campaigns.find(c => c.softwareComponent === sw.component);
			return relevantCampaign && sw.currentVersion !== relevantCampaign.version;
		})
	).length;

	const stats: FleetStats = {
		total: fleet.length,
		eligible: eligibilityResults.filter(v => v.canUpdate).length,
		blocked: eligibilityResults.filter(v => !v.canUpdate).length,
		outdated: outdatedCount
	};

	// Filter vehicles based on selected filters
	let filteredFleet = eligibilityResults.filter(vehicle => {
		if (filter === 'eligible') return vehicle.canUpdate;
		if (filter === 'blocked') return !vehicle.canUpdate;
		return true;
	});

	// Apply software component filter - show vehicles that have this component with available update
	if (softwareFilter !== 'all') {
		filteredFleet = filteredFleet.filter(vehicle => {
			// Find the software component in the vehicle
			const softwareComponent = vehicle.software.find(sw => sw.component === softwareFilter);
			// Show vehicle if it has this component with an available update
			return softwareComponent && softwareComponent.availableVersion;
		});
	}

	// Apply location filter
	if (locationFilter !== 'all') {
		filteredFleet = filteredFleet.filter(vehicle =>
			vehicle.location === locationFilter
		);
	}

	// Get unique locations for filter dropdown
	const locations = Array.from(new Set(fleet.map(v => v.location)));

	// Handle trigger update for a specific vehicle and component
	const handleTriggerUpdate = (vehicleId: string, component: SoftwareComponent) => {
		console.log(`Triggering update for vehicle ${vehicleId}, component ${component}`);

		const vehicle = fleet.find(v => v.id === vehicleId);
		if (!vehicle) {
			alert('Vehicle not found');
			return;
		}

		// Find the software component being updated
		const softwareToUpdate = vehicle.software.find(sw => sw.component === component);

		if (!softwareToUpdate) {
			alert(`Vehicle ${vehicleId} does not have ${component}`);
			return;
		}

		if (!softwareToUpdate.availableVersion) {
			alert(`No update available for ${component} on vehicle ${vehicleId}`);
			return;
		}

		const newVersion = softwareToUpdate.availableVersion;

		// Update the software version
		setFleet(prevFleet =>
			prevFleet.map(v => {
				if (v.id === vehicleId) {
					return {
						...v,
						software: v.software.map(sw =>
							sw.component === component
								? { ...sw, currentVersion: newVersion, availableVersion: undefined, lastUpdate: new Date().toISOString().split('T')[0] }
								: sw
						)
					};
				}
				return v;
			})
		);

		// Update campaign progress if there's a matching campaign
		const matchingCampaign = campaigns.find(c => c.softwareComponent === component);
		if (matchingCampaign) {
			setCampaigns(prevCampaigns =>
				prevCampaigns.map(c => {
					if (c.id === matchingCampaign.id) {
						return {
							...c,
							completedVehicles: Math.min(c.completedVehicles + 1, c.targetVehicles)
						};
					}
					return c;
				})
			);
		}

		alert(`✅ Update triggered for ${vehicleId}\n\nComponent: ${component}\nNew Version: ${newVersion}`);
	};

	// Handle trigger campaign - updates all eligible vehicles for this campaign
	const handleTriggerCampaign = async (campaignId: string) => {
		const campaign = campaigns.find(c => c.id === campaignId);
		if (!campaign) {
			alert('Campaign not found');
			return;
		}

		if (campaign.status === 'Active') {
			alert('Campaign is already active');
			return;
		}

		// Find all eligible vehicles for this campaign
		const eligibleVehicles = eligibilityResults.filter(v =>
			v.canUpdate &&
			v.software.some(sw =>
				sw.component === campaign.softwareComponent &&
				sw.currentVersion !== campaign.version
			)
		);

		if (eligibleVehicles.length === 0) {
			alert(`No eligible vehicles found for campaign "${campaign.name}"\n\nAll vehicles either:\n- Don't have ${campaign.softwareComponent}\n- Are already updated\n- Are blocked by policies`);
			return;
		}

		const confirmed = confirm(
			`Trigger Campaign: ${campaign.name}\n\n` +
			`Component: ${campaign.softwareComponent}\n` +
			`Version: ${campaign.version}\n\n` +
			`This will update ${eligibleVehicles.length} eligible vehicle(s):\n` +
			eligibleVehicles.map(v => `• ${v.id}`).join('\n') +
			`\n\nProceed?`
		);

		if (!confirmed) return;

		const SYMPHONY_API_BASE = 'http://localhost:8082/v1alpha2/'.replace(/\/+$/, '/') ;
		const username = 'admin';		
		const password = '';

		const activationPayload = {
            metadata: {
                name: "update-activation"
            },
            spec: {
                campaign: "update:v1",
                stage: "",
                inputs: {
                    "app-to-update": campaign.softwareComponent.toLowerCase().replace(/\s+/g, '-'),
                    conditions: {
                        vehicle_state: {
                            engine_status: "stopped",
                            gear: "park",
                            speed_kmh: 0
                        },
                        battery_status: {
                            charging: true
                        }
                    },
                    rollback: {
                        metadata: { name: "ankaios-target" },
                        spec: {
                            forceRedeploy: true,
                            components: [
                                {
                                    name: "instrument-cluster",
                                    type: "ankaios",
                                    properties: {
                                        "ankaios.runtime": "podman",
                                        "ankaios.agent": "agent_A",
                                        "ankaios.restartPolicy": "ALWAYS",
                                        "ankaios.runtimeConfig": "image: docker.io/ruipires99/instrument-cluster:v0.0.1\ncommandOptions: [\"-p\", \"8000:8000\"]"
                                    }
                                }
                            ],
                            topologies: [
                                {
                                    bindings: [
                                        {
                                            role: "ankaios",
                                            provider: "providers.target.mqtt",
                                            config: {
                                                name: "proxy",
                                                brokerAddress: "tcp://127.0.0.1:1883",
                                                clientID: "symphony",
                                                requestTopic: "coa-request",
                                                responseTopic: "coa-response",
                                                timeoutSeconds: "30"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    target: {
                        metadata: { name: "ankaios-target" },
                        spec: {
                            forceRedeploy: true,
                            components: [
                                {
                                    name: "instrument-cluster",
                                    type: "ankaios",
                                    properties: {
                                        "ankaios.runtime": "podman",
                                        "ankaios.agent": "agent_A",
                                        "ankaios.restartPolicy": "ALWAYS",
                                        "ankaios.runtimeConfig": "image: docker.io/ruipires99/instrument-cluster:v0.0.2\ncommandOptions: [\"-p\", \"8000:8000\"]"
                                    }
                                }
                            ],
                            topologies: [
                                {
                                    bindings: [
                                        {
                                            role: "ankaios",
                                            provider: "providers.target.mqtt",
                                            config: {
                                                name: "proxy",
                                                brokerAddress: "tcp://127.0.0.1:1883",
                                                clientID: "symphony",
                                                requestTopic: "coa-request",
                                                responseTopic: "coa-response",
                                                timeoutSeconds: "30"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                }
            }
        };

		let token: string | null = null;
		try {
			const authRes = await fetch(`${SYMPHONY_API_BASE}users/auth`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			if (!authRes.ok) {
				const t = await authRes.text();
				throw new Error(`Auth failed ${authRes.status}: ${t}`);
			}
			const authJson = await authRes.json();
			token = authJson?.accessToken;
			if (!token) {
				throw new Error('No accessToken in auth response');
			}

			const actRes = await fetch(`${SYMPHONY_API_BASE}activations/registry/update-activation`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(activationPayload)
			});
			if (!actRes.ok) {
				const t = await actRes.text();
				throw new Error(`Activation POST failed ${actRes.status}: ${t}`);
			}
		} catch (e: any) {
			console.error(e);
			alert(`❌ Failed to trigger backend activation:\n${e.message || e}`);
			return;
		}

		// Update all eligible vehicles
		const vehicleIds = eligibleVehicles.map(v => v.id);

		setFleet(prevFleet =>
			prevFleet.map(v => {
				if (vehicleIds.includes(v.id)) {
					return {
						...v,
						software: v.software.map(sw =>
							sw.component === campaign.softwareComponent
								? { ...sw, currentVersion: campaign.version, availableVersion: undefined, lastUpdate: new Date().toISOString().split('T')[0] }
								: sw
						)
					};
				}
				return v;
			})
		);

		// Update campaign status to Active and set progress
		setCampaigns(prevCampaigns =>
			prevCampaigns.map(c => {
				if (c.id === campaignId) {
					return {
						...c,
						status: 'Active',
						completedVehicles: eligibleVehicles.length
					};
				}
				return c;
			})
		);

		alert(
			`✅ Campaign "${campaign.name}" triggered successfully!\n\n` +
			`Updated ${eligibleVehicles.length} vehicle(s)\n` +
			`Component: ${campaign.softwareComponent}\n` +
			`Version: ${campaign.version}`
		);
	};

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
				<div className="text-center">
					<div className="relative mb-6">
						<div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 blur-2xl opacity-30"></div>
						<Activity className="relative w-16 h-16 animate-spin mx-auto text-orange-400" strokeWidth={2.5} />
					</div>
					<p className="text-xl font-semibold gradient-text mb-2">FleetSync</p>
					<p className="text-slate-400">Loading fleet data...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<Header />
			<Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

			<main className="p-8">
				{activeTab === 'fleet' && (
					<FleetView
						fleet={filteredFleet}
						stats={stats}
						filter={filter}
						setFilter={setFilter}
						softwareFilter={softwareFilter}
						setSoftwareFilter={setSoftwareFilter}
						locationFilter={locationFilter}
						setLocationFilter={setLocationFilter}
						locations={locations}
						onTriggerUpdate={handleTriggerUpdate}
					/>
				)}
				{activeTab === 'campaigns' && (
					<CampaignsView
						campaigns={campaigns}
						triggerCampaign={handleTriggerCampaign}
					/>
				)}
				{activeTab === 'policies' && selectedCampaign && (
					<PoliciesView
						campaign={selectedCampaign}
						campaigns={campaigns}
						selectedCampaignId={selectedCampaignId}
						setSelectedCampaignId={setSelectedCampaignId}
						stats={stats}
					/>
				)}
			</main>
		</div>
	);
}

export default App;
