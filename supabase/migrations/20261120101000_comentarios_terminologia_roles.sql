-- Terminología de roles y correos: sólo comentarios de catálogo.
-- 20-nov-2026. Idempotente. No cambia datos, constraints, RLS ni funciones.

COMMENT ON TABLE public.users IS
'Cuentas globales de acceso. email es el correo de la cuenta/persona y phone el telefono canonico de la persona; el correo y telefono de la empresa estan en tenants.content.contact. role no distingue por si solo admin de plataforma y admin de tenant: usar is_platform_admin y tenant_id.';

COMMENT ON COLUMN public.users.email IS
'Correo de la cuenta/persona (login). Distinto de tenants.content.contact.email, que es el correo de empresa.';

COMMENT ON COLUMN public.users.role IS
'Rol global de la cuenta: admin, editor, viewer o guest. admin puede ser Admin plataforma (is_platform_admin=true o tenant_id null) o admin de tenant (tenant_id no null); para distinguirlos usar is_platform_admin()/is_tenant_admin().';

COMMENT ON COLUMN public.users.is_platform_admin IS
'true = Admin plataforma. Requiere ademas role=admin. Etiqueta corta de UI: Admin plataforma. Legacy: role=admin con tenant_id null tambien cuenta en is_platform_admin().';

COMMENT ON COLUMN public.users.tenant_id IS
'Empresa/tenant de la cuenta. null = sin empresa (caso Admin plataforma). Un admin de tenant siempre tiene tenant_id no null.';

COMMENT ON CONSTRAINT users_role_check ON public.users IS
'Dominio permitido de users.role: admin, editor, viewer, guest. El valor admin necesita is_platform_admin o tenant_id para saber si es plataforma o empresa.';

COMMENT ON TABLE public.tenants IS
'Empresa/tenant de la plataforma. Los datos de contacto de la empresa viven en content.contact.email y content.contact.phone, separados de users.email y users.phone que son de la persona.';

COMMENT ON TABLE public.user_app_roles IS
'Rol por aplicacion dentro de un tenant. Unico por (user_id, tenant_id, app_id). admin aqui significa admin de esa app en esa empresa, nunca Admin plataforma.';

COMMENT ON COLUMN public.user_app_roles.role IS
'admin, editor, viewer o guest dentro de la app y el tenant indicados. No otorga permisos de plataforma.';

COMMENT ON COLUMN public.user_app_roles.tenant_id IS
'Tenant/empresa al que aplica el rol de app.';

COMMENT ON FUNCTION public.is_platform_admin() IS
'Admin plataforma: users.role=admin y (is_platform_admin=true o tenant_id null). Etiqueta UI: Admin plataforma.';

COMMENT ON FUNCTION public.is_admin() IS
'Alias usado por RLS de is_platform_admin(). No significa admin de tenant.';

COMMENT ON FUNCTION public.is_tenant_admin() IS
'Admin de tenant/empresa: users.role=admin y tenant_id no null.';

COMMENT ON FUNCTION public.is_tenant_member() IS
'Miembro de tenant: tenant_id no null y role distinto de guest.';

COMMENT ON FUNCTION public.get_auth_tenant_id() IS
'Devuelve el tenant_id del usuario autenticado; base del aislamiento por empresa.';
