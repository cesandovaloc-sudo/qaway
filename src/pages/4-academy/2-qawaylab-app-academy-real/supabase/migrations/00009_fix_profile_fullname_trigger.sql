-- Qaway Academy - Fix Profile full_name Trigger
-- Migration 00009
--
-- PROBLEMA: El trigger handle_new_user() usaba new.email (ej: "student@qaway.test")
-- como fallback de full_name cuando el usuario no proporcionaba un nombre.
-- Esto causaba que en el panel se viera "¡Buenos días, student@qaway.test!"
-- en vez del nombre real.
--
-- SOLUCIÓN: Usar solo la parte antes del @ (ej: "student" en vez del email completo)
-- y también limpiar perfiles existentes que tengan emails como full_name.

-- 1. Actualizar la función trigger para nuevos registros
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)  -- ← CAMBIO: solo la parte antes del @
    ),
    'student'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Limpiar perfiles existentes cuyo full_name sea un email (contenga @)
update public.profiles
set full_name = split_part(full_name, '@', 1)
where full_name like '%@%';

-- 3. Si el resultado es un nombre muy genérico como 'student', lo dejamos
--    porque el usuario puede actualizarlo desde /panel/configuracion
--    o un admin puede editarlo desde /admin/alumnos
