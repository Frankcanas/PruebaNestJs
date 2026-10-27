import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';
import {
  Truck,
  Wrench,
  Building2,
  CalendarCheck,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export type ActiveTab = 'vehicles' | 'mechanics' | 'workshops' | 'maintenances' | 'external';

interface LayoutProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, onTabChange, children }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'vehicles' as ActiveTab, label: 'Vehículos', icon: Truck },
    { id: 'maintenances' as ActiveTab, label: 'Mantenimientos', icon: CalendarCheck },
    { id: 'mechanics' as ActiveTab, label: 'Mecánicos', icon: Wrench },
    { id: 'workshops' as ActiveTab, label: 'Talleres', icon: Building2 },
    { id: 'external' as ActiveTab, label: 'Portal Socios (B2B)', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">FleetCore</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Gestión de Mantenimiento de Flota
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Swagger Link & Logout */}
          <div className="flex items-center gap-3">
            <a
              href="http://localhost:3000/api/docs"
              target="_blank"
              rel="noreferrer"
              title="Abrir Swagger API Docs"
              className="hidden lg:flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400 transition bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-700/50"
            >
              <span>Swagger API</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">{user?.fullName}</p>
                <div className="mt-0.5">
                  <Badge status={user?.role || 'USER'} />
                </div>
              </div>
              <button
                onClick={logout}
                title="Cerrar Sesión"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer border border-transparent hover:border-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800 px-2 py-1.5 bg-slate-900 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        FleetCore © 2026 — Desarrollado por Frank Cañas • Clan NodeJS • Conectado a NestJS Backend en{' '}
        <code className="text-indigo-400 font-mono">http://localhost:3000</code>
      </footer>
    </div>
  );
};
