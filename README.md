# CineApp

**Tu próxima gran historia.**

Aplicación Android para consultar la cartelera, comprar entradas y administrar un cine. Desarrollada con React Native, Expo SDK 51, TypeScript, Redux Toolkit, React Navigation y AsyncStorage.

## Funcionalidades

- Cartelera con imágenes, búsqueda y filtros por género, clasificación, sala y estado.
- Compra de entradas con selección de función, mapa de asientos y cálculo del total.
- Historial de boletos con QR y estado de uso.
- Acceso del personal mediante biometría fuerte.
- Gestión de películas con imágenes de la galería y selectores de género y clasificación.
- Gestión de salas con distribución configurable de filas y asientos.
- Programación de funciones con calendario, reloj y validación de horarios repetidos.
- Escáner QR para validar entradas y rechazar boletos reutilizados.
- Dashboard de películas, funciones, ventas, ocupación, ingresos y película más reservada.
- Modo claro y oscuro con preferencia guardada.
- Persistencia local del catálogo, salas, funciones, reservas y boletos usados.

## Instalación y ejecución

Requisitos: Node.js 20.19 o posterior, npm y un dispositivo Android con biometría configurada para acceder a Personal.

Desde la carpeta del proyecto:

```bash
npm ci
npx expo start --go --lan --clear
```

Conecta la computadora y el teléfono a la misma red. Abre el proyecto escaneando el QR con una versión de **Expo Go compatible con SDK 51**, disponible en [Expo Go para Android](https://expo.dev/go?sdkVersion=51&platform=android&device=true).

El QR del servidor de desarrollo abre la aplicación. Los QR de las entradas se encuentran dentro de **Mis Boletos**.

Como alternativa, con Android SDK y JDK configurados:

```bash
npx expo run:android
```

## Uso

### Cliente

1. Busca una película en Cartelera.
2. Selecciona una función futura, la cantidad de entradas y los asientos.
3. Completa los datos del cliente y confirma la compra.
4. Consulta el boleto y su QR en Mis Boletos.

Los asientos comprados quedan ocupados para esa función. Utilizar el boleto no libera los asientos ni descuenta la venta.

### Personal

Accede desde el botón Personal y autentícate con biometría. Desde esta sección puedes administrar películas, salas y funciones, consultar el dashboard y escanear boletos. La sesión se bloquea al salir o enviar normalmente la aplicación al fondo.

Para ofrecer una película nueva, asígnale una sala y programa al menos una función futura. Si las funciones iniciales ya pasaron, crea nuevos horarios.

Las salas permiten entre 1 y 26 filas y entre 1 y 20 asientos por fila. Su distribución solo puede modificarse mientras no tengan funciones. No se pueden eliminar salas con películas asignadas, funciones o reservas.

## Almacenamiento y validación de entradas

La aplicación funciona con datos locales, sin backend ni sincronización entre dispositivos. Para validar una entrada, utiliza el dispositivo en el que se realizó la compra: muestra una captura del QR en otra pantalla y escanéala desde Personal en el dispositivo original.

Cada QR corresponde a una reserva completa y se acepta una sola vez. Los datos se conservan al cerrar y volver a abrir la aplicación; desinstalarla o borrar sus datos elimina el almacenamiento local.

El dashboard acumula las funciones registradas y calcula la capacidad por función. Las ventas conservan sus datos históricos aunque una película cambie o se retire del catálogo.

## Estructura

- `src/screens/`: pantallas del cliente y del personal.
- `src/components/`: componentes reutilizables.
- `src/navigation/`: navegación y rutas.
- `src/auth/`: autenticación y sesión del personal.
- `src/domain/`: reglas de compra, funciones, QR y estadísticas.
- `src/redux/`: estado global, operaciones y persistencia.
- `src/ui/`: apariencia y temas.
- `tests/`: pruebas automatizadas.

## Verificación

```bash
npm run typecheck
npm test
npm run export:android
```

Las pruebas cubren reglas de compra, horarios, QR, estadísticas, salas y persistencia. La cámara y la biometría requieren comprobación en Android. La exportación genera el bundle JavaScript para Android; no genera un APK.
