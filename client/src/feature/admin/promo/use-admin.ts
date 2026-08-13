import { useEffect, useMemo, useState } from "react";
import type { Promo, PromoFormValues } from "./types";
import {
  createAdminPromoCodes,
  deleteAdminPromoCodes,
  getAdminPromoCodes,
  updateAdminPromoCodes,
} from "./api";

export function useAdminPromo() {
  const [promos, setPromo] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoDialoguOpen, setPromoDialoguOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [deletePromoId, setDeletePromoId] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function refreshAll() {
    try {
      setLoading(true);
      const response = await getAdminPromoCodes();

      setPromo((response ?? { items: [] }).items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
  }, []);

  const filterPromo = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return promos;

    return promos.filter((promo) => promo.code.toLowerCase().includes(query));
  }, [promos, search]);

  function openCreateDialogue() {
    setEditingPromo(null);
    setPromoDialoguOpen(true);
  }

  function closePromoDialogue() {
    setEditingPromo(null);
    setPromoDialoguOpen(false);
  }

  function openEditPromoDialogue(promo: Promo) {
    setEditingPromo(promo);
    setPromoDialoguOpen(true);
  }

  async function savePromo(values: PromoFormValues) {
    try {
      setSaving(true);

      const response = editingPromo
        ? await updateAdminPromoCodes(editingPromo._id, values)
        : await createAdminPromoCodes(values);

      setPromo((response ?? { item: [] }).items);
      closePromoDialogue();
    } finally {
      setSaving(false);
    }
  }

  async function removePromo(promoId: string) {
    const confirm = window.confirm("Are you sure you want to delete");

    if (!confirm) return;

    try {
      setDeletePromoId(promoId);
      console.log(deletePromoId, "promoi if");

      const response = await deleteAdminPromoCodes(promoId);

      setPromo((response ?? { item: [] }).items);
    } finally {
      setDeletePromoId("");
    }
  }

  return {
    search,
    setSearch,
    promos: filterPromo,
    loading,
    promoDialoguOpen,
    setPromoDialoguOpen,
    editingPromo,
    openCreateDialogue,
    closePromoDialogue,
    refreshAll,
    saving,
    deletePromoId,
    openEditPromoDialogue,
    savePromo,
    removePromo,
  };
}
