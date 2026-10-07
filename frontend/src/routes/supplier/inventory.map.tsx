import { createFileRoute } from '@tanstack/react-router';
import {
  Warehouse,
  Search,
  Layers,
  TrendingUp,
  Truck,
  Box,
  CheckCircle2,
  Navigation,
  Plus,
  Minus,
  X,
  Zap,
  Edit3,
  Move,
  Trash2,
  Save,
  ArrowLeftRight,
  RotateCcw,
  ListOrdered,
  Square,
  Building,
  BatteryCharging,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/page-header';
import { StatusBadge, type StatusTone } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/useLocale';
import { type TranslationPath } from '@/types/generated-locale';
import {
  ALL_WAREHOUSES,
  CENTRAL_DC_WARSZAWA,
  getStoredFacilities,
  saveStoredFacilities,
  resetStoredFacilities,
  type WarehouseFacility,
  type WarehouseRack,
  type WarehouseBin,
  type WarehouseSpecialZone,
  type WarehouseEquipment,
} from '@/types/warehouse-map-data';

export const Route = createFileRoute('/supplier/inventory/map')({
  component: VirtualWarehouseMapPage,
  staticData: {
    crumb: {
      label: 'nav.supplier.warehouseMap',
    },
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      sku: typeof search.sku === 'string' ? search.sku : undefined,
      bin: typeof search.bin === 'string' ? search.bin : undefined,
      orderId: typeof search.orderId === 'string' ? search.orderId : undefined,
    };
  },
});

type HeatmapMode = 'OCCUPANCY' | 'ABC_VELOCITY' | 'COLD_CHAIN' | 'HAZARDOUS';

interface WavePickingStop {
  stopNumber: number;
  rack: WarehouseRack;
  bin?: WarehouseBin;
  sku: string;
  name: string;
  qty: number;
  isPicked: boolean;
}

const M = 'supplier.inventory.map';

const HEATMAP_LAYERS: { id: HeatmapMode; labelKey: TranslationPath; activeClass?: string }[] = [
  { id: 'OCCUPANCY', labelKey: `${M}.layers.occupancy` },
  { id: 'ABC_VELOCITY', labelKey: `${M}.layers.abc`, activeClass: 'bg-purple-600 hover:bg-purple-700 text-white' },
  { id: 'COLD_CHAIN', labelKey: `${M}.layers.cold`, activeClass: 'bg-cyan-600 hover:bg-cyan-700 text-white' },
  { id: 'HAZARDOUS', labelKey: `${M}.layers.hazardous`, activeClass: 'bg-amber-600 hover:bg-amber-700 text-white' },
];

type BinStatus = 'OCCUPIED' | 'FREE' | 'RESERVED' | 'MAINTENANCE';

const BIN_TONE: Record<BinStatus, StatusTone> = {
  OCCUPIED: 'success',
  FREE: 'neutral',
  RESERVED: 'warning',
  MAINTENANCE: 'danger',
};

const BIN_LABEL_KEY: Record<BinStatus, TranslationPath> = {
  OCCUPIED: `${M}.binStatus.occupied`,
  FREE: `${M}.binStatus.free`,
  RESERVED: `${M}.binStatus.reserved`,
  MAINTENANCE: `${M}.binStatus.maintenance`,
};

type EquipmentStatus = 'ACTIVE_PICKING' | 'PUTAWAY' | 'IDLE' | 'CHARGING';

const EQ_TONE: Record<EquipmentStatus, StatusTone> = {
  ACTIVE_PICKING: 'success',
  PUTAWAY: 'info',
  IDLE: 'neutral',
  CHARGING: 'warning',
};

const EQ_LABEL_KEY: Record<EquipmentStatus, TranslationPath> = {
  ACTIVE_PICKING: `${M}.eqStatus.active`,
  PUTAWAY: `${M}.eqStatus.putaway`,
  IDLE: `${M}.eqStatus.idle`,
  CHARGING: `${M}.eqStatus.charging`,
};

const RACK_ZONE_TYPE_LABEL_KEY: Record<WarehouseRack['zoneType'], TranslationPath> = {
  PALLET_RACKS: `${M}.zoneType.palletRacks`,
  MEZZANINE: `${M}.zoneType.mezzanine`,
  COLD_CHAIN: `${M}.zoneType.coldChain`,
  HAZARDOUS: `${M}.zoneType.hazardous`,
};

const SPECIAL_ZONE_TYPE_LABEL_KEY: Record<WarehouseSpecialZone['type'], TranslationPath> = {
  INBOUND_DOCK: `${M}.specialZoneType.inboundDock`,
  OUTBOUND_DOCK: `${M}.specialZoneType.outboundDock`,
  PACK_STATION: `${M}.specialZoneType.packStation`,
  QUARANTINE: `${M}.specialZoneType.quarantine`,
  CHARGING: `${M}.specialZoneType.charging`,
};

const TIER_LABEL_KEY: Record<number, TranslationPath> = {
  4: `${M}.inspector.tier4`,
  3: `${M}.inspector.tier3`,
  2: `${M}.inspector.tier2`,
  1: `${M}.inspector.tier1`,
};

const EQ_TYPE_LABEL_KEY: Record<WarehouseEquipment['type'], TranslationPath> = {
  FORKLIFT: `${M}.svg.eqForklift`,
  REACH_TRUCK: `${M}.svg.eqReach`,
  AGV_ROBOT: `${M}.svg.eqAgv`,
};

const WAVE_ORDERS: { id: string; labelKey: TranslationPath }[] = [
  { id: 'ORD-2026-0891', labelKey: `${M}.wave.order1` },
  { id: 'ORD-2026-0892', labelKey: `${M}.wave.order2` },
];

function VirtualWarehouseMapPage() {
  const { t } = useLocale();
  const searchParams = Route.useSearch();

  // Persistent Facilities State
  const [facilities, setFacilities] = useState<WarehouseFacility[]>(getStoredFacilities);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(CENTRAL_DC_WARSZAWA.id);

  // Active facility
  const facility: WarehouseFacility = useMemo(() => {
    return facilities.find((w) => w.id === selectedFacilityId) || facilities[0] || CENTRAL_DC_WARSZAWA;
  }, [facilities, selectedFacilityId]);

  const updateFacilities = (newFacilities: WarehouseFacility[]) => {
    setFacilities(newFacilities);
    saveStoredFacilities(newFacilities);
  };

  // Map Controls State
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('OCCUPANCY');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.sku || searchParams.bin || '');
  const [selectedRack, setSelectedRack] = useState<WarehouseRack | null>(null);
  const [selectedBin, setSelectedBin] = useState<WarehouseBin | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // -------------------------------------------------------------
  // WAVE PICKING (multi-bin order picking circuit)
  // -------------------------------------------------------------
  const [isWavePickingMode, setIsWavePickingMode] = useState<boolean>(false);
  const [selectedWaveOrder, setSelectedWaveOrder] = useState<string>('ORD-2026-0891');
  const [waveStops, setWaveStops] = useState<WavePickingStop[]>([]);

  // Initialize Wave Picking Stops when an order is selected
  useEffect(() => {
    if (isWavePickingMode) {
      if (selectedWaveOrder === 'ORD-2026-0891') {
        const rackA = facility.racks.find((r) => r.code === 'RACK-A-04') || facility.racks[3]!;
        const rackB = facility.racks.find((r) => r.code === 'RACK-B-01') || facility.racks[4]!;
        const rackC = facility.racks.find((r) => r.code === 'RACK-C-01') || facility.racks[8]!;

        setWaveStops([
          {
            stopNumber: 1,
            rack: rackA,
            bin: rackA.bins[0],
            sku: 'SKU-PAL-01',
            name: 'EPAL Euro-Pallet Standard',
            qty: 100,
            isPicked: false,
          },
          {
            stopNumber: 2,
            rack: rackB,
            bin: rackB.bins[0],
            sku: 'SKU-COR-01',
            name: 'Corrugated Shipping Box (5-ply)',
            qty: 850,
            isPicked: false,
          },
          {
            stopNumber: 3,
            rack: rackC,
            bin: rackC.bins[0],
            sku: 'SKU-STR-05',
            name: 'Industrial Stretch Film 23mic',
            qty: 40,
            isPicked: false,
          },
        ]);
      } else {
        const rackA1 = facility.racks.find((r) => r.code === 'RACK-A-01') || facility.racks[0]!;
        const rackD = facility.racks.find((r) => r.code === 'RACK-D-01') || facility.racks[12]!;

        setWaveStops([
          {
            stopNumber: 1,
            rack: rackA1,
            bin: rackA1.bins[0],
            sku: 'SKU-PAL-02',
            name: 'EPAL 2 Industrial Pallet',
            qty: 80,
            isPicked: false,
          },
          {
            stopNumber: 2,
            rack: rackD,
            bin: rackD.bins[0],
            sku: 'SKU-COLD-01',
            name: 'Chilled Dairy Ingredients Base (+3.8°C)',
            qty: 12,
            isPicked: false,
          },
        ]);
      }
    }
  }, [isWavePickingMode, selectedWaveOrder, facility]);

  // Single Route Target (when single search is active)
  const [activeRouteTarget, setActiveRouteTarget] = useState<{
    rack: WarehouseRack;
    bin?: WarehouseBin;
    distanceMeters: number;
    estimatedSeconds: number;
  } | null>(null);

  // Drag & Drop State for Racks or Zones
  const [draggingEntity, setDraggingEntity] = useState<{
    type: 'RACK' | 'ZONE';
    id: string;
  } | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [entityStartPos, setEntityStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dialog States
  const [editingBinData, setEditingBinData] = useState<{
    rackId: string;
    bin: WarehouseBin;
  } | null>(null);

  const [relocatingBinData, setRelocatingBinData] = useState<{
    fromRackId: string;
    fromBin: WarehouseBin;
  } | null>(null);
  const [targetBinCode, setTargetBinCode] = useState<string>('');
  const [relocateQty, setRelocateQty] = useState<number>(10);

  const [editingRackData, setEditingRackData] = useState<WarehouseRack | null>(null);
  const [editingZoneData, setEditingZoneData] = useState<WarehouseSpecialZone | null>(null);
  const [isAddingZoneOpen, setIsAddingZoneOpen] = useState<boolean>(false);

  // Search Results Matching
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: { rack: WarehouseRack; bin?: WarehouseBin }[] = [];
    facility.racks.forEach((rack) => {
      if (rack.code.toLowerCase().includes(q) || rack.aisle.toLowerCase() === q) {
        results.push({ rack });
      }
      rack.bins.forEach((bin) => {
        if (
          bin.code.toLowerCase().includes(q) ||
          bin.sku?.toLowerCase().includes(q) ||
          bin.productName?.toLowerCase().includes(q)
        ) {
          results.push({ rack, bin });
        }
      });
    });
    return results;
  }, [facility, searchQuery]);

  // URL search params sync
  useEffect(() => {
    if (searchParams.sku || searchParams.bin) {
      const match = searchResults[0];
      if (match) {
        setSelectedRack(match.rack);
        if (match.bin) setSelectedBin(match.bin);
        buildRouteToRack(match.rack, match.bin);
      }
    }
    if (searchParams.orderId) {
      setIsWavePickingMode(true);
    }
  }, [searchParams, searchResults]);

  // Build single route
  const buildRouteToRack = (rack: WarehouseRack, bin?: WarehouseBin) => {
    const packX = 180;
    const packY = 520;
    const targetX = rack.x + rack.width / 2;
    const targetY = rack.y + rack.height / 2;

    const dx = Math.abs(targetX - packX);
    const dy = Math.abs(targetY - packY);
    const distanceMeters = Math.round((dx + dy) * 0.18);
    const estimatedSeconds = Math.round(distanceMeters / 1.2);

    setActiveRouteTarget({
      rack,
      bin,
      distanceMeters,
      estimatedSeconds,
    });

    setSelectedRack(rack);
    if (bin) setSelectedBin(bin);
    setIsWavePickingMode(false);
    toast.success(
      t(`${M}.toast.routeBuilt`, {
        target: bin ? bin.code : rack.code,
        m: distanceMeters,
      })
    );
  };

  const clearRoute = () => {
    setActiveRouteTarget(null);
    setIsWavePickingMode(false);
  };

  // Color mapping based on heatmap mode
  const getRackColor = (rack: WarehouseRack, isSelected: boolean) => {
    if (isSelected) return '#3b82f6';

    if (heatmapMode === 'OCCUPANCY') {
      const ratio = rack.occupied / rack.capacity;
      if (ratio > 0.85) return '#ef4444';
      if (ratio > 0.6) return '#f59e0b';
      return '#10b981';
    }

    if (heatmapMode === 'ABC_VELOCITY') {
      if (rack.abcCategory === 'A') return '#8b5cf6';
      if (rack.abcCategory === 'B') return '#0284c7';
      return '#64748b';
    }

    if (heatmapMode === 'COLD_CHAIN') {
      if (rack.zoneType === 'COLD_CHAIN') return '#06b6d4';
      return '#94a3b8';
    }

    if (heatmapMode === 'HAZARDOUS') {
      if (rack.zoneType === 'HAZARDOUS') return '#f97316';
      return '#94a3b8';
    }

    return '#10b981';
  };

  // -------------------------------------------------------------
  // Drag & Drop for Racks AND Zones
  // -------------------------------------------------------------
  const handleEntityMouseDown = (
    e: React.MouseEvent,
    type: 'RACK' | 'ZONE',
    id: string,
    x: number,
    y: number
  ) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setDraggingEntity({ type, id });
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setEntityStartPos({ x, y });
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (!isEditMode || !draggingEntity) return;

    const dx = (e.clientX - dragStartPos.x) / zoomLevel;
    const dy = (e.clientY - dragStartPos.y) / zoomLevel;

    const newX = Math.max(20, Math.min(850, Math.round((entityStartPos.x + dx) / 10) * 10));
    const newY = Math.max(20, Math.min(540, Math.round((entityStartPos.y + dy) / 10) * 10));

    const updated = facilities.map((fac) => {
      if (fac.id === facility.id) {
        if (draggingEntity.type === 'RACK') {
          return {
            ...fac,
            racks: fac.racks.map((r) => (r.id === draggingEntity.id ? { ...r, x: newX, y: newY } : r)),
          };
        } else {
          return {
            ...fac,
            zones: fac.zones.map((z) => (z.id === draggingEntity.id ? { ...z, x: newX, y: newY } : z)),
          };
        }
      }
      return fac;
    });

    setFacilities(updated);
  };

  const handleSvgMouseUp = () => {
    if (draggingEntity) {
      saveStoredFacilities(facilities);
      setDraggingEntity(null);
      toast.success(
        draggingEntity.type === 'RACK'
          ? t(`${M}.toast.rackPosSaved`)
          : t(`${M}.toast.zonePosSaved`)
      );
    }
  };

  // -------------------------------------------------------------
  // Zone CRUD
  // -------------------------------------------------------------
  const handleSaveZone = (zone: WarehouseSpecialZone) => {
    const updated = facilities.map((fac) => {
      if (fac.id === facility.id) {
        const exists = fac.zones.some((z) => z.id === zone.id);
        const newZones = exists ? fac.zones.map((z) => (z.id === zone.id ? zone : z)) : [...fac.zones, zone];
        return { ...fac, zones: newZones };
      }
      return fac;
    });

    updateFacilities(updated);
    setEditingZoneData(null);
    setIsAddingZoneOpen(false);
    toast.success(t(`${M}.toast.zoneSaved`, { name: zone.name }));
  };

  const handleDeleteZone = (zoneId: string) => {
    const updated = facilities.map((fac) => {
      if (fac.id === facility.id) {
        return {
          ...fac,
          zones: fac.zones.filter((z) => z.id !== zoneId),
        };
      }
      return fac;
    });

    updateFacilities(updated);
    toast.success(t(`${M}.toast.zoneDeleted`));
  };

  // -------------------------------------------------------------
  // Rack CRUD
  // -------------------------------------------------------------
  const handleAddNewRack = () => {
    const newRackId = `rack-${Date.now().toString(36)}`;
    const rackNumber = facility.racks.length + 1;
    const newRack: WarehouseRack = {
      id: newRackId,
      code: `RACK-A-0${rackNumber}`,
      aisle: 'A',
      rackNumber,
      x: 200,
      y: 200,
      width: 110,
      height: 48,
      capacity: 36,
      occupied: 0,
      zoneType: 'PALLET_RACKS',
      abcCategory: 'B',
      temperature: 'Ambient 19°C',
      bins: [
        {
          id: `bin-${Date.now()}-1`,
          code: `A-0${rackNumber}-BIN-101`,
          tier: 1,
          position: 1,
          status: 'FREE',
          abcVelocity: 'B',
          maxCapacity: 100,
        },
      ],
    };

    const updated = facilities.map((fac) => {
      if (fac.id === facility.id) {
        return {
          ...fac,
          racks: [...fac.racks, newRack],
        };
      }
      return fac;
    });

    updateFacilities(updated);
    setSelectedRack(newRack);
    toast.success(t(`${M}.toast.rackAdded`, { code: newRack.code }));
  };

  const handleSaveRackSettings = (updatedRack: WarehouseRack) => {
    const updated = facilities.map((fac) => {
      if (fac.id === facility.id) {
        return {
          ...fac,
          racks: fac.racks.map((r) => (r.id === updatedRack.id ? updatedRack : r)),
        };
      }
      return fac;
    });

    updateFacilities(updated);
    setSelectedRack(updatedRack);
    setEditingRackData(null);
    toast.success(t(`${M}.toast.rackSaved`, { code: updatedRack.code }));
  };

  const handleDeleteRack = (rackId: string) => {
    const updated = facilities.map((fac) => {
      if (fac.id === facility.id) {
        return {
          ...fac,
          racks: fac.racks.filter((r) => r.id !== rackId),
        };
      }
      return fac;
    });

    updateFacilities(updated);
    if (selectedRack?.id === rackId) {
      setSelectedRack(null);
      setSelectedBin(null);
    }
    toast.success(t(`${M}.toast.rackDeleted`));
  };

  const handleResetLayoutToDefault = () => {
    resetStoredFacilities();
    setFacilities(ALL_WAREHOUSES);
    setSelectedRack(null);
    setSelectedBin(null);
    setActiveRouteTarget(null);
    setIsWavePickingMode(false);
    toast.success(t(`${M}.toast.layoutReset`));
  };

  // -------------------------------------------------------------
  // Bin & Inventory Management
  // -------------------------------------------------------------
  const handleSaveBinContent = (rackId: string, updatedBin: WarehouseBin) => {
    const updated = facilities.map((fac) => {
      if (fac.id === facility.id) {
        return {
          ...fac,
          racks: fac.racks.map((r) => {
            if (r.id === rackId) {
              const newBins = r.bins.map((b) => (b.id === updatedBin.id ? updatedBin : b));
              const newOccupied = newBins.filter((b) => b.status === 'OCCUPIED').length * 12;
              return {
                ...r,
                bins: newBins,
                occupied: Math.min(r.capacity, Math.max(0, newOccupied)),
              };
            }
            return r;
          }),
        };
      }
      return fac;
    });

    updateFacilities(updated);
    setSelectedBin(updatedBin);
    if (selectedRack) {
      const refreshedRack = updated.find((f) => f.id === facility.id)?.racks.find((r) => r.id === rackId);
      if (refreshedRack) setSelectedRack(refreshedRack);
    }
    setEditingBinData(null);
    toast.success(t(`${M}.toast.binUpdated`, { code: updatedBin.code }));
  };

  const handleClearBin = (rackId: string, binId: string) => {
    const updated = facilities.map((fac) => {
      if (fac.id === facility.id) {
        return {
          ...fac,
          racks: fac.racks.map((r) => {
            if (r.id === rackId) {
              const newBins = r.bins.map((b) => {
                if (b.id === binId) {
                  return {
                    ...b,
                    status: 'FREE' as const,
                    sku: undefined,
                    productName: undefined,
                    quantity: 0,
                    batchLot: undefined,
                  };
                }
                return b;
              });
              return { ...r, bins: newBins, occupied: Math.max(0, r.occupied - 12) };
            }
            return r;
          }),
        };
      }
      return fac;
    });

    updateFacilities(updated);
    if (selectedBin?.id === binId) {
      setSelectedBin((b) => (b ? { ...b, status: 'FREE', sku: undefined, productName: undefined, quantity: 0 } : null));
    }
    toast.success(t(`${M}.toast.binCleared`));
  };

  const allAvailableBins = useMemo(() => {
    const binsList: { rackId: string; rackCode: string; bin: WarehouseBin }[] = [];
    facility.racks.forEach((r) => {
      r.bins.forEach((b) => {
        binsList.push({ rackId: r.id, rackCode: r.code, bin: b });
      });
    });
    return binsList;
  }, [facility]);

  const handleExecuteRelocation = () => {
    if (!relocatingBinData || !targetBinCode) {
      toast.error(t(`${M}.toast.relocateTargetMissing`));
      return;
    }

    const { fromRackId, fromBin } = relocatingBinData;
    const targetEntry = allAvailableBins.find((entry) => entry.bin.code === targetBinCode);

    if (!targetEntry) {
      toast.error(t(`${M}.toast.relocateNotFound`));
      return;
    }

    const movedQty = Math.min(fromBin.quantity || 0, relocateQty);

    const updated = facilities.map((fac) => {
      if (fac.id === facility.id) {
        return {
          ...fac,
          racks: fac.racks.map((r) => {
            if (r.id === fromRackId) {
              const updatedBins = r.bins.map((b) => {
                if (b.id === fromBin.id) {
                  const remaining = (b.quantity || 0) - movedQty;
                  return {
                    ...b,
                    quantity: remaining,
                    status: remaining > 0 ? ('OCCUPIED' as const) : ('FREE' as const),
                    sku: remaining > 0 ? b.sku : undefined,
                    productName: remaining > 0 ? b.productName : undefined,
                  };
                }
                return b;
              });
              return { ...r, bins: updatedBins };
            }

            if (r.id === targetEntry.rackId) {
              const updatedBins = r.bins.map((b) => {
                if (b.id === targetEntry.bin.id) {
                  return {
                    ...b,
                    sku: fromBin.sku,
                    productName: fromBin.productName,
                    category: fromBin.category,
                    quantity: (b.quantity || 0) + movedQty,
                    batchLot: fromBin.batchLot,
                    expiryDate: fromBin.expiryDate,
                    status: 'OCCUPIED' as const,
                  };
                }
                return b;
              });
              return { ...r, bins: updatedBins, occupied: Math.min(r.capacity, r.occupied + 8) };
            }

            return r;
          }),
        };
      }
      return fac;
    });

    updateFacilities(updated);
    setRelocatingBinData(null);
    toast.success(
      t(`${M}.toast.relocated`, {
        qty: movedQty,
        sku: fromBin.sku,
        from: fromBin.code,
        to: targetBinCode,
      })
    );
  };

  // Generate complete 4-tier elevation slots for the visual rack shelf inspector
  const rackElevationSlots = useMemo(() => {
    if (!selectedRack) return [];

    // Tiers 4, 3, 2, 1 (from top to ground)
    const tiers = [4, 3, 2, 1];
    return tiers.map((tierNum) => {
      const positions = [1, 2, 3];
      const slotBins = positions.map((pos) => {
        const found = selectedRack.bins.find((b) => b.tier === tierNum && b.position === pos);
        if (found) return found;

        // Auto-generate free slot representation for visual elevation
        const placeholderCode = `${selectedRack.code.replace('RACK-', '')}-T${tierNum}-P${pos}`;
        return {
          id: `auto-${selectedRack.id}-${tierNum}-${pos}`,
          code: placeholderCode,
          tier: tierNum,
          position: pos,
          status: 'FREE' as const,
          abcVelocity: selectedRack.abcCategory,
          maxCapacity: 100,
        };
      });

      return {
        tierNumber: tierNum,
        bins: slotBins,
      };
    });
  }, [selectedRack]);

  // Wave picking metrics
  const totalWaveDistance = useMemo(() => {
    if (!isWavePickingMode || waveStops.length === 0) return 0;
    // Calculate multi-stop circuit distance
    let dist = 35; // pack station to corridor
    waveStops.forEach((st) => {
      dist += Math.round(st.rack.x * 0.12) + 25;
    });
    return dist;
  }, [isWavePickingMode, waveStops]);

  const occupancyPercent = Math.round((facility.currentOccupancy / facility.totalCapacity) * 100);
  const pickedCount = waveStops.filter((s) => s.isPicked).length;
  const waveProgressPct = waveStops.length > 0 ? Math.round((pickedCount / waveStops.length) * 100) : 0;
  const dockZones = facility.zones.filter((z) => z.type.includes('DOCK'));
  const isRackDragging = (rackId: string) => draggingEntity?.type === 'RACK' && draggingEntity.id === rackId;

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-primary" aria-hidden="true" />
            {t(`${M}.title`)}
          </span>
        }
        subtitle={t(`${M}.subtitle`)}
        actions={
          <>
            <select
              value={selectedFacilityId}
              onChange={(e) => {
                setSelectedFacilityId(e.target.value);
                setSelectedRack(null);
                setSelectedBin(null);
                setActiveRouteTarget(null);
                setIsWavePickingMode(false);
              }}
              aria-label={t(`${M}.facilityLabel`)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs font-semibold text-foreground shadow-xs max-w-full"
            >
              {facilities.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code}: {w.name} ({w.totalCapacity.toLocaleString()} {t(`${M}.units.palletsShort`)})
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant={isWavePickingMode ? 'default' : 'outline'}
              onClick={() => {
                setIsWavePickingMode(!isWavePickingMode);
                setActiveRouteTarget(null);
                if (!isWavePickingMode) {
                  toast.info(t(`${M}.toast.waveEnabled`));
                }
              }}
              className={`text-xs gap-1.5 font-semibold ${
                isWavePickingMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-300 text-purple-700'
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" aria-hidden="true" />
              {isWavePickingMode ? t(`${M}.actions.singleMode`) : t(`${M}.actions.waveMode`)}
            </Button>

            <Button
              size="sm"
              variant={isEditMode ? 'default' : 'outline'}
              onClick={() => {
                setIsEditMode(!isEditMode);
                if (!isEditMode) {
                  toast.info(t(`${M}.toast.editEnabled`));
                }
              }}
              className={`text-xs gap-1.5 font-semibold ${
                isEditMode ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'border-amber-300 text-amber-700'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              {isEditMode ? t(`${M}.actions.exitEditor`) : t(`${M}.actions.editLayout`)}
            </Button>
          </>
        }
      />

      {/* Editor Banner if Active */}
      {isEditMode && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span className="text-foreground">
              <strong className="text-amber-700 dark:text-amber-400">{t(`${M}.editor.bannerTitle`)}</strong>{' '}
              {t(`${M}.editor.bannerHint`)}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddNewRack}
              className="text-xs h-7 gap-1"
            >
              <Plus className="h-3 w-3" aria-hidden="true" /> {t(`${M}.editor.addRack`)}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingZoneData({
                  id: `zone-${Date.now()}`,
                  name: t(`${M}.editor.newZoneName`),
                  type: 'OUTBOUND_DOCK',
                  x: 360,
                  y: 40,
                  width: 130,
                  height: 70,
                  status: t(`${M}.editor.newZoneStatus`),
                  activeWorkers: 1,
                });
                setIsAddingZoneOpen(true);
              }}
              className="text-xs h-7 gap-1"
            >
              <Plus className="h-3 w-3" aria-hidden="true" /> {t(`${M}.editor.addZone`)}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleResetLayoutToDefault}
              className="text-xs h-7 gap-1 text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" /> {t(`${M}.editor.resetLayout`)}
            </Button>
          </div>
        </div>
      )}

      {/* Facility Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCell
          icon={<Box className="h-4 w-4 text-muted-foreground" />}
          label={t(`${M}.stats.capacity`)}
          value={facility.totalCapacity.toLocaleString()}
          sublabel={t(`${M}.stats.capacityUnit`)}
        />
        <StatCell
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          label={t(`${M}.stats.occupancy`)}
          value={`${occupancyPercent}%`}
          sublabel={t(`${M}.stats.occupancyPallets`, { count: facility.currentOccupancy.toLocaleString() })}
          tone="success"
        />
        <StatCell
          icon={<Zap className="h-4 w-4 text-amber-500" />}
          label={t(`${M}.stats.equipment`)}
          value={facility.equipment.length}
          sublabel={t(`${M}.stats.equipmentOnline`)}
          tone="warning"
        />
        <StatCell
          icon={<Truck className="h-4 w-4 text-sky-600" />}
          label={t(`${M}.stats.docks`)}
          value={dockZones.length}
          sublabel={t(`${M}.stats.docksSplit`, {
            in: facility.zones.filter((z) => z.type === 'INBOUND_DOCK').length,
            out: facility.zones.filter((z) => z.type === 'OUTBOUND_DOCK').length,
          })}
          tone="info"
        />
      </div>

      {/* Control Bar: Search & Heatmap Layers */}
      <div className="bg-card p-3 rounded-lg border border-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md min-w-0">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(`${M}.search.placeholder`)}
            aria-label={t(`${M}.search.label`)}
            className="pl-8 text-xs bg-background font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                clearRoute();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={t(`${M}.search.clear`)}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && searchQuery && (
            <div className="absolute left-0 right-0 top-10 mt-1 bg-popover border border-border rounded-md shadow-lg z-30 max-h-56 overflow-y-auto divide-y divide-border text-xs">
              {searchResults.slice(0, 5).map((res, i) => (
                <div
                  key={i}
                  className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                  onClick={() => {
                    buildRouteToRack(res.rack, res.bin);
                    setSearchQuery('');
                  }}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <span>{res.bin ? res.bin.code : res.rack.code}</span>
                      {res.bin?.sku && (
                        <span className="text-[10px] font-mono font-semibold border border-border rounded px-1 py-0 text-muted-foreground">
                          {res.bin.sku}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {res.bin?.productName ||
                        t(`${M}.search.rackFallback`, { aisle: res.rack.aisle, number: res.rack.rackNumber })}
                    </div>
                  </div>
                  <Navigation className="h-3 w-3 text-emerald-600 shrink-0" aria-hidden="true" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heatmap Layer Selector */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto"
          role="group"
          aria-label={t(`${M}.layers.label`)}
        >
          <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mr-1">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" /> {t(`${M}.layers.label`)}
          </span>
          {HEATMAP_LAYERS.map((layer) => {
            const isActive = heatmapMode === layer.id;
            return (
              <Button
                key={layer.id}
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                onClick={() => setHeatmapMode(layer.id)}
                aria-pressed={isActive}
                className={`text-xs h-7 shrink-0 ${isActive ? layer.activeClass ?? '' : ''}`}
              >
                {t(layer.labelKey)}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Floorplan & Inspector Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Interactive Floorplan Canvas */}
        <div className="lg:col-span-3 border border-border rounded-xl bg-slate-900 text-white shadow-sm overflow-hidden flex flex-col">
          {/* Active Single Route Banner */}
          {activeRouteTarget && !isWavePickingMode && (
            <div className="bg-emerald-600/90 text-white px-4 py-2 text-xs flex items-center justify-between backdrop-blur-xs z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <Navigation className="h-4 w-4 animate-pulse" aria-hidden="true" />
                <span>
                  {t(`${M}.route.bannerRack`, { rack: activeRouteTarget.rack.code })}{' '}
                  {activeRouteTarget.bin &&
                    t(`${M}.route.bannerBin`, { bin: activeRouteTarget.bin.code })}
                </span>
                <span className="bg-white/20 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                  {t(`${M}.route.meta`, {
                    m: activeRouteTarget.distanceMeters,
                    s: activeRouteTarget.estimatedSeconds,
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={clearRoute}
                className="text-white/80 hover:text-white text-xs underline flex items-center gap-1"
              >
                {t(`${M}.route.reset`)} <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* SVG Map Canvas with Drag & Drop Event Handlers */}
          <div className="relative overflow-auto p-2 flex items-center justify-center min-h-[480px]">
            {/* Floating Map HUD Controls */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-xl">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg"
                onClick={() => setZoomLevel((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
                title={t(`${M}.zoom.in`)}
                aria-label={t(`${M}.zoom.in`)}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg"
                onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                title={t(`${M}.zoom.out`)}
                aria-label={t(`${M}.zoom.out`)}
              >
                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg text-[10px] font-mono font-bold"
                onClick={() => setZoomLevel(1)}
                title={t(`${M}.zoom.reset`)}
                aria-label={t(`${M}.zoom.reset`)}
              >
                {Math.round(zoomLevel * 100)}%
              </Button>
            </div>

            <svg
              viewBox="0 0 1000 640"
              onMouseMove={handleSvgMouseMove}
              onMouseUp={handleSvgMouseUp}
              className={`w-full h-auto transition-transform duration-200 select-none ${
                isEditMode ? 'cursor-crosshair' : ''
              }`}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              role="img"
              aria-label={t(`${M}.svg.canvasLabel`)}
            >
              <defs>
                <pattern id="floorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                </pattern>

                <pattern id="walkwayPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect width="20" height="20" fill="#065f46" opacity="0.35" />
                  <path d="M 0 20 L 20 0 M 0 0 L 20 20" stroke="#10b981" strokeWidth="1" opacity="0.4" />
                </pattern>

                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>

                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="1000" height="640" fill="#0f172a" />
              <rect width="1000" height="640" fill="url(#floorGrid)" />

              <rect
                x="20"
                y="15"
                width="960"
                height="610"
                fill="none"
                stroke="#334155"
                strokeWidth="3"
                rx="6"
              />

              {/* Safety pedestrian corridors */}
              <rect x="30" y="440" width="940" height="35" fill="url(#walkwayPattern)" rx="4" />
              <text x="500" y="462" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="600" opacity="0.8">
                {t(`${M}.svg.corridor`)}
              </text>

              <rect x="560" y="120" width="30" height="310" fill="url(#walkwayPattern)" rx="2" opacity="0.7" />

              {/* ---------------- SPECIAL ZONES (DRAGGABLE IN EDIT MODE) ---------------- */}
              {facility.zones.map((zone) => {
                const isPack = zone.type === 'PACK_STATION';
                const isInbound = zone.type === 'INBOUND_DOCK';
                const isOutbound = zone.type === 'OUTBOUND_DOCK';
                const isQuarantine = zone.type === 'QUARANTINE';

                let strokeColor = '#475569';
                let fillColor = '#1e293b';

                if (isPack) {
                  strokeColor = '#10b981';
                  fillColor = '#064e3b';
                } else if (isInbound) {
                  strokeColor = '#0284c7';
                  fillColor = '#0c4a6e';
                } else if (isOutbound) {
                  strokeColor = '#3b82f6';
                  fillColor = '#1e3a8a';
                } else if (isQuarantine) {
                  strokeColor = '#f43f5e';
                  fillColor = '#881337';
                }

                return (
                  <g
                    key={zone.id}
                    onMouseDown={(e) => handleEntityMouseDown(e, 'ZONE', zone.id, zone.x, zone.y)}
                    className={isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                    onClick={() => {
                      if (isEditMode) {
                        setEditingZoneData(zone);
                      } else {
                        toast.info(t(`${M}.toast.zoneInfo`, { name: zone.name, status: zone.status }));
                      }
                    }}
                  >
                    {isEditMode && (
                      <rect
                        x={zone.x - 3}
                        y={zone.y - 3}
                        width={zone.width + 6}
                        height={zone.height + 6}
                        fill="none"
                        stroke="#38bdf8"
                        strokeDasharray="4 2"
                        strokeWidth="1.5"
                        rx="5"
                      />
                    )}

                    <rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.width}
                      height={zone.height}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth="2"
                      rx="4"
                      opacity="0.85"
                    />
                    <text
                      x={zone.x + zone.width / 2}
                      y={zone.y + 22}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="700"
                    >
                      {zone.name}
                    </text>
                    <text
                      x={zone.x + zone.width / 2}
                      y={zone.y + 42}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="8"
                    >
                      {zone.status}
                    </text>
                  </g>
                );
              })}

              {/* ---------------- RACKS & AISLES ---------------- */}
              <text x="35" y="168" fill="#94a3b8" fontSize="14" fontWeight="800">
                {t(`${M}.svg.aisle`, { letter: 'A' })}
              </text>
              <text x="35" y="258" fill="#94a3b8" fontSize="14" fontWeight="800">
                {t(`${M}.svg.aisle`, { letter: 'B' })}
              </text>
              <text x="35" y="348" fill="#94a3b8" fontSize="14" fontWeight="800">
                {t(`${M}.svg.aisle`, { letter: 'C' })}
              </text>

              <text x="965" y="168" textAnchor="end" fill="#38bdf8" fontSize="13" fontWeight="800">
                {t(`${M}.svg.aisleCold`, { letter: 'D' })}
              </text>
              <text x="965" y="278" textAnchor="end" fill="#fb923c" fontSize="13" fontWeight="800">
                {t(`${M}.svg.aisleAdr`, { letter: 'E' })}
              </text>
              <text x="965" y="378" textAnchor="end" fill="#94a3b8" fontSize="13" fontWeight="800">
                {t(`${M}.svg.aisleBuffer`, { letter: 'F' })}
              </text>

              {/* Racks with Drag and Drop Support in Edit Mode */}
              {facility.racks.map((rack) => {
                const isSelected = selectedRack?.id === rack.id;
                const isSingleRouteTarget = activeRouteTarget?.rack.id === rack.id;
                const isWaveStop = waveStops.some((s) => s.rack.id === rack.id);
                const waveStopIndex = waveStops.findIndex((s) => s.rack.id === rack.id);
                const rackColor = getRackColor(rack, isSelected);

                return (
                  <g
                    key={rack.id}
                    onMouseDown={(e) => handleEntityMouseDown(e, 'RACK', rack.id, rack.x, rack.y)}
                    className={`transition-opacity ${
                      isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer hover:opacity-90'
                    }`}
                    onClick={() => {
                      setSelectedRack(rack);
                      setSelectedBin(rack.bins[0] || null);
                    }}
                  >
                    {/* Pulsing ring if single route target */}
                    {isSingleRouteTarget && (
                      <rect
                        x={rack.x - 4}
                        y={rack.y - 4}
                        width={rack.width + 8}
                        height={rack.height + 8}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3"
                        rx="6"
                        className="animate-pulse"
                        filter="url(#glow)"
                      />
                    )}

                    {/* Wave Stop Beacon */}
                    {isWavePickingMode && isWaveStop && (
                      <rect
                        x={rack.x - 4}
                        y={rack.y - 4}
                        width={rack.width + 8}
                        height={rack.height + 8}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3"
                        rx="6"
                        className="animate-pulse"
                        filter="url(#glow)"
                      />
                    )}

                    {/* Drag indicator border if in edit mode */}
                    {isEditMode && (
                      <rect
                        x={rack.x - 3}
                        y={rack.y - 3}
                        width={rack.width + 6}
                        height={rack.height + 6}
                        fill="none"
                        stroke="#f59e0b"
                        strokeDasharray="4 2"
                        strokeWidth="1.5"
                        rx="4"
                      />
                    )}

                    {/* Rack base */}
                    <rect
                      x={rack.x}
                      y={rack.y}
                      width={rack.width}
                      height={rack.height}
                      fill={rackColor}
                      stroke={isSelected ? '#60a5fa' : isRackDragging(rack.id) ? '#f59e0b' : '#0f172a'}
                      strokeWidth={isSelected || isRackDragging(rack.id) ? '3' : '1.5'}
                      rx="3"
                      opacity={isRackDragging(rack.id) ? 0.75 : 0.9}
                    />

                    {/* Rack bay divisions */}
                    <line
                      x1={rack.x + rack.width / 3}
                      y1={rack.y}
                      x2={rack.x + rack.width / 3}
                      y2={rack.y + rack.height}
                      stroke="#0f172a"
                      strokeWidth="1.2"
                      opacity="0.7"
                    />
                    <line
                      x1={rack.x + (rack.width * 2) / 3}
                      y1={rack.y}
                      x2={rack.x + (rack.width * 2) / 3}
                      y2={rack.y + rack.height}
                      stroke="#0f172a"
                      strokeWidth="1.2"
                      opacity="0.7"
                    />

                    {/* Text labels inside rack */}
                    <text
                      x={rack.x + rack.width / 2}
                      y={rack.y + 20}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="800"
                    >
                      {rack.code}
                    </text>
                    <text
                      x={rack.x + rack.width / 2}
                      y={rack.y + 36}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="8"
                      fontWeight="600"
                      opacity="0.9"
                    >
                      {rack.occupied}/{rack.capacity} {t(`${M}.units.palletsShort`)}
                    </text>

                    {/* Wave Stop Pin Badge */}
                    {isWavePickingMode && isWaveStop && (
                      <g>
                        <circle
                          cx={rack.x + 12}
                          cy={rack.y - 8}
                          r="9"
                          fill="#a855f7"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x={rack.x + 12}
                          y={rack.y - 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="900"
                        >
                          {waveStopIndex + 1}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* ---------------- 1. SINGLE PICKING ROUTE ---------------- */}
              {activeRouteTarget && !isWavePickingMode && (
                <g filter="url(#glow)">
                  <path
                    d={`M 180 520 L 180 455 L ${activeRouteTarget.rack.x + activeRouteTarget.rack.width / 2} 455 L ${
                      activeRouteTarget.rack.x + activeRouteTarget.rack.width / 2
                    } ${activeRouteTarget.rack.y + activeRouteTarget.rack.height + 6}`}
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="4"
                    strokeDasharray="8 6"
                    className="animate-pulse"
                  />
                  <circle cx="180" cy="520" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                  <circle
                    cx={activeRouteTarget.rack.x + activeRouteTarget.rack.width / 2}
                    cy={activeRouteTarget.rack.y + activeRouteTarget.rack.height + 6}
                    r="8"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  <text
                    x={activeRouteTarget.rack.x + activeRouteTarget.rack.width / 2}
                    y={activeRouteTarget.rack.y + activeRouteTarget.rack.height + 25}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="9"
                    fontWeight="800"
                  >
                    {t(`${M}.svg.target`)}
                  </text>
                </g>
              )}

              {/* ---------------- 2. MULTI-STOP WAVE PICKING CIRCUIT ---------------- */}
              {isWavePickingMode && waveStops.length > 0 && (
                <g filter="url(#glow)">
                  {/* Draw continuous TSP path through all wave stops */}
                  <path
                    d={`M 180 520 L 180 455 ${waveStops
                      .map(
                        (stop) =>
                          `L ${stop.rack.x + stop.rack.width / 2} 455 L ${
                            stop.rack.x + stop.rack.width / 2
                          } ${stop.rack.y + stop.rack.height + 6} L ${
                            stop.rack.x + stop.rack.width / 2
                          } 455`
                      )
                      .join(' ')} L 180 455 L 180 520`}
                    fill="none"
                    stroke="url(#waveGradient)"
                    strokeWidth="4"
                    strokeDasharray="8 5"
                    className="animate-pulse"
                  />

                  {/* Start / Finish Pack Station Marker */}
                  <circle cx="180" cy="520" r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                  <text x="180" y="542" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="800">
                    {t(`${M}.svg.packStation`)}
                  </text>
                </g>
              )}

              {/* ---------------- LIVE MACHINERY / FORKLIFTS ---------------- */}
              {facility.equipment.map((eq) => (
                <g
                  key={eq.id}
                  className="cursor-pointer"
                  onClick={() => toast.info(t(`${M}.toast.equipmentInfo`, { name: eq.name, task: eq.currentTask }))}
                >
                  <circle
                    cx={eq.x}
                    cy={eq.y}
                    r="12"
                    fill={eq.status === 'ACTIVE_PICKING' ? '#eab308' : '#3b82f6'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  <text
                    x={eq.x}
                    y={eq.y + 4}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="8"
                    fontWeight="800"
                  >
                    {t(EQ_TYPE_LABEL_KEY[eq.type])}
                  </text>
                  <text
                    x={eq.x}
                    y={eq.y + 22}
                    textAnchor="middle"
                    fill="#fef08a"
                    fontSize="8"
                    fontWeight="700"
                  >
                    {eq.name.split(' ')[0]} ({eq.batteryPercent}%)
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Map Legend */}
        <div className="lg:col-span-3 bg-card px-4 py-2 border border-border rounded-lg shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-foreground">{t(`${M}.legend.title`)}</span>
            {heatmapMode === 'OCCUPANCY' && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> {t(`${M}.legend.occFree`)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> {t(`${M}.legend.occOptimal`)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> {t(`${M}.legend.occOver`)}
                </span>
              </>
            )}

            {heatmapMode === 'ABC_VELOCITY' && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> {t(`${M}.legend.abcA`)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> {t(`${M}.legend.abcB`)}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> {t(`${M}.legend.abcC`)}
                </span>
              </>
            )}

            {heatmapMode === 'COLD_CHAIN' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> {t(`${M}.legend.cold`)}
              </span>
            )}

            {heatmapMode === 'HAZARDOUS' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> {t(`${M}.legend.hazardous`)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span>{isEditMode ? t(`${M}.legend.hintEdit`) : t(`${M}.legend.hintExplore`)}</span>
          </div>
        </div>

        {/* Right Sidebar: Rack Shelf Elevation Inspector */}
        <div className="lg:col-span-1 space-y-4">
          {selectedRack ? (
            <Card className="border-border shadow-xs bg-card">
              <CardHeader className="py-3 px-4 border-b border-border">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Box className="h-4 w-4 text-primary" aria-hidden="true" />
                    {t(`${M}.inspector.title`, { code: selectedRack.code })}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => setEditingRackData(selectedRack)}
                      title={t(`${M}.inspector.editRack`)}
                      aria-label={t(`${M}.inspector.editRack`)}
                    >
                      <Edit3 className="h-3 w-3" aria-hidden="true" />
                    </Button>
                    {isEditMode && (
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-700"
                        onClick={() => handleDeleteRack(selectedRack.id)}
                        title={t(`${M}.inspector.deleteRack`)}
                        aria-label={t(`${M}.inspector.deleteRack`)}
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4 text-xs">
                {/* Rack KPI Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t(`${M}.inspector.occupancy`)}</span>
                    <span className="font-mono font-bold text-foreground">
                      {t(`${M}.inspector.occupancyValue`, {
                        occupied: selectedRack.occupied,
                        capacity: selectedRack.capacity,
                        pct: Math.round((selectedRack.occupied / selectedRack.capacity) * 100),
                      })}
                    </span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedRack.occupied / selectedRack.capacity > 0.85
                          ? 'bg-rose-500'
                          : selectedRack.occupied / selectedRack.capacity > 0.6
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(selectedRack.occupied / selectedRack.capacity) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-1 pt-1 text-[10px] text-muted-foreground font-mono">
                    <div>
                      {t(`${M}.inspector.aisleSection`)}:{' '}
                      <strong className="text-foreground">
                        {t(`${M}.inspector.aisleValue`, {
                          aisle: selectedRack.aisle,
                          number: selectedRack.rackNumber,
                        })}
                      </strong>
                    </div>
                    <div>
                      {t(`${M}.inspector.temperature`)}: <strong className="text-foreground">{selectedRack.temperature}</strong>
                    </div>
                  </div>
                </div>

                {/* ---------------- VERTICAL RACK ELEVATION (TIERS 1-4) ---------------- */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />{' '}
                      {t(`${M}.inspector.elevationTitle`)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{t(`${M}.inspector.elevationHint`)}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-muted/30 border border-border space-y-2">
                    {rackElevationSlots.map((tier) => (
                      <div key={tier.tierNumber} className="space-y-1">
                        <div className="text-[10px] font-semibold text-muted-foreground">
                          {t(TIER_LABEL_KEY[tier.tierNumber]!)}
                        </div>
                        {/* 3 Pallet bins per shelf */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {tier.bins.map((bin) => {
                            const isBinSelected = selectedBin?.code === bin.code;
                            const toneClass =
                              bin.status === 'OCCUPIED'
                                ? 'bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/40'
                                : bin.status === 'RESERVED'
                                ? 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40'
                                : bin.status === 'MAINTENANCE'
                                ? 'bg-rose-50/70 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/40'
                                : 'bg-card border-dashed border-border hover:bg-muted/50';
                            return (
                              <button
                                key={bin.code}
                                type="button"
                                onClick={() => {
                                  setSelectedBin(bin);
                                }}
                                className={`p-1.5 rounded border text-center cursor-pointer transition-colors ${
                                  isBinSelected ? 'border-primary bg-primary/10 ring-1 ring-primary' : toneClass
                                }`}
                                title={`${bin.code} • ${bin.sku ? bin.productName : t(`${M}.inspector.binFree`)}`}
                                aria-label={`${bin.code} • ${bin.sku ? bin.productName : t(`${M}.inspector.binFree`)}`}
                              >
                                <div className="font-mono text-[10px] font-bold truncate text-foreground">
                                  {bin.code.split('-').slice(-2).join('-')}
                                </div>
                                <div className="text-[10px] mt-0.5 flex justify-center py-0.5">
                                  <span
                                    className={`inline-block w-2.5 h-2.5 rounded-xs ${
                                      bin.status === 'OCCUPIED'
                                        ? 'bg-emerald-500'
                                        : bin.status === 'RESERVED'
                                        ? 'bg-amber-500'
                                        : bin.status === 'MAINTENANCE'
                                        ? 'bg-rose-500'
                                        : 'bg-muted-foreground/30'
                                    }`}
                                  />
                                </div>
                                <div className="text-[10px] text-muted-foreground truncate">
                                  {bin.sku ? t(`${M}.inspector.binQty`, { count: bin.quantity ?? 0 }) : t(`${M}.inspector.binFreeShort`)}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Bin Action Card */}
                {selectedBin && (
                  <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {t(`${M}.inspector.binTitle`, { code: selectedBin.code, tier: selectedBin.tier })}
                      </span>
                      <StatusBadge tone={BIN_TONE[selectedBin.status]} label={t(BIN_LABEL_KEY[selectedBin.status])} size="sm" />
                    </div>

                    {selectedBin.sku ? (
                      <div className="space-y-1 text-xs">
                        <div className="font-medium text-foreground">{selectedBin.productName}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {t(`${M}.inspector.binSku`, { sku: selectedBin.sku, count: selectedBin.quantity ?? 0 })}
                        </div>
                        {selectedBin.batchLot && (
                          <div className="text-[10px] text-muted-foreground">
                            {t(`${M}.inspector.binBatch`, { lot: selectedBin.batchLot })}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 pt-1.5 border-t border-border">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] px-2 gap-1 flex-1"
                            onClick={() => {
                              setRelocatingBinData({ fromRackId: selectedRack.id, fromBin: selectedBin });
                              setRelocateQty(selectedBin.quantity || 10);
                            }}
                          >
                            <ArrowLeftRight className="h-3 w-3" aria-hidden="true" /> {t(`${M}.inspector.relocate`)}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] px-2 gap-1 flex-1"
                            onClick={() => setEditingBinData({ rackId: selectedRack.id, bin: selectedBin })}
                          >
                            <Edit3 className="h-3 w-3" aria-hidden="true" /> {t('common.edit')}
                          </Button>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            className="h-6 w-6 text-rose-500 hover:text-rose-700"
                            onClick={() => handleClearBin(selectedRack.id, selectedBin.id)}
                            title={t(`${M}.inspector.clearBin`)}
                            aria-label={t(`${M}.inspector.clearBin`)}
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">{t(`${M}.inspector.binFreeHint`)}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2 gap-1"
                          onClick={() => setEditingBinData({ rackId: selectedRack.id, bin: selectedBin })}
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" /> {t(`${M}.inspector.placeProduct`)}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Build Route Button */}
                <Button
                  className="w-full text-xs gap-1.5 font-semibold"
                  onClick={() => buildRouteToRack(selectedRack, selectedBin || undefined)}
                >
                  <Navigation className="h-3.5 w-3.5" aria-hidden="true" /> {t(`${M}.inspector.buildRoute`)}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6 text-center border-dashed border-border bg-card">
              <Box className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" aria-hidden="true" />
              <h3 className="font-bold text-xs text-foreground">{t(`${M}.inspector.emptyTitle`)}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t(`${M}.inspector.emptyHint`)}</p>
            </Card>
          )}
        </div>
      </div>

      {/* WAVE PICKING PANEL (full-width pick list table) */}
      {isWavePickingMode && (
        <Card className="border-border shadow-xs overflow-hidden bg-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 py-3 px-4 border-b border-border">
            <div className="flex items-center gap-3 min-w-0">
              <ListOrdered className="h-4 w-4 text-purple-600 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{t(`${M}.wave.panelTitle`)}</span>
                  <select
                    value={selectedWaveOrder}
                    onChange={(e) => setSelectedWaveOrder(e.target.value)}
                    aria-label={t(`${M}.wave.orderLabel`)}
                    className="h-7 px-2 border border-input rounded bg-background text-xs font-bold text-foreground"
                  >
                    {WAVE_ORDERS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {t(o.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{t(`${M}.wave.routeHint`)}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 rounded px-2 py-0.5 text-[10px] font-mono font-semibold">
                {t(`${M}.wave.totalMeta`, {
                  m: totalWaveDistance,
                  s: Math.round(totalWaveDistance / 1.1),
                })}
              </span>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 font-semibold"
                size="sm"
                onClick={() => {
                  const allDone = waveStops.every((s) => s.isPicked);
                  if (allDone) {
                    toast.success(t(`${M}.toast.orderCompleted`, { order: selectedWaveOrder }));
                    setIsWavePickingMode(false);
                  } else {
                    setWaveStops(waveStops.map((s) => ({ ...s, isPicked: true })));
                    toast.success(t(`${M}.toast.allPicked`));
                  }
                }}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t(`${M}.wave.finish`)}
              </Button>
            </div>
          </div>

          {/* Wave Progress Bar */}
          <div className="px-4 py-2.5 bg-muted/40 border-b border-border space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">
                {t(`${M}.wave.progress`, { picked: pickedCount, total: waveStops.length })}
              </span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{waveProgressPct}%</span>
            </div>
            <div
              className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border"
              role="progressbar"
              aria-valuenow={waveProgressPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t(`${M}.wave.progress`, { picked: pickedCount, total: waveStops.length })}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${waveProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
              <span>{t(`${M}.wave.corridorLength`, { m: totalWaveDistance })}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t(`${M}.wave.savingHint`)}</span>
            </div>
          </div>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[760px]">
              <caption className="sr-only">{t(`${M}.wave.panelTitle`)}</caption>
              <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-3 w-10">{t(`${M}.wave.tablePick`)}</th>
                  <th className="py-3 px-3">{t(`${M}.wave.tableStop`)}</th>
                  <th className="py-3 px-4">{t(`${M}.wave.tableBin`)}</th>
                  <th className="py-3 px-4">{t(`${M}.wave.tableProduct`)}</th>
                  <th className="py-3 px-4">{t(`${M}.wave.tableRack`)}</th>
                  <th className="py-3 px-4 text-right">{t(`${M}.wave.tableQty`)}</th>
                  <th className="py-3 px-4">{t(`${M}.wave.tableStatus`)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border whitespace-nowrap">
                {waveStops.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      <ListOrdered className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                      <p className="font-semibold text-foreground">{t(`${M}.wave.emptyTitle`)}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t(`${M}.wave.emptyHint`)}</p>
                    </td>
                  </tr>
                ) : (
                  waveStops.map((stop, idx) => (
                    <tr
                      key={stop.stopNumber}
                      className={`cursor-pointer transition-colors ${
                        stop.isPicked ? 'bg-emerald-500/5' : 'hover:bg-muted/40'
                      }`}
                      onClick={() => {
                        setSelectedRack(stop.rack);
                        if (stop.bin) setSelectedBin(stop.bin);
                      }}
                    >
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = [...waveStops];
                            updated[idx] = { ...stop, isPicked: !stop.isPicked };
                            setWaveStops(updated);
                            if (!stop.isPicked) {
                              toast.success(t(`${M}.toast.stopPicked`, { sku: stop.sku }));
                            }
                          }}
                          aria-label={t(`${M}.wave.pickAria`, { stop: stop.stopNumber })}
                          className="align-middle cursor-pointer"
                        >
                          {stop.isPicked ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-foreground">#{stop.stopNumber}</td>
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        {stop.bin ? stop.bin.code : stop.rack.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground whitespace-normal">{stop.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{stop.sku}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{stop.rack.code}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                        {t(`${M}.inspector.binQty`, { count: stop.qty })}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          tone={stop.isPicked ? 'success' : 'warning'}
                          label={stop.isPicked ? t(`${M}.wave.statusPicked`) : t(`${M}.wave.statusPending`)}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* WAREHOUSE EQUIPMENT TABLE */}
      <Card className="border-border shadow-xs overflow-hidden bg-card">
        <div className="flex items-center justify-between gap-2 py-3 px-4 border-b border-border">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Truck className="h-4 w-4 text-sky-600" aria-hidden="true" />
            {t(`${M}.equipment.title`, { count: facility.equipment.length })}
          </CardTitle>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[760px]">
            <caption className="sr-only">{t(`${M}.equipment.title`, { count: facility.equipment.length })}</caption>
            <thead className="bg-muted/40 border-b border-border text-muted-foreground whitespace-nowrap uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">{t(`${M}.equipment.unit`)}</th>
                <th className="py-3 px-4">{t(`${M}.equipment.operator`)}</th>
                <th className="py-3 px-4">{t(`${M}.equipment.task`)}</th>
                <th className="py-3 px-4 min-w-[180px]">{t(`${M}.equipment.battery`)}</th>
                <th className="py-3 px-4">{t(`${M}.equipment.status`)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {facility.equipment.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    <Truck className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                    <p className="font-semibold text-foreground">{t(`${M}.equipment.emptyTitle`)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t(`${M}.equipment.emptyHint`)}</p>
                  </td>
                </tr>
              ) : (
                facility.equipment.map((eq) => {
                  const batteryTone =
                    eq.batteryPercent > 50 ? 'bg-emerald-500' : eq.batteryPercent > 25 ? 'bg-amber-500' : 'bg-rose-500';
                  return (
                    <tr key={eq.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap">
                        {eq.name.split('(')[0]}
                      </td>
                      <td className="py-3 px-4 text-xs text-foreground font-medium whitespace-nowrap">{eq.operator}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-normal">{eq.currentTask}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <BatteryCharging className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                          <div
                            className="flex-1 min-w-[80px] h-1.5 bg-muted rounded-full overflow-hidden border border-border"
                            role="progressbar"
                            aria-valuenow={eq.batteryPercent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={t(`${M}.equipment.batteryAria`, { pct: eq.batteryPercent })}
                          >
                            <div className={`h-full ${batteryTone}`} style={{ width: `${eq.batteryPercent}%` }} />
                          </div>
                          <span className="font-mono font-semibold tabular-nums text-xs">{eq.batteryPercent}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge tone={EQ_TONE[eq.status]} label={t(EQ_LABEL_KEY[eq.status])} size="sm" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Edit Bin Inventory Content */}
      {/* ------------------------------------------------------------- */}
      {editingBinData && (
        <Dialog open={!!editingBinData} onOpenChange={(open) => !open && setEditingBinData(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" aria-hidden="true" />
                {t(`${M}.binDialog.title`, { code: editingBinData.bin.code })}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t(`${M}.binDialog.desc`, {
                  tier: editingBinData.bin.tier,
                  position: editingBinData.bin.position,
                })}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const updatedBin: WarehouseBin = {
                  ...editingBinData.bin,
                  sku: (formEl.elements.namedItem('sku') as HTMLInputElement).value,
                  productName: (formEl.elements.namedItem('productName') as HTMLInputElement).value,
                  category: (formEl.elements.namedItem('category') as HTMLInputElement).value,
                  quantity: Number((formEl.elements.namedItem('quantity') as HTMLInputElement).value),
                  batchLot: (formEl.elements.namedItem('batchLot') as HTMLInputElement).value,
                  expiryDate: (formEl.elements.namedItem('expiryDate') as HTMLInputElement).value,
                  status:
                    Number((formEl.elements.namedItem('quantity') as HTMLInputElement).value) > 0
                      ? 'OCCUPIED'
                      : 'FREE',
                };
                handleSaveBinContent(editingBinData.rackId, updatedBin);
              }}
              className="space-y-3 text-xs"
            >
              <div className="space-y-1">
                <Label className="text-xs">{t(`${M}.field.sku`)}</Label>
                <Input
                  name="sku"
                  defaultValue={editingBinData.bin.sku || 'SKU-PAL-01'}
                  placeholder={t(`${M}.field.skuPlaceholder`)}
                  className="font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{t(`${M}.field.product`)}</Label>
                <Input
                  name="productName"
                  defaultValue={editingBinData.bin.productName || 'EPAL Euro-Pallet Standard'}
                  placeholder={t(`${M}.field.productPlaceholder`)}
                  className="text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t(`${M}.field.category`)}</Label>
                  <Input
                    name="category"
                    defaultValue={editingBinData.bin.category || t(`${M}.binDialog.defaultCategory`)}
                    placeholder={t(`${M}.field.category`)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">{t(`${M}.field.qty`)}</Label>
                  <Input
                    type="number"
                    name="quantity"
                    defaultValue={editingBinData.bin.quantity || 100}
                    min={0}
                    className="font-mono text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t(`${M}.field.batch`)}</Label>
                  <Input
                    name="batchLot"
                    defaultValue={editingBinData.bin.batchLot || 'LOT-2026-901'}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">{t(`${M}.field.expiry`)}</Label>
                  <Input
                    name="expiryDate"
                    defaultValue={editingBinData.bin.expiryDate || '2030-12-31'}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingBinData(null)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" size="sm" className="font-semibold">
                  <Save className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> {t(`${M}.binDialog.save`)}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: Relocate Stock to Another Bin */}
      {/* ------------------------------------------------------------- */}
      {relocatingBinData && (
        <Dialog open={!!relocatingBinData} onOpenChange={(open) => !open && setRelocatingBinData(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-sky-600" aria-hidden="true" />
                {t(`${M}.relocateDialog.title`)}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t(`${M}.relocateDialog.desc`, {
                  bin: relocatingBinData.fromBin.code,
                  product: relocatingBinData.fromBin.productName,
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs py-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t(`${M}.relocateDialog.targetLabel`)}</Label>
                <select
                  value={targetBinCode}
                  onChange={(e) => setTargetBinCode(e.target.value)}
                  className="w-full h-9 px-2 border border-input rounded-md text-xs bg-background font-mono font-bold text-foreground"
                >
                  <option value="">{t(`${M}.relocateDialog.targetPlaceholder`)}</option>
                  {allAvailableBins
                    .filter((e) => e.bin.code !== relocatingBinData.fromBin.code)
                    .map((entry) => (
                      <option key={entry.bin.id} value={entry.bin.code}>
                        {entry.bin.status === 'FREE'
                          ? t(`${M}.relocateDialog.optionFree`, { code: entry.bin.code, rack: entry.rackCode })
                          : t(`${M}.relocateDialog.optionOccupied`, {
                              code: entry.bin.code,
                              rack: entry.rackCode,
                              sku: entry.bin.sku || '',
                            })}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">{t(`${M}.relocateDialog.qtyLabel`)}</Label>
                <Input
                  type="number"
                  min={1}
                  max={relocatingBinData.fromBin.quantity || 1}
                  value={relocateQty}
                  onChange={(e) => setRelocateQty(Number(e.target.value))}
                  className="font-mono text-base font-bold"
                />
                <span className="text-[10px] text-muted-foreground">
                  {t(`${M}.relocateDialog.availableHint`, { count: relocatingBinData.fromBin.quantity ?? 0 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setRelocatingBinData(null)}>
                {t('common.cancel')}
              </Button>
              <Button size="sm" className="font-semibold" onClick={handleExecuteRelocation}>
                {t(`${M}.relocateDialog.confirm`)}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: Edit Rack Settings */}
      {/* ------------------------------------------------------------- */}
      {editingRackData && (
        <Dialog open={!!editingRackData} onOpenChange={(open) => !open && setEditingRackData(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-600" aria-hidden="true" />
                {t(`${M}.rackDialog.title`, { code: editingRackData.code })}
              </DialogTitle>
              <DialogDescription className="text-xs">{t(`${M}.rackDialog.desc`)}</DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const updatedRack: WarehouseRack = {
                  ...editingRackData,
                  code: (formEl.elements.namedItem('code') as HTMLInputElement).value,
                  aisle: (formEl.elements.namedItem('aisle') as HTMLInputElement).value,
                  capacity: Number((formEl.elements.namedItem('capacity') as HTMLInputElement).value),
                  zoneType: (formEl.elements.namedItem('zoneType') as HTMLSelectElement).value as any,
                  abcCategory: (formEl.elements.namedItem('abcCategory') as HTMLSelectElement).value as any,
                  temperature: (formEl.elements.namedItem('temperature') as HTMLInputElement).value,
                };
                handleSaveRackSettings(updatedRack);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t(`${M}.rackDialog.code`)}</Label>
                  <Input
                    name="code"
                    defaultValue={editingRackData.code}
                    className="font-mono text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">{t(`${M}.rackDialog.aisle`)}</Label>
                  <Input
                    name="aisle"
                    defaultValue={editingRackData.aisle}
                    className="font-mono text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t(`${M}.rackDialog.capacity`)}</Label>
                  <Input
                    type="number"
                    name="capacity"
                    defaultValue={editingRackData.capacity}
                    className="font-mono text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">{t(`${M}.rackDialog.abc`)}</Label>
                  <select
                    name="abcCategory"
                    defaultValue={editingRackData.abcCategory}
                    className="w-full h-9 px-2 border border-input rounded text-xs bg-background font-semibold text-foreground"
                  >
                    <option value="A">{t(`${M}.abcOption.a`)}</option>
                    <option value="B">{t(`${M}.abcOption.b`)}</option>
                    <option value="C">{t(`${M}.abcOption.c`)}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{t(`${M}.rackDialog.zoneType`)}</Label>
                <select
                  name="zoneType"
                  defaultValue={editingRackData.zoneType}
                  className="w-full h-9 px-2 border border-input rounded text-xs bg-background font-semibold text-foreground"
                >
                  {(Object.keys(RACK_ZONE_TYPE_LABEL_KEY) as WarehouseRack['zoneType'][]).map((zt) => (
                    <option key={zt} value={zt}>
                      {t(RACK_ZONE_TYPE_LABEL_KEY[zt])}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{t(`${M}.rackDialog.temperature`)}</Label>
                <Input name="temperature" defaultValue={editingRackData.temperature} className="text-xs" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingRackData(null)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" size="sm" className="font-semibold">
                  <Save className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> {t(`${M}.rackDialog.save`)}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: Edit or Add Zone */}
      {/* ------------------------------------------------------------- */}
      {(editingZoneData || isAddingZoneOpen) && (
        <Dialog
          open={!!editingZoneData || isAddingZoneOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditingZoneData(null);
              setIsAddingZoneOpen(false);
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-sky-600" aria-hidden="true" />
                {editingZoneData
                  ? t(`${M}.zoneDialog.editTitle`, { name: editingZoneData.name })
                  : t(`${M}.zoneDialog.addTitle`)}
              </DialogTitle>
              <DialogDescription className="text-xs">{t(`${M}.zoneDialog.desc`)}</DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const zone: WarehouseSpecialZone = {
                  id: editingZoneData?.id || `zone-${Date.now()}`,
                  name: (formEl.elements.namedItem('name') as HTMLInputElement).value,
                  type: (formEl.elements.namedItem('type') as HTMLSelectElement).value as any,
                  status: (formEl.elements.namedItem('status') as HTMLInputElement).value,
                  x: editingZoneData?.x ?? 300,
                  y: editingZoneData?.y ?? 40,
                  width: Number((formEl.elements.namedItem('width') as HTMLInputElement).value),
                  height: Number((formEl.elements.namedItem('height') as HTMLInputElement).value),
                  activeWorkers: Number((formEl.elements.namedItem('activeWorkers') as HTMLInputElement).value),
                };
                handleSaveZone(zone);
              }}
              className="space-y-3 text-xs"
            >
              <div className="space-y-1">
                <Label className="text-xs">{t(`${M}.zoneDialog.name`)}</Label>
                <Input
                  name="name"
                  defaultValue={editingZoneData?.name || t(`${M}.zoneDialog.defaultName`)}
                  className="font-bold text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{t(`${M}.zoneDialog.type`)}</Label>
                <select
                  name="type"
                  defaultValue={editingZoneData?.type || 'INBOUND_DOCK'}
                  className="w-full h-9 px-2 border border-input rounded text-xs bg-background font-semibold text-foreground"
                >
                  {(Object.keys(SPECIAL_ZONE_TYPE_LABEL_KEY) as WarehouseSpecialZone['type'][]).map((zt) => (
                    <option key={zt} value={zt}>
                      {t(SPECIAL_ZONE_TYPE_LABEL_KEY[zt])}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t(`${M}.zoneDialog.width`)}</Label>
                  <Input
                    type="number"
                    name="width"
                    defaultValue={editingZoneData?.width || 130}
                    className="font-mono text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">{t(`${M}.zoneDialog.height`)}</Label>
                  <Input
                    type="number"
                    name="height"
                    defaultValue={editingZoneData?.height || 70}
                    className="font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{t(`${M}.zoneDialog.status`)}</Label>
                <Input
                  name="status"
                  defaultValue={editingZoneData?.status || t(`${M}.zoneDialog.defaultStatus`)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">{t(`${M}.zoneDialog.workers`)}</Label>
                <Input
                  type="number"
                  name="activeWorkers"
                  defaultValue={editingZoneData?.activeWorkers || 1}
                  min={0}
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex flex-wrap justify-between items-center pt-3 border-t border-border gap-2">
                {editingZoneData && isEditMode ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 text-xs"
                    onClick={() => handleDeleteZone(editingZoneData.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> {t(`${M}.zoneDialog.delete`)}
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingZoneData(null);
                      setIsAddingZoneOpen(false);
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" size="sm" className="font-semibold">
                    <Save className="h-3.5 w-3.5 mr-1" aria-hidden="true" /> {t(`${M}.zoneDialog.save`)}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function StatCell({
  icon,
  label,
  value,
  sublabel,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: 'success' | 'info' | 'warning';
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-500/20 bg-emerald-500/5'
      : tone === 'info'
      ? 'border-sky-500/20 bg-sky-500/5'
      : tone === 'warning'
      ? 'border-amber-500/20 bg-amber-500/5'
      : 'border-border bg-card';
  const toneText =
    tone === 'success'
      ? 'text-emerald-700 dark:text-emerald-400'
      : tone === 'info'
      ? 'text-sky-700 dark:text-sky-400'
      : tone === 'warning'
      ? 'text-amber-700 dark:text-amber-400'
      : 'text-muted-foreground';
  return (
    <div className={`p-4 rounded-md border shadow-xs ${toneClass}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${toneText}`}>{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground mt-2 font-mono tabular-nums">{value}</div>
      {sublabel && <span className={`text-[10px] ${toneText} font-medium`}>{sublabel}</span>}
    </div>
  );
}

export default VirtualWarehouseMapPage;
