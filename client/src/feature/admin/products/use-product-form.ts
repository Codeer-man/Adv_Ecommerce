import { useEffect, useState } from "react";
import type { Product, ProductFormState, ProductImage } from "./types";
import { createAdminProduct, updateAdminProduct } from "./api";

type useProductFormOptions = {
  open: boolean;
  product: Product | null;
  onSaved: () => Promise<void>;
  onClose: () => void;
};

export function getCoverImage(image: ProductImage[] = []) {
  return image.find((img) => img.isCover) ?? image[0];
}

function getUpdateProductFormDetail(product: Product): ProductFormState {
  const coverImage = getCoverImage(product.images);

  return {
    title: product.title,
    description: product.description,
    category: product.category._id,
    brand: product.brand,
    colors: product.colors,
    sizes: product.sizes,
    salePercentage: String(product.salePercentage),
    status: product.status,
    stock: String(product.stock),
    existingImages: product.images ?? [],
    coverImagePublicId: coverImage?.publicId ?? "",
    newFiles: [],
    price: String(product.price),
  };
}

function getEmptyFormState(): ProductFormState {
  return {
    title: "",
    description: "",
    category: "",
    brand: "",
    colors: [],
    sizes: [],
    salePercentage: "",
    status: "active",
    stock: "",
    existingImages: [],
    coverImagePublicId: "",
    newFiles: [],
    price: "",
  };
}

export function useProductForm({
  open,
  product,
  onClose,
  onSaved,
}: useProductFormOptions) {
  const [form, setForm] = useState<ProductFormState>(getEmptyFormState);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setForm(product ? getUpdateProductFormDetail(product) : getEmptyFormState);
  }, [open, product]);

  function toggleSizes(size: string) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((item) => item !== size)
        : [...prev.sizes, size],
    }));
  }

  function addColor(color: string) {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors
        : [...prev.colors, color],
    }));
  }

  function removeColor(color: string) {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((item) => item !== color),
    }));
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return;

    setForm((prev) => ({
      ...prev,
      newFiles: [...prev.newFiles, ...Array.from(files)],
    }));
  }

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function submit() {
    if (!form.title.trim() || !form.description.trim() || !form.category.trim())
      return;

    try {
      setSaving(true);

      if (product) {
        await updateAdminProduct(
          product._id,
          {
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category.trim(),
            brand: form.brand,
            colors: form.colors,
            sizes: form.sizes,
            price: Number(form.price),
            salePercentage: Number(form.salePercentage),
            stock: Number(form.stock),
            status: form.status,
            existingImages: form.existingImages,
            coverImagePublicId: form.coverImagePublicId,
          },
          form.newFiles,
        );
      } else {
        await createAdminProduct(
          {
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category.trim(),
            brand: form.brand,
            colors: form.colors,
            sizes: form.sizes,
            price: Number(form.price),
            salePercentage: Number(form.salePercentage),
            stock: Number(form.stock),
            status: form.status,
          },
          form.newFiles,
        );
      }

      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function removeExistingImage(publicId: string) {
    setForm((prev) => {
      const nextImage = prev.existingImages.filter(
        (img) => img.publicId !== publicId,
      );

      const nextCoverImageId =
        prev.coverImagePublicId === publicId
          ? (nextImage[0].publicId ?? "")
          : prev.coverImagePublicId;

      return {
        ...prev,
        existingImages: nextImage,
        coverImagePublicId: nextCoverImageId,
      };
    });
  }

  function changeCoverImg(publicId: string) {
    updateField("coverImagePublicId", publicId);
  }
  console.log(form, "form");

  return {
    form,
    saving,
    isEditMode: !!product,
    toggleSizes,
    addColor,
    removeColor,
    addFiles,
    submit,
    updateField,
    changeCoverImg,
    removeExistingImage,
  };
}
