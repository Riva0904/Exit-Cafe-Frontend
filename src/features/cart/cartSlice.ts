import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ProductListItem } from '@/types/catalog';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

function loadInitialCart(): CartItem[] {
  const raw = localStorage.getItem('exitcaff_cart');
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function persist(items: CartItem[]) {
  localStorage.setItem('exitcaff_cart', JSON.stringify(items));
}

const initialState: CartState = { items: loadInitialCart() };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: ProductListItem; quantity?: number }>) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.productId === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({
          productId: product.id,
          name: product.name,
          slug: product.slug,
          imageUrl: product.primaryImageUrl,
          unitPrice: product.discountPrice ?? product.price,
          quantity,
        });
      }
      persist(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      persist(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
        persist(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
