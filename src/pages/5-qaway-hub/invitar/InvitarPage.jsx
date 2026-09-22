import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import InviteUserModule from '../HubInviteUserModule'

// Preview/conexión del recorrido de invitación (diseño del módulo intacto).
// Super Admin: puede elegir la empresa destino (opera globalmente).
// Tenant Admin: queda atado a su propia empresa (no cambiable).
export default function InvitarPage() {
  const navigate = useNavigate()
  const [ctx, setCtx] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login?redirect=/hub/invitar', { replace: true })
        return
      }
      const { data: me } = await supabase
        .from('users')
        .select('tenant_id, is_platform_admin')
        .eq('id', session.user.id)
        .single()

      let tenantOptions = null
      let tenantId = me?.tenant_id || null
      let tenantName = null

      if (me?.is_platform_admin === true) {
        const { data: tenants } = await supabase
          .from('tenants')
          .select('id, name, status')
          .order('name')
        tenantOptions = (tenants || [])
          .filter((t) => t.status === 'active')
          .map((t) => ({ id: t.id, name: t.name }))
        tenantId = tenantOptions[0]?.id || null
        tenantName = tenantOptions[0]?.name || null
      }

      if (alive) setCtx({ session, tenantId, tenantOptions, tenantName })
    })()
    return () => {
      alive = false
    }
  }, [navigate])

  if (!ctx) return null

  return (
    <InviteUserModule
      tenantId={ctx.tenantId}
      tenantName={ctx.tenantName}
      tenantOptions={ctx.tenantOptions}
      session={ctx.session}
      onClose={() => navigate(-1)}
      onSuccess={() => navigate('/hub/usuarios')}
    />
  )
}