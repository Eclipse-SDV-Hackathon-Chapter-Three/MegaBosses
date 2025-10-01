import { X, Battery, Wifi, Clock, MapPin, Truck, Cpu, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { VehicleWithEligibility, SoftwareComponent } from '../types';

interface VehicleModalProps {
	vehicle: VehicleWithEligibility;
	isOpen: boolean;
	onClose: () => void;
	onTriggerUpdate?: (vehicleId: string, component: SoftwareComponent) => void;
}

/**
 * Vehicle Details Modal - Clean Professional Design
 */
function VehicleModal({ vehicle, isOpen, onClose, onTriggerUpdate }: VehicleModalProps) {
	if (!isOpen) return null;

	const isEligible = vehicle.canUpdate === true;
	const updatesAvailable = vehicle.software.filter(sw => sw.availableVersion).length;

	// Get network strength value
	const getNetworkValue = () => {
		if (typeof vehicle.networkStrength === 'number') return vehicle.networkStrength;
		if (vehicle.networkStrength === 'strong') return 90;
		if (vehicle.networkStrength === 'medium') return 60;
		return 30;
	};

	const networkValue = getNetworkValue();

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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
			<div
				className="glass rounded-3xl border border-white/20 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="sticky top-0 glass border-b border-white/10 p-6 flex items-start justify-between">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<h2 className="text-2xl font-bold text-white">{vehicle.id}</h2>
							{isEligible && (
								<div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
									<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
									<span className="text-xs text-emerald-400 font-bold">READY</span>
								</div>
							)}
						</div>
						<p className="text-slate-300 font-medium">{vehicle.model}</p>
						<p className="text-sm text-slate-400">{vehicle.type}</p>
					</div>
					<button
						onClick={onClose}
						className="glass p-2 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
					>
						<X className="w-5 h-5 text-slate-400" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{/* Location & Status */}
					<div className="grid grid-cols-2 gap-4">
						<div className="glass rounded-xl p-4 border border-white/5">
							<div className="flex items-center gap-2 mb-2">
								<MapPin className="w-4 h-4 text-blue-400" />
								<span className="text-xs text-slate-400">Location</span>
							</div>
							<p className="text-sm font-semibold text-white">{vehicle.location}</p>
						</div>
						<div className="glass rounded-xl p-4 border border-white/5">
							<div className="flex items-center gap-2 mb-2">
								<Truck className="w-4 h-4 text-purple-400" />
								<span className="text-xs text-slate-400">Route</span>
							</div>
							<p className="text-sm font-semibold text-white">{vehicle.route}</p>
						</div>
					</div>

					{/* Telemetry */}
					<div>
						<h3 className="text-sm font-semibold text-slate-300 mb-3">Telemetry</h3>
						<div className="grid grid-cols-3 gap-4">
							<div className="glass rounded-xl p-4 border border-white/5">
								<div className="flex items-center gap-2 mb-2">
									<Battery className={`w-4 h-4 ${vehicle.battery > 70 ? 'text-emerald-400' :
										vehicle.battery > 40 ? 'text-amber-400' : 'text-rose-400'
										}`} />
									<span className="text-xs text-slate-400">Battery</span>
								</div>
								<p className="text-2xl font-bold text-white">{vehicle.battery}%</p>
							</div>
							<div className="glass rounded-xl p-4 border border-white/5">
								<div className="flex items-center gap-2 mb-2">
									<Wifi className={`w-4 h-4 ${networkValue > 70 ? 'text-emerald-400' :
										networkValue > 40 ? 'text-amber-400' : 'text-rose-400'
										}`} />
									<span className="text-xs text-slate-400">Network</span>
								</div>
								<p className="text-2xl font-bold text-white">{networkValue}%</p>
							</div>
							<div className="glass rounded-xl p-4 border border-white/5">
								<div className="flex items-center gap-2 mb-2">
									<Clock className="w-4 h-4 text-blue-400" />
									<span className="text-xs text-slate-400">Operating</span>
								</div>
								<p className="text-2xl font-bold text-white">{vehicle.operatingHours}h</p>
							</div>
						</div>
					</div>

					{/* Software Components */}
					<div>
						<h3 className="text-sm font-semibold text-slate-300 mb-3">Software Components</h3>
						<div className="space-y-3">
							{vehicle.software.map((sw) => {
								const colors = getComponentColor(sw.component);
								const hasUpdate = !!sw.availableVersion;

								return (
									<div
										key={sw.component}
										className={`glass rounded-xl p-4 border ${colors.border}`}
									>
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2">
												<Cpu className={`w-4 h-4 ${colors.text}`} />
												<span className="text-sm font-semibold text-white">{sw.component}</span>
											</div>
											{hasUpdate && (
												<span className={`px-3 py-1 ${colors.bg} ${colors.text} text-xs rounded-full font-bold border ${colors.border}`}>
													UPDATE AVAILABLE
												</span>
											)}
										</div>
										<div className="grid grid-cols-2 gap-4 mb-3">
											<div>
												<p className="text-xs text-slate-400 mb-1">Current Version</p>
												<p className="font-mono text-sm text-cyan-400">{sw.currentVersion}</p>
											</div>
											{hasUpdate ? (
												<div>
													<p className="text-xs text-slate-400 mb-1">Available Version</p>
													<p className="font-mono text-sm text-emerald-400">{sw.availableVersion}</p>
												</div>
											) : (
												<div>
													<p className="text-xs text-slate-400 mb-1">Status</p>
													<p className="text-sm text-emerald-400 flex items-center gap-1">
														<CheckCircle2 className="w-3.5 h-3.5" />
														Up to date
													</p>
												</div>
											)}
										</div>

										{/* Individual Trigger Update Button or Status */}
										{hasUpdate && onTriggerUpdate ? (
											<button
												onClick={() => {
													onTriggerUpdate(vehicle.id, sw.component);
													// Note: Modal will stay open so user can trigger multiple updates
												}}
												className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
											>
												<Download className="w-3.5 h-3.5" />
												Trigger Update for {sw.component}
											</button>
										) : !hasUpdate && (
											<div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-semibold text-xs">
												<CheckCircle2 className="w-3.5 h-3.5" />
												Latest version installed
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>

					{/* Blocking Policies */}
					{!isEligible && vehicle.blockingPolicies && vehicle.blockingPolicies.length > 0 && (
						<div className="glass rounded-xl p-4 border border-rose-500/30">
							<div className="flex items-center gap-2 mb-3">
								<AlertCircle className="w-4 h-4 text-rose-400" />
								<h3 className="text-sm font-semibold text-rose-400">Update Blocked</h3>
							</div>
							<div className="space-y-2">
								{vehicle.blockingPolicies.map((policy) => (
									<div key={policy} className="text-sm text-slate-300 flex items-center gap-2">
										<div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
										{policy}
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Footer Actions */}
				<div className="sticky bottom-0 glass border-t border-white/10 p-6 flex items-center justify-between">
					<div>
						{updatesAvailable > 0 && (
							<p className="text-sm text-slate-400">
								<span className="font-bold text-orange-400">{updatesAvailable}</span> update{updatesAvailable > 1 ? 's' : ''} available
							</p>
						)}
					</div>
					<button
						onClick={onClose}
						className="px-6 py-3 glass rounded-xl font-semibold text-sm text-slate-300 hover:bg-white/10 transition-all border border-white/10"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}

export default VehicleModal;
