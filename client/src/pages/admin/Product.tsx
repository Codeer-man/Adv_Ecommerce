import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import ProductToolbox from "../../components/admin/products/product-toolbox";
import useAdminProducts from "../../feature/admin/products/use-admin-product";
import { CategoryDialogue } from "../../components/admin/products/category-dialogue";
import ProductDialogue from "../../components/admin/products/product-dialogue";
import ProductTables from "../../components/admin/products/product-tables";

const pageWrap = "space-y-6 p-6";

const cardClass = "border-border bg-card shadow-sm";

const cardHeaderClass = "space-y-4";

const cardTitleClass = "text-xl";

const cardContentClass = "space-y-4";

export default function AdminProducts() {
  const {
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
    openEditProductDialogue,
  } = useAdminProducts();

  return (
    <div className={pageWrap}>
      <Card className={cardClass}>
        <CardHeader className={cardHeaderClass}>
          <CardTitle className={cardTitleClass}>
            Products{" "}
            <ProductToolbox
              search={search}
              onSearchChange={setSearch}
              onAddProduct={openCreateDialogue}
              onManageChange={() => setCategoryDialogueOpen(true)}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className={cardContentClass}>
          <ProductTables
            products={products}
            onEdit={openEditProductDialogue}
            loading={loading}
          />
        </CardContent>
      </Card>

      <CategoryDialogue
        open={categoryDialogueOpen}
        onOpenChange={setCategoryDialogueOpen}
        categories={categories}
        onSaved={refreshAll}
      />

      <ProductDialogue
        open={productDialogurOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeProductDialogue();
            return;
          }

          setProductDialogurOpen(true);
        }}
        product={editingProduct}
        categories={categories}
        onSaved={refreshAll}
      />
    </div>
  );
}
