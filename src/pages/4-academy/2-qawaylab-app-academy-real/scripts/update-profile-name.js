// Script para actualizar el nombre del perfil en Supabase
// Uso: node scripts/update-profile-name.js <email> <new_name>
// Ejemplo: node scripts/update-profile-name.js student@qaway.test "Carlos Sandoval"

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY')
  console.error('   Asegúrate de tener un archivo .env en la raíz del proyecto')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateProfile(email, newName) {
  console.log(`\n🔍 Buscando usuario: ${email}`)
  console.log(`📝 Nuevo nombre: ${newName}\n`)

  // 1. Buscar el perfil por el email (primero obtenemos el auth user)
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    console.log('⚠️  No se puede acceder a admin (normal con anon key)')
    console.log('   Intentando login directo...\n')

    // Intentar login como el usuario
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: process.env.STUDENT_PASSWORD || 'Gyg@fGZk*ByL6LF',
    })

    if (signInError) {
      console.error('❌ Error al iniciar sesión:', signInError.message)
      console.log('\n👉 Alternativa: Ejecuta este SQL en el SQL Editor de Supabase:')
      console.log(`
-- 1. Obtener el ID del usuario
SELECT id, email FROM auth.users WHERE email = '${email}';

-- 2. Actualizar el nombre
UPDATE public.profiles
SET full_name = '${newName}'
WHERE id = (
  SELECT id FROM auth.users WHERE email = '${email}'
);
      `)
      process.exit(1)
    }

    // Actualizar perfil propio
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: newName })
      .eq('id', signInData.user.id)
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error al actualizar perfil:', profileError.message)
      process.exit(1)
    }

    console.log(`✅ Perfil actualizado: ${profile.full_name}`)
    console.log(`   Email: ${email}`)
    console.log(`   Rol: ${profile.role}`)

    // Cerrar sesión
    await supabase.auth.signOut()
    return
  }

  // Buscar el usuario por email
  const user = users?.find(u => u.email === email)
  if (!user) {
    console.error(`❌ No se encontró usuario con email: ${email}`)
    process.exit(1)
  }

  // Actualizar perfil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: newName })
    .eq('id', user.id)
    .select()
    .single()

  if (profileError) {
    console.error('❌ Error al actualizar perfil:', profileError.message)
    process.exit(1)
  }

  console.log(`✅ Perfil actualizado: ${profile.full_name}`)
  console.log(`   Email: ${email}`)
  console.log(`   Rol: ${profile.role}`)
}

// Leer argumentos
const args = process.argv.slice(2)
const email = args[0] || 'student@qaway.test'
const newName = args[1] || 'Carlos Sandoval'

updateProfile(email, newName)
  .then(() => {
    console.log('\n✨ Proceso completado. Refresca la página para ver el cambio.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Error inesperado:', err.message)
    process.exit(1)
  })
