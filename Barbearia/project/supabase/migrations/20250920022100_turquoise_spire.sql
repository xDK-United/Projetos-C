/*
  # Sistema de Agendamento para Barbearia

  1. Tabelas Principais
    - `prestadores` - Dados dos profissionais
    - `servicos` - Serviços oferecidos
    - `agendamentos` - Agendamentos dos clientes
    - `horarios_trabalho` - Grade de horários dos prestadores

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para leitura pública dos serviços
    - Políticas para criação de agendamentos
    - Políticas para prestadores gerenciarem seus agendamentos

  3. Dados de Exemplo
    - Prestador padrão configurado
    - Serviços básicos de barbearia
    - Grade de horários de trabalho
*/

-- Tabela de prestadores
CREATE TABLE IF NOT EXISTS prestadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE,
  telefone text,
  horario_inicio time DEFAULT '08:00',
  horario_fim time DEFAULT '18:00',
  intervalo_minutos integer DEFAULT 30,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id uuid REFERENCES prestadores(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  duracao integer NOT NULL DEFAULT 30, -- em minutos
  valor decimal(10,2) NOT NULL DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id uuid REFERENCES prestadores(id) ON DELETE CASCADE,
  servico_id uuid REFERENCES servicos(id) ON DELETE CASCADE,
  cliente_nome text NOT NULL,
  cliente_telefone text NOT NULL,
  data date NOT NULL,
  horario time NOT NULL,
  status text DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Confirmado', 'Cancelado', 'Concluido')),
  valor decimal(10,2) NOT NULL,
  observacoes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de horários de trabalho (para configurar dias específicos)
CREATE TABLE IF NOT EXISTS horarios_trabalho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id uuid REFERENCES prestadores(id) ON DELETE CASCADE,
  dia_semana integer NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 6=sábado
  horario_inicio time NOT NULL,
  horario_fim time NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_prestador ON agendamentos(prestador_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_servicos_prestador ON servicos(prestador_id);
CREATE INDEX IF NOT EXISTS idx_horarios_prestador ON horarios_trabalho(prestador_id);

-- Habilitar RLS
ALTER TABLE prestadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_trabalho ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança

-- Prestadores são públicos para visualização
CREATE POLICY "Prestadores são públicos"
  ON prestadores
  FOR SELECT
  TO public
  USING (ativo = true);

-- Serviços são públicos para visualização
CREATE POLICY "Serviços são públicos"
  ON servicos
  FOR SELECT
  TO public
  USING (ativo = true);

-- Horários de trabalho são públicos
CREATE POLICY "Horários são públicos"
  ON horarios_trabalho
  FOR SELECT
  TO public
  USING (ativo = true);

-- Agendamentos podem ser criados por qualquer um
CREATE POLICY "Criar agendamentos"
  ON agendamentos
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Agendamentos podem ser visualizados por todos
CREATE POLICY "Visualizar agendamentos"
  ON agendamentos
  FOR SELECT
  TO public
  USING (true);

-- Agendamentos podem ser atualizados (para mudança de status)
CREATE POLICY "Atualizar agendamentos"
  ON agendamentos
  FOR UPDATE
  TO public
  USING (true);

-- Inserir dados de exemplo

-- Prestador padrão
INSERT INTO prestadores (nome, email, telefone, horario_inicio, horario_fim, intervalo_minutos)
VALUES ('Barbearia do João', 'contato@barbearia.com', '(11) 99999-9999', '08:00', '18:00', 30)
ON CONFLICT (email) DO NOTHING;

-- Buscar o ID do prestador para usar nas próximas inserções
DO $$
DECLARE
  prestador_uuid uuid;
BEGIN
  SELECT id INTO prestador_uuid FROM prestadores WHERE email = 'contato@barbearia.com' LIMIT 1;
  
  -- Serviços da barbearia
  INSERT INTO servicos (prestador_id, nome, descricao, duracao, valor) VALUES
    (prestador_uuid, 'Corte Masculino', 'Corte moderno com acabamento profissional', 45, 35.00),
    (prestador_uuid, 'Barba', 'Desenho e aparar barba com navalha', 30, 25.00),
    (prestador_uuid, 'Corte + Barba', 'Pacote completo: corte e barba', 75, 50.00),
    (prestador_uuid, 'Sobrancelha Masculina', 'Design de sobrancelha masculina', 20, 20.00),
    (prestador_uuid, 'Bigode', 'Aparar e modelar bigode', 15, 15.00),
    (prestador_uuid, 'Lavagem + Hidratação', 'Lavagem e tratamento capilar', 30, 25.00)
  ON CONFLICT DO NOTHING;
  
  -- Horários de trabalho (Segunda a Sábado)
  INSERT INTO horarios_trabalho (prestador_id, dia_semana, horario_inicio, horario_fim) VALUES
    (prestador_uuid, 1, '08:00', '18:00'), -- Segunda
    (prestador_uuid, 2, '08:00', '18:00'), -- Terça
    (prestador_uuid, 3, '08:00', '18:00'), -- Quarta
    (prestador_uuid, 4, '08:00', '18:00'), -- Quinta
    (prestador_uuid, 5, '08:00', '18:00'), -- Sexta
    (prestador_uuid, 6, '08:00', '16:00')  -- Sábado
  ON CONFLICT DO NOTHING;
END $$;