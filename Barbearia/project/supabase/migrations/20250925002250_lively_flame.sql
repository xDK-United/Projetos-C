/*
  # Adicionar autenticação por código de acesso para prestadores

  1. Alterações na tabela
    - Adicionar coluna `codigo_acesso` na tabela `prestadores`
    - Definir código inicial para teste

  2. Segurança
    - Habilitar RLS na tabela `prestadores`
    - Criar policy para acesso restrito baseado no código
    - Criar função para validar código de acesso

  3. Função auxiliar
    - Função para definir configuração de sessão
*/

-- Adicionar coluna codigo_acesso se não existir
ALTER TABLE prestadores ADD COLUMN IF NOT EXISTS codigo_acesso text;

-- Definir código inicial para teste
UPDATE prestadores SET codigo_acesso = 'BARBEIRO123' WHERE codigo_acesso IS NULL;

-- Habilitar RLS na tabela prestadores
ALTER TABLE prestadores ENABLE ROW LEVEL SECURITY;

-- Criar policy para acesso restrito
DROP POLICY IF EXISTS "Acesso restrito ao prestador" ON prestadores;
CREATE POLICY "Acesso restrito ao prestador"
ON prestadores
FOR SELECT
USING (
  codigo_acesso = current_setting('app.current_codigo_acesso', true)
  OR current_setting('app.current_codigo_acesso', true) = ''
);

-- Função para definir configuração de sessão
CREATE OR REPLACE FUNCTION set_config(parameter text, value text, is_local boolean DEFAULT true)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config(parameter, value, is_local);
  RETURN value;
END;
$$;

-- Função para validar código de acesso
CREATE OR REPLACE FUNCTION validate_access_code(access_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  provider_exists boolean;
BEGIN
  -- Verificar se existe prestador com esse código
  SELECT EXISTS(
    SELECT 1 FROM prestadores 
    WHERE codigo_acesso = access_code AND ativo = true
  ) INTO provider_exists;
  
  -- Se válido, definir na sessão
  IF provider_exists THEN
    PERFORM set_config('app.current_codigo_acesso', access_code, true);
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;