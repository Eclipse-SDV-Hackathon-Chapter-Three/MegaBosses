import { useState } from 'react';
import { Truck, CheckCircle, XCircle, Clock, Cpu, MapPin } from 'lucide-react';
import StatCard from './StatCard';
import VehicleCard from './VehicleCard';
import VehicleModal from './VehicleModal';
import type { FleetViewProps, SoftwareComponent, VehicleWithEligibility } from '../types';

/**
 * Fleet Overview Component - Clean Professional Design
 */
function FleetView({
	fleet,
	stats,
	filter,
	setFilter,
	softwareFilter = 'all',
	setSoftwareFilter,
	locationFilter = 'all',
	setLocationFilter,
	locations = [],
	onTriggerUpdate
}: FleetViewProps) {
	const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithEligibility | null>(null);

	// Get unique locations from the fleet (fallback if locations not provided)
	const uniqueLocations = locations.length > 0 ? locations : Array.from(new Set(fleet.map(v => v.location)));

	// Software component options
	const softwareComponents: Array<SoftwareComponent | 'all'> = [
		'all',
		'ABS',
		'Instrument Cluster',
		'Emergency Braking',
		'Hydraulic Control',
		'Engine Management',
	];

	return (
		<div className="p-6">
			{/* Statistics Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<StatCard
					icon={Truck}
					label="Total Vehicles"
					value={stats.total.toString()}
					color="blue"
				/>
				<StatCard
					icon={CheckCircle}
					label="Ready to Update"
					value={stats.eligible.toString()}
					color="green"
				/>
				<StatCard
					icon={XCircle}
					label="Blocked"
					value={stats.blocked.toString()}
					color="red"
				/>
				<StatCard
					icon={Clock}
					label="Outdated"
					value={stats.outdated.toString()}
					color="orange"
				/>
			</div>

			{/* Filters Section - Simplified */}
			<div className="mb-6 space-y-4">
				{/* Status Filter */}
				<div className="flex flex-wrap items-center gap-3">
					<span className="text-sm text-slate-400 font-medium min-w-[60px]">Status:</span>
					<div className="flex flex-wrap gap-2">
						{[
							{ id: 'all', label: 'All' },
							{ id: 'eligible', label: 'Ready' },
							{ id: 'blocked', label: 'Blocked' },
						].map((filterOption) => (
							<button
								key={filterOption.id}
								onClick={() => setFilter(filterOption.id as 'all' | 'eligible' | 'blocked')}
								className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === filterOption.id
									? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/20'
									: 'glass text-slate-300 hover:bg-white/5 border border-white/10'
									}`}
							>
								{filterOption.label}
							</button>
						))}
					</div>
				</div>

				{/* Component & Location Filters */}
				<div className="flex flex-wrap gap-6">
					{/* Software Component Filter */}
					{setSoftwareFilter && (
						<div className="flex flex-wrap items-center gap-3">
							<div className="flex items-center gap-2 min-w-[80px]">
								<Cpu className="w-4 h-4 text-purple-400" />
								<span className="text-sm text-slate-400 font-medium">ECU:</span>
							</div>
							<select
								value={softwareFilter}
								onChange={(e) => setSoftwareFilter(e.target.value as SoftwareComponent | 'all')}
								className="glass px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50"
							>
								{softwareComponents.map((component) => (
									<option key={component} value={component} className="bg-slate-900">
										{component === 'all' ? 'All Components' : component}
									</option>
								))}
							</select>
						</div>
					)}

					{/* Location Filter */}
					{setLocationFilter && uniqueLocations.length > 1 && (
						<div className="flex flex-wrap items-center gap-3">
							<div className="flex items-center gap-2 min-w-[80px]">
								<MapPin className="w-4 h-4 text-cyan-400" />
								<span className="text-sm text-slate-400 font-medium">Location:</span>
							</div>
							<select
								value={locationFilter}
								onChange={(e) => setLocationFilter(e.target.value)}
								className="glass px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
							>
								<option value="all" className="bg-slate-900">All Locations</option>
								{uniqueLocations.map((location) => (
									<option key={location} value={location} className="bg-slate-900">
										{location}
									</option>
								))}
							</select>
						</div>
					)}
				</div>
			</div>

			{/* Vehicle Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{fleet.map((vehicle) => (
					<VehicleCard
						key={vehicle.id}
						vehicle={vehicle}
						onViewDetails={() => setSelectedVehicle(vehicle)}
					/>
				))}
			</div>

			{/* Empty State */}
			{fleet.length === 0 && (
				<div className="text-center py-12 glass rounded-2xl border border-white/10">
					<p className="text-slate-400 text-lg">No vehicles match the selected filters.</p>
				</div>
			)}

			{/* Vehicle Details Modal */}
			<VehicleModal
				vehicle={selectedVehicle!}
				isOpen={selectedVehicle !== null}
				onClose={() => setSelectedVehicle(null)}
				onTriggerUpdate={onTriggerUpdate}
			/>
		</div>
	);
}

export default FleetView;
