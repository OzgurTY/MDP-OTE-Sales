import { LayoutDashboard, DollarSign, Target, Briefcase, Settings, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/' },
        { name: 'Earnings', icon: DollarSign, path: '/earnings' },
        { name: 'Targets', icon: Target, path: '/targets' },
        { name: 'Sales', icon: Briefcase, path: '/sales' },
        { name: 'Settings', icon: Settings, path: '/settings' },
        { name: 'Account', icon: User, path: '/account' },
    ];

    return (
        <div className="flex flex-col h-full p-5">
            {/* Logo Area */}
            <div className="mb-8 px-1">
                <div className="bg-gradient-to-b from-white to-zinc-100 rounded-xl p-3 shadow-lg shadow-black/20 flex items-center gap-3 border border-zinc-200/50 transform hover:scale-[1.02] transition-transform duration-300">
                    <img src="/mdp-logo.png" alt="MDP" className="h-10 w-auto object-contain" />
                    <div className="h-8 w-px bg-zinc-200"></div>
                    <div>
                        <h1 className="text-[10px] font-extrabold text-zinc-900 tracking-wider uppercase leading-none">Sales</h1>
                        <h1 className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase leading-none">Calculator</h1>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group relative overflow-hidden
                                ${isActive
                                    ? 'text-white font-medium shadow-md shadow-black/20'
                                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}
                            style={isActive ? { background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0) 100%)', borderLeft: '3px solid #06b6d4' } : {}}
                        >
                            <item.icon size={18} className={`${isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom/Footer */}
            <div className="mt-auto pt-4 border-t border-zinc-800">
                <div className="px-3 py-2 text-xs text-zinc-500">
                    v2.0.0
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
