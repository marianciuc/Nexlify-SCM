/**
 * Demo catalog seed for the buyer workspace.
 * Kept here to keep route files focused on UI and to allow other modules to reuse it.
 */

export interface EnhancedStockItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  categoryId?: string;
  subcategory?: string;
  subcategoryId?: string;
  brand?: string;
  brandId?: string;
  manufacturer?: string;
  manufacturerId?: string;
  warehouse: string;
  quantityAvailable: number;
  quantityReserved: number;
  unit: string;
  unitPrice: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  dimensions?: string;
  moq: number;
  weightKg: number;
  volumeM3: number;
  supplierName?: string;
  supplierNip?: string;
  leadTimeDays?: number;
  certifications: string[];
}

export const ENHANCED_CATALOG: EnhancedStockItem[] = [
  {
    id: '1',
    sku: 'SKU-PAL-01',
    name: 'EPAL Euro-Pallet Standard (Pine Wood)',
    category: 'Packaging & Cargo Units',
    categoryId: 'cat-pkg',
    subcategory: 'Euro Pallets & Wooden Units (EPAL, CP)',
    subcategoryId: 'cat-pkg-pallets',
    brand: 'EPAL (European Pallet Association)',
    brandId: 'b-epal',
    manufacturer: 'Drewnex Palety Sp. z o.o.',
    manufacturerId: 'm-drewnex',
    warehouse: 'Central DC Warszawa (WH-WAW-01)',
    quantityAvailable: 1850,
    quantityReserved: 100,
    unit: 'pcs',
    unitPrice: 120.0,
    status: 'IN_STOCK',
    dimensions: '1200x800x144 mm',
    moq: 20,
    weightKg: 25.0,
    volumeM3: 0.144,
    supplierName: 'Drewnex Palety Sp. z o.o.',
    supplierNip: '7822910483',
    leadTimeDays: 1,
    certifications: ['EPAL / UIC 435-2', 'ISPM 15 / IPPC (Heat Treated)'],
  },
  {
    id: '2',
    sku: 'SKU-STR-05',
    name: 'Industrial Stretch Film 23mic (Roll 300m)',
    category: 'Packaging Supplies',
    categoryId: 'cat-supplies',
    subcategory: 'Industrial Stretch Film & Wrap',
    subcategoryId: 'cat-supplies-film',
    brand: 'PlastChem Industrial',
    brandId: 'b-plastchem',
    manufacturer: 'PlastChem Poly-Works Sp. k.',
    manufacturerId: 'm-plastchem',
    warehouse: 'Central DC Warszawa (WH-WAW-01)',
    quantityAvailable: 420,
    quantityReserved: 40,
    unit: 'rolls',
    unitPrice: 411.25,
    status: 'IN_STOCK',
    dimensions: '500x120 mm',
    moq: 5,
    weightKg: 3.2,
    volumeM3: 0.015,
    supplierName: 'PlastChem Industrial Sp. k.',
    supplierNip: '8942019485',
    leadTimeDays: 2,
    certifications: ['ISO 9001:2015', 'RoHS Compliant'],
  },
  {
    id: '3',
    sku: 'SKU-HYD-02',
    name: 'Hydraulic Hand Pallet Truck 2.5t (Tandem PU)',
    category: 'Material Handling Equipment',
    categoryId: 'cat-mhe',
    subcategory: 'Hydraulic & Electric Pallet Trucks',
    subcategoryId: 'cat-mhe-pallet-trucks',
    brand: 'Jungheinrich AG',
    brandId: 'b-jungheinrich',
    manufacturer: 'Jungheinrich Manufacturing N.V.',
    manufacturerId: 'm-jungheinrich-de',
    warehouse: 'Port Logistics Hub Szczecin (WH-SZC-02)',
    quantityAvailable: 18,
    quantityReserved: 10,
    unit: 'units',
    unitPrice: 1420.05,
    status: 'LOW_STOCK',
    dimensions: '1540x540x1230 mm',
    moq: 1,
    weightKg: 78.0,
    volumeM3: 0.45,
    supplierName: 'Baltic Heavy Freight & Tools',
    supplierNip: '8522619472',
    leadTimeDays: 3,
    certifications: ['CE Marking', 'EN 1757-2 Safety Directive'],
  },
  {
    id: '4',
    sku: 'SKU-COL-09',
    name: 'Insulated Thermobox 60L Pharma/Food Grade',
    category: 'Cold Chain Equipment',
    categoryId: 'cat-cold',
    subcategory: 'Insulated Thermoboxes & Shippers',
    subcategoryId: 'cat-cold-thermoboxes',
    brand: 'Thermax Cold Chain Tech',
    brandId: 'b-thermax',
    manufacturer: 'ThermaSafe Solutions S.A.',
    manufacturerId: 'm-thermasafe',
    warehouse: 'Central DC Warszawa (WH-WAW-01)',
    quantityAvailable: 850,
    quantityReserved: 300,
    unit: 'boxes',
    unitPrice: 224.33,
    status: 'IN_STOCK',
    dimensions: '600x400x380 mm',
    moq: 10,
    weightKg: 4.8,
    volumeM3: 0.08,
    supplierName: 'Pomerania Foods & Pharma Packaging',
    supplierNip: '5832918471',
    leadTimeDays: 1,
    certifications: ['HACCP Compliant', 'GDP Pharma Transport Certified'],
  },
];