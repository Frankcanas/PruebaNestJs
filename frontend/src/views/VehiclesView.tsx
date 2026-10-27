import React, { useState, useEffect } from 'react';
import { vehiclesService } from '../services/vehicles.service';
import type { Vehicle, Maintenance } from '../types';
import { Badge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Plus,
  Search,
  History,
  Trash2,
  AlertCircle,
  X,
  Calendar,
  Clock,
} from 'lucide-react';

export const VehiclesView: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Create Vehicle Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // History Modal
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [historyList, setHistoryList] = useState<Maintenance[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehiclesService.getAll();
      setVehicles(data);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);
    try {
      await vehiclesService.create({
        plate: newPlate.toUpperCase().trim(),
        brand: newBrand.trim(),
        model: newModel.trim(),
        year: Number(newYear),
      });
      setShowCreateModal(false);
      setNewPlate('');
      setNewBrand('');
      setNewModel('');
      setNewYear(new Date().getFullYear());
      await fetchVehicles();
    } catch (err: any) {
      setCreateError(err?.message || 'Error al registrar vehículo');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!confirm(`¿Estás seguro de desactivar lógicamente el vehículo ${vehicle.plate}?`)) {
      return;
    }
    try {
      await vehiclesService.delete(vehicle.id);
      await fetchVehicles();
    } catch (err: any) {
      alert(err?.message || 'No se pudo desactivar el vehículo');
    }
  };

  const handleOpenHistory = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setHistoryLoading(true);
    try {
      const history = await vehiclesService.getHistory(vehicle.id);
      setHistoryList(history);
    } catch (err: any) {
      alert(err?.message || 'Error al obtener historial');
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = vehicles.filter((v) => v.status === 'AVAILABLE').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'IN_MAINTENANCE').length;
  const inactiveCount = vehicles.filter((v) => v.status === 'INACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs font-medium text-slate-400">Total Flota</p>
          <p className="text-2xl font-bold text-white mt-1">{vehicles.length}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs font-medium text-emerald-400">Disponibles</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1">{availableCount}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs font-medium text-amber-400">En Mantenimiento</p>
          <p className="text-2xl font-bold text-amber-300 mt-1">{maintenanceCount}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <p className="text-xs font-medium text-rose-400">Inactivos</p>
          <p className="text-2xl font-bold text-rose-300 mt-1">{inactiveCount}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por placa, marca o modelo..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="AVAILABLE">Disponibles</option>
            <option value="IN_MAINTENANCE">En Mantenimiento</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Vehículo
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-medium text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Placa</th>
                <th className="px-6 py-3.5">Marca y Modelo</th>
                <th className="px-6 py-3.5">Año</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Cargando flota vehicular...
                  </td>
                </tr>
              ) : filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron vehículos.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 font-mono font-semibold text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-indigo-400" />
                      {vehicle.plate}
                    </td>
                    <td className="px-6 py-4">
                      {vehicle.brand} {vehicle.model}
                    </td>
                    <td className="px-6 py-4 font-mono">{vehicle.year}</td>
                    <td className="px-6 py-4">
                      <Badge status={vehicle.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenHistory(vehicle)}
                        title="Ver Historial de Mantenimientos"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-indigo-400" />
                        Historial
                      </button>
                      {canManage && vehicle.status !== 'INACTIVE' && (
                        <button
                          onClick={() => handleDelete(vehicle)}
                          title="Desactivar Vehículo"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded text-xs transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Vehículo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" /> Registrar Vehículo
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
                  Placa (Única, ej. ABC123)
                </label>
                <input
                  type="text"
                  required
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Toyota"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="Hilux"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Año</label>
                <input
                  type="number"
                  required
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
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
                  {createLoading ? 'Guardando...' : 'Crear Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Historial de Mantenimientos */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Historial de Mantenimientos — {selectedVehicle.plate}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                </p>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {historyLoading ? (
                <p className="text-center py-8 text-slate-400 text-sm">Cargando historial...</p>
              ) : historyList.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">
                  Este vehículo no registra mantenimientos aún.
                </p>
              ) : (
                historyList.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{m.description}</span>
                      <Badge status={m.status} />
                    </div>
                    <div className="grid grid-cols-2 text-xs text-slate-400 gap-2 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Agendado: {new Date(m.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Est. Fin: {new Date(m.estimatedEndDate).toLocaleDateString()}
                      </div>
                    </div>
                    {m.status === 'COMPLETED' && (
                      <div className="text-xs bg-emerald-500/10 text-emerald-300 p-2 rounded border border-emerald-500/20 flex items-center justify-between">
                        <span>Horas M.O.: {m.laborHours ?? 0} hrs</span>
                        <span className="font-semibold">Costo Total: ${m.totalCost ?? 0}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
