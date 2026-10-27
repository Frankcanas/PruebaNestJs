import React, { useState, useEffect } from 'react';
import { mechanicsService } from '../services/mechanics.service';
import type { Mechanic } from '../types';
import { Badge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, CheckCircle, XCircle, Search, Calendar, AlertCircle, X } from 'lucide-react';

export const MechanicsView: React.FC = () => {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Validate Availability Modal
  const [checkingMechanic, setCheckingMechanic] = useState<Mechanic | null>(null);
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [availabilityResult, setAvailabilityResult] = useState<{
    checked: boolean;
    available?: boolean;
    message?: string;
  }>({ checked: false });
  const [checkingLoading, setCheckingLoading] = useState(false);

  // Create Mechanic Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const fetchMechanics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mechanicsService.getAll();
      setMechanics(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar mecánicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const handleValidateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkingMechanic) return;
    setCheckingLoading(true);
    try {
      const res = await mechanicsService.validateAvailability(
        checkingMechanic.id,
        new Date(checkDate).toISOString(),
      );
      setAvailabilityResult({
        checked: true,
        available: res.available,
        message: res.available
          ? 'El mecánico se encuentra totalmente DISPONIBLE en esta fecha.'
          : 'El mecánico tiene un mantenimiento ACTIVO o TRASLAPADO en esta fecha.',
      });
    } catch (err: any) {
      setAvailabilityResult({
        checked: true,
        available: false,
        message: err?.message || 'Error al consultar disponibilidad',
      });
    } finally {
      setCheckingLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    try {
      await mechanicsService.create({
        userId: newUserId.trim(),
        specialty: newSpecialty.trim(),
      });
      setShowCreateModal(false);
      setNewUserId('');
      setNewSpecialty('');
      await fetchMechanics();
    } catch (err: any) {
      setCreateError(err?.message || 'Error al registrar el mecánico');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredMechanics = mechanics.filter((m) => {
    const name = m.user?.fullName || '';
    const email = m.user?.email || '';
    const specialty = m.specialty || '';
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      specialty.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, especialidad o correo..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Mecánico
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            Cargando equipo de mecánicos...
          </div>
        ) : filteredMechanics.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            No se encontraron mecánicos.
          </div>
        ) : (
          filteredMechanics.map((mech) => (
            <div
              key={mech.id}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {mech.user?.fullName || 'Mecánico Registrado'}
                    </h4>
                    <p className="text-xs text-slate-400">{mech.user?.email || 'Sin correo'}</p>
                  </div>
                </div>
                <Badge status={mech.isActive ? 'ACTIVE' : 'INACTIVE'} />
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-xs text-slate-400">Especialidad Técnica:</p>
                <p className="text-sm font-medium text-slate-200 mt-0.5">{mech.specialty}</p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setCheckingMechanic(mech);
                    setAvailabilityResult({ checked: false });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Consultar Disponibilidad
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Validar Disponibilidad */}
      {checkingMechanic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  Verificar Disponibilidad
                </h3>
                <p className="text-xs text-slate-400">
                  {checkingMechanic.user?.fullName} ({checkingMechanic.specialty})
                </p>
              </div>
              <button
                onClick={() => setCheckingMechanic(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleValidateAvailability} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Fecha a consultar
                </label>
                <input
                  type="date"
                  required
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={checkingLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition cursor-pointer disabled:opacity-50"
              >
                {checkingLoading ? 'Verificando en agenda...' : 'Comprobar Agenda'}
              </button>
            </form>

            {availabilityResult.checked && (
              <div
                className={`mt-4 p-4 rounded-xl border text-xs flex items-start gap-3 ${
                  availabilityResult.available
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {availabilityResult.available ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">
                    {availabilityResult.available ? 'Mecánico Disponible' : 'No Disponible'}
                  </p>
                  <p className="mt-0.5 opacity-90">{availabilityResult.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Crear Mecánico */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-400" />
                Vincular Nuevo Mecánico
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

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ID de Usuario (UUID del usuario con rol MECHANIC)
                </label>
                <input
                  type="text"
                  required
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="ej. 550e8400-e29b-41d4-a716-446655440000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Especialidad
                </label>
                <input
                  type="text"
                  required
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="ej. Motores Diésel y Transmisiones"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
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
                  {createLoading ? 'Guardando...' : 'Crear Mecánico'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
