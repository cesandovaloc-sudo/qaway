import Link from "next/link";
import { getPosts, getProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";

export default async function Home() {
  const [products, posts] = await Promise.all([getProducts(), getPosts()]);
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Selección de café</span>
            <h1>Café seleccionado para cada momento.</h1>
            <p>Explora cafés molidos, en grano y presentaciones especiales. Elige según cómo lo preparas, el momento en que lo disfrutas o el detalle que quieres regalar.</p>
            <div className="hero-actions"><Link className="button button-primary" href="/catalogo">Ver catálogo</Link><Link className="button button-secondary" href="/como-elegir">Ayúdame a elegir</Link></div>
          </div>
          <div className="hero-visual" aria-label="Selección de empaques de café">
            <div className="hero-packs"><div className="pack"><span className="pack-brand">El Colono</span><span className="pack-kind">Molido</span></div><div className="pack"><span className="pack-brand">Mesa Selecta</span><span className="pack-kind">Selección</span></div><div className="pack"><span className="pack-brand">Kiénti</span><span className="pack-kind">Variedad</span></div></div>
            <span className="hero-note">Catálogo actual · 5 productos</span>
          </div>
        </div>
      </section>
      <section className="benefit-bar"><div className="container benefit-inner"><span className="benefit-label">Beneficios</span><span className="benefit-text">Elige descuento por volumen o beneficio de delivery.</span><span className="benefit-rule">No acumulables</span></div></section>
      <section className="section">
        <div className="container">
          <div className="heading-row"><div><span className="eyebrow">Catálogo actual</span><h2 className="section-title">Una selección clara.</h2></div><Link className="text-link" href="/catalogo">Ver todos los productos →</Link></div>
          <div className="product-grid">{products.filter((product) => product.featured).slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>
      <section className="section-compact">
        <div className="container">
          <span className="eyebrow">Elige según tu necesidad</span><h2 className="section-title">¿Para qué momento?</h2>
          <div className="moments">
            {[["01", "Todos los días", "Café práctico y equilibrado para casa u oficina."], ["02", "Para regalar", "Presentaciones especiales con una mejor percepción de detalle."], ["03", "Moler al momento", "Mayor control para ajustar la molienda a tu método."], ["04", "Explorar variedades", "Opciones Typica y Catimor para comparar nuevas propuestas."]].map(([number, title, copy]) => <Link href="/catalogo" className="moment" key={title}><span className="moment-index">{number}</span><div><h3>{title}</h3><p>{copy}</p></div></Link>)}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="heading-row"><div><span className="eyebrow">Guía de café</span><h2 className="section-title">Elegir y preparar mejor.</h2></div><Link className="text-link" href="/blog">Ver todos los artículos →</Link></div>
          <div className="editorial-grid">
            <article className="feature-story"><span className="eyebrow">{posts[0].category}</span><h3>{posts[0].title}</h3><p>{posts[0].excerpt}</p><Link className="button button-secondary" href={`/blog/${posts[0].slug}`} style={{ color: "white", borderColor: "white", alignSelf: "start" }}>Leer guía</Link></article>
            <div className="story-list">{posts.slice(1, 3).map((post) => <article className="story-card" key={post.id}><span className="eyebrow">{post.category} · {post.readingMinutes} min</span><div><h3>{post.title}</h3><p>{post.excerpt}</p></div><Link className="text-link" href={`/blog/${post.slug}`}>Leer artículo →</Link></article>)}</div>
          </div>
        </div>
      </section>
      <section className="social-strip"><div className="container social-inner"><div className="social-copy"><h2>También en Instagram</h2><p>Nuevos productos, formas de preparación y recomendaciones de Mesa Selecta.</p></div><a className="button button-red" href="https://instagram.com/mesa_selecta" target="_blank" rel="noreferrer">Seguir @mesa_selecta</a></div></section>
    </main>
  );
}
