import React from 'react';
import { Calendar, Clock, DollarSign, User } from 'lucide-react';
import { Service } from '../types';
import { formatDate } from '../utils/timeSlots';

interface AppointmentSummaryProps {
  service: Service;
  date: string;
  time: string;
}

export default function AppointmentSummary({ service, date, time }: AppointmentSummaryProps) {
  return (
    <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">Resumo do Agendamento</h3>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-blue-600" />
          <span className="text-gray-900 font-medium">{service.name}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-gray-900">{formatDate(date)}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-gray-900">{time} ({service.duration} minutos)</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <span className="text-gray-900 font-semibold">R$ {service.price}</span>
        </div>
      </div>
    </div>
  );
}