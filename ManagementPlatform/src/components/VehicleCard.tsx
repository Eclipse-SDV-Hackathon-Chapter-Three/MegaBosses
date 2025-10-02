import { Battery, MapPin, AlertCircle, Eye } from 'lucide-react';
import type { VehicleCardProps } from '../types';

/**
 * Simplified Vehicle Card Component
 * Shows only essential information with a "View Details" button
 */
function VehicleCard({ vehicle, onViewDetails }: VehicleCardProps) {
	const isEligible = vehicle.canUpdate === true;
	const updatesAvailable = vehicle.software.filter(sw => sw.availableVersion).length;

	// Get blocking policies for display (max 2)
	const blockingPolicies = vehicle.canUpdate === false && vehicle.blockingPolicies
		? vehicle.blockingPolicies
		: [];
	const displayPolicies = blockingPolicies.slice(0, 2);
	const moreCount = blockingPolicies.length - 2;

	return (
		<div className="glass rounded-2xl p-5 border border-white/10 card-hover">
			{/* Header */}
			<div className="flex items-start justify-between mb-4">
				<div>
					<h3 className="text-lg font-bold text-white mb-1">{vehicle.id}</h3>
					<p className="text-sm text-slate-400">{vehicle.model}</p>
				</div>
				{isEligible && (
					<span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
						READY
					</span>
				)}
			</div>

			{/* Location */}
			<div className="flex items-center gap-2 text-sm text-slate-300 mb-4">
				<MapPin size={16} className="text-purple-400" />
				<span>{vehicle.location}</span>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-2 gap-3 mb-4">
				{/* Battery */}
				<div className="flex items-center gap-2">
					<Battery size={16} className={
						vehicle.battery > 60 ? 'text-emerald-400' :
							vehicle.battery > 30 ? 'text-amber-400' : 'text-red-400'
					} />
					<span className="text-sm text-slate-300">{vehicle.battery}%</span>
				</div>

				{/* Updates Available */}
				<div className="flex items-center gap-2">
					<div className={`w-2 h-2 rounded-full ${updatesAvailable > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
						}`} />
					<span className="text-sm text-slate-300">
						{updatesAvailable} {updatesAvailable === 1 ? 'Update' : 'Updates'}
					</span>
				</div>
			</div>

			{/* Blocking Policies Alert (if not eligible) */}
			{!isEligible && blockingPolicies.length > 0 && (
				<div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
					<div className="flex items-start gap-2">
						<AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
						<div className="flex-1 min-w-0">
							<p className="text-xs font-semibold text-red-400 mb-1">Blocked by:</p>
							<div className="space-y-1">
								{displayPolicies.map((policy, index) => (
									<p key={index} className="text-xs text-red-300 truncate">
										• {policy}
									</p>
								))}
								{moreCount > 0 && (
									<p className="text-xs text-red-300">
										+{moreCount} more {moreCount === 1 ? 'policy' : 'policies'}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* View Details Button */}
			<button
				onClick={onViewDetails}
				className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
			>
				<Eye size={18} />
				<span>View Details</span>
			</button>
		</div>
	);
}

export default VehicleCard;
