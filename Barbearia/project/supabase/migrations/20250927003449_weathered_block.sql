/*
  # Sistema de Datas Bloqueadas

  1. Nova Tabela
    - `datas_bloqueadas`
      - `id` (uuid, primary key)
      - `prestador_id` (uuid, foreign key)
      - `data_bloqueada` (date)
      - `motivo` (text, opcional)
      - `created_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela `datas_bloqueadas`
    - Add policy para prestadores gerenciarem suas próprias datas bloqueadas
    - Add policy para visualização pública das datas bloqueadas
*/

-- Criar tabela de datas bloqueadas
CREATE TABLE IF NOT EXISTS datas_bloqueadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id uuid REFERENCES prestadores(id) ON DELETE CASCADE,
  data_bloqueada date NOT NULL,
  motivo text,
  created_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_datas_bloqueadas_prestador ON datas_bloqueadas(prestador_id);
CREATE INDEX IF NOT EXISTS idx_datas_bloqueadas_data ON datas_bloqueadas(data_bloqueada);

-- Habilitar RLS
ALTER TABLE datas_bloqueadas ENABLE ROW LEVEL SECURITY;

-- Policy para prestadores gerenciarem suas próprias datas
CREATE POLICY "Prestadores podem gerenciar suas datas bloqueadas"
  ON datas_bloqueadas
  FOR ALL
  TO authenticated
  USING (prestador_id = (
    SELECT id FROM prestadores 
    WHERE codigo_acesso = current_setting('app.current_codigo_acesso', true)
  ))
  WITH CHECK (prestador_id = (
    SELECT id FROM prestadores 
    WHERE codigo_acesso = current_setting('app.current_codigo_acesso', true)
  ));

-- Policy para visualização pública das datas bloqueadas (para o calendário do cliente)
CREATE POLICY "Datas bloqueadas são públicas para visualização"
  ON datas_bloqueadas
  FOR SELECT
  TO public
  USING (true);

-- Constraint para evitar duplicatas
ALTER TABLE datas_bloqueadas 
ADD CONSTRAINT unique_prestador_data 
UNIQUE (prestador_id, data_bloqueada);