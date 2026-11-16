# Hallow Agenda

Rediseño del sistema de visitas de [BenjaminLeiva14](https://github.com/BenjaminLeiva14/ti3041-p2-c3-2026p-Evaluacion3), basado en la revisión `0ae7953`, con estética y sonidos del proyecto original de sistema-visitas. Se conservan las vistas, modelos, validaciones y API del proyecto base.

## Configuración

Usar Python 3.12 y las dependencias de `requirements.txt`. Para Vercel, configurar `SECRET_KEY` y `BASE_COMPANERO_DATABASE_URL` con la conexión PostgreSQL del proyecto base. Esta última tiene prioridad sobre el antiguo `DATABASE_URL`, que se mantiene para no cambiar el sitio existente. También se admite la configuración original mediante `host`, `port`, `database`, `user` y `password`. No se ejecutan migraciones durante el build.

El esquema `caso1_visitas` debe estar migrado antes de usar el sistema. Las tablas del antiguo sistema (`visitas_visita`) tienen una estructura distinta y no se importan ni eliminan automáticamente. Aplicar las migraciones de Django de forma controlada solo después de verificar la base de destino y respaldar sus datos.

Las pruebas locales se ejecutan con `python manage.py test --settings=core.test_settings`. Esta configuración crea el esquema de prueba directamente: la historia de migraciones original contiene SQL específico de PostgreSQL y no se ejecuta en SQLite.

Si la base de datos no responde, se muestra una página de reintento con estado HTTP 503. La página no sustituye la base de datos ni permite registrar visitas sin conexión; tras un error al guardar se debe comprobar el listado antes de volver a enviar.
