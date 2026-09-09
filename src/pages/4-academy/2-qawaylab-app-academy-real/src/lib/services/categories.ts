import { supabase } from '@/lib/supabase'
import type { Category } from '@/lib/types'

export async function getCategories({ activeOnly = false } = {}): Promise<Category[]> {
  let query = supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (activeOnly) query = query.eq('is_active', true)

  const { data, error } = await query
  if (error) throw error
  return (data as Category[]) || []
}

export async function getCategory(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return (data as Category) || null
}

export async function createCategory({
  name,
  slug,
  description = '',
  sort_order = 0,
}: {
  name: string
  slug: string
  description?: string
  sort_order?: number
}): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug, description, sort_order })
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}
