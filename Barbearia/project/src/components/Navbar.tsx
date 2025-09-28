import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, Scissors } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Barbearia Online</h1>
              <p className="text-xs text-gray-500">Sistema de Agendamento</p>
            </div>
          </Link>
          
          {/* Navigation */}
          <div className="flex space-x-2">
            <Link
              to="/agendar"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/agendar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Agendar</span>
            </Link>
            
            <Link
              to="/login-prestador"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/login-prestador' || location.pathname === '/painel'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Painel (Restrito)</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}