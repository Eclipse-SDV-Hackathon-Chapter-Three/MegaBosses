import { Shield } from 'lucide-react';
import logo from '../assets/logo.png';

/**
 * Modern Application Header Component
 */
function Header() {
	return (
		<header className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-2xl">
			<div className="px-4 sm:px-8 py-4 sm:py-6">
				<div className="flex items-center justify-between">
					{/* Brand Section - Logo Only */}
					<div className="flex items-center">
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 blur-2xl opacity-50"></div>
							<div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center">
								<img src={logo} alt="FleetSync Logo" className="w-full h-full object-contain" />
							</div>
						</div>
					</div>

					{/* Compliance Badge */}
					<div className="glass rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-purple-500/20">
						<div className="flex items-center gap-3">
							<Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
							<div>
								<p className="text-xs text-slate-400 mb-1">Compliance</p>
								<p className="text-xs sm:text-sm font-bold text-purple-400">UN R155/R156</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;
