import type { AdminBanner } from "../../../feature/admin/setting/type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";

const tableWrapClass = "overflow-x-auto";
const previewWrapClass =
  "h-16 w-28 overflow-hidden border border-border bg-muted";
const imageClass = "h-full w-full object-cover";
const publicIdTextClass =
  "max-w-[360px] truncate text-sm text-muted-foreground";

export default function AdminSettingBanner({
  items,
}: {
  items: AdminBanner[];
}) {
  function formatDateTime(value: string) {
    return new Date(value).toLocaleDateString();
  }

  return (
    <div className={tableWrapClass}>
      <Table>
        <TableHeader>
          <TableHead>Image</TableHead>
          <TableHead>Public ID</TableHead>
          <TableHead>Created At</TableHead>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item._id}>
              <TableCell>
                <div className={previewWrapClass}>
                  <img
                    src={item.imageUrl}
                    alt={item.imagePublicId}
                    className={imageClass}
                  />
                </div>
              </TableCell>
              <TableCell className={publicIdTextClass}>
                {item.imagePublicId}
              </TableCell>
              <TableCell>{formatDateTime(item.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
