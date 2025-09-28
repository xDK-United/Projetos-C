/*
  # Sistema de Agendamento - Schema Completo

  1. Tabelas
    - `providers` - Prestadores de serviço
    - `services` - Serviços oferecidos
    - `provider_schedules` - Grade de horários dos prestadores
    - `appointments` - Agendamentos
    - `notifications` - Sistema de notificações

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para acesso público aos serviços e agendamentos
    - Políticas específicas para prestadores
*/

-- Tabela de prestadores
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  business_name text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  duration integer NOT NULL DEFAULT 30, -- em minutos
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de grade de horários dos prestadores
CREATE TABLE IF NOT EXISTS provider_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo, 6=sábado
  start_time time NOT NULL,
  end_time time NOT NULL,
  interval_minutes integer NOT NULL DEFAULT 30,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  price decimal(10,2) NOT NULL,
  duration integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('confirmation', 'reminder_24h', 'reminder_1h', 'cancellation')),
  recipient_phone text NOT NULL,
  message text NOT NULL,
  sent_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_schedules_provider ON provider_schedules(provider_id);

-- Habilitar RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para visualização
CREATE POLICY "Serviços são públicos"
  ON services
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Agendamentos podem ser criados por qualquer um"
  ON appointments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Agendamentos podem ser visualizados por todos"
  ON appointments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Horários dos prestadores são públicos"
  ON provider_schedules
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Prestadores são públicos"
  ON providers
  FOR SELECT
  TO public
  USING (true);

-- Políticas para prestadores (quando autenticados)
CREATE POLICY "Prestadores podem atualizar seus agendamentos"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (provider_id = auth.uid()::uuid);

CREATE POLICY "Prestadores podem ver suas notificações"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM appointments a 
    WHERE a.id = appointment_id 
    AND a.provider_id = auth.uid()::uuid
  ));

-- Inserir dados de exemplo
INSERT INTO providers (id, name, email, business_name, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'João Silva', 'joao@exemplo.com', 'Barbearia do João', 'Rua das Flores, 123 - Centro');

INSERT INTO services (id, provider_id, name, description, price, duration, category) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Corte Masculino', 'Corte moderno com acabamento profissional', 35.00, 45, 'Cabelo'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Barba', 'Desenho e aparar barba com navalha', 25.00, 30, 'Barba'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Corte + Barba', 'Pacote completo: corte e barba', 50.00, 75, 'Combo'),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Sobrancelha Masculina', 'Design de sobrancelha masculina', 20.00, 20, 'Estética'),
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Corte Feminino', 'Corte feminino com escova', 60.00, 90, 'Cabelo'),
  ('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Manicure', 'Cuidados completos das unhas', 30.00, 60, 'Estética');

-- Grade de horários (Segunda a Sexta: 8h às 18h, Sábado: 8h às 16h)
INSERT INTO provider_schedules (provider_id, day_of_week, start_time, end_time, interval_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 1, '08:00', '18:00', 30), -- Segunda
  ('550e8400-e29b-41d4-a716-446655440000', 2, '08:00', '18:00', 30), -- Terça
  ('550e8400-e29b-41d4-a716-446655440000', 3, '08:00', '18:00', 30), -- Quarta
  ('550e8400-e29b-41d4-a716-446655440000', 4, '08:00', '18:00', 30), -- Quinta
  ('550e8400-e29b-41d4-a716-446655440000', 5, '08:00', '18:00', 30), -- Sexta
  ('550e8400-e29b-41d4-a716-446655440000', 6, '08:00', '16:00', 30); -- Sábado