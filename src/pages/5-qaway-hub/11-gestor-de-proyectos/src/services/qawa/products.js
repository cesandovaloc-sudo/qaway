export function createProductsService(supabase) {
  return {
    async getProducts({ type, category, search, status = 'active' } = {}) {
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (type) query = query.eq('type', type)
      if (category) query = query.eq('category', category)
      if (search) query = query.ilike('title', `%${search}%`)

      const { data, error } = await query
      if (error) throw error
      return data
    },

    async getProduct(slug) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    async getProductById(id) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async getProductsByIds(ids) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', ids)

      if (error) throw error
      return data
    },

    async createProduct(data) {
      const { data: product, error } = await supabase
        .from('products')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return product
    },

    async updateProduct(id, data) {
      const { data: product, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return product
    },

    async deleteProduct(id) {
      const { error } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .eq('id', id)

      if (error) throw error
    },

    async reserveStock(id, quantity) {
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      if (product.stock < quantity) throw new Error('Stock insuficiente')

      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: product.stock - quantity })
        .eq('id', id)
        .gte('stock', quantity)

      if (updateError) throw new Error('Stock insuficiente')
    },

    async releaseStock(id, quantity) {
      const { error } = await supabase
        .from('products')
        .update({ stock: supabase.rpc('increment', { x: quantity }) })
        .eq('id', id)

      if (error) throw error
    },
  }
}
