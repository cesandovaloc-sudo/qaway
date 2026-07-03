import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mockUsers } from '@/data/internal'

const roleColors = {
  admin: 'bg-[#0d0f0d] text-white',
  instructor: 'bg-[#ff4b0b]/10 text-[#ff4b0b]',
  student: 'bg-[#0d0f0d]/6 text-[#0d0f0d]',
}

const roleLabels = {
  admin: 'Administrador',
  instructor: 'Instructor',
  student: 'Alumno',
}

export default function AdminPermissions() {
  const [users, setUsers] = useState(mockUsers)
  const [editingUserId, setEditingUserId] = useState(null)
  const [newRole, setNewRole] = useState('')

  const changeRole = (userId, role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    setEditingUserId(null)
  }

  return (
    <div>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <Link to="/admin" className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b] hover:opacity-70 transition-opacity">← Panel admin</Link>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold tracking-tight text-white">Roles y permisos</h1>
          <p className="mt-2 text-sm text-[#666860]">Administra los roles de cada usuario en la plataforma. Los cambios afectan lo que cada usuario puede ver y hacer.</p>
        </div>
      </section>

      <section className="py-section md:py-[80px] bg-[#f5f5f4] min-h-[50dvh]">
        <div className="section-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#0d0f0d]/10">
                  <th className="py-3 pr-4 font-semibold text-[#666860] uppercase tracking-wider">Usuario</th>
                  <th className="py-3 px-4 font-semibold text-[#666860] uppercase tracking-wider">Rol actual</th>
                  <th className="py-3 pl-4 font-semibold text-[#666860] uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.015 }}
                    className="border-b border-[#0d0f0d]/6 hover:bg-white/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 object-cover border border-[#0d0f0d]/10" />
                        <div>
                          <span className="font-semibold text-[#0d0f0d]">{user.name}</span>
                          <span className="block text-[10px] text-[#666860]">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {editingUserId === user.id ? (
                        <select value={newRole} onChange={e => setNewRole(e.target.value)}
                          className="px-2 py-1 border border-[#0d0f0d]/10 text-xs focus:outline-none focus:border-[#ff4b0b]">
                          <option value="student">Alumno</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Administrador</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${roleColors[user.role]}`}>
                          {roleLabels[user.role]}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pl-4">
                      {editingUserId === user.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => changeRole(user.id, newRole)}
                            className="px-2 py-1 text-[9px] font-semibold bg-[#ff4b0b] text-white hover:bg-[#e03e00] transition-all">Guardar</button>
                          <button onClick={() => setEditingUserId(null)}
                            className="px-2 py-1 text-[9px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d]/4 transition-all">Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingUserId(user.id); setNewRole(user.role) }}
                          className="px-2 py-1 text-[9px] font-semibold border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all">Cambiar rol</button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
