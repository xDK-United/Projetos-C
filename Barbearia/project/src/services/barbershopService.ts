import { supabase } from '../lib/supabase';
import { format, addMinutes, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { 
  Servico, 
  Agendamento, 
  NovoAgendamento, 
  HorarioDisponivel, 
  EstatisticasDia,
  StatusAgendamento,
  Prestador,
  HorarioTrabalho,
  DataBloqueada,
  NovaDataBloqueada
} from '../types';

export class BarbershopService {
  // Buscar todos os serviços ativos
  static async getServicos(): Promise<Servico[]> {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('ativo', true)
      .order('valor', { ascending: true });

    if (error) {
      console.error('Erro ao buscar serviços:', error);
      throw new Error('Erro ao carregar serviços');
    }

    return data || [];
  }

  // Buscar prestador padrão
  static async getPrestadorPadrao(): Promise<Prestador | null> {
    // Configurar sessão se disponível
    const accessCode = sessionStorage.getItem('provider_access_code');
    if (accessCode) {
      await supabase.rpc('set_config', {
        parameter: 'app.current_codigo_acesso',
        value: accessCode,
        is_local: true
      }).catch(console.error);
    }
    
    const { data, error } = await supabase
      .from('prestadores')
      .select('*')
      .eq('ativo', true)
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar prestador:', error);
      return null;
    }

    return data;
  }

  // Buscar horários de trabalho do prestador
  static async getHorariosTrabalho(prestadorId: string): Promise<HorarioTrabalho[]> {
    const { data, error } = await supabase
      .from('horarios_trabalho')
      .select('*')
      .eq('prestador_id', prestadorId)
      .eq('ativo', true);

    if (error) {
      console.error('Erro ao buscar horários de trabalho:', error);
      return [];
    }

    return data || [];
  }

  // Gerar horários disponíveis para uma data específica
  static async getHorariosDisponiveis(data: Date, servicoId: string): Promise<HorarioDisponivel[]> {
    try {
      // Buscar o serviço para obter duração e prestador
      const { data: servico, error: servicoError } = await supabase
        .from('servicos')
        .select('*, prestadores(*)')
        .eq('id', servicoId)
        .single();

      if (servicoError || !servico) {
        throw new Error('Serviço não encontrado');
      }

      const prestador = servico.prestadores;
      if (!prestador) {
        throw new Error('Prestador não encontrado');
      }

      // Buscar horários de trabalho para o dia da semana
      const diaSemana = data.getDay();
      const { data: horarioTrabalho, error: horarioError } = await supabase
        .from('horarios_trabalho')
        .select('*')
        .eq('prestador_id', prestador.id)
        .eq('dia_semana', diaSemana)
        .eq('ativo', true)
        .single();

      if (horarioError || !horarioTrabalho) {
        return []; // Não trabalha neste dia
      }

      // Buscar agendamentos existentes para esta data
      const dataString = format(data, 'yyyy-MM-dd');
      const { data: agendamentosExistentes, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select('horario, duracao:servicos(duracao)')
        .eq('prestador_id', prestador.id)
        .eq('data', dataString)
        .in('status', ['Pendente', 'Confirmado']);

      if (agendamentosError) {
        console.error('Erro ao buscar agendamentos:', agendamentosError);
        throw agendamentosError;
      }

      // Gerar todos os horários possíveis
      const horarios: HorarioDisponivel[] = [];
      const inicioMinutos = this.timeToMinutes(horarioTrabalho.horario_inicio);
      const fimMinutos = this.timeToMinutes(horarioTrabalho.horario_fim);
      const intervalo = prestador.intervalo_minutos;
      const duracaoServico = servico.duracao;

      for (let minutos = inicioMinutos; minutos < fimMinutos; minutos += intervalo) {
        // Verificar se há tempo suficiente para o serviço
        if (minutos + duracaoServico > fimMinutos) {
          break;
        }

        const horarioString = this.minutesToTime(minutos);
        
        // Verificar se o horário está ocupado
        const ocupado = agendamentosExistentes?.some(agendamento => {
          const agendamentoInicio = this.timeToMinutes(agendamento.horario);
          const agendamentoFim = agendamentoInicio + (agendamento.duracao?.duracao || 30);
          const servicoFim = minutos + duracaoServico;
          
          // Verificar sobreposição
          return (minutos < agendamentoFim && servicoFim > agendamentoInicio);
        }) || false;

        // Verificar se não é um horário passado (para hoje)
        const agora = new Date();
        const dataHorario = new Date(data);
        dataHorario.setHours(Math.floor(minutos / 60), minutos % 60, 0, 0);
        
        const disponivel = !ocupado && (format(data, 'yyyy-MM-dd') !== format(agora, 'yyyy-MM-dd') || isAfter(dataHorario, agora));

        horarios.push({
          horario: horarioString,
          disponivel
        });
      }

      return horarios;
    } catch (error) {
      console.error('Erro ao gerar horários disponíveis:', error);
      return [];
    }
  }

  // Criar um novo agendamento
  static async criarAgendamento(dadosAgendamento: {
    servicoId: string;
    clienteNome: string;
    clienteTelefone: string;
    data: Date;
    horario: string;
  }): Promise<Agendamento> {
    try {
      // Buscar dados do serviço
      const { data: servico, error: servicoError } = await supabase
        .from('servicos')
        .select('*, prestadores(*)')
        .eq('id', dadosAgendamento.servicoId)
        .single();

      if (servicoError || !servico) {
        throw new Error('Serviço não encontrado');
      }

      const prestador = servico.prestadores;
      if (!prestador) {
        throw new Error('Prestador não encontrado');
      }

      // Verificar se o horário ainda está disponível
      const horariosDisponiveis = await this.getHorariosDisponiveis(dadosAgendamento.data, dadosAgendamento.servicoId);
      const horarioEscolhido = horariosDisponiveis.find(h => h.horario === dadosAgendamento.horario);
      
      if (!horarioEscolhido || !horarioEscolhido.disponivel) {
        throw new Error('Horário não está mais disponível');
      }

      // Criar o agendamento
      const novoAgendamento: NovoAgendamento = {
        prestador_id: prestador.id,
        servico_id: dadosAgendamento.servicoId,
        cliente_nome: dadosAgendamento.clienteNome,
        cliente_telefone: dadosAgendamento.clienteTelefone,
        data: format(dadosAgendamento.data, 'yyyy-MM-dd'),
        horario: dadosAgendamento.horario,
        valor: servico.valor,
        status: 'Pendente'
      };

      const { data, error } = await supabase
        .from('agendamentos')
        .insert(novoAgendamento)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar agendamento:', error);
        throw new Error('Erro ao criar agendamento');
      }

      return data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }

  // Buscar agendamentos por data
  static async getAgendamentosPorData(data: Date): Promise<Agendamento[]> {
    // Configurar sessão se disponível
    const accessCode = sessionStorage.getItem('provider_access_code');
    if (accessCode) {
      await supabase.rpc('set_config', {
        parameter: 'app.current_codigo_acesso',
        value: accessCode,
        is_local: true
      }).catch(console.error);
    }
    
    const dataString = format(data, 'yyyy-MM-dd');
    
    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        servicos(nome, duracao),
        prestadores(nome)
      `)
      .eq('data', dataString)
      .order('horario', { ascending: true });

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw new Error('Erro ao carregar agendamentos');
    }

    return agendamentos || [];
  }

  // Atualizar status do agendamento
  static async atualizarStatusAgendamento(agendamentoId: string, novoStatus: StatusAgendamento): Promise<void> {
    const { error } = await supabase
      .from('agendamentos')
      .update({ 
        status: novoStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', agendamentoId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      throw new Error('Erro ao atualizar status do agendamento');
    }
  }

  // Calcular estatísticas do dia
  static async getEstatisticasDia(data: Date): Promise<EstatisticasDia> {
    const dataString = format(data, 'yyyy-MM-dd');
    
    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select('status, valor')
      .eq('data', dataString);

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalAgendamentos: 0,
        confirmados: 0,
        pendentes: 0,
        cancelados: 0,
        receitaDia: 0
      };
    }

    const stats = agendamentos?.reduce((acc, agendamento) => {
      acc.totalAgendamentos++;
      
      switch (agendamento.status) {
        case 'Confirmado':
          acc.confirmados++;
          acc.receitaDia += agendamento.valor;
          break;
        case 'Pendente':
          acc.pendentes++;
          break;
        case 'Cancelado':
          acc.cancelados++;
          break;
        case 'Concluido':
          acc.confirmados++;
          acc.receitaDia += agendamento.valor;
          break;
      }
      
      return acc;
    }, {
      totalAgendamentos: 0,
      confirmados: 0,
      pendentes: 0,
      cancelados: 0,
      receitaDia: 0
    }) || {
      totalAgendamentos: 0,
      confirmados: 0,
      pendentes: 0,
      cancelados: 0,
      receitaDia: 0
    };

    return stats;
  }

  // Utilitários para conversão de tempo
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Formatar data para exibição
  static formatarData(data: Date): string {
    return format(data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }

  // Verificar se uma data é válida para agendamento
  static isDataValida(data: Date): boolean {
    const hoje = startOfDay(new Date());
    const dataEscolhida = startOfDay(data);
    return !isBefore(dataEscolhida, hoje);
  }

  // Buscar datas bloqueadas
  static async getDatasBloquedas(): Promise<DataBloqueada[]> {
    const { data, error } = await supabase
      .from('datas_bloqueadas')
      .select('*')
      .order('data_bloqueada', { ascending: true });

    if (error) {
      console.error('Erro ao buscar datas bloqueadas:', error);
      return [];
    }

    return data || [];
  }

  // Verificar se uma data está bloqueada
  static async isDataBloqueada(data: Date): Promise<boolean> {
    const dataString = format(data, 'yyyy-MM-dd');
    
    const { data: datasBloquedas, error } = await supabase
      .from('datas_bloqueadas')
      .select('id')
      .eq('data_bloqueada', dataString)
      .limit(1);

    if (error) {
      console.error('Erro ao verificar data bloqueada:', error);
      return false;
    }

    return (datasBloquedas?.length || 0) > 0;
  }

  // Bloquear uma data
  static async bloquearData(data: Date, motivo?: string): Promise<DataBloqueada> {
    // Configurar sessão se disponível
    const accessCode = sessionStorage.getItem('provider_access_code');
    if (accessCode) {
      await supabase.rpc('set_config', {
        parameter: 'app.current_codigo_acesso',
        value: accessCode,
        is_local: true
      }).catch(console.error);
    }

    // Buscar prestador
    const prestador = await this.getPrestadorPadrao();
    if (!prestador) {
      throw new Error('Prestador não encontrado');
    }

    const novaDataBloqueada: NovaDataBloqueada = {
      prestador_id: prestador.id,
      data_bloqueada: format(data, 'yyyy-MM-dd'),
      motivo
    };

    const { data: dataBloqueada, error } = await supabase
      .from('datas_bloqueadas')
      .insert(novaDataBloqueada)
      .select()
      .single();

    if (error) {
      console.error('Erro ao bloquear data:', error);
      throw new Error('Erro ao bloquear data');
    }

    return dataBloqueada;
  }

  // Desbloquear uma data
  static async desbloquearData(dataId: string): Promise<void> {
    const { error } = await supabase
      .from('datas_bloqueadas')
      .delete()
      .eq('id', dataId);

    if (error) {
      console.error('Erro ao desbloquear data:', error);
      throw new Error('Erro ao desbloquear data');
    }
  }

  // Buscar datas bloqueadas do prestador autenticado
  static async getDatasBloquedasPrestador(): Promise<DataBloqueada[]> {
    // Configurar sessão se disponível
    const accessCode = sessionStorage.getItem('provider_access_code');
    if (accessCode) {
      await supabase.rpc('set_config', {
        parameter: 'app.current_codigo_acesso',
        value: accessCode,
        is_local: true
      }).catch(console.error);
    }

    const { data, error } = await supabase
      .from('datas_bloqueadas')
      .select('*')
      .order('data_bloqueada', { ascending: true });

    if (error) {
      console.error('Erro ao buscar datas bloqueadas do prestador:', error);
      return [];
    }

    return data || [];
  }
}