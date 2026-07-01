import { createClient } from '@supabase/supabase-js';

const url = 'https://qrusdsqgygfolxfrafyd.supabase.co';
const key = 'sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi';

const supabase = createClient(url, key);

async function testConnection() {
  console.log("Testeando conexión a Supabase...");
  const { data, error } = await supabase.from('leads').select('*').limit(1);
  
  if (error) {
    console.error("Error al consultar la tabla 'leads':", error.message);
  } else {
    console.log("Conexión exitosa. Tabla 'leads' existe. Datos:", data);
  }
}

testConnection();
