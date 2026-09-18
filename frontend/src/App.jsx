import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HigherAuthorityDashboard } from './pages/HigherAuthorityDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { TaskManagement } from './pages/TaskManagement';
import { AISchedulerView } from './pages/AISchedulerView';
import { ScheduleCalendar } from './pages/ScheduleCalendar';
import { EscalationsView } from './pages/EscalationsView';
import { AnalyticsView } from './pages/AnalyticsView';
import { OrganizationSettings } from './pages/OrganizationSettings';
import { AuditLogsView } from './pages/AuditLogsView';
import { HackathonRound2 } from './pages/HackathonRound2';
import { AIActivityDrawer } from './components/AIActivityDrawer';
import { SimulationModal } from './components/SimulationModal';
import { RefreshCw } from 'lucide-react';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [schedulerTaskId, setSchedulerTaskId] = useState(null);
  const [showAIActivity, setShowAIActivity] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  // If loading session, show sleek loader
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="flex items-center gap-3 text-indigo-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-semibold text-sm text-slate-200">Initializing AI Work Scheduler Workspace...</span>
        </div>
        <p className="text-xs text-slate-500">Connecting to multi-agent workforce orchestration engine</p>
      </div>
    );
  }

  const roleLevel = user.role_level || 'EMPLOYEE';

  const handleLaunchScheduler = (taskId) => {
    setSchedulerTaskId(taskId);
    setActivePage('ai-scheduler');
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        if (roleLevel === 'HIGHER_AUTHORITY') {
          return <HigherAuthorityDashboard onNavigate={setActivePage} />;
        } else if (roleLevel === 'MANAGER') {
          return (
            <ManagerDashboard
              onNavigate={setActivePage}
              onSelectTaskForSchedule={(id) => setSchedulerTaskId(id)}
            />
          );
        } else {
          return <EmployeeDashboard onNavigate={setActivePage} />;
        }

      case 'tasks':
      case 'my-tasks':
        return <TaskManagement onLaunchScheduler={handleLaunchScheduler} />;

      case 'ai-scheduler':
        return (
          <AISchedulerView
            initialTaskId={schedulerTaskId}
            onTaskAssigned={() => setActivePage('dashboard')}
          />
        );

      case 'calendar':
        return <ScheduleCalendar />;

      case 'escalations':
        return <EscalationsView />;

      case 'analytics':
        return <AnalyticsView />;

      case 'settings':
        return <OrganizationSettings />;

      case 'audit-logs':
        return <AuditLogsView />;

      case 'hackathon-round2':
        return <HackathonRound2 />;

      case 'personnel':
      case 'team':
      case 'profile':
      case 'leave':
        if (roleLevel === 'EMPLOYEE') {
          return <EmployeeDashboard onNavigate={setActivePage} />;
        }
        return <HigherAuthorityDashboard onNavigate={setActivePage} />;

      default:
        return <HigherAuthorityDashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar
        onOpenAIActivity={() => setShowAIActivity(true)}
        onOpenSimulation={() => setShowSimulation(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        <main className="flex-1 overflow-y-auto bg-slate-950/90">
          {renderActivePage()}
        </main>
      </div>

      {/* Slide-out Real-time AI Agent Activity Drawer */}
      <AIActivityDrawer
        isOpen={showAIActivity}
        onClose={() => setShowAIActivity(false)}
      />

      {/* Demo Simulation Controls Modal */}
      <SimulationModal
        isOpen={showSimulation}
        onClose={() => setShowSimulation(false)}
        onActionCompleted={() => {}}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
