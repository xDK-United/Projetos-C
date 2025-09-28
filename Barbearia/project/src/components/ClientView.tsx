import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle, ArrowLeft, Scissors } from 'lucide-react';
import { BarbershopService } from '../services/barbershopService';
import type { Servico, Agendamento, EtapaAgendamento } from '../types';
import ServiceCard from './ServiceCard';
import DateTimePicker from './DateTimePicker';
import ClientForm from './ClientForm';

const ClientView: React.FC = () => {
  const [etapaAtual, setEtapaAtual] = useState<EtapaAgendamento>('servicos');
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [dadosCliente, setDadosCliente] = useState({ nome: '', telefone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);

  // Carregar serviços ao montar o componente
  useEffect(() => {
    carregarServicos();
  }, []);

  // Avançar automaticamente quando data e horário estiverem selecionados
  useEffect(() => {
    if (dataSelecionada && horarioSelecionado && etapaAtual === 'datetime') {
      console.log('Data e horário selecionados, avançando para dados');
      setEtapaAtual('dados');
    }
  }, [dataSelecionada, horarioSelecionado, etapaAtual]);

  const carregarServicos = async () => {
    try {
      const servicosData = await BarbershopService.getServicos();
      setServicos(servicosData);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  };

  const selecionarServico = (servico: Servico) => {
    setServicoSelecionado(servico);
    setEtapaAtual('datetime');
  };

  const selecionarData = (data: Date) => {
    setDataSelecionada(data);
    setHorarioSelecionado(null);
  };

  const selecionarHorario = (horario: string) => {
    setHorarioSelecionado(horario);
  };

  const submeterDadosCliente = (nome: string, telefone: string) => {
    setDadosCliente({ nome, telefone });
    setEtapaAtual('confirmacao');
  };

  const confirmarAgendamento = async () => {
    if (!servicoSelecionado || !dataSelecionada || !horarioSelecionado) return;

    setIsLoading(true);
    try {
      const novoAgendamento = await BarbershopService.criarAgendamento({
        servicoId: servicoSelecionado.id,
        clienteNome: dadosCliente.nome,
        clienteTelefone: dadosCliente.telefone,
        data: dataSelecionada,
        horario: horarioSelecionado
      });

      setAgendamento(novoAgendamento);
      setEtapaAtual('sucesso');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const voltarEtapa = () => {
    switch (etapaAtual) {
      case 'datetime':
        setEtapaAtual('servicos');
        break;
      case 'dados':
        setEtapaAtual('datetime');
        break;
      case 'confirmacao':
        setEtapaAtual('dados');
        break;
    }
  };

  const novoAgendamento = () => {
    setEtapaAtual('servicos');
    setServicoSelecionado(null);
    setDataSelecionada(null);
    setHorarioSelecionado(null);
    setDadosCliente({ nome: '', telefone: '' });
    setAgendamento(null);
  };

  const renderIndicadorEtapas = () => {
    const etapas = [
      { key: 'servicos', label: 'Serviço', icon: Scissors },
      { key: 'datetime', label: 'Data/Hora', icon: Calendar },
      { key: 'dados', label: 'Dados', icon: User },
      { key: 'confirmacao', label: 'Confirmação', icon: CheckCircle }
    ];

    const indiceAtual = etapas.findIndex(etapa => etapa.key === etapaAtual);

    return (
      <div className="flex items-center justify-center mb-8">
        {etapas.map((etapa, index) => {
          const Icon = etapa.icon;
          const isAtiva = index <= indiceAtual;
          const isAtual = etapa.key === etapaAtual;

          return (
            <React.Fragment key={etapa.key}>
              <div className={`
                flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                ${isAtiva 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
                ${isAtual ? 'ring-4 ring-blue-200 scale-110' : ''}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              {index < etapas.length - 1 && (
                <div className={`
                  w-16 h-0.5 mx-2 transition-all duration-300
                  ${index < indiceAtual ? 'bg-blue-600' : 'bg-gray-300'}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Botão Voltar */}
        {etapaAtual !== 'servicos' && etapaAtual !== 'sucesso' && (
          <button
            onClick={voltarEtapa}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </button>
        )}

        {/* Indicador de Etapas */}
        {etapaAtual !== 'sucesso' && renderIndicadorEtapas()}

        {/* Etapa: Seleção de Serviços */}
        {etapaAtual === 'servicos' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Escolha seu Serviço
              </h1>
              <p className="text-xl text-gray-600">
                Selecione o serviço desejado para continuar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicos.map((servico) => (
                <ServiceCard
                  key={servico.id}
                  servico={servico}
                  onSelect={selecionarServico}
                />
              ))}
            </div>
          </div>
        )}

        {/* Etapa: Seleção de Data e Horário */}
        {etapaAtual === 'datetime' && servicoSelecionado && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Escolha Data e Horário
              </h1>
              <p className="text-xl text-gray-600">
                Serviço: <span className="font-semibold text-blue-600">{servicoSelecionado.nome}</span>
              </p>
              <p className="text-lg text-gray-500 mt-2">
                Duração: {servicoSelecionado.duracao} minutos • Valor: R$ {servicoSelecionado.valor.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <DateTimePicker
              servicoId={servicoSelecionado.id}
              selectedDate={dataSelecionada}
              selectedTime={horarioSelecionado}
              onDateChange={selecionarData}
              onTimeChange={selecionarHorario}
            />
          </div>
        )}

        {/* Etapa: Dados do Cliente */}
        {etapaAtual === 'dados' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Finalize seu Agendamento
              </h1>
              <p className="text-xl text-gray-600">
                Estamos quase lá! Só precisamos de algumas informações
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <ClientForm onSubmit={submeterDadosCliente} />
            </div>
          </div>
        )}

        {/* Etapa: Confirmação */}
        {etapaAtual === 'confirmacao' && servicoSelecionado && dataSelecionada && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Confirmar Agendamento
              </h1>
              <p className="text-xl text-gray-600">
                Revise os dados antes de confirmar
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Resumo do Agendamento</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <Scissors className="w-4 h-4" />
                      <span>Serviço:</span>
                    </span>
                    <span className="font-semibold text-gray-900">{servicoSelecionado.nome}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Data:</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {BarbershopService.formatarData(dataSelecionada)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Horário:</span>
                    </span>
                    <span className="font-semibold text-gray-900">{horarioSelecionado}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Cliente:</span>
                    </span>
                    <span className="font-semibold text-gray-900">{dadosCliente.nome}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>WhatsApp:</span>
                    </span>
                    <span className="font-semibold text-gray-900">{dadosCliente.telefone}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 bg-green-50 rounded-lg px-4 mt-6">
                    <span className="text-lg font-semibold text-gray-900">Valor Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {servicoSelecionado.valor.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={confirmarAgendamento}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Confirmando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Confirmar Agendamento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Etapa: Sucesso */}
        {etapaAtual === 'sucesso' && agendamento && servicoSelecionado && dataSelecionada && (
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Agendamento Confirmado! 🎉
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                Seu agendamento foi realizado com sucesso!
              </p>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Detalhes do Agendamento:</h3>
                <div className="space-y-2">
                  <p><strong>Serviço:</strong> {servicoSelecionado.nome}</p>
                  <p><strong>Data:</strong> {BarbershopService.formatarData(dataSelecionada)}</p>
                  <p><strong>Horário:</strong> {horarioSelecionado}</p>
                  <p><strong>Valor:</strong> R$ {agendamento.valor.toFixed(2).replace('.', ',')}</p>
                  <p><strong>Status:</strong> <span className="text-yellow-600 font-semibold">Pendente</span></p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  📱 <strong>Importante:</strong> Seu agendamento está pendente de confirmação. 
                  Você receberá uma confirmação em breve no WhatsApp informado.
                </p>
              </div>
              
              <button
                onClick={novoAgendamento}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Fazer Novo Agendamento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientView;