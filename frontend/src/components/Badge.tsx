import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = (val: string) => {
    switch (val.toUpperCase()) {
      case 'AVAILABLE':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'IN_MAINTENANCE':
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'SCHEDULED':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-300 border border-green-500/30';
      case 'INACTIVE':
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      case 'MANAGER':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30';
      case 'MECHANIC':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border border-slate-600';
    }
  };

  const getLabel = (val: string) => {
    const labels: Record<string, string> = {
      AVAILABLE: 'Disponible',
      IN_MAINTENANCE: 'En Mantenimiento',
      INACTIVE: 'Inactivo',
      SCHEDULED: 'Agendado',
      IN_PROGRESS: 'En Proceso',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
      ACTIVE: 'Activo',
      ADMIN: 'Administrador',
      MANAGER: 'Gestor de Flota',
      MECHANIC: 'Mecánico',
    };
    return labels[val.toUpperCase()] || val;
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ${getBadgeStyle(
        status,
      )} ${className}`}
    >
      {getLabel(status)}
    </span>
  );
};
