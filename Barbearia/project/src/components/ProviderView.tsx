import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, DollarSign, Filter, TrendingUp, Scissors, CheckCircle, LogOut, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarbershopService } from '../services/barbershopService';
import { AuthService } from '../services/authService';
import type { AgendamentoComDetalhes, EstatisticasDia, StatusAgendamento } from '../types';
import AppointmentCard from './AppointmentCard';
import BlockedDatesManager from './BlockedDatesManager';

interface ProviderViewProps {
  onLogout: () => void;
}

export default function ProviderView({ onLogout }: ProviderViewProps) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoComDetalhes[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasDia>({
    totalAgendamentos: 0,
    confirmados: 0,
    pendentes: 0,
    cancelados: 0,
    receitaDia: 0
  });
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | StatusAgendamento>('todos');
  const [dataAtual] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'datas-bloqueadas'>('agendamentos');

  useEffect(() => {
    carregarDadosDia();
  }, []);

  const carregarDadosDia = async () => {
    setLoading(true);
    try {
      // Configurar sessão antes de fazer as consultas
      const accessCode = AuthService.getAccessCode();
      if (accessCode) {
        await AuthService.setupSession(accessCode);
      }
      
      const [agendamentosData, estatisticasData] = await Promise.all([
        BarbershopService.getAgendamentosPorData(dataAtual),
        BarbershopService.getEstatisticasDia(dataAtual)
      ]);
      
      setAgendamentos(agendamentosData);
      setEstatisticas(estatisticasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const alterarStatus = async (id: string, novoStatus: StatusAgendamento) => {
    try {
      await BarbershopService.atualizarStatusAgendamento(id, novoStatus);
      
      // Atualizar estado local
      setAgendamentos(prev => 
        prev.map(agendamento => 
          agendamento.id === id ? { ...agendamento, status: novoStatus } : agendamento
        )
      );
      
      // Recarregar estatísticas
      const novasEstatisticas = await BarbershopService.getEstatisticasDia(dataAtual);
      setEstatisticas(novasEstatisticas);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do agendamento');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    onLogout();
  };

  const agendamentosFiltrados = agendamentos.filter(agendamento => 
    filtroStatus === 'todos' || agendamento.status === filtroStatus
  );

  const cardsEstatisticas = [
    {
      titulo: 'Agendamentos Hoje',
      valor: estatisticas.totalAgendamentos,
      icon: Calendar,
      cor: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      titulo: 'Confirmados',
      valor: estatisticas.confirmados,
      icon: CheckCircle,
      cor: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      titulo: 'Pendentes',
      valor: estatisticas.pendentes,
      icon: Clock,
      cor: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      titulo: 'Receita Hoje',
      valor: `R$ ${estatisticas.receitaDia.toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      cor: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel do Prestador</h1>
              <p className="text-gray-600">
                {format(dataAtual, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cardsEstatisticas.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className={`${card.bgColor} rounded-xl p-6 border ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-medium ${card.textColor.replace('600', '800')}`}>
                      {card.titulo}
                    </h3>
                    <p className={`text-2xl font-bold ${card.textColor.replace('600', '900')}`}>
                      {card.valor}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lista de Agendamentos */}
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('agendamentos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'agendamentos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Agendamentos</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('datas-bloqueadas')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'datas-bloqueadas'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Ban className="w-4 h-4" />
                  <span>Datas Bloqueadas</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'agendamentos' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Agendamentos de Hoje
                </h2>
              </div>
              
              <div className="flex items-center space-x-3">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="Pendente">Pendentes</option>
                  <option value="Confirmado">Confirmados</option>
                  <option value="Concluido">Concluídos</option>
                  <option value="Cancelado">Cancelados</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando agendamentos...</span>
              </div>
            ) : agendamentosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agendamentosFiltrados.map(agendamento => (
                  <AppointmentCard
                    key={agendamento.id}
                    agendamento={agendamento}
                    onStatusChange={alterarStatus}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {filtroStatus === 'todos' 
                    ? 'Nenhum agendamento hoje'
                    : `Nenhum agendamento ${filtroStatus.toLowerCase()}`
                  }
                </h3>
                <p className="text-gray-500">
                  {filtroStatus === 'todos' 
                    ? 'Quando houver agendamentos, eles aparecerão aqui.'
                    : `Não há agendamentos com status "${filtroStatus}".`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
        ) : (
          <BlockedDatesManager />
        )}

        {/* Resumo do Dia */}
        {estatisticas.totalAgendamentos > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Resumo do Dia</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{estatisticas.totalAgendamentos}</p>
                <p className="text-blue-100">Total de Agendamentos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {estatisticas.totalAgendamentos > 0 
                    ? Math.round((estatisticas.confirmados / estatisticas.totalAgendamentos) * 100)
                    : 0
                  }%
                </p>
                <p className="text-blue-100">Taxa de Confirmação</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  R$ {estatisticas.receitaDia.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-blue-100">Receita Confirmada</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}