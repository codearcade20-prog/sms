import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Trophy, 
  Settings, 
  LogOut,
  Bell,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={20} className={active ? 'text-indigo-600' : 'text-slate-400'} />
    <span className="font-semibold">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-pill"
        className="ml-auto w-1.5 h-5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
      />
    )}
  </button>
);

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard', roles: ['MD', 'ADMIN', 'SENIOR', 'JUNIOR'] },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks', roles: ['MD', 'ADMIN', 'SENIOR', 'JUNIOR'] },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', roles: ['MD', 'ADMIN', 'SENIOR', 'JUNIOR'] },
    { icon: Users, label: 'Team', path: '/team', roles: ['MD', 'ADMIN', 'SENIOR'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['MD', 'ADMIN', 'SENIOR', 'JUNIOR'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 p-6 flex flex-col bg-white">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <Zap className="text-white w-6 h-6" fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">ProPulse</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <SidebarItem 
            icon={LogOut} 
            label="Logout" 
            onClick={handleLogout} 
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Navbar */}
        <header className="h-20 border-b border-slate-200 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
            <p className="text-xs text-slate-400 font-medium">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
              <Trophy size={16} className="text-indigo-600" />
              <span className="text-sm font-bold text-indigo-600">{user?.points?.toLocaleString()} pts</span>
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                <img src={user?.image?.startsWith('data:image') ? user.image : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.image || user?.name || 'Alexander'}`} alt="Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
