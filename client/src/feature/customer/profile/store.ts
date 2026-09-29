import { create } from "zustand";
import type { CustomerAddress, CustomerAddressFormValues } from "./types";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAddress,
  updateCustomerAddress,
} from "./api";
import { toast } from "sonner";

const emptyForm: CustomerAddressFormValues = {
  fullName: "",
  address: "",
  state: "",
  postalCode: "",
  isDefault: false,
};

type FormMode = "none" | "add" | "edit";

type CustomerProfileStore = {
  isOpen: boolean;
  items: CustomerAddress[];
  mode: FormMode;
  editingAddressId: string;
  form: CustomerAddressFormValues;
  openProfile: () => Promise<void>;
  closeProfile: () => void;
  loadAddresses: () => Promise<void>;
  startAdd: () => void;
  startEdit: (address: CustomerAddress) => void;
  updateForm: <K extends keyof CustomerAddressFormValues>(
    key: K,
    value: CustomerAddressFormValues[K],
  ) => void;
  cancelForm: () => void;
  saveForm: () => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  clear: () => void;
};

export const useCustomerProfileStore = create<CustomerProfileStore>(
  (set, get) => ({
    isOpen: false,
    items: [],
    mode: "none",
    editingAddressId: "",
    form: emptyForm,
    openProfile: async () => {
      set({ isOpen: true });
      //fetch

      await get().loadAddresses();
    },
    closeProfile: () => {
      set({
        isOpen: false,
        mode: "none",
        editingAddressId: "",
        form: emptyForm,
      });
    },
    loadAddresses: async () => {
      try {
        const response = await getCustomerAddress();

        set({ items: response.items ?? [] });
      } catch {
        set({ items: [] });
      }
    },
    startAdd: () => {
      set({ mode: "add", editingAddressId: "", form: emptyForm });
    },
    startEdit: (currentAddress) => {
      set({
        mode: "edit",
        editingAddressId: currentAddress._id,
        form: {
          address: currentAddress.address,
          fullName: currentAddress.fullName,
          isDefault: currentAddress.isDefault,
          postalCode: currentAddress.postalCode,
          state: currentAddress.state,
        },
      });
    },
    updateForm: (key, value) => {
      set((state) => ({
        form: {
          ...state.form,
          [key]: value,
        },
      }));
    },
    cancelForm: () => {
      set({ mode: "none", form: emptyForm, editingAddressId: "" });
    },
    saveForm: async () => {
      const { form, mode, editingAddressId } = get();

      const payload = {
        fullName: form.fullName.trim(),
        address: form.address.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        isDefault: form.isDefault,
      };

      try {
        const response =
          mode === "edit"
            ? await updateCustomerAddress(editingAddressId, payload)
            : await createCustomerAddress(payload);

        if (mode === "edit") {
          toast.success("Address edited successfully");
        } else if (mode === "add") {
          toast.success("Address Added successfully");
        }

        set({
          items: response.items ?? [],
          mode: "none",
          editingAddressId: "",
          form: emptyForm,
        });
      } catch (error) {
        toast.error("Failed ");
      }
    },
    removeAddress: async (addressId) => {
      try {
        const response = await deleteCustomerAddress(addressId);

        set((state) => ({
          items: response.items ?? [],
          mode: state.editingAddressId === addressId ? "none" : state.mode,
          editingAddressId:
            state.editingAddressId === addressId ? "" : state.editingAddressId,
          form: state.editingAddressId === addressId ? emptyForm : state.form,
        }));
        toast.success("address remove successfully");
      } catch (error) {
        toast.error("Failed to remove the address");
      }
    },
    clear: () => {
      set({
        isOpen: false,
        mode: "none",
        form: emptyForm,
        editingAddressId: "",
        items: [],
      });
    },
  }),
);
