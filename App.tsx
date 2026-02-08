
import React, { useState } from 'react';
import { ViewType } from './types';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import EvaluationPage from './pages/EvaluationPage';
import ReportsPage from './pages/ReportsPage';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('DASHBOARD');

  const renderContent = () => {
    switch (activeView) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'STUDENTS':
        return <StudentsPage />;
      case 'EVALUATION':
        return <EvaluationPage />;
      case 'REPORTS':
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (activeView) {
      case 'DASHBOARD': return 'مُقرئ - الرئيسية';
      case 'STUDENTS': return 'إدارة الطلاب';
      case 'EVALUATION': return 'التقييم الأسبوعي';
      case 'REPORTS': return 'تقارير الأداء';
      default: return 'مُقرئ';
    }
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView} title={getTitle()}>
      {renderContent()}
    </Layout>
  );
};

export default App;
