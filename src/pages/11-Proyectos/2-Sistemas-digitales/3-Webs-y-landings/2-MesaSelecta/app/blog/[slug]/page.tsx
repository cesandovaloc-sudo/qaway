import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/data";
import { formatDate } from "@/lib/format";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const post = await getPostBySlug((await params).slug); return { title: post?.title ?? "Artículo", description: post?.excerpt }; }
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) { const post = await getPostBySlug((await params).slug); if (!post) notFound(); return <main><section className="section"><article className="container article"><div className="breadcrumb"><Link href="/blog">Guía de café</Link> / {post.category}</div><span className="eyebrow">{post.category}</span><h1>{post.title}</h1><div className="article-meta">{formatDate(post.publishedAt)} · {post.readingMinutes} minutos de lectura</div><div className="article-body">{post.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><Link className="button button-primary" href="/catalogo">Explorar el catálogo</Link></article></section></main>; }
