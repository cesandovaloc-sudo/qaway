import { supabase } from '@/config/supabase'

export async function submitBrief(data) {
  const { error } = await supabase.from('briefs').insert([{
    representante: data.representante,
    empresa: data.empresa,
    rubro: data.rubro,
    ruc: data.ruc || null,
    ciudad: data.ciudad,
    direccion: data.direccion,
    telefono_empresa: data.telefonoEmpresa,
    email_empresa: data.emailEmpresa,
    web: data.web || null,
    redes: data.redes || null,
    contacto_nombre: data.contactoNombre,
    contacto_cargo: data.contactoCargo,
    contacto_telefono: data.contactoTelefono,
    origen_nombre: data.origenNombre,
    motivacion: data.motivacion,
    anio_inicio: data.anioInicio,
    productos_servicios: data.productosServicios,
    factor_diferencial: data.factorDiferencial,
    competidores: data.competidores,
    personalidad: data.personalidad || [],
    personalidad_descripcion: data.personalidadDescripcion,
    colores_preferidos: data.coloresPreferidos || null,
    colores_razon: data.coloresRazon || null,
    colores_no_gustan: data.coloresNoGustan || null,
    colores_no_razon: data.coloresNoRazon || null,
  }])

  if (error) throw error
  return true
}
