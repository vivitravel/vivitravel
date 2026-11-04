export type Destination = {
  id: string;
  name: string;
  province: string;
  slug: string;
  photo_url: string | null;
  featured: boolean;
  sort_order: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
};

export type Tag = { id: string; name: string; slug: string };

export type PriceUnit = "night" | "person" | "trip" | "day" | "other";

export type ListingCardData = {
  id: string;
  slug: string;
  title: string;
  locality: string;
  province: string;
  price_from: number;
  price_unit: PriceUnit;
  featured: boolean;
  category: { name: string; slug: string } | null;
  destination: { name: string; slug: string } | null;
  cover: string | null;
};

export type ListingDetail = ListingCardData & {
  description: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  provider: {
    business_name: string;
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  media: { storage_path: string; alt_text: string | null }[];
  attributes: { label: string; value: unknown; icon: string | null }[];
};

export type SearchFilters = {
  q?: string;
  destino?: string;
  categoria?: string;
  tema?: string;
  min?: number;
  max?: number;
  orden?: "recomendados" | "precio_asc" | "precio_desc";
};
