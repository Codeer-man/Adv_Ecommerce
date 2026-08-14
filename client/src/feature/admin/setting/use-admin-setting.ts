import { useEffect, useState } from "react";
import type { AdminBanner } from "./type";
import { getAdminBanner, uploadAdminBanner } from "./api";

export function useAdminSetting() {
  const [items, setItems] = useState<AdminBanner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  async function RefreshAlll() {
    try {
      setIsLoading(true);
      const response = await getAdminBanner();
      setItems(response.items ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void RefreshAlll();
  }, [items.length]);

  async function handleUpload() {
    try {
      if (!files.length) return;
      setUploading(true);

      const formmData = new FormData();

      files.forEach((file) => formmData.append("images", file));
      const response = await uploadAdminBanner(formmData);
      setItems(response.items ?? []);
      setFiles([]);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  return {
    items,
    isLoading,
    uploading,
    files,
    setFiles,
    handleUpload,
    RefreshAlll,
  };
}
