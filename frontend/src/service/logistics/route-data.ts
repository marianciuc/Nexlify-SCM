export interface LogisticsTrip {
  id: string;
  routeCode: string;
  origin: string;
  destination: string;
  vehicle: string;
  driver: string;
  distanceKm: number;
  durationHours: number;
  stopsCount: number;
  co2EmissionsKg: number;
  status: 'ACTIVE_IN_TRANSIT' | 'PLANNED' | 'COMPLETED';
}

export const INITIAL_ROUTES: LogisticsTrip[] = [
  { id: 'rot-01', routeCode: 'ROT-WAW-GDA-01', origin: 'Central DC Warszawa (WH-WAW-01)', destination: 'Gdańsk Sea Port Terminal', vehicle: 'WI 49102 (Scania R450)', driver: 'Tomasz Lewandowski', distanceKm: 342.5, durationHours: 4.2, stopsCount: 3, co2EmissionsKg: 38.4, status: 'ACTIVE_IN_TRANSIT' },
  { id: 'rot-02', routeCode: 'ROT-SZC-KTW-02', origin: 'Port Logistics Hub Szczecin (WH-SZC-02)', destination: 'Silesia Logistics Hub Katowice', vehicle: 'ZS 8831A (Volvo FH 500)', driver: 'Paweł Kamiński', distanceKm: 528, durationHours: 6.5, stopsCount: 2, co2EmissionsKg: 59.2, status: 'PLANNED' },
  { id: 'rot-03', routeCode: 'ROT-WAW-POZ-03', origin: 'Central DC Warszawa (WH-WAW-01)', destination: 'Poznań Logistics Center', vehicle: 'WI 30219 (MAN TGX 18.440)', driver: 'Marek Szymański', distanceKm: 310.2, durationHours: 3.8, stopsCount: 1, co2EmissionsKg: 34.8, status: 'COMPLETED' },
];
