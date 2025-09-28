import React from 'react';
import { Clock, DollarSign, Calendar, Scissors } from 'lucide-react';
import type { Servico } from '../types';

interface ServiceCardProps {
  servico: Servico;
  onSelect: (servico: Servico) => void;
}

export default function ServiceCard({ servico, onSelect }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Scissors className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{servico.nome}</h3>
            {servico.descricao && (
              <p className="text-gray-600 text-sm mt-1">{servico.descricao}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{servico.duracao}min</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-lg font-bold text-green-600">
              R$ {servico.valor.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onSelect(servico)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
      >
        <Calendar className="w-4 h-4" />
        <span>Agendar Agora</span>
      </button>
    </div>
  );
}