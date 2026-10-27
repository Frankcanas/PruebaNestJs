import React, { useState, useEffect } from 'react';
import {
  maintenancesService,
  type CreateMaintenanceDto,
  type CompleteMaintenanceDto,
} from '../services/maintenances.service';
import { vehiclesService } from '../services/vehicles.service';
import { mechanicsService } from '../services/mechanics.service';
import { workshopsService } from '../services/workshops.service';
import type { Maintenance, Vehicle, Mechanic, Workshop } from '../types';
import { Badge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Plus,
  Play,
  CheckCircle,
  Ban,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  Truck,
  Building2,
  FileText,
} from 'lucide-react';

export const MaintenancesView: React.FC = () => {
  const { user } = useAuth();
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<'ALL' | 'ACTIVE' | 'MY_ASSIGNED'>('ALL');

  // Supporting data for dropdowns
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateMaintenanceDto>({
    vehicleId: '',
    mechanicId: '',
    workshopId: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    estimatedEndDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Complete Modal
  const [completingMaintenance, setCompletingMaintenance] = useState<Maintenance | null>(null);
  const [completeForm, setCompleteForm] = useState<CompleteMaintenanceDto>({
    totalCost: 150.0,
    laborHours: 3.5,
    notes: '',
  });
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Cancel Modal
  const [cancellingMaintenance, setCancellingMaintenance] = useState<Maintenance | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isMechanic = user?.role === 'MECHANIC';

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      setError(null);
      let data: Maintenance[] = [];
      if (viewFilter === 'ACTIVE') {
        data = await maintenancesService.getActive();
      } else if (viewFilter === 'MY_ASSIGNED') {
        data = await maintenancesService.getMyAssigned();
      } else {
        data = await maintenancesService.getAll();
      }
      setMaintenances(data);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener la lista de mantenimientos');
    } finally {
      setLoading(false);
    }
  };

  const loadSupportingData = async () => {
    try {
      const [vList, mList, wList] = await Promise.all([
        vehiclesService.getAll(),
        mechanicsService.getAll(),
        workshopsService.getActive(),
      ]);
      setVehicles(vList);
      setMechanics(mList);
      setWorkshops(wList);

      if (vList.length > 0 && !createForm.vehicleId) {
        setCreateForm((prev) => ({
          ...prev,
          vehicleId: vList[0].id,
          mechanicId: mList[0]?.id || '',
          workshopId: wList[0]?.id || '',
        }));
      }
    } catch (e) {
      console.error('Error cargando recursos para formularios', e);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, [viewFilter]);

  useEffect(() => {
    if (canManage) {
      loadSupportingData();
    }
  }, [canManage]);

  const handleStart = async (m: Maintenance) => {
    if (!confirm(`¿Iniciar la orden de mantenimiento para el vehículo ${m.vehicle?.plate || ''}?`)) {
      return;
    }
    try {
      await maintenancesService.start(m.id);
      await fetchMaintenances();
    } catch (err: any) {
      alert(err?.message || 'Error al iniciar mantenimiento');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    try {
      await maintenancesService.create({
        ...createForm,
        scheduledDate: new Date(createForm.scheduledDate).toISOString(),
        estimatedEndDate: new Date(createForm.estimatedEndDate).toISOString(),
      });
      setShowCreateModal(false);
      await fetchMaintenances();
    } catch (err: any) {
      setCreateError(err?.message || 'Error al agendar mantenimiento');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingMaintenance) return;
    setCompleteError(null);
    setCompleteLoading(true);
    try {
      await maintenancesService.complete(completingMaintenance.id, {
        totalCost: Number(completeForm.totalCost),
        laborHours: Number(completeForm.laborHours),
        notes: completeForm.notes?.trim() || undefined,
      });
      setCompletingMaintenance(null);
      await fetchMaintenances();
    } catch (err: any) {
      setCompleteError(err?.message || 'Error al liquidar mantenimiento');
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingMaintenance) return;
    setCancelError(null);
    setCancelLoading(true);
    try {
      await maintenancesService.cancel(cancellingMaintenance.id, cancelReason.trim());
      setCancellingMaintenance(null);
      setCancelReason('');
      await fetchMaintenances();
    } catch (err: any) {
      setCancelError(err?.message || 'Error al cancelar mantenimiento');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({maintenances.length})
          </button>
          <button
            onClick={() => setViewFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewFilter === 'ACTIVE'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Activos (Agendados / En Curso)
          </button>
          {isMechanic && (
            <button
              onClick={() => setViewFilter('MY_ASSIGNED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewFilter === 'MY_ASSIGNED'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mis Órdenes Asignadas
            </button>
          )}
        </div>

        {canManage && (
          <button
            onClick={() => {
              loadSupportingData();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Agendar Mantenimiento
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Maintenances List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            Cargando ciclo de mantenimientos...
          </div>
        ) : maintenances.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            No se encontraron órdenes de mantenimiento registradas en este filtro.
          </div>
        ) : (
          maintenances.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4"
            >
              {/* Header: Title + Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{m.description}</h4>
                    <p className="text-xs text-slate-400 font-mono">ID: {m.id}</p>
                  </div>
                </div>
                <Badge status={m.status} />
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="flex items-start gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <Truck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400">Vehículo Asociado</p>
                    <p className="font-semibold text-white mt-0.5">
                      {m.vehicle?.plate || m.vehicleId}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {m.vehicle?.brand} {m.vehicle?.model}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400">Mecánico a Cargo</p>
                    <p className="font-semibold text-white mt-0.5">
                      {m.mechanic?.user?.fullName || 'Asignado'}
                    </p>
                    <p className="text-slate-500 text-[11px]">{m.mechanic?.specialty}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <Building2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400">Taller Autorizado</p>
                    <p className="font-semibold text-white mt-0.5">
                      {m.workshop?.name || m.workshopId}
                    </p>
                    <p className="text-slate-500 text-[11px]">{m.workshop?.address}</p>
                  </div>
                </div>
              </div>

              {/* Dates & Liquidation Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Inicio Prog.: {new Date(m.scheduledDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Fin Est.: {new Date(m.estimatedEndDate).toLocaleDateString()}
                  </span>
                  {m.actualEndDate && (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Cierre: {new Date(m.actualEndDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {m.status === 'COMPLETED' && (
                  <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-300 font-medium">
                    <span>M.O.: {m.laborHours ?? 0} hrs</span>
                    <span>•</span>
                    <span className="font-bold">Total: ${m.totalCost ?? 0}</span>
                  </div>
                )}
              </div>

              {m.notes && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Notas de Cierre: {m.notes}</span>
                </div>
              )}

              {/* State Machine Action Controls */}
              {(m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS') && (
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-800/80">
                  {m.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleStart(m)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Iniciar Mantenimiento
                    </button>
                  )}

                  {m.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => {
                        setCompletingMaintenance(m);
                        setCompleteForm({
                          totalCost: 150.0,
                          laborHours: 4.0,
                          notes: 'Servicio completado satisfactoriamente según el checklist.',
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Liquidar y Completar
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setCancellingMaintenance(m);
                      setCancelReason('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Agendar Mantenimiento */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-400" />
                Agendar Nueva Orden de Mantenimiento
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descripción del Trabajo Requerido
                </label>
                <textarea
                  required
                  rows={2}
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  placeholder="ej. Cambio de aceite de motor sintético, filtro y revisión de frenos..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Vehículo de la Flota
                </label>
                <select
                  value={createForm.vehicleId}
                  onChange={(e) => setCreateForm({ ...createForm, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} — {v.brand} {v.model} ({v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mecánico Asignado
                  </label>
                  <select
                    value={createForm.mechanicId}
                    onChange={(e) => setCreateForm({ ...createForm, mechanicId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {mechanics.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.user?.fullName || m.id.substring(0, 8)} ({m.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Taller Autorizado
                  </label>
                  <select
                    value={createForm.workshopId}
                    onChange={(e) => setCreateForm({ ...createForm, workshopId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {workshops.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (Cap. {w.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha de Inicio Agendada
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.scheduledDate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, scheduledDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Fecha Estimada de Finalización
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.estimatedEndDate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, estimatedEndDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {createLoading ? 'Agendando...' : 'Crear Orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Liquidar y Completar Mantenimiento */}
      {completingMaintenance && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Liquidar y Completar Mantenimiento
                </h3>
                <p className="text-xs text-slate-400">{completingMaintenance.description}</p>
              </div>
              <button
                onClick={() => setCompletingMaintenance(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {completeError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
                {completeError}
              </div>
            )}

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Costo Total ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      min={0.01}
                      value={completeForm.totalCost}
                      onChange={(e) =>
                        setCompleteForm({
                          ...completeForm,
                          totalCost: parseFloat(e.target.value),
                        })
                      }
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Horas de Mano de Obra
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    min={0.1}
                    value={completeForm.laborHours}
                    onChange={(e) =>
                      setCompleteForm({
                        ...completeForm,
                        laborHours: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Notas de Cierre y Liquidación
                </label>
                <textarea
                  rows={3}
                  value={completeForm.notes || ''}
                  onChange={(e) =>
                    setCompleteForm({ ...completeForm, notes: e.target.value })
                  }
                  placeholder="Detalles de repuestos utilizados, garantía, observaciones..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCompletingMaintenance(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={completeLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {completeLoading ? 'Completando...' : 'Finalizar y Liberar Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cancelar Mantenimiento */}
      {cancellingMaintenance && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-400" />
                Cancelar Orden de Mantenimiento
              </h3>
              <button
                onClick={() => setCancellingMaintenance(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cancelError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
                {cancelError}
              </div>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <p className="text-xs text-slate-400">
                Al cancelar este mantenimiento, el vehículo volverá automáticamente al estado{' '}
                <strong className="text-emerald-400">DISPONIBLE</strong> y la orden quedará registrada
                como cancelada permanentemente.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Motivo de Cancelación
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="ej. El cliente solicitó aplazar el servicio o repuesto no disponible..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancellingMaintenance(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {cancelLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
