export interface ClienteInfo {
  nombre: string;
  email?: string;
  telefono?: string;
}

export interface Reserva {
  id: string; // código de la reserva/boleto
  funcionId: string;
  peliculaCodigo: string;
  peliculaNombre: string;
  salaId: string;
  salaNombre: string;
  fecha: string;
  hora: string;
  asientos: string[];
  cantidadBoletos: number;
  total: number;
  cliente: ClienteInfo;
  fechaCompra: string; // ISO string
  fechaUso?: string;
  usado: boolean; // para validación de boleto (Módulo 7)
}
