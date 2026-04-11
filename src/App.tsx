import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ApplicationForm from './pages/ApplicationForm';
import AnalyzePage from './pages/AnalyzePage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/add"       element={<ApplicationForm />} />
            <Route path="/edit/:id"  element={<ApplicationForm />} />
            <Route path="/analyze"   element={<AnalyzePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}