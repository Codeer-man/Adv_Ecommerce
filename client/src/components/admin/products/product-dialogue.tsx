import { BRANDS } from "../../../feature/admin/products/constant";
import type {
  Category,
  Product,
  ProductStatus,
} from "../../../feature/admin/products/types";
import { useProductForm } from "../../../feature/admin/products/use-product-form";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { ColorPicker } from "./color-picker";
import ImagePicker from "./image-picker";
import { SizeSelector } from "./size-selector";

type productDialogueProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  onSaved: () => Promise<void>;
};

const dialogContentClass = "max-h-[92vh] overflow-y-auto sm:max-w-4xl";

const contentWrapClass = "grid gap-6";

const twoColumnGridClass = "grid gap-4 md:grid-cols-2";

const threeColumnGridClass = "grid gap-4 md:grid-cols-3";

const fieldGroupClass = "space-y-2";

const sectionGridClass = "grid gap-6 md:grid-cols-2";

const statusGroupClass =
  "flex gap-6 rounded-xl border border-border bg-card px-4 py-3";

const statusItemClass = "flex items-center space-x-2";

const actionsRowClass = "flex justify-end gap-3";

export default function ProductDialogue({
  open,
  onOpenChange,
  product,
  categories,
  onSaved,
}: productDialogueProps) {
  const {
    addColor,
    addFiles,
    form,
    isEditMode,
    removeColor,
    saving,
    submit,
    toggleSizes,
    updateField,
    changeCoverImg,
    removeExistingImage,
  } = useProductForm({
    open,
    onClose: () => onOpenChange(false),
    onSaved,
    product: product,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogContentClass}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Product" : "Create Product"}
          </DialogTitle>
        </DialogHeader>
        <div className={contentWrapClass}>
          <div className={twoColumnGridClass}>
            <div className={fieldGroupClass}>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Title"
              />
            </div>
            <div className={fieldGroupClass}>
              <Label>Brand</Label>
              <Select
                value={form.brand}
                onValueChange={(val) => updateField("brand", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className={fieldGroupClass}>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Description"
              rows={5}
            />
          </div>
          <div className={twoColumnGridClass}>
            <div className={fieldGroupClass}>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(val) => updateField("category", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cate) => (
                    <SelectItem key={cate._id} value={cate._id}>
                      {cate.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={fieldGroupClass}>
              <Label>Status</Label>
              <RadioGroup
                value={form.status}
                onValueChange={(val) =>
                  updateField("status", val as ProductStatus)
                }
                className={statusGroupClass}
              >
                <div className={statusItemClass}>
                  <RadioGroupItem value="active" id="product-status-active" />
                  <Label htmlFor="product-status-active">Active</Label>
                </div>
                <div className={statusItemClass}>
                  <RadioGroupItem
                    value="inactive"
                    id="product-status-inactive"
                  />
                  <Label htmlFor="product-status-inactive">Inactive</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className={threeColumnGridClass}>
            <div className={fieldGroupClass}>
              <Label>Price</Label>
              <Input
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                type="number"
                min="0"
                placeholder="0"
              />
            </div>
            <div className={fieldGroupClass}>
              <Label>Sale Percentage</Label>
              <Input
                value={form.salePercentage}
                onChange={(e) => updateField("salePercentage", e.target.value)}
                type="number"
                min="0"
                placeholder="0"
              />
            </div>
            <div className={fieldGroupClass}>
              <Label>Stock</Label>
              <Input
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
                type="number"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className={sectionGridClass}>
            <ColorPicker
              colors={form.colors}
              onAdd={addColor}
              onRemove={removeColor}
            />
            <SizeSelector selectedSizes={form.sizes} onToggle={toggleSizes} />
          </div>
          <ImagePicker
            coverImagePublicId={form.coverImagePublicId}
            existingImagse={form.existingImages}
            newFiles={form.newFiles}
            onFilesAdd={addFiles}
            onCoverImageChange={changeCoverImg}
            onExistingRemove={removeExistingImage}
          />

          <div className={actionsRowClass}>
            <Button variant={"outline"} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving
                ? "saving"
                : isEditMode
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </div>
        </div>
      </DialogContent>

      <Input />
    </Dialog>
  );
}
