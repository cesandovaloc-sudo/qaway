-- Qaway Academy - Admin Can Create Teachers
-- Migration 00011
-- ============================================================
-- Creates an RPC function that allows admin users to create
-- teacher accounts (auth user + profile with role='teacher').
-- ============================================================

create or replace function public.admin_create_teacher(
  p_email text,
  p_password text,
  p_full_name text default null
) returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid;
  v_full_name text;
begin
  -- Only allow admins
  if public.get_user_role() != 'admin' then
    raise exception 'Se requiere rol de administrador';
  end if;

  v_full_name := coalesce(p_full_name, split_part(p_email, '@', 1));

  -- Create user in auth.users
  v_user_id := gen_random_uuid();

  insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
  ) values (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, extensions.gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', v_full_name),
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  -- Insert identity (required for email login)
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    created_at,
    updated_at,
    last_sign_in_at
  ) values (
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id, 'email', p_email),
    'email',
    now(),
    now(),
    now()
  );

  -- Create/update profile with teacher role
  insert into public.profiles (id, full_name, role)
  values (v_user_id, v_full_name, 'teacher')
  on conflict (id) do update set
    role = 'teacher',
    full_name = v_full_name;

  return json_build_object(
    'id', v_user_id,
    'email', p_email,
    'full_name', v_full_name
  );
end;
$$;
