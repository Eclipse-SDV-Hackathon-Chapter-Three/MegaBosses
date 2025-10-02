import { Shield, Info, Package, Lock, CheckCircle, XCircle, Battery, Wifi, MapPin, Calendar, Truck } from 'lucide-react';
import type { PoliciesViewProps } from '../types';

/**
 * Policies Viewer Component - Read-Only Per Campaign
 * Policies are defined during campaign development and cannot be changed at runtime
 */
function PoliciesView({ campaign, campaigns, selectedCampaignId, setSelectedCampaignId, stats }: PoliciesViewProps) {

	const getPolicyInfo = (policyId: string) => {
		const policyInfo: Record<string, { name: string; description: string; icon: any; rationale: string }> = {
			collectionSchedule: {
				name: 'Operational Schedule Protection',
				description: 'Prevents updates during scheduled operational hours to avoid service disruption.',
				icon: Calendar,
				rationale: 'Municipal fleet operations are time-critical. Updates during operational hours could interrupt service delivery.'
			},
			batteryLevel: {
				name: 'Minimum Battery Level',
				description: 'Ensures sufficient battery charge for update installation and rollback if needed.',
				icon: Battery,
				rationale: 'Updates require power. Low battery could cause incomplete installation or prevent rollback in case of failure.'
			},
			vehicleState: {
				name: 'Vehicle State Check',
				description: 'Only allows updates when vehicle is safely parked with engine off.',
				icon: Truck,
				rationale: 'Updating ECU firmware while vehicle is operational poses safety risks. Must be stationary and powered down.'
			},
			depotLocation: {
				name: 'Depot Location Requirement',
				description: 'Restricts updates to depot locations with reliable network and charging infrastructure.',
				icon: MapPin,
				rationale: 'Depots have stable power, fast network, and technical support available if issues occur during update.'
			},
			networkStrength: {
				name: 'Network Strength Threshold',
				description: 'Requires minimum network quality to prevent incomplete or corrupted downloads.',
				icon: Wifi,
				rationale: 'Poor network can cause corrupted downloads. Minimum signal strength ensures reliable package transfer.'
			},
		};
		return policyInfo[policyId] || {
			name: policyId,
			description: 'No description available',
			icon: Shield,
			rationale: 'Policy requirement'
		};
	};

	return (
		<div className="p-6">
			{/* Campaign Selector */}
			<div className="mb-8">
				<div className="flex items-center gap-3 mb-3">
					<Lock className="w-8 h-8 text-purple-400" />
					<h2 className="text-3xl font-bold gradient-text">Policy Enforcement Rules</h2>
				</div>
				<p className="text-slate-400 text-lg mb-2">
					View campaign-specific policy requirements defined during development
				</p>
				<p className="text-sm text-amber-400/80 flex items-center gap-2 mb-6">
					<Info className="w-4 h-4" />
					Policies are immutable and defined by software engineers based on campaign criticality and technical requirements
				</p>

				{/* Campaign Selection Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{campaigns.map((c) => (
						<button
							key={c.id}
							onClick={() => setSelectedCampaignId(c.id)}
							className={`text-left p-5 rounded-2xl border transition-all ${selectedCampaignId === c.id
								? 'glass border-orange-500/50 ring-2 ring-orange-500/30 scale-105'
								: 'glass border-white/10 hover:border-white/20 hover:scale-102'
								}`}
						>
							<div className="flex items-start gap-3 mb-3">
								<Package className={`w-5 h-5 mt-1 ${selectedCampaignId === c.id ? 'text-orange-400' : 'text-slate-400'
									}`} />
								<div className="flex-1">
									<h3 className={`font-bold mb-1 ${selectedCampaignId === c.id ? 'text-white' : 'text-slate-300'
										}`}>
										{c.version}
									</h3>
									<p className="text-xs text-slate-500 line-clamp-2">{c.name}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className={`px-2 py-1 rounded-lg text-xs font-semibold ${c.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
									c.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
										'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
									}`}>
									{c.priority}
								</span>
								<span className="text-xs text-slate-500">
									{c.policyConfigs.filter(p => p.enabled).length}/{c.policyConfigs.length} enforced
								</span>
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Current Campaign Info */}
			<div className="mb-6 p-5 glass rounded-2xl border border-orange-500/20">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-3">
						<Package className="w-6 h-6 text-orange-400" />
						<div>
							<h3 className="font-bold text-white text-lg">{campaign.name}</h3>
							<p className="text-sm text-slate-400">Version {campaign.version} • {campaign.packageSize}</p>
						</div>
					</div>
					<span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${campaign.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
						campaign.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
							'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
						}`}>
						{campaign.priority} Priority
					</span>
				</div>
				<p className="text-sm text-slate-300 mb-3">{campaign.description}</p>
				<div className="flex items-center gap-2 text-xs text-slate-500">
					<Shield className="w-4 h-4" />
					<span>Compliance: {campaign.compliance}</span>
				</div>
			</div>

			{/* Impact Summary */}
			<div className="mb-6 p-5 glass rounded-2xl border border-white/10 card-hover">
				<div className="flex items-center gap-2 mb-4">
					<Shield className="w-5 h-5 text-purple-400" />
					<h3 className="font-semibold text-white text-lg">Current Impact on Fleet</h3>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="glass rounded-lg p-4 border border-emerald-500/20">
						<p className="text-3xl font-bold text-emerald-400">{stats.eligible}</p>
						<p className="text-sm text-slate-400 font-medium">Vehicles Eligible</p>
					</div>
					<div className="glass rounded-lg p-4 border border-red-500/20">
						<p className="text-3xl font-bold text-red-400">{stats.blocked}</p>
						<p className="text-sm text-slate-400 font-medium">Vehicles Blocked</p>
					</div>
					<div className="glass rounded-lg p-4 border border-orange-500/20">
						<p className="text-3xl font-bold text-orange-400">{stats.outdated}</p>
						<p className="text-sm text-slate-400 font-medium">Need Updates</p>
					</div>
				</div>
			</div>

			{/* Policy Requirements - Read Only */}
			<div className="space-y-4">
				{campaign.policyConfigs.map((policy) => {
					const policyInfo = getPolicyInfo(policy.policyId);
					const PolicyIcon = policyInfo.icon;

					return (
						<div
							key={policy.policyId}
							className={`glass rounded-2xl p-6 border transition-all ${policy.enabled
								? 'border-emerald-500/20 bg-emerald-500/5'
								: 'border-red-500/20 bg-red-500/5 opacity-60'
								}`}
						>
							{/* Policy Header */}
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-start gap-4 flex-1">
									<div className={`w-12 h-12 rounded-xl flex items-center justify-center ${policy.enabled
										? 'bg-emerald-500/20 border border-emerald-500/30'
										: 'bg-red-500/20 border border-red-500/30'
										}`}>
										<PolicyIcon className={`w-6 h-6 ${policy.enabled ? 'text-emerald-400' : 'text-red-400'
											}`} />
									</div>
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<h3 className="text-lg font-bold text-white">{policyInfo.name}</h3>
											<div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${policy.enabled
												? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
												: 'bg-red-500/20 text-red-400 border border-red-500/30'
												}`}>
												{policy.enabled ? (
													<>
														<CheckCircle className="w-3.5 h-3.5" />
														<span>ENFORCED</span>
													</>
												) : (
													<>
														<XCircle className="w-3.5 h-3.5" />
														<span>DISABLED</span>
													</>
												)}
											</div>
											<div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
												<Lock className="w-3 h-3 text-purple-400" />
												<span className="text-xs text-purple-400 font-medium">Read-Only</span>
											</div>
										</div>
										<p className="text-sm text-slate-400 mb-3">{policyInfo.description}</p>

										{/* Rationale Box */}
										<div className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg border border-white/5">
											<Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
											<div>
												<p className="text-xs font-semibold text-blue-400 mb-1">Engineering Rationale</p>
												<p className="text-xs text-slate-400">{policyInfo.rationale}</p>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Policy Parameters - Display Only */}
							{policy.enabled && (policy.minBattery !== undefined || policy.minNetworkStrength !== undefined) && (
								<div className="mt-4 pt-4 border-t border-white/10">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{policy.minBattery !== undefined && (
											<div className="glass rounded-xl p-4 border border-orange-500/20">
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<Battery className="w-5 h-5 text-orange-400" />
														<label className="text-sm font-semibold text-slate-200">
															Minimum Battery Level
														</label>
													</div>
													<span className="text-2xl font-bold text-orange-400">{policy.minBattery}%</span>
												</div>
												<div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/10">
													<div
														className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all"
														style={{ width: `${policy.minBattery}%` }}
													/>
												</div>
												<p className="text-xs text-slate-500 mt-2">
													{policy.minBattery >= 80 ? 'High requirement - Critical update' :
														policy.minBattery >= 60 ? 'Moderate requirement - Standard update' :
															'Relaxed requirement - Non-critical update'}
												</p>
											</div>
										)}

										{policy.minNetworkStrength !== undefined && (
											<div className="glass rounded-xl p-4 border border-pink-500/20">
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center gap-2">
														<Wifi className="w-5 h-5 text-pink-400" />
														<label className="text-sm font-semibold text-slate-200">
															Minimum Network Strength
														</label>
													</div>
													<span className="text-2xl font-bold text-pink-400">{policy.minNetworkStrength}%</span>
												</div>
												<div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/10">
													<div
														className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
														style={{ width: `${policy.minNetworkStrength}%` }}
													/>
												</div>
												<p className="text-xs text-slate-500 mt-2">
													{policy.minNetworkStrength >= 80 ? 'Strong signal - Large package transfer' :
														policy.minNetworkStrength >= 60 ? 'Medium signal - Standard package' :
															'Weak signal acceptable - Small package'}
												</p>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* UN R155/R156 Compliance Notice */}
			<div className="mt-6 p-5 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
				<div className="flex items-start gap-3">
					<Shield className="w-5 h-5 text-purple-400 mt-0.5" />
					<div>
						<h4 className="font-semibold text-purple-400 mb-1">Regulatory Compliance</h4>
						<p className="text-sm text-purple-300/70">
							All policies are designed to comply with UN Regulation No. 155 (Cybersecurity) and
							UN Regulation No. 156 (Software Updates) for commercial vehicle fleets.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default PoliciesView;
