import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateFarmPage from './pages/CreateFarmPage';
import { Leaf } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-light text-dark flex flex-col">
        {/* Simple Navbar */}
        <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight text-primary">
              AgroResilience
            </span>
          </div>
          <div className="flex gap-4">
            <Link to="/farms/new" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
              Add Farm
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/farms/new" element={<CreateFarmPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

function Home() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 mt-20">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-primary mb-2">
          AgroResilience
        </h1>
        <p className="text-gray-500 mb-6">
          AI-powered climate-resilient farming platform.
        </p>
        <Link 
          to="/farms/new"
          className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
        >
          Create Farm
        </Link>
      </div>
    </div>
  );
}

export default App;
