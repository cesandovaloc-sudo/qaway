import type { Metadata } from "next";
import { BlogCard } from "@/components/BlogCard";
import { getPosts } from "@/lib/data";
export const metadata: Metadata = { title: "Guía de café" };
export default async function BlogPage() { const posts = await getPosts(); return <main><section className="page-hero"><div className="container"><span className="eyebrow">Blog</span><h1>Guía de café.</h1><p>Contenido práctico para elegir, conservar y preparar mejor el café, conectado con el catálogo de Mesa Selecta.</p></div></section><section className="section"><div className="container blog-grid">{posts.map((post) => <BlogCard key={post.id} post={post} />)}</div></section></main>; }
