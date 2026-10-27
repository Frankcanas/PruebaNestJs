import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './views/LoginView';
import { Layout, type ActiveTab } from './components/Layout';
import { VehiclesView } from './views/VehiclesView';
import { MaintenancesView } from './views/MaintenancesView';
import { MechanicsView } from './views/MechanicsView';
import { WorkshopsView } from './views/WorkshopsView';
import { ExternalPartnerView } from './views/ExternalPartnerView';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('vehicles');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm">Iniciando sesión en FleetCore...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'vehicles' && <VehiclesView />}
      {activeTab === 'maintenances' && <MaintenancesView />}
      {activeTab === 'mechanics' && <MechanicsView />}
      {activeTab === 'workshops' && <WorkshopsView />}
      {activeTab === 'external' && <ExternalPartnerView />}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
