import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Car,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  Settings,
  Bell
} from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './ui/PageTransition';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER', 'DISPATCHER', 'FINANCIAL_ANALYST'] },
    { name: 'Users', href: '/users', icon: Shield, roles: ['ADMIN'] },
    { name: 'Vehicles', href: '/vehicles', icon: Car, roles: ['ADMIN', 'FLEET_MANAGER'] },
    { name: 'Drivers', href: '/drivers', icon: Users, roles: ['ADMIN', 'SAFETY_OFFICER'] },
    { name: 'Trips', href: '/trips', icon: Route, roles: ['ADMIN', 'DISPATCHER'] },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['ADMIN', 'FLEET_MANAGER'] },
    { name: 'Expenses', href: '/fuel-expenses', icon: Fuel, roles: ['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['ADMIN', 'FINANCIAL_ANALYST'] },
  ].filter(item => user && item.roles.includes(user.role));

  const roleClasses: Record<string, string> = {
    ADMIN: 'role-admin',
    FLEET_MANAGER: 'role-fm',
    SAFETY_OFFICER: 'role-safety',
    DISPATCHER: 'role-dispatch',
    FINANCIAL_ANALYST: 'role-finance',
  };
  const roleClass = user ? roleClasses[user.role] : '';

  return (
    <div className={`min-h-screen ${roleClass} dark-force bg-background font-sans text-foreground`}>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#0B0B0F]/90 backdrop-blur-xl border-b border-white/5 py-3 px-6 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">TransitOps</span>
        </div>

        {/* Center: Nav Pills (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 bg-[#16161A] p-1.5 rounded-full border border-white/5 shadow-inner">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors">
            <Settings size={18} strokeWidth={2.5} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors">
            <Bell size={18} strokeWidth={2.5} />
          </button>
          
          <div className="flex items-center gap-3 bg-[#16161A] pl-1 pr-4 py-1 rounded-full border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
               {user?.name?.substring(0, 2).toUpperCase() || 'U'}
            </div>
            <button onClick={logout} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button onClick={() => setMobileMenuOpen(true)} className="text-white">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div className="fixed inset-y-0 right-0 w-64 bg-[#16161A] border-l border-white/10 p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
          </div>
          <div className="flex flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl font-medium ${location.pathname === item.href ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="mt-auto border-t border-white/10 pt-6">
            <button onClick={logout} className="flex items-center gap-3 text-red-500 hover:text-red-400 font-medium">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="p-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            {children}
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  );
}
