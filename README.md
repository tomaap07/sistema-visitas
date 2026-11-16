# Hallow Agenda · ES03

Sistema de recepción basado en el proyecto de [BenjaminLeiva14](https://github.com/BenjaminLeiva14/ti3041-p2-c3-2026p-Evaluacion3), revisión `0ae7953`, integrado con el diseño de sistema-visitas. Se conservan las vistas tradicionales y el administrador, y se completa una API DRF con un cliente independiente JWT.

## Entrega

- [Sitio publicado](https://sistema-visitas-kohl.vercel.app/visitas/)
- [Cliente web JWT](https://sistema-visitas-kohl.vercel.app/cliente/)
- [API pública (requiere Bearer para datos)](https://sistema-visitas-kohl.vercel.app/api/)
- [Repositorio del cliente](https://github.com/tomaap07/sistema-visitas-cliente)
- [Revisión completa de los 12 indicadores, endpoints y seguridad](docs/ES03_ENTREGA.md)
- [Guion para la demostración](docs/GUION_VIDEO.md)

## Ejecutar

Crear un entorno virtual Python, instalar `requirements.txt` y configurar `.env` usando `.env.example`. Usar un SECRET_KEY aleatorio y una DATABASE_URL PostgreSQL de desarrollo. Mantener DEBUG desactivado en producción. Se acepta también la configuración heredada `host`, `port`, `database`, `user` y `password`.

Revisar y respaldar la base de destino antes de `python manage.py migrate`. Las migraciones originales usan PostgreSQL y no se ejecutan durante el build. Crear la cuenta con `python manage.py createsuperuser` y ejecutar `python manage.py runserver`.

El cliente vive en `static/cliente/` y se sirve también mediante `/cliente/`. Para ejecutarlo en otro origen: `python -m http.server 5500 --bind 127.0.0.1 --directory static/cliente`, configurar `apiBase` en `static/cliente/config.js` y abrir http://127.0.0.1:5500/ . Más instrucciones en [README del cliente](static/cliente/README.md).

## Pruebas

`python manage.py test --settings=core.test_settings`

La configuración aislada utiliza SQLite y crea el esquema final de los modelos; no ejecuta las migraciones PostgreSQL ni toca la base real. Se comprobaron 24 casos de JWT, permisos, CORS, CRUD, validación, administración y errores de base de datos.

## Seguridad y operación

La API exige JWT y permisos `view/add/change/delete` por modelo. CORS permite solo los orígenes explícitos de `CORS_ALLOWED_ORIGINS`. Tokens en memoria en el cliente, sin claves Supabase. El backend usa la conexión PostgreSQL privada. El acceso directo a las tablas Django mediante los roles anon/authenticated de Supabase está cerrado con RLS y revocación de permisos.

Si la base no responde, la API devuelve JSON 503 y el sitio una página de reintento; no se simula un guardado exitoso ni se sustituye por una base temporal. Comprobar el registro antes de repetir una escritura que falló por red.

Los requisitos no enumerados de ES01/ES02 y de seguridad de clases requieren contraste con sus instrucciones. La documentación no garantiza una nota máxima. El video debe revisarse y adjuntarse a la entrega.
