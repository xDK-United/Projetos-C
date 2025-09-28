import { Service } from '../types';

export const services: Service[] = [
  {
    id: '1',
    name: 'Corte Masculino',
    description: 'Corte moderno com acabamento profissional',
    price: 35,
    duration: 45,
    category: 'Cabelo'
  },
  {
    id: '2',
    name: 'Barba',
    description: 'Desenho e aparar barba com navalha',
    price: 25,
    duration: 30,
    category: 'Barba'
  },
  {
    id: '3',
    name: 'Corte + Barba',
    description: 'Pacote completo: corte e barba',
    price: 50,
    duration: 75,
    category: 'Combo'
  },
  {
    id: '4',
    name: 'Sobrancelha Masculina',
    description: 'Design de sobrancelha masculina',
    price: 20,
    duration: 20,
    category: 'Estética'
  },
  {
    id: '5',
    name: 'Corte Feminino',
    description: 'Corte feminino com escova',
    price: 60,
    duration: 90,
    category: 'Cabelo'
  },
  {
    id: '6',
    name: 'Manicure',
    description: 'Cuidados completos das unhas',
    price: 30,
    duration: 60,
    category: 'Estética'
  }
];