import { Radio, Calendar, Package, AlertTriangle, CheckCircle, Cpu } from 'lucide-react';
import type { CampaignsViewProps, SoftwareComponent } from '../types';

/**
 * Campaigns Management Component
 */
function CampaignsView({ campaigns, triggerCampaign }: CampaignsViewProps) {

	// Get color for each software component
	const getComponentColor = (component: SoftwareComponent) => {
		const colors: Record<SoftwareComponent, { bg: string; text: string; border: string }> = {
			'ABS': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
			'Instrument Cluster': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
			'Emergency Braking': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
			'Hydraulic Control': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
			'Engine Management': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
			'Telematics': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
		};
		return colors[component] || { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' };
	};

	return (
		<div className="p-6">
			<div className="mb-8">
				<h2 className="text-3xl font-bold gradient-text mb-3">Update Campaigns</h2>
				<p className="text-slate-400 text-lg">
					Manage OTA software updates across the fleet
				</p>
			</div>

			<div className="space-y-6">
				{campaigns.map((campaign) => {
					const progress = (campaign.completedVehicles / campaign.targetVehicles) * 100;
					const isComplete = campaign.status === 'Completed';
					const isActive = campaign.status === 'Active';
					const componentColors = getComponentColor(campaign.softwareComponent);

					return (
						<div
							key={campaign.id}
							className="glass rounded-2xl p-6 border border-white/10 card-hover"
						>
							{/* Campaign Header */}
							<div className="flex items-start justify-between mb-4">
								<div>
									<div className="flex items-center gap-3 mb-2">
										<h3 className="text-xl font-bold text-white">{campaign.name}</h3>

										{/* Software Component Badge */}
										<span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${componentColors.bg} ${componentColors.text} ${componentColors.border}`}>
											<Cpu className="w-3 h-3" />
											{campaign.softwareComponent}
										</span>

										<span className={`px-3 py-1 rounded-full text-xs font-semibold border ${campaign.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
											campaign.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
												campaign.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
													'bg-slate-600/20 text-slate-300 border-slate-600/30'
											}`}>
											{campaign.priority}
										</span>
										<span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isComplete ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
											isActive ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
												'bg-slate-600/20 text-slate-300 border-slate-600/30'
											}`}>
											{campaign.status}
										</span>
									</div>
									<p className="text-slate-400 text-sm mb-3">{campaign.description}</p>

									{/* Campaign Details Grid */}
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
										<div className="glass rounded-lg p-3 border border-white/5">
											<div className="flex items-center gap-2 mb-1">
												<Package className="w-4 h-4 text-orange-400" />
												<p className="text-xs text-slate-400">Version</p>
											</div>
											<p className="text-sm font-semibold text-white">{campaign.version}</p>
										</div>
										<div className="glass rounded-lg p-3 border border-white/5">
											<div className="flex items-center gap-2 mb-1">
												<Package className="w-4 h-4 text-pink-400" />
												<p className="text-xs text-slate-400">Package Size</p>
											</div>
											<p className="text-sm font-semibold text-white">{campaign.packageSize}</p>
										</div>
										<div className="glass rounded-lg p-3 border border-white/5">
											<div className="flex items-center gap-2 mb-1">
												<Calendar className="w-4 h-4 text-purple-400" />
												<p className="text-xs text-slate-400">Deadline</p>
											</div>
											<p className="text-sm font-semibold text-white">{campaign.deadline}</p>
										</div>
									</div>

									{/* Compliance Badge */}
									<div className="flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-500/20 rounded-xl inline-flex border border-emerald-500/30">
										<CheckCircle className="w-4 h-4 text-emerald-400" />
										<span className="text-sm text-emerald-400 font-semibold">{campaign.compliance}</span>
									</div>
								</div>

								{/* Trigger Button */}
								{!isComplete && (
									<button
										onClick={() => triggerCampaign && triggerCampaign(campaign.id)}
										className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${isActive
											? 'bg-slate-700 text-slate-400 cursor-not-allowed'
											: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 hover:scale-105 shadow-orange-500/30'
											}`}
										disabled={isActive}
									>
										<Radio className="w-5 h-5" />
										{isActive ? 'In Progress' : 'Trigger Campaign'}
									</button>
								)}
							</div>

							{/* Progress Bar */}
							<div className="mb-3">
								<div className="flex items-center justify-between text-sm mb-2">
									<span className="text-slate-400 font-medium">Progress</span>
									<span className="text-white font-semibold">
										{campaign.completedVehicles} / {campaign.targetVehicles} vehicles
									</span>
								</div>
								<div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/10">
									<div
										className={`h-full transition-all duration-500 ${isComplete ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
											progress > 50 ? 'bg-gradient-to-r from-pink-500 to-purple-500' :
												'bg-gradient-to-r from-orange-500 to-pink-500'
											}`}
										style={{ width: `${progress}%` }}
									/>
								</div>
							</div>

							{/* Warning for blocked vehicles */}
							{!isComplete && campaign.targetVehicles > campaign.completedVehicles && (
								<div className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg">
									<AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5" />
									<div className="text-sm">
										<p className="text-orange-400 font-medium">
											{campaign.targetVehicles - campaign.completedVehicles} vehicle(s) pending
										</p>
										<p className="text-orange-300/70 text-xs mt-1">
											Some vehicles may be blocked by active policies. Check Fleet Overview for details.
										</p>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default CampaignsView;
