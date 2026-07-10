import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const { data: leads, error } = await supabase.from('leads').select('*')
  if (error) {
    console.error("Error fetching leads:", error)
    return
  }
  console.log("LEADS DATA FROM SUPABASE:")
  console.log(JSON.stringify(leads, null, 2))
}

test()
