export type EstadoAsiento = 'Disponible' | 'Seleccionado' | 'Ocupado';

export interface Asiento {
  id: string; // ej. "A1"
  fila: string;
  numero: number;
  estado: EstadoAsiento;
}
