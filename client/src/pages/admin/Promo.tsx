import PromoDialogue from "../../components/admin/promo/promo-dialogue";
import PromoTable from "../../components/admin/promo/promo-table";
import PromoToolbar from "../../components/admin/promo/promo-toolbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAdminPromo } from "../../feature/admin/promo/use-admin";

const pageWrapClass = "space-y-6 p-6";

const cardClass = "border-border bg-card shadow-sm";

const cardHeaderClass = "space-y-4";

const cardTitleClass = "text-xl";

const cardContentClass = "space-y-4";

const errorClass =
  "rounded-none border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive";

export default function AdminPromo() {
  const {
    closePromoDialogue,
    deletePromoId,
    editingPromo,
    loading,
    openCreateDialogue,
    openEditPromoDialogue,
    promoDialoguOpen,
    promos,
    refreshAll,
    removePromo,
    savePromo,
    saving,
    search,
    setPromoDialoguOpen,
    setSearch,
  } = useAdminPromo();

  return (
    <div className={pageWrapClass}>
      <Card className={cardClass}>
        <CardHeader className={cardHeaderClass}>
          <CardTitle className={cardTitleClass}>Promos</CardTitle>
          <PromoToolbar
            search={search}
            onSearchChange={setSearch}
            onAddPromo={openCreateDialogue}
          />
        </CardHeader>
        <CardContent>
          <PromoTable
            promos={promos}
            loading={loading}
            deletingPromoId={deletePromoId}
            onEdit={openEditPromoDialogue}
            onDelete={removePromo}
          />
        </CardContent>
      </Card>
      <PromoDialogue
        open={promoDialoguOpen}
        onOpenChange={(open) => {
          if (!open) {
            closePromoDialogue();
            return;
          }

          setPromoDialoguOpen(true);
        }}
        saving={saving}
        onSaved={savePromo}
        promo={editingPromo}
      />
    </div>
  );
}
