import { NotificationTemplate } from '../types';

export const notificationTemplates: Record<string, NotificationTemplate> = {
  confirmation: {
    type: 'confirmation',
    template: `✅ *Agendamento Confirmado!*

Olá {clientName}!

Seu agendamento foi confirmado com sucesso:

🗓️ *Serviço:* {serviceName}
📅 *Data:* {date}
⏰ *Horário:* {time}
💰 *Valor:* R$ {price}

📍 *Endereço:* Rua das Flores, 123 - Centro

❗ *Importante:* Chegue com 10 minutos de antecedência.

Para cancelar ou remarcar, responda esta mensagem.

Obrigado pela preferência! 😊`
  },
  reminder_24h: {
    type: 'reminder_24h',
    template: `⏰ *Lembrete - 24h*

Olá {clientName}!

Lembramos que você tem um agendamento amanhã:

🗓️ *Serviço:* {serviceName}
📅 *Data:* {date}
⏰ *Horário:* {time}

📍 *Endereço:* Rua das Flores, 123 - Centro

Para confirmar presença, responda "CONFIRMO".
Para cancelar ou remarcar, responda esta mensagem.

Até amanhã! 😊`
  },
  reminder_1h: {
    type: 'reminder_1h',
    template: `🚨 *Lembrete - 1 hora*

Olá {clientName}!

Seu horário está chegando:

🗓️ *Serviço:* {serviceName}
⏰ *Horário:* {time} (em 1 hora)

📍 *Endereço:* Rua das Flores, 123 - Centro

Já estamos te esperando! 😊`
  },
  cancellation: {
    type: 'cancellation',
    template: `❌ *Agendamento Cancelado*

Olá {clientName}!

Seu agendamento foi cancelado:

🗓️ *Serviço:* {serviceName}
📅 *Data:* {date}
⏰ *Horário:* {time}

Para agendar novamente, acesse nosso site ou responda esta mensagem.

Esperamos vê-lo(a) em breve! 😊`
  }
};

export function formatNotification(template: NotificationTemplate, data: any): string {
  return template.template
    .replace(/{clientName}/g, data.clientName)
    .replace(/{serviceName}/g, data.serviceName)
    .replace(/{date}/g, data.date)
    .replace(/{time}/g, data.time)
    .replace(/{price}/g, data.price);
}