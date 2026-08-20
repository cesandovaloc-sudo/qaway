export type Product = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  format: string;
  weightG: number | null;
  descriptionShort: string;
  description: string;
  priceCents: number | null;
  stock: number | null;
  availability: "available" | "low" | "sold_out";
  variety: string | null;
  origin: string | null;
  roast: string | null;
  process: string | null;
  tastingNotes: string[];
  methods: string[];
  moments: string[];
  featured: boolean;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingMinutes: number;
  body: string[];
  featured: boolean;
};

export type CartItem = { product: Product; quantity: number };
