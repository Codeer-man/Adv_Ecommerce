import { getCoverImage } from "../../../../feature/customer/product/product-list";
import type { CustomerProduct } from "../../../../feature/customer/product/types";
import { Card } from "../../../ui/card";

const galleryWrapClass = "space-y-4";

const mainImageCardClass = "overflow-hidden border-border/60 bg-card/80";

const mainImageWrapClass = "aspect-[4/5] bg-muted";

const imageClass = "h-full w-full object-cover";

const noImageClass =
  "flex h-full items-center justify-center text-sm text-muted-foreground";

const thumbnailsGridClass = "grid grid-cols-4 gap-3 sm:grid-cols-5";

const thumbnailButtonBaseClass = "overflow-hidden border bg-card";

const thumbnailButtonActiveClass = "border-primary ring-2 ring-primary/30";

const thumbnailButtonInactiveClass = "border-border/60";

const thumbnailImageWrapClass = "aspect-square bg-muted";

type customerProductDetail = {
  product: CustomerProduct;
  selectedImage: string;
  setSelectedImage: (value: string) => void;
};

export default function ProductDetailGalary({
  product,
  selectedImage,
  setSelectedImage,
}: customerProductDetail) {
  const galaryImages = product.images ?? [];
  const displayImage = selectedImage || getCoverImage(product);

  return (
    <div className={galleryWrapClass}>
      <Card className={mainImageCardClass}>
        <div className={mainImageWrapClass}>
          {displayImage ? (
            <img
              src={displayImage}
              alt={product.title}
              className={imageClass}
            />
          ) : (
            <div className={noImageClass}>No image</div>
          )}
        </div>
      </Card>
      {galaryImages.length ? (
        <div className={thumbnailsGridClass}>
          {galaryImages.map((item) => {
            const isActiveImage = displayImage === item.url;

            return (
              <button
                key={item.publicId}
                type="button"
                className={`${thumbnailButtonBaseClass} ${isActiveImage ? thumbnailButtonActiveClass : thumbnailButtonInactiveClass} `}
                onClick={() => setSelectedImage(item.url)}
              >
                <div className={thumbnailButtonBaseClass}>
                  <img
                    src={item.url}
                    alt={product.title}
                    className={imageClass}
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
