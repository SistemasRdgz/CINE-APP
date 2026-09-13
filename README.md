# CineApp — Sistema de Gestión de Venta de Entradas para un Cine

Proyecto del Segundo Desafío Práctico (UDB - Diseño y Programación de Software
Multiplataforma). Desarrollado con **Expo, React Native, TypeScript, Redux
Toolkit y React Navigation**.

## Estado actual del avance

Implementado hasta el **Módulo 5** inclusive:

- Módulo 1 — Catálogo de películas
- Módulo 2 — Búsqueda dinámica y filtros (género, clasificación, sala, estado)
- Módulo 3 — Reserva y compra de boletos (mapa de asientos táctil, cálculo de total)
- Módulo 4 — Mis Boletos (historial de compras)
- Módulo 5 — Gestión de Películas (CRUD), protegido con **acceso biométrico real**
  (`expo-local-authentication`) en la Zona de Personal
- Módulo 8 — Persistencia local con `redux-persist` + `AsyncStorage`
  (todo el estado global sobrevive a cerrar la app)
- Módulo 6 (Dashboard/Estadísticas) y Módulo 7 (Escáner QR): pantallas
  placeholder ya enlazadas en la navegación

## Instalación y ejecución

```bash
npm install
npx expo start
```

Luego presiona `a` para abrirlo en un emulador/dispositivo Android (o escanea
el QR con Expo Go).

> **Importante:** el sensor biométrico (huella/Face ID) requiere que el
> emulador tenga configurada una huella virtual (Extended Controls > Fingerprint
> en Android Studio) o que el dispositivo físico tenga biometría registrada.
> Sin esto, `expo-local-authentication` no podrá autenticar y el acceso a la
> Zona de Personal quedará bloqueado (comportamiento esperado y obligatorio
> según las indicaciones del desafío).

## Estructura del proyecto

```
App.tsx
src/
├── types/            → Pelicula, Reserva, Asiento, Sala/Funcion
├── redux/
│   ├── store.ts       → configureStore + redux-persist (AsyncStorage)
│   ├── hooks.ts        → useAppDispatch / useAppSelector tipados
│   ├── seedData.ts      → datos iniciales (películas, salas, funciones)
│   └── slices/
│       ├── peliculasSlice.ts   → CRUD de películas
│       ├── reservasSlice.ts     → compras/boletos
│       └── salasSlice.ts         → salas y funciones
├── navigation/
│   ├── AppNavigator.tsx  → Stack raíz + Tabs de cliente
│   └── types.ts
├── screens/
│   ├── PeliculasScreen.tsx        → catálogo (cliente) y listado CRUD (personal)
│   ├── FormularioPeliculaScreen.tsx → alta/edición de película con validaciones
│   ├── ReservaScreen.tsx            → selección de función y cantidad
│   ├── MapaAsientosScreen.tsx        → mapa de asientos + confirmación de compra
│   ├── HistorialScreen.tsx            → Mis Boletos
│   ├── AccesoPersonalScreen.tsx        → gate biométrico
│   ├── PersonalHomeScreen.tsx           → menú interno de la Zona de Personal
│   ├── DashboardScreen.tsx (placeholder, Módulo 6)
│   └── EscanerScreen.tsx (placeholder, Módulo 7)
└── components/
    ├── Buscador.tsx
    ├── Filtros.tsx
    ├── PeliculaFila.tsx
    └── Asiento.tsx
```

## Validaciones implementadas

- No se permiten códigos de película duplicados.
- No se permiten películas sin nombre.
- No se permiten precios negativos.
- No se puede reservar un asiento ya ocupado (se recalcula en tiempo real
  contra las reservas existentes de esa función).
- No se puede confirmar una compra sin seleccionar exactamente la cantidad de
  asientos indicada, ni sin nombre de cliente.
