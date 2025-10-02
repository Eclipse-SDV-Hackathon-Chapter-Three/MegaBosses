import type { StatCardProps } from '../types';

/**
 * Modern Statistic Card Component with Glass Morphism
 */
function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
	const colorClasses = {
		blue: 'from-orange-500 to-pink-500 shadow-orange-500/30',
		green: 'from-emerald-500 to-teal-500 shadow-emerald-500/30',
		red: 'from-rose-500 to-pink-500 shadow-rose-500/30',
		orange: 'from-orange-500 to-pink-500 shadow-orange-500/30',
	};

	const bgClasses = {
		blue: 'bg-orange-500/10 border-orange-500/20',
		green: 'bg-emerald-500/10 border-emerald-500/20',
		red: 'bg-rose-500/10 border-rose-500/20',
		orange: 'bg-orange-500/10 border-orange-500/20',
	};

	const textClasses = {
		blue: 'text-orange-400',
		green: 'text-emerald-400',
		red: 'text-rose-400',
		orange: 'text-orange-400',
	};

	return (
		<div className={`glass rounded-2xl p-6 border card-hover ${bgClasses[color]}`}>
			<div className="flex items-start justify-between mb-4">
				<div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
					<Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
				</div>
			</div>
			<div>
				<p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
				<p className={`text-4xl font-bold ${textClasses[color]}`}>{value}</p>
			</div>
		</div>
	);
}

export default StatCard;

