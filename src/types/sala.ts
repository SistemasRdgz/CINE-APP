export interface Funcion {
  id: string;
  peliculaCodigo: string;
  salaId: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
}

export interface Sala {
  id: string;
  nombre: string;
  filas: string[]; // ej. ['A','B','C','D']
  columnas: number; // asientos por fila
  funciones: Funcion[];
}
