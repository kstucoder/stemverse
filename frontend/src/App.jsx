import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';

export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname.startsWith('/auth');

  // Landing sahifa (VOLTRA) — hech qanday wrapper, to'liq mustaqil
  if (isLanding) return <Outlet />;

  return (
    <div className="min-h-screen bg-dark-900">
      {!isAuthPage && <Header />}
      <main><Outlet /></main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '12px' },
        }}
      />
    </div>
  );
}
