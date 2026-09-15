import { guardarSala, borrarSala } from '../src/redux/operaciones';
import { editarSala, eliminarSala } from '../src/redux/slices/salasSlice';
import { cambiarTema } from '../src/redux/slices/preferenciasSlice';
import { migraciones } from '../src/redux/migraciones';
import { ampliarSala } from '../src/domain/salas';
import { sugerirCodigo } from '../src/domain/catalogo';
import test from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/rootReducer';
import { comprar, programarFuncion, validarQR } from '../src/redux/operaciones';
import { agregarReserva } from '../src/redux/slices/reservasSlice';
import { agregarPelicula, eliminarPelicula, toggleEstadoPelicula } from '../src/redux/slices/peliculasSlice';
import { agregarFuncion } from '../src/redux/slices/salasSlice';
import { contenidoQR, leerQR, estadisticas, errorPelicula, fechaValida } from '../src/domain/cine';
import { almacenamientoRecuperable } from '../src/redux/almacenamiento';
import { createMigrate, persistReducer, persistStore } from 'redux-persist';
import type { Reserva } from '../src/types/reserva';

const pelicula = { codigo: 'P1', nombre: 'Prueba', genero: 'Drama', duracion: 90, clasificacion: 'A', salaAsignada: 'S1', precio: 4.5, estado: 'Disponible' as const };
const funcion = { id: 'F1', peliculaCodigo: 'P1', salaId: 'S1', fecha: '2099-12-15', hora: '19:00' };
const base = () => ({ preferencias: { tema: 'oscuro' as const }, peliculas: { lista: [pelicula] }, salas: { lista: [{ id: 'S1', nombre: 'Sala 1', filas: ['A','B'], columnas: 3, funciones: [funcion] }] }, reservas: { lista: [] as Reserva[] } });
const crearStore = () => configureStore({ reducer: rootReducer, preloadedState: base() });
const reserva = (cambios: Partial<Reserva> = {}): Reserva => ({ id: 'BOL-ABC123', peliculaCodigo: 'P1', peliculaNombre: 'Prueba', salaId: 'S1', salaNombre: 'Sala 1', funcionId: 'F1', fecha: funcion.fecha, hora: funcion.hora, cantidadBoletos: 2, asientos: ['A1','A2'], total: 9, cliente: { nombre: 'Daniel' }, fechaCompra: new Date().toISOString(), usado: false, ...cambios });

test('compra calcula ocupación y rechaza doble clic, asiento ocupado y payload directo inválido', () => {
  const s = crearStore();
  assert.equal(s.dispatch(comprar(reserva())).ok, true);
  assert.equal(s.dispatch(comprar(reserva())).ok, false);
  assert.equal(s.dispatch(comprar(reserva({ id: 'BOL-OTRO12' }))).ok, false);
  s.dispatch(agregarReserva(reserva({ id: 'BOL-DIRECT', total: -1 })));
  assert.equal(s.getState().reservas.lista.length, 1);
  const stats = estadisticas(s.getState());
  assert.equal(stats.ocupados, 2); assert.equal(stats.disponibles, 4); assert.equal(stats.ingresos, 9);
});
test('valida cantidad, asiento inexistente, repetido, precio, cliente y disponibilidad', () => {
  for (const changes of [{ cantidadBoletos: 3 }, { asientos: ['Z1','Z2'] }, { asientos: ['A1','A1'] }, { total: 8 }, { cliente: { nombre: '' } }, { cliente: { nombre: 'D', email: 'mal' } }]) {
    assert.equal(crearStore().dispatch(comprar(reserva(changes))).ok, false);
  }
  const s = crearStore(); s.dispatch(toggleEstadoPelicula('P1'));
  assert.equal(s.dispatch(comprar(reserva())).ok, false);
});
test('el mismo asiento se vende en otra función, pero no en la misma', () => {
  const s = crearStore();
  s.dispatch(programarFuncion({ ...funcion, id: 'F2', hora: '22:00' }));
  assert.equal(s.dispatch(comprar(reserva())).ok, true);
  assert.equal(s.dispatch(comprar(reserva({ id: 'BOL-SEGUND', funcionId: 'F2', hora: '22:00' }))).ok, true);
  const x = estadisticas(s.getState());
  assert.equal(x.funciones, 2); assert.equal(x.boletos, 4); assert.equal(x.disponibles, 8);
});
test('horario repetido y fechas imposibles se rechazan también desde el reducer', () => {
  const s = crearStore();
  assert.equal(s.dispatch(programarFuncion({ ...funcion, id: 'F2' })).ok, false);
  s.dispatch(agregarFuncion({ ...funcion, id: 'F3' }));
  assert.equal(s.getState().salas.lista[0].funciones.length, 1);
  assert.equal(s.dispatch(programarFuncion({ ...funcion, id: 'F4', fecha: '2099-02-30' })).ok, false);
  assert.equal(s.dispatch(programarFuncion({ ...funcion, id: 'F4', hora: '24:99' })).ok, false);
  assert.equal(s.dispatch(programarFuncion({ ...funcion, id: 'F4', fecha: '2000-01-01' })).ok, false);
  assert.equal(fechaValida('2028-02-29'), true);
});
test('QR inválido, desconocido y reutilizado; el ingreso no libera asientos ni resta ingresos', () => {
  const s = crearStore(); s.dispatch(comprar(reserva()));
  assert.equal(leerQR(contenidoQR('BOL-ABC123')), 'BOL-ABC123');
  assert.equal(s.dispatch(validarQR('https://example.com')).ok, false);
  assert.equal(s.dispatch(validarQR(contenidoQR('BOL-NOEXIS'))).ok, false);
  assert.equal(s.dispatch(validarQR(contenidoQR('BOL-ABC123'))).ok, true);
  assert.equal(s.dispatch(validarQR(contenidoQR('BOL-ABC123'))).ok, false);
  assert.ok(s.getState().reservas.lista[0].fechaUso);
  assert.equal(estadisticas(s.getState()).ocupados, 2);
  assert.equal(estadisticas(s.getState()).ingresos, 9);
});
test('CRUD evita códigos duplicados, precios no finitos y nombres vacíos', () => {
  const s = crearStore();
  s.dispatch(agregarPelicula({ ...pelicula, codigo: ' p1 ' }));
  assert.equal(s.getState().peliculas.lista.length, 1);
  for (const changes of [{ precio: -1 }, { precio: Infinity }, { nombre: ' ' }, { duracion: 0 }]) {
    assert.ok(errorPelicula({ ...pelicula, ...changes }, [], false));
  }
});
test('estadísticas vacías y conservación del historial al eliminar una película', () => {
  const s = crearStore();
  assert.deepEqual(estadisticas(s.getState()).masReservadas, []);
  s.dispatch(comprar(reserva())); s.dispatch(eliminarPelicula('P1'));
  assert.equal(estadisticas(s.getState()).peliculas, 0);
  assert.deepEqual(estadisticas(s.getState()).masReservadas, [{ nombre: 'Prueba', boletos: 2 }]);
});
test('persistencia: nueva instancia recupera catálogo, funciones y boleto usado', async () => {
  const data = new Map<string,string>();
  const storage = { getItem: async (k: string) => data.get(k) ?? null, setItem: async (k: string,v: string) => { data.set(k,v); }, removeItem: async (k: string) => { data.delete(k); } };
  async function iniciar() {
    const reducer = persistReducer({ key: 'test', storage }, rootReducer);
    const store = configureStore({ reducer, middleware: g => g({ serializableCheck: false }) });
    let persist: ReturnType<typeof persistStore>;
    await new Promise<void>(resolve => { persist = persistStore(store, undefined, resolve); });
    return { store, persist: persist! };
  }
  const a = await iniciar();
  a.store.dispatch(cambiarTema('claro'));
  a.store.dispatch(agregarPelicula(pelicula));
  a.store.dispatch(programarFuncion(funcion));
  assert.equal(a.store.dispatch(comprar(reserva())).ok, true);
  a.store.dispatch(validarQR(contenidoQR('BOL-ABC123')));
  await a.persist.flush(); a.persist.pause();
  const b = await iniciar();
  assert.equal(b.store.getState().preferencias.tema, 'claro');
  assert.equal(b.store.getState().reservas.lista[0].usado, true);
  assert.ok(b.store.getState().peliculas.lista.some(p => p.codigo === 'P1'));
  assert.ok(b.store.getState().salas.lista[0].funciones.some(f => f.id === 'F1'));
  assert.equal(b.store.dispatch(validarQR(contenidoQR('BOL-ABC123'))).ok, false);
  await b.persist.flush(); b.persist.pause();
});
test('escritura fallida se reintenta con el último estado sin otra venta', async () => {
  let falla = true; let guardado = '';
  const adapter = almacenamientoRecuperable({ getItem: async () => null, removeItem: async () => {}, setItem: async (_k,v) => { if (falla) throw Error('disco lleno'); guardado = v; } });
  await assert.rejects(adapter.setItem('cine', 'estado1'));
  await assert.rejects(adapter.setItem('cine', 'estado2'));
  await assert.rejects(adapter.verificar());
  falla = false; await adapter.verificar();
  assert.equal(guardado, 'estado2');
});

test('ampliar la sala conserva funciones y los asientos que ya estaban ocupados', async () => {
  const s = crearStore(); s.dispatch(comprar(reserva()));
  const anterior = s.getState();
  const ampliada = { ...anterior, salas: { lista: anterior.salas.lista.map(ampliarSala) } };
  assert.equal(ampliada.salas.lista[0].filas.length, 8);
  assert.equal(ampliada.salas.lista[0].columnas, 10);
  assert.deepEqual(ampliada.salas.lista[0].funciones, anterior.salas.lista[0].funciones);
  assert.deepEqual(ampliada.reservas.lista[0].asientos, ['A1', 'A2']);
  assert.equal(estadisticas(ampliada).disponibles, 78);
  assert.deepEqual(ampliarSala(ampliada.salas.lista[0]), ampliada.salas.lista[0]);
});
test('el código sugerido evita colisiones sin distinguir mayúsculas o espacios', async () => {
  assert.equal(sugerirCodigo(['COD001', ' cod002 ', 'COD004']), 'COD003');
});


test('migración real desde versión anterior conserva catálogo y boleto usado', async () => {
  const s = crearStore();
  s.dispatch(comprar(reserva()));
  s.dispatch(validarQR(contenidoQR('BOL-ABC123')));
  const anterior = { ...s.getState(), _persist: { version: -1, rehydrated: true } };
  const resultado = await createMigrate(migraciones)(anterior, 1) as typeof anterior;
  assert.deepEqual(resultado.reservas, anterior.reservas);
  assert.deepEqual(resultado.peliculas, anterior.peliculas);
  assert.equal(resultado.salas.lista[0].columnas, 10);
  assert.equal(resultado.salas.lista[0].filas.length, 8);
  assert.equal(resultado.reservas.lista[0].usado, true);
  assert.deepEqual(await createMigrate(migraciones)({ ...resultado, _persist: { version: 1, rehydrated: true } }, 1), { ...resultado, _persist: { version: 1, rehydrated: true } });
});


test('crear sala y comprar asientos en una función de esa sala', () => {
  const s = crearStore();
  assert.equal(s.dispatch(guardarSala({ id: 'S2', nombre: 'Sala nueva', filas: ['A','B','C'], columnas: 4 }, false)).ok, true);
  s.dispatch(agregarPelicula({ ...pelicula, codigo: 'P2', salaAsignada: 'S2' }));
  assert.equal(s.dispatch(programarFuncion({ ...funcion, id: 'F2', salaId: 'S2', peliculaCodigo: 'P2' })).ok, true);
  assert.equal(s.dispatch(comprar(reserva({ id: 'BOL-NUEVA1', funcionId: 'F2', salaId: 'S2', peliculaCodigo: 'P2', asientos: ['C3','C4'] }))).ok, true);
  assert.equal(estadisticas(s.getState()).disponibles, 16);
});
test('salas: códigos y nombres repetidos, tamaños inválidos y filas duplicadas', () => {
  const s = crearStore();
  const datos = { id: 'S2', nombre: 'Nueva', filas: ['A','B'], columnas: 4 };
  for (const cambios of [{ id: 's1' }, { nombre: 'Sala 1' }, { nombre: '' }, { columnas: 0 }, { columnas: 21 }, { columnas: 2.5 }, { filas: ['A','A'] }, { filas: [] }]) {
    assert.equal(s.dispatch(guardarSala({ ...datos, ...cambios }, false)).ok, false);
  }
  assert.equal(s.getState().salas.lista.length, 1);
});
test('salas con funciones conservan distribución y reservas; renombrar sí es posible', () => {
  const s = crearStore(); s.dispatch(comprar(reserva()));
  s.dispatch(editarSala({ id: 'S1', nombre: 'Sala 1', filas: ['A'], columnas: 1 }));
  assert.equal(s.getState().salas.lista[0].columnas, 3);
  assert.equal(s.dispatch(guardarSala({ id: 'S1', nombre: 'Sala Principal', filas: ['A','B'], columnas: 3 }, true)).ok, true);
  assert.deepEqual(s.getState().reservas.lista[0].asientos, ['A1','A2']);
  assert.equal(s.getState().salas.lista[0].funciones.length, 1);
  s.dispatch(eliminarSala('S1'));
  assert.equal(s.getState().salas.lista.length, 1);
});
test('solo se pueden eliminar salas sin películas, funciones ni reservas', () => {
  const s = crearStore();
  const datos = { id: 'S2', nombre: 'Sala 2', filas: ['A'], columnas: 5 };
  s.dispatch(guardarSala(datos, false));
  assert.equal(s.dispatch(borrarSala('S2')).ok, true);
  s.dispatch(guardarSala(datos, false));
  s.dispatch(agregarPelicula({ ...pelicula, codigo: 'P2', salaAsignada: 'S2' }));
  assert.equal(s.dispatch(borrarSala('S2')).ok, false);
  assert.equal(s.getState().salas.lista.length, 2);
});
test('cambiar tema no altera compras, salas ni catálogo', () => {
  const s = crearStore(); s.dispatch(comprar(reserva()));
  const antes = s.getState();
  s.dispatch(cambiarTema('claro'));
  assert.equal(s.getState().preferencias.tema, 'claro');
  assert.equal(s.getState().reservas, antes.reservas);
  assert.equal(s.getState().salas, antes.salas);
  assert.equal(s.getState().peliculas, antes.peliculas);
  s.dispatch(cambiarTema('oscuro'));
  assert.equal(s.getState().preferencias.tema, 'oscuro');
});
