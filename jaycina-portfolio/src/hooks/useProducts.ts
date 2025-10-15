import { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  category: string;
  priceInr: string;
  priceGbp: string;
  short: string;
  description?: string;
  materials: string[];
  images: string[];
  isActive: boolean;
}


export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load products'))))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        setError(err.message);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      const foundProduct = fallbackProducts.find(p => p.id === id);
      setProduct(foundProduct || null);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  return { product, loading, error };
}
