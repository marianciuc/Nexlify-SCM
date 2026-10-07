export interface WarehouseBin {
  id: string;
  code: string; // e.g. A-04-BIN-108
  tier: number; // 1 (Ground) to 4 (Top High-bay)
  position: number; // 1 to 3 pallet positions per bay
  status: 'OCCUPIED' | 'FREE' | 'RESERVED' | 'MAINTENANCE';
  sku?: string;
  productName?: string;
  category?: string;
  quantity?: number;
  maxCapacity?: number;
  batchLot?: string;
  expiryDate?: string;
  abcVelocity: 'A' | 'B' | 'C';
  weightKg?: number;
}

export interface WarehouseRack {
  id: string;
  code: string; // e.g. RACK-A-04
  aisle: string; // 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  rackNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  capacity: number;
  occupied: number;
  zoneType: 'PALLET_RACKS' | 'MEZZANINE' | 'COLD_CHAIN' | 'HAZARDOUS';
  abcCategory: 'A' | 'B' | 'C';
  temperature: string;
  bins: WarehouseBin[];
}

export interface WarehouseSpecialZone {
  id: string;
  name: string;
  type: 'INBOUND_DOCK' | 'OUTBOUND_DOCK' | 'PACK_STATION' | 'QUARANTINE' | 'CHARGING';
  x: number;
  y: number;
  width: number;
  height: number;
  status: string;
  activeWorkers?: number;
  notes?: string;
}

export interface WarehouseEquipment {
  id: string;
  name: string;
  type: 'FORKLIFT' | 'REACH_TRUCK' | 'AGV_ROBOT';
  operator: string;
  batteryPercent: number;
  status: 'ACTIVE_PICKING' | 'PUTAWAY' | 'IDLE' | 'CHARGING';
  x: number;
  y: number;
  currentTask: string;
}

export interface WarehouseFacility {
  id: string;
  code: string;
  name: string;
  city: string;
  totalCapacity: number;
  currentOccupancy: number;
  temperatureZones: number;
  activeDocks: number;
  racks: WarehouseRack[];
  zones: WarehouseSpecialZone[];
  equipment: WarehouseEquipment[];
}

// -------------------------------------------------------------
// SEED DATA: Central DC Warszawa (WH-WAW-01) - 12,000 pal.
// -------------------------------------------------------------

export const CENTRAL_DC_WARSZAWA: WarehouseFacility = {
  id: 'wh-waw-01',
  code: 'WH-WAW-01',
  name: 'Central Distribution Center Warszawa',
  city: 'Warszawa (Ożarów Mazowiecki)',
  totalCapacity: 12000,
  currentOccupancy: 9840,
  temperatureZones: 3,
  activeDocks: 6,
  zones: [
    {
      id: 'zone-dock-in-1',
      name: 'Inbound Dock 1 (TIR Приемка)',
      type: 'INBOUND_DOCK',
      x: 40,
      y: 30,
      width: 130,
      height: 70,
      status: 'Разгрузка: Scania R450 (WI 49102) • 33 пал.',
      activeWorkers: 2,
    },
    {
      id: 'zone-dock-in-2',
      name: 'Inbound Dock 2 (Приемка сырья)',
      type: 'INBOUND_DOCK',
      x: 190,
      y: 30,
      width: 130,
      height: 70,
      status: 'Свободно • Ожидает прибытия 14:30',
      activeWorkers: 1,
    },
    {
      id: 'zone-quarantine',
      name: 'Зона рекламаций & Карантин (RMA)',
      type: 'QUARANTINE',
      x: 820,
      y: 30,
      width: 140,
      height: 70,
      status: '12 палет на проверке качества',
      activeWorkers: 1,
      notes: 'Бой и поврежденная упаковка',
    },
    {
      id: 'zone-pack-1',
      name: 'Столы комплектации & Упаковки (Pack Station #1)',
      type: 'PACK_STATION',
      x: 40,
      y: 520,
      width: 280,
      height: 80,
      status: 'Работает • 4 комплектовщика • Весовой контроль',
      activeWorkers: 4,
    },
    {
      id: 'zone-dock-out-3',
      name: 'Outbound Dock 3 (Отгрузка Запад)',
      type: 'OUTBOUND_DOCK',
      x: 360,
      y: 520,
      width: 140,
      height: 80,
      status: 'Загрузка рейса WMS-WAW-POZ',
      activeWorkers: 2,
    },
    {
      id: 'zone-dock-out-4',
      name: 'Outbound Dock 4 (Отгрузка Северо-Запад)',
      type: 'OUTBOUND_DOCK',
      x: 520,
      y: 520,
      width: 140,
      height: 80,
      status: 'Готово к опломбированию e-CMR',
      activeWorkers: 1,
    },
    {
      id: 'zone-dock-out-5',
      name: 'Outbound Dock 5 (Курьерская консолидация)',
      type: 'OUTBOUND_DOCK',
      x: 680,
      y: 520,
      width: 130,
      height: 80,
      status: 'Сборка сборных грузов (LTL)',
      activeWorkers: 2,
    },
    {
      id: 'zone-charging',
      name: 'Зарядная станция AGV / АКБ',
      type: 'CHARGING',
      x: 830,
      y: 520,
      width: 130,
      height: 80,
      status: '3 зарядных поста активно',
      activeWorkers: 0,
    },
  ],
  racks: [
    // --- AISLE A: Высотные палетные стеллажи (EPAL Wood & Packaging) ---
    {
      id: 'rack-a-01',
      code: 'RACK-A-01',
      aisle: 'A',
      rackNumber: 1,
      x: 50,
      y: 140,
      width: 110,
      height: 48,
      capacity: 36,
      occupied: 32,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'A',
      temperature: 'Ambient 19°C',
      bins: [
        {
          id: 'bin-a-01-101',
          code: 'A-01-BIN-101',
          tier: 1,
          position: 1,
          status: 'OCCUPIED',
          sku: 'SKU-PAL-01',
          productName: 'EPAL Euro-Pallet Standard (Pine Wood)',
          category: 'Деревянная тара',
          quantity: 120,
          maxCapacity: 120,
          batchLot: 'LOT-2026-EPAL-901',
          expiryDate: '2030-12-31',
          abcVelocity: 'A',
          weightKg: 2400,
        },
        {
          id: 'bin-a-01-102',
          code: 'A-01-BIN-102',
          tier: 2,
          position: 1,
          status: 'OCCUPIED',
          sku: 'SKU-PAL-02',
          productName: 'EPAL 2 Industrial Pallet 1200x1000',
          category: 'Деревянная тара',
          quantity: 80,
          maxCapacity: 100,
          batchLot: 'LOT-2026-EPAL-842',
          expiryDate: '2030-12-31',
          abcVelocity: 'A',
          weightKg: 1850,
        },
      ],
    },
    {
      id: 'rack-a-02',
      code: 'RACK-A-02',
      aisle: 'A',
      rackNumber: 2,
      x: 180,
      y: 140,
      width: 110,
      height: 48,
      capacity: 36,
      occupied: 28,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'A',
      temperature: 'Ambient 19°C',
      bins: [
        {
          id: 'bin-a-02-104',
          code: 'A-02-BIN-104',
          tier: 1,
          position: 2,
          status: 'OCCUPIED',
          sku: 'SKU-PAL-03',
          productName: 'EPAL Half-Pallet 800x600 Display',
          category: 'Деревянная тара',
          quantity: 150,
          maxCapacity: 150,
          batchLot: 'LOT-2026-HPAL-102',
          expiryDate: '2030-12-31',
          abcVelocity: 'B',
          weightKg: 1420,
        },
      ],
    },
    {
      id: 'rack-a-03',
      code: 'RACK-A-03',
      aisle: 'A',
      rackNumber: 3,
      x: 310,
      y: 140,
      width: 110,
      height: 48,
      capacity: 36,
      occupied: 35,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'A',
      temperature: 'Ambient 19°C',
      bins: [
        {
          id: 'bin-a-03-107',
          code: 'A-03-BIN-107',
          tier: 3,
          position: 1,
          status: 'RESERVED',
          sku: 'SKU-PAL-01',
          productName: 'EPAL Euro-Pallet Standard (Pine Wood)',
          category: 'Деревянная тара',
          quantity: 100,
          maxCapacity: 120,
          batchLot: 'LOT-2026-EPAL-901',
          expiryDate: '2030-12-31',
          abcVelocity: 'A',
          weightKg: 2000,
        },
      ],
    },
    {
      id: 'rack-a-04',
      code: 'RACK-A-04',
      aisle: 'A',
      rackNumber: 4,
      x: 440,
      y: 140,
      width: 110,
      height: 48,
      capacity: 36,
      occupied: 36,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'A',
      temperature: 'Ambient 19°C',
      bins: [
        {
          id: 'bin-a-04-108',
          code: 'A-04-BIN-108',
          tier: 1,
          position: 1,
          status: 'OCCUPIED',
          sku: 'SKU-PAL-01',
          productName: 'EPAL Euro-Pallet Standard (Pine Wood)',
          category: 'Деревянная тара',
          quantity: 100,
          maxCapacity: 120,
          batchLot: 'LOT-2026-EPAL-901',
          expiryDate: '2030-12-31',
          abcVelocity: 'A',
          weightKg: 2100,
        },
      ],
    },

    // --- AISLE B: Мезонин и зона быстрого штучного отбора (Fast Picking) ---
    {
      id: 'rack-b-01',
      code: 'RACK-B-01',
      aisle: 'B',
      rackNumber: 1,
      x: 50,
      y: 230,
      width: 110,
      height: 48,
      capacity: 48,
      occupied: 42,
      zoneType: 'MEZZANINE',
      abcCategory: 'A',
      temperature: 'Ambient 20°C',
      bins: [
        {
          id: 'bin-b-01-201',
          code: 'B-01-BIN-201',
          tier: 1,
          position: 1,
          status: 'OCCUPIED',
          sku: 'SKU-COR-01',
          productName: 'Corrugated Shipping Box 600x400x400 (5-ply)',
          category: 'Упаковочные материалы',
          quantity: 850,
          maxCapacity: 1000,
          batchLot: 'LOT-2026-BOX-410',
          expiryDate: '2029-06-30',
          abcVelocity: 'A',
          weightKg: 680,
        },
      ],
    },
    {
      id: 'rack-b-02',
      code: 'RACK-B-02',
      aisle: 'B',
      rackNumber: 2,
      x: 180,
      y: 230,
      width: 110,
      height: 48,
      capacity: 48,
      occupied: 38,
      zoneType: 'MEZZANINE',
      abcCategory: 'A',
      temperature: 'Ambient 20°C',
      bins: [
        {
          id: 'bin-b-02-205',
          code: 'B-02-BIN-205',
          tier: 2,
          position: 1,
          status: 'OCCUPIED',
          sku: 'SKU-COR-02',
          productName: 'Heavy-Duty Telescopic Pallet Box',
          category: 'Упаковочные материалы',
          quantity: 240,
          maxCapacity: 300,
          batchLot: 'LOT-2026-TBOX-11',
          expiryDate: '2029-06-30',
          abcVelocity: 'B',
          weightKg: 890,
        },
      ],
    },
    {
      id: 'rack-b-03',
      code: 'RACK-B-03',
      aisle: 'B',
      rackNumber: 3,
      x: 310,
      y: 230,
      width: 110,
      height: 48,
      capacity: 48,
      occupied: 44,
      zoneType: 'MEZZANINE',
      abcCategory: 'A',
      temperature: 'Ambient 20°C',
      bins: [
        {
          id: 'bin-b-03-210',
          code: 'B-03-BIN-210',
          tier: 1,
          position: 3,
          status: 'OCCUPIED',
          sku: 'SKU-TAP-01',
          productName: 'Reinforced Kraft Paper Tape (Pack 36)',
          category: 'Расходные материалы',
          quantity: 600,
          maxCapacity: 750,
          batchLot: 'LOT-2026-TAPE-09',
          expiryDate: '2028-12-31',
          abcVelocity: 'A',
          weightKg: 420,
        },
      ],
    },
    {
      id: 'rack-b-04',
      code: 'RACK-B-04',
      aisle: 'B',
      rackNumber: 4,
      x: 440,
      y: 230,
      width: 110,
      height: 48,
      capacity: 48,
      occupied: 46,
      zoneType: 'MEZZANINE',
      abcCategory: 'B',
      temperature: 'Ambient 20°C',
      bins: [
        {
          id: 'bin-b-04-214',
          code: 'B-04-BIN-214',
          tier: 3,
          position: 1,
          status: 'FREE',
          abcVelocity: 'B',
          maxCapacity: 500,
        },
      ],
    },

    // --- AISLE C: Пленка, расходники и вспомогательные товары ---
    {
      id: 'rack-c-01',
      code: 'RACK-C-01',
      aisle: 'C',
      rackNumber: 1,
      x: 50,
      y: 320,
      width: 110,
      height: 48,
      capacity: 36,
      occupied: 22,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'B',
      temperature: 'Ambient 18°C',
      bins: [
        {
          id: 'bin-c-01-042',
          code: 'C-01-BIN-042',
          tier: 1,
          position: 1,
          status: 'OCCUPIED',
          sku: 'SKU-STR-05',
          productName: 'Industrial Stretch Film 23mic (Roll 300m)',
          category: 'Стретч-пленка',
          quantity: 40,
          maxCapacity: 60,
          batchLot: 'LOT-2026-STR-892',
          expiryDate: '2028-12-31',
          abcVelocity: 'A',
          weightKg: 640,
        },
      ],
    },
    {
      id: 'rack-c-02',
      code: 'RACK-C-02',
      aisle: 'C',
      rackNumber: 2,
      x: 180,
      y: 320,
      width: 110,
      height: 48,
      capacity: 36,
      occupied: 29,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'B',
      temperature: 'Ambient 18°C',
      bins: [
        {
          id: 'bin-c-02-045',
          code: 'C-02-BIN-045',
          tier: 2,
          position: 1,
          status: 'OCCUPIED',
          sku: 'SKU-STR-06',
          productName: 'Machine Stretch Film 17mic Pre-stretch 300%',
          category: 'Стретч-пленка',
          quantity: 36,
          maxCapacity: 48,
          batchLot: 'LOT-2026-MSTR-33',
          expiryDate: '2028-12-31',
          abcVelocity: 'B',
          weightKg: 580,
        },
      ],
    },
    {
      id: 'rack-c-03',
      code: 'RACK-C-03',
      aisle: 'C',
      rackNumber: 3,
      x: 310,
      y: 320,
      width: 110,
      height: 48,
      capacity: 36,
      occupied: 18,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'C',
      temperature: 'Ambient 18°C',
      bins: [
        {
          id: 'bin-c-03-050',
          code: 'C-03-BIN-050',
          tier: 1,
          position: 2,
          status: 'FREE',
          abcVelocity: 'C',
          maxCapacity: 40,
        },
      ],
    },
    {
      id: 'rack-c-04',
      code: 'RACK-C-04',
      aisle: 'C',
      rackNumber: 4,
      x: 440,
      y: 320,
      width: 110,
      height: 48,
      capacity: 36,
      occupied: 25,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'C',
      temperature: 'Ambient 18°C',
      bins: [],
    },

    // --- AISLE D: Холодильный контур (+2°C .. +6°C Cold Chain) ---
    {
      id: 'rack-d-01',
      code: 'RACK-D-01',
      aisle: 'D',
      rackNumber: 1,
      x: 600,
      y: 140,
      width: 110,
      height: 48,
      capacity: 30,
      occupied: 26,
      zoneType: 'COLD_CHAIN',
      abcCategory: 'A',
      temperature: '+3.8°C (Cold Chain)',
      bins: [
        {
          id: 'bin-d-01-301',
          code: 'D-01-BIN-301',
          tier: 1,
          position: 1,
          status: 'OCCUPIED',
          sku: 'SKU-COLD-01',
          productName: 'Chilled Dairy Ingredients Base (1000L IBC)',
          category: 'Холодная цепочка',
          quantity: 12,
          maxCapacity: 12,
          batchLot: 'LOT-2026-DAIRY-41',
          expiryDate: '2026-11-15',
          abcVelocity: 'A',
          weightKg: 12400,
        },
      ],
    },
    {
      id: 'rack-d-02',
      code: 'RACK-D-02',
      aisle: 'D',
      rackNumber: 2,
      x: 730,
      y: 140,
      width: 110,
      height: 48,
      capacity: 30,
      occupied: 24,
      zoneType: 'COLD_CHAIN',
      abcCategory: 'A',
      temperature: '+4.1°C (Cold Chain)',
      bins: [
        {
          id: 'bin-d-02-304',
          code: 'D-02-BIN-304',
          tier: 2,
          position: 1,
          status: 'OCCUPIED',
          sku: 'SKU-COLD-02',
          productName: 'Frozen Organic Berry Pulp (-18°C Deep Frozen)',
          category: 'Глубокая заморозка',
          quantity: 18,
          maxCapacity: 20,
          batchLot: 'LOT-2026-BERRY-89',
          expiryDate: '2027-05-30',
          abcVelocity: 'B',
          weightKg: 9200,
        },
      ],
    },

    // --- AISLE E: Зона ADR / Опасные химические вещества ---
    {
      id: 'rack-e-01',
      code: 'RACK-E-01',
      aisle: 'E',
      rackNumber: 1,
      x: 600,
      y: 250,
      width: 110,
      height: 48,
      capacity: 24,
      occupied: 18,
      zoneType: 'HAZARDOUS',
      abcCategory: 'B',
      temperature: 'Ventilated 16°C',
      bins: [
        {
          id: 'bin-e-01-401',
          code: 'E-01-BIN-401',
          tier: 1,
          position: 1,
          status: 'OCCUPIED',
          sku: 'SKU-ADR-01',
          productName: 'Industrial Polymer Resin Solvent (UN 1993 Class 3)',
          category: 'ADR Класс 3 (Легковоспламеняющиеся)',
          quantity: 8,
          maxCapacity: 8,
          batchLot: 'LOT-2026-CHEM-102',
          expiryDate: '2028-09-01',
          abcVelocity: 'B',
          weightKg: 6400,
        },
      ],
    },
    {
      id: 'rack-e-02',
      code: 'RACK-E-02',
      aisle: 'E',
      rackNumber: 2,
      x: 730,
      y: 250,
      width: 110,
      height: 48,
      capacity: 24,
      occupied: 14,
      zoneType: 'HAZARDOUS',
      abcCategory: 'C',
      temperature: 'Ventilated 16°C',
      bins: [],
    },

    // --- AISLE F: Тяжелые палеты и буферное хранение ---
    {
      id: 'rack-f-01',
      code: 'RACK-F-01',
      aisle: 'F',
      rackNumber: 1,
      x: 600,
      y: 350,
      width: 110,
      height: 48,
      capacity: 32,
      occupied: 30,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'C',
      temperature: 'Ambient 18°C',
      bins: [],
    },
    {
      id: 'rack-f-02',
      code: 'RACK-F-02',
      aisle: 'F',
      rackNumber: 2,
      x: 730,
      y: 350,
      width: 110,
      height: 48,
      capacity: 32,
      occupied: 27,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'C',
      temperature: 'Ambient 18°C',
      bins: [],
    },
  ],
  equipment: [
    {
      id: 'eq-01',
      name: 'Штабелер Reach Truck #01 (Linde R16)',
      type: 'REACH_TRUCK',
      operator: 'Tomasz Nowak',
      batteryPercent: 88,
      status: 'ACTIVE_PICKING',
      x: 230,
      y: 190,
      currentTask: 'Отбор палет из Ряда A-04 в зону стола комплектации #1',
    },
    {
      id: 'eq-02',
      name: 'Вилочный погрузчик #02 (Toyota Traigo 48)',
      type: 'FORKLIFT',
      operator: 'Marek Wiśniewski',
      batteryPercent: 64,
      status: 'PUTAWAY',
      x: 120,
      y: 90,
      currentTask: 'Разгрузка TIR на рампе Inbound Dock #1',
    },
    {
      id: 'eq-03',
      name: 'Робот AGV Tugger #03 (Autonomous Pallet Carrier)',
      type: 'AGV_ROBOT',
      operator: 'Автономная система WMS',
      batteryPercent: 95,
      status: 'ACTIVE_PICKING',
      x: 370,
      y: 470,
      currentTask: 'Транспортировка палеты от Pack Station к рампе Outbound Dock 3',
    },
  ],
};

export const ALL_WAREHOUSES: WarehouseFacility[] = [
  CENTRAL_DC_WARSZAWA,
  {
    id: 'wh-szc-02',
    code: 'WH-SZC-02',
    name: 'Port Logistics Hub Szczecin',
    city: 'Szczecin (Port Nadodrzański)',
    totalCapacity: 8500,
    currentOccupancy: 6400,
    temperatureZones: 2,
    activeDocks: 4,
    zones: CENTRAL_DC_WARSZAWA.zones.slice(0, 5),
    racks: CENTRAL_DC_WARSZAWA.racks.slice(0, 8),
    equipment: CENTRAL_DC_WARSZAWA.equipment.slice(0, 2),
  },
  {
    id: 'wh-kat-03',
    code: 'WH-KAT-03',
    name: 'Cross-docking Hub Katowice',
    city: 'Katowice (Górnośląski Park Logistyczny)',
    totalCapacity: 6200,
    currentOccupancy: 5120,
    temperatureZones: 1,
    activeDocks: 5,
    zones: CENTRAL_DC_WARSZAWA.zones.slice(0, 6),
    racks: CENTRAL_DC_WARSZAWA.racks.slice(0, 6),
    equipment: CENTRAL_DC_WARSZAWA.equipment.slice(1, 3),
  },
];

export const STORAGE_WAREHOUSE_MAP_KEY = 'nexlify_local_warehouse_facilities';

export function getStoredFacilities(): WarehouseFacility[] {
  if (typeof window === 'undefined') return ALL_WAREHOUSES;
  try {
    const raw = localStorage.getItem(STORAGE_WAREHOUSE_MAP_KEY);
    return raw ? JSON.parse(raw) : ALL_WAREHOUSES;
  } catch {
    return ALL_WAREHOUSES;
  }
}

export function saveStoredFacilities(facilities: WarehouseFacility[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_WAREHOUSE_MAP_KEY, JSON.stringify(facilities));
    } catch {
      // Keep the default map data when browser storage is unavailable.
    }
}

export function resetStoredFacilities(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_WAREHOUSE_MAP_KEY);
    } catch {
      // Storage persistence is best effort; the current session remains usable.
    }
}
