import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useCustomerProductDetailStore } from "../../feature/customer/product/details/store";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProductDetailGalary from "../../components/customer/products/details/product-detail-galary";
import CommonLoader from "../../components/common/loader";

import ProductDetailSummary from "../../components/customer/products/details/product-detail-sumary";
import CustomerRelatedProduct from "../../components/customer/products/details/product-related";
import { useAuthStore } from "../../feature/auth/store";
import { useCustomerWishlistStore } from "../../feature/customer/wishlist/store";

const pageWrapClass = "min-h-screen bg-background";
const heroSectionClass =
  "border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background";
const heroContainerClass = "mx-auto max-w-7xl px-4 py-2 ";
const backButtonClass = " rounded-none px-0 hover:bg-transparent";
const backIconClass = "mr-2 h-4 w-4";
const heroEyebrowClass = "text-sm uppercase tracking-[0.2em] text-primary";
const heroTitleClass =
  "max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl";
const contentContainerClass = "mx-auto max-w-7xl px-4 py-8";
const contentGridClass = "grid gap-8 lg:grid-cols-[1.05fr_0.95fr]";
const relatedSectionClass = "mt-14 space-y-5";
const relatedHeadingWrapClass = "space-y-1";
const relatedEyebrowClass = "text-sm uppercase tracking-[0.18em] text-primary";
const relatedTitleClass =
  "text-2xl font-semibold tracking-tight text-foreground";
const relatedGridClass = "grid gap-5 sm:grid-cols-2 xl:grid-cols-4";

export default function CollectionDetail() {
  const { id = "" } = useParams();
  const { isSignedIn, isLoaded } = useAuth();
  const { isBootstrapped } = useAuthStore();

  const {
    loadProduct,
    clear,
    data,
    selectedImage,
    setSelectedImage,
    loading,
    selectedColor,
    selectedSize,
    setSelectedColor,
    setSelectedSize,
    addToCart,
    toggleWishlist,
  } = useCustomerProductDetailStore((state) => state);

  const wishlistItems = useCustomerWishlistStore((state) => state.items);

  const product = data?.product ?? null;
  const relatedProduct = data?.relatedProducts ?? [];

  const isWishlistActive = !!product
    ? wishlistItems.some((item) => item.productId === product._id)
    : false;

  useEffect(() => {
    void loadProduct(id);

    return () => {
      clear();
    };
  }, [clear, id, loadProduct]);

  if (!product) return <CommonLoader />;

  return (
    <div className={pageWrapClass}>
      <section className={heroSectionClass}>
        <div className={heroContainerClass}>
          <Button asChild variant={"ghost"} className={backButtonClass}>
            <Link to={"/collections"}>
              <ArrowLeft className={backIconClass} />
              Back To collection
            </Link>
          </Button>
          <div className={heroContainerClass}>
            <p className={heroEyebrowClass}>{product?.brand} </p>
            <p className={heroTitleClass}>{product?.title} </p>
          </div>
        </div>
      </section>
      <div className={contentContainerClass}>
        <div className={contentGridClass}>
          <ProductDetailGalary
            product={product}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />
          <ProductDetailSummary
            product={product}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            setSelectedColor={setSelectedColor}
            setSelectedSize={setSelectedSize}
            isWishlistActive={isWishlistActive}
            toggleWishlist={() =>
              toggleWishlist(
                isLoaded,
                isBootstrapped,
                Boolean(isSignedIn),
                isWishlistActive,
              )
            }
          />

          {relatedProduct.length ? (
            <section className={relatedSectionClass}>
              <div className={relatedHeadingWrapClass}>
                <p className={relatedEyebrowClass}>You may also like </p>
                <p className={relatedTitleClass}>Related Products </p>
              </div>

              <div className={relatedGridClass}>
                {relatedProduct.map((item) => (
                  <CustomerRelatedProduct key={item._id} product={item} />
                ))}
              </div>
            </section>
          ) : (
            <div className="  text-center text-xl font-bold  text-pink-400 ">
              No related Prodcts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
