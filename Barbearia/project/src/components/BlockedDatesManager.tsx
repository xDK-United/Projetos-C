import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarbershopService } from '../services/barbershopService';
import type { DataBloqueada } from '../types';

export default function BlockedDatesManager() {
  const [datasBloquedas, setDatasBloquedas] = useState<DataBloqueada[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    carregarDatasBloquedas();
  }, []);

  const carregarDatasBloquedas = async () => {
    try {
      const datas = await BarbershopService.getDatasBloquedasPrestador();
      setDatasBloquedas(datas);
    } catch (error) {
      console.error('Erro ao carregar datas bloqueadas:', error);
      showMessage('error', 'Erro ao carregar datas bloqueadas');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const gerarDiasCalendario = () => {
    const inicioMes = startOfMonth(currentMonth);
    const fimMes = endOfMonth(currentMonth);
    const dias = eachDayOfInterval({ start: inicioMes, end: fimMes });
    
    const primeiroDia = inicioMes.getDay();
    const diasAnteriores = [];
    for (let i = primeiroDia - 1; i >= 0; i--) {
      diasAnteriores.push(addDays(inicioMes, -i - 1));
    }
    
    const ultimoDia = fimMes.getDay();
    const diasPosteriores = [];
    for (let i = 1; i <= 6 - ultimoDia; i++) {
      diasPosteriores.push(addDays(fimMes, i));
    }
    
    return [...diasAnteriores, ...dias, ...diasPosteriores];
  };

  const isDataBloqueada = (data: Date): boolean => {
    const dataString = format(data, 'yyyy-MM-dd');
    return datasBloquedas.some(db => db.data_bloqueada === dataString);
  };

  const getDataBloqueada = (data: Date): DataBloqueada | undefined => {
    const dataString = format(data, 'yyyy-MM-dd');
    return datasBloquedas.find(db => db.data_bloqueada === dataString);
  };

  const isDataValida = (data: Date): boolean => {
    const hoje = startOfDay(new Date());
    const dataEscolhida = startOfDay(data);
    return !isBefore(dataEscolhida, hoje);
  };

  const navegarMes = (direcao: number) => {
    setCurrentMonth(prev => addDays(startOfMonth(prev), direcao * 30));
  };

  const selecionarData = (data: Date) => {
    if (!isSameMonth(data, currentMonth) || !isDataValida(data)) return;
    
    if (isDataBloqueada(data)) {
      // Se já está bloqueada, perguntar se quer desbloquear
      const dataBloqueada = getDataBloqueada(data);
      if (dataBloqueada && window.confirm(`Desbloquear a data ${format(data, 'dd/MM/yyyy')}?`)) {
        desbloquearData(dataBloqueada.id);
      }
    } else {
      // Se não está bloqueada, abrir modal para bloquear
      setSelectedDate(data);
      setMotivo('');
      setShowModal(true);
    }
  };

  const bloquearData = async () => {
    if (!selectedDate) return;

    setLoading(true);
    try {
      await BarbershopService.bloquearData(selectedDate, motivo.trim() || undefined);
      await carregarDatasBloquedas();
      setShowModal(false);
      setSelectedDate(null);
      setMotivo('');
      showMessage('success', 'Data bloqueada com sucesso!');
    } catch (error) {
      console.error('Erro ao bloquear data:', error);
      showMessage('error', 'Erro ao bloquear data');
    } finally {
      setLoading(false);
    }
  };

  const desbloquearData = async (dataId: string) => {
    try {
      await BarbershopService.desbloquearData(dataId);
      await carregarDatasBloquedas();
      showMessage('success', 'Data desbloqueada com sucesso!');
    } catch (error) {
      console.error('Erro ao desbloquear data:', error);
      showMessage('error', 'Erro ao desbloquear data');
    }
  };

  const dias = gerarDiasCalendario();
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Datas Bloqueadas</h3>
            <p className="text-sm text-gray-600">Clique em uma data para bloquear/desbloquear</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navegarMes(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Calendar className="w-5 h-5 transform rotate-180" />
        </button>
        
        <span className="text-lg font-medium">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </span>
        
        <button
          onClick={() => navegarMes(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {diasSemana.map(dia => (
          <div key={dia} className="p-2 text-center text-sm font-medium text-gray-500">
            {dia}
          </div>
        ))}
      </div>
      
      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {dias.map((dia, index) => {
          const isCurrentMonth = isSameMonth(dia, currentMonth);
          const isBloqueada = isDataBloqueada(dia);
          const isValidDate = isDataValida(dia);
          const isTodayDate = isToday(dia);
          
          return (
            <button
              key={index}
              onClick={() => selecionarData(dia)}
              disabled={!isCurrentMonth || !isValidDate}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200 relative
                ${!isCurrentMonth 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : !isValidDate
                  ? 'text-gray-400 cursor-not-allowed'
                  : isBloqueada
                  ? 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                  : isTodayDate
                  ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100'
                  : 'hover:bg-gray-100 text-gray-900'
                }
              `}
            >
              {format(dia, 'd')}
              {isBloqueada && isCurrentMonth && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
              {isTodayDate && isCurrentMonth && !isBloqueada && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Blocked Dates List */}
      {datasBloquedas.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Datas Bloqueadas Ativas</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {datasBloquedas.map((data) => (
              <div key={data.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <span className="font-medium text-red-800">
                    {format(new Date(data.data_bloqueada + 'T00:00:00'), 'dd/MM/yyyy')}
                  </span>
                  {data.motivo && (
                    <p className="text-sm text-red-600 mt-1">{data.motivo}</p>
                  )}
                </div>
                <button
                  onClick={() => desbloquearData(data.id)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                  title="Desbloquear data"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para bloquear data */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Bloquear Data</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Data selecionada: <span className="font-medium text-gray-900">
                  {format(selectedDate, 'dd/MM/yyyy')}
                </span>
              </p>
              
              <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo (opcional)
              </label>
              <input
                type="text"
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ex: Feriado, Viagem, etc."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={bloquearData}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Bloqueando...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Bloquear</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}