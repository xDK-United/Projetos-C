import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AgendarPage from './pages/AgendarPage';
import LoginPrestadorPage from './pages/LoginPrestadorPage';
import PainelPage from './pages/PainelPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/agendar" element={<AgendarPage />} />
          <Route path="/login-prestador" element={<LoginPrestadorPage />} />
          <Route 
            path="/painel" 
            element={
              <ProtectedRoute>
                <PainelPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;