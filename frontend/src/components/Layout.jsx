import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
    const { currentUser } = useAuth();
    // Current Page Title
    const location = useLocation();
    const getPageTitle = (path) => {
        if (path === '/') return 'Overview';
        const page = path.substring(1);
        return page.charAt(0).toUpperCase() + page.slice(1);
    };

    return (
        <div className="flex h-screen w-full font-sans bg-transparent overflow-hidden">
            {/* Sidebar: Flex Item (Not Fixed) */}
            <aside className="w-64 shrink-0 flex flex-col border-r border-white/10 backdrop-blur-xl bg-[#1d1d1f]/90 text-white transition-all shadow-2xl z-30">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative h-full">
                {/* Minimal Header */}
                <header className="h-14 shrink-0 border-b border-zinc-200 bg-white flex items-center justify-between px-8 z-20 shadow-sm/5 relative">
                    <h1 className="text-sm font-medium text-zinc-900">
                        {getPageTitle(location.pathname)}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-zinc-500">{currentUser?.email || 'User'}</span>
                        <div className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center text-[10px] text-zinc-500 font-bold">
                            {currentUser?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                {/* Page Canvas - Scrollable Area */}
                <div className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 relative">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
