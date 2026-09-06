import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')
const publicDir = path.resolve(rootDir, 'public')
const indexHtmlPath = path.resolve(distDir, 'index.html')

// Helper para leer .env si no están en process.env
function getEnv(key, fallback = '') {
  if (process.env[key]) return process.env[key]
  try {
    const envPath = path.resolve(rootDir, '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const match = content.match(new RegExp(`^${key}=(.*)$`, 'm'))
      if (match) return match[1].trim().replace(/^["']|["']$/g, '')
    }
  } catch (e) {}
  return fallback
}

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://qrusdsqgygfolxfrafyd.supabase.co')
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', 'sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi')

function cleanText(text = '') {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/"/g, '&quot;')
    .trim()
}

function resolveArticleImage(imgUrl = '', slug = 'default') {
  if (!imgUrl) return 'https://www.qawaylab.com/assets/logo/logo-primary.png'

  // Si la imagen está en Base64 (data:image/...), guardarla como archivo físico para que Facebook la pueda descargar
  if (imgUrl.startsWith('data:image/')) {
    try {
      const matches = imgUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/)
      if (matches) {
        let ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
        if (ext.includes('+')) ext = 'png'
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')

        const fileName = `${slug}.${ext}`
        const distCoversDir = path.resolve(distDir, 'assets', 'blog-covers')
        const publicCoversDir = path.resolve(publicDir, 'assets', 'blog-covers')

        fs.mkdirSync(distCoversDir, { recursive: true })
        fs.mkdirSync(publicCoversDir, { recursive: true })

        fs.writeFileSync(path.resolve(distCoversDir, fileName), buffer)
        fs.writeFileSync(path.resolve(publicCoversDir, fileName), buffer)

        return `https://www.qawaylab.com/assets/blog-covers/${fileName}`
      }
    } catch (err) {
      console.warn('[Prerender] Error guardando imagen base64:', err.message)
    }
  }

  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) return imgUrl
  if (imgUrl.startsWith('/')) return `https://www.qawaylab.com${imgUrl}`
  return `https://www.qawaylab.com/${imgUrl}`
}

function generateArticleHtml(templateHtml, article) {
  const slug = article.slug || article.id
  const title = cleanText(article.title || 'Artículo de Blog')
  const description = cleanText(article.excerpt || article.description || 'Lee el artículo completo en Qaway Lab Blog.').slice(0, 180)
  const imageUrl = resolveArticleImage(article.cover_url || article.image || article.cover_image, slug)
  const articleUrl = `https://www.qawaylab.com/blog/articulo/${slug}`
  const publishedTime = article.published_at || article.created_at || new Date().toISOString()

  let html = templateHtml

  // Reemplazar <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title} | Blog Qaway Lab</title>`)

  // Eliminar cualquier meta og/twitter preexistente para inyectar los frescos del artículo
  html = html.replace(/<meta\s+property="og:[^>]+>/gi, '')
  html = html.replace(/<meta\s+name="twitter:[^>]+>/gi, '')
  html = html.replace(/<meta\s+name="description"[^>]+>/gi, '')

  const metaTags = `
    <meta name="description" content="${description}" />
    <!-- Open Graph / Facebook / LinkedIn / WhatsApp -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Qaway Lab" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:secure_url" content="${imageUrl}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="article:published_time" content="${publishedTime}" />
    <meta property="article:author" content="Qaway Lab" />
    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${articleUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <link rel="canonical" href="${articleUrl}" />
  `

  html = html.replace('</head>', `${metaTags}\n  </head>`)
  return html
}

async function prerender() {
  if (!fs.existsSync(indexHtmlPath)) {
    console.warn('[Prerender] dist/index.html no encontrado. Ejecuta vite build primero.')
    return
  }

  const templateHtml = fs.readFileSync(indexHtmlPath, 'utf8')
  const articlesMap = new Map()

  // 1. Cargar desde Supabase
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'publicado')

    if (!error && Array.isArray(posts)) {
      posts.forEach(p => {
        const key = p.slug || p.id
        if (key) articlesMap.set(key, p)
      })
    }

    const { data: blogArticles, error: bErr } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('public', true)

    if (!bErr && Array.isArray(blogArticles)) {
      blogArticles.forEach(p => {
        const key = p.slug || p.id
        if (key && !articlesMap.has(key)) articlesMap.set(key, p)
      })
    }
  } catch (err) {
    console.warn('[Prerender] Error consultando Supabase:', err.message)
  }

  // 2. Artículos estáticos base de BlogPage.jsx como respaldo
  const fallbackArticles = [
    {
      id: 'google-calendar-dominado-guia-productividad',
      title: 'Google Calendar Dominado: guia para ordenar tu semana con IA',
      excerpt: 'Aprende a usar Google Calendar con metodo, bloques de tiempo, tareas y apoyo de IA para reducir friccion operativa.',
      image: 'https://www.qawaylab.com/assets/og-calendar.png',
    },
    {
      id: 'como-automatizar-facturacion-make-chatgpt',
      title: 'Cómo estructurar una facturación automática con Make y ChatGPT',
      excerpt: 'Automatiza la generación de facturas, almacenamiento de PDFs y envío por correo sin mover un solo dedo.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    },
    {
      id: 'guia-crm-notion-whatsapp',
      title: 'Guía paso a paso: CRM en Notion y envíos por WhatsApp',
      excerpt: 'Crea un embudo comercial conectado a WhatsApp para notificar a tu equipo sobre leads calificados al instante.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200',
    },
    {
      id: 'por-que-tu-negocio-necesita-adn-visual',
      title: 'Por qué tu negocio necesita un ADN visual único',
      excerpt: 'La coherencia de marca reduce el costo de adquisición de clientes y genera autoridad inmediata. Estrategia de marca moderna.',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=1200',
    },
    {
      id: 'agentes-autonomos-ia-productividad',
      title: 'Agentes autónomos de IA: El futuro de la productividad en 2026',
      excerpt: 'Los agentes ya no solo responden preguntas; ejecutan tareas operativas completas con criterio propio. Análisis de tendencias.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    },
    {
      id: 'sops-notion-organizar-procesos-delegar',
      title: 'SOPs en Notion: Cómo organizar procesos para delegar sin caos',
      excerpt: 'Convierte la memoria de tu equipo en un sistema documentado y automatizado para dejar de depender de supervisión constante.',
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200',
    },
    {
      id: 'automatizacion-contenidos-ia-coherencia',
      title: 'Automatización de contenidos con IA sin perder coherencia',
      excerpt: 'Una metodología clara para generar copys y programar posts manteniendo intacta la voz y valores de tu marca.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    },
    {
      id: 'habilidades-para-trabajar-con-ia',
      title: 'Habilidades clave para trabajar con IA [Guía Práctica]',
      excerpt: 'Descubre las competencias y criterio práctico necesarios para integrar herramientas de IA en tu flujo de trabajo diario.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    },
  ]

  fallbackArticles.forEach(art => {
    if (!articlesMap.has(art.id)) {
      articlesMap.set(art.id, art)
    }
  })

  // 3. Generar archivos index.html prerenderizados para cada artículo
  let count = 0
  for (const [slug, article] of articlesMap.entries()) {
    const articleHtml = generateArticleHtml(templateHtml, article)
    const targetDir = path.resolve(distDir, 'blog', 'articulo', slug)
    fs.mkdirSync(targetDir, { recursive: true })
    fs.writeFileSync(path.resolve(targetDir, 'index.html'), articleHtml, 'utf8')
    count++
  }

  console.log(`[Prerender] ✓ ${count} artículos prerenderizados con Open Graph para Facebook/WhatsApp/LinkedIn en dist/blog/articulo/`)
}

prerender()
