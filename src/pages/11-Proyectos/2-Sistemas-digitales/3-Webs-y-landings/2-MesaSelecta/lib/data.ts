import { createClient } from "@supabase/supabase-js";
import { posts as fallbackPosts, products as fallbackProducts } from "./fallback-data";
import type { BlogPost, Product } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function publicClient() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

function mapProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    brand: String(row.brand),
    name: String(row.name),
    format: String(row.format),
    weightG: row.weight_g == null ? null : Number(row.weight_g),
    descriptionShort: String(row.description_short ?? ""),
    description: String(row.description ?? ""),
    priceCents: row.price_cents == null ? null : Number(row.price_cents),
    stock: row.stock == null ? null : Number(row.stock),
    availability: (row.availability as Product["availability"]) ?? "available",
    variety: row.variety == null ? null : String(row.variety),
    origin: row.origin == null ? null : String(row.origin),
    roast: row.roast == null ? null : String(row.roast),
    process: row.process == null ? null : String(row.process),
    tastingNotes: Array.isArray(row.tasting_notes) ? row.tasting_notes.map(String) : [],
    methods: Array.isArray(row.methods) ? row.methods.map(String) : [],
    moments: Array.isArray(row.moments) ? row.moments.map(String) : [],
    featured: Boolean(row.featured),
    imageUrl: row.image_url == null ? null : String(row.image_url),
    imageAlt: row.image_alt == null ? null : String(row.image_alt),
  };
}

function mapPost(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? ""),
    category: String(row.category ?? "Guías"),
    publishedAt: String(row.published_at),
    readingMinutes: Number(row.reading_minutes ?? 4),
    body: Array.isArray(row.body) ? row.body.map(String) : [],
    featured: Boolean(row.featured),
  };
}

export async function getProducts(): Promise<Product[]> {
  const client = publicClient();
  if (!client) return fallbackProducts;
  const { data, error } = await client.from("products").select("*").eq("active", true).order("display_order");
  if (error || !data?.length) return fallbackProducts;
  return data.map((row) => mapProduct(row));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((product) => product.slug === slug) ?? null;
}

export async function getPosts(): Promise<BlogPost[]> {
  const client = publicClient();
  if (!client) return fallbackPosts;
  const { data, error } = await client.from("blog_posts").select("*").eq("published", true).order("published_at", { ascending: false });
  if (error || !data?.length) return fallbackPosts;
  return data.map((row) => mapPost(row));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const all = await getPosts();
  return all.find((post) => post.slug === slug) ?? null;
}
