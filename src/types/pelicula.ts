export type EstadoPelicula = 'Disponible' | 'No disponible';

export interface Pelicula {
  imagen?: string; // Nombre relativo del póster en almacenamiento privado.
  codigo: string;
  nombre: string;
  genero: string;
  duracion: number; // minutos
  clasificacion: string;
  salaAsignada: string; // id de Sala
  precio: number;
  estado: EstadoPelicula;
}
