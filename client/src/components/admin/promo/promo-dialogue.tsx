import { useEffect, useState } from "react";
import type {
  Promo,
  PromoFormValues,
} from "../../../feature/admin/promo/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

const dialogContentClass =
  "max-h-[92vh] overflow-y-auto border-border bg-background sm:max-w-2xl";

const layoutClass = "grid gap-6";

const firstRowClass = "grid gap-4 md:grid-cols-2";

const secondRowClass = "grid gap-4 md:grid-cols-2";

const thirdRowClass = "grid gap-4 md:grid-cols-2";

const fieldWrapClass = "space-y-2";

const inputClass = "rounded-none";

const errorTextClass = "text-sm text-destructive";

const footerClass = "flex justify-end gap-3";

const outlineButtonClass = "rounded-none";

const primaryButtonClass = "rounded-none";

type PromoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promo: Promo | null;
  saving: boolean;
  onSaved: (values: PromoFormValues) => Promise<void>;
};

function tolocalDateTime(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const min = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${min}`;
}

const defaultForm: PromoFormValues = {
  code: "",
  percentage: "",
  count: "",
  minimumOrderValue: "",
  startsAt: "",
  endsAt: "",
};

export default function PromoDialogue({
  onOpenChange,
  onSaved,
  open,
  promo,
  saving,
}: PromoDialogProps) {
  const [form, setForm] = useState<PromoFormValues>(defaultForm);
  const isEditMode = !!promo;

  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      return;
    }

    if (promo) {
      setForm({
        code: promo.code,
        count: String(promo.count),
        percentage: String(promo.percentage),
        minimumOrderValue: String(promo.minimumOrderValue),
        startsAt: tolocalDateTime(promo.startsAt),
        endsAt: tolocalDateTime(promo.endsAt),
      });

      return;
    }
    setForm(defaultForm);
  }, [open, promo]);

  function updateFeild<K extends keyof PromoFormValues>(
    key: K,
    value: PromoFormValues[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submit() {
    if (
      !form.code.trim() ||
      !form.percentage.trim() ||
      !form.count.trim() ||
      !form.minimumOrderValue.trim() ||
      !form.startsAt.trim() ||
      !form.endsAt.trim()
    ) {
      return;
    }

    try {
      await onSaved({
        code: form.code.trim().toUpperCase(),
        percentage: form.percentage,
        count: form.count,
        minimumOrderValue: form.minimumOrderValue,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogContentClass}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Promo" : "Add Promo"}</DialogTitle>
        </DialogHeader>
        <div className={layoutClass}>
          <div className={firstRowClass}>
            <div className={fieldWrapClass}>
              <Label>Promo code</Label>
              <Input
                className={inputClass}
                type="text"
                value={form.code}
                placeholder="SUMMAR10"
                onChange={(e) => updateFeild("code", e.target.value)}
              />
            </div>
            <div className={fieldWrapClass}>
              <Label>Discount Percentage</Label>
              <Input
                className={inputClass}
                type="number"
                min={1}
                max={100}
                value={form.percentage}
                placeholder="10"
                onChange={(e) => updateFeild("percentage", e.target.value)}
              />
            </div>
          </div>
          <div className={secondRowClass}>
            <div className={fieldWrapClass}>
              <Label>Promo count</Label>
              <Input
                className={inputClass}
                type="number"
                min={1}
                value={form.count}
                placeholder="100"
                onChange={(e) => updateFeild("count", e.target.value)}
              />
            </div>
            <div className={fieldWrapClass}>
              <Label>Minimum order value</Label>
              <Input
                className={inputClass}
                type="number"
                min={0}
                value={form.minimumOrderValue}
                placeholder="999  "
                onChange={(e) =>
                  updateFeild("minimumOrderValue", e.target.value)
                }
              />
            </div>
          </div>
          <div className={thirdRowClass}>
            <div className={fieldWrapClass}>
              <Label>Valid from</Label>
              <Input
                className={inputClass}
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => updateFeild("startsAt", e.target.value)}
              />
            </div>
            <div className={fieldWrapClass}>
              <Label>Valid till</Label>
              <Input
                className={inputClass}
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => updateFeild("endsAt", e.target.value)}
              />
            </div>
          </div>
          <div className={footerClass}>
            <Button
              className={outlineButtonClass}
              variant={"secondary"}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={saving}
              className={primaryButtonClass}
            >
              {saving
                ? "saving..."
                : isEditMode
                  ? "Edit Promo"
                  : "Create promo"}{" "}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
