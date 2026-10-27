import React, { useState } from 'react';
import { externalService } from '../services/external.service';
import type { Maintenance } from '../types';
import { Badge } from '../components/Badge';
import { Key, Search, Calendar, Clock, AlertCircle, ShieldCheck } from 'lucide-react';

export const ExternalPartnerView: React.FC = () => {
  const [apiKey, setApiKey] = useState('demo-key-partner-1');
  const [plate, setPlate] = useState('ABC123');
  const [history, setHistory] = useState<Maintenance[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !apiKey.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await externalService.getVehicleHistory(plate.trim().toUpperCase(), apiKey.trim());
      setHistory(data);
    } catch (err: any) {
      setError(err?.message || 'Error al consultar historial con API Key');
      setHistory(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Portal de Consulta para Socios Externos</h3>
            <p className="text-xs text-slate-400">
              Integración B2B protegida mediante autenticación por clave de API (Header <code className="text-indigo-400">x-api-key</code>)
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Clave de API de Socio (<code className="text-indigo-400">x-api-key</code>)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="demo-key-partner-1"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Placa del Vehículo
              </label>
              <input
                type="text"
                required
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Consultando...' : 'Consultar Historial'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {history && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-white">
              Historial de Mantenimientos — Placa {plate}
            </h4>
            <span className="text-xs text-slate-400">
              {history.length} registro(s) encontrado(s)
            </span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
              No se registran mantenimientos previos para la placa {plate}.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{item.description}</span>
                    <Badge status={item.status} />
                  </div>
                  <div className="grid grid-cols-2 text-xs text-slate-400 gap-2 pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Agendado: {new Date(item.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Est. Fin: {new Date(item.estimatedEndDate).toLocaleDateString()}
                    </div>
                  </div>
                  {item.status === 'COMPLETED' && (
                    <div className="text-xs bg-emerald-500/10 text-emerald-300 p-2.5 rounded-lg border border-emerald-500/20 flex items-center justify-between">
                      <span>Mano de Obra: {item.laborHours ?? 0} hrs</span>
                      <span className="font-bold">Costo Final: ${item.totalCost ?? 0}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
