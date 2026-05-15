import { useCallback, useEffect, useState } from "react";
import type { Category, Product } from "./types";
import { getAdminCategories, getAdminProducts } from "./api";

export default function useAdminProducts() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryDialogueOpen, setCategoryDialogueOpen] = useState(false);
  const [productDialogurOpen, setProductDialogurOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadCategories = useCallback(async () => {
    const data = await getAdminCategories();
    setCategories(data ?? []);
  }, []);

  const loadProducts = useCallback(async (searchValue = "") => {
    setLoading(true);
    try {
      const data = await getAdminProducts(searchValue);
      setProducts(data ?? []);
    } catch (error) {
      console.log("product fetching failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, loadProducts]);

  function openCreateDialogue() {
    setEditingProduct(null);
    setProductDialogurOpen(true);
  }

  function closeProductDialogue() {
    setProductDialogurOpen(false);
    setEditingProduct(null);
  }

  const refreshAll = useCallback(async () => {
    await Promise.all([loadCategories(), loadProducts()]);
  }, [search, loadCategories, loadProducts]);

  return {
    search,
    setSearch,
    products,
    categories,
    loading,
    refreshAll,
    categoryDialogueOpen,
    setCategoryDialogueOpen,
    productDialogurOpen,
    setProductDialogurOpen,
    editingProduct,
    openCreateDialogue,
    closeProductDialogue,
  };
}
