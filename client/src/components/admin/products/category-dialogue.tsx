import { useState } from "react";
import type { Category } from "../../../feature/admin/products/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Pencil, SaveAll, Tag } from "lucide-react";
import {
  createAdminCategory,
  updateAdminBody,
} from "../../../feature/admin/products/api";

const dialogContentClass = "sm:max-w-xl";

const contentWrap = "space-y-4";

const formRow = "flex gap-3";

const categoriesList = "space-y-2";

const categoryRow =
  "flex items-center justify-between rounded-xl border border-border bg-card px-3 py-3";

const categoryInfo = "flex items-center gap-2";

const categoryIcon = "h-4 w-4 text-muted-foreground";

const categoryName = "text-sm font-medium text-foreground";

const emptyStateClass =
  "rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground";

const editButtonClass = "h-4 w-4";

type categoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSaved: () => Promise<void>;
};

export function CategoryDialogue({
  open,
  categories,
  onOpenChange,
  onSaved,
}: categoryDialogProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  async function handleSave() {
    if (!name.trim()) return;
    try {
      setSaving(true);

      if (editingCategory) {
        await updateAdminBody(editingCategory._id, { name: name.trim() });
      } else {
        await createAdminCategory({ name: name.trim() });
      }

      setName("");
      setEditingCategory(null);
      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(getCurrentCategory: Category) {
    setEditingCategory(getCurrentCategory);
    setName(getCurrentCategory.name);
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setName("");
      setEditingCategory(null);
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={dialogContentClass}>
        <DialogHeader>
          <DialogTitle>Manage Category</DialogTitle>
        </DialogHeader>

        <div className={contentWrap}>
          <div className={formRow}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name you want to add"
            />
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {editingCategory ? "Update" : "Add"}
            </Button>
          </div>
          <Separator />
          <div className={categoriesList}>
            {categories.map((cate) => (
              <div key={cate._id} className={categoryRow}>
                <div className={categoryInfo}>
                  <Tag className={categoryIcon} />
                  <span className={categoryName}>{cate.name}</span>
                </div>
                <Button
                  type="button"
                  variant={"ghost"}
                  onClick={() => handleEdit(cate)}
                >
                  <Pencil className={editButtonClass} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
