export interface Database {
  public: {
    Tables: {
      prestadores: {
        Row: {
          id: string;
          nome: string;
          email: string | null;
          telefone: string | null;
          horario_inicio: string;
          horario_fim: string;
          intervalo_minutos: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email?: string | null;
          telefone?: string | null;
          horario_inicio?: string;
          horario_fim?: string;
          intervalo_minutos?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string | null;
          telefone?: string | null;
          horario_inicio?: string;
          horario_fim?: string;
          intervalo_minutos?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      servicos: {
        Row: {
          id: string;
          prestador_id: string | null;
          nome: string;
          descricao: string | null;
          duracao: number;
          valor: number;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prestador_id?: string | null;
          nome: string;
          descricao?: string | null;
          duracao?: number;
          valor?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prestador_id?: string | null;
          nome?: string;
          descricao?: string | null;
          duracao?: number;
          valor?: number;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      agendamentos: {
        Row: {
          id: string;
          prestador_id: string | null;
          servico_id: string | null;
          cliente_nome: string;
          cliente_telefone: string;
          data: string;
          horario: string;
          status: 'Pendente' | 'Confirmado' | 'Cancelado' | 'Concluido';
          valor: number;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prestador_id?: string | null;
          servico_id?: string | null;
          cliente_nome: string;
          cliente_telefone: string;
          data: string;
          horario: string;
          status?: 'Pendente' | 'Confirmado' | 'Cancelado' | 'Concluido';
          valor: number;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prestador_id?: string | null;
          servico_id?: string | null;
          cliente_nome?: string;
          cliente_telefone?: string;
          data?: string;
          horario?: string;
          status?: 'Pendente' | 'Confirmado' | 'Cancelado' | 'Concluido';
          valor?: number;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      horarios_trabalho: {
        Row: {
          id: string;
          prestador_id: string | null;
          dia_semana: number;
          horario_inicio: string;
          horario_fim: string;
          ativo: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          prestador_id?: string | null;
          dia_semana: number;
          horario_inicio: string;
          horario_fim: string;
          ativo?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          prestador_id?: string | null;
          dia_semana?: number;
          horario_inicio?: string;
          horario_fim?: string;
          ativo?: boolean;
          created_at?: string;
        };
      };
      datas_bloqueadas: {
        Row: {
          id: string;
          prestador_id: string | null;
          data_bloqueada: string;
          motivo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prestador_id?: string | null;
          data_bloqueada: string;
          motivo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          prestador_id?: string | null;
          data_bloqueada?: string;
          motivo?: string | null;
          created_at?: string;
        };
      };
    };
  };
}