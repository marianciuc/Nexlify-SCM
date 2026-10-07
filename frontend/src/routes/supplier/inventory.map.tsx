import { createFileRoute } from '@tanstack/react-router';
import { Warehouse, Search, Layers, Thermometer, ShieldAlert, TrendingUp, Truck, Box, CheckCircle2, Navigation, RefreshCw, Plus, Minus, X, Zap, Edit3, Move, Trash2, Save, ArrowLeftRight, RotateCcw, ListOrdered, Square, Building, BatteryCharging } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
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
import '@/hooks/useScmQueries';
import '@/types/scm-domain';
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
} from '@/types/warehouse-map-data';

export const Route = createFileRoute('/supplier/inventory/map')({
  component: VirtualWarehouseMapPage,
  staticData: {
    crumb: {
      label: 'Warehouse Map (2D)',
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

function VirtualWarehouseMapPage() {
  const searchParams = Route.useSearch();
  const svgRef = useRef<SVGSVGElement | null>(null);

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
  // WAVE PICKING (Сборка заказа с обходом нескольких ячеек)
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
      `Маршрут отбора построен к ячейке ${bin ? bin.code : rack.code} (${distanceMeters} м)`
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
  // Drag & Drop for Racks AND Zones ("Где что находится")
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
        draggingEntity.type === 'RACK' ? 'Позиция стеллажа сохранена!' : 'Позиция зоны склада сохранена!'
      );
    }
  };

  // -------------------------------------------------------------
  // Zone CRUD ("Управление зонами склада")
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
    toast.success(`Зона склада «${zone.name}» сохранена!`);
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
    toast.success('Зона склада удалена.');
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
    toast.success(`Новый стеллаж ${newRack.code} добавлен на карту!`);
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
    toast.success(`Параметры стеллажа ${updatedRack.code} сохранены!`);
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
    toast.success('Стеллаж удален из планировки.');
  };

  const handleResetLayoutToDefault = () => {
    resetStoredFacilities();
    setFacilities(ALL_WAREHOUSES);
    setSelectedRack(null);
    setSelectedBin(null);
    setActiveRouteTarget(null);
    setIsWavePickingMode(false);
    toast.success('Планировка склада сброшена к исходной!');
  };

  // -------------------------------------------------------------
  // Bin & Inventory Management ("Что где лежит")
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
    toast.success(`Товар в ячейке ${updatedBin.code} обновлен!`);
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
    toast.success('Ячейка очищена.');
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
      toast.error('Выберите ячейку назначения.');
      return;
    }

    const { fromRackId, fromBin } = relocatingBinData;
    const targetEntry = allAvailableBins.find((entry) => entry.bin.code === targetBinCode);

    if (!targetEntry) {
      toast.error('Ячейка назначения не найдена.');
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
      `Перемещено ${movedQty} шт. (${fromBin.sku}) из ${fromBin.code} ➔ ${targetBinCode}!`
    );
  };

  // Generate complete 4-tier elevation slots (Ярусы 1, 2, 3, 4) for visual rack shelf inspector
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
        label:
          tierNum === 4
            ? 'Ярус 4 (High-bay / Верхний высотный)'
            : tierNum === 3
            ? 'Ярус 3 (Буферный резерв)'
            : tierNum === 2
            ? 'Ярус 2 (Средний ярус)'
            : 'Ярус 1 (Комплектация / Ручной отбор)',
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

  return (
    <div className="space-y-4 p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header & Warehouse Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Warehouse className="h-6 w-6 text-emerald-600" />
              Интерактивная карта распределительного центра (WMS Digital Twin)
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            2D-планировка стеллажных рядов, навигация комплектовщика, локатор ячеек и телеметрия техники в реальном времени.
          </p>
        </div>

        {/* Warehouse Selector & Edit Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedFacilityId}
            onChange={(e) => {
              setSelectedFacilityId(e.target.value);
              setSelectedRack(null);
              setSelectedBin(null);
              setActiveRouteTarget(null);
              setIsWavePickingMode(false);
            }}
            className="p-2 border rounded-md text-xs font-bold bg-white dark:bg-slate-900 shadow-xs text-slate-800 dark:text-slate-200"
          >
            {facilities.map((w) => (
              <option key={w.id} value={w.id}>
                {w.code}: {w.name} ({w.totalCapacity.toLocaleString()} пал.)
              </option>
            ))}
          </select>

          {/* Wave Picking Toggle */}
          <Button
            size="sm"
            variant={isWavePickingMode ? 'default' : 'outline'}
            onClick={() => {
              setIsWavePickingMode(!isWavePickingMode);
              setActiveRouteTarget(null);
              if (!isWavePickingMode) {
                toast.info('Включен режим волнового сбора заказа (Wave Picking)!');
              }
            }}
            className={`text-xs gap-1.5 font-semibold ${
              isWavePickingMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'border-purple-300 text-purple-700'
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            {isWavePickingMode ? 'Одиночный поиск' : 'Маршрут заказа (Wave Picking)'}
          </Button>

          {/* Toggle Interactive Layout Editor */}
          <Button
            size="sm"
            variant={isEditMode ? 'default' : 'outline'}
            onClick={() => {
              setIsEditMode(!isEditMode);
              if (!isEditMode) {
                toast.info('Режим конструктора: перетаскивайте стеллажи и зоны склада мышью.');
              }
            }}
            className={`text-xs gap-1.5 font-semibold ${
              isEditMode ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse' : 'border-amber-300 text-amber-700'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            {isEditMode ? 'Выйти из конструктора' : 'Редактировать планировку'}
          </Button>
        </div>
      </div>

      {/* Editor Banner if Active */}
      {isEditMode && (
        <div className="p-3 bg-amber-500/15 border border-amber-300 dark:border-amber-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-amber-600 animate-bounce shrink-0" />
            <span>
              <strong>Конструктор планировки склада:</strong> Перетаскивайте стеллажи и зоны приемки/отгрузки мышью.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddNewRack}
              className="text-2xs h-7 gap-1 bg-white dark:bg-slate-900 border-amber-300"
            >
              <Plus className="h-3 w-3" /> + Стеллаж
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingZoneData({
                  id: `zone-${Date.now()}`,
                  name: 'Outbound Dock 6 (Новая рампа)',
                  type: 'OUTBOUND_DOCK',
                  x: 360,
                  y: 40,
                  width: 130,
                  height: 70,
                  status: 'Готова к эксплуатации',
                  activeWorkers: 1,
                });
                setIsAddingZoneOpen(true);
              }}
              className="text-2xs h-7 gap-1 bg-white dark:bg-slate-900 border-amber-300 text-blue-600"
            >
              <Plus className="h-3 w-3" /> + Зона склада
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleResetLayoutToDefault}
              className="text-2xs h-7 gap-1 text-rose-600 border-rose-300 hover:bg-rose-50"
            >
              <RotateCcw className="h-3 w-3" /> Сбросить к исходной
            </Button>
          </div>
        </div>
      )}

      {/* Wave Picking Banner if Active */}
      {isWavePickingMode && (
        <div className="p-3 bg-purple-500/15 border border-purple-300 dark:border-purple-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <ListOrdered className="h-5 w-5 text-purple-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  Маршрут волнового сбора заказа:
                </span>
                <select
                  value={selectedWaveOrder}
                  onChange={(e) => setSelectedWaveOrder(e.target.value)}
                  className="p-1 border rounded text-xs font-bold bg-white dark:bg-slate-900"
                >
                  <option value="ORD-2026-0891">ORD-2026-0891 (Baltic Retail - 3 позиции)</option>
                  <option value="ORD-2026-0892">ORD-2026-0892 (Pomerania Foods - 2 позиции)</option>
                </select>
              </div>
              <div className="text-2xs text-muted-foreground mt-0.5">
                Оптимальный замкнутый контур обхода ячеек без встречных потоков (TSP Wave Picking).
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-2xs font-mono">
              Общий путь: {totalWaveDistance} м • ~{Math.round(totalWaveDistance / 1.1)} сек • Экономия: 38%
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-2xs"
              onClick={() => setIsWavePickingMode(false)}
            >
              Закрыть <X className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-3">
            <span className="text-2xs text-muted-foreground block">Общая вместимость:</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100">
                {facility.totalCapacity.toLocaleString()} <span className="text-2xs font-normal">палет</span>
              </span>
              <Box className="h-4 w-4 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-3">
            <span className="text-2xs text-muted-foreground block">Заполненность склада:</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-base text-emerald-600">
                {occupancyPercent}% <span className="text-2xs font-normal">({facility.currentOccupancy.toLocaleString()} пал.)</span>
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-3">
            <span className="text-2xs text-muted-foreground block">Техника & Комплектовщики:</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100">
                {facility.equipment.length} ед. <span className="text-2xs text-emerald-600 font-normal">• Онлайн</span>
              </span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-3">
            <span className="text-2xs text-muted-foreground block">Статус грузовых рамп (Docks):</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100">
                {facility.zones.filter((z) => z.type.includes('DOCK')).length} рамп
              </span>
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Search & Heatmap Layers */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по артикулу (SKU-PAL-01), названию или ячейке (A-04-108)..."
            className="pl-8 text-xs bg-white dark:bg-slate-950 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                clearRoute();
              }}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && searchQuery && (
            <div className="absolute left-0 right-0 top-10 mt-1 bg-white dark:bg-slate-950 border rounded-md shadow-lg z-30 max-h-56 overflow-y-auto divide-y text-xs">
              {searchResults.slice(0, 5).map((res, i) => (
                <div
                  key={i}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer flex items-center justify-between"
                  onClick={() => {
                    buildRouteToRack(res.rack, res.bin);
                    setSearchQuery('');
                  }}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{res.bin ? res.bin.code : res.rack.code}</span>
                      {res.bin?.sku && (
                        <Badge variant="outline" className="text-3xs font-mono">
                          {res.bin.sku}
                        </Badge>
                      )}
                    </div>
                    <div className="text-3xs text-muted-foreground">
                      {res.bin?.productName || `Ряд ${res.rack.aisle} • Стеллаж ${res.rack.rackNumber}`}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 text-2xs gap-1 text-emerald-600">
                    <Navigation className="h-3 w-3" /> Маршрут
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heatmap Layer Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-2xs text-muted-foreground font-semibold flex items-center gap-1 mr-1">
            <Layers className="h-3.5 w-3.5" /> Слой карты:
          </span>
          <Button
            size="sm"
            variant={heatmapMode === 'OCCUPANCY' ? 'default' : 'outline'}
            onClick={() => setHeatmapMode('OCCUPANCY')}
            className="text-2xs h-7 gap-1"
          >
            Заполненность (% палет)
          </Button>
          <Button
            size="sm"
            variant={heatmapMode === 'ABC_VELOCITY' ? 'default' : 'outline'}
            onClick={() => setHeatmapMode('ABC_VELOCITY')}
            className={`text-2xs h-7 gap-1 ${
              heatmapMode === 'ABC_VELOCITY' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''
            }`}
          >
            ABC-Скорость отбора
          </Button>
          <Button
            size="sm"
            variant={heatmapMode === 'COLD_CHAIN' ? 'default' : 'outline'}
            onClick={() => setHeatmapMode('COLD_CHAIN')}
            className={`text-2xs h-7 gap-1 ${
              heatmapMode === 'COLD_CHAIN' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : ''
            }`}
          >
            <Thermometer className="h-3 w-3" /> Холод (+2..+6°C)
          </Button>
          <Button
            size="sm"
            variant={heatmapMode === 'HAZARDOUS' ? 'default' : 'outline'}
            onClick={() => setHeatmapMode('HAZARDOUS')}
            className={`text-2xs h-7 gap-1 ${
              heatmapMode === 'HAZARDOUS' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
            }`}
          >
            <ShieldAlert className="h-3 w-3" /> Опасные ADR
          </Button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            title="Увеличить масштаб"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            title="Уменьшить масштаб"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={() => setZoomLevel(1)}
            title="Сбросить масштаб 100%"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Floorplan & Inspector Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Interactive Floorplan Canvas */}
        <div className="lg:col-span-3 border rounded-xl bg-slate-900 text-white shadow-md relative overflow-hidden flex flex-col">
          {/* Active Single Route Banner */}
          {activeRouteTarget && !isWavePickingMode && (
            <div className="bg-emerald-600/90 text-white px-4 py-2 text-xs flex items-center justify-between backdrop-blur-xs z-10">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 animate-pulse" />
                <span>
                  Построен маршрут к стеллажу <strong>{activeRouteTarget.rack.code}</strong>{' '}
                  {activeRouteTarget.bin && `(ячейка ${activeRouteTarget.bin.code})`}
                </span>
                <Badge variant="secondary" className="bg-white/20 text-white text-3xs font-mono">
                  Дистанция: {activeRouteTarget.distanceMeters} м • ~{activeRouteTarget.estimatedSeconds} сек
                </Badge>
              </div>
              <button
                onClick={clearRoute}
                className="text-white/80 hover:text-white text-2xs underline flex items-center gap-1"
              >
                Сбросить маршрут <X className="h-3 w-3" />
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
                title="Приблизить (+)"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg"
                onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                title="Отдалить (-)"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg text-3xs font-mono font-bold"
                onClick={() => setZoomLevel(1)}
                title="Сбросить масштаб (100%)"
              >
                {Math.round(zoomLevel * 100)}%
              </Button>
            </div>

            <svg
              ref={svgRef}
              viewBox="0 0 1000 640"
              onMouseMove={handleSvgMouseMove}
              onMouseUp={handleSvgMouseUp}
              className={`w-full h-auto transition-transform duration-200 select-none ${
                isEditMode ? 'cursor-crosshair' : ''
              }`}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
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

                <filter id="rackShadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.5" />
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
                ГЛАВНЫЙ ПЕШЕХОДНЫЙ КОРИДОР БЕЗОПАСНОСТИ WMS (LANE A ➔ D)
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
                        toast.info(`${zone.name}: ${zone.status}`);
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
                РЯД A
              </text>
              <text x="35" y="258" fill="#94a3b8" fontSize="14" fontWeight="800">
                РЯД B
              </text>
              <text x="35" y="348" fill="#94a3b8" fontSize="14" fontWeight="800">
                РЯД C
              </text>

              <text x="965" y="168" textAnchor="end" fill="#38bdf8" fontSize="13" fontWeight="800">
                РЯД D (ХОЛОД)
              </text>
              <text x="965" y="278" textAnchor="end" fill="#fb923c" fontSize="13" fontWeight="800">
                РЯД E (ADR)
              </text>
              <text x="965" y="378" textAnchor="end" fill="#94a3b8" fontSize="13" fontWeight="800">
                РЯД F (БУФЕР)
              </text>

              {/* Racks with Drag and Drop Support in Edit Mode */}
              {facility.racks.map((rack) => {
                const isSelected = selectedRack?.id === rack.id;
                const isSingleRouteTarget = activeRouteTarget?.rack.id === rack.id;
                const isWaveStop = waveStops.some((s) => s.rack.id === rack.id);
                const waveStopIndex = waveStops.findIndex((s) => s.rack.id === rack.id);
                const isDragging = draggingEntity?.id === rack.id;
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
                      stroke={isSelected ? '#60a5fa' : isDragging ? '#f59e0b' : '#0f172a'}
                      strokeWidth={isSelected || isDragging ? '3' : '1.5'}
                      rx="3"
                      opacity={isDragging ? 0.75 : 0.9}
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
                      {rack.occupied}/{rack.capacity} пал.
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
                    cx={activeRouteTarget.rack.x + activeRouteTarget.rack.width / 2}
                    cy={activeRouteTarget.rack.y + activeRouteTarget.rack.height + 25}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="9"
                    fontWeight="800"
                  >
                    CEL (TARGET)
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
                    STACJA PAKOWANIA (START / FINISH)
                  </text>
                </g>
              )}

              {/* ---------------- LIVE MACHINERY / FORKLIFTS ---------------- */}
              {facility.equipment.map((eq) => (
                <g
                  key={eq.id}
                  className="cursor-pointer"
                  onClick={() => toast.info(`${eq.name}: ${eq.currentTask}`)}
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
                    WÓZEK
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

          {/* Map Footer Legend */}
          <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-2xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-300">Легенда карты:</span>
              {heatmapMode === 'OCCUPANCY' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> &lt;60% (Свободно)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> 60–85% (Оптимально)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> &gt;85% (Перегруз)
                  </span>
                </>
              )}

              {heatmapMode === 'ABC_VELOCITY' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Категория A (Быстрый отбор)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Категория B (Средний)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> Категория C (Буфер)
                  </span>
                </>
              )}

              {heatmapMode === 'COLD_CHAIN' && (
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Холодильный контур (+2..+6°C)
                </span>
              )}

              {heatmapMode === 'HAZARDOUS' && (
                <span className="flex items-center gap-1.5 text-orange-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Зона опасных грузов (ADR)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                {isEditMode ? 'Зажмите и перетаскивайте стеллажи/зоны мышью' : 'Кликните на стеллаж для просмотра ярусов'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Wave Picking Checklist OR Rack Shelf Elevation Inspector */}
        <div className="lg:col-span-1 space-y-4">
          {/* WAVE PICKING CHECKLIST PANEL */}
          {isWavePickingMode ? (
            <Card className="border-purple-300 dark:border-purple-800 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-purple-50/50 dark:bg-purple-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-purple-600" />
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Лист отбора Wave Picking
                    </CardTitle>
                  </div>
                  <Badge className="bg-purple-600 text-white text-3xs">{selectedWaveOrder}</Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                {/* Wave Progress Bar */}
                {(() => {
                  const pickedCount = waveStops.filter((s) => s.isPicked).length;
                  const pct = waveStops.length > 0 ? Math.round((pickedCount / waveStops.length) * 100) : 0;
                  return (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-1.5 border">
                      <div className="flex items-center justify-between text-2xs font-semibold">
                        <span>Прогресс сбора: {pickedCount} из {waveStops.length} ячеек</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-emerald-500 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-3xs text-muted-foreground pt-0.5">
                        <span>Длина коридора: ~{totalWaveDistance} м</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Экономия: ~38% времени</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Checklist stops */}
                <div className="space-y-2">
                  {waveStops.map((stop, idx) => (
                    <div
                      key={stop.stopNumber}
                      onClick={() => {
                        setSelectedRack(stop.rack);
                        if (stop.bin) setSelectedBin(stop.bin);
                      }}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        stop.isPicked
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300'
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = [...waveStops];
                              updated[idx] = { ...stop, isPicked: !stop.isPicked };
                              setWaveStops(updated);
                              if (!stop.isPicked) {
                                toast.success(`Позиция ${stop.sku} отобрана в тележку!`);
                              }
                            }}
                          >
                            {stop.isPicked ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                            Точка #{stop.stopNumber}: {stop.bin ? stop.bin.code : stop.rack.code}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-3xs font-mono">
                          {stop.qty} шт
                        </Badge>
                      </div>

                      <div className="mt-1.5 pl-6 text-2xs space-y-0.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {stop.name}
                        </div>
                        <div className="text-3xs text-muted-foreground font-mono">
                          Артикул: {stop.sku} • Стеллаж: {stop.rack.code}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t flex flex-col gap-2">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 font-semibold"
                    onClick={() => {
                      const allDone = waveStops.every((s) => s.isPicked);
                      if (allDone) {
                        toast.success(`Все позиции заказа ${selectedWaveOrder} успешно скомплектованы на Pack Station!`);
                        setIsWavePickingMode(false);
                      } else {
                        setWaveStops(waveStops.map((s) => ({ ...s, isPicked: true })));
                        toast.success('Все позиции автоматически отмечены как отобранные!');
                      }
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Завершить комплектацию на стол упаковки
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedRack ? (
            /* RACK SHELF ELEVATION INSPECTOR (ЯРУСЫ 1, 2, 3, 4) */
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-emerald-600" />
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Стеллаж {selectedRack.code}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-slate-500 hover:text-slate-900"
                      onClick={() => setEditingRackData(selectedRack)}
                      title="Редактировать параметры стеллажа"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    {isEditMode && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDeleteRack(selectedRack.id)}
                        title="Удалить этот стеллаж"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4 text-xs">
                {/* Rack KPI Stats */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2 border">
                  <div className="flex items-center justify-between text-2xs">
                    <span className="text-muted-foreground">Заполненность стеллажа:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {selectedRack.occupied} / {selectedRack.capacity} пал. (
                      {Math.round((selectedRack.occupied / selectedRack.capacity) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
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

                  <div className="grid grid-cols-2 gap-2 pt-1 text-3xs text-muted-foreground font-mono">
                    <div>Ряд / Секция: <strong>Ряд {selectedRack.aisle} • #{selectedRack.rackNumber}</strong></div>
                    <div>Температура: <strong>{selectedRack.temperature}</strong></div>
                  </div>
                </div>

                {/* ---------------- VERTICAL RACK ELEVATION (ЯРУСЫ 1-4) ---------------- */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-2xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-blue-600" /> Вертикальный срез полок (Ярусы):
                    </span>
                    <span className="text-3xs text-muted-foreground">4 яруса x 3 позиции</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border space-y-2">
                    {rackElevationSlots.map((tier) => (
                      <div key={tier.tierNumber} className="space-y-1">
                        <div className="text-3xs font-semibold text-slate-500 dark:text-slate-400">
                          {tier.label}
                        </div>
                        {/* 3 Pallet bins per shelf */}
                        <div className="grid grid-cols-3 gap-1.5">
                          {tier.bins.map((bin) => {
                            const isBinSelected = selectedBin?.code === bin.code;
                            const isOccupied = bin.status === 'OCCUPIED';
                            return (
                              <div
                                key={bin.code}
                                onClick={() => {
                                  setSelectedBin(bin);
                                }}
                                className={`p-1.5 rounded border text-center cursor-pointer transition-all ${
                                  isBinSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-xs ring-1 ring-blue-500'
                                    : isOccupied
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300'
                                    : 'bg-white dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-800 hover:bg-slate-50'
                                }`}
                                title={`${bin.code} • ${isOccupied ? bin.productName : 'Свободно'}`}
                              >
                                <div className="font-mono text-3xs font-bold truncate">
                                  {bin.code.split('-').slice(-2).join('-')}
                                </div>
                                <div className="text-2xs mt-0.5 flex justify-center py-0.5">
                                  <span className={`inline-block w-2.5 h-2.5 rounded-xs ${isOccupied ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                                </div>
                                <div className="text-3xs text-muted-foreground truncate">
                                  {isOccupied ? `${bin.quantity} шт` : 'Своб.'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Bin Action Card */}
                {selectedBin && (
                  <div className="p-3 rounded-lg border bg-blue-50/30 dark:bg-blue-950/20 border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-900 dark:text-blue-200">
                        Ячейка {selectedBin.code} (Ярус {selectedBin.tier})
                      </span>
                      <Badge
                        className={
                          selectedBin.status === 'OCCUPIED'
                            ? 'bg-emerald-600 text-white text-3xs'
                            : 'bg-slate-200 text-slate-700 text-3xs'
                        }
                      >
                        {selectedBin.status === 'OCCUPIED' ? 'Занята' : 'Свободна'}
                      </Badge>
                    </div>

                    {selectedBin.sku ? (
                      <div className="space-y-1 text-2xs">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {selectedBin.productName}
                        </div>
                        <div className="font-mono text-3xs text-muted-foreground">
                          Артикул: {selectedBin.sku} • Кол-во: <strong>{selectedBin.quantity} шт.</strong>
                        </div>
                        {selectedBin.batchLot && (
                          <div className="text-3xs text-slate-500">
                            Партия: <span className="font-mono">{selectedBin.batchLot}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 pt-1.5 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-3xs px-2 gap-1 text-blue-600 border-blue-200 flex-1"
                            onClick={() => {
                              setRelocatingBinData({ fromRackId: selectedRack.id, fromBin: selectedBin });
                              setRelocateQty(selectedBin.quantity || 10);
                            }}
                          >
                            <ArrowLeftRight className="h-3 w-3" /> Переместить
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-3xs px-2 gap-1 flex-1"
                            onClick={() => setEditingBinData({ rackId: selectedRack.id, bin: selectedBin })}
                          >
                            <Edit3 className="h-3 w-3" /> Изменить
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-rose-500 hover:text-rose-700"
                            onClick={() => handleClearBin(selectedRack.id, selectedBin.id)}
                            title="Очистить ячейку"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-2xs">
                        <span className="text-muted-foreground">Ячейка свободна для размещения</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-3xs px-2 gap-1 bg-white dark:bg-slate-900"
                          onClick={() => setEditingBinData({ rackId: selectedRack.id, bin: selectedBin })}
                        >
                          <Plus className="h-3 w-3" /> Разместить товар
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Build Route Button */}
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-semibold"
                  onClick={() => buildRouteToRack(selectedRack, selectedBin || undefined)}
                >
                  <Navigation className="h-3.5 w-3.5" /> Маршрут к этой ячейке
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6 text-center border-dashed border-slate-300 dark:border-slate-800">
              <Box className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Стеллаж не выбран
              </h3>
              <p className="text-2xs text-muted-foreground mt-1">
                Кликните на любой стеллаж на карте склада, чтобы открыть вертикальный срез ярусов и палет.
              </p>
            </Card>
          )}

          {/* Quick Info Card: Fleet & Pickers */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="py-2.5 px-4 border-b bg-slate-50 dark:bg-slate-900">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-blue-600" /> Складская техника онлайн ({facility.equipment.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-2xs">
              {facility.equipment.map((eq) => (
                <div
                  key={eq.id}
                  className="p-2 rounded border bg-white dark:bg-slate-950 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-900 dark:text-slate-100">{eq.name.split('(')[0]}</span>
                    <span className="font-mono text-emerald-600 flex items-center gap-1">
                      <BatteryCharging className="h-3 w-3" />
                      {eq.batteryPercent}%
                    </span>
                  </div>
                  <div className="text-3xs text-muted-foreground">
                    Оператор: <strong>{eq.operator}</strong>
                  </div>
                  <div className="text-3xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-1 rounded">
                    {eq.currentTask}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: Edit Bin Inventory Content ("Что лежит в ячейке") */}
      {/* ------------------------------------------------------------- */}
      {editingBinData && (
        <Dialog open={!!editingBinData} onOpenChange={(open) => !open && setEditingBinData(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Box className="h-5 w-5 text-emerald-600" />
                Назначение товара в ячейку {editingBinData.bin.code}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Укажите или измените номенклатуру (Ярус {editingBinData.bin.tier}, Позиция {editingBinData.bin.position}).
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
                <Label className="text-xs">Артикул SKU:</Label>
                <Input
                  name="sku"
                  defaultValue={editingBinData.bin.sku || 'SKU-PAL-01'}
                  placeholder="np. SKU-PAL-01"
                  className="font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Наименование товара:</Label>
                <Input
                  name="productName"
                  defaultValue={editingBinData.bin.productName || 'EPAL Euro-Pallet Standard'}
                  placeholder="np. EPAL Euro-Pallet Standard"
                  className="text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Категория:</Label>
                  <Input
                    name="category"
                    defaultValue={editingBinData.bin.category || 'Деревянная тара'}
                    placeholder="Категория"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Количество (шт):</Label>
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
                  <Label className="text-xs">Номер партии (Batch/LOT):</Label>
                  <Input
                    name="batchLot"
                    defaultValue={editingBinData.bin.batchLot || 'LOT-2026-901'}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Срок годности / поверки:</Label>
                  <Input
                    name="expiryDate"
                    defaultValue={editingBinData.bin.expiryDate || '2030-12-31'}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingBinData(null)}>
                  Отмена
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  <Save className="h-3.5 w-3.5 mr-1" /> Сохранить в ячейку
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
                <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                Перемещение товара в другую ячейку склада
              </DialogTitle>
              <DialogDescription className="text-xs">
                Исходная ячейка: <strong>{relocatingBinData.fromBin.code}</strong> • Товар:{' '}
                <strong>{relocatingBinData.fromBin.productName}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs py-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Выберите целевую ячейку назначения:</Label>
                <select
                  value={targetBinCode}
                  onChange={(e) => setTargetBinCode(e.target.value)}
                  className="w-full p-2 border rounded-md text-xs bg-white dark:bg-slate-900 font-mono font-bold"
                >
                  <option value="">-- Выберите свободную или совместимую ячейку --</option>
                  {allAvailableBins
                    .filter((e) => e.bin.code !== relocatingBinData.fromBin.code)
                    .map((entry) => (
                      <option key={entry.bin.id} value={entry.bin.code}>
                        {entry.bin.code} [{entry.rackCode}] — {entry.bin.status === 'FREE' ? 'Свободна' : `Занята (${entry.bin.sku || ''})`}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Количество перемещаемых единиц (шт):</Label>
                <Input
                  type="number"
                  min={1}
                  max={relocatingBinData.fromBin.quantity || 1}
                  value={relocateQty}
                  onChange={(e) => setRelocateQty(Number(e.target.value))}
                  className="font-mono text-base font-bold text-blue-600"
                />
                <span className="text-3xs text-muted-foreground">
                  Доступно в исходной ячейке: {relocatingBinData.fromBin.quantity} шт.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setRelocatingBinData(null)}>
                Отмена
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={handleExecuteRelocation}
              >
                Подтвердить перемещение
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: Edit Rack Settings ("Параметры стеллажа") */}
      {/* ------------------------------------------------------------- */}
      {editingRackData && (
        <Dialog open={!!editingRackData} onOpenChange={(open) => !open && setEditingRackData(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-600" />
                Параметры стеллажа {editingRackData.code}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Настройка идентификатора, вместимости палет и температурного режима стеллажа.
              </DialogDescription>
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
                  <Label className="text-xs">Код стеллажа:</Label>
                  <Input
                    name="code"
                    defaultValue={editingRackData.code}
                    className="font-mono text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Ряд (Aisle):</Label>
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
                  <Label className="text-xs">Вместимость (палет):</Label>
                  <Input
                    type="number"
                    name="capacity"
                    defaultValue={editingRackData.capacity}
                    className="font-mono text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Группа ABC:</Label>
                  <select
                    name="abcCategory"
                    defaultValue={editingRackData.abcCategory}
                    className="w-full p-2 border rounded text-xs bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="A">Категория A (Быстрая)</option>
                    <option value="B">Категория B (Средняя)</option>
                    <option value="C">Категория C (Буфер)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Тип складской зоны:</Label>
                <select
                  name="zoneType"
                  defaultValue={editingRackData.zoneType}
                  className="w-full p-2 border rounded text-xs bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="PALLET_RACKS">Высотные палетные стеллажи (Pallet Racks)</option>
                  <option value="MEZZANINE">Зона мезонина и штучного отбора (Mezzanine)</option>
                  <option value="COLD_CHAIN">Холодильный контур (+2..+6°C Cold Chain)</option>
                  <option value="HAZARDOUS">Зона опасных грузов (Hazardous ADR)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Температурный режим:</Label>
                <Input
                  name="temperature"
                  defaultValue={editingRackData.temperature}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingRackData(null)}>
                  Отмена
                </Button>
                <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                  <Save className="h-3.5 w-3.5 mr-1" /> Сохранить стеллаж
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: Edit or Add Zone ("Редактирование зон склада") */}
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
                <Warehouse className="h-5 w-5 text-blue-600" />
                {editingZoneData ? `Настройка зоны: ${editingZoneData.name}` : 'Добавление новой зоны склада'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Задайте параметры, размеры и статус функциональной зоны склада.
              </DialogDescription>
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
                <Label className="text-xs">Название зоны:</Label>
                <Input
                  name="name"
                  defaultValue={editingZoneData?.name || 'Рампа 7: Скоропортящиеся грузы'}
                  className="font-bold text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Тип функциональной зоны:</Label>
                <select
                  name="type"
                  defaultValue={editingZoneData?.type || 'INBOUND_DOCK'}
                  className="w-full p-2 border rounded text-xs bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="INBOUND_DOCK">Рампа приемки (Inbound Dock)</option>
                  <option value="OUTBOUND_DOCK">Рампа отгрузки (Outbound Dock)</option>
                  <option value="PACK_STATION">Стол комплектации и упаковки (Pack Station)</option>
                  <option value="QUARANTINE">Зона карантина и рекламаций (Quarantine RMA)</option>
                  <option value="CHARGING">Зарядная станция техники (Charging)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Ширина (px):</Label>
                  <Input
                    type="number"
                    name="width"
                    defaultValue={editingZoneData?.width || 130}
                    className="font-mono text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Высота (px):</Label>
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
                <Label className="text-xs">Статус / Операционная задача:</Label>
                <Input
                  name="status"
                  defaultValue={editingZoneData?.status || 'Свободно для разгрузки'}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Число сотрудников на посту:</Label>
                <Input
                  type="number"
                  name="activeWorkers"
                  defaultValue={editingZoneData?.activeWorkers || 1}
                  min={0}
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                {editingZoneData && isEditMode ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 text-2xs"
                    onClick={() => handleDeleteZone(editingZoneData.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Удалить зону
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
                    Отмена
                  </Button>
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    <Save className="h-3.5 w-3.5 mr-1" /> Сохранить зону
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

export default VirtualWarehouseMapPage;
