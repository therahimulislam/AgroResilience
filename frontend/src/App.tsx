import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import CreateFarmPage from './pages/CreateFarmPage';
import DashboardPage from './pages/DashboardPage';
import AssistantPage from './pages/AssistantPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import FarmsPortalPage from './pages/FarmsPortalPage';
import { Leaf, LogOut, PlusCircle, LayoutDashboard, Menu, X } from 'lucide-react';
import { logout } from './services/auth';
import { useState } from 'react';

function Navbar() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem('token');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          AgroResilience
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <Link to="/farms" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50">
              <LayoutDashboard className="w-4 h-4" /> My Farms
            </Link>
            <Link to="/farms/new" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50">
              <PlusCircle className="w-4 h-4" /> Add Farm
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors px-4 py-2 rounded-lg">Sign In</Link>
            <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:shadow-md hover:shadow-emerald-200 transition-all">
              Get Started Free
            </Link>
          </>
        )}
      </div>

      {/* Mobile Nav Toggle */}
      <button className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg p-4 space-y-2 md:hidden">
          {isLoggedIn ? (
            <>
              <Link to="/farms" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                <LayoutDashboard className="w-4 h-4" /> My Farms
              </Link>
              <Link to="/farms/new" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                <PlusCircle className="w-4 h-4" /> Add Farm
              </Link>
              <button onClick={() => logout()} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-center">Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

// Protected route: redirect to login if not authenticated
function Protected({ children }: { children: React.ReactNode }) {
  const isLoggedIn = !!localStorage.getItem('token');
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/farms" element={<Protected><FarmsPortalPage /></Protected>} />
            <Route path="/farms/new" element={<Protected><CreateFarmPage /></Protected>} />
            <Route path="/farms/:farmId/dashboard" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/farms/:farmId/assistant" element={<Protected><AssistantPage /></Protected>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
