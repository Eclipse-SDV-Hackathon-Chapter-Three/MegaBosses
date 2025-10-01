import { LayoutDashboard, Radio, Settings } from 'lucide-react';
import type { NavigationProps } from '../types';

/**
 * Modern Navigation Tabs Component
 */
function Navigation({ activeTab, setActiveTab }: NavigationProps) {
	const tabs = [
		{ id: 'fleet', label: 'Fleet Overview', icon: LayoutDashboard },
		{ id: 'campaigns', label: 'Update Campaigns', icon: Radio },
		{ id: 'policies', label: 'Policy Control', icon: Settings },
	];

	return (
		<nav className="glass border-b border-white/5">
			<div className="px-8">
				<div className="flex gap-2">
					{tabs.map((tab) => {
						const Icon = tab.icon;
						const isActive = activeTab === tab.id;

						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as 'fleet' | 'campaigns' | 'policies')}
								className={`
                  group relative flex items-center gap-3 px-6 py-4 rounded-t-2xl transition-all duration-300
                  ${isActive
										? 'bg-gradient-to-b from-orange-500/20 to-transparent text-orange-400 border-b-2 border-orange-500'
										: 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
									}
                `}
							>
								{isActive && (
									<div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-t-2xl -z-10"></div>
								)}
								<Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
								<span className="font-semibold text-sm">{tab.label}</span>
								{isActive && (
									<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"></div>
								)}
							</button>
						);
					})}
				</div>
			</div>
		</nav>
	);
}

export default Navigation;
