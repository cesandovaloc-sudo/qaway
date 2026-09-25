const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qrusdsqgygfolxfrafyd.supabase.co';
const supabaseAnonKey = 'sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exportSupabaseData() {
  console.log('🔄 Conectando a Supabase para descargar base de datos de empresas...');

  try {
    // 1. Obtener todas las empresas (tenants)
    const { data: tenants, error: tenantsErr } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (tenantsErr) throw tenantsErr;

    console.log(`✅ Se encontraron ${tenants.length} empresas en public.tenants.`);

    // 2. Obtener todos los usuarios vinculados
    let users = [];
    try {
      const { data: usersData, error: usersErr } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (!usersErr && usersData) users = usersData;
    } catch (e) {
      console.warn('⚠️ No se pudo consultar public.users:', e.message);
    }

    console.log(`✅ Se encontraron ${users.length} usuarios en public.users.`);

    // Mapear usuarios por tenant_id
    const usersByTenant = {};
    users.forEach((u) => {
      if (!u.tenant_id) return;
      if (!usersByTenant[u.tenant_id]) usersByTenant[u.tenant_id] = [];
      usersByTenant[u.tenant_id].push(u);
    });

    // 3. Formatear Hoja 1: Empresas
    const tenantRows = tenants.map((row, idx) => {
      const tenantUsers = usersByTenant[row.id] || [];
      const adminUser = tenantUsers.find((u) => u.role === 'admin') || tenantUsers[0];
      const ownerName = adminUser ? (adminUser.full_name || adminUser.email) : 'Sin asignar';

      return {
        'N°': idx + 1,
        'UUID Tenant': row.id,
        'Nombre de la Empresa': row.name || '—',
        'Slug / Código': row.slug || row.client_code || '—',
        'Titular / Administrador': ownerName,
        'Sector / Industria': row.industry || row.sector || 'General',
        'Plan Contratado': row.plan || row.plan_name || 'Básico',
        'Estado': row.status || row.state || 'active',
        'Usuarios Registrados': tenantUsers.length || 1,
        'Fecha de Creación': row.created_at ? new Date(row.created_at).toLocaleString('es-PE') : '—',
      };
    });

    // 4. Formatear Hoja 2: Usuarios por Empresa
    const userRows = users.map((u, idx) => {
      const parentTenant = tenants.find((t) => t.id === u.tenant_id);
      return {
        'N°': idx + 1,
        'UUID Usuario': u.id,
        'Nombre Completo': u.full_name || '—',
        'Correo Electrónico': u.email || '—',
        'Rol': u.role || 'user',
        'Empresa Vinculada': parentTenant ? parentTenant.name : (u.tenant_id || 'Sin empresa'),
        'UUID Tenant': u.tenant_id || '—',
        'Fecha Registro': u.created_at ? new Date(u.created_at).toLocaleString('es-PE') : '—',
      };
    });

    // 5. Generar Libro de Excel con SheetJS
    const workbook = XLSX.utils.book_new();

    const sheetTenants = XLSX.utils.json_to_sheet(tenantRows);
    sheetTenants['!cols'] = [
      { wch: 5 }, { wch: 38 }, { wch: 30 }, { wch: 20 },
      { wch: 28 }, { wch: 20 }, { wch: 16 }, { wch: 12 },
      { wch: 18 }, { wch: 22 }
    ];
    XLSX.utils.book_append_sheet(workbook, sheetTenants, 'Empresas (Tenants)');

    if (userRows.length > 0) {
      const sheetUsers = XLSX.utils.json_to_sheet(userRows);
      sheetUsers['!cols'] = [
        { wch: 5 }, { wch: 38 }, { wch: 28 }, { wch: 30 },
        { wch: 14 }, { wch: 28 }, { wch: 38 }, { wch: 22 }
      ];
      XLSX.utils.book_append_sheet(workbook, sheetUsers, 'Usuarios');
    }

    // 6. Guardar archivos Excel y JSON en la raíz del proyecto
    const outputPathXlsx = path.join(process.cwd(), 'descarga_empresas_supabase.xlsx');
    const outputPathJson = path.join(process.cwd(), 'descarga_empresas_supabase.json');

    XLSX.writeFile(workbook, outputPathXlsx);
    fs.writeFileSync(outputPathJson, JSON.stringify({ tenants, users }, null, 2), 'utf-8');

    console.log(`🎉 ARCHIVOS GENERADOS EXITOSAMENTE:`);
    console.log(`   📄 Excel: ${outputPathXlsx}`);
    console.log(`   📦 JSON: ${outputPathJson}`);

  } catch (err) {
    console.error('❌ Error al exportar datos de Supabase:', err);
  }
}

exportSupabaseData();
