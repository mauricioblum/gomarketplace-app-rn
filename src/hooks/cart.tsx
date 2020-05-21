import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storedProducts = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (storedProducts) {
        setProducts([...JSON.parse(storedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(product => product.id === id);
      const incrementedProducts = products;

      if (productIndex >= 0) {
        incrementedProducts[productIndex].quantity += 1;
      }

      setProducts([...incrementedProducts]);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(incrementedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(product => product.id === id);
      const decrementedProducts = products;

      if (productIndex >= 0 && decrementedProducts[productIndex].quantity > 1) {
        decrementedProducts[productIndex].quantity -= 1;
      }

      setProducts([...decrementedProducts]);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(decrementedProducts),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productExists = products.findIndex(newProduct => {
        return newProduct.id === product.id;
      });

      if (productExists === -1) {
        const newProducts = [...products, { ...product, quantity: 1 }];
        setProducts([...newProducts]);
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(newProducts),
        );
      } else {
        increment(product.id);
      }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
