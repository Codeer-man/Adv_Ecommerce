import { Plus, Search } from "lucide-react";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

const wrapperClass =
  "flex flex-col gap-3 md:flex-row md:items-center md:justify-between";

const searchWrapClass = "relative w-full md:w-80";

const searchIconClass =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground";

const searchInputClass = "pl-9";

const actionsWrapClass = "flex flex-col gap-3 sm:flex-row";

const addIconClass = "mr-2 h-4 w-4";

type productToolboxProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onManageChange: () => void;
  onAddProduct: () => void;
};

export default function ProductToolbox({
  search,
  onAddProduct,
  onManageChange,
  onSearchChange,
}: productToolboxProps) {
  return (
    <div className={wrapperClass}>
      <div className={searchWrapClass}>
        <Search className={searchIconClass} />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Products"
          className={searchInputClass}
        />
      </div>

      <div className={actionsWrapClass}>
        <Button onClick={onManageChange} variant={"outline"}>
          Manage Category
        </Button>
        <Button onClick={onAddProduct}>
          <Plus className={addIconClass} />
          Add Product
        </Button>
      </div>
    </div>
  );
}
