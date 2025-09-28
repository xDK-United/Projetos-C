import React from 'react';
import { Calendar, Users, Clock, Scissors } from 'lucide-react';

interface HeaderProps {
  currentView: 'client' | 'provider';
  onViewChange: (view: 'client' | 'provider') => void;
  isProviderAuthenticated?: boolean;
}

export default function Header({ currentView, onViewChange, isProviderAuthenticated = false }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Barbearia Online</h1>
              <p className="text-xs text-gray-500">Sistema de Agendamento</p>
            </div>
          </div>
          
          <nav className="flex space-x-2">
            <button
              onClick={() => onViewChange('client')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'client'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-medium">Agendar</span>
            </button>
            
            <button
              onClick={() => onViewChange('provider')}
              disabled={!isProviderAuthenticated && currentView !== 'provider'}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'provider'
                  ? 'bg-blue-600 text-white shadow-md'
                  : isProviderAuthenticated
                  ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">
                {isProviderAuthenticated ? 'Painel' : 'Painel (Restrito)'}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}