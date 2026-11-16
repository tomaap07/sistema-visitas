# Guion de demostración ES03 (4–6 minutos)

1. **Problema y arquitectura (30 s).** Explicar el registro de recepción: personas identificadas por RUT, visitas con entrada y salida. Mostrar cliente → JWT/DRF → ORM → Supabase, desplegado en Vercel. Identificar el trabajo original de ambos integrantes.
2. **Autenticación (40 s).** Abrir la URL publicada del cliente. Mostrar que un GET sin token devuelve 401. Iniciar sesión sin mostrar la contraseña. Explicar access de 10 minutos, refresh de 8 horas y cabecera Bearer. Nunca publicar el token completo en el video.
3. **CRUD (90 s).** Crear una persona ficticia con RUT válido; consultarla, editar su nombre; crear su visita; verla y modificar la salida. Mostrar búsqueda y móvil. Usar únicamente datos de evaluación.
4. **Validación (40 s).** Intentar guardar salida anterior a entrada: mostrar error 400 y que el registro no cambia. Explicar RUT único y dígito verificador. Intentar eliminar persona con visita: conflicto 409. Borrar primero la visita de prueba y luego la persona de prueba.
5. **Seguridad y CORS (50 s).** Mostrar cuenta de solo consulta sin botones de escritura y petición no autorizada 403. Abrir cliente desde localhost:5500 hacia la API y explicar por qué es otro origen. Mostrar lista explícita de CORS y prueba de origen rechazado. Explicar que RLS bloquea acceso directo a las tablas de Django desde Supabase anon/authenticated.
6. **Calidad y continuidad (40 s).** Mostrar las 24 pruebas, el README, ambos repositorios y la URL operativa. Explicar JSON 503 y reintento si la base falla, sin prometer guardado offline. Cerrar sesión. Comprobar los requisitos de ES01/ES02 y de clases antes de afirmar cumplimiento total.

La demostración debe reflejar acciones reales. No mostrar secretos de Vercel/Supabase, hashes de contraseñas, tokens ni datos de visitantes reales. Revisar el video antes de entregarlo y añadir los nombres de los integrantes según las instrucciones del docente.
