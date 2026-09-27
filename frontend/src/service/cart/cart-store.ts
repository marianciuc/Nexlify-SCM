import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  moq: number;
  unit: string;
  vendorId: string;
  vendorName: string;
  vendorNip: string;
  weightKg: number;
  volumeM3: number;
}

export interface VendorCartGroup {
  vendorId: string;
  vendorName: string;
  vendorNip: string;
  incoterms: 'DAP' | 'EXW';
  items: CartItem[];
  subtotalNet: number;
  vatAmount: number;
  grossAmount: number;
  totalWeightKg: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
  clearVendor: (vendorId: string) => void;
  getVendorGroups: () => VendorCartGroup[];
  getTotalItemsCount: () => number;
  getTotalNet: () => number;
  getTotalGross: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [
        {
          sku: 'SKU-PAL-01',
          name: 'EPAL Euro-Pallet Standard (Pine)',
          category: 'Packaging & Cargo Units',
          unitPrice: 120.0,
          quantity: 50,
          moq: 20,
          unit: 'pcs',
          vendorId: 'ven-drewnex-01',
          vendorName: 'Drewnex Palety Sp. z o.o.',
          vendorNip: '7822910483',
          weightKg: 25.0,
          volumeM3: 0.144,
        },
        {
          sku: 'SKU-STR-05',
          name: 'Industrial Stretch Film 23mic (Roll 300m)',
          category: 'Packaging Supplies',
          unitPrice: 411.25,
          quantity: 10,
          moq: 5,
          unit: 'rolls',
          vendorId: 'ven-plastchem-02',
          vendorName: 'PlastChem Industrial Sp. k.',
          vendorNip: '8942019485',
          weightKg: 3.2,
          volumeM3: 0.015,
        },
      ],

      addItem: (item, quantity = item.moq || 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.sku === item.sku);
          const existing = state.items[existingIndex];
          if (existingIndex > -1 && existing) {
            const updated = [...state.items];
            updated[existingIndex] = { ...existing, quantity: existing.quantity + quantity };
            return { items: updated };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      updateQuantity: (sku, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) => (item.sku === sku ? { ...item, quantity: Math.max(1, quantity) } : item))
            .filter((item) => item.quantity > 0),
        }));
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((item) => item.sku !== sku),
        }));
      },

      clearCart: () => set({ items: [] }),

      clearVendor: (vendorId) => {
        set((state) => ({
          items: state.items.filter((item) => item.vendorId !== vendorId),
        }));
      },

      getVendorGroups: () => {
        const { items } = get();
        const groupsMap = new Map<string, VendorCartGroup>();

        items.forEach((item) => {
          if (!groupsMap.has(item.vendorId)) {
            groupsMap.set(item.vendorId, {
              vendorId: item.vendorId,
              vendorName: item.vendorName,
              vendorNip: item.vendorNip,
              incoterms: 'DAP',
              items: [],
              subtotalNet: 0,
              vatAmount: 0,
              grossAmount: 0,
              totalWeightKg: 0,
            });
          }

          const group = groupsMap.get(item.vendorId)!;
          group.items.push(item);
          const itemNet = item.unitPrice * item.quantity;
          group.subtotalNet += itemNet;
          group.totalWeightKg += item.weightKg * item.quantity;
        });

        // Calculate VAT (23%) and Gross
        groupsMap.forEach((group) => {
          group.vatAmount = Math.round(group.subtotalNet * 0.23 * 100) / 100;
          group.grossAmount = Math.round((group.subtotalNet + group.vatAmount) * 100) / 100;
        });

        return Array.from(groupsMap.values());
      },

      getTotalItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalNet: () => {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },

      getTotalGross: () => {
        const net = get().getTotalNet();
        return Math.round(net * 1.23 * 100) / 100;
      },
    }),
    {
      name: 'nexlify-buyer-cart',
    }
  )
);
