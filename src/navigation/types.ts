export type RootStackParamList = {
  ClienteTabs: undefined;
  Reserva: { peliculaCodigo: string };
  MapaAsientos: { funcionId: string; cantidad: number; peliculaCodigo: string };
  AccesoPersonal: undefined;
  PersonalHome: undefined;
  PersonalPeliculas: undefined;
  FormularioPelicula: { codigo?: string } | undefined;
  Salas: undefined;
  Funciones: undefined;
  Dashboard: undefined;
  Escaner: undefined;
};

export type ClienteTabsParamList = {
  Catalogo: undefined;
  MisBoletos: undefined;
};
