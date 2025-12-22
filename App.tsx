import React, { useState, useEffect } from 'react';
import { Users, Beaker, FileText, LogOut, Menu, X } from 'lucide-react';
import { PageView } from './types';
import { cn } from './components/Components';
import { LoginPage } from './pages/LoginPage';
import { PatientsPage } from './pages/PatientsPage';
import { TestsPage } from './pages/TestsPage';
import { CreateReportPage } from './pages/CreateReportPage';
import { ReportsPage } from './pages/ReportsPage';
import { apiService } from './services/apiService';

const App = () => {
  const [view, setView] = useState<PageView>('LOGIN');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const username = localStorage.getItem('username');

    if (token && username) {
      apiService.setToken(token);
      setIsLoggedIn(true);
      setView('REPORTS');
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    apiService.setToken('');
    setIsLoggedIn(false);
    setView('LOGIN');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setView('REPORTS');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  const renderContent = () => {
    switch (view) {
      case 'PATIENTS':
        return <PatientsPage />;
      case 'TESTS':
        return <TestsPage />;
      case 'REPORTS':
        return <ReportsPage onCreateClick={() => setView('CREATE_REPORT')} />;
      case 'CREATE_REPORT':
        return <CreateReportPage onCancel={() => setView('REPORTS')} onSave={() => setView('REPORTS')} />;
      default:
        return <ReportsPage onCreateClick={() => setView('CREATE_REPORT')} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "w-64 bg-white border-r border-gray-200 fixed h-full z-30 transition-transform duration-300 ease-in-out",
        "md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b">
          <span className="font-bold text-xl tracking-tight">MedLab</span>
          <button 
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { id: 'REPORTS', label: 'Reports', icon: FileText },
            { id: 'PATIENTS', label: 'Patients', icon: Users },
            { id: 'TESTS', label: 'Lab Tests', icon: Beaker },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id as PageView);
                setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                view === item.id ? "bg-[#daf0ee] text-gray-900" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-8 overflow-y-auto">

        <div className="md:hidden flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg">MedLab</span>
          </div>
          <button onClick={handleLogout}><LogOut className="w-5 h-5" /></button>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;