import { useAuth } from "@clerk/react";
import { userCustomerCartAndCheckoutStore } from "../../../feature/customer/cart-checkout/store";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../../ui/drawer";
import CustomerCartItem from "./customer-cart-item";
import { useAuthStore } from "../../../feature/auth/store";
import { useEffect } from "react";
import { ScrollArea } from "../../ui/scroll-area";

const contentClass =
  "ml-auto flex h-[90dvh] max-h-[90dvh] w-full overflow-hidden rounded-none border-l border-border bg-background p-0";

const shellClass = "grid h-full min-h-0 w-full lg:grid-cols-[1.7fr_1fr]";
const leftPaneClass =
  "min-h-0 border-b border-border lg:border-b-0 lg:border-r";
const rightPaneClass =
  "min-h-0 bg-gradient-to-b from-secondary/40 via-background to-background";
const rightInnerClass = "flex h-full min-h-0 flex-col p-5";

const panelClass =
  "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm";
const panelHeaderClass = "border-b border-border px-5 py-4";
const panelTitleClass = "flex items-center gap-2 text-left";

const scrollClass = "min-h-0 flex-1";
const bodyClass = "space-y-4 px-5 py-4";

const sectionTitleClass = "text-sm font-medium text-foreground";
const helperClass = "text-xs text-muted-foreground";
const cardClass = "border border-border bg-background/50 p-3 text-sm";
const rowClass = "flex items-center justify-between text-sm";
const totalRowClass =
  "flex items-center justify-between border-t border-border pt-4 text-base font-semibold";

const promoRowClass = "flex gap-2";
const promoInputClass = "rounded-none";
const actionClass = "shrink-0 space-y-3 border-t border-border px-5 py-4";
const primaryButtonClass = "h-11 w-full";
const secondaryButtonClass = "h-11 w-full rounded-none";

const promoTitle =
  "flex items-center gap-2 text-sm font-medium text-foreground";

const infoBoxClass =
  "rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground";

export default function CustomerCartAndCheckoutDrawer() {
  const { isOpen, setOpen, loadCart, addresses, selectedAddressId } =
    userCustomerCartAndCheckoutStore((state) => state);
  const { isBootstrapped } = useAuthStore();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isOpen || !isSignedIn || !isBootstrapped) return;

    loadCart(Boolean(isSignedIn));
  }, [isBootstrapped, isLoaded, isOpen, isSignedIn, loadCart]);

  const selectedAddress =
    addresses.find((item) => item._id === selectedAddressId) || null;

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerContent className={contentClass}>
        <div className={shellClass}>
          <div className={leftPaneClass}>
            <CustomerCartItem />
          </div>
          <aside className={rightPaneClass}>
            <div className={rightInnerClass}>
              <div className={panelClass}>
                <DrawerHeader className={panelHeaderClass}>
                  <DrawerTitle className={panelTitleClass}>
                    Checkout
                  </DrawerTitle>
                </DrawerHeader>
                {isSignedIn ? (
                  <>
                    <ScrollArea className={scrollClass}>
                      <div className={bodyClass}>
                        <section className=" space-y-2">
                          <p className={sectionTitleClass}>Default Address </p>
                          {selectedAddress ? (
                            <div className={cardClass}>
                              <p className={helperClass}>
                                {selectedAddress.fullName}{" "}
                              </p>
                              <p className={helperClass}>
                                {selectedAddress.address},{" "}
                                {selectedAddress.state}{" "}
                              </p>
                              <p className={helperClass}>
                                {selectedAddress.postalCode}{" "}
                              </p>
                            </div>
                          ) : (
                            <p>
                              No default address present. Add one from Profile
                            </p>
                          )}
                        </section>
                        <section className=" space-y-2">
                          <p className={promoTitle}>Promo code</p>
                          
                        </section>
                      </div>
                    </ScrollArea>
                  </>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
