import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Category } from "../../admin/products/types";
import type {
  CustomerProduct,
  GetCustomerProductsParams,
  ProductSort,
} from "./types";
import type {
  ActiveFilterBadge,
  CustomerProductFilters,
  FacetKey,
} from "./product-list";
import { getCustomerCategory, getCustomerProduct } from "./api";

export function useCustomerProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<CustomerProduct[]>([]);

  const filter = useMemo<CustomerProductFilters>(
    () => ({
      category: searchParams.get("category") || "",
      brand: searchParams.get("brand") || "",
      size: searchParams.get("sizes") || "",
      color: searchParams.get("colors") || "",
    }),
    [searchParams],
  );

  const sort = (searchParams.get("sort") as ProductSort) || "recent";

  const query = useMemo<GetCustomerProductsParams>(
    () => ({
      brand: filter.brand || undefined,
      category: filter.category || undefined,
      color: filter.category || undefined,
      size: filter.size || undefined,
      sort,
    }),
    [sort, filter],
  );

  const hasActiveFilter = Boolean(
    filter.brand || filter.category || filter.color || filter.size,
  );

  const changeSort = useCallback(
    (value: ProductSort) => {
      const newValue = new URLSearchParams();

      if (value === "recent") {
        newValue.delete("sort");
      } else {
        newValue.set("sort", value);
      }

      setSearchParams(newValue);
    },
    [searchParams],
  );

  const activeFilterBadges = useMemo<ActiveFilterBadge[]>(() => {
    const items: ActiveFilterBadge[] = [];

    if (filter.category) {
      const found = categories.find((item) => item._id === filter.category);

      items.push({
        key: "category",
        label: "category",
        value: found?.name || filter.category,
      });
    }

    if (filter.brand) {
      items.push({
        key: "brand",
        label: "brand",
        value: filter.brand,
      });
    }

    if (filter.color) {
      items.push({
        key: "color",
        label: "Color",
        value: filter.color,
      });
    }

    if (filter.size) {
      items.push({
        key: "size",
        label: "Size",
        value: filter.size,
      });
    }

    return items;
  }, [filter, categories]);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await getCustomerCategory();
      setCategories(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function loadProduct(params?: GetCustomerProductsParams) {
    try {
      const data = await getCustomerProduct(params);
      setProducts(data ?? []);
    } catch (error) {
      setProducts([]);
    }
  }

  const availableColors = useMemo(() => {
    const uniqueColor = new Set<string>();

    products.forEach((item) => {
      item.colors.forEach((color) => uniqueColor.add(color));
    });

    return Array.from(uniqueColor).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const toggleFacet = (key: FacetKey, value: string) => {
    const nextUrl = new URLSearchParams(searchParams);
    const currentValue = searchParams.get(key) || "";

    if (currentValue === value) {
      nextUrl.delete(key);
    } else {
      nextUrl.set(key, value);
    }

    setSearchParams(nextUrl);
  };

  function clearFilters() {
    const nextValue = new URLSearchParams();
    nextValue.delete("category");
    nextValue.delete("brand");
    nextValue.delete("size");
    nextValue.delete("color");

    setSearchParams(nextValue);
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    void loadProduct(query);
  }, [query]);

  return {
    categories,
    products,
    filter,
    sort,
    hasActiveFilter,
    changeSort,
    loading,
    activeFilterBadges,
    availableColors,
    toggleFacet,
    clearFilters,
  };
}
