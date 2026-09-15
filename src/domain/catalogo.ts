export const GENEROS = ['Acción', 'Animación', 'Aventura', 'Ciencia ficción', 'Comedia', 'Documental', 'Drama', 'Fantasía', 'Musical', 'Romance', 'Suspenso', 'Terror'];
// Se conservan los códigos que ya utiliza el catálogo original.
export const CLASIFICACIONES = ['A', 'B', 'C', 'G', 'PG', 'PG-13', 'R', 'NC-17'];
export function sugerirCodigo(codigos: string[]): string {
  const usados = new Set(codigos.map(x => x.trim().toUpperCase()));
  let numero = 1;
  while (usados.has(`COD${String(numero).padStart(3, '0')}`)) numero++;
  return `COD${String(numero).padStart(3, '0')}`;
}
