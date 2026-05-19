import { ImagePlus, Star, X } from "lucide-react";
import type { ProductImage } from "../../../feature/admin/products/types";
import { useEffect, useMemo } from "react";
import { Button } from "../../ui/button";

const wrapperClass = "space-y-4";

const headerClass = "space-y-1";

const titleClass = "text-sm font-semibold text-foreground";

const descriptionClass = "text-sm text-muted-foreground";

const uploadLabelClass =
  "flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center transition hover:bg-muted";

const uploadIconClass = "mb-2 h-5 w-5 text-muted-foreground";

const uploadTitleClass = "text-sm font-medium text-foreground";

const uploadSubtitleClass = "mt-1 text-xs text-muted-foreground";

const hiddenInputClass = "hidden";

const sectionClass = "space-y-2";

const sectionTitleClass = "text-sm font-medium text-foreground";

const gridClass = "grid grid-cols-2 gap-3 md:grid-cols-4";

const imageCardClass =
  "overflow-hidden rounded-xl border border-border bg-card";

const imageClass = "h-28 w-full object-cover";

const imageActionsClass = "flex items-center justify-between gap-2 p-2";

const starIconClass = "mr-1 h-3.5 w-3.5";

const removeIconClass = "h-4 w-4";

const fileNameClass = "p-2 text-xs text-muted-foreground";

type imageProps = {
  existingImagse: ProductImage[];
  newFiles: File[];
  coverImagePublicId: string;
  onFilesAdd: (files: FileList | null) => void;
  onExistingRemove: (publicId: string) => void;
  onCoverImageChange: (publicId: string) => void;
};

export default function ImagePicker({
  coverImagePublicId,
  existingImagse,
  newFiles,
  onFilesAdd,
  onCoverImageChange,
  onExistingRemove,
}: imageProps) {
  const prevUrls = useMemo(
    () => newFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newFiles],
  );

  useEffect(() => {
    return () => {
      prevUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [prevUrls]);

  return (
    <div className={wrapperClass}>
      <div className={headerClass}>
        <h3 className={titleClass}>Images</h3>
      </div>
      <label className={uploadLabelClass}>
        <ImagePlus className={uploadIconClass} />
        <span className={uploadTitleClass}>Upload Product Images</span>

        <input
          type="file"
          accept="images/*"
          multiple
          className={hiddenInputClass}
          onChange={(e) => onFilesAdd(e.target.files)}
        />
      </label>

      {existingImagse.length > 0 ? (
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Existing Image</p>

          <div className={gridClass}>
            {existingImagse.map((img) => {
              const isCover = coverImagePublicId === img.publicId;

              return (
                <div key={img.publicId} className={imageCardClass}>
                  <img src={img.url} alt="product" className={imageClass} />
                  <div className={imageActionsClass}>
                    <Button
                      type="button"
                      size={"sm"}
                      variant={isCover ? "default" : "secondary"}
                      onClick={() => onCoverImageChange(img.publicId)}
                    >
                      <Star className={starIconClass} />
                      {isCover ? "Cover" : "Set Cover"}
                    </Button>

                    <Button
                      type="button"
                      variant={"ghost"}
                      size={"icon"}
                      onClick={() => onExistingRemove(img.publicId)}
                    >
                      <X className={removeIconClass} />{" "}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {prevUrls.length > 0 ? (
        <div className={sectionClass}>
          <p className={sectionTitleClass}>New Upload</p>
          <div className={gridClass}>
            {prevUrls.map((img, index) => (
              <div key={`${img.file.name}-${index}`} className={imageCardClass}>
                <img src={img.url} alt={img.file.name} className={imageClass} />
                <div className={fileNameClass}>{img.file.name}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
