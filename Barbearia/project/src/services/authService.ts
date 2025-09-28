import { supabase } from '../lib/supabase';

export class AuthService {
  // Verificar se o usuário está autenticado
  static isAuthenticated(): boolean {
    const code = sessionStorage.getItem('provider_access_code');
    return !!code;
  }

  // Obter código de acesso da sessão
  static getAccessCode(): string | null {
    return sessionStorage.getItem('provider_access_code');
  }

  // Validar código de acesso
  static async validateAccessCode(code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('validate_access_code', {
        access_code: code
      });

      if (error) {
        console.error('Erro na validação:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao validar código:', error);
      return false;
    }
  }

  // Fazer logout
  static logout(): void {
    sessionStorage.removeItem('provider_access_code');
    
    // Limpar configuração do Supabase
    supabase.rpc('set_config', {
      parameter: 'app.current_codigo_acesso',
      value: '',
      is_local: true
    }).catch(console.error);
  }

  // Configurar sessão no Supabase
  static async setupSession(code: string): Promise<void> {
    try {
      await supabase.rpc('set_config', {
        parameter: 'app.current_codigo_acesso',
        value: code,
        is_local: true
      });
    } catch (error) {
      console.error('Erro ao configurar sessão:', error);
    }
  }
}