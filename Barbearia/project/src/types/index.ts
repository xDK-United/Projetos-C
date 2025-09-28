import { Database } from './database';

// Tipos derivados do banco de dados
export type Prestador = Database['public']['Tables']['prestadores']['Row'];
export type Servico = Database['public']['Tables']['servicos']['Row'];
export type Agendamento = Database['public']['Tables']['agendamentos']['Row'];
export type HorarioTrabalho = Database['public']['Tables']['horarios_trabalho']['Row'];

// Tipos para inserção
export type NovoAgendamento = Database['public']['Tables']['agendamentos']['Insert'];

// Tipos customizados para a aplicação
export interface ServicoComDetalhes extends Servico {
  prestador?: Prestador;
}

export interface AgendamentoComDetalhes extends Agendamento {
  servico?: Servico;
  prestador?: Prestador;
}

export interface HorarioDisponivel {
  horario: string;
  disponivel: boolean;
}

export interface EstatisticasDia {
  totalAgendamentos: number;
  confirmados: number;
  pendentes: number;
  cancelados: number;
  receitaDia: number;
}

// Estados da aplicação
export type StatusAgendamento = 'Pendente' | 'Confirmado' | 'Cancelado' | 'Concluido';
export type EtapaAgendamento = 'servicos' | 'datetime' | 'dados' | 'confirmacao' | 'sucesso';

// Tipos para datas bloqueadas
export interface DataBloqueada {
  id: string;
  prestador_id: string;
  data_bloqueada: string;
  motivo?: string;
  created_at: string;
}

export interface NovaDataBloqueada {
  prestador_id: string;
  data_bloqueada: string;
  motivo?: string;
}