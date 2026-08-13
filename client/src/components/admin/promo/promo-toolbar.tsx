import { Plus, Search } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

const wrapClass =
  "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

const searchWrapClass = "relative w-full max-w-sm";

const searchIconClass =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground";

const searchInputClass = "rounded-none pl-9";

const addButtonClass = "rounded-none";

const addButtonIconClass = "mr-2 h-4 w-4";

type promoToolbar = {
  search: string;
  onSearchChange: (value: string) => void;
  onAddPromo: () => void;
};

export default function PromoToolbar({
  search,
  onAddPromo,
  onSearchChange,
}: promoToolbar) {
  return (
    <div className={wrapClass}>
      <div className={searchWrapClass}>
        <Search className={searchIconClass} />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={searchInputClass}
          placeholder="Search Promos"
        />
      </div>
      <Button onClick={onAddPromo} className={addButtonClass}>
        <Plus className={addButtonIconClass} />
        Add coupan
      </Button>
    </div>
  );
}
