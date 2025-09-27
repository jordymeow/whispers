import { Suspense } from 'react';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="page-center" style={{ background: '#121a30', minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
}