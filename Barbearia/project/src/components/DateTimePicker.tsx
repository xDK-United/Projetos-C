import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarbershopService } from '../services/barbershopService';
import type { HorarioDisponivel, DataBloqueada } from '../types';

interface DateTimePickerProps {
  servicoId: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
}

export default function DateTimePicker({
  servicoId,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange
}: DateTimePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [datasBloquedas, setDatasBloquedas] = useState<DataBloqueada[]>([]);

  // Carregar datas bloqueadas ao montar o componente
  useEffect(() => {
    carregarDatasBloquedas();
  }, []);

  // Carregar horários quando a data for selecionada
  useEffect(() => {
    if (selectedDate && servicoId) {
      carregarHorarios();
    }
  }, [selectedDate, servicoId]);

  const carregarDatasBloquedas = async () => {
    try {
      const datas = await BarbershopService.getDatasBloquedas();
      setDatasBloquedas(datas);
    } catch (error) {
      console.error('Erro ao carregar datas bloqueadas:', error);
    }
  };

  const carregarHorarios = async () => {
    if (!selectedDate) return;
    
    setLoadingHorarios(true);
    try {
      const horariosDisponiveis = await BarbershopService.getHorariosDisponiveis(selectedDate, servicoId);
      setHorarios(horariosDisponiveis);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setHorarios([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  // Gerar dias do calendário
  const gerarDiasCalendario = () => {
    const inicioMes = startOfMonth(currentMonth);
    const fimMes = endOfMonth(currentMonth);
    const dias = eachDayOfInterval({ start: inicioMes, end: fimMes });
    
    // Adicionar dias do mês anterior para completar a primeira semana
    const primeiroDia = inicioMes.getDay();
    const diasAnteriores = [];
    for (let i = primeiroDia - 1; i >= 0; i--) {
      diasAnteriores.push(addDays(inicioMes, -i - 1));
    }
    
    // Adicionar dias do próximo mês para completar a última semana
    const ultimoDia = fimMes.getDay();
    const diasPosteriores = [];
    for (let i = 1; i <= 6 - ultimoDia; i++) {
      diasPosteriores.push(addDays(fimMes, i));
    }
    
    return [...diasAnteriores, ...dias, ...diasPosteriores];
  };

  const dias = gerarDiasCalendario();
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const navegarMes = (direcao: number) => {
    setCurrentMonth(prev => addDays(startOfMonth(prev), direcao * 30));
  };

  const selecionarData = (data: Date) => {
    if (BarbershopService.isDataValida(data) && !isDataBloqueada(data)) {
      onDateChange(data);
      onTimeChange(''); // Reset do horário
    }
  };

  const isDataBloqueada = (data: Date): boolean => {
    const dataString = format(data, 'yyyy-MM-dd');
    return datasBloquedas.some(db => db.data_bloqueada === dataString);
  };

  const selecionarHorario = (horario: string) => {
    onTimeChange(horario);
  };

  return (
    <div className="space-y-8">
      {/* Calendário */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Escolha a Data</span>
          </h3>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navegarMes(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-lg font-medium min-w-[200px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            
            <button
              onClick={() => navegarMes(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {diasSemana.map(dia => (
            <div key={dia} className="p-3 text-center text-sm font-medium text-gray-500">
              {dia}
            </div>
          ))}
        </div>
        
        {/* Dias do calendário */}
        <div className="grid grid-cols-7 gap-1">
          {dias.map((dia, index) => {
            const isCurrentMonth = isSameMonth(dia, currentMonth);
            const isSelected = selectedDate && isSameDay(dia, selectedDate);
            const isValidDate = BarbershopService.isDataValida(dia);
            const isBloqueada = isDataBloqueada(dia);
            const isTodayDate = isToday(dia);
            
            return (
              <button
                key={index}
                onClick={() => selecionarData(dia)}
                disabled={!isValidDate || !isCurrentMonth || isBloqueada}
                type="button"
                className={`
                  p-3 text-sm rounded-lg transition-all duration-200 relative
                  ${!isCurrentMonth 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : !isValidDate || isBloqueada
                    ? 'text-gray-400 bg-red-50 cursor-not-allowed border border-red-200'
                    : isSelected
                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200'
                    : isTodayDate
                    ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100'
                    : 'hover:bg-blue-50 text-gray-900 hover:shadow-sm'
                  }
                `}
              >
                {format(dia, 'd')}
                {isTodayDate && isCurrentMonth && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
                {isBloqueada && isCurrentMonth && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Horários */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mb-6">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Horários Disponíveis</span>
          </h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Data selecionada: <span className="font-medium text-gray-900">
                {BarbershopService.formatarData(selectedDate)}
              </span>
            </p>
          </div>
          
          {loadingHorarios ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando horários...</span>
            </div>
          ) : horarios.length > 0 ? (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                {horarios.map((horario) => (
                  <button
                    key={horario.horario}
                    onClick={() => selecionarHorario(horario.horario)}
                    disabled={!horario.disponivel}
                    type="button"
                    className={`
                      p-3 text-sm font-medium rounded-lg transition-all duration-200
                      ${!horario.disponivel
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : selectedTime === horario.horario
                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200'
                        : 'bg-gray-50 text-gray-900 hover:bg-blue-50 hover:shadow-md hover:ring-1 hover:ring-blue-200'
                      }
                    `}
                  >
                    {horario.horario}
                  </button>
                ))}
              </div>
              
              {selectedTime && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Horário selecionado: <strong>{selectedTime}</strong></span>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum horário disponível</h4>
              <p className="text-gray-600">
                {isDataBloqueada(selectedDate) 
                  ? 'Esta data está bloqueada para agendamentos.'
                  : 'Não há horários livres para esta data. Tente escolher outro dia.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}