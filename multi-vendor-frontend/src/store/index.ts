import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

// Subscribe to store changes to save cart to localStorage
store.subscribe(() => {
  const { cart } = store.getState();
  localStorage.setItem('qb_cart', JSON.stringify(cart.items));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
