import React from 'react';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle, Scissors } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AgendamentoComDetalhes, StatusAgendamento } from '../types';

interface AppointmentCardProps {
  agendamento: AgendamentoComDetalhes;
  onStatusChange?: (id: string, status: StatusAgendamento) => void;
}

export default function AppointmentCard({ agendamento, onStatusChange }: AppointmentCardProps) {
  const getStatusIcon = (status: StatusAgendamento) => {
    switch (status) {
      case 'Confirmado':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pendente':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'Cancelado':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Concluido':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: StatusAgendamento) => {
    switch (status) {
      case 'Confirmado':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'Pendente':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'Cancelado':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Concluido':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const formatarData = (dataString: string) => {
    try {
      const data = new Date(dataString + 'T00:00:00');
      return format(data, "EEEE, dd 'de' MMMM", { locale: ptBR });
    } catch {
      return dataString;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Scissors className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {agendamento.servico?.nome || 'Serviço'}
            </h3>
            <p className="text-gray-600">{agendamento.cliente_nome}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(agendamento.status)}`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(agendamento.status)}
            <span>{agendamento.status}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-3 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatarData(agendamento.data)}</span>
        </div>
        
        <div className="flex items-center space-x-3 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{agendamento.horario}</span>
        </div>
        
        <div className="flex items-center space-x-3 text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{agendamento.cliente_telefone}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <span className="text-lg font-bold text-green-600">
          R$ {agendamento.valor.toFixed(2).replace('.', ',')}
        </span>
        
        {onStatusChange && agendamento.status === 'Pendente' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onStatusChange(agendamento.id, 'Confirmado')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => onStatusChange(agendamento.id, 'Cancelado')}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
        
        {onStatusChange && agendamento.status === 'Confirmado' && (
          <button
            onClick={() => onStatusChange(agendamento.id, 'Concluido')}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Concluir
          </button>
        )}
      </div>
    </div>
  );
}