import { FILAS_CINE, COLUMNAS_CINE } from '../domain/salas';
import { Pelicula } from '../types/pelicula';
import { fechaLocal } from '../domain/cine';
import { Sala } from '../types/sala';

const hoy = new Date();
const manana = new Date();
manana.setDate(hoy.getDate() + 1);

const formatoFecha = fechaLocal;

export const FECHA_HOY = formatoFecha(hoy);
export const FECHA_MANANA = formatoFecha(manana);

export const peliculasIniciales: Pelicula[] = [
  {
    codigo: 'COD001',
    nombre: 'Guardianes de la Galaxia Vol. 4',
    genero: 'Acción',
    duracion: 130,
    clasificacion: 'PG-13',
    salaAsignada: 'S1',
    precio: 4.5,
    estado: 'Disponible',
  },
  {
    codigo: 'COD002',
    nombre: 'Risas en el Parque',
    genero: 'Comedia',
    duracion: 95,
    clasificacion: 'A',
    salaAsignada: 'S2',
    precio: 3.5,
    estado: 'Disponible',
  },
  {
    codigo: 'COD003',
    nombre: 'El Enigma del Silencio',
    genero: 'Suspenso',
    duracion: 110,
    clasificacion: 'B',
    salaAsignada: 'S1',
    precio: 4.0,
    estado: 'Disponible',
  },
  {
    codigo: 'COD004',
    nombre: 'Mundo Fantástico 3D',
    genero: 'Animación',
    duracion: 100,
    clasificacion: 'A',
    salaAsignada: 'S2',
    precio: 4.75,
    estado: 'Disponible',
  },
  {
    codigo: 'COD005',
    nombre: 'Noche de Terror',
    genero: 'Terror',
    duracion: 105,
    clasificacion: 'C',
    salaAsignada: 'S1',
    precio: 4.0,
    estado: 'No disponible',
  },
];

export const salasIniciales: Sala[] = [
  {
    id: 'S1',
    nombre: 'Sala 1',
    filas: [...FILAS_CINE],
    columnas: COLUMNAS_CINE,
    funciones: [
      { id: 'F001', peliculaCodigo: 'COD001', salaId: 'S1', fecha: FECHA_HOY, hora: '15:00' },
      { id: 'F002', peliculaCodigo: 'COD001', salaId: 'S1', fecha: FECHA_HOY, hora: '19:00' },
      { id: 'F004', peliculaCodigo: 'COD003', salaId: 'S1', fecha: FECHA_MANANA, hora: '17:30' },
    ],
  },
  {
    id: 'S2',
    nombre: 'Sala 2',
    filas: [...FILAS_CINE],
    columnas: COLUMNAS_CINE,
    funciones: [
      { id: 'F003', peliculaCodigo: 'COD002', salaId: 'S2', fecha: FECHA_HOY, hora: '16:00' },
      { id: 'F005', peliculaCodigo: 'COD004', salaId: 'S2', fecha: FECHA_MANANA, hora: '18:00' },
    ],
  },
];
