import { useState } from 'react'
import { Users, Plus, Search, Loader2, AlertCircle } from 'lucide-react'
import { useCustomers } from '@/hooks/useCustomers'
import { CustomerCard } from '@/components/customers/CustomerCard'
import { CustomerForm } from '@/components/customers/CustomerForm'
import type { Customer } from '@/types'

export default function CustomersPage() {
  const { customers, loading, error, pagination, setPage, createCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const filteredCustomers = customers.filter(customer => {
    const term = searchTerm.toLowerCase()
    return (
      customer.name.toLowerCase().includes(term) ||
      (customer.company && customer.company.toLowerCase().includes(term)) ||
      (customer.email && customer.email.toLowerCase().includes(term)) ||
      (customer.doc_number && customer.doc_number.toLowerCase().includes(term))
    )
  })

  const handleCreate = async (data: Omit<Customer, 'id' | 'created_at'>) => {
    await createCustomer(data)
    setShowForm(false)
  }

  const handleUpdate = async (data: Omit<Customer, 'id' | 'created_at'>) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, data)
      setEditingCustomer(null)
    }
  }

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`¿Eliminar al cliente "${customer.name}"?`)) {
      await deleteCustomer(customer.id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">Gestiona tu cartera de clientes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, empresa, email o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hay clientes</h3>
          <p className="text-sm text-gray-500 mb-4">
            Agrega tu primer cliente para comenzar a crear cotizaciones
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Agregar cliente
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(customer => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onEdit={(c) => setEditingCustomer(c)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Mostrando {filteredCustomers.length} de {pagination.total} clientes
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  {pagination.page} / {pagination.total_pages}
                </span>
                <button
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Forms */}
      {showForm && (
        <CustomerForm
          onSave={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingCustomer && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleUpdate}
          onClose={() => setEditingCustomer(null)}
        />
      )}
    </div>
  )
}
