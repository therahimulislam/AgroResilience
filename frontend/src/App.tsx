import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateFarmPage from './pages/CreateFarmPage';
import DashboardPage from './pages/DashboardPage';
import AssistantPage from './pages/AssistantPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { Leaf, LogOut, PlusCircle } from 'lucide-react';
import { logout } from './services/auth';

function Navbar() {
  const isLoggedIn = !!localStorage.getItem('token');
  return (
    <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <Leaf className="w-6 h-6 text-primary" />
        <span className="text-xl font-bold tracking-tight text-primary">AgroResilience</span>
      </Link>
      <div className="flex items-center gap-2 md:gap-4">
        {isLoggedIn ? (
          <>
            <Link to="/farms/new" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              <PlusCircle className="w-4 h-4" /> Add Farm
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Sign In</Link>
            <Link to="/register" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Home() {
  const isLoggedIn = !!localStorage.getItem('token');
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-12 text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
          <Leaf className="w-4 h-4" />
          AI-Powered Climate-Resilient Farming · India
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight">
          Farm smarter.<br />
          <span className="text-primary">Grow resilient.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          AgroResilience combines satellite imagery, weather intelligence, soil science, and
          Google Gemini AI to give Indian farmers real-time, actionable insights about their crops.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={isLoggedIn ? '/farms/new' : '/register'}
            className="px-8 py-3.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
          >
            {isLoggedIn ? 'Add a Farm' : 'Get Started Free'}
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary hover:text-primary transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {['Satellite NDVI', 'Weather Intelligence', 'Soil Analysis', 'Risk Scoring', 'Gemini AI Chat', 'Voice Q&A', 'Multilingual'].map(f => (
            <span key={f} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/farms/new" element={<CreateFarmPage />} />
            <Route path="/farms/:farmId/dashboard" element={<DashboardPage />} />
            <Route path="/farms/:farmId/assistant" element={<AssistantPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
