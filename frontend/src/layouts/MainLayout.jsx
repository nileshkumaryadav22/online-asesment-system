import { Outlet, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const MainLayout = ({ allowedRoles }) => {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass md:h-screen sticky top-0 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Exam System Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Exam System
            </h1>
          </div>
          <p className="text-sm text-gray-400 mt-1 capitalize">{user.role} Panel</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link to={`/${user.role}/dashboard`} className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
            Dashboard
          </Link>
          {user.role === 'admin' && (
            <>
              <Link to="/admin/quiz/create" className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                Create Quiz
              </Link>
              <Link to="/admin/coding/create" className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                Create Coding Problem
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
