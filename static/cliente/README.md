# Cliente web de recepción · ES03

Cliente independiente HTML/JavaScript que permite a una persona de recepción administrar identidades y visitas desde una interfaz responsive. Consume exclusivamente la API REST Django mediante `fetch`; no conecta directamente con Supabase ni usa sesiones de Django.

## Ejecutar

1. Tener Python 3 instalado.
2. Desde esta carpeta: `python -m http.server 5500 --bind 127.0.0.1`.
3. Abrir http://127.0.0.1:5500/ . No abrir `index.html` mediante `file://`.
4. Ingresar con una cuenta Django activa que tenga los permisos de los modelos `persona` y `visita`.

Por defecto, `config.js` apunta a https://sistema-visitas-kohl.vercel.app . Para desarrollar con una API local, cambiar únicamente `apiBase` por `http://127.0.0.1:8000`. El backend permite explícitamente los orígenes `http://localhost:5500` y `http://127.0.0.1:5500`; otros requieren ajustar `CORS_ALLOWED_ORIGINS` en el servidor. Un puerto distinto es otro origen.

También se publica integrado en https://sistema-visitas-kohl.vercel.app/cliente/ . En `/static/cliente/` utiliza la API del mismo origen, por lo que las vistas previas de Vercel también funcionan sin cambiar el archivo de configuración.

## Flujo y seguridad

- `POST /api/token/`: obtener access y refresh con usuario/contraseña.
- `Authorization: Bearer <access>` en todas las solicitudes protegidas.
- `GET /api/me/`: obtener identidad y permisos para adaptar los controles.
- CRUD de `/api/personas/` y `/api/visitas/`; detalle, búsqueda local y edición mediante PATCH.
- Si una petición recibe 401, renueva con `POST /api/token/refresh/` y reintenta una vez. Las solicitudes concurrentes comparten una renovación.
- Tokens en memoria, nunca en localStorage ni archivos. La contraseña se borra del formulario al autenticar. Recargar requiere iniciar sesión otra vez.
- Cerrar sesión elimina los tokens del cliente. No revoca un token ya copiado: access dura 10 minutos y refresh 8 horas. Las cuentas inactivas dejan de tener acceso.
- Los datos se insertan mediante `textContent`, sin interpretar HTML del servidor. Cada operación verifica permisos también en el backend.
- Si falla la red, consultar el registro antes de repetir una escritura para evitar duplicados.
- Las eliminaciones requieren confirmación; no se puede eliminar una persona con visitas asociadas (409).

## Interfaz y dependencias

Bootstrap 5.3.8 (CSS, licencia MIT) se sirve localmente. Se utilizan tablas responsivas, indicadores de carga, diálogos nativos accesibles, estados vacíos, mensajes de validación y soporte de movimiento reducido. No requiere Node ni compilación.

`ambient/` contiene escenario original de Silksong, lluvia animada, criaturas decorativas, cursor y favicon del Caballero. El reproductor ofrece música de Hollow Knight y Needoline de Silksong, volumen y controles de efectos. Los recursos se alojan localmente y el usuario confirmó su autorización; las atribuciones completas están en `docs/ASSET_MANIFEST.md` del backend. La música puede requerir la primera interacción del usuario por las políticas del navegador.

Backend: https://github.com/tomaap07/sistema-visitas
Documentación de endpoints y validación: `docs/ES03_ENTREGA.md` en el backend.
