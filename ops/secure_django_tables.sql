-- Solo para el proyecto Supabase de Hallow Agenda.
-- Django usa la conexión PostgreSQL del servidor; el cliente usa DRF/JWT.
-- No se exponen tablas de Django mediante PostgREST / anon / authenticated.
begin;
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'auth_group','auth_group_permissions','auth_permission','auth_user',
    'auth_user_groups','auth_user_user_permissions','django_admin_log',
    'django_content_type','django_migrations','django_session',
    'caso1_visitas_persona','caso1_visitas_visita','visitas_visita'
  ] loop
    if to_regclass(format('public.%I',table_name)) is not null then
      execute format('alter table public.%I enable row level security',table_name);
      execute format('revoke all on table public.%I from anon, authenticated',table_name);
    end if;
  end loop;
end $$;
commit;
