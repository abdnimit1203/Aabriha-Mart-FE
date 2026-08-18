export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Variant {
  _id: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  discountPrice?: number;
  stock: number;
  weightGrams?: number;
  images: ProductImage[];
  status: "active" | "inactive";
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: Category | string;
  description?: string;
  images: ProductImage[];
  weightGrams: number;
  attributeNames: string[];
  variants: Variant[];
  price?: number;
  discountPrice?: number;
  stock?: number;
  status: "active" | "inactive";
  ratingAverage: number;
  ratingCount: number;
}
