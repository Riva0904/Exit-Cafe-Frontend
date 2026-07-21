export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  parentCategoryId?: string;
  productCount: number;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  primaryImageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isTodaysSpecial: boolean;
  averageRating: number;
  reviewCount: number;
  stockQuantity: number;
  categoryName: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  sku: string;
  price: number;
  discountPrice?: number;
  ingredients?: string;
  nutritionInfo?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isTodaysSpecial: boolean;
  averageRating: number;
  reviewCount: number;
  stockQuantity: number;
  categoryId: string;
  categoryName: string;
  images: ProductImage[];
  relatedProducts: ProductListItem[];
}

export interface ProductQueryParams {
  categoryId?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isTodaysSpecial?: boolean;
  isAvailable?: boolean;
  sortBy?: 'price' | 'rating' | 'name';
  sortDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
