import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Service = Database['public']['Tables']['services']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type ProviderSchedule = Database['public']['Tables']['provider_schedules']['Row'];

export interface TimeSlot {
  time: string;
  available: boolean;
}

export class AppointmentService {
  // Buscar todos os serviços ativos
  static async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) {
      console.error('Erro ao buscar serviços:', error);
      throw error;
    }

    return data || [];
  }

  // Gerar horários disponíveis para uma data específica
  static async getAvailableTimeSlots(date: Date, serviceId: string): Promise<TimeSlot[]> {
    try {
      // Buscar o serviço para obter o provider_id
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('provider_id, duration')
        .eq('id', serviceId)
        .single();

      if (serviceError || !service) {
        throw new Error('Serviço não encontrado');
      }

      // Buscar a grade de horários do prestador para o dia da semana
      const dayOfWeek = date.getDay();
      const { data: schedule, error: scheduleError } = await supabase
        .from('provider_schedules')
        .select('*')
        .eq('provider_id', service.provider_id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .single();

      if (scheduleError || !schedule) {
        return []; // Sem horários disponíveis para este dia
      }

      // Buscar agendamentos existentes para esta data
      const dateString = date.toISOString().split('T')[0];
      const { data: existingAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time, duration')
        .eq('provider_id', service.provider_id)
        .eq('appointment_date', dateString)
        .in('status', ['pending', 'confirmed']);

      if (appointmentsError) {
        console.error('Erro ao buscar agendamentos:', appointmentsError);
        throw appointmentsError;
      }

      // Gerar todos os horários possíveis
      const slots: TimeSlot[] = [];
      const startTime = this.timeStringToMinutes(schedule.start_time);
      const endTime = this.timeStringToMinutes(schedule.end_time);
      const interval = schedule.interval_minutes;

      for (let time = startTime; time < endTime; time += interval) {
        const timeString = this.minutesToTimeString(time);
        
        // Verificar se o horário está ocupado
        const isOccupied = existingAppointments?.some(appointment => {
          const appointmentStart = this.timeStringToMinutes(appointment.appointment_time);
          const appointmentEnd = appointmentStart + appointment.duration;
          const slotEnd = time + service.duration;
          
          // Verificar sobreposição
          return (time < appointmentEnd && slotEnd > appointmentStart);
        }) || false;

        slots.push({
          time: timeString,
          available: !isOccupied
        });
      }

      return slots;
    } catch (error) {
      console.error('Erro ao gerar horários:', error);
      return [];
    }
  }

  // Criar um novo agendamento
  static async createAppointment(appointmentData: {
    serviceId: string;
    clientName: string;
    clientPhone: string;
    date: Date;
    time: string;
  }): Promise<Appointment> {
    try {
      // Buscar dados do serviço
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('provider_id, price, duration, name')
        .eq('id', appointmentData.serviceId)
        .single();

      if (serviceError || !service) {
        throw new Error('Serviço não encontrado');
      }

      // Criar o agendamento
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          service_id: appointmentData.serviceId,
          provider_id: service.provider_id,
          client_name: appointmentData.clientName,
          client_phone: appointmentData.clientPhone,
          appointment_date: appointmentData.date.toISOString().split('T')[0],
          appointment_time: appointmentData.time,
          price: service.price,
          duration: service.duration,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar agendamento:', error);
        throw error;
      }

      // Criar notificação de confirmação
      await this.createNotification(data.id, 'confirmation', appointmentData.clientPhone, {
        clientName: appointmentData.clientName,
        serviceName: service.name,
        date: appointmentData.date.toLocaleDateString('pt-BR'),
        time: appointmentData.time,
        price: service.price
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }

  // Buscar agendamentos por data
  static async getAppointmentsByDate(date: Date): Promise<(Appointment & { service_name: string })[]> {
    const dateString = date.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services!inner(name)
      `)
      .eq('appointment_date', dateString)
      .order('appointment_time', { ascending: true });

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      throw error;
    }

    return data?.map(appointment => ({
      ...appointment,
      service_name: appointment.services.name
    })) || [];
  }

  // Atualizar status do agendamento
  static async updateAppointmentStatus(appointmentId: string, status: Appointment['status']): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', appointmentId);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  // Criar notificação
  private static async createNotification(
    appointmentId: string,
    type: 'confirmation' | 'reminder_24h' | 'reminder_1h' | 'cancellation',
    phone: string,
    data: any
  ): Promise<void> {
    const templates = {
      confirmation: `✅ *Agendamento Confirmado!*

Olá ${data.clientName}!

Seu agendamento foi confirmado:
🗓️ *Serviço:* ${data.serviceName}
📅 *Data:* ${data.date}
⏰ *Horário:* ${data.time}
💰 *Valor:* R$ ${data.price}

📍 *Endereço:* Rua das Flores, 123 - Centro

Obrigado pela preferência! 😊`,
      reminder_24h: `⏰ *Lembrete - 24h*

Olá ${data.clientName}!
Você tem um agendamento amanhã às ${data.time}.
Confirme sua presença respondendo "CONFIRMO".`,
      reminder_1h: `🚨 *Lembrete - 1 hora*

Olá ${data.clientName}!
Seu horário é às ${data.time} (em 1 hora).
Já estamos te esperando! 😊`,
      cancellation: `❌ *Agendamento Cancelado*

Olá ${data.clientName}!
Seu agendamento foi cancelado.
Para reagendar, entre em contato conosco.`
    };

    const { error } = await supabase
      .from('notifications')
      .insert({
        appointment_id: appointmentId,
        type,
        recipient_phone: phone,
        message: templates[type],
        status: 'pending'
      });

    if (error) {
      console.error('Erro ao criar notificação:', error);
    }
  }

  // Utilitários para conversão de tempo
  private static timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}