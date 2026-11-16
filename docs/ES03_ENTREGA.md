# Entrega y verificación ES03

Revisión del 16 de noviembre de 2026 sobre las cinco páginas de `ES03-TI3041 (1).pdf`. Esta matriz acredita lo comprobado; no asigna una nota ni sustituye la evaluación del docente.

## Arquitectura y flujo

Cliente independiente HTML/JS + Bootstrap → fetch con JWT Bearer → routers y ModelViewSets de DRF → serializers y validaciones del dominio → ORM Django → PostgreSQL de Supabase. La aplicación se publica en Vercel. Las vistas tradicionales y el administrador se conservan.

El cliente resuelve el trabajo de recepción: registrar una persona, asociar visitas, consultar el historial, corregir datos, marcar salida y eliminar registros cuando los permisos lo permiten. Se ejecuta separado con un servidor HTTP estático y no accede directamente a Supabase.

## Matriz de indicadores

| Indicador | Implementación / evidencia | Alcance pendiente |
|---|---|---|
| DRF configurado | Aplicaciones, JWTAuthentication, IsAuthenticated por defecto; `core/settings.py` | Validación final del docente |
| Serializers/ViewSets coherentes | Dos modelos, serializers únicos y validación temporal tanto en POST como PATCH | Ninguno identificado en el flujo probado |
| Endpoints RESTful | `/api/personas/`, `/api/personas/{rut}/`, `/api/visitas/`, `/api/visitas/{id}/`, `/api/me/` | Ninguno identificado en el flujo probado |
| SimpleJWT | Obtención, refresh, rechazo de token inválido/vencido y cuenta inactiva; cliente renueva automáticamente | El cierre local no revoca tokens ya copiados |
| Funcionalidades de unidades previas | Se conservan vistas, formularios, validación de RUT y administración; pruebas existentes pasan | Se necesitan los criterios completos de ES01/ES02 para comprobar cobertura |
| Seguridad mínima de clases | Permisos por modelo, CSRF en formularios Django, secretos por entorno, cookies seguras y HTTPS en Vercel, RLS en Supabase | Las medidas específicas vistas en clases no se enumeran en este PDF |
| Políticas de acceso API | Anónimo 401; sin permiso 403; permisos `view/add/change/delete` de Django en cada modelo; controles de UI adaptados | Configurar las cuentas reales que usarán para la demostración |
| CORS seguro | Lista explícita; preflight con Authorization y Content-Type; origen ajeno no recibe permiso | Añadir el origen exacto si el cliente se despliega en otro dominio |
| Cliente JWT/Bearer | Cliente independiente en `static/cliente/`, ambos CRUD, búsqueda, errores, cargas y UI responsive Bootstrap | Comprobar con las credenciales de entrega en el despliegue final |
| Código y documentación | Separación de API, serializers, rutas, cliente, pruebas y configuración de ejemplo sin secretos | Mantener sincronizado el repositorio del cliente al modificar sus archivos |
| Video explicativo | Guion en `docs/GUION_VIDEO.md`, capturas de pruebas reales | Adjuntar y revisar la demostración en video en la entrega académica |
| URL pública y CRUD | `/cliente/`, `/api/` y `/visitas/`; CRUD completo probado localmente por API y altas/edición desde navegador | Verificación de la revisión desplegada y demostración con cuenta autorizada |

## URLs de entrega

- Backend: https://github.com/tomaap07/sistema-visitas
- Sitio: https://sistema-visitas-kohl.vercel.app/visitas/
- Cliente publicado: https://sistema-visitas-kohl.vercel.app/cliente/
- API: https://sistema-visitas-kohl.vercel.app/api/
- Cliente independiente: https://github.com/tomaap07/sistema-visitas-cliente

## Endpoints y códigos esperados

| Ruta | Métodos | Resultado |
|---|---|---|
| `/api/token/` | POST username/password | 200 access/refresh; 401 credenciales inválidas |
| `/api/token/refresh/` | POST refresh | 200 access; 401 inválido/vencido |
| `/api/me/` | GET Bearer | 200 usuario y permisos; 401 sin JWT |
| `/api/personas/` | GET, POST | 200 lista; 201 alta |
| `/api/personas/{rut}/` | GET, PUT, PATCH, DELETE | 200 lectura/actualización; 204 borrado; 409 si tiene visitas |
| `/api/visitas/` | GET, POST | 200 lista; 201 alta |
| `/api/visitas/{id}/` | GET, PUT, PATCH, DELETE | 200 lectura/actualización; 204 borrado |

En recursos protegidos: 401 sin token válido, 403 sin permiso, 404 inexistente, 400 validación, 503 fallo temporal de la base. Los errores de base responden JSON en la API, HTML de reintento en el sitio, y `Retry-After: 30`.

El RUT es la clave de Persona y no se modifica al editar. Los RUT duplicados o con dígito incorrecto se rechazan. Entrada anterior a la fecha solicitada o salida anterior a la entrada se rechazan, incluidas actualizaciones parciales. Primero se registra una persona; después se crea su visita. No se elimina una persona con visitas asociadas.

## Permisos

En Administración → Usuarios/Grupos, asignar los permisos de `Recepción y visitas`. Una cuenta operadora necesita `view/add/change/delete` de Persona y Visita; una cuenta de consulta solo `view`. `is_staff` solo es necesario para acceder al administrador, no para utilizar el cliente. Un superusuario tiene todos los permisos. No se cambiaron permisos de las cuentas existentes durante las pruebas locales.

La lista y ficha públicas tradicionales mantienen su comportamiento heredado y pueden mostrar datos de visitas. Para una entrega personal usar datos ficticios. La protección JWT aquí descrita se aplica a la API; no debe confundirse con un sitio privado completo.

## Ejecutar y probar

1. Python 3.12 o superior compatible con las dependencias de `requirements.txt`.
2. Crear y activar un entorno virtual; `pip install -r requirements.txt`.
3. Copiar `.env.example` a `.env` y configurar una base PostgreSQL de desarrollo y un SECRET_KEY aleatorio. No usar credenciales de producción para pruebas destructivas.
4. Revisar la base de destino y respaldarla antes de `python manage.py migrate`; la historia original contiene SQL específico de PostgreSQL. No se ejecutan migraciones durante el build.
5. `python manage.py createsuperuser`, después `python manage.py runserver`.
6. Cliente externo: seguir `static/cliente/README.md` (puerto 5500).
7. Pruebas aisladas: `python manage.py test --settings=core.test_settings`. SQLite crea el esquema final sin ejecutar las migraciones PostgreSQL originales.

Se ejecutaron 24 pruebas automatizadas: reglas del dominio, ambos CRUD, dependencias al borrar, JWT/refresh/expiración, cuentas inactivas, permisos, CORS, administrador y caída simulada de la base. La prueba de caída escribe un error esperado en el log y finaliza correctamente.

En navegador se comprobó: autenticación, alta de persona, alta y edición de visita, rechazo visible de salida inválida y consumo desde puerto 5500 hacia API en 8766. En un entorno de demostración con access de 5 segundos, dos solicitudes recibieron 401, se emitió un único refresh y ambas se recuperaron con 200. La configuración real usa access de 10 minutos y refresh de 8 horas.

## Supabase

Proyecto existente `tomemoslapala`, comprobado activo. Se preservaron datos y esquema del dominio. El 16-11-2026 se aplicó `secure_django_data_api`: RLS en las 13 tablas Django/dominio y revocación de accesos `anon`/`authenticated` de Supabase. El rol PostgreSQL del backend conserva acceso. Script reproducible: `ops/secure_django_tables.sql`.

Verificación posterior: 0 tablas del alcance sin RLS y 0 con SELECT para esos roles públicos; sitio y login siguieron respondiendo 200. El asesor dejó únicamente avisos informativos “RLS sin políticas”: es intencional, porque las tablas no se consumen mediante PostgREST, sino mediante Django. No añadir políticas públicas para silenciar esos avisos. [Referencia del asesor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Referencias técnicas

- [DRF: serializers](https://www.django-rest-framework.org/api-guide/serializers/)
- [DRF: permisos por modelo](https://www.django-rest-framework.org/api-guide/permissions/)
- [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/en/latest/getting_started.html)
- [django-cors-headers](https://github.com/adamchainz/django-cors-headers)
- [Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [Supabase: seguridad de API](https://supabase.com/docs/guides/api/securing-your-api)
