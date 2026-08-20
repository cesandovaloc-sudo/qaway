create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  brand text not null,
  name text not null,
  format text not null,
  weight_g integer,
  description_short text not null default '',
  description text not null default '',
  price_cents integer,
  stock integer,
  availability text not null default 'available' check (availability in ('available', 'low', 'sold_out')),
  variety text,
  origin text,
  roast text,
  process text,
  tasting_notes text[] not null default '{}',
  methods text[] not null default '{}',
  moments text[] not null default '{}',
  image_url text,
  image_alt text,
  featured boolean not null default false,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  category text not null default 'Guías',
  body jsonb not null default '[]'::jsonb,
  reading_minutes integer not null default 4,
  featured boolean not null default false,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  district text not null,
  address text not null,
  promotion_choice text not null check (promotion_choice in ('discount', 'delivery')),
  payment_method text not null default 'coordinate',
  notes text,
  status text not null default 'pending_confirmation',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.blog_posts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public products are readable" on public.products;
create policy "Public products are readable" on public.products for select using (active = true);
drop policy if exists "Published posts are readable" on public.blog_posts;
create policy "Published posts are readable" on public.blog_posts for select using (published = true);

-- Orders are inserted only by the server route with SUPABASE_SERVICE_ROLE_KEY.
