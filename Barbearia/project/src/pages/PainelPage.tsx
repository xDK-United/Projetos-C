import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BarChart3, Users, Calendar, DollarSign } from 'lucide-react';

export default function PainelPage() {
  const navigate = useNavigate();

  // Verificar se está logado
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('prestador_logado') === 'true';
    if (!isLoggedIn) {
      navigate('/login-prestador');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('prestador_logado');
    navigate('/login-prestador');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bem-vindo ao Painel do Prestador</h1>
            <p className="text-gray-600 mt-2">Gerencie seus agendamentos e visualize estatísticas</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Agendamentos Hoje</h3>
                <p className="text-2xl font-bold text-blue-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">Confirmados</h3>
                <p className="text-2xl font-bold text-green-900">6</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Pendentes</h3>
                <p className="text-2xl font-bold text-yellow-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-800">Receita Hoje</h3>
                <p className="text-2xl font-bold text-purple-900">R$ 420</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Agendamentos de Hoje</h2>
          
          <div className="space-y-4">
            {/* Mock appointments */}
            {[
              { nome: 'João Silva', servico: 'Corte Masculino', horario: '09:00', telefone: '(11) 99999-9999', status: 'Confirmado' },
              { nome: 'Pedro Santos', servico: 'Barba', horario: '10:30', telefone: '(11) 88888-8888', status: 'Pendente' },
              { nome: 'Carlos Lima', servico: 'Corte + Barba', horario: '14:00', telefone: '(11) 77777-7777', status: 'Confirmado' },
            ].map((agendamento, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{agendamento.nome}</h3>
                    <p className="text-sm text-gray-600">{agendamento.servico} • {agendamento.horario}</p>
                    <p className="text-sm text-gray-500">{agendamento.telefone}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  agendamento.status === 'Confirmado' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {agendamento.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}