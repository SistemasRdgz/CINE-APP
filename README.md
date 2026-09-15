# CineApp - Segundo Desafío Práctico

Aplicación Android de venta de entradas para cine. Continúa la base de los módulos 1-5 de SistemasRdgz y completa dashboard, QR, funciones y validaciones. Usa Expo SDK 51, React Native, TypeScript, Redux Toolkit, React Navigation y AsyncStorage. No consume APIs ni utiliza backend.

## Ejecutar

Requisitos: Node.js 20.19 o posterior, npm, Git y Android con huella configurada (o emulador con biometría). El sensor es obligatorio para entrar a la zona de personal.

```bash
npm ci
npm run typecheck
npm test
npx expo start --clear
```

**Expo Go debe ser compatible con SDK 51.** Descarga la versión Android correspondiente desde [Expo Go](https://expo.dev/go?sdkVersion=51&platform=android&device=true). La versión actual de la tienda puede no abrir este proyecto. Sigue la [guía oficial de incompatibilidad de versiones](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/). Se conserva SDK 51 para no mezclar la continuación del trabajo con una migración mayor.

Conecta computadora y teléfono a la misma red y escanea el QR de Expo. Este QR abre la aplicación; los QR de entradas se encuentran **dentro de Mis Boletos**.

Alternativa con Android SDK/JDK instalados:

```bash
npx expo run:android
```

Esto genera y compila un proyecto Android nativo local. No se requiere un backend. El servidor de desarrollo entrega el código de la app, no almacena las ventas.

## Diseño y experiencia

La interfaz usa carbón, vino, dorado y marfil. La cartelera conserva los filtros originales e incorpora CineApp, el eslogan «Tu próxima gran historia» y tarjetas con portadas. Los íconos de la aplicación usan MaterialCommunityIcons; no hay emojis en las pantallas.

Al crear o editar una película se puede elegir una imagen de la galería. Se copia al directorio privado de la app (`posters/`) y Redux guarda su nombre relativo. La imagen continúa disponible si se elimina el original de la galería. Si no hay imagen, se muestra una portada vectorial local. No se descargan pósters de servidores externos.

El formulario sugiere un código libre y ofrece listas de género, clasificación, sala y estado. Las funciones usan calendario y reloj nativos. Los diálogos de información y confirmación usan el tema propio; los permisos y la autenticación mantienen el control del sistema operativo.

Las salas S1 y S2 se amplían a **8 filas (A-H) por 10 columnas: 80 asientos por función**. La migración de Redux Persist conserva películas, funciones, reservas y estados de uso. Por ello cambian los contadores de capacidad, no las ventas. El mapa muestra las filas apiladas, un pasillo después de la columna 5 y desplazamiento horizontal.

Abrir el selector de imágenes conserva temporalmente el formulario. Salir normalmente de la aplicación sigue bloqueando la zona de personal.

## Flujos

**Cliente:** cartelera → función → cantidad → asientos → datos del cliente → confirmar → Mis Boletos. Solo se ofrecen películas disponibles y funciones futuras. Se comprueba de nuevo el estado actual de Redux al confirmar.

**Personal:** botón Personal → huella/biometría fuerte → películas, funciones, dashboard y escáner. No se acepta PIN como reemplazo. Las rutas administrativas no existen en el navegador del cliente. La sesión vive en memoria y se elimina al salir o mandar la aplicación al fondo.

**Funciones:** asigna la sala a la película en el CRUD y luego crea una fecha/hora en Gestión de funciones. Una película nueva necesita al menos una función futura para poder comprarla. Se impiden fechas inválidas, horarios pasados y un mismo horario en la misma sala. No se impiden solapamientos de duración: la consigna exige horario repetido exacto.

**QR:** cada reserva genera un QR que incluye todos los asientos comprados. Su primera lectura marca la reserva completa como usada; las lecturas posteriores se rechazan. El precio, los asientos y el estado se consultan en Redux, nunca se aceptan del contenido del QR.

## Demostrar cámara con datos exclusivamente locales

Las compras solo existen en el dispositivo que las creó. Dos teléfonos con CineApp **no se sincronizan**, según la restricción de no usar backend.

1. Compra en el teléfono A y abre Mis Boletos.
2. Toma una captura del QR y muéstrala en la computadora o en otro teléfono. Ese segundo dispositivo solo muestra la imagen.
3. En el teléfono A entra a Personal y abre el escáner.
4. Escanea la imagen: debe aceptar el boleto. Escanea de nuevo: debe rechazarlo.
5. Cierra por completo la app y vuelve a abrirla: el boleto continúa usado.

No borres datos de la app ni la desinstales al probar persistencia. Los datos iniciales se crean solo en la primera apertura; si las funciones iniciales ya pasaron, agrega funciones futuras desde Personal.

## Módulos

| Módulo | Implementación |
|---|---|
| 1-2 | Catálogo, datos de películas, búsquedas dinámicas sin distinguir tildes y filtros |
| 3 | Compra validada, selección táctil, total y bloqueo de doble compra |
| 4 | Historial, QR, código, cliente, asientos, total y estado de uso |
| 5 | Alta, edición, eliminación y cambio de estado de películas |
| 6 | Siete indicadores derivados del estado, incluidos empates de película más reservada |
| 7 | Cámara real, permisos, validación local y rechazo de reutilización |
| 8 | Persistencia de películas, reservas, salas y funciones; recuperación al iniciar |
| 9 | Biometría fuerte para personal y cámara para lectura QR |

## Organización del código

- `src/domain/cine.ts`: reglas de películas, funciones, compra, QR y estadísticas.
- `src/redux/rootReducer.ts`: combina slices y protege operaciones entre slices.
- `src/redux/operaciones.ts`: thunks síncronos que consultan el estado más reciente y devuelven mensajes al usuario.
- `src/redux/store.ts`: Redux Persist y AsyncStorage.
- `src/redux/almacenamiento.ts`: cola de escritura y reintento del último guardado fallido.
- `src/auth/SesionPersonal.tsx`: sesión transitoria y bloqueo al pasar al fondo.
- `src/navigation/AppNavigator.tsx`: tabs del cliente y stack condicional del personal.
- `src/components/BoletoQR.tsx`: QR generado localmente con `qrcode-generator` y SVG.
- `src/screens/`: interfaces con Flexbox y StyleSheet.
- `tests/cine.test.ts`: regresiones de compra, funciones, QR, estadísticas y persistencia.

## Estadísticas e historial

El dashboard considera todas las funciones registradas. La capacidad se suma por función, no solo por sala; A1 puede venderse en distintos horarios. Boletos vendidos suma cantidades, no reservas. Ingresos suma totales en centavos. Película más reservada se determina por boletos vendidos y muestra empates.

Eliminar una película la retira del catálogo pero conserva sus funciones y los datos históricos de sus ventas. Las nuevas compras de esa película quedan bloqueadas. Cambiar el nombre o precio de una película no modifica boletos ya emitidos. Una reserva utilizada sigue contando como venta y sus asientos permanecen ocupados.

## Verificación

```bash
npm run typecheck
npm test
npx expo install --check
npm run export:android
```

Las pruebas de persistencia usan el adaptador de almacenamiento en memoria para simular una nueva instancia de Redux Persist. El cierre y reapertura reales, la cámara, los permisos y la biometría requieren validación en Android. La exportación genera un bundle JavaScript Android, **no un APK ni una prueba de hardware**.

Consulta [docs/PRUEBAS-Y-DEFENSA.md](docs/PRUEBAS-Y-DEFENSA.md) para la matriz de la rúbrica y la demostración.
