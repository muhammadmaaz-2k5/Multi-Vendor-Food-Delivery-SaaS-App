import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  id: string; 
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  image?: string;
  modifiers: CartModifier[];
  totalPrice: number; 
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  cartTotal: number;
}

const loadState = (): CartState => {
  try {
    const serializedState = localStorage.getItem('qb_cart');
    if (serializedState === null) {
      return { items: [], totalItems: 0, cartTotal: 0 };
    }
    const items = JSON.parse(serializedState) as CartItem[];
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = items.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
    return { items, totalItems, cartTotal };
  } catch (err) {
    return { items: [], totalItems: 0, cartTotal: 0 };
  }
};

const initialState: CartState = loadState();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existing = state.items.find(i => i.id === newItem.id);
      
      if (existing) {
        existing.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      
      state.totalItems += newItem.quantity;
      state.cartTotal += (newItem.totalPrice * newItem.quantity);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const existing = state.items.find(i => i.id === id);
      if (existing) {
        state.totalItems -= existing.quantity;
        state.cartTotal -= (existing.totalPrice * existing.quantity);
        state.items = state.items.filter(i => i.id !== id);
      }
    },
    updateQuantity: (state, action: PayloadAction<{id: string, quantity: number}>) => {
      const { id, quantity } = action.payload;
      const existing = state.items.find(i => i.id === id);
      
      if (existing) {
        if (quantity <= 0) {
          state.totalItems -= existing.quantity;
          state.cartTotal -= (existing.totalPrice * existing.quantity);
          state.items = state.items.filter(i => i.id !== id);
        } else {
          const diff = quantity - existing.quantity;
          existing.quantity = quantity;
          state.totalItems += diff;
          state.cartTotal += (existing.totalPrice * diff);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.cartTotal = 0;
    }
  }
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
