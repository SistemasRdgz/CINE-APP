# Pruebas y defensa - CineApp

## Estado de verificación

Las comprobaciones automáticas verifican reglas de negocio y TypeScript. Antes de entregar hay que completar las pruebas manuales en Android que se indican abajo; no se afirma una nota ni ejecución en hardware desde este entorno.

## Matriz de la rúbrica (16 criterios, 160 puntos)

| Criterio | Evidencia en el proyecto | Comprobación durante la defensa |
|---|---|---|
| Configuración | Expo 51, React Native 0.74.5, TypeScript estricto | Abrir la app en Android sin errores |
| Redux Toolkit | Store, slices y hooks tipados; operaciones con getState | Explicar cómo la compra actualiza Redux |
| AsyncStorage | PersistReducer, PersistGate y cola de guardado | Cerrar por completo y recuperar película, función y boleto usado |
| Navegación | Tabs cliente y stack condicional de personal | Catálogo, compra, historial, acceso y retorno |
| Separación de zonas | Rutas administrativas ausentes sin sesión | Cancelar huella, salir y reabrir; nunca debe verse dashboard |
| CRUD | Formulario y lista de personal | Agregar, editar, cambiar estado y eliminar película |
| Venta | Operación comprar y verificación del estado actual | Comprar dos entradas, mostrar total y datos del cliente |
| Asientos | Disponible/seleccionado/ocupado por función | No volver a seleccionar un asiento ya vendido |
| Dashboard | Siete indicadores calculados de Redux | Contrastar una venta conocida con los contadores |
| Hardware | LocalAuthentication y CameraView | Huella real y lectura de QR por cámara |
| Validaciones | Dominio y mensajes en pantallas | Duplicados, vacíos, precio negativo y horario repetido |
| Búsquedas/filtros | Búsqueda por nombre/género/clasificación/sala y chips | Escribir parcialmente, combinar filtros y limpiar |
| UI/Flexbox | StyleSheet, wrap, scroll y mapa horizontal | Revisar teléfono pequeño y teclado abierto |
| Calidad | Dominio separado, componentes y pruebas | Explicar responsabilidades sin leer toda la pantalla |
| Git/GitHub | Rama de continuación y commits descriptivos | Mostrar historial real y repositorio público |
| Funcionamiento | Flujo completo | Demostrar compra → QR → ingreso → rechazo → reapertura |

## Prueba controlada

1. En Personal agrega `DEMO01`, nombre `Película de defensa`, género Drama, duración 90, clasificación A, Sala 1 y precio $4.50.
2. Registra una función futura; por ejemplo mañana a las 19:00. Intenta repetir sala/fecha/hora y comprueba el mensaje de rechazo.
3. Anota los valores iniciales del dashboard. Al agregar la película y función: +1 película, +1 función y +20 lugares disponibles (Sala 1 tiene 20 asientos).
4. Sal de Personal. Busca `defensa`, selecciona esa función y compra 2 entradas, A1 y A2, a nombre de Daniel. Total: $9.00.
5. Intenta pulsar Confirmar rápidamente varias veces: debe existir una única reserva.
6. Vuelve a esa misma función: A1 y A2 deben estar ocupados; otros asientos siguen libres.
7. En Mis Boletos verifica el QR, código, fecha, hora, asientos, cliente y total.
8. En dashboard, respecto al paso 3: +2 boletos, +2 ocupados, -2 disponibles y +$9.00 de ingresos.
9. Muestra una captura del QR en otra pantalla; escanéala con el teléfono que hizo la compra.
10. Debe indicar ingreso registrado para 2 entradas. Escanear la misma imagen de nuevo debe rechazarla.
11. Comprueba Mis Boletos: estado Usado y fecha de uso. Los ingresos no disminuyen y los asientos no se liberan.
12. Fuerza el cierre desde Android y vuelve a abrir. Comprueba los mismos datos y que el QR sigue siendo rechazado.

## Casos negativos de Android

- Cancelar la biometría: ninguna pantalla administrativa debe aparecer.
- Sin huellas registradas: mensaje claro y acceso bloqueado. No existe bypass con PIN.
- Abrir Personal, mandar al fondo y volver: debe regresar al cliente; volver a Personal requiere otra huella.
- Denegar cámara: mostrar explicación y botón para volver a pedirla; si Android ya no permite preguntar, abrir ajustes.
- Escanear un QR ajeno: rechazar sin crash.
- Escanear una reserva de otra instalación: indicar que no existe localmente.
- Película sin nombre, duración 0, precio -1 o código existente: rechazar.
- Fecha imposible, hora inválida, función pasada o repetida: rechazar.
- Correo mal formado al comprar: rechazar; correo vacío es válido porque es opcional.
- Precio cero: aceptar, pues el PDF prohíbe negativos, no entradas gratuitas.
- Eliminar o deshabilitar una película: no ofrecer nuevas compras; conservar historial existente.
- Funciones iniciales vencidas: crear una nueva; no borrar almacenamiento para simular persistencia.

## Explicación breve para la defensa

1. **Cliente y navegación.** La app abre sin autenticación. React Navigation organiza cartelera e historial en tabs, y reserva/asientos en stack.
2. **Redux.** Películas, salas (que contienen funciones) y reservas son los tres slices persistidos. La disponibilidad se deriva de las reservas de cada función, por lo que no mantenemos dos listas de ocupación que puedan contradecirse.
3. **Compra.** La pantalla prepara la reserva y el thunk consulta getState. Rechaza asientos repetidos/ocupados, datos incorrectos o una película no disponible. La actualización ocurre de forma síncrona y la interfaz se actualiza con los hooks de Redux.
4. **Persistencia.** Redux Persist serializa los slices a AsyncStorage y PersistGate espera su recuperación. El guardado de compra e ingreso espera la escritura y permite reintentar errores sin duplicar ventas.
5. **Personal.** LocalAuthentication verifica biometría del sistema. Al aprobar, se monta el grupo administrativo. La autorización no se guarda en el disco.
6. **Dashboard.** Los contadores salen de Redux: boletos es suma de cantidades, ingresos es suma de totales y capacidad es por función. Se conserva el historial aunque una película salga del catálogo.
7. **QR.** Se genera localmente el identificador `CINEAPP:1:BOL-...`. La cámara lo decodifica; el thunk busca en reservas y marca `usado` y `fechaUso`. La segunda lectura falla. Un QR representa la reserva completa.

## Límite intencional del desafío

La base es local, sin servidor. La biometría valida al usuario del dispositivo; no hay cuentas de empleados ni una base compartida entre teléfonos. La defensa debe usar el mismo almacenamiento para compra y validación. Un despliegue real de cine requeriría un diseño distinto, fuera de esta consigna.
